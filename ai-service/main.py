from fastapi import FastAPI, Depends, HTTPException, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, select
from sqlalchemy import func, or_
from datetime import datetime
from pathlib import Path

import os, json, yaml, requests
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi import Body
from models import (                          
    engine, DomSurvey, DomQuestion, DomOption,
    DomResponse, DomAnswer, GeneratedReport
)
from rag_index      import get_answer
from report_service import generate_report,get_survey_summary,get_session
from agent          import ask_agent

# ---------- config ----------
load_dotenv(".env")
with open("rag_config.yaml") as f:
    rag_cfg = yaml.safe_load(f)
OLLAMA = os.getenv("OLLAMA_URL", rag_cfg["ollama_url"])
MODEL  = os.getenv("MODEL", rag_cfg.get("model", "llama3:latest"))
PROMPT = rag_cfg["prompt_template"]

class AssistantReq(BaseModel):
    message: str
# ---------- FastAPI ----------
app = FastAPI()
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

@app.on_event("startup")
def _create_tables():
    SQLModel.metadata.create_all(engine)

def _session():
    with Session(engine) as s:
        yield s

# ---------- routes ----------
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
async def assistant(payload: AssistantReq = Body(...)):
    reply = ask_agent(payload.message)
    return {"reply": reply}

@router.post("/ask")
async def ask(request: Request):
    q = (await request.json()).get("question")
    if not q:
        raise HTTPException(400, "`question` field required")
    return {"answer": get_answer(q)}

app.include_router(router)
