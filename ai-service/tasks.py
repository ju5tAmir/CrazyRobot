# tasks.py – report generation every hour for all surveys with responses
import os
import time
from datetime import datetime
from pathlib import Path

from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
from sqlmodel import Session, create_engine
from sqlalchemy.pool import NullPool

from langchain_community.llms import Ollama
from langchain_community.utilities import SQLDatabase

from models import GeneratedReport, engine as main_engine

# ── config ──────────────────────────────────────────────────────
load_dotenv()
DB_URL     = os.getenv("DATABASE_URL")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")
MODEL_NAME = os.getenv("MODEL", "llama3:latest")

# ── init ────────────────────────────────────────────────────────
# create an engine without a pool or with a "ping" check when taking from the pool
engine_for_tasks = create_engine(
    DB_URL,
    pool_pre_ping=True,
    connect_args={"sslmode": "require"},
    echo=False,
)

# initialize SQLDatabase based on this engine
sql_db = SQLDatabase(engine=engine_for_tasks)

# клиент LLM
llm = Ollama(
    base_url=OLLAMA_URL,
    model=MODEL_NAME,
    temperature=0.3,
)

# ── helpers ────────────────────────────────────────────────────
EXAMPLES = Path("rag_data.txt").read_text("utf-8") if Path("rag_data.txt").exists() else ""

def surveys_with_responses(limit: int = 50) -> list[str]:
    """List of survey_id with at least one response, most recent first."""
    rows = sql_db._execute(f"""
        SELECT r.survey_id
        FROM   crazyrobot.survey_response r
        GROUP  BY r.survey_id
        ORDER  BY MAX(r.submitted_at) DESC
        LIMIT  {limit};
    """)
    return [row["survey_id"] for row in rows]

def generate_report_for_survey(survey_id: str) -> None:
    """Generate and save a report for a single survey."""
    print("▶ START", survey_id, datetime.utcnow().isoformat(), "UTC", flush=True)

    summary_sql = f"""
        SELECT a.question_id,
               COALESCE(a.selected_option_id, 'text') AS option,
               COUNT(*) AS cnt
        FROM   crazyrobot.answer          AS a
        JOIN   crazyrobot.survey_response AS r ON r.id = a.survey_response_id
        WHERE  r.survey_id = '{survey_id}'
        GROUP  BY a.question_id, option
        ORDER  BY a.question_id
        LIMIT  200;
    """
    summary_data = sql_db.run(summary_sql)

    if not summary_data.strip():
        print("ℹ No data for", survey_id, flush=True)
        return

    prompt = (
        "You are an analyst. Below is aggregated survey data (SQL output):\n\n"
        f"{summary_data}\n\n"
        "Here are examples of previous reports:\n"
        f"{EXAMPLES}\n\n"
        "Please write a concise report with key insights and recommendations."
    )

    report_text = llm.invoke(prompt)

    # save in the main application database
    with Session(main_engine) as sess:
        sess.add(GeneratedReport(
            survey_id    = survey_id,
            generated_at = datetime.utcnow(),
            report_text  = report_text,
        ))
        sess.commit()

    print("✓ SAVED report for", survey_id, flush=True)

    # we add to the few-shot-file
    try:
        with open("rag_data.txt", "a", encoding="utf-8") as f:
            f.write(f"\n\nReport for survey {survey_id} ({datetime.utcnow().date()}):\n")
            f.write(report_text.strip() + "\n")
        print("📄 Appended report to rag_data.txt", flush=True)
    except Exception as e:
        print(f"⚠️ Failed to append to rag_data.txt: {e}", flush=True)

def generate_reports_for_all_surveys() -> None:
    """Run through all recent surveys and generate missing reports."""
    for sid in surveys_with_responses():
        # skip if the report was for the last 15 minutes
        recent = sql_db.run(f"""
            SELECT 1
            FROM   crazyrobot.generated_report
            WHERE  survey_id = '{sid}'
              AND  generated_at > now() - interval '60 minutes'
            LIMIT 1;
        """)
        if recent.strip():
            print("↷ Skip (fresh report exists)", sid, flush=True)
            continue

        generate_report_for_survey(sid)

# ── scheduler ───────────────────────────────────────────────────
sched = BackgroundScheduler(timezone="UTC")
sched.add_job(
    func          = generate_reports_for_all_surveys,
    id            = "60min_reports_all",
    trigger       = "interval",
    hours         = 1,
    next_run_time = datetime.utcnow(),  # first launch immediately
)
print("JOB ADDED: every 60 minutes for all surveys", flush=True)

if __name__ == "__main__":
    sched.start()
    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        sched.shutdown()
