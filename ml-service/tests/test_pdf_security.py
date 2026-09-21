import pytest
from fastapi.testclient import TestClient
from app.main import app
import base64
import fitz

client = TestClient(app)

def create_dummy_pdf(pages: int) -> str:
    doc = fitz.open()
    for _ in range(pages):
        page = doc.new_page()
        page.insert_text((50, 50), "Test Page")
    pdf_bytes = doc.write()
    doc.close()
    return base64.b64encode(pdf_bytes).decode("utf-8")

def test_pdf_extraction_safe_size():
    pdf_b64 = create_dummy_pdf(2)
    response = client.post(
        "/extract/pdf",
        json={"file": pdf_b64, "mimeType": "application/pdf"}
    )
    assert response.status_code == 200
    assert "Test Page" in response.json()["text"]

def test_pdf_extraction_exceeds_limit():
    pdf_b64 = create_dummy_pdf(51)
    response = client.post(
        "/extract/pdf",
        json={"file": pdf_b64, "mimeType": "application/pdf"}
    )
    assert response.status_code == 400
    assert "exceeds the 50 page limit" in response.json()["detail"]
