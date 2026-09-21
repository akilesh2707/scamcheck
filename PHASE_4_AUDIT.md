# Phase 4 Production Hardening Audit

## 1. Environment / Configuration
- **Current State**: `config/env.ts` sets fallback defaults for everything (e.g., `JWT_SECRET || 'dev-secret-change-me'`).
- **Identified Gaps**: Production does not fail fast if critical secrets are missing; it silently falls back to insecure dev secrets.
- **Severity**: HIGH
- **Recommended Fix**: Add a startup validation step in `env.ts` that `throw new Error()` if required secrets are missing when `NODE_ENV === 'production'`.

## 2. Authentication / Authorization
- **Current State**: Profile endpoints check `req.user.id`. Analyze history checks `req.user.id`. However, `/api/analyze/:id` uses `optionalAuthAllowExtension` and accesses the report via `Report.findById(id)` without validating ownership.
- **Identified Gaps**: IDOR (Insecure Direct Object Reference). Any user can view any other user's report by guessing or obtaining the ID.
- **Severity**: CRITICAL
- **Recommended Fix**: Update `Report.findById(id)` to enforce ownership: either strictly require `userId === req.user.id`, or clarify if reports are intentionally public (they shouldn't be). Enforce `Report.findOne({ _id: id, userId: req.user?.id })`.

## 3. API Security
- **Current State**: Express is protected by `helmet`, `cors`, and `express.json({ limit: '10mb' })`.
- **Identified Gaps**: JSON body limit of 10MB is unnecessarily high for most endpoints.
- **Severity**: LOW
- **Recommended Fix**: Reduce JSON body limit to 1MB.

## 4. File / Document Security
- **Current State**: `multer` restricts uploads to 5MB and specific mimetypes (`image/jpeg`, `image/png`, `application/pdf`).
- **Identified Gaps**: ML service does not enforce page limits on PDF parsing, risking decompression bombs (e.g. 10,000 blank pages).
- **Severity**: MEDIUM
- **Recommended Fix**: Add a maximum page limit check in PyMuPDF extraction (e.g., max 50 pages).

## 5. SSRF Defense-in-depth
- **Current State**: `urlFetcher.ts` resolves DNS, checks against `ipaddr.js` safe ranges, disables automatic Axios redirects, and recursively validates manual redirects.
- **Identified Gaps**: DNS Rebinding vulnerability. Axios fetches the URL using the hostname *after* the initial safe DNS check. A malicious DNS server can respond with a safe IP first, and a private IP (e.g., `127.0.0.1`) on the second resolution by Axios.
- **Severity**: HIGH
- **Recommended Fix**: Force Axios to connect directly to the pre-validated `ipStr` (e.g., `http://<ip>/...`) and pass the original hostname via the `Host` header.

## 6. MongoDB
- **Current State**: Mongoose queries are mostly safe.
- **Identified Gaps**: As mentioned, `getReport` lacks ownership isolation. Missing indexes on `userId` in `reports` collection for `/history`.
- **Severity**: HIGH
- **Recommended Fix**: Add `userId` index to `ReportSchema`. Fix IDOR in `getReport`.

## 7. Redis
- **Current State**: Pairing codes expire correctly (300s TTL) and are deleted upon use. Rate limiting uses `rate-limiter-flexible` properly.
- **Identified Gaps**: None observed.
- **Severity**: N/A
- **Recommended Fix**: Preserve current state.

## 8. ML Service
- **Current State**: FastAPI service processes requests for OCR, NLP, and Risk Analysis.
- **Identified Gaps**: Missing explicit maximum size/timeout boundaries on ML side, although the Node backend protects it partially. 
- **Severity**: LOW
- **Recommended Fix**: Enforce `MAX_CONTENT_LENGTH` in FastAPI middleware.

## 9. LLM / Prompt Injection
- **Current State**: System passes raw text to LLM providers.
- **Identified Gaps**: Raw untrusted webpage/PDF text can override system prompts if not clearly demarcated.
- **Severity**: MEDIUM
- **Recommended Fix**: Explicitly wrap untrusted content in strict XML tags (e.g., `<untrusted_content>...</untrusted_content>`) in LLM prompts.

## 10. Web Extraction
- **Current State**: Axios timeout is 10s, max size is 5MB.
- **Identified Gaps**: None major beyond the DNS rebinding SSRF flaw.
- **Severity**: N/A
- **Recommended Fix**: Address SSRF (Gap 5).

## 11. Error Handling
- **Current State**: `error.middleware.ts` masks 500 errors in production.
- **Identified Gaps**: None major.
- **Severity**: N/A
- **Recommended Fix**: Preserve.

## 12. Logging / Observability
- **Current State**: `logger.info/error` used.
- **Identified Gaps**: No request/correlation ID to trace requests across the API.
- **Severity**: LOW
- **Recommended Fix**: Add a middleware that generates a UUID `X-Request-Id` and binds it to log context via `AsyncLocalStorage`.

## 13. Health / Readiness
- **Current State**: `/api/health` exists and returns static `healthy`.
- **Identified Gaps**: No `/api/ready` endpoint that actually verifies MongoDB and Redis connections.
- **Severity**: MEDIUM
- **Recommended Fix**: Add `/api/ready` that pings Mongo and Redis.

## 14. Graceful Shutdown
- **Current State**: `app.ts` starts server but does not trap `SIGINT` or `SIGTERM`.
- **Identified Gaps**: Active requests drop, database connections are severed abruptly during deployment.
- **Severity**: MEDIUM
- **Recommended Fix**: Implement shutdown hooks on `process.on('SIGTERM')` to close HTTP server gracefully, then disconnect DBs.

## 15. Docker / Production Build
- **Current State**: No `Dockerfile` or `docker-compose.yml` found for the services.
- **Identified Gaps**: Missing production containerization.
- **Severity**: HIGH
- **Recommended Fix**: Create multi-stage, non-root `Dockerfile`s for Frontend, Backend, and ML-Service, and a `docker-compose.yml`.
