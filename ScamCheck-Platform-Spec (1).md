# ScamCheck — Opportunity Verification & Decision Support Platform
### Consolidated Specification (merged from "Advanced Opportunity Verification" + "Course Content Verification & Smart Alternative Discovery")

---

## 1. Idea Analysis

ScamCheck starts as a scam/risk detector and is being upgraded into a **decision-support platform** for anyone evaluating a job, internship, course, certification, or training offer. The core shift is from a single binary output (*scam / not scam*) to a **multi-dimensional report** that separately answers:

| Question | Dimension |
|---|---|
| Is this dangerous or fraudulent? | **Risk / Safety** |
| Is the organization and website real? | **Credibility** |
| Is the requested payment actually required? | **Payment Verification** |
| Is there a free/cheaper way to get the same outcome? | **Alternative Discovery** |
| Is this right for *this* user? | **Suitability** |
| Is it worth the price relative to what it teaches? | **Value** |

The second document (Course Content Verification) is **not a new pillar** — it is a deep implementation spec for *how* Alternative Discovery and Value scoring should work specifically for courses (curriculum-level comparison instead of title-level comparison). It has been merged into the main spec rather than kept as a parallel feature (see §5, Deduplication).

**Guiding principle across both source docs:** every conclusion must be evidence-tagged (`VERIFIED / LIKELY / UNCERTAIN / CONTRADICTED / NOT FOUND`), nothing is invented (no fake reviews, prices, syllabi, or endorsements), and the absence of one positive signal is never treated as proof of fraud.

---

## 2. Workflow (End-to-End)

```
                     USER SUBMITS OPPORTUNITY
               (text / screenshot / email / URL / offer letter)
                                │
                                ▼
                    INPUT NORMALIZATION LAYER
              (OCR → text cleanup → language/NLP → entity extraction)
                                │
                                ▼
                    STRUCTURED OPPORTUNITY OBJECT
     (org, role, fees, contacts, URLs, claims, deadlines, curriculum*)
                                │
        ┌───────────────┬───────────────┬───────────────┬───────────────┐
        ▼               ▼               ▼               ▼               ▼
   RISK ENGINE   CREDIBILITY ENGINE  PAYMENT ENGINE  SUITABILITY ENGINE  CONTENT ENGINE
   (scam signals) (org+site+msg)     (necessity check) (profile match)  (curriculum, courses only)
        │               │               │               │               │
        └───────────────┴───────┬───────┴───────────────┴───────────────┘
                                 ▼
                    CROSS-SOURCE CONSISTENCY CHECK
        (submitted data vs. official site vs. public listings vs. other sources)
                                 ▼
                    ALTERNATIVE DISCOVERY ENGINE
          (free/cheaper options ranked by content match, not title match)
                                 ▼
                    EVIDENCE AGGREGATOR
        (tags every claim: VERIFIED / LIKELY / UNCERTAIN / CONTRADICTED / NOT FOUND)
                                 ▼
                    SCORING LAYER (kept separate, never combined)
        Risk Score | Credibility Score | Suitability Score | Value Score
                                 ▼
                    RECOMMENDATION ENGINE
   🟢 SAFE TO EXPLORE · 🟡 CAUTION · 🟠 VERIFY FIRST · 🔴 AVOID PAYMENT · ⚫ INSUFFICIENT EVIDENCE
                                 ▼
                    EXPLAINABLE REPORT → USER
```

*(\*curriculum extraction only applies when the submission is a course/certification/bootcamp)*

---

## 3. Segment Breakdown

### Segment A — Input & Extraction
- Accepts text, screenshots (OCR), emails, messages (WhatsApp/Telegram/LinkedIn), offer letters, or a bare URL.
- Extracts a structured **Opportunity Object**: org name, role/course name, skills required vs. promised, duration, all fee types (registration/course/certificate/application/placement/deposit), contacts, URLs, claimed benefits, eligibility, deadline.
- If the input is a course, additionally extracts a **Curriculum Object**: modules, topics, tools, projects, mentorship, format, prerequisites, learning outcomes.
- If curriculum/data is missing, the system states this explicitly rather than guessing.

