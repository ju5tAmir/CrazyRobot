from pathlib import Path
import os

    
from dotenv import load_dotenv
from langchain.prompts import PromptTemplate
from langchain_ollama import OllamaLLM  # new Ollama client (pip install -U langchain-ollama)

# -----------------------------------------------------------------------------
# Environment
# -----------------------------------------------------------------------------
load_dotenv()
OLLAMA_URL   = os.getenv("OLLAMA_URL",   "http://ollama:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3:latest")     


# -----------------------------------------------------------------------------
# Context data – loaded once at import time
# -----------------------------------------------------------------------------
context_text = Path("rag_data.txt").read_text(encoding="utf-8")

# -----------------------------------------------------------------------------
# Prompt & LLM definition
# -----------------------------------------------------------------------------
template = """
Use the following information to respond to the user's request.

Context:
{context}

Request:
{question}

Respond:
"""

prompt = PromptTemplate(template=template, input_variables=["context", "question"])

llm = OllamaLLM(
    model=OLLAMA_MODEL,
    base_url=OLLAMA_URL,
    temperature=0.1,  # optional tweak
)

# Combine with the recommended Runnable sequence API (replaces deprecated LLMChain)
chain = prompt | llm


# -----------------------------------------------------------------------------
# Public helper
# -----------------------------------------------------------------------------

def get_answer(user_question: str) -> str:
    """Return an answer from the RAG chain for a given user question."""
    return chain.invoke({"context": context_text, "question": user_question})
