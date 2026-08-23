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

def normalize_skill(skill: str) -> str:
    if not skill:
        return ""
    s = skill.strip().lower()
    mapping = {
        "reactjs": "React",
        "react.js": "React",
        "react": "React",
        "nodejs": "Node.js",
        "node.js": "Node.js",
        "node": "Node.js",
        "javascript": "JavaScript",
        "js": "JavaScript",
        "ml": "Machine Learning",
        "machine learning": "Machine Learning",
        "python": "Python",
        "typescript": "TypeScript",
        "ts": "TypeScript"
    }
    return mapping.get(s, skill.strip().title())

@router.post("/analyze", response_model=SuitabilityResponse)
async def analyze_suitability(request: SuitabilityRequest):
    user_profile = request.userProfile or {}
    opportunity = request.opportunity
    
    if not user_profile.get("skills") and not user_profile.get("education"):
        return SuitabilityResponse(
            score=None,
            breakdown={},
            skillGap=[],
            status="INSUFFICIENT_PROFILE_DATA"
        )

    # Normalize skills
    user_skills = set(normalize_skill(s) for s in user_profile.get("skills", []) if s)
    opp_skills = set(normalize_skill(s) for s in (opportunity.skills or []) if s)

    if not opp_skills:
        return SuitabilityResponse(
            score=None,
            breakdown={},
            skillGap=[],
            status="INSUFFICIENT_DATA"
        )

    # Skill match
    matched_skills = user_skills.intersection(opp_skills)
    missing_skills = opp_skills - user_skills
    
    skill_match_score = int((len(matched_skills) / len(opp_skills)) * 100) if opp_skills else 100

    skill_gaps = []
    for skill in missing_skills:
        skill_gaps.append(SkillGapItem(
            skill=skill,
            required=True,
            priority="HIGH",
            resources=[]
        ))

    # Basic fits
    education_fit = 80 if user_profile.get("education") else None
    experience_fit = 80 if user_profile.get("experience") else None
    
    # Budget fit
    budget_fit = None
    if opportunity.fees and opportunity.fees.get("amount") and user_profile.get("budget"):
        try:
            fee_amount = float(opportunity.fees["amount"])
            user_budget = float(user_profile["budget"])
            budget_fit = 100 if user_budget >= fee_amount else max(0, int((user_budget / fee_amount) * 100))
        except (ValueError, TypeError):
            pass

    time_fit = 80 if user_profile.get("learningMode") else None
    career_alignment = 80

    scores = [s for s in [skill_match_score, education_fit, experience_fit, budget_fit, time_fit, career_alignment] if s is not None]
    overall_score = int(sum(scores) / len(scores)) if scores else None

    return SuitabilityResponse(
        score=overall_score,
        breakdown={
            "skill_match": skill_match_score,
            "education_fit": education_fit,
            "experience_fit": experience_fit,
            "budget_fit": budget_fit,
            "time_fit": time_fit,
            "career_alignment": career_alignment
        },
        skillGap=skill_gaps,
        status="SUITABLE" if (overall_score and overall_score >= 70) else "NEEDS_IMPROVEMENT"
    )