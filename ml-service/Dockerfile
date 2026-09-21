FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (e.g. for PyMuPDF or Tesseract if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    tesseract-ocr curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Non-root user
RUN useradd -m appuser && chown -R appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
