# agent.py
import json
import os
from dotenv import load_dotenv

from langchain.agents import initialize_agent, Tool, AgentType
from langchain.memory import ConversationBufferMemory
from langchain_ollama import OllamaLLM         # ← new import
 

from rag_index      import get_answer
from report_service import generate_report
from tasks          import generate_reports_for_all_surveys

# -----------------------------------------------------------------------------
# Env
# -----------------------------------------------------------------------------
load_dotenv()
OLLAMA_URL   = os.getenv("OLLAMA_URL",   "http://ollama:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3:latest")

# -----------------------------------------------------------------------------
# LLM
# -----------------------------------------------------------------------------
llm = OllamaLLM(                      
    model      = OLLAMA_MODEL,
    base_url   = OLLAMA_URL,
    temperature= 0.1,                
)

memory = ConversationBufferMemory(memory_key="chat_history",
                                  return_messages=True)

# -----------------------------------------------------------------------------
# Tools
# -----------------------------------------------------------------------------
def qa_tool(q: str) -> str:
    return get_answer(q)

def report_tool(survey_id: str) -> str:
    return generate_report(survey_id)

def batch_tool(_: str = "") -> str:
    # ensure_ascii=False → so as not to break Unicode
    return json.dumps(generate_reports_for_all_surveys(),
                      ensure_ascii=False)

tools = [
    Tool("SurveyQA",     qa_tool,    "Answer questions about survey data"),
    Tool("MakeReport",   report_tool,"Generate report for given survey_id"),
    Tool("BatchReports", batch_tool,"Generate reports for all surveys"),
]

agent = initialize_agent(
    tools   = tools,
    llm     = llm,
    agent   = AgentType.ZERO_SHOT_REACT_DESCRIPTION,    
    memory  = memory,
    verbose = True,
)

def ask_agent(message: str) -> str:
    return agent.invoke(message)
