from typing import Dict, List, Optional, Any
from pydantic import BaseModel, ValidationError
from fastapi import APIRouter
from app.utils.llm import call_llm, is_negated

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

class RiskIndicator(BaseModel):
    code: str
    title: str
    explanation: str
    points: int
    evidence: str
    details: Optional[str] = None

class RiskAnalysisRequest(BaseModel):
    opportunity: Opportunity

class RiskAnalysisResponse(BaseModel):
    score: int
    level: str
    indicators: List[RiskIndicator]
    weights: Dict[str, int]

RISK_WEIGHTS = {
    "PAYMENT_REQUEST": 30,
    "URGENCY_PRESSURE": 25,
    "SENSITIVE_INFO_REQUEST": 35,
    "UNREALISTIC_COMPENSATION": 20,
    "GUARANTEED_PLACEMENT": 30,
    "IDENTITY_MISMATCH": 15,
    "SUSPICIOUS_CLAIMS": 20,
    "POOR_WEBSITE_CREDIBILITY": 15,
    "UNVERIFIED_COMPANY": 10,
}

URGENCY_PATTERNS = [
    "limited seats", "act now", "expires today", "pay immediately", 
    "last chance", "hurry", "deadline", "only", "seats left", "few seats",
    "limited time", "offer ends", "closing soon", "urgent", "within"
]

SENSITIVE_PATTERNS = [
    "otp", "cvv", "pin", "password", "bank account", "credit card", 
    "debit card", "banking credentials", "bank details", "account number",
    "routing number", "sort code", "iban", "swift"
]

GUARANTEE_PATTERNS = [
    "guaranteed job", "guaranteed placement", "guaranteed income", 
    "100% placement", "assured job", "job guarantee", "placement guarantee"
]

SUSPICIOUS_CLAIMS = [
    "easy money", "get rich quick", "no experience needed", "work from home",
    "make money fast", "passive income", "financial freedom"
]

def calculate_risk_level(score: int) -> str:
    if score <= 20:
        return "LOW"
    elif score <= 40:
        return "MODERATE"
    elif score <= 60:
        return "MEDIUM"
    elif score <= 80:
        return "HIGH"
    return "VERY_HIGH"

def analyze_risk_deterministic(opportunity: Opportunity) -> RiskAnalysisResponse:
    indicators = []
    total_score = 0
    text = (opportunity.rawText or "").lower()
    
    org_name = ((opportunity.organization or {}).get("name") or "").lower()
    org_email = ((opportunity.organization or {}).get("email") or "").lower()
    org_website = ((opportunity.organization or {}).get("website") or "").lower()
    
    fees = opportunity.fees or {}
    has_fees = any(v > 0 for v in fees.values() if isinstance(v, (int, float)))
    
    if has_fees:
        indicators.append(RiskIndicator(
            code="PAYMENT_REQUEST",
            title="Payment requested",
            explanation="The opportunity requests an upfront payment",
            points=RISK_WEIGHTS["PAYMENT_REQUEST"],
            evidence="OBSERVED",
            details=f"Fees found: {fees}"
        ))
        total_score += RISK_WEIGHTS["PAYMENT_REQUEST"]
    
    for pattern in URGENCY_PATTERNS:
        if pattern in text and not is_negated(text, pattern):
            indicators.append(RiskIndicator(
                code="URGENCY_PRESSURE",
                title="Urgency pressure",
                explanation="The opportunity uses urgency language to pressure quick decisions",
                points=RISK_WEIGHTS["URGENCY_PRESSURE"],
                evidence="OBSERVED",
            ))
            total_score += RISK_WEIGHTS["URGENCY_PRESSURE"]
            break
    
    for pattern in SENSITIVE_PATTERNS:
        if pattern in text and not is_negated(text, pattern):
            indicators.append(RiskIndicator(
                code="SENSITIVE_INFO_REQUEST",
                title="Sensitive information requested",
                explanation="The opportunity requests sensitive personal or financial information",
                points=RISK_WEIGHTS["SENSITIVE_INFO_REQUEST"],
                evidence="OBSERVED",
            ))
            total_score += RISK_WEIGHTS["SENSITIVE_INFO_REQUEST"]
            break
    
    stipend = opportunity.stipend or {}
    if stipend.get("amount", 0) > 100000:
        indicators.append(RiskIndicator(
            code="UNREALISTIC_COMPENSATION",
            title="Unrealistic compensation",
            explanation="The claimed compensation is unusually high for the role type",
            points=RISK_WEIGHTS["UNREALISTIC_COMPENSATION"],
            evidence="OBSERVED",
        ))
        total_score += RISK_WEIGHTS["UNREALISTIC_COMPENSATION"]
    
    for pattern in GUARANTEE_PATTERNS:
        if pattern in text and not is_negated(text, pattern):
            indicators.append(RiskIndicator(
                code="GUARANTEED_PLACEMENT",
                title="Guaranteed placement claim",
                explanation="The opportunity makes unrealistic guarantees about job placement",
                points=RISK_WEIGHTS["GUARANTEED_PLACEMENT"],
                evidence="OBSERVED",
            ))
            total_score += RISK_WEIGHTS["GUARANTEED_PLACEMENT"]
            break
    
    if org_email and org_name:
        email_domain = org_email.split("@")[-1] if "@" in org_email else ""
        org_domain = org_website.replace("https://", "").replace("http://", "").split("/")[0]
        common_domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"]
        if email_domain and org_domain and org_domain not in email_domain and email_domain not in common_domains:
            indicators.append(RiskIndicator(
                code="IDENTITY_MISMATCH",
                title="Email/domain mismatch",
                explanation="Contact email domain does not match organization website domain",
                points=RISK_WEIGHTS["IDENTITY_MISMATCH"],
                evidence="OBSERVED",
            ))
            total_score += RISK_WEIGHTS["IDENTITY_MISMATCH"]
    
    for pattern in SUSPICIOUS_CLAIMS:
        if pattern in text and not is_negated(text, pattern):
            indicators.append(RiskIndicator(
                code="SUSPICIOUS_CLAIMS",
                title="Suspicious claims",
                explanation="The opportunity makes claims commonly associated with scams",
                points=RISK_WEIGHTS["SUSPICIOUS_CLAIMS"],
                evidence="OBSERVED",
            ))
            total_score += RISK_WEIGHTS["SUSPICIOUS_CLAIMS"]
            break
    
    final_score = min(total_score, 100)
    level = calculate_risk_level(final_score)
    
    return RiskAnalysisResponse(
        score=final_score,
        level=level,
        indicators=indicators,
        weights=RISK_WEIGHTS
    )

