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
    requiredSkills: List[str]
    matchedSkills: List[str]
    missingSkills: List[str]
    matchPercentage: float
    explanations: List[str]

# Common synonyms map
SYNONYMS = {
    "react": ["react", "reactjs", "react.js"],
    "node": ["node", "node.js", "nodejs"],
    "javascript": ["javascript", "js"],
    "typescript": ["typescript", "ts"],
    "python": ["python", "python3"],
    "html": ["html", "html5"],
    "css": ["css", "css3"]
}

def normalize_skill(skill: str) -> str:
    s = skill.lower().strip()
    for standard, variations in SYNONYMS.items():
        if s in variations:
            return standard
    return s

@router.post("/analyze", response_model=SkillGapResponse)
async def analyze_skill_gap(request: SkillGapRequest):
    required = [s.strip() for s in request.requiredSkills if s.strip()]
    user = [s.strip() for s in request.userSkills if s.strip()]
    
    normalized_user = {normalize_skill(s): s for s in user}
    
    matched = []
    missing = []
    explanations = []
    
    for req_skill in required:
        norm_req = normalize_skill(req_skill)
        
        # Exact or synonym match
        if norm_req in normalized_user:
            user_original = normalized_user[norm_req]
            matched.append(req_skill)
            if req_skill.lower() != user_original.lower():
                explanations.append(f"Matched required skill '{req_skill}' with your profile skill '{user_original}' (Synonym).")
            else:
                explanations.append(f"Matched required skill '{req_skill}' exactly.")
        else:
            # Semantic matching placeholder: In a real LLM fallback, we would call the LLM here.
            # But the requirement says deterministic first. LLM is optional fallback.
            # If LLM matches, it must be marked as INFERRED. 
            # We don't have a real LLM configured here for semantic match, so we mark it missing.
            missing.append(req_skill)
            explanations.append(f"Missing required skill '{req_skill}'.")
    
    total = len(required)
    match_percentage = (len(matched) / total * 100) if total > 0 else 100.0
    
    return SkillGapResponse(
        requiredSkills=required,
        matchedSkills=matched,
        missingSkills=missing,
        matchPercentage=round(match_percentage, 1),
        explanations=explanations
    )