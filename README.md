# Page Pulse

Page Pulse audits any URL and returns a structured report: HTTP status, response time, page title, meta description, H1 count, images missing alt text, and approximate word count.

**Live demo:** _add your deployed URL here_
**Repo:** _add your GitHub repo URL here_

---

## Table of Contents

- [Project Structure](#project-structure)
- [Setup](#setup)
- [API Contract](#api-contract)
- [Design Decisions](#design-decisions)
- [Testing](#testing)
- [Known Limitations](#known-limitations--what-id-change-with-another-day)
- [Credit](#credit)

---

## Project Structure

This is a Turborepo monorepo managed with pnpm.

```
page-pulse/
├── apps/
│   ├── Backend/
│   │   └── src/
│   │       ├── controllers/
│   │       │   └── analyze.controller.ts   # HTTP layer — request in, response out
│   │       ├── services/
│   │       │   └── analyze.service.ts      # Pure HTML parsing logic (analyzeSite)
│   │       ├── utils/
│   │       │   └── util.ts                 # URL fetching (fetchUrl)
│   │       ├── types/
│   │       │   └── types.ts                # Shared interfaces (SEOAnalysis, ReportType)
│   │       ├── routes/
│   │       │   └── analyze.route.ts
│   │       ├── tests/
│   │       │   └── analyze.service.test.ts # Unit tests for the parsing logic
│   │       └── index.ts
│   └── Frontend/                           # UI that calls the Backend API
├── packages/
│   ├── eslint-config/
│   ├── typescript-config/
│   └── ui/
├── turbo.json
└── pnpm-workspace.yaml
```

---

## Setup

**Requirements:** Node.js 18+, pnpm 8+

```bash
git clone <your-repo-url>
cd page-pulse
pnpm install
```

**Run the backend in dev mode:**

```bash
cd apps/Backend
pnpm dev
```

By default the API runs at `http://localhost:3000` (adjust to whatever port your `index.ts` binds to, or set `PORT` in a `.env` file in `apps/Backend`).

**Run the frontend:**

```bash
cd apps/Frontend
pnpm dev
```

**Run everything via Turborepo from the root:**

```bash
pnpm turbo dev
```

**Build for production:**

```bash
pnpm turbo build
```

This runs `tsc` for the backend, compiling `src/` to `dist/`. Test files are excluded from this build (see [Testing](#testing)) so nothing test-related ships to production.

---

## API Contract

### `GET /analyze?url={target}`

Audits the given URL and returns a report.

**Example request:**

```
GET /analyze?url=https://example.com
```

**Success response — `200 OK`**

```json
{
  "sucess": true,
  "report": {
    "http_status": 200,
    "response_time": 187,
    "page_title": "Example Domain",
    "meta_description": "A test page",
    "h1_count": 1,
    "images_missing_alt_text": 2,
    "word_count": 342
  }
}
```

| Field | Type | Description |
|---|---|---|
| `sucess` | `boolean` | Whether the audit completed successfully. *(Note: this field is intentionally spelled `sucess` to match the existing API contract — see [Known Limitations](#known-limitations--what-id-change-with-another-day).)* |
| `report.http_status` | `number` | The HTTP status code returned by the **target** page (not Page Pulse's own status) |
| `report.response_time` | `number` | Time in milliseconds to fetch the target page |
| `report.page_title` | `string` | Contents of the target page's `<title>` tag, trimmed. Empty string if none found. |
| `report.meta_description` | `string` | Contents of `<meta name="description">` (falls back to `og:description`). Empty string if neither is present. |
| `report.h1_count` | `number` | Number of `<h1>` tags on the page |
| `report.images_missing_alt_text` | `number` | Count of `<img>` tags with a missing or empty `alt` attribute |
| `report.word_count` | `number` | Approximate word count of visible body text (script/style/noscript content excluded) |

**Error responses**

| HTTP Status | Meaning |
|---|---|
| `400` | Missing or invalid `url` query parameter |
| `408` | Target page did not respond within the timeout window |
| `415` | Target responded, but the content wasn't HTML |
| `502` | Target host unreachable (DNS failure, connection refused) |
| `500` | Unexpected server-side error |

Error responses follow the same envelope shape as success, with `sucess: false` and safe zeroed/empty defaults in `report` (`http_status` reflecting the actual error, everything else `""` or `0`) — so the frontend can render a report card either way without null-checking every field individually.

```json
{
  "sucess": false,
  "report": {
    "http_status": 415,
    "response_time": 0,
    "page_title": "",
    "meta_description": "",
    "h1_count": 0,
    "images_missing_alt_text": 0,
    "word_count": 0
  }
}
```

---

## Design Decisions

### 1. Parsing logic is a pure function, separated from the HTTP and network layers

`analyzeSite(html: string)` in `services/analyze.service.ts` takes raw HTML and returns metrics — it has no knowledge of Express, `req`/`res`, or how the HTML was obtained. Fetching lives in `utils/util.ts`, and the controller's only job is to wire the two together and translate the result into an HTTP response.

**Why:** This is what makes the tool testable in the first place. The 9 unit tests in `tests/analyze.service.test.ts` run in under 10 seconds with zero network calls and zero Express server — they just call `analyzeSite()` directly with hand-built HTML strings. If parsing logic lived inside the controller alongside `req`/`res` handling, testing "does it correctly count H1 tags" would require mocking HTTP requests just to reach code that has nothing to do with HTTP. The separation also means the parsing logic could be reused elsewhere later (a CLI tool, a background job) without dragging Express along with it.

### 2. Error responses use consistent, fully-populated field defaults instead of `null` or omitted fields

Every error response — whether it's a 400, 415, 502, or 500 — returns the exact same `report` shape as a successful response, just with `""` for strings and `0` for numbers instead of real values.

**Why:** This keeps the frontend simple. A UI consuming this API can always safely do `report.page_title.toUpperCase()` or `report.h1_count + 1` without a null-check on every single field, because the shape is guaranteed regardless of outcome. The tradeoff is that `report.http_status: 0` on a client-side validation error (like a malformed URL) is slightly ambiguous — it doesn't distinguish "we never reached the target" from "the target genuinely returned nothing." For this tool's scope, `sucess: false` combined with the outer response's actual HTTP status is enough to disambiguate that, so the simpler, uniform shape wins over a `null`-based approach that would push complexity onto every consumer of the API instead of handling it once, here.

### 3. `axios` + `cheerio` instead of a headless browser (Puppeteer/Playwright)

The audit only needs static HTML — title, meta tags, heading structure, image attributes, visible text — none of which requires JavaScript execution.

**Why:** A headless browser adds 300MB+ of bundled Chromium, multi-second cold starts, and a much heavier deploy footprint (a real concern on a free-tier host) — for work that a lightweight HTTP client plus an HTML parser handles in single-digit milliseconds. Benchmarking `analyzeSite()` against a deliberately heavy 106KB page (300 images, a 20,000-word body) showed a median parse time of ~20ms, while a typical real-world audit request spends 95%+ of its total time waiting on the target server's network response — the parsing step is never the bottleneck. If a future version needed to audit JavaScript-rendered single-page apps, that would be the point to revisit this decision; for the current scope it would be added weight with no measurable benefit.

---

## Testing

```bash
pnpm test
```

Tests live in `src/tests/`, colocated with the code they test rather than in a top-level `tests/` folder outside `src/`. This keeps relative imports simple (`../services/analyze.service` instead of a deeper path) and means both app code and tests type-check under the same `tsconfig.json`.

To keep test files out of the production build, `tsconfig.json` excludes them explicitly:

```json
"exclude": ["src/tests/**/*", "node_modules", "dist"]
```

This doesn't affect Jest — Jest discovers tests via its own `testMatch` config in `jest.config.js`, completely independent of `tsc`'s `include`/`exclude`. The result: tests run normally with `pnpm test`, but `pnpm build` produces a `dist/` folder with zero test files and zero test-only dependencies shipped to production.

**Coverage:**
- Happy path: title extraction (with trimming), meta description, H1 counting, images-missing-alt detection (covering both the `alt=""` case and the fully-absent-attribute case, which are different bugs), word count with script-tag content correctly excluded
- Failure case 1: empty HTML string — returns safe defaults, does not throw
- Failure case 2: malformed/garbage input (control characters, broken markup) — degrades gracefully, does not throw
- Edge case: HTML with no `<body>` tag — exercises the `$.root()` fallback path for word counting

CI runs `pnpm test` and `pnpm build` on every push/PR via GitHub Actions (`.github/workflows/ci.yml`), so a failing test blocks the build step from even running, catching regressions before they reach a deploy.

---

## Known Limitations / What I'd Change With Another Day

- **Word count doesn't distinguish main content from boilerplate** (nav bars, footers, cookie banners). A more accurate version would target `<main>`/`<article>` first, falling back to `<body>` only if neither exists.
- **No caching.** Re-auditing the same URL twice in quick succession re-fetches it from scratch every time. A short-lived (~60s) in-memory cache keyed by URL would cut redundant load without meaningfully hurting freshness.
- **No SSRF protection.** The URL validator currently checks only that the protocol is `http`/`https` — it doesn't block internal/private hosts (`localhost`, `127.0.0.1`, `169.254.169.254`, private IP ranges). For a tool that fetches arbitrary user-supplied URLs, this is worth closing before any real production exposure.
- **SPA/JS-rendered pages will under-report.** Since there's no JS execution (see [Design Decision #3](#3-axios--cheerio-instead-of-a-headless-browser-puppeteerplaywright)), a page that renders its content client-side will show an empty or near-empty word count and possibly no H1s, even though a real visitor would see a full page. Worth surfacing a warning in the UI when body text is suspiciously short relative to page size.

---

## Credit

Built for [Digital Heroes Training Task](https://digitalheroesco.com).
