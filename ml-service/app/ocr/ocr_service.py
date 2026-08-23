from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter()

class OCRRequest(BaseModel):
    file: str
    mimeType: str

class OCRResponse(BaseModel):
    text: str
    confidence: float

@router.post("", response_model=OCRResponse)
async def ocr_extract(request: OCRRequest):
    return OCRResponse(
        text="OCR extraction not yet implemented",
        confidence=0.0
    )