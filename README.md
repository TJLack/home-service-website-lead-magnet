# Key City Digital — Website Revenue Leak Detector

Production-focused lead magnet web app that scans public websites using server-side crawling, parsing, and internal heuristics (no external APIs).

## Features
- URL-only scan start
- Server-side crawl (same-domain, depth/page limits)
- On-page extraction + page classification
- Mobile/desktop screenshots with Playwright (graceful fallback)
- Scores: Overall, Design, SEO, Conversion, AI Search Readiness
- Revenue opportunity estimate with confidence level
- Locked preview + lead gate + unlock flow
- Local JSON storage for reports/leads
- Booking CTA wired to Key City Digital consultation link

## Run locally
```bash
npm install
npx playwright install chromium
npm run dev
```
Open `http://localhost:3000`.

## API
- `POST /api/scan` `{ url }`
- `POST /api/unlock` lead fields + `reportId`
- `GET /api/report/:id` locked preview payload

## Constraints
- No external API keys required
- No third-party paid services
- Uses only direct HTTP crawl + internal scoring logic
