from fastapi import FastAPI, Depends, HTTPException, APIRouter, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, select
from sqlalchemy import func, or_
from datetime import datetime
import re
import json
from models import (
    engine, DomSurvey, DomQuestion, DomOption,
    DomResponse, DomAnswer, GeneratedReport, SurveyChat
)
 
from rag_index      import get_answer
from report_service import generate_report, get_survey_summary,get_session
from agent          import ask_agent
from pydantic import BaseModel
import os, yaml
from dotenv import load_dotenv

# ---- config ----
load_dotenv(".env")
with open("rag_config.yaml") as f:
    rag_cfg = yaml.safe_load(f)

# ---- FastAPI ----
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def create_all():
    SQLModel.metadata.create_all(engine)

def _session():
    with Session(engine) as sess:
        yield sess

class AssistantReq(BaseModel):
    message: str

router = APIRouter()

@router.get("/reports/summary")
def report_summary(session: Session = Depends(get_session)):
    surveys = get_survey_summary(session)
    return {"surveys": surveys}

@router.post("/reports/generate")
def generate_report_endpoint(survey_id: str):
    text = generate_report(survey_id)
    return {"report_text": text}

@router.post("/assistant")
def assistant(payload: dict = Body(...), session: Session = Depends(_session)):
    msg = payload.get("message", "")
    # if QA — parse survey_id and question…
    if msg.startswith("SurveyQA"):
        import re
        m = re.match(r'SurveyQA survey_id=(.+?);\s*question="(.+)"', msg)
        if not m:
            raise HTTPException(400, detail="Bad SurveyQA format")
        survey_id, question = m.group(1), m.group(2)

        raw = ask_agent(msg)
        # we get the text of the answer
        if isinstance(raw, dict):
            reply = raw.get("output") or raw.get("reply") or str(raw)
        else:
            reply = str(raw)

        # stored in the database
        session.add(SurveyChat(
            survey_id=survey_id,
            question=question,
            answer=reply
        ))
        session.commit()
        return {"reply": reply}

    # other calls (MakeReport, BatchReports) also through the agent
    raw = ask_agent(msg)
    if isinstance(raw, dict):
        reply = raw.get("output") or raw.get("reply") or str(raw)
    else:
        reply = str(raw)
    return {"reply": reply}


@router.get("/reports/{survey_id}/conversation")
def get_conversation(
    survey_id: str,
    session: Session = Depends(_session),
):
    chats = session.exec(
        select(SurveyChat)
            .where(SurveyChat.survey_id == survey_id)
            .order_by(SurveyChat.created_at)
    ).all()
    return [{"question": c.question, "answer": c.answer} for c in chats]

app.include_router(router)
