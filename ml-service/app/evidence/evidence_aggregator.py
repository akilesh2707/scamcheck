from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter()

class Evidence(BaseModel):
    claim: str
    status: str
    source: Optional[str] = None
    details: Optional[str] = None
    checkedAt: Optional[str] = None
    confidence: Optional[float] = None

class EvidenceRequest(BaseModel):
    evidences: List[Evidence]

class EvidenceResponse(BaseModel):
    aggregated: Dict[str, Any]
    summary: Dict[str, int]

@router.post("/aggregate", response_model=EvidenceResponse)
async def aggregate_evidence(request: EvidenceRequest):
    status_counts = {}
    for e in request.evidences:
        status_counts[e.status] = status_counts.get(e.status, 0) + 1
    
    return EvidenceResponse(
        aggregated={},
        summary=status_counts
    )