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

class WebsiteAnalysisRequest(BaseModel):
    opportunity: Opportunity

class WebsiteAnalysisResponse(BaseModel):
    hasHttps: bool
    domainAge: Optional[int] = None
    hasPrivacyPolicy: bool
    hasTerms: bool
    hasRefundPolicy: bool
    hasContactInfo: bool
    domainStructure: Optional[str] = None
    score: Optional[int] = None
    evidence: List[Dict[str, Any]] = []

@router.post("/website", response_model=WebsiteAnalysisResponse)
async def analyze_website(request: WebsiteAnalysisRequest):
    opportunity = request.opportunity
    urls = opportunity.urls or []
    website = (opportunity.organization or {}).get("website", "")
    
    target_url = website or (urls[0] if urls else None)
    
    if not target_url:
        return WebsiteAnalysisResponse(
            hasHttps=False,
            hasPrivacyPolicy=False,
            hasTerms=False,
            hasRefundPolicy=False,
            hasContactInfo=False,
            score=0,
            evidence=[{"claim": "Website URL", "status": "NOT_FOUND", "details": "No website URL provided"}]
        )
    
    import re
    has_https = target_url.startswith("https://")
    domain = target_url.replace("https://", "").replace("http://", "").split("/")[0]
    
    evidence = [
        {"claim": "HTTPS", "status": "VERIFIED" if has_https else "CONTRADICTED", "details": f"URL uses {'HTTPS' if has_https else 'HTTP'}"},
        {"claim": "Domain structure", "status": "VERIFIED", "details": f"Domain: {domain}"},
    ]
    
    score = 50
    if has_https:
        score += 20
    
    return WebsiteAnalysisResponse(
        hasHttps=has_https,
        hasPrivacyPolicy=False,
        hasTerms=False,
        hasRefundPolicy=False,
        hasContactInfo=False,
        domainStructure=domain,
        score=min(score, 100),
        evidence=evidence
    )