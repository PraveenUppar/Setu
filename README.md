# Super Finance

**SME IPO Draft Prospectus Builder** — takes an SME issuer from zero to a substantially complete, structurally correct **draft prospectus**, flags every gap and inconsistency with a clause citation, and hands it to a merchant banker for review and certification.

Built against **SEBI Problem Statement 4**, targeting **book-built SME issues** (BSE SME / NSE Emerge) first — the DRHP → RHP → Prospectus flow. Fixed-price is a later branch on a handful of sections.

**Positioning:** this doesn't replace a merchant banker, legal counsel or auditor — it replaces the months spent collecting facts, tracking gaps by email, and hunting down inconsistencies by hand.

---

## Current state

All ten intake modules exist. **37 of 37 numbered subsections** in the draft prospectus render and export to Word, PDF, a gap workbook and a document vault. 718+ tests passing.

| Stage | Status |
|---|---|
| S0–S6, S8, S9, S11, S12 | ✅ Closed |
| S10 (risk-factor engine) | 🟡 In progress — 22 of a ~40-archetype target |
| S13 (polish & demo) | 🔴 Not started |
| S7 (document upload / AI extraction) | ⏸ Paused permanently by product decision — hand-typed intake only |

Read `.claude/context/04-session-handoff.md` for the live, authoritative status — this README will lag it.

---

## The five mental models

Everything in this codebase follows from these:

1. **Classify by producer, not chapter order.** Boilerplate (templated, no LLM) · Computed (pure TypeScript) · Narrative (grounded LLM) · External (the auditor's or CA's own deliverable — this app doesn't produce it, it says so). Built in producer waves, never section-by-section.
2. **Specs are data; engines are code.** One module (intake form) engine, one document (rendering) engine. Everything past that — the ten modules, the ~35 document sections — is content, not new engineering.
3. **One Zod schema, five uses.** Client validation · server validation · LLM structured-output schema · fact-base parsing · TypeScript types.
4. **Never invent.** A missing fact renders as `[TO BE PROVIDED: ...]` inline *and* raises a gap-dashboard finding, from the same check. A fabricated number in an offer document is a real legal liability.
5. **Provenance on every fact.** Every value carries `{ value, source, ref, derivedFrom, updatedAt, updatedBy }` so every sentence in a 280-page document traces back to who supplied it and when.

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With no local data on disk, the app falls back to a complete synthetic demo issuer (`lib/seed/vardhman.ts`) so every page renders fully populated from the first run.

### Environment variables

Copy `.env.local.example` (or create `.env.local`) with:

```
GEMINI_API_KEY=...                        # Gemini free tier — powers narrative drafting (S9) and risk-factor prose (S10)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
SUPABASE_JWKS_URL=...
```

Only `GEMINI_API_KEY` is load-bearing today — Supabase is provisioned for the (paused) document-upload feature and isn't otherwise required to run the app.

### Deploying

This app currently persists everything (intake answers, drafts, risk dismissals, review status, the audit log, certification) to **local JSON files** under `.data/`. That's fine for local development, but most serverless hosts (Vercel included) give you a read-only filesystem outside of `/tmp`. If you deploy there, set:

```
SETU_DATA_DIR=/tmp/setu-data
```

so writes land somewhere writable — otherwise every page that touches the fact base will 500. Even with that set, data won't persist across cold starts or be shared across instances; treat a serverless deploy as a **look-and-click demo**, not a place to run a real filing. Wiring the fact base to Supabase (already provisioned) is the real fix, and hasn't been built yet.

---

## How it works

1. **Check eligibility** — `/eligibility`, a free six-step SEBI/exchange pre-check. No account, nothing saved, a cited verdict in minutes.
2. **Fill the intake modules** — `/intake`, ten modules (company, capital, promoters, management, business, financials, legal, approvals, the offer, group companies), each assignable to whoever actually holds the facts (promoter, CS, CFO, legal counsel, auditor).
3. **Watch the draft build itself** — `/document`, live, section by section, as answers come in. Missing facts render as highlighted placeholders, never guesses.
4. **Resolve every finding** — the gap dashboard on `/document` lists every blocker, major and minor issue with the exact clause it violates, what it blocks, and where to fix it.
5. **Review, certify, export** — `/review` (section status, comments, an audit log) and `/review/risks` (auto-flagged risk factors, dismiss-with-reason). A Merchant Banker's certification lifts the `UNSIGNED DRAFT` watermark on every export: Word, PDF, an Excel gap report, and a full document vault (`/review`, `/export/*`).

There's a role picker (on `/intake`) that scopes which modules show and who the audit log records as the actor — no real authentication behind it, by design (see "Deliberately not used" below).

---

## Architecture at a glance

- **Module engine** (`lib/modules/`) — one `Field`/`Module` spec shape, one form renderer (`components/module-form.tsx`) for all ten intake modules.
- **Document engine** (`lib/document/`) — one `DocumentNode` AST, two renderers (`components/document-view.tsx` for HTML, `lib/document/docx.ts` for Word) consuming the same tree so the preview and the deliverable never drift. Sections (`lib/document/sections/*.ts`) are classified by `producer`: `template` | `computed` | `narrative` | `external`.
- **Rule engine** (`lib/rules/`) — plain TypeScript predicates (eligibility + consistency + completeness), never an LLM, each with a citation into `.claude/context/05-rule-sources.md`.
- **Risk engine** (`lib/risk/`) — 22 grounded risk archetypes, each traced to specific corpus documents, drafted into prose only via the shared no-invention LLM harness (`lib/llm/narrative.ts`).
- **Fact base** (`lib/facts/`, `lib/store/fact-store.ts`) — one Zod schema, append-only local JSON. Every write is a new version; nothing is ever overwritten.

---

## Stack

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · React Hook Form + Zod · `docx` · `decimal.js` (never floats for money) · Vitest

**Deliberately not used:** real authentication (a role switcher over one seeded org instead), Python, LangChain, a vector DB, Redis, Docker, GraphQL, a monorepo, an E2E suite.

---

## Testing

```bash
npx vitest run
npx tsc --noEmit
```

Every rule, risk archetype, and document section has fixture-backed tests; the DOCX/PDF output is additionally verified by actually rendering it and reading the pages (LibreOffice + a rasterising script) — a passing test alone isn't treated as proof a rendered page is correct.

---

## Documentation

| Need | File |
|---|---|
| Live status, next action | `.claude/context/04-session-handoff.md` |
| Build checklist | `TODO.md` |
| SME/IPO/SEBI domain knowledge | `.claude/context/01-domain-primer.md` |
| Architecture detail, data shapes | `.claude/context/02-architecture.md` |
| Why a decision was made | `.claude/context/03-decision-log.md` |
| Verified regulatory citations | `.claude/context/05-rule-sources.md` |
| Section map (from real prospectuses) | `.claude/context/07-section-map.md` |

---

## Non-negotiable rules

- No regulatory number ships without a citation into `05-rule-sources.md`.
- DOCX is the primary export — merchant bankers redline in Word.
- Never floats for money — `decimal.js` for every rupee and percent.
- Extraction never lands silently — every fact is reviewed and confirmed against its source.
- The fact base is append-only.
- No emojis anywhere.
