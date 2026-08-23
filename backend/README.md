# ScamCheck Backend

Backend API for the ScamCheck platform - a scam detection and analysis service for job/internship/course opportunities.

## Architecture

- **Node.js + Express + TypeScript** - Main API orchestration layer
- **Python FastAPI** - AI/NLP/OCR/Risk analysis microservice
- **MongoDB** - Data persistence
- **Redis/BullMQ** - Async job processing (where needed)

## Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app factory
│   ├── server.ts              # Entry point
│   ├── config/                # Configuration
│   ├── routes/                # API routes
│   ├── controllers/           # Request handlers
│   ├── services/              # Business logic
│   ├── models/                # Mongoose models
│   ├── middleware/            # Express middleware
│   ├── validators/            # Zod validation schemas
│   ├── types/                 # TypeScript interfaces
│   └── utils/                 # Utilities
├── package.json
├── tsconfig.json
└── .env.example
```

## API Endpoints

### 1. Health Check
**Endpoint**: `GET /api/health`
**Description**: Basic server health check that doesn't depend on DB/Redis.
**Request**: None
**Success Response** (200):
```json
{
  "success": true,
  "service": "scamcheck-backend",
  "status": "healthy"
}
```
**Auth**: None

### 2. Opportunity Analysis (Main Flow)
**Endpoint**: `POST /api/analyze`
**Description**: Submits an opportunity (text or url) for full ScamCheck analysis.
**Request**:
```json
{
  "inputType": "text" | "url",
  "text": "Job description here...", // Required if inputType=text
  "url": "https://...",            // Required if inputType=url
  "userProfile": {}                // Optional
}
```
**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "report-uuid",
    "createdAt": "2024-...",
    "opportunity": { ... },
    "risk": {
      "score": 82,
      "level": "HIGH",
      "indicators": []
    },
    "credibility": {
      "score": 61,
      "website": { ... },
      "company": { ... },
      "evidence": []
    },
    "payment": {
      "required": true,
      "status": "NOT_FOUND",
      "confidence": 0.5,
      "amount": 500,
      "evidence": []
    },
    "suitability": { ... },
    "alternatives": [],
    "value": { ... },
    "recommendation": {
      "decision": "CAUTION",
      "reasons": [],
      "nextSteps": []
    }
  }
}
```
**Error Response** (400 - Validation):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": []
  }
}
```
**Auth**: Optional

### 3. Get Analysis Report
**Endpoint**: `GET /api/analyze/:id`
**Description**: Fetch an existing report by ID.
**Request**: None (Path param `:id`)
**Success Response** (200): Same as `POST /api/analyze` data object.
**Error Response** (404):
```json
{
  "success": false,
  "error": { "code": "NOT_FOUND", "message": "Report not found" }
}
```
**Auth**: Optional

### 4. Get Analysis History
**Endpoint**: `GET /api/analyze/history`
**Description**: Get paginated history of reports for the authenticated user.
**Request**: `?page=1&limit=20` (Query params)
**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "reports": [...],
    "total": 5,
    "page": 1,
    "totalPages": 1
  }
}
```
**Auth**: Required (Bearer JWT)

### Other Endpoints
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/analyze/suitability` (Auth Optional)
- `POST /api/analyze/skill-gap` (Auth Optional)
- `POST /api/find/alternatives` (Auth Optional)
- `POST /api/verify/payment` (Auth Optional)
- `POST /api/website/analyze` (Auth Optional)
- `POST /api/company/verify` (Auth Optional)

## Development

### Prerequisites
- Node.js 18+
- MongoDB 6+
- Redis 7+
- Python 3.10+ (for ML service)

### Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Copy environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB and Redis

4. Run development server:
```bash
npm run dev
```

### ML Service Setup

```bash
cd ml-service
pip install -r requirements.txt
python -m app.main
```

## Environment Variables

See `.env.example` for all required variables.

## Testing

```bash
# Backend tests
cd backend
npm test

# ML service tests
cd ml-service
pytest
```

## Phase 1 Status (ScamCheck MVP)

✅ Core analysis pipeline with hybrid LLM/deterministic risk engine
✅ Text and URL input analysis (with SSRF protection & safe fetching)
✅ Context-aware risk detection (payment, urgency, sensitive info, unrealistic compensation, guaranteed placement, identity mismatch)
✅ Deterministic negation window handling (reduces false positives)
✅ Explainable risk indicators with evidence states (OBSERVED, VERIFIED, CONTRADICTED, etc.)
✅ Risk scoring (0-100) with levels (LOW to VERY_HIGH)
✅ Payment verification with negation handling
✅ Real Website credibility analysis (HTTP/HTTPS, Accessibility, Policy checks)
✅ Recommendation engine (SAFE_TO_EXPLORE, CAUTION, VERIFY_FIRST, AVOID_PAYMENT, INSUFFICIENT_EVIDENCE)
✅ MongoDB persistence
✅ JWT authentication (optional for analysis)
✅ Rate limiting
✅ Input validation

## Next Phases

- Screenshot/PDF input support
- OCR integration
- Company verification via external registries
- Suitability analysis with user profiles
- Skill gap analysis
- Curriculum extraction
- Alternative discovery
- Cross-source verification