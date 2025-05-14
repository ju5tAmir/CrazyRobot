# tasks.py – report generation every 12 hours for all surveys with responses
import os, time
from datetime import datetime
from pathlib import Path

from apscheduler.schedulers.background import BackgroundScheduler
from dotenv import load_dotenv
from sqlmodel import create_engine, Session
from langchain_community.llms import Ollama
from langchain_community.utilities import SQLDatabase

from main import GeneratedReport   # crazyrobot.generated_report table

# ── config ─────────────────────────────────────────────────────
load_dotenv()
DB_URL     = os.getenv("DATABASE_URL")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://ollama:11434")
MODEL_NAME = os.getenv("MODEL", "llama3:latest")

# ── init ───────────────────────────────────────────────────────
engine   = create_engine(DB_URL)
sql_db   = SQLDatabase.from_uri(DB_URL)              
llm      = Ollama(base_url=OLLAMA_URL,
                  model=MODEL_NAME,
                  temperature=0.3)

# ── helpers ───────────────────────────────────────────────────
EXAMPLES = Path("rag_data.txt").read_text("utf-8") if Path("rag_data.txt").exists() else ""

def surveys_with_responses(limit: int = 50) -> list[str]:
    """List of survey_id (there are answers), most recent first."""
    rows = sql_db._execute(f"""
        SELECT r.survey_id
        FROM   crazyrobot.survey_response r
        GROUP  BY r.survey_id
        ORDER  BY MAX(r.submitted_at) DESC
        LIMIT  {limit};
    """)
    return [row["survey_id"] for row in rows]   # ← key by name

def generate_report_for_survey(survey_id: str) -> None:
    # Log the start of report generation
    print("▶ START", survey_id, datetime.utcnow().isoformat(timespec="seconds"), "UTC", flush=True)

    # SQL query to aggregate answers by question and option
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

    # Skip if there is no data
    if not summary_data.strip():
        print("ℹ  No data for", survey_id, flush=True)
        return

    # Prompt to send to LLM for generating the report
    prompt = (
        "You are an analyst. Below is aggregated survey data (SQL output):\n\n"
        f"{summary_data}\n\n"
        "Here are examples of previous reports:\n"
        f"{EXAMPLES}\n\n"
        "Please write a concise report with key insights and recommendations."
    )

    # Call the LLM to generate the report
    report_text = llm.invoke(prompt)

    # Save the generated report to the database
    with Session(engine) as sess:
        new_report = GeneratedReport(
            survey_id    = survey_id,
            generated_at = datetime.utcnow(),
            report_text  = report_text
        )
        sess.add(new_report)
        sess.commit()

    print("✓ SAVED report for", survey_id, flush=True)

    # Append the generated report to rag_data.txt (used as few-shot examples for next generations)
    try:
        with open("rag_data.txt", "a", encoding="utf-8") as f:
            f.write(f"\n\nReport for survey {survey_id} ({datetime.utcnow().date()}):\n")
            f.write(report_text.strip() + "\n")
        print("📄 Appended report to rag_data.txt", flush=True)
    except Exception as e:
        print(f"⚠️ Failed to append to rag_data.txt: {e}", flush=True)


def generate_reports_for_all_surveys() -> None:
    for sid in surveys_with_responses():
        # skip if there is already a report for the last 12 hours
        recent = sql_db.run(f"""
            SELECT 1
            FROM   crazyrobot.generated_report
            WHERE  survey_id = '{sid}'
              AND  generated_at > now() - interval '15 minutes'
            LIMIT 1;
        """)
        if recent.strip():
            print("↷  Skip (fresh report exists)", sid, flush=True)
            continue

        generate_report_for_survey(sid)

# ── scheduler ──────────────────────────────────────────────────
sched = BackgroundScheduler()
sched.add_job(
    func          = generate_reports_for_all_surveys,
    id            = "15min_reports_all",
    trigger       = "interval",
    minutes       = 15,
    next_run_time = datetime.utcnow(),        # immediately the first launch
)
print("JOB ADDED 15min interval for *all* surveys", flush=True)

# running in a container
if __name__ == "__main__":
    sched.start()
    try:
        while True:
            time.sleep(60)
    except KeyboardInterrupt:
        sched.shutdown()
