from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
import base64
from io import BytesIO
from PIL import Image, UnidentifiedImageError
import pytesseract
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class OCRRequest(BaseModel):
    file: str
    mimeType: str

class OCRResponse(BaseModel):
    text: str
    confidence: float

@router.post("", response_model=OCRResponse)
async def ocr_extract(request: OCRRequest):
    try:
        # Decode base64 file
        image_bytes = base64.b64decode(request.file)
        image = Image.open(BytesIO(image_bytes))
        
        # Extract text using tesseract
        text = pytesseract.image_to_string(image)
        
        # Calculate a basic confidence (tesseract image_to_data could give word confidences, 
        # but for MVP a simple check if text is found is enough to set a baseline confidence)
        confidence = 0.85 if len(text.strip()) > 10 else 0.4
        
        return OCRResponse(
            text=text.strip(),
            confidence=confidence
        )
    except UnidentifiedImageError:
        raise HTTPException(status_code=400, detail="Invalid image format")
    except Exception as e:
        logger.error(f"OCR failed: {str(e)}")
        raise HTTPException(status_code=500, detail="OCR extraction failed")