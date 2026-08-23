from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from fastapi import APIRouter
import requests
from bs4 import BeautifulSoup
import socket
from urllib.parse import urlparse

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

def is_safe_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ["http", "https"]:
            return False
            
        ip = socket.gethostbyname(parsed.hostname)
        # Block private and loopback IPs
        if ip.startswith("127.") or ip.startswith("10.") or ip.startswith("192.168.") or ip.startswith("172."):
            # Note: 172. is 172.16.0.0 to 172.31.255.255, this is a simple check
            return False
            
        if ip == "0.0.0.0" or "localhost" in parsed.hostname.lower():
            return False
            
        return True
    except:
        return False

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
        
    has_https = target_url.startswith("https://")
    parsed = urlparse(target_url)
    domain = parsed.hostname or ""
    
    evidence = [
        {"claim": "HTTPS Check", "status": "OBSERVED" if has_https else "CONTRADICTED", "details": f"URL uses {'HTTPS' if has_https else 'HTTP'}"},
        {"claim": "Domain extracted", "status": "OBSERVED", "details": f"Domain: {domain}"},
    ]
    
    has_privacy = False
    has_terms = False
    has_contact = False
    page_accessible = False
    
    if is_safe_url(target_url):
        try:
            # We enforce a timeout and disallow too many redirects
            headers = {"User-Agent": "ScamCheck-Bot/1.0"}
            resp = requests.get(target_url, headers=headers, timeout=5.0, allow_redirects=True)
            if resp.status_code == 200:
                page_accessible = True
                evidence.append({"claim": "Page Accessibility", "status": "VERIFIED", "details": "Homepage returned HTTP 200"})
                
                # Parse to find basic links
                soup = BeautifulSoup(resp.text, 'html.parser')
                links = soup.find_all('a', href=True)
                for a in links:
                    text = a.text.lower()
                    href = a['href'].lower()
                    if "privacy" in text or "privacy" in href:
                        has_privacy = True
                    if "terms" in text or "terms" in href:
                        has_terms = True
                    if "contact" in text or "contact" in href:
                        has_contact = True
            else:
                evidence.append({"claim": "Page Accessibility", "status": "UNCERTAIN", "details": f"Homepage returned HTTP {resp.status_code}"})
        except Exception as e:
            evidence.append({"claim": "Page Accessibility", "status": "CONTRADICTED", "details": f"Failed to fetch homepage: {str(e)}"})
    else:
        evidence.append({"claim": "Page Accessibility", "status": "CONTRADICTED", "details": "URL is unsafe or internal"})

    if has_privacy:
        evidence.append({"claim": "Privacy Policy Link", "status": "OBSERVED", "details": "Found a link mentioning privacy on homepage."})
    if has_terms:
        evidence.append({"claim": "Terms Link", "status": "OBSERVED", "details": "Found a link mentioning terms on homepage."})

    score = 50
    if has_https:
        score += 10
    if page_accessible:
        score += 20
    if has_privacy and has_terms:
        score += 20
        
    return WebsiteAnalysisResponse(
        hasHttps=has_https,
        hasPrivacyPolicy=has_privacy,
        hasTerms=has_terms,
        hasRefundPolicy=False,
        hasContactInfo=has_contact,
        domainStructure=domain,
        score=min(score, 100),
        evidence=evidence
    )