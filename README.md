# Super Finance

**SME IPO Draft Prospectus Builder** — takes an SME issuer from zero to a substantially complete, structurally correct **draft prospectus**, flags every gap and inconsistency with a clause citation, and hands it to a merchant banker for review and certification.

## How it works

1. **Check eligibility** — `/eligibility`, a free six-step SEBI/exchange pre-check. No account, nothing saved, a cited verdict in minutes.
2. **Fill the intake modules** — `/intake`, ten modules (company, capital, promoters, management, business, financials, legal, approvals, the offer, group companies), each assignable to whoever actually holds the facts (promoter, CS, CFO, legal counsel, auditor).
3. **Watch the draft build itself** — `/document`, live, section by section, as answers come in. Missing facts render as highlighted placeholders.
4. **Resolve every finding** — the gap dashboard on `/document` lists every blocker, major and minor issue with the exact clause it violates, what it blocks, and where to fix it.
5. **Review, certify, export** — `/review` (section status, comments, an audit log) and `/review/risks` (auto-flagged risk factors, dismiss-with-reason). A Merchant Banker's certification lifts the `UNSIGNED DRAFT` watermark on every export: Word, PDF, an Excel gap report, and a full document vault (`/review`, `/export/*`).

## Architecture at a glance

- **Module engine** (`lib/modules/`) — one `Field`/`Module` spec shape, one form renderer (`components/module-form.tsx`) for all ten intake modules.
- **Document engine** (`lib/document/`) — one `DocumentNode` AST, two renderers (`components/document-view.tsx` for HTML, `lib/document/docx.ts` for Word) consuming the same tree so the preview and the deliverable never drift. Sections (`lib/document/sections/*.ts`) are classified by `producer`: `template` | `computed` | `narrative` | `external`.
- **Rule engine** (`lib/rules/`) — plain TypeScript predicates (eligibility + consistency + completeness), never an LLM, each with a citation into `.claude/context/05-rule-sources.md`.
- **Risk engine** (`lib/risk/`) — 22 grounded risk archetypes, each traced to specific corpus documents, drafted into prose only via the shared no-invention LLM harness (`lib/llm/narrative.ts`).
- **Fact base** (`lib/facts/`, `lib/store/fact-store.ts`) — one Zod schema, append-only local JSON. Every write is a new version; nothing is ever overwritten.

## Quick start

```bash
npm install
npm run dev
```

### Environment variables

Copy `.env.local.example` (or create `.env.local`) with:

```
GEMINI_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_URL=...
SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
SUPABASE_JWKS_URL=...
```

## Stack

Next.js (App Router) · TypeScript · Tailwind · shadcn/ui · React Hook Form + Zod · docx · decimal.js · Vitest

Every rule, risk archetype, and document section has fixture-backed tests; the DOCX/PDF output is additionally verified by actually rendering it and reading the pages.

## Documentation

| Need                                 | File                                    |
| ------------------------------------ | --------------------------------------- |
| Live status, next action             | `.claude/context/04-session-handoff.md` |
| Build checklist                      | `TODO.md`                               |
| SME/IPO/SEBI domain knowledge        | `.claude/context/01-domain-primer.md`   |
| Architecture detail, data shapes     | `.claude/context/02-architecture.md`    |
| Why a decision was made              | `.claude/context/03-decision-log.md`    |
| Verified regulatory citations        | `.claude/context/05-rule-sources.md`    |
| Section map (from real prospectuses) | `.claude/context/07-section-map.md`     |
