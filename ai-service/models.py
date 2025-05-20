import os
from datetime import datetime
from dotenv import load_dotenv
from sqlmodel import SQLModel, Field, create_engine

load_dotenv(".env")
DB_URL = os.getenv("DATABASE_URL")

engine = create_engine(
    DB_URL,
    echo=False,
    pool_pre_ping=True,
    pool_recycle=240,
)

# ──ORM classes ───────────────────────────────────────────────
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
