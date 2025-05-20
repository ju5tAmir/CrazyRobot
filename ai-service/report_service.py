import os
import json
import yaml
import requests
from datetime import datetime
from pathlib import Path
from typing import List, Dict
from typing import Generator, List, Dict
from dotenv import load_dotenv
from sqlmodel import Session, select
from sqlalchemy import func, or_

from models import (
    engine,
    DomSurvey,
    DomQuestion,
    DomOption,
    DomResponse,
    DomAnswer,
    GeneratedReport,
)

# ───────────────────────── config ──────────────────────────────
load_dotenv(".env")

with open("rag_config.yaml", encoding="utf-8") as f:
    cfg = yaml.safe_load(f)

OLLAMA_URL   = os.getenv("OLLAMA_URL", cfg["ollama_url"])
OLLAMA_MODEL = os.getenv("MODEL",      cfg.get("model", "llama3:latest"))
PROMPT       = cfg["prompt_template"]  # must contain {data}


def _example_reports() -> str:
    p = Path("rag_data.txt")
    return p.read_text("utf-8") if p.exists() else ""

def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency: opens and closes a session to the database.
    Use as Depends(get_session).
    """
    with Session(engine) as session:
        yield session
def get_survey_summary(db: Session) -> List[Dict]:
    """
    Returns summary information for all surveys.
    """
    summary: List[Dict] = []

    surveys = db.exec(
        select(DomSurvey).order_by(DomSurvey.created_at)
    ).all()

    for s in surveys:
        responses_cnt = db.exec(
            select(func.count())
            .select_from(DomResponse)
            .where(DomResponse.survey_id == s.id)
        ).one()

        survey_info = {
            "survey_id":       s.id,
            "title":           s.title,
            "responses_count": responses_cnt,
            "questions":       []
        }

        questions = db.exec(
            select(DomQuestion)
            .where(DomQuestion.survey_id == s.id)
            .order_by(DomQuestion.order_number)
        ).all()

        for q in questions:
            q_info = {
                "question_id": q.id,
                "text":        q.question_text,
                "type":        q.question_type,
            }

            if q.question_type == "multiple_choice":
                opts = db.exec(
                    select(DomOption)
                    .where(DomOption.question_id == q.id)
                    .order_by(DomOption.order_number)
                ).all()

                stats = []
                for o in opts:
                    cnt = db.exec(
                        select(func.count())
                        .select_from(DomAnswer)
                        .where(DomAnswer.question_id == q.id)
                        .where(
                            or_(
                                DomAnswer.selected_option_id == o.id,
                                DomAnswer.answer_text == o.option_text
                            )
                        )
                    ).one()
                    stats.append({
                        "option_id": o.id,
                        "text":      o.option_text,
                        "count":     cnt
                    })

                q_info["options"] = stats

            else:
                texts = db.exec(
                    select(DomAnswer.answer_text)
                    .where(DomAnswer.question_id == q.id)
                ).all()
                # here we just filter non-empty responses
                q_info["responses"] = [t for t in texts if t]

            survey_info["questions"].append(q_info)

        summary.append(survey_info)

    return summary

def generate_report(survey_id: str) -> str:
    """
    Your existing LLM report generation code.
    """
    # 1) aggregate...
    with Session(engine) as db:
        responses_cnt = db.exec(
            select(func.count())
            .select_from(DomResponse)
            .where(DomResponse.survey_id == survey_id)
        ).one()
        questions = db.exec(
            select(
                DomQuestion.id,
                DomQuestion.question_text.label("text"),
                DomQuestion.question_type.label("type"),
            )
            .where(DomQuestion.survey_id == survey_id)
            .order_by(DomQuestion.order_number)
        ).mappings().all()

    summary = {
        "survey_id":       survey_id,
        "responses_count": responses_cnt,
        "questions":       questions,
    }

    # 2) craft prompt
    prompt = PROMPT.replace("{data}", json.dumps(summary, ensure_ascii=False))
    if ex := _example_reports():
        prompt += f"\n\nExamples of previous reports:\n{ex}"

    # 3) call Ollama
    resp = requests.post(
        f"{OLLAMA_URL}/v1/chat/completions",
        json={"model": OLLAMA_MODEL, "messages": [{"role": "user", "content": prompt}]},
        timeout=900,
    )
    resp.raise_for_status()
    report_text = resp.json()["choices"][0]["message"]["content"]

    # 4) save
    with Session(engine) as sess:
        sess.add(GeneratedReport(
            survey_id    = survey_id,
            generated_at = datetime.utcnow(),
            report_text  = report_text,
        ))
        sess.commit()

    try:
        with Path("rag_data.txt").open("a", encoding="utf-8") as f:
            f.write(f"\n\n{report_text}")
    except Exception as exc:
        print(f"⚠️ Could not append to rag_data.txt: {exc}", flush=True)

    return report_text
