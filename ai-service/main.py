from fastapi import FastAPI, Depends, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, select, create_engine
from sqlalchemy import func, or_
from datetime import datetime
from pathlib import Path
import os, json, yaml, requests
from dotenv import load_dotenv
from fastapi import Request
from rag_index import get_answer 
# ----------config ----------
load_dotenv(".env")

with open("rag_config.yaml") as f:
    rag_cfg = yaml.safe_load(f)

OLLAMA = os.getenv("OLLAMA_URL", rag_cfg["ollama_url"])
MODEL  = os.getenv("MODEL", rag_cfg.get("model", "llama3:latest"))
PROMPT = rag_cfg["prompt_template"]

DB_URL  = os.getenv("DATABASE_URL")
engine = create_engine(
    DB_URL,
    echo=False,
    pool_pre_ping=True,   # ✅ checks if the connection is "live" before requesting
    pool_recycle=240      # ✅ reassembles connections older than ~4.5 minutes
)

# ---------- FastAPI ----------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- models ----------
class DomSurvey(SQLModel, table=True):
    __tablename__, __table_args__ = "survey", {"schema": "crazyrobot"}
    id: str = Field(primary_key=True)
    title: str
    survey_type: str
    created_at: datetime

class DomQuestion(SQLModel, table=True):
    __tablename__, __table_args__ = "question", {"schema": "crazyrobot"}
    id: str = Field(primary_key=True)
    survey_id: str
    question_text: str
    question_type: str
    order_number: int

class DomOption(SQLModel, table=True):
    __tablename__, __table_args__ = "question_option", {"schema": "crazyrobot"}
    id: str = Field(primary_key=True)
    question_id: str
    option_text: str
    order_number: int

class DomResponse(SQLModel, table=True):
    __tablename__, __table_args__ = "survey_response", {"schema": "crazyrobot"}
    id: str = Field(primary_key=True)
    survey_id: str
    user_id: str
    submitted_at: datetime

class DomAnswer(SQLModel, table=True):
    __tablename__, __table_args__ = "answer", {"schema": "crazyrobot"}
    id: str = Field(primary_key=True)
    survey_response_id: str
    question_id: str
    selected_option_id: str | None
    answer_text: str | None

class GeneratedReport(SQLModel, table=True):
    __tablename__, __table_args__ = "generated_report", {"schema": "crazyrobot"}
    id: int | None = Field(default=None, primary_key=True)
    survey_id: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    report_text: str

@app.on_event("startup")
def create_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as s:
        yield s

# ---------- helper ----------
def load_examples() -> str:
    """Returns the text from rag_data.txt if the file exists."""
    try:
        return Path("rag_data.txt").read_text(encoding="utf-8")
    except FileNotFoundError:
        return ""

# ---------- summary ----------
router = APIRouter()

@router.get("/reports/summary")
def report_summary(session: Session = Depends(get_session)):
    summary = []
    surveys = session.exec(
        select(DomSurvey).order_by(DomSurvey.created_at)
    ).all()

    for s in surveys:
        responses_cnt = session.exec(
            select(func.count()).select_from(DomResponse)
                  .where(DomResponse.survey_id == s.id)
        ).one()

        survey_info = {
            "survey_id": s.id,
            "title": s.title,
            "responses_count": responses_cnt,
            "questions": []
        }

        questions = session.exec(
            select(DomQuestion)
              .where(DomQuestion.survey_id == s.id)
              .order_by(DomQuestion.order_number)
        ).all()

        for q in questions:
            q_info = {
                "question_id": q.id,
                "text": q.question_text,
                "type": q.question_type
            }

            if q.question_type == "multiple_choice":
                opts = session.exec(
                    select(DomOption)
                      .where(DomOption.question_id == q.id)
                      .order_by(DomOption.order_number)
                ).all()

                stats = []
                for o in opts:
                    cnt = session.exec(
                        select(func.count()).select_from(DomAnswer)
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
                        "text": o.option_text,
                        "count": cnt
                    })

                q_info["options"] = stats
            else:
                texts = session.exec(
                    select(DomAnswer.answer_text)
                      .where(DomAnswer.question_id == q.id)
                ).all()
                q_info["responses"] = [t for t in texts if t]

            survey_info["questions"].append(q_info)

        summary.append(survey_info)

    return {"surveys": summary}

# ---------- generate ----------
@router.post("/reports/generate")
def generate_report(survey_id: str):
    # ── 1. we read the summary in a short-lived session ──────────────
    with Session(engine) as read_db:
        surveys = report_summary(read_db)["surveys"]
    summary = next((s for s in surveys if s["survey_id"] == survey_id), None)
    if not summary:
        raise HTTPException(status_code=404, detail="Survey not found")

    # ── 2. form a prompt ───────────────────────────────────
    prompt = PROMPT.replace(
        "{data}", json.dumps(summary, ensure_ascii=False)
    )
    examples = load_examples()
    if examples:
        prompt += f"\n\nExamples of previous reports:\n{examples}"

    # ── 3. long Ollama call (can last 5-8 minutes) ────────
    r = requests.post(
        f"{OLLAMA}/v1/chat/completions",
        json={"model": MODEL, "messages": [{"role": "user", "content": prompt}]},
        timeout=900        # (15 min) spare
    )
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"LLM error: {r.text}")

    text_out = r.json()["choices"][0]["message"]["content"]

    # ── 4. we write the result in a new session ────────────────────
    with Session(engine) as write_db:
        rep = GeneratedReport(survey_id=survey_id, report_text=text_out)
        write_db.add(rep)
        write_db.commit()
        write_db.refresh(rep)

    return {"id": rep.id, "report_text": rep.report_text}
@router.post("/ask")
async def ask(request: Request):
    data = await request.json()
    question = data.get("question")
    if not question:
        raise HTTPException(status_code=400, detail="`question` field required")
    answer = get_answer(question)
    return {"answer": answer}

app.include_router(router)
