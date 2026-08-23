from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from fastapi import APIRouter

router = APIRouter()

class RecommendationRequest(BaseModel):
    riskScore: int
    riskLevel: str
    riskIndicators: List[Dict[str, Any]] = []
    credibilityScore: Optional[int] = None
    paymentRequired: Optional[bool] = None
    paymentStatus: Optional[str] = None
    suitabilityScore: Optional[int] = None

class RecommendationResponse(BaseModel):
    decision: str
    reasons: List[str]
    nextSteps: List[str]

@router.post("/generate", response_model=RecommendationResponse)
async def generate_recommendation(request: RecommendationRequest):
    reasons = []
    next_steps = []
    
    if request.riskLevel in ["VERY_HIGH", "HIGH"]:
        reasons.append("Multiple high-risk indicators detected")
        next_steps.append("Do not proceed without thorough independent verification")
    
    if request.paymentRequired and request.paymentStatus == "CONTRADICTED":
        reasons.append("Payment information contradicts official sources")
        next_steps.append("Do not make the requested payment")
    
    if request.paymentRequired and request.paymentStatus == "UNKNOWN":
        reasons.append("Upfront payment requested but could not be independently verified")
        next_steps.append("Verify payment requirements through official channels")
    
    urgency_detected = any(i.get("code") == "URGENCY_PRESSURE" for i in request.riskIndicators)
    if urgency_detected:
        reasons.append("Urgency pressure tactics detected")
        next_steps.append("Take time to research independently; legitimate opportunities rarely require immediate decisions")
    
    sensitive_detected = any(i.get("code") == "SENSITIVE_INFO_REQUEST" for i in request.riskIndicators)
    if sensitive_detected:
        reasons.append("Request for sensitive personal/financial information")
        next_steps.append("Never share OTP, banking credentials, or unnecessary identity documents")
    
    if request.credibilityScore is not None and request.credibilityScore < 40:
        reasons.append("Website credibility concerns")
        next_steps.append("Verify the organization through its official website and contact channels")
    
    if not reasons:
        if request.riskLevel == "LOW" and request.credibilityScore is not None and request.credibilityScore > 70:
            return RecommendationResponse(
                decision="SAFE_TO_EXPLORE",
                reasons=["Low risk indicators", "Credible website and organization"],
                nextSteps=["Proceed with standard due diligence"]
            )
        return RecommendationResponse(
            decision="VERIFY_FIRST",
            reasons=["Some concerns identified but no critical red flags"],
            nextSteps=["Verify organization details independently", "Research reviews and testimonials"]
        )
    
    if request.riskLevel == "VERY_HIGH" or (request.paymentRequired and request.paymentStatus == "CONTRADICTED"):
        return RecommendationResponse(
            decision="AVOID_PAYMENT",
            reasons=reasons,
            nextSteps=next_steps
        )
    
    return RecommendationResponse(
        decision="CAUTION",
        reasons=reasons,
        nextSteps=next_steps
    )