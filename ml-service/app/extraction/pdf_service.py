from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import fitz  # PyMuPDF
import base64
import pytesseract
from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class PDFRequest(BaseModel):
    file: str
    mimeType: str

class PDFResponse(BaseModel):
    text: str
    confidence: float
    method: str

@router.post("", response_model=PDFResponse)
async def extract_pdf(request: PDFRequest):
    try:
        pdf_bytes = base64.b64decode(request.file)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        extracted_text = []
        for page in doc:
            extracted_text.append(page.get_text())
        
        full_text = "\n".join(extracted_text)
        
        # If we have sufficient text, assume it's a native PDF
        if len(full_text.strip()) > 50:
            return PDFResponse(
                text=full_text.strip(),
                confidence=0.95,
                method="native_text"
            )
            
        # Fallback to OCR (PyMuPDF rendering + pytesseract)
        ocr_text = []
        for page in doc:
            # Render page to an image. dpi=150 is a reasonable balance of speed vs OCR accuracy
            pix = page.get_pixmap(dpi=150)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            
            text = pytesseract.image_to_string(img)
            ocr_text.append(text)
            
        full_ocr_text = "\n".join(ocr_text)
        confidence = 0.85 if len(full_ocr_text.strip()) > 10 else 0.4
        
        return PDFResponse(
            text=full_ocr_text.strip(),
            confidence=confidence,
            method="ocr"
        )
        
    except Exception as e:
        logger.error(f"PDF extraction failed: {str(e)}")
        raise HTTPException(status_code=500, detail="PDF extraction failed")
