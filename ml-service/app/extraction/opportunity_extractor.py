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

class ExtractedOpportunity(BaseModel):
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

class ExtractRequest(BaseModel):
    text: str

class ExtractResponse(BaseModel):
    opportunity: ExtractedOpportunity

@router.post("/opportunity", response_model=ExtractResponse)
async def extract_opportunity(request: ExtractRequest):
    text = request.text
    lower_text = text.lower()
    
    import re
    email_regex = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    url_regex = r"https?://[^\s]+"
    phone_regex = r"[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}"
    
    emails = re.findall(email_regex, text)
    urls = re.findall(url_regex, text)
    phones = re.findall(phone_regex, text)
    
    org_name = "Unknown Organization"
    if emails:
        org_name = emails[0].split("@")[1].split(".")[0].title()
    
    role = "Not specified"
    role_keywords = ["intern", "developer", "engineer", "analyst", "manager", "trainee", "associate"]
    for keyword in role_keywords:
        if keyword in lower_text:
            idx = lower_text.index(keyword)
            start = max(0, idx - 20)
            end = min(len(text), idx + len(keyword) + 20)
            role = text[start:end].strip()
            break
    
    fees = {}
    fee_patterns = {
        "registration": ["registration fee", "registration amount", "register"],
        "processing": ["processing fee", "processing charge"],
        "securityDeposit": ["security deposit", "deposit"],
        "placement": ["placement fee", "placement charge"],
        "certificate": ["certificate fee", "certification fee"],
        "training": ["training fee", "course fee", "program fee"],
    }
    
    for key, patterns in fee_patterns.items():
        for pattern in patterns:
            if pattern in lower_text:
                match = re.search(rf"{pattern}[^₹$]*([₹$]\s?[\d,]+)", text, re.IGNORECASE)
                if match:
                    fees[key] = int(match.group(1).replace("₹", "").replace("$", "").replace(",", ""))
                    break
    
    stipend = None
    stipend_match = re.search(r"(?:stipend|salary|pay|compensation)[:\s]*[₹$]\s?([\d,]+)", text, re.IGNORECASE)
    if stipend_match:
        stipend = {
            "amount": int(stipend_match.group(1).replace(",", "")),
            "currency": "INR",
            "period": "month",
        }
    
    return ExtractResponse(opportunity=ExtractedOpportunity(
        type="OTHER",
        organization={"name": org_name, "email": emails[0] if emails else None, "website": urls[0] if urls else None},
        role=role,
        description=text[:500],
        fees=fees if fees else None,
        stipend=stipend,
        contacts=[{"email": e, "phone": phones[i] if i < len(phones) else None} for i, e in enumerate(emails)],
        urls=urls,
        skills=[],
        eligibility=[],
        claimedBenefits=[],
        deadlines=[],
        claims=[],
        rawText=text,
    ))

@router.post("/curriculum")
async def extract_curriculum(request: ExtractRequest):
    return {"message": "Curriculum extraction not yet implemented", "status": "NOT_IMPLEMENTED"}