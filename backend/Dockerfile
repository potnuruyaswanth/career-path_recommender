FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . .

# Expose port
EXPOSE 8000

# Run FastAPI with production settings
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/streams?class=10')" || exit 1

# Run FastAPI with production settings
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
