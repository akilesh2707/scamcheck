# ScamCheck ML Service

Python FastAPI microservice for AI/NLP/OCR/Risk analysis.

## Project Structure

```
ml-service/
├── app/
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Configuration
│   ├── extraction/             # Text/entity extraction
│   │   ├── opportunity_extractor.py
│   │   └── curriculum_extractor.py
│   ├── ocr/                    # OCR processing
│   │   └── ocr_service.py
│   ├── risk/                   # Risk analysis
│   │   ├── rules.py
│   │   ├── risk_engine.py
│   │   └── indicators.py
│   ├── credibility/            # Credibility verification
│   │   ├── website_analyzer.py
│   │   └── company_verifier.py
│   ├── payment/                # Payment verification
│   │   └── payment_verifier.py
│   ├── suitability/            # User-opportunity fit
│   │   ├── suitability_analyzer.py
│   │   └── skill_gap_analyzer.py
│   ├── content_match/          # Content comparison
│   │   └── content_comparison.py
│   ├── alternatives/           # Alternative discovery
│   │   └── alternative_finder.py
│   ├── evidence/               # Evidence aggregation
│   │   └── evidence_aggregator.py
│   └── recommendation/         # Final recommendations
│       └── recommendation_engine.py
├── requirements.txt
└── README.md
```

## API Endpoints

### Risk Analysis
- `POST /risk/analyze` - Analyze opportunity for risk indicators

### Extraction
- `POST /extract/opportunity` - Extract structured opportunity from text
- `POST /extract/curriculum` - Extract curriculum from course text

### Credibility
- `POST /credibility/website` - Analyze website credibility
- `POST /credibility/company` - Verify company legitimacy

### Payment
- `POST /payment/verify` - Verify payment claims

### Suitability
- `POST /suitability/analyze` - Analyze user-opportunity fit
- `POST /skill-gap/analyze` - Identify skill gaps

### Alternatives
- `POST /alternatives/find` - Find alternative opportunities

### Evidence
- `POST /evidence/aggregate` - Aggregate evidence from multiple sources

### Recommendation
- `POST /recommendation/generate` - Generate final recommendation

### OCR
- `POST /ocr` - Extract text from images/PDFs

## Development

### Setup

```bash
cd ml-service
pip install -r requirements.txt
python -m app.main
```

### Environment Variables

Create `.env` file:
```env
REDIS_URL=redis://localhost:6379
LLM_API_KEY=your_llm_key
EMBEDDING_API_KEY=your_embedding_key
```

## Phase 1 Status

✅ Risk engine with deterministic rule-based analysis
✅ Payment request detection
✅ Urgency pressure detection
✅ Sensitive information request detection
✅ Unrealistic compensation detection
✅ Guaranteed placement detection
✅ Identity mismatch detection
✅ Suspicious claims detection
✅ Explainable indicators with evidence status
✅ Configurable risk weights
✅ Opportunity extraction from text
✅ Basic website analysis (HTTPS, domain)
✅ Basic company verification (email/domain matching)
✅ Payment verification
✅ Skill gap analysis
✅ Recommendation engine

## Testing

```bash
pytest
```