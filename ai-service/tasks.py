import os, time
from datetime import datetime
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
from sqlmodel import create_engine, Session
from main import GeneratedReport      # table model generated_report
from langchain_community.llms import Ollama
from langchain_community.utilities import SQLDatabase
from langchain_experimental.sql import SQLDatabaseChain
from pathlib import Path

# ---------- config ----------
load_dotenv()
DB_URL     = os.getenv("DATABASE_URL")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL", "llama3:latest")

# ---------- initialization ----------
engine   = create_engine(DB_URL)
llm      = Ollama(base_url=OLLAMA_URL, model=MODEL_NAME, temperature=0.3)
sql_db   = SQLDatabase.from_uri(DB_URL)
sql_chain = SQLDatabaseChain.from_llm(llm=llm, db=sql_db, verbose=False)

def load_examples() -> str:
    try:
        return Path("rag_data.txt").read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""

def generate_report_for_survey(survey_id: str) -> None:
    summary_data = sql_chain.run(
        f"SELECT * FROM crazyrobot.survey_response WHERE survey_id = '{survey_id}' LIMIT 100"
    )
    if not summary_data:
        print("No responses for the survey:", survey_id)
        return

    examples = load_examples()

    # --- we build a prompt without nested expressions ---
    prompt_parts = [
        "You are an analyst. Below are the survey responses (SQL summary):",
        "",
        summary_data,
        "",
    ]
    if examples:
        prompt_parts += ["Here are examples of previous reports:", examples, ""]
    prompt_parts.append("Please generate a formal report with key findings and actions.")
    prompt = "\n".join(prompt_parts)
    # -------------------------------------------

    result = llm.invoke(prompt)

    with Session(engine) as sess:
        sess.add(GeneratedReport(
            survey_id=survey_id,
            generated_at=datetime.utcnow(),
            report_text=result
        ))
        sess.commit()
        print("The report has been created:", survey_id)

if __name__ == "__main__":
    sched = BackgroundScheduler()
    # replace "1234-abcd" with the real survey_id
    sched.add_job(lambda: generate_report_for_survey("1234-abcd"),
                  "cron", hour=23, minute=30)
    sched.start()

    while True:
        time.sleep(60)
