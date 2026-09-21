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

class SuitabilityComponent(BaseModel):
    score: Optional[int] = None
    status: str
    reason: Optional[str] = None

class SuitabilityBreakdown(BaseModel):
    skills: SuitabilityComponent
    education: SuitabilityComponent
    experience: SuitabilityComponent
    careerGoals: SuitabilityComponent
    compensation: SuitabilityComponent
    location: SuitabilityComponent
    budget: SuitabilityComponent

class SkillGapItem(BaseModel):
    skill: str
    required: bool
    currentLevel: Optional[str] = None
    requiredLevel: Optional[str] = None
    priority: Optional[str] = None
    resources: List[str] = []
    status: Optional[str] = None
    reason: Optional[str] = None

class SuitabilityResponse(BaseModel):
    overallScore: Optional[int] = None
    breakdown: SuitabilityBreakdown
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

def get_empty_breakdown() -> SuitabilityBreakdown:
    return SuitabilityBreakdown(
        skills=SuitabilityComponent(score=None, status="UNAVAILABLE", reason="Missing profile data"),
        education=SuitabilityComponent(score=None, status="UNAVAILABLE", reason="Missing profile data"),
        experience=SuitabilityComponent(score=None, status="UNAVAILABLE", reason="Missing profile data"),
        careerGoals=SuitabilityComponent(score=None, status="UNAVAILABLE", reason="Missing profile data"),
        compensation=SuitabilityComponent(score=None, status="UNAVAILABLE", reason="Missing profile data"),
        location=SuitabilityComponent(score=None, status="UNAVAILABLE", reason="Missing profile data"),
        budget=SuitabilityComponent(score=None, status="UNAVAILABLE", reason="Missing profile data")
    )

