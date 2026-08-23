from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter()

class Opportunity(BaseModel):
    type: Optional[str] = None
    organization: Optional[Dict[str, Any]] = None
    role: Optional[str] = None
    description: Optional[str] = None
    fees: Optional[Dict[str, Any]] = None
    stipend: Optional[Dict[str, Any]] = None
    duration: Optional[str] = None
    contacts: Optional[List[Dict[str, Any]]] = None
    urls: Optional[List[str]] = None
    eligibility: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    claimedBenefits: Optional[List[str]] = None
    deadlines: Optional[List[str]] = None
    claims: Optional[List[str]] = None
    rawText: Optional[str] = None

class Alternative(BaseModel):
    name: str
    cost: float
    contentMatch: float
    gains: List[str]
    losses: List[str]
    potentialSaving: float
    evidence: List[Dict[str, Any]] = []
    source: Optional[str] = None

class AlternativesRequest(BaseModel):
    opportunity: Opportunity
    userProfile: Optional[Dict[str, Any]] = None
    limit: int = 10

class AlternativesResponse(BaseModel):
    alternatives: List[Alternative]

@router.post("/find", response_model=AlternativesResponse)
async def find_alternatives(request: AlternativesRequest):
    return AlternativesResponse(alternatives=[])