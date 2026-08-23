from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
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
    "limited time", "offer ends", "closing soon", "urgent"
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

def analyze_opportunity_risk(opportunity: Opportunity) -> RiskAnalysisResponse:
    indicators = []
    total_score = 0
    text = (opportunity.rawText or "").lower()
    
    org_name = (opportunity.organization or {}).get("name", "").lower()
    org_email = (opportunity.organization or {}).get("email", "").lower()
    org_website = (opportunity.organization or {}).get("website", "").lower()
    
    fees = opportunity.fees or {}
    has_fees = any(v > 0 for v in fees.values() if isinstance(v, (int, float)))
    
    if has_fees:
        indicators.append(RiskIndicator(
            code="PAYMENT_REQUEST",
            title="Payment requested",
            explanation="The opportunity requests an upfront payment",
            points=RISK_WEIGHTS["PAYMENT_REQUEST"],
            evidence="VERIFIED",
            details=f"Fees found: {fees}"
        ))
        total_score += RISK_WEIGHTS["PAYMENT_REQUEST"]
    
    if any(pattern in text for pattern in URGENCY_PATTERNS):
        indicators.append(RiskIndicator(
            code="URGENCY_PRESSURE",
            title="Urgency pressure",
            explanation="The opportunity uses urgency language to pressure quick decisions",
            points=RISK_WEIGHTS["URGENCY_PRESSURE"],
            evidence="VERIFIED",
        ))
        total_score += RISK_WEIGHTS["URGENCY_PRESSURE"]
    
    if any(pattern in text for pattern in SENSITIVE_PATTERNS):
        indicators.append(RiskIndicator(
            code="SENSITIVE_INFO_REQUEST",
            title="Sensitive information requested",
            explanation="The opportunity requests sensitive personal or financial information",
            points=RISK_WEIGHTS["SENSITIVE_INFO_REQUEST"],
            evidence="VERIFIED",
        ))
        total_score += RISK_WEIGHTS["SENSITIVE_INFO_REQUEST"]
    
    stipend = opportunity.stipend or {}
    if stipend.get("amount", 0) > 100000:
        indicators.append(RiskIndicator(
            code="UNREALISTIC_COMPENSATION",
            title="Unrealistic compensation",
            explanation="The claimed compensation is unusually high for the role type",
            points=RISK_WEIGHTS["UNREALISTIC_COMPENSATION"],
            evidence="LIKELY",
        ))
        total_score += RISK_WEIGHTS["UNREALISTIC_COMPENSATION"]
    
    if any(pattern in text for pattern in GUARANTEE_PATTERNS):
        indicators.append(RiskIndicator(
            code="GUARANTEED_PLACEMENT",
            title="Guaranteed placement claim",
            explanation="The opportunity makes unrealistic guarantees about job placement",
            points=RISK_WEIGHTS["GUARANTEED_PLACEMENT"],
            evidence="VERIFIED",
        ))
        total_score += RISK_WEIGHTS["GUARANTEED_PLACEMENT"]
    
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
                evidence="LIKELY",
            ))
            total_score += RISK_WEIGHTS["IDENTITY_MISMATCH"]
    
    if any(pattern in text for pattern in SUSPICIOUS_CLAIMS):
        indicators.append(RiskIndicator(
            code="SUSPICIOUS_CLAIMS",
            title="Suspicious claims",
            explanation="The opportunity makes claims commonly associated with scams",
            points=RISK_WEIGHTS["SUSPICIOUS_CLAIMS"],
            evidence="LIKELY",
        ))
        total_score += RISK_WEIGHTS["SUSPICIOUS_CLAIMS"]
    
    final_score = min(total_score, 100)
    level = calculate_risk_level(final_score)
    
    return RiskAnalysisResponse(
        score=final_score,
        level=level,
        indicators=indicators,
        weights=RISK_WEIGHTS
    )

@router.post("/analyze", response_model=RiskAnalysisResponse)
async def analyze_risk(request: RiskAnalysisRequest):
    return analyze_opportunity_risk(request.opportunity)