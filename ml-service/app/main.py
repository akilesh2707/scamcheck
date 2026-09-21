from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.risk.risk_engine import router as risk_router
from app.credibility.website_analyzer import router as website_router
from app.credibility.company_verifier import router as company_router
from app.payment.payment_verifier import router as payment_router
from app.extraction.opportunity_extractor import router as extraction_router
from app.extraction.pdf_service import router as pdf_router
from app.suitability.suitability_analyzer import router as suitability_router
from app.suitability.skill_gap_analyzer import router as skill_gap_router
from app.alternatives.alternative_finder import router as alternatives_router
from app.evidence.evidence_aggregator import router as evidence_router
from app.recommendation.recommendation_engine import router as recommendation_router
from app.ocr.ocr_service import router as ocr_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting ML Service...")
    yield
    # Shutdown
    print("Shutting down ML Service...")

app = FastAPI(
    title="ScamCheck ML Service",
    description="AI/NLP/OCR/Risk Analysis services for ScamCheck platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import time
import logging
import uuid
from starlette.requests import Request

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] [%(name)s] %(message)s")
logger = logging.getLogger("ml-service")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = request.headers.get("x-request-id", str(uuid.uuid4()))
    start_time = time.time()

    # Log start without sensitive data
    logger.info(f"ReqID:{request_id} Started {request.method} {request.url.path}")

    response = await call_next(request)

    process_time = time.time() - start_time
    logger.info(f"ReqID:{request_id} Completed {response.status_code} in {process_time:.3f}s")

    response.headers["X-Request-ID"] = request_id
    return response

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-service"}

# Include routers
app.include_router(risk_router, prefix="/risk", tags=["risk"])
app.include_router(website_router, prefix="/credibility", tags=["credibility"])
app.include_router(company_router, prefix="/credibility", tags=["credibility"])
app.include_router(payment_router, prefix="/payment", tags=["payment"])
app.include_router(extraction_router, prefix="/extract", tags=["extraction"])
app.include_router(pdf_router, prefix="/extract/pdf", tags=["extraction"])
app.include_router(suitability_router, prefix="/suitability", tags=["suitability"])
app.include_router(skill_gap_router, prefix="/skill-gap", tags=["skill-gap"])
app.include_router(alternatives_router, prefix="/alternatives", tags=["alternatives"])
app.include_router(evidence_router, prefix="/evidence", tags=["evidence"])
app.include_router(recommendation_router, prefix="/recommendation", tags=["recommendation"])
app.include_router(ocr_router, prefix="/ocr", tags=["ocr"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)