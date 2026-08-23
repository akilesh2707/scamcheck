# ScamCheck — Frontend

**Before you apply. Before you pay.**

ScamCheck helps students verify internships, jobs, courses, certifications, and other opportunities before they cost time,
money, or trust. Paste a message or a link and get a plain-English risk report backed by evidence, not guesses.

Built for **Hackspora 2.0** by Team Ultron.

## Stack

- **React 18 + Vite** — fast dev server, small production bundle
- **React Router v6** — client-side routing
- **Axios** — API client with centralized error normalization
- No CSS framework dependency — a small hand-rolled design system (see `src/styles/globals.css`) keeps the bundle lean

## Getting started

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your backend if it's not on localhost:5001
npm run dev
```

The app expects the ScamCheck backend (Node/Express) to be running and reachable at `VITE_API_URL` (defaults to
`http://localhost:5001`). The frontend never calls the Python ML service directly — the backend proxies all ML calls.

```bash
npm run build     # production build to dist/
npm run preview   # preview the production build locally
```

## Project structure

```
src/
├── assets/            static images
├── components/
│   ├── layout/         Navbar, Footer
│   ├── ui/              Button, Card, StatusChip, RiskRing, RiskMeter, Icon, ...
│   └── report/          report-specific building blocks (EvidenceList, SignalRow, ProgressBar, ...)
├── hooks/               useAuth, useAnalyze, useReport, useHistory, useInView
├── pages/                LandingPage, AnalyzePage, ReportPage, IntelligencePage, HistoryPage, Login/Register, NotFound
├── services/api.js       centralized Axios client + error normalization
├── styles/globals.css    design tokens (colors, spacing, motion) and base styles
├── utils/format.js       shared mappings from backend enums (risk level, evidence status, payment status, recommendation) to labels/tones
├── App.jsx
└── main.jsx
```

## Routes

| Route                  | Description                                             |
|-------------------------|----------------------------------------------------------|
| `/`                     | Landing page                                              |
| `/analyze`              | Submit an opportunity (text or URL) for analysis           |
| `/report/:id`           | Full verification report (risk, credibility, payment, evidence, recommendation) |
| `/intelligence/:id`     | Suitability, skill gap, payment intelligence, and alternatives for a report |
| `/history`              | Past reports (requires sign-in)                            |
| `/login`, `/register`   | Auth (optional — analysis works without an account)         |

## Backend contract

The frontend calls exactly the endpoints implemented by `backend/`:

- `GET /api/health`
- `POST /api/analyze` — `{ inputType: 'text' | 'url', text?, url?, userProfile? }`
- `GET /api/analyze/:id`
- `GET /api/analyze/history` (requires `Authorization: Bearer <token>`)
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

All report data rendered in the UI comes directly from these responses — nothing in the verification report or
intelligence page is hardcoded. Evidence statuses (`OBSERVED`, `VERIFIED`, `LIKELY`, `UNCERTAIN`, `CONTRADICTED`,
`NOT_FOUND`) are shown with distinct visual treatment so an "observed in your message" claim is never presented as an
externally "verified" one.

## Design notes

The visual language started from the Stitch export in `stitch_scamcheck_verification_landing_page/` (Trust Blue
`#2563EB`, Manrope, flat cards with soft borders) and was extended with: an animated risk ring/meter, staggered
scroll-reveal on cards, a presentational (not-fake-percentage) analysis progress tracker, and a unified tone system
(`success` / `warning` / `danger` / `primary` / `neutral`) shared by every status chip, metric card, and section banner
in the app.