def analyze_risk_with_llm(opportunity: Opportunity) -> RiskAnalysisResponse:
    text = opportunity.rawText or ""
    system_prompt = f"""You are an expert fraud analyst. Review the following text for risk indicators.
    Be extremely careful to distinguish between POSITIVE REQUESTS and NEGATED REQUESTS.
    For example, "We will never ask for your OTP" is a NEGATED REQUEST and should NOT be flagged as SENSITIVE_INFO_REQUEST.
    
    Check for these specific risk codes: {', '.join(RISK_WEIGHTS.keys())}
    
    Return a JSON object exactly matching:
    {{
      "indicators": [
        {{
          "code": "string (from allowed list)",
          "title": "string",
          "explanation": "string",
          "points": number (from weights),
          "evidence": "OBSERVED",
          "details": "string"
        }}
      ]
    }}
    Only include ACTUAL REQUESTS and genuine risks. If none, return empty indicators.
    """
    
    try:
        data = call_llm(system_prompt, text)
        indicators_data = data.get("indicators", [])
        
        indicators = []
        total_score = 0
        for ind in indicators_data:
            if ind.get("code") in RISK_WEIGHTS:
                points = RISK_WEIGHTS[ind["code"]]
                indicators.append(RiskIndicator(
                    code=ind["code"],
                    title=ind.get("title", ind["code"]),
                    explanation=ind.get("explanation", ""),
                    points=points,
                    evidence="OBSERVED",
                    details=ind.get("details", "")
                ))
                total_score += points
                
        final_score = min(total_score, 100)
        level = calculate_risk_level(final_score)
        
        return RiskAnalysisResponse(
            score=final_score,
            level=level,
            indicators=indicators,
            weights=RISK_WEIGHTS
        )
    except Exception as e:
        print(f"LLM risk analysis failed: {e}")
        return analyze_risk_deterministic(opportunity)

@router.post("/analyze", response_model=RiskAnalysisResponse)
async def analyze_risk(request: RiskAnalysisRequest):
    try:
        from app.config import settings
        if settings.LLM_API_KEY:
            return analyze_risk_with_llm(request.opportunity)
        else:
            return analyze_risk_deterministic(request.opportunity)
    except Exception as e:
        print(f"Risk analysis error: {e}")
        return analyze_risk_deterministic(request.opportunity)