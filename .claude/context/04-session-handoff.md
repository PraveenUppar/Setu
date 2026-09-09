# Session handoff

**Overwrite this file at the end of every session.** It is a snapshot, not a log — history belongs in `03-decision-log.md`.

---

**Last updated:** 2026-09-09
**Current stage:** S4 — Document engine
**Status:** Engine proven end to end. **61 tests passing, tsc clean, dev server runs.** Two commits pushed to `origin/main`.
**Scope:** FULL BUILD, S0 through S13 (~24 working days). No deadline pressure — user confirmed 2026-09-09. Do not apply the thin-slice or 10-day compression in `TODO.md`.

---

## Done

### S0 — Research (mostly complete)

- **Corpus:** 8 prospectuses + 4 SME annual reports in `corpus/`, renamed to
  `<issuetype>__<sector>__<company>__<exchange>__<date>__<doctype>.pdf`. All text-layer, no OCR.
  PDFs are gitignored; `corpus/README.md` records the full inventory and sources.
- **7 of 8 prospectuses are book-built** — this reversed D1 to D15.
- **Section map** (`07-section-map.md`) from 5 real ToCs. 37 subsections, measured page ranges,
  producer classes. Boilerplate measured at **140pp (32%)**, higher than the 110pp estimated.
- **Rule sources** (`05-rule-sources.md`): 18 regulations plus 18 BSE SME and 11 NSE Emerge criteria.
  **SEBI's own board memo was wrong on 5 of 6 figures** versus what was notified.

### S1 — Skeleton (done)

Next.js 16.3.4, React 19.2.8, Tailwind 4, Zod 4.5.4, vitest 5. Dev server runs on :3000.
**Not deployed** — no Vercel account yet.

### S2 — Fact base (done)

```
lib/facts/
  money.ts          Decimal strings in rupees; Indian units and 2,22,10,824 grouping
  provenance.ts     Provenance beside facts (D18); getFact/setFact/listPaths; isUsable()
  schema/           shared, company, capital, financials, offer, index (zFactBase)
lib/seed/
  vardhman.ts       Complete synthetic BSE SME issuer whose arithmetic ties
```

### S4 — Document engine (core done)

```
lib/document/
  nodes.ts          The AST both renderers consume; placeholders are inline runs
  template.ts       {{ fact }}, filters, {{#if}}/{{#unless}}; missing fact -> gap
  section.ts        SectionSpec; subsection is the atomic unit
  sections/general.ts   Forward Looking Statements — the first extracted template
components/document-view.tsx   HTML renderer
app/page.tsx                   Preview page with gap list and watermark
```

---

## Next action

**S4 continued — extract Wave 1 templates.** The engine works; the rest is extraction, in
descending order of page count:

1. **Issue Procedure** (~36pp, ~95% invariant) — biggest single win, budget a full day
2. **Main Provisions of AoA** (~38pp) — per-issuer extraction from the uploaded AoA
3. **Definitions and Abbreviations** (~17pp) — sector-varied
4. **Other Regulatory and Statutory Disclosures** (~17pp)

Use the `template-extraction` skill. Diff the same subsection across 5 corpus documents; identical
text becomes literal, differing values become `{{ variables }}`, present-in-some becomes conditional.
**Verify by rendering against a held-out prospectus's facts.**

Then **S6** (rule engine + eligibility + gap dashboard), which is fully unblocked — the rule sources
support it and no API credits are needed.

**S3 (module engine UI) stays deferred** until Wave 1 is substantially done.

---

## Gotchas discovered

- **`create-next-app` overwrites `CLAUDE.md`** with a stub pointing at its own `AGENTS.md`. Restored;
  the `@AGENTS.md` import is kept at the top so both load.
- **Directory name `Setu` has a capital letter**, which npm rejects as a package name. Scaffolded in a
  temp directory and moved the files in.
- **`@types/node` shipped as ^20** while Node is v22 — vitest would not install. Bumped to ^22.
- **Zod 4 `io: 'input'` omits `additionalProperties: false`**, which Claude strict tool use requires.
  `extractionSchemaFor()` adds it back on every object node. Covered by a test (D19).
- **The `s` regex flag** needs an es2018 target; use `[\s\S]` instead.
- **ToC page numbers are not physical PDF pages** — there is a cover-page offset. Find sections by
  searching text, not by the ToC number.
- **`pdftotext` beats WebFetch for SEBI PDFs.** Download to disk, extract locally. WebFetch returned
  only navigation chrome for the regulations page and could not parse the board-memo PDF.

---

## Open questions

| # | Question | Blocks |
|---|---|---|
| Q1 | How deep does M2 go? Full allotment history is the most laborious module. May deserve a PAS-3 import path. | S5 |
| Q2 | Who sets the issue price — promoter or merchant banker? Basis for Issue Price needs a valuation, realistically the MB's work. | S8 |
| Q3 | Do we attempt Industry Overview at all? Normally a commissioned CRISIL/CARE/D&B report. | S9 |
| Q4 | Can a real merchant-banker Due Diligence Questionnaire be obtained? It is effectively the intake wizard's spec. | S3, S8 |
| O-2 | 2 rules still `PROPOSAL-ONLY` — minimum issue size, migration compliance. Both peripheral. | 2 rules |
| O-5 | Part A of Schedule VI full text — the disclosure spec the section registry must satisfy. | Completeness rules |

---

## Environment notes

- **No Anthropic API credits.** Not blocking: S3, S4, S5, S6, S11 need none. Only S7 (extraction),
  S9 (narrative) and S10 (risk narrative) do.
- Supabase: not created. Deferred to S7 when uploads need storage; local JSON until then.
- Vercel: not created.
- Corpus gaps: 17 more prospectuses; missing sectors (IT/services, trading, textiles, chemicals,
  pharma); only 1 OFS example; 5+ fixed-price documents needed before that branch.