### Segment B — Risk Engine (existing MVP, preserved)
- Detects scam-pattern signals (urgency language, upfront-payment pressure, impersonation cues, sensitive-info requests).
- Outputs Risk Score + explainable list of triggered signals. This is the **only** module that must keep working standalone if all web-verification modules fail.

### Segment C — Credibility Engine
- **Website Credibility**: HTTPS, domain structure, policy pages (privacy/refund/terms), contact info, consistency between company name / email domain / application URL.
- **Organization Credibility**: does the company appear to exist independently of this one posting (public presence, matched domain/email).
- Explicitly separates "the company is real" from "this specific posting is legitimate" — a real company can still be impersonated.

### Segment D — Payment Verification
- Classifies what the payment is for (registration, exam, deposit, equipment, etc.).
- Cross-checks the claimed amount against the org's official page/public listings.
- Returns status: `VERIFIED / NOT FOUND / CONTRADICTED / UNKNOWN` + confidence %, never labels a payment fraudulent merely because it exists.

### Segment E — Suitability Engine
- Takes a **User Profile** (education, skills, interests, career goal, experience, budget, time, learning mode).
- Produces a Suitability Score broken into Skill Match, Career Match, Experience Match, Eligibility Match, Time Fit, Cost Fit.
- Produces a **Skill Gap** list (have vs. need) with a short prep plan.

