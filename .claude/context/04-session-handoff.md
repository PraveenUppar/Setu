# Session handoff

**Overwrite this file at the end of every session.** It is a snapshot, not a log — history belongs in `03-decision-log.md`.

---

**Last updated:** 2026-09-09
**Current stage:** S0 — Corpus & research
**Status:** S0 complete enough to build on. **S1 done, S2 substantially done.** 24 tests passing, tsc clean.
**Scope:** FULL BUILD, S0 through S13 (~24 working days). No deadline pressure — user confirmed 2026-09-09. Do not apply the thin-slice or 10-day compression in `TODO.md`; they remain documented only as fallbacks if circumstances change.

---

## Done

- Full plan, architecture, and staged TODO written
- Domain primer, decision log (D1–D14), architecture doc created
- Stack settled: Next.js + TS, Supabase, Anthropic SDK, `docx`, Vitest, Vercel
- Scope settled: fixed-price SME issues first

**Corpus acquired (partial):** 8 prospectuses + 4 SME annual reports in `corpus/`, renamed to
`<issuetype>__<sector>__<company>__<exchange>__<date>__<doctype>.pdf`. All text-layer, no OCR needed.
7 of 8 prospectuses are book-built; only Quanto Agroworld is fixed price. **This reversed D1 -> D15.**

**Section map built** (`07-section-map.md`) from 5 real ToCs. 37 subsections, measured page ranges,
producer classification. Supersedes the primer's from-memory table.

**No code yet. Repo is not initialised. No API credits — user is finding a workaround.**

---

## Built so far

```
lib/facts/
  money.ts          Money as decimal strings in rupees; Indian unit conversion
                    and 2,22,10,824-style formatting. Never floats.
  provenance.ts     Provenance beside facts (D18). getFact/setFact/listPaths
                    over dotted paths with array indices. isUsable() gate.
  facts.test.ts     18 tests
  schema.test.ts    6 tests — MM3, one schema drives validation + extraction
  schema/
    shared.ts       zMoney, zDate, zShares, zCIN, zPAN, zDIN, zExchange,
                    zIssueType, zSector
    company.ts      M1
    capital.ts      M2 — allotments, shareholders, promoter holdings
    financials.ts   M6 — per-FY figures the eligibility rules need
    offer.ts        M9 — issue, objects, selling shareholders
    index.ts        zFactBase composite + extractionSchemaFor()
```

**Stack notes:** Next.js **16.3.4**, React **19.2.8**, Tailwind **4**, Zod **4.5.4**, vitest 5.
`@types/node` was bumped ^20 -> ^22 to match the installed Node and satisfy vitest.
`zod-to-json-schema` uninstalled — Zod 4 has native `z.toJSONSchema()` (D19).

**Read `node_modules/next/dist/docs/` before writing Next.js code** — v16 differs from training data.
Not needed yet; nothing built so far touches Next.js APIs.

---

## Next action

Finish **S2**, then **S4** (the visible document — highest morale payoff):

1. Domains M3/M4/M5/M7/M8/M10 in `schema/index.ts` are shaped but minimal. Expand at S8, not now.
2. **Seed the Vardhman fixture** — a complete, realistic `FactBase`. S2's remaining gate item.
3. Persistence: local JSON files under `data/`. Supabase deferred to S7 when uploads need storage.
4. Then S4: `DocumentNode` AST, `renderHtml()`, template engine, Wave 1 templates.

**Skip S3 (module engine UI) until after S4.** Wave 1 templates need only M1 facts, which the seed
provides, so the document can be visible before any form exists.

## Corpus gaps (deferred by user — working the downloaded files first)

17 more prospectuses; missing sectors (IT/services, trading, textiles, chemicals, pharma); only 1 OFS
example (Photonics); 5+ fixed-price documents needed before that branch can be built.

---

## Open questions

| # | Question | Blocks |
|---|---|---|
| Q1 | How deep does M2 go? Full allotment history since incorporation is the most laborious module and produces the most tables. May deserve a dedicated import format (PAS-3 parsing?). | S5 |
| Q2 | Who sets the issue price — promoter or MB? Basis for Offer Price needs a valuation, which is realistically the MB's work. M9 may be MB-authored, not promoter-authored. | S8 |
| Q3 | Do we attempt Industry Overview at all? Normally a purchased CRISIL/CARE/D&B report. Current plan: generate a draft marked "to be replaced by commissioned report." | S9 |
| Q4 | Can a real merchant-banker Due Diligence Questionnaire be obtained? It is effectively the intake wizard's spec, already written by practitioners. | S3, S8 |

---

## Gotchas discovered

*(Nothing yet — record anything surprising here as it comes up, especially extraction failures, DOCX rendering quirks, and rate-limit behaviour.)*

---

## Environment notes

- Anthropic API credits: **not yet purchased.** Start with $20–30. Claude Pro/Max does **not** cover API usage — separate billing.
- Check whether the hackathon has sponsor API credits — often available and unclaimed.
- Check console.anthropic.com → Settings → Limits for tier RPM/ITPM before building the extraction queue.
- Supabase project: not created
- Vercel project: not created
