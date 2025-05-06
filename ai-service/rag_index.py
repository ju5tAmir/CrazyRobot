# rag_index.py
from langchain.llms import Ollama
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# We are reading the file with your data.
with open("rag_data.txt", "r", encoding="utf-8") as file:
    context_text = file.read()

# Request template
template = """
Use the following information to respond to the user's request.

Context:
{context}

Request:
{question}

Respond:
"""

# Creating a chain
prompt = PromptTemplate(template=template, input_variables=["context", "question"])
llm = Ollama(model="mistral")  # or your model
chain = LLMChain(prompt=prompt, llm=llm)

# Call function
def get_answer(user_question: str):
    return chain.run({"context": context_text, "question": user_question})
