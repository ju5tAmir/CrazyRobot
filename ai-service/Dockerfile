# Dockerfile
FROM python:3.11-slim

# Specify the working directory.
WORKDIR /app

# Copy the dependencies and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the code
COPY . .

# Exposing the FastAPI port
EXPOSE 8000

# By default, we run FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
