from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter()

class SkillGapRequest(BaseModel):
    requiredSkills: List[str]
    userSkills: List[str] = []

class SkillGapItem(BaseModel):
    skill: str
    required: bool
    currentLevel: Optional[str] = None
    requiredLevel: Optional[str] = None
    priority: Optional[str] = None
    resources: List[str] = []

class SkillGapResponse(BaseModel):
    existingSkills: List[str]
    requiredSkills: List[str]
    missingSkills: List[str]
    preparationPlan: List[SkillGapItem]

@router.post("/analyze", response_model=SkillGapResponse)
async def analyze_skill_gap(request: SkillGapRequest):
    required = set(s.lower().strip() for s in request.requiredSkills)
    user = set(s.lower().strip() for s in request.userSkills)
    
    missing = required - user
    existing = required & user
    
    plan = []
    for skill in missing:
        plan.append(SkillGapItem(
            skill=skill,
            required=True,
            currentLevel="NONE",
            requiredLevel="PROFICIENT",
            priority="HIGH",
            resources=[f"Learn {skill} fundamentals", f"Practice {skill} projects"]
        ))
    
    for skill in existing:
        plan.append(SkillGapItem(
            skill=skill,
            required=True,
            currentLevel="PROFICIENT",
            requiredLevel="PROFICIENT",
            priority="LOW",
            resources=[]
        ))
    
    return SkillGapResponse(
        existingSkills=list(existing),
        requiredSkills=list(required),
        missingSkills=list(missing),
        preparationPlan=plan
    )