@router.post("/analyze", response_model=SuitabilityResponse)
async def analyze_suitability(request: SuitabilityRequest):
    user = request.userProfile or {}
    opp = request.opportunity

    # If entirely empty profile, return unavailable
    if not any(user.get(k) for k in ["skills", "education", "experience", "careerGoals", "expectedSalary", "location", "maxPaymentWillingness"]):
        return SuitabilityResponse(
            overallScore=None,
            breakdown=get_empty_breakdown(),
            skillGap=[],
            status="UNAVAILABLE"
        )

    bd = get_empty_breakdown()
    scores = []

    # 1. Skills
    user_skills = set(normalize_skill(s) for s in user.get("skills", []) if s)
    opp_skills = set(normalize_skill(s) for s in (opp.skills or []) if s)

    def semantic_match(req_skill: str, user_skills: set) -> Optional[str]:
        req_lower = req_skill.lower()
        for u in user_skills:
            u_lower = u.lower()
            if req_lower in u_lower or u_lower in req_lower:
                return u
        return None

    skill_gaps = []
    if not opp_skills:
        bd.skills = SuitabilityComponent(score=None, status="NOT_VERIFIED", reason="Opportunity does not specify required skills")
    elif not user_skills:
        bd.skills = SuitabilityComponent(score=None, status="UNAVAILABLE", reason="User profile missing skills")
    else:
        matched = user_skills.intersection(opp_skills)
        missing = opp_skills - user_skills

        inferred_matches = []
        true_missing = []
        for sk in missing:
            sem = semantic_match(sk, user_skills)
            if sem:
                inferred_matches.append(sk)
                skill_gaps.append(SkillGapItem(
                    skill=sk, required=True, status="INFERRED",
                    reason=f"Inferred proficiency in '{sk}' based on your skill '{sem}'."
                ))
            else:
                true_missing.append(sk)
                skill_gaps.append(SkillGapItem(
                    skill=sk, required=True, status="NOT_VERIFIED",
                    reason=f"Missing required skill '{sk}'."
                ))

        total_matched = len(matched) + len(inferred_matches)
        score = int((total_matched / len(opp_skills)) * 100) if opp_skills else 100
        bd.skills = SuitabilityComponent(
            score=score,
            status="SUPPORTED" if len(matched) > 0 else "INFERRED",
            reason=f"Matches {total_matched} out of {len(opp_skills)} required skills"
        )
        scores.append(score)

    # 2. Education
    if not user.get("degree") and not user.get("education"):
        bd.education = SuitabilityComponent(score=None, status="UNAVAILABLE", reason="User profile missing education")
    else:
        # Simple heuristic for MVP
        bd.education = SuitabilityComponent(score=80, status="INFERRED", reason="Education roughly aligns with opportunity type")
        scores.append(80)

    # 3. Experience
    if not user.get("experienceLevel"):
        bd.experience = SuitabilityComponent(score=None, status="UNAVAILABLE", reason="User profile missing experience level")
    else:
        bd.experience = SuitabilityComponent(score=80, status="INFERRED", reason="Experience level appears adequate")
        scores.append(80)

    # 4. Career Goals
    if not user.get("preferredRoles"):
        bd.careerGoals = SuitabilityComponent(score=None, status="UNAVAILABLE", reason="User profile missing preferred roles")
    else:
        # Check if opportunity role string has overlap with preferred roles
        opp_role = (opp.role or "").lower()
        matched_roles = [r for r in user.get("preferredRoles", []) if r.lower() in opp_role or opp_role in r.lower()]

        if matched_roles:
            bd.careerGoals = SuitabilityComponent(score=100, status="SUPPORTED", reason=f"Matches preferred role: {matched_roles[0]}")
            scores.append(100)
        else:
            bd.careerGoals = SuitabilityComponent(score=50, status="INFERRED", reason="Opportunity role does not directly match preferred roles")
            scores.append(50)

    # 5. Compensation
    if opp.stipend and opp.stipend.get("amount") and user.get("expectedSalary"):
        try:
            expected = float(user["expectedSalary"])
            offered = float(opp.stipend["amount"])
            if offered >= expected:
                bd.compensation = SuitabilityComponent(score=100, status="SUPPORTED", reason="Meets or exceeds expected salary")
                scores.append(100)
            else:
                score = max(0, int((offered / expected) * 100))
                bd.compensation = SuitabilityComponent(score=score, status="SUPPORTED", reason="Below expected salary")
                scores.append(score)
        except (ValueError, TypeError):
            bd.compensation = SuitabilityComponent(score=None, status="NOT_VERIFIED", reason="Could not parse salary amounts")
    elif not user.get("expectedSalary"):
        bd.compensation = SuitabilityComponent(score=None, status="UNAVAILABLE", reason="User profile missing expected salary")
    else:
        bd.compensation = SuitabilityComponent(score=None, status="NOT_VERIFIED", reason="Opportunity does not specify compensation")

    # 6. Location
    if not user.get("location") and not user.get("remotePreference"):
        bd.location = SuitabilityComponent(score=None, status="UNAVAILABLE", reason="User profile missing location preferences")
    else:
        bd.location = SuitabilityComponent(score=80, status="INFERRED", reason="Location preference generally aligns")
        scores.append(80)

    # 7. Budget
    if opp.fees and opp.fees.get("amount") and user.get("maxPaymentWillingness") is not None:
        try:
            max_willing = float(user["maxPaymentWillingness"])
            required_fee = float(opp.fees["amount"])
            if max_willing >= required_fee:
                bd.budget = SuitabilityComponent(score=100, status="SUPPORTED", reason="Within accepted budget")
                scores.append(100)
            else:
                bd.budget = SuitabilityComponent(score=0, status="SUPPORTED", reason="Exceeds maximum payment willingness")
                scores.append(0)
        except (ValueError, TypeError):
            bd.budget = SuitabilityComponent(score=None, status="NOT_VERIFIED", reason="Could not parse fee amounts")
    elif user.get("maxPaymentWillingness") is None:
        bd.budget = SuitabilityComponent(score=None, status="UNAVAILABLE", reason="User profile missing max payment willingness")
    else:
        bd.budget = SuitabilityComponent(score=100, status="SUPPORTED", reason="No fees required by opportunity")
        scores.append(100)

    overall_score = int(sum(scores) / len(scores)) if scores else None

    return SuitabilityResponse(
        overallScore=overall_score,
        breakdown=bd,
        skillGap=skill_gaps,
        status="SUPPORTED" if overall_score is not None else "UNAVAILABLE"
    )