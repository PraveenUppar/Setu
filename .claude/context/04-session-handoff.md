# Session handoff

**Overwrite this file at the end of every session.** It is a snapshot, not a log — history belongs in `03-decision-log.md`.

---

**Last updated:** 2026-09-10
**Current stage:** S4 — Wave 1 template extraction
**Status:** **124 tests passing, tsc clean, dev server runs.** Document renders **9 sections, 13 estimated pages, 1 table, 2 gaps.**
**Scope:** FULL BUILD, S0 through S13. No deadline pressure.

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

Continue Wave 1 extraction. In descending value:

1. **Other Regulatory and Statutory Disclosures — remaining chunks.** Authority for the issue, lender NOC, prohibition by SEBI/RBI, confirmations, caution, disclaimer in respect of jurisdiction, consents, experts opinion, stock market data, investor grievance mechanism, fees payable, purchase of property, revaluation. ~12 subsections, ~90% invariant.
2. **Definitions and Abbreviations** (~17pp) — sector-varied, high page count.
3. **Terms of the Issue** (~10pp) — completes the Issue Related group.
4. **Issue Procedure remainder** — UPI implementation, availability of forms, bids at different price levels, terms of payment, electronic registration, build of the book, withdrawal of bids, price discovery, underwriting agreement and RoC filing, pre-issue advertisement, general instructions.

**Main Provisions of AoA (~38pp) is the largest remaining section but is blocked** — it is extracted per-issuer from the company's own articles, so it needs S7 upload and extraction, not templating.

Then **S6** (rule engine, eligibility pre-check, gap dashboard), which is fully unblocked and needs no API credits.

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