### Segment F — Content-Aware Alternative Discovery *(merges Doc 1 §3 + Doc 2 in full)*
- Determines the user's underlying **learning/career objective**, not just the opportunity's title.
- For courses specifically: extracts the alternative's curriculum too, then compares **topic-by-topic and outcome-by-outcome**, producing a `Content Match %` broken into skills/projects/certification/mentorship — always labeled as an *estimated similarity*, never a validated probability.
- Ranks alternatives by relevance → credibility → learning outcomes → practical experience → suitability → **price last**.
- Shows a side-by-side comparison table (what's gained/lost, potential savings).

### Segment G — Cross-Source Consistency Engine
- Compares submitted data against the official website, official course/internship page, and other public listings.
- Flags mismatches (price, role, duration, contact info) with the exact delta (e.g., "official ₹1,999 vs. submitted ₹5,000").

### Segment H — Evidence Aggregator
- Every non-trivial claim anywhere in the report is tagged: `VERIFIED / LIKELY / UNCERTAIN / CONTRADICTED / NOT FOUND`.
- If web verification is unavailable, the report says so plainly rather than silently degrading.

### Segment I — Scoring Layer
- Four independent scores, deliberately **not merged into one number**: Risk, Credibility, Suitability, Value (course-specific value score folds in price-vs-content-match).

### Segment J — Recommendation Engine
- Produces one of a fixed set of verdicts with a "why" list and concrete next steps (e.g., "contact via official site," "don't pay until confirmed," "don't share OTP/banking details").

---

## 4. Structure (Modules & Endpoints)

```
services/
├── inputNormalization/        # OCR, text cleanup, language detection
├── opportunityExtractor/      # entity extraction → Opportunity Object
├── curriculumExtractor/       # course-specific extraction → Curriculum Object
├── riskEngine/                # scam-pattern detection (Phase 1 MVP)
├── websiteAnalyzer/           # website credibility scoring
├── companyVerifier/           # org identity + org-vs-opportunity separation
├── paymentVerifier/           # payment necessity + consistency
├── suitabilityAnalyzer/       # profile-vs-opportunity matching
├── skillGapAnalyzer/          # have-vs-need + prep plan
├── contentComparisonEngine/   # curriculum-level alternative matching
├── alternativeFinder/         # free/cheaper legitimate alternative search
├── crossSourceVerifier/       # multi-source consistency checks
├── evidenceAggregator/        # tags every claim with an evidence label
└── recommendationEngine/      # final verdict + next steps
```

**API surface**

```
POST /api/analyze                 # main orchestration endpoint (frontend calls this)
POST /api/analyze/opportunity
POST /api/analyze/curriculum      # course-specific deep extraction
POST /api/verify/payment
POST /api/verify/website
POST /api/verify/company
POST /api/analyze/suitability
POST /api/analyze/skill-gap
POST /api/find/alternatives       # now content-match driven, not title-match
GET  /api/report/:id
```

**Unified response shape** (single contract for both source docs' data):

```json
{
  "opportunity": { "org": "", "role": "", "fees": {}, "curriculum": {} },
  "risk":          { "score": 0, "level": "", "indicators": [] },
  "credibility":   { "org": {}, "website": {}, "evidence": [] },
  "payment":       { "required": true, "amount": 0, "status": "", "confidence": 0 },
  "suitability":   { "score": 0, "breakdown": {}, "skillGap": [] },
  "alternatives":  [ { "name": "", "cost": 0, "contentMatch": 0, "gains": [], "losses": [] } ],
  "value":         { "score": 0, "potentialSaving": 0 },
  "recommendation":{ "decision": "", "reasons": [], "nextSteps": [] },
  "evidenceLabels": { "...claimId": "VERIFIED|LIKELY|UNCERTAIN|CONTRADICTED|NOT_FOUND" }
}
```

---

## 5. Deduplication — What Was Merged and Why

| Overlap found | Resolution |
|---|---|
| Doc 1 §3 "Free/Cheaper Alternative Discovery" **and** Doc 2 (entire document) both cover alternative-finding | Doc 2 is the detailed *implementation* of Doc 1 §3. Merged into one **Segment F: Content-Aware Alternative Discovery**, using Doc 2's curriculum-comparison method as the actual matching logic instead of title matching. |
| Doc 1 §6 "Suitability" career/skill matching **and** Doc 2 §10 "Opportunity Goal Matching" | Both compute user-goal-vs-opportunity fit. Merged so Suitability Engine (Segment E) supplies the profile/goal vector once, and both the Suitability Score and Content Match reuse it — no separate goal-matching module. |
| Doc 1 §16 example JSON response **and** Doc 2's course-specific fields (content match, potential saving) | Combined into one **unified response schema** (§4) instead of two separate response shapes. |
| Doc 1 §7 "Skill Gap" **and** Doc 2's implicit skill comparison inside content matching | Kept skill-gap as one shared module (`skillGapAnalyzer`) called by both the Suitability Engine and the Content Comparison Engine, rather than duplicating skill-diffing logic. |
| Both docs repeat the same accuracy/safety rules (don't invent data, don't treat absence-of-signal as proof, evidence-labeling) | Consolidated into a single **Global Accuracy & Safety Contract** (§8) that every service must obey, instead of restating it per module. |

Net effect: **14 backend services** (not ~18) and **one** orchestration endpoint + supporting endpoints, with no duplicated matching logic.

---

## 6. Suggested Tech Stack

| Layer | Recommendation | Why |
|---|---|---|
| Frontend | **React + TypeScript**, TanStack Query, Tailwind | Matches existing architecture; TS catches schema drift in the report contract; TanStack Query handles async report polling cleanly. |
| Backend API | **Node.js + Express (TypeScript)** | Matches existing stack; thin orchestration layer that fans out to Python services. |
| Extraction / NLP / OCR | **Python microservice** — spaCy or a hosted LLM (e.g., Claude via API) for entity extraction; Tesseract or a cloud OCR API for screenshots | Python has the strongest ecosystem for OCR + NLP; keeping it as a separate service preserves the "OCR/websearch failure shouldn't break core risk analysis" requirement. |
| Curriculum/content comparison | **Embeddings-based similarity** (e.g., sentence-transformers or an LLM embedding endpoint) over extracted syllabus topics, not keyword matching | Needed for genuine topic-level "content match %" rather than superficial title matching. |
| Web verification / cross-source checks | Server-side fetch + parse (Playwright or simple HTTP+HTML parsing) behind a **rate-limited, cached research service** | Website/organization checks need real page fetches; caching avoids re-verifying the same org repeatedly. |
| Database | **MongoDB** (as in original architecture) for opportunity objects/reports; optionally **Postgres** if strict relational integrity between users/profiles/reports is preferred later | Document shape fits the nested Opportunity/Report objects well; Mongo already planned in original architecture. |
| Queue/orchestration | **BullMQ (Redis-backed)** for the multi-service fan-out (risk, credibility, payment, suitability, content-match running in parallel) | Keeps `/api/analyze` responsive; each engine can fail independently without blocking the others (aligns with "modular, no single point of failure" requirement). |
| Auth (for user profile) | **JWT-based auth**, minimal — profile is optional | Only needed if suitability/profile persistence across sessions is required. |
| Hosting | Any container platform (Docker Compose for dev; ECS/Cloud Run for prod) | Keeps services independently deployable, matching the modular architecture. |

---

## 7. The Efficient Solution (Recommended Build Order)

Build **narrow and evidence-safe first**, then widen — do not build all engines in parallel.

1. **Phase 1 (existing MVP, don't touch):** Risk Engine only — text in, risk score + explainable signals out. This must always work even if every other module is down.
2. **Phase 2:** Website Credibility Engine — adds the `websiteAnalyzer` service and its own score, kept separate from Risk.
3. **Phase 3:** Payment Verification — smallest high-value addition; answers "do I actually have to pay this?" without needing the full alternative-discovery machinery.
4. **Phase 4:** User Profile + Suitability Engine + Skill Gap — enables personalization before alternative discovery needs a "goal" to match against.
5. **Phase 5:** Content-Aware Alternative Discovery (the merged Doc 1 + Doc 2 engine) — this is the most expensive module (requires fetching/parsing external curricula), so it comes after the cheaper wins above are shipped.
6. **Phase 6:** Cross-Source Consistency + Evidence Aggregator + Recommendation Engine tie everything together into the final verdict.

**Why this order is efficient:**
- Each phase ships an independently useful feature (fits the "modular, failure-isolated" requirement).
- The most compute/API-cost-heavy module (curriculum-level alternative discovery, needing multiple external fetches + embedding comparisons) is deliberately last, after cheaper signals have already reduced how often it's even needed (e.g., a payment already flagged `CONTRADICTED` in Phase 3 may not need a full alternative search).
- Scores stay separate throughout (Risk / Credibility / Suitability / Value), so no phase requires re-architecting a combined score later.
- The evidence-labeling contract (`VERIFIED/LIKELY/UNCERTAIN/CONTRADICTED/NOT_FOUND`) is applied uniformly from Phase 1 onward, so later phases only add producers of evidence, not a new labeling system.

---

## 8. Global Accuracy & Safety Contract (applies to every module)

- Never label something a scam, a payment unnecessary, or a course low-quality without evidence.
- A Gmail/Outlook sender, HTTPS alone, or domain age alone is never sufficient proof of legitimacy *or* fraud on its own.
- Never invent prices, syllabi, reviews, endorsements, or certificates.
- Two courses/opportunities are never assumed equivalent because their titles are similar — content-level comparison is required.
- Every material claim carries an evidence label; when verification isn't possible, the report says so explicitly ("Unable to independently verify this information") instead of guessing.
- Alternatives are never recommended on price alone — ranking order is relevance → credibility → learning outcomes → practical experience → suitability → price.

---

## 9. Implementation Guide (Efficient Stack, Phase-by-Phase)

This section turns §6 (tech stack) and §7 (build order) into an actual repo you can start coding against.

### 9.1 Repo Layout

```
scamcheck/
├── frontend/                       # React + TypeScript + Tailwind
│   └── src/
│       ├── components/
│       │   ├── ReportCard/         # Risk/Credibility/Suitability/Value tiles
│       │   ├── PaymentPanel/
│       │   ├── AlternativesPanel/
│       │   └── UserProfileForm/
│       ├── hooks/                  # TanStack Query hooks per endpoint
│       └── pages/
│
├── backend/                        # Node.js + Express + TypeScript (orchestrator)
│   └── src/
│       ├── routes/
│       │   ├── analyze.ts          # POST /api/analyze (main entrypoint)
│       │   ├── payment.ts
│       │   ├── website.ts
│       │   ├── company.ts
│       │   ├── suitability.ts
│       │   ├── skillGap.ts
│       │   └── alternatives.ts
│       ├── services/               # thin clients calling the Python microservice
│       ├── queue/                  # BullMQ producers/consumers (Redis)
│       ├── models/                 # MongoDB schemas (Opportunity, Report, UserProfile)
│       └── evidence/               # evidenceAggregator (shared labeling logic)
│
├── ml-service/                     # Python (FastAPI) — extraction, OCR, NLP, embeddings
│   └── app/
│       ├── extraction/             # opportunityExtractor, curriculumExtractor
│       ├── ocr/                    # ocrService
│       ├── risk/                   # riskEngine (Phase 1 — build first)
│       ├── credibility/            # websiteAnalyzer, companyVerifier
│       ├── payment/                # paymentVerifier
│       ├── suitability/            # suitabilityAnalyzer, skillGapAnalyzer
│       ├── content_match/          # contentComparisonEngine (embeddings-based)
│       └── alternatives/           # alternativeFinder, crossSourceVerifier
│
├── docker-compose.yml              # frontend + backend + ml-service + mongo + redis
└── ScamCheck-Platform-Spec.md      # this file — source of truth
```

### 9.2 Minimal Stack per Phase

| Phase | What to stand up | Stack pieces actually needed |
|---|---|---|
| 1 — Risk Engine | `ml-service/app/risk` + `backend/routes/analyze.ts` (risk-only) + a bare frontend report card | FastAPI, Express, React — no Mongo/Redis required yet, can run in-memory |
| 2 — Website Credibility | `ml-service/app/credibility` + server-side fetch/parse | Add Playwright or `requests`+`BeautifulSoup` in ml-service |
| 3 — Payment Verification | `ml-service/app/payment` | Reuses fetch/parse from Phase 2, no new infra |
| 4 — Suitability + Skill Gap | `backend/models/UserProfile.ts`, `ml-service/app/suitability` | Introduce MongoDB here (first time persistence is actually needed) |
| 5 — Content-Aware Alternatives | `ml-service/app/content_match`, `ml-service/app/alternatives` | Add embeddings (sentence-transformers or hosted embedding API) + introduce BullMQ/Redis to parallelize external fetches without blocking `/api/analyze` |
| 6 — Cross-Source + Evidence + Recommendation | `backend/evidence/`, final assembly in `analyze.ts` | No new infra — pure aggregation logic over what Phases 1–5 already produced |

This keeps infrastructure cost in step with actual need: **Mongo isn't introduced until Phase 4, Redis/BullMQ isn't introduced until Phase 5** — Phases 1–3 run as a stateless request/response pipeline.

### 9.3 Suggested First Commands

```bash
# scaffold
mkdir -p scamcheck/{frontend,backend,ml-service}
cd scamcheck

# frontend
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install @tanstack/react-query tailwindcss && cd ..

# backend
mkdir -p backend/src/{routes,services,models,evidence}
cd backend && npm init -y && npm install express typescript ts-node cors && cd ..

# ml-service
mkdir -p ml-service/app/{risk,credibility,payment,extraction,ocr,suitability,content_match,alternatives}
cd ml-service && python3 -m venv venv && source venv/bin/activate && pip install fastapi uvicorn && cd ..
```

### 9.4 Build Order Recap (mapped to this repo)

1. Implement `ml-service/app/risk` → wire into `backend/routes/analyze.ts` → render `ReportCard` (Risk tile only) in frontend. Ship this before touching anything else.
2. Add `ml-service/app/credibility` (website + company) → new tile in `ReportCard`.
3. Add `ml-service/app/payment` → `PaymentPanel` component.
4. Add MongoDB, `UserProfile` model, `ml-service/app/suitability` → `UserProfileForm` + Suitability tile.
5. Add Redis/BullMQ, `ml-service/app/content_match` + `alternatives` → `AlternativesPanel`.
6. Wire `evidence/` aggregator across all prior outputs, finish `recommendationEngine` logic in `analyze.ts`, finalize the unified response contract from §4.

---

## 10. Dual Entry Point — Web App + Browser Extension

ScamCheck ships as **one platform, two front doors**, sharing a single backend and analysis engine. This does not add new analysis logic — it adds a second, lighter-weight way to trigger the same engines defined in §3–§4.

```
                         SCAMCHECK
                             │
                   ┌─────────┴─────────┐
                   ▼                   ▼
           🌐 WEB APPLICATION     🧩 BROWSER EXTENSION
                   │                   │
      Paste/upload message,      Browsing normally;
      screenshot, PDF, URL       extension flags likely
                   │             job/course/internship pages
                   └─────────┬─────────┘
                             ▼
                   SAME BACKEND (§4 API surface)
                             │
              Risk · Credibility · Payment · Suitability
                     · Content Match · Evidence
                             │
                             ▼
                   FINAL RECOMMENDATION
        (compact card in extension → "View Full Report" → web app)
```

### 10.1 Web App Role
Full dashboard — deep dive, all input types (paste text, upload screenshot/PDF/offer letter, paste URL), complete evidence trail, full comparison tables. This is where §1–§9 of this spec fully applies.

### 10.2 Extension Role
Lightweight, in-context trigger — surfaces a compact result **on the page the user is already viewing**, then links out to the full web report for anything beyond a quick check. It must not run a full backend analysis automatically on every page — see §12 (privacy/detection rules).

### 10.3 Extension-Specific UX
- Persistent **"Check with ScamCheck"** action (toolbar icon/popup), plus a passive banner suggestion ("This looks like an internship/course — Analyze with ScamCheck?") only on pages that match lightweight heuristics.
- Page-type-aware action sets:
  - **Course page** → Analyze Course, Compare Curriculum, Find Free/Cheaper Alternatives
  - **Internship/Job page** → Verify Company, Check Payment, Find Similar Listings
  - **Unknown page** → Check Website, Analyze Page generically
- Compact popup result (Risk/Credibility/Suitability tiles + top 1–2 warnings + alternatives count) with a **"View Full Report"** button that opens the web dashboard for the same analysis ID.

---

## 11. Tools & Technology List (Consolidated)

This replaces/extends §6 now that the extension is in scope. Grouped by concern:

| Category | Tool / Library | Used for |
|---|---|---|
| Web frontend | React + TypeScript, Vite, Tailwind CSS, TanStack Query | Dashboard UI, report rendering, async fetch to `/api/analyze` |
| Backend orchestrator | Node.js, Express, TypeScript | `/api/analyze` and sub-endpoints; fans out to ml-service |
| ML / extraction service | Python, FastAPI | Hosts risk, credibility, payment, suitability, content-match engines |
| NLP / entity extraction | spaCy, or an LLM API (e.g. Claude) via prompted extraction | Opportunity Object + Curriculum Object extraction from raw text |
| OCR | Tesseract (self-hosted) or a cloud OCR API | Screenshots, offer letters, scanned PDFs |
| Curriculum/content similarity | sentence-transformers (or a hosted embeddings API) + cosine similarity | Content Match % between submitted course and alternatives |
| Web fetching / parsing | Playwright (for JS-rendered pages) or `requests` + BeautifulSoup (static pages) | Website credibility checks, cross-source verification, alternative-course lookup |
| Job queue | BullMQ + Redis | Parallelizes external fetches (Phase 5+) without blocking the main request |
| Database | MongoDB | Opportunity objects, reports, user profiles |
| Auth (optional, for profiles) | JWT | Persisting a user's Suitability profile across sessions |
| Containerization | Docker, Docker Compose | Local dev parity across web/backend/ml-service/mongo/redis |
| Browser extension | Chrome Extension **Manifest V3** | Content script + background service worker + popup |
| Shared code | A `shared/` TypeScript package (types, constants, utils) | Keeps the web app and extension using one response contract, no schema drift |

---

## 12. Tools Needed Specifically to Build the Extension

| Piece | Tool | Role |
|---|---|---|
| Manifest | `manifest.json` (Manifest V3) | Declares permissions, popup, background worker, content scripts |
| Content script | Vanilla TS or a light framework (Preact) injected into the page | Reads visible page text/DOM (title, price, syllabus keywords) — **never** full raw HTML dump |
| Background service worker | TS, Manifest V3 service worker | Talks to the ScamCheck backend API; holds short-lived state between popup opens |
| Popup UI | React (or Preact for smaller bundle) + Tailwind, built with **Vite's `vite-plugin-web-extension`** or CRXJS | Renders the compact result card and page-aware action buttons |
| Page classification (lightweight, client-side) | Small keyword/heuristic classifier bundled in the content script (e.g. regex/keyword match for "syllabus", "stipend", "registration fee", "apply now") | Decides *locally* whether to show the "Analyze with ScamCheck?" banner, without sending page content to the server first |
| Packaging/testing | Chrome Extension CLI tooling (`web-ext` equivalent for Chrome, or manual "Load unpacked") | Local dev + Chrome Web Store packaging |
| Cross-browser (optional, later) | WebExtension polyfill | If expanding beyond Chrome to Firefox/Edge |

**Design rule carried over from the source doc:** the content script does cheap, local classification only; the expensive analysis (risk/credibility/payment/content-match) always happens server-side via the same `/api/analyze` used by the web app — the extension never runs its own separate model.

---

## 13. How Scam Detection Actually Works (Methodology)

Scam/risk detection is not one classifier — it's a **layered signal-scoring approach**, consistent with the "explainable, evidence-based" requirement from the original spec.

1. **Rule/pattern layer (fast, always available — Phase 1 core):**
   - Urgency & pressure language ("limited seats," "pay within 1 hour," "offer expires today").
   - Upfront-payment-before-any-verification patterns (registration/security-deposit demanded before any contract or verified offer).
   - Requests for sensitive data unrelated to the stated purpose (OTP, banking PIN, ID uploads with no clear justification).
   - "Guaranteed placement / guaranteed certificate" absolute claims, which are treated as `UNVERIFIED` claims to flag, not automatic fraud proof.
   - Sender/domain mismatch (claimed org "ABC Technologies" but sender is `@gmail.com`, or application URL redirects to an unrelated domain).
   Each rule fires an **indicator with a weight**, not a hard scam/not-scam verdict — this produces the initial Risk Score.

2. **NLP/LLM-assisted layer (semantic, not just keyword):**
   - Used to catch paraphrased urgency/pressure tactics that keyword rules would miss, and to normalize free-text into the structured Opportunity Object (§3 Segment A) so the same signals fire even when wording varies.

3. **Cross-source consistency layer (Segment G):**
   - Independently fetched official website / listing data is diffed against the submission (price, role, duration, contact info). A mismatch here (e.g. official ₹1,999 vs. submitted ₹5,000) is a **strong, explainable signal**, not a guess.

4. **Credibility layer (Segment C), scored separately:**
   - Domain/HTTPS/policy-page/contact-info checks feed Credibility, not Risk — a low-credibility site isn't automatically "high risk," it's flagged as *harder to trust*, and both scores are shown to the user distinctly (per the "never combine into one number" rule in §8/§11 of the earlier version, now §8 Global Contract).

5. **Evidence tagging (Segment H), applied to every signal above:**
   - Each triggered indicator and each cross-source comparison is labeled `VERIFIED / LIKELY / UNCERTAIN / CONTRADICTED / NOT_FOUND` before it contributes to the final Risk Score — this is what keeps the system from ever asserting "this is a scam" as a bare fact.

6. **Aggregation → Risk Score + explainable indicator list:**
   - Weighted indicators sum into the 0–100 Risk Score; the report always lists *which* indicators fired and *why*, never just the number.

No single missing signal (e.g. "uses Gmail," "no HTTPS," "new domain") is ever sufficient by itself to call something a scam — this is enforced at the aggregation step, matching the accuracy rules already defined in §8.

---

## 14. Methodologies Used (Summary)

| Methodology | Where it's applied |
|---|---|
| **Rule-based / heuristic scoring** | Risk Engine indicators, extension's lightweight client-side page classifier |
| **NLP entity & relation extraction** | Opportunity Object + Curriculum Object extraction (Segment A) |
| **Semantic similarity (embeddings)** | Content Match % between submitted course and alternatives (Segment F) |
| **Cross-source data verification / diffing** | Cross-Source Consistency Engine (Segment G) |
| **Multi-dimensional, non-aggregated scoring** | Risk / Credibility / Suitability / Value kept as four separate scores (never one blended number) |
| **Evidence-labeling framework** | Applied uniformly across every module (`VERIFIED/LIKELY/UNCERTAIN/CONTRADICTED/NOT_FOUND`) |
| **Progressive disclosure / consent-based scanning** | Extension shows a suggestion banner, never auto-analyzes; full analysis only on explicit user action |
| **Phased, modular delivery** | Build order in §7/§9.4 — cheapest, highest-value signals shipped first; expensive curriculum-matching and cross-source fetches shipped last |
| **Shared-backend, multi-frontend architecture** | Web app and extension both call the same `/api/analyze` contract — one analysis engine, two entry points |
