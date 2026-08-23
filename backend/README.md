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

### Analysis
- `POST /api/analyze` - Main analysis endpoint (text input for Phase 1)
- `GET /api/analyze/history` - User's analysis history
- `GET /api/analyze/:id` - Get specific report

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/user-profile` - Update user profile (skills, education, etc.)
- `GET /api/auth/user-profile` - Get user profile

### Suitability
- `POST /api/analyze/suitability` - Analyze user-opportunity fit

### Skill Gap
- `POST /api/analyze/skill-gap` - Identify missing skills

### Alternatives
- `POST /api/find/alternatives` - Find alternative opportunities

### Payment Verification
- `POST /api/verify/payment` - Verify payment claims

### Website Analysis
- `POST /api/website/analyze` - Analyze website credibility

### Company Verification
- `POST /api/company/verify` - Verify company legitimacy

### Reports
- `GET /api/report/:id` - Get report by ID
- `GET /api/report` - Get user's reports (paginated)

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

## Phase 1 Status

✅ Core analysis pipeline with risk engine
✅ Text input analysis
✅ Rule-based risk detection (payment, urgency, sensitive info, unrealistic compensation, guaranteed placement, identity mismatch)
✅ Explainable risk indicators with evidence
✅ Risk scoring (0-100) with levels (LOW to VERY_HIGH)
✅ Recommendation engine (SAFE_TO_EXPLORE, CAUTION, VERIFY_FIRST, AVOID_PAYMENT, INSUFFICIENT_EVIDENCE)
✅ MongoDB persistence
✅ JWT authentication (optional for analysis)
✅ Rate limiting
✅ Input validation

## Next Phases

- Screenshot/PDF/URL input support
- OCR integration
- Website credibility analysis
- Company verification
- Payment verification against official sources
- Suitability analysis with user profiles
- Skill gap analysis
- Curriculum extraction
- Alternative discovery
- Cross-source verification