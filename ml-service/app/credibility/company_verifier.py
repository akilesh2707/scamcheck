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

class CompanyVerificationRequest(BaseModel):
    opportunity: Opportunity

class CompanyVerificationResponse(BaseModel):
    organizationName: Optional[str] = None
    emailDomainMatch: bool
    applicationDomainMatch: bool
    contactConsistency: bool
    score: Optional[int] = None
    evidence: List[Dict[str, Any]] = []

@router.post("/company", response_model=CompanyVerificationResponse)
async def verify_company(request: CompanyVerificationRequest):
    opportunity = request.opportunity
    org = opportunity.organization or {}

    org_name = org.get("name")
    org_email = org.get("email", "")
    org_website = org.get("website", "")

    email_domain = org_email.split("@")[-1] if "@" in org_email else ""
    website_domain = org_website.replace("https://", "").replace("http://", "").split("/")[0] if org_website else ""

    common_domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"]

    email_domain_match = False
    if email_domain and website_domain:
        email_domain_match = website_domain in email_domain or email_domain in website_domain
    elif email_domain in common_domains:
        email_domain_match = False

    application_domain_match = False
    urls = opportunity.urls or []
    for url in urls:
        url_domain = url.replace("https://", "").replace("http://", "").split("/")[0]
        if website_domain and (website_domain in url_domain or url_domain in website_domain):
            application_domain_match = True
            break

    contact_consistency = True
    contacts = opportunity.contacts or []
    if contacts and org_email:
        contact_emails = [c.get("email", "") for c in contacts if c.get("email")]
        if contact_emails and org_email not in contact_emails:
            contact_consistency = False

    evidence = [
        {"claim": "Organization name", "status": "SUPPORTED" if org_name else "NOT_VERIFIED", "details": org_name or "Not provided"},
        {"claim": "Email domain match", "status": "SUPPORTED" if email_domain_match else "CONTRADICTED", "details": f"Email: {email_domain}, Website: {website_domain}"},
        {"claim": "Application domain match", "status": "SUPPORTED" if application_domain_match else "NOT_VERIFIED", "details": f"Checked {len(urls)} URLs"},
        {"claim": "Contact consistency", "status": "SUPPORTED" if contact_consistency else "CONTRADICTED", "details": f"Organization email {'matches' if contact_consistency else 'does not match'} contact emails"},
    ]

    score = 50
    if email_domain_match:
        score += 25
    if application_domain_match:
        score += 15
    if contact_consistency:
        score += 10

    return CompanyVerificationResponse(
        organizationName=org_name,
        emailDomainMatch=email_domain_match,
        applicationDomainMatch=application_domain_match,
        contactConsistency=contact_consistency,
        score=min(score, 100),
        evidence=evidence
    )