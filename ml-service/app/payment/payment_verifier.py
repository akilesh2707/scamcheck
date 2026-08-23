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

class PaymentVerifyRequest(BaseModel):
    opportunity: Opportunity
    claimedAmount: Optional[float] = None
    claimedPurpose: Optional[str] = None

class PaymentVerifyResponse(BaseModel):
    required: Optional[bool] = None
    amount: Optional[float] = None
    status: str
    confidence: float
    evidence: List[Dict[str, Any]] = []

@router.post("/verify", response_model=PaymentVerifyResponse)
async def verify_payment(request: PaymentVerifyRequest):
    opportunity = request.opportunity
    fees = opportunity.fees or {}
    
    has_fees = any(v > 0 for v in fees.values() if isinstance(v, (int, float)))
    total_fees = sum(v for v in fees.values() if isinstance(v, (int, float))) if has_fees else 0
    
    evidence = []
    if has_fees:
        evidence.append({
            "claim": "Payment requirement detected",
            "status": "VERIFIED",
            "details": f"Fees: {fees}"
        })
    else:
        evidence.append({
            "claim": "Payment requirement",
            "status": "NOT_FOUND",
            "details": "No payment mentioned in opportunity"
        })
    
    claimed_amount = request.claimedAmount
    if claimed_amount and has_fees:
        if abs(claimed_amount - total_fees) < 1:
            evidence.append({
                "claim": "Claimed amount matches detected fees",
                "status": "VERIFIED",
                "details": f"Claimed: {claimed_amount}, Detected: {total_fees}"
            })
        else:
            evidence.append({
                "claim": "Claimed amount contradicts detected fees",
                "status": "CONTRADICTED",
                "details": f"Claimed: {claimed_amount}, Detected: {total_fees}"
            })
    
    status = "NOT_FOUND"
    if has_fees:
        if claimed_amount and abs(claimed_amount - total_fees) >= 1:
            status = "CONTRADICTED"
        else:
            status = "VERIFIED"
    
    return PaymentVerifyResponse(
        required=has_fees,
        amount=total_fees if has_fees else None,
        status=status,
        confidence=0.7 if has_fees else 0.5,
        evidence=evidence
    )