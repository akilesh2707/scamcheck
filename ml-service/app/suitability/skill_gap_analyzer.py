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
    status: str
    reason: str

class SkillGapResponse(BaseModel):
    requiredSkills: List[str]
    matchPercentage: float
    gaps: List[SkillGapItem]

# Common synonyms map
SYNONYMS = {
    "react": ["react", "reactjs", "react.js"],
    "node.js": ["node", "node.js", "nodejs"],
    "javascript": ["javascript", "js", "ecmascript"],
    "typescript": ["typescript", "ts"],
    "python": ["python", "python3", "py"],
    "html": ["html", "html5"],
    "css": ["css", "css3"],
    "machine learning": ["ml", "machine learning", "deep learning"],
}

def normalize_skill(skill: str) -> str:
    s = skill.lower().strip()
    for standard, variations in SYNONYMS.items():
        if s in variations:
            return standard
    return s

def semantic_match(req_skill: str, user_skills: List[str]) -> Optional[str]:
    # A lightweight deterministic semantic/subset match without an LLM
    req_lower = req_skill.lower()
    for u in user_skills:
        u_lower = u.lower()
        if req_lower in u_lower or u_lower in req_lower:
            return u
    return None

@router.post("/analyze", response_model=SkillGapResponse)
async def analyze_skill_gap(request: SkillGapRequest):
    required = [s.strip() for s in request.requiredSkills if s.strip()]
    user = [s.strip() for s in request.userSkills if s.strip()]

    normalized_user = {normalize_skill(s): s for s in user}

    gaps = []
    matched_count = 0

    for req_skill in required:
        norm_req = normalize_skill(req_skill)

        # 1. Exact or canonical synonym match
        if norm_req in normalized_user:
            user_original = normalized_user[norm_req]
            matched_count += 1
            if req_skill.lower() != user_original.lower():
                gaps.append(SkillGapItem(
                    skill=req_skill,
                    required=True,
                    status="SUPPORTED",
                    reason=f"Matched '{req_skill}' with your profile skill '{user_original}' (Synonym)."
                ))
            else:
                gaps.append(SkillGapItem(
                    skill=req_skill,
                    required=True,
                    status="SUPPORTED",
                    reason=f"Matched '{req_skill}' exactly."
                ))
        else:
            # 2. Semantic/Inferred match
            sem_match = semantic_match(req_skill, user)
            if sem_match:
                matched_count += 1
                gaps.append(SkillGapItem(
                    skill=req_skill,
                    required=True,
                    status="INFERRED",
                    reason=f"Inferred proficiency in '{req_skill}' based on your skill '{sem_match}'."
                ))
            else:
                # 3. Missing
                gaps.append(SkillGapItem(
                    skill=req_skill,
                    required=True,
                    status="NOT_VERIFIED",
                    reason=f"Missing required skill '{req_skill}'."
                ))

    total = len(required)
    match_percentage = (matched_count / total * 100) if total > 0 else 100.0

    return SkillGapResponse(
        requiredSkills=required,
        matchPercentage=round(match_percentage, 1),
        gaps=gaps
    )