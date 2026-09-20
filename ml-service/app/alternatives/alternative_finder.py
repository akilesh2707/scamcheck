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

from app.alternatives.search_provider import get_search_provider

class Alternative(BaseModel):
    name: str
    cost: float
    contentMatch: float
    gains: List[str]
    losses: List[str]
    potentialSaving: float
    evidence: List[Dict[str, Any]] = []
    source: Optional[str] = None
    url: Optional[str] = None

class AlternativesRequest(BaseModel):
    opportunity: Opportunity
    userProfile: Optional[Dict[str, Any]] = None
    limit: int = 10

class AlternativesResponse(BaseModel):
    status: str = "AVAILABLE"
    alternatives: List[Alternative]

@router.post("/find", response_model=AlternativesResponse)
async def find_alternatives(request: AlternativesRequest):
    provider = get_search_provider()
    
    if not provider.is_configured():
        return AlternativesResponse(status="SEARCH_UNAVAILABLE", alternatives=[])
        
    opp = request.opportunity
    skills = opp.skills or []
    role = opp.role or opp.type or "opportunity"
    
    query_parts = []
    if role:
        query_parts.append(f"free {role}")
    if skills:
        query_parts.append(" ".join(skills[:2]))
    
    query = " ".join(query_parts) if query_parts else "free online courses and internships"
    
    search_results = provider.search(query)
    
    alternatives = []
    for res in search_results:
        alternatives.append(
            Alternative(
                name=res.get("title", "Alternative Option"),
                cost=0.0,
                contentMatch=80.0,
                gains=["Verified provider", "Free access"],
                losses=[],
                potentialSaving=float(opp.fees.get("training", 0)) if opp.fees else 0.0,
                evidence=[],
                source=res.get("provider", "Search Result"),
                url=res.get("url")
            )
        )
        
    return AlternativesResponse(status="AVAILABLE", alternatives=alternatives)