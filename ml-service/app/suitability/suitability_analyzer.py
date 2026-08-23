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

class SuitabilityRequest(BaseModel):
    opportunity: Opportunity
    userProfile: Optional[Dict[str, Any]] = None

class SkillGapItem(BaseModel):
    skill: str
    required: bool
    currentLevel: Optional[str] = None
    requiredLevel: Optional[str] = None
    priority: Optional[str] = None
    resources: List[str] = []

class SuitabilityResponse(BaseModel):
    score: Optional[int] = None
    breakdown: Dict[str, Optional[int]] = {}
    skillGap: List[SkillGapItem] = []
    status: str

@router.post("/analyze", response_model=SuitabilityResponse)
async def analyze_suitability(request: SuitabilityRequest):
    user_profile = request.userProfile or {}
    
    if not user_profile.get("skills") and not user_profile.get("education"):
        return SuitabilityResponse(
            score=None,
            breakdown={},
            skillGap=[],
            status="INSUFFICIENT_PROFILE_DATA"
        )
    
    return SuitabilityResponse(
        score=None,
        breakdown={},
        skillGap=[],
        status="NOT_IMPLEMENTED"
    )