# Session handoff

**Overwrite this file at the end of every session.** It is a snapshot, not a log — history belongs in `03-decision-log.md`.

---

**Last updated:** 2026-09-10
**Current stage:** S4 — Wave 1 template extraction
**Status:** **166 tests passing, tsc clean, dev server runs.** Document renders **13 sections, 23 estimated pages, 3 tables, 3 gaps.**
**Scope:** FULL BUILD, S0 through S13. No deadline pressure.

**Standing instruction: do not commit or push unless the user asks.**

---

## Done

### S0 — Research (mostly complete)

- **Corpus:** 8 prospectuses + 4 SME annual reports in `corpus/` (PDFs gitignored; `corpus/README.md` has the inventory). 7 of 8 are book-built, which reversed D1 to D15.
- **Section map** (`07-section-map.md`) from 5 real ToCs. Boilerplate measured at **140pp (32%)**.
- **Rule sources** (`05-rule-sources.md`): **R-001 to R-025** plus 18 BSE SME and 11 NSE Emerge criteria.
  Two entries remain `PROPOSAL-ONLY` (R-007 minimum issue size, R-012 migration compliance); both peripheral.

### S1 — Skeleton, S2 — Fact base (done)

Next.js 16.3.4, React 19.2.8, Tailwind 4, Zod 4.5.4, vitest 5. Dev server on :3000. **Not deployed** — no Vercel account.

`lib/facts/` — money (decimal strings), provenance (D18), Zod schemas, `zFactBase`.
`lib/seed/vardhman.ts` — complete synthetic BSE SME issuer whose arithmetic ties.

### S4 — Document engine and Wave 1 (in progress)

`lib/document/` — `nodes.ts` (AST), `template.ts` (substitution, filters, conditionals, bold),
`section.ts` (SectionSpec + `derivedTerms`), `sections/` (the registry).

**Sections built:**

| Section | Producer | Notes |
|---|---|---|
| Forward Looking Statements | template | first extraction |
| Other Regulatory and Statutory Disclosures — disclaimers and listing | template | per-exchange branch |
| Issue Structure | **computed** | first table |
| Issue Procedure — Book Building Procedure | template | |
| Issue Procedure — Application Size and Method of Bidding | template | |
| Issue Procedure — Bids by Investor Category | template | 12 subsections |
| Issue Procedure — Grounds for Technical Rejection | template | 25+ grounds |
| Issue Procedure — Basis of Allotment | template | |
| Issue Procedure — Impersonation, Undertakings, Utilisation | template | |
| Definitions and Abbreviations | **computed** | 79 authored + 129 generated |
| Terms of the Issue | template | |
| Other Regulatory — Authority and Confirmations | template | |
| Other Regulatory — Consents and Grievances | template | |

---

## What held-out verification has caught

Every section is diffed across two sources then checked against **Century Business Media**, which is never used for extraction. It has found a real defect four times:

1. **Reg 229(1) vs 229(2)** — hardcoded 229(2) would have cited the wrong regulation for every issuer under Rs 10 crore post-issue capital. Now derived.
2. **Regional-language gloss** — Century omits it; it is in Bihar, where the regional language is Hindi and the gloss reads oddly after naming a Hindi national daily. Now conditional.
3. **Cut-off price bids** — Maxwell says rejected for "any category", Om Galaxy and Century confine it to NIIs and QIBs. Following Maxwell would have told issuers to reject valid retail bids.
4. **Category allotment counts are not computable at all** — see D20.

**Do not skip it.** Two extraction sources agreeing is not enough; three of the four above were cases where both sources agreed and were still wrong or incomplete.

---

## Next action

**Recommendation: stop extracting and build S6.** Wave 1 has proven the engine and produced 23 pages; the remaining template work is more of the same and can resume any time. S6 is the product's differentiator, is fully unblocked, and needs no API credits.

**S6 — rule engine, eligibility pre-check, gap dashboard.** Everything it needs exists:
- 25 rule-source entries (R-001..R-025) plus 18 BSE and 11 NSE criteria
- a seed whose arithmetic ties, so consistency rules have something real to check
- `collectPlaceholders` already surfaces document gaps; the dashboard groups them by severity with clause citations
- **D16: add `effectiveFrom` to the `Rule` type at the outset.** Retrofitting means re-auditing every rule.
- **D20's applicability lesson carries over:** the gap list must separate NOT APPLICABLE from MISSING, as `Definition.appliesIf` now does. A dashboard full of inapplicable items is one nobody reads.

If continuing Wave 1 instead, in descending value:

1. **Other Regulatory remainder** — caution, jurisdiction disclaimer, experts opinion (needs M6 auditor facts), stock market data, fees payable, purchase of property, revaluation. ~8 subsections.
2. **Issue Procedure remainder** — UPI implementation, availability of forms, bids at different price levels, terms of payment, electronic registration, build of the book, withdrawal, price discovery, underwriting agreement and RoC filing, pre-issue advertisement, general instructions.
3. **Definitions remainder** — ~130 entries, but see D21: each must be READ and authored, not filtered. The sector glossary cannot come from the corpus at all.

**Main Provisions of AoA (~38pp) is the largest remaining section but is blocked** — extracted per-issuer from the company's own articles, so it needs S7 upload and extraction, not templating.

---

## Known gaps carried

- IRDAI exposure-norms list — only the first limb verified
- Anchor Investor subsection of Issue Procedure — not extracted
- Section 40(3) separate-bank-account bullet — rests on Maxwell alone
- R-007, R-012 still `PROPOSAL-ONLY`
- Part A of Schedule VI full text (O-5) — the disclosure spec the registry must satisfy

---

## Gotchas discovered

- **`create-next-app` overwrites `CLAUDE.md`** with a stub pointing at its `AGENTS.md`. Restored; the `@AGENTS.md` import is kept at the top.
- **Directory name `Setu` has a capital letter** — npm rejects it as a package name. Scaffold elsewhere and move.
- **`@types/node` shipped as ^20** while Node is v22; vitest would not install. Bumped to ^22.
- **Zod 4 `io: 'input'` omits `additionalProperties: false`**, which Claude strict tool use needs. `extractionSchemaFor()` adds it back (D19).
- **The `s` regex flag** needs an es2018 target; use `[\s\S]`.
- **Bold must be split BEFORE `{{ }}` substitution**, or `**{{ x }}**` leaves orphaned asterisks.
- **ToC page numbers are not physical PDF pages** — search the text, do not trust the ToC number.
- **`pdftotext` to a file, then node, beats shell pipelines.** `grep`/`tr` on a whole prospectus collapsed to one line either crashes or hangs; a 120s timeout was hit that way. WebFetch also fails on SEBI PDFs — download and extract locally.
- **Filters chain** (`| date | upper`), which matters inside the capitalised statutory clauses.
- **Browser screenshots sometimes return blank** at certain scroll positions while the DOM is correct. Verify content through `javascript_tool`, not screenshots alone.

---

## Environment notes

- **No Anthropic API credits.** Not blocking: S3, S4, S5, S6, S11 need none. Only S7 (extraction), S9 (narrative) and S10 (risk narrative) do.
- Supabase: not created. Local JSON until S7.
- Vercel: not created.
- Corpus gaps: 17 more prospectuses; missing sectors (IT/services, trading, textiles, chemicals, pharma); only 1 OFS example; 5+ fixed-price documents needed before that branch.
