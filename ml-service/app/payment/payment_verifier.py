from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from fastapi import APIRouter
from app.utils.llm import call_llm, is_negated
import re

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

def verify_payment_deterministic(request: PaymentVerifyRequest) -> PaymentVerifyResponse:
    opportunity = request.opportunity
    text = (opportunity.rawText or "").lower()
    
    # We re-extract fees here to check for negations robustly
    fee_patterns = ["registration fee", "processing fee", "security deposit", "placement fee", "certificate fee", "training fee", "course fee"]
    
    fee_requested = False
    fee_negated = False
    total_amount = 0
    
    for pattern in fee_patterns:
        if pattern in text:
            if is_negated(text, pattern) or is_negated(text, "fee"):
                fee_negated = True
            else:
                fee_requested = True
    if fee_requested:
        match = re.search(r"([₹$]\s?[\d,]+)", text, re.IGNORECASE)
        if match:
            try:
                amt = int(match.group(1).replace("₹", "").replace("$", "").replace(",", ""))
                total_amount = amt
            except:
                pass

    evidence = []
    
    if fee_requested:
        evidence.append({
            "claim": "Payment requirement detected in text",
            "status": "OBSERVED",
            "details": f"Amount detected: {total_amount}"
        })
        status = "NEEDS_VERIFICATION"
        required = True
    elif fee_negated:
        evidence.append({
            "claim": "Payment explicitly negated in text",
            "status": "OBSERVED",
            "details": "The text states that no fee is required."
        })
        status = "NEGATED"
        required = False
    else:
        evidence.append({
            "claim": "Payment requirement",
            "status": "NOT_FOUND",
            "details": "No payment mentioned in opportunity"
        })
        status = "NOT_FOUND"
        required = False

    return PaymentVerifyResponse(
        required=required,
        amount=total_amount if fee_requested else None,
        status=status,
        confidence=0.8 if (fee_requested or fee_negated) else 0.5,
        evidence=evidence
    )

def verify_payment_with_llm(request: PaymentVerifyRequest) -> PaymentVerifyResponse:
    text = request.opportunity.rawText or ""
    system_prompt = """You are an expert at identifying if an opportunity requires payment.
    Read the text and determine if a fee/payment is genuinely requested, explicitly negated (e.g. 'no fee is required'), or not mentioned.
    Return JSON:
    {
      "required": boolean,
      "amount": number (or null),
      "status": "NEEDS_VERIFICATION" (if requested), "NEGATED" (if explicitly no fee), "NOT_FOUND" (if not mentioned),
      "confidence": number (0.0 to 1.0),
      "evidence_claim": "string",
      "evidence_details": "string"
    }
    Note: A requested payment is NEVER 'VERIFIED' unless cross-referenced. Just mark it 'NEEDS_VERIFICATION' and 'OBSERVED'.
    """
    
    try:
        data = call_llm(system_prompt, text)
        status = data.get("status", "NOT_FOUND")
        
        # Protect against invalid statuses
        if status not in ["NEEDS_VERIFICATION", "NEGATED", "NOT_FOUND", "UNCERTAIN"]:
            status = "UNCERTAIN"
            
        evidence = [{
            "claim": data.get("evidence_claim", "Payment analysis"),
            "status": "OBSERVED" if status in ["NEEDS_VERIFICATION", "NEGATED"] else "NOT_FOUND",
            "details": data.get("evidence_details", "")
        }]
        
        return PaymentVerifyResponse(
            required=data.get("required", False),
            amount=data.get("amount"),
            status=status,
            confidence=data.get("confidence", 0.5),
            evidence=evidence
        )
    except Exception as e:
        print(f"LLM payment verification failed: {e}")
        return verify_payment_deterministic(request)


@router.post("/verify", response_model=PaymentVerifyResponse)
async def verify_payment(request: PaymentVerifyRequest):
    try:
        from app.config import settings
        if settings.LLM_API_KEY:
            return verify_payment_with_llm(request)
        else:
            return verify_payment_deterministic(request)
    except Exception as e:
        print(f"Payment verification error: {e}")
        return verify_payment_deterministic(request)