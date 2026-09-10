# Session handoff

**Overwrite this file at the end of every session.** It is a snapshot, not a log — history belongs in `03-decision-log.md`.

---

**Last updated:** 2026-09-10
**Current stage:** S0 and S6 CLOSED. **S4 Wave 1 in progress.**
**Status:** **328 tests passing, tsc clean, dev server runs.** Document renders **6 of the 37 numbered subsections**, drafted as **25 registry sections**, **39 estimated pages** of a measured ~280. **Issue Procedure is COMPLETE**, and the glossary is at **130 definitions plus 129 abbreviations**.

**The progress indicator said "25 of 37" until 2026-09-10 and was wrong** — it counted registry entries against numbered subsections, and Issue Procedure alone is one subsection and sixteen entries. Every spec now carries `partOf`, the header counts distinct values, and a test holds it. Same principle as the readiness score: a number the reader trusts must not flatter.
**Rules: 55** — 43 eligibility, 12 consistency. The pre-check runs 26; no issuer sees 26 questions, since the criteria diverge by exchange.
**No rule hedges any more** — the four disputes are settled (D25) and every finding gives a firm pass or fail with a clause.
**Scope:** FULL BUILD, S0 through S13. No deadline pressure.

**Standing instruction: do not commit or push unless the user asks.**

---

## Done

### S0 — Research — **CLOSED 2026-09-10** (D24)

- **Corpus closed at 8 prospectuses**, not 25. **7 are on disk**; the eighth, Quanto Agroworld, is the only fixed-price document and is inventoried but **missing** — re-download before building that branch.
- **Section map** (`07-section-map.md`) from 5 real ToCs. Boilerplate measured at **140pp (32%)**.
- **Rule sources** (`05-rule-sources.md`): **R-001 to R-027** plus **20 BSE (E-01 to E-20)** and **12 NSE (N-01 to N-12)** criteria. Two entries remain `PROPOSAL-ONLY` (R-007, R-012) and carry no rules.
- **Exchange criteria corroborated across documents** — BSE against 3, NSE against 4. This corrected five criteria and added four; see D24 and the section below.
- **Paired extraction dataset built** — `fixtures/corpus/`, restated financials as input and Capital Structure as truth, both halves for all 7 documents, guarded by `lib/corpus/fixtures.test.ts`.
- **Dropped:** MCA21 document sets (needs a paid account; the prospectus build-up gives the same allotment history). Annual reports stay at 4.
- **Still open, and not answerable from prospectuses:** O-5 Schedule VI Part A text, O-7 the amendment notification date, and the three formulation disputes O-12 to O-14.

### S1 — Skeleton, S2 — Fact base (done)

Next.js 16.3.4, React 19.2.8, Tailwind 4, Zod 4.5.4, vitest 5. Dev server on :3000. **Not deployed** — no Vercel account.

`lib/facts/` — money (decimal strings), provenance (D18), Zod schemas, `zFactBase`.
`lib/seed/vardhman.ts` — complete synthetic BSE SME issuer whose arithmetic ties.

### S4 — Document engine and Wave 1 (in progress)

`lib/document/` — `nodes.ts` (AST), `template.ts` (substitution, filters, conditionals, bold),
`section.ts` (SectionSpec, `derivedTerms`, `renderSections`, gap collection), `sections/` (the registry).

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
| Definitions and Abbreviations | **computed** | **130 authored** + 129 generated abbreviations |
| Terms of the Issue | template | |
| Other Regulatory — Authority and Confirmations | template | |
| Other Regulatory — Consents and Grievances | template | |
| Issue Procedure — Build of the Book, Withdrawal, Price Discovery | **computed** | template prose around a table node |
| Issue Procedure — Withdrawal of the Issue and Advertisements | template | Reg 247(2), Schedule X Part A |
| Other Regulatory — Jurisdiction and Experts | template | |
| Other Regulatory — Fees, Previous Issues, Statutory Statements | template | 13 short statutory statements |
| Issue Procedure — Phased Implementation of UPI | template | Phase I/II history deliberately omitted |
| Issue Procedure — Availability of the Offer Document and Forms | template | submission routes by category |
| Issue Procedure — Bids at Different Price Levels and Associates | template | cut-off confined to individuals |
| Issue Procedure — Terms of Payment and Payment Mechanism | template | anchor escrow names are facts, not derived |
| Issue Procedure — Electronic Registration of Applications | template | liability split stated both ways |
| Issue Procedure — General Instructions, Do's and Don'ts | template | verified subset only; see D29 |
| Issue Procedure — Information for Bidders and Submission of Bids | template | two single-sourced items dropped |
| Issue Procedure — Bids by Anchor Investors | template | **closes a carried gap**; 5 sources |

### S6 — Rules, dashboard, pre-check, and the link between them

`lib/rules/` holds the engine, 43 eligibility rules and 12 consistency rules, with a pass and fail
fixture for each. `components/gap-dashboard.tsx` renders findings grouped by severity with clause,
what-it-blocks and where-to-fix.

**The exchange criteria are ruled** (D23), **corrected against the wider corpus** (D24), then
**settled** (D25). EL-022 to EL-044 cover E-05, E-06, E-08 to E-20 and N-06 to N-11 — one rule per
criterion per exchange, never a shared check switched internally. E-07 and N-05 deliberately have no
rule (they restate Reg 230(1)(d) and 230(1)(h), already EL-014 and EL-015). **Every criterion now has
a rule**, E-14 included.

**What the corroboration pass changed in the code, all on 2026-09-10:**

| Rule | Was | Now |
|---|---|---|
| EL-025 (E-09 name change) | blocker on any change of name | **blocker on failing the 50% revenue test** (R-030). The flat-bar reading is gone; the rule has a pass state |
| EL-029 (IBC, promoting companies) | NSE only | **both exchanges** |
| EL-032 (trading suspension) | NSE only | **both exchanges** |
| EL-033 (delisted companies) | asserted BSE reaches every director, NSE carves out independents | **states the carve-out** (R-031); the fact itself now excludes independent directorships |
| EL-030 (E-13, 1-year limb) | promoters only | promoters **and group companies** |
| EL-022 (E-05 net tangible assets) | "must be positive" | **at least Rs 3 crore** (R-029) |
| EL-039 to EL-044 | did not exist | monetary assets capped at 50% of NTA, Reg 229(4) firm conversion, Reg 229(5) promoter change, five-year SEBI action, **board composition** (R-028) |
| EL-038 (conversion caution) | minor finding asking the issuer to confirm | **deleted** — under the revenue test a conversion passes by definition |

Also fixed while there: every window was computed with **local-time date getters**, which shifts a
regulatory deadline by a day in any timezone west of Greenwich. All date arithmetic is now UTC or
pure string arithmetic.

**The standalone pre-check is built** — `/eligibility`, six steps, no signup. `lib/rules/precheck.ts`
holds the input type, the fact-base assembly and `runPreCheck`. Verified end to end in the browser:
Vardhman's figures give "Eligible"; flagging outstanding convertibles gives "Not eligible yet" with
the Reg 228(e) citation; a name change in May 2026 and a rejected application in July 2026 give the
E-09 and E-10 findings with the dates their windows clear. Step six shows only the criteria the
selected exchange applies — BSE sees E-08, E-09, E-10 and E-18; NSE sees N-06 and N-10 instead.

**Findings are wired to the document, both directions** (D22). `renderSections` keeps the section
boundary that `renderDocument` used to flatten away; `lib/anchors.ts` derives the three id
namespaces (`sec-`, `gap-`, `finding-`) from section id, fact path and rule id, so the dashboard and
the document cannot disagree about where to point. `linkFindings` resolves each rule's `blocks`
titles against what the document actually contains — by subsection title, then by numbered-section
group — and leaves the other 24 of 37 sections as plain labels rather than links to nowhere. Verified
in the browser: all three gaps round-trip, no dangling hrefs, no duplicate ids, `:target` highlights
the placeholder on arrival.

---

## What held-out verification has caught

Every section is diffed across two sources then checked against **Century Business Media**, which is never used for extraction. It has found a real defect four times:

0. **A single-sourced paragraph in the jurisdiction disclaimer** (2026-09-10, D26) — "No person outside India is eligible to bid..." is in Om Galaxy alone, and read as part of a block whose other three paragraphs match word for word. Removed.
1. **Reg 229(1) vs 229(2)** — hardcoded 229(2) would have cited the wrong regulation for every issuer under Rs 10 crore post-issue capital. Now derived.
2. **Regional-language gloss** — Century omits it; it is in Bihar, where the regional language is Hindi and the gloss reads oddly after naming a Hindi national daily. Now conditional.
3. **Cut-off price bids** — Maxwell says rejected for "any category", Om Galaxy and Century confine it to NIIs and QIBs. Following Maxwell would have told issuers to reject valid retail bids.
4. **Category allotment counts are not computable at all** — see D20.

**Do not skip it.** Two extraction sources agreeing is not enough; three of these were cases where both sources agreed and were still wrong or incomplete.

**And read the context of a mismatch before believing it.** Century appeared to contradict both sources on withdrawal rights — the sentence turned out to be risk factor 58, not the Issue Procedure. A grep hit in a 300-page document is evidence only when it sits in the same section. D26.

**The held-out document can also simply be wrong.** On UPI it describes Phase III as a future timeline "as may be prescribed by SEBI" against five documents stating the December 1, 2023 mandatory date — stale boilerplate, like Shakti's pre-amendment figures. A mismatch is a question to adjudicate, not a veto. D27.

**Two sources agreeing is a floor, not a proof — and a wrong clause can already have shipped.** A
Rs 2,00,000 cap on individual bids, stated by two extraction sources, contradicts R-006 and was
sitting in Grounds for Technical Rejection from an earlier session, where it told issuers to reject
every valid SME retail bid. **When an extracted clause contradicts a figure the same document states
elsewhere, the clause is copied, not drafted.** Tests now assert across the WHOLE rendered document,
not the section under test. D29.

**Single-source sentences cluster in Om Galaxy.** Three have been caught so far and all three were its. At 509 pages it is the longest document and the primary BSE source, so it carries text nobody else carries, inside blocks that otherwise match word for word. Run the per-clause source count explicitly when extracting from it.

---

## Next action

**S4 Wave 1 is next**, by the user's instruction. Resume with the list below.

S0 and S6 are both closed to the extent the corpus can close them. What is left in each needs a
source the corpus does not contain:

- **O-5 Schedule VI Part A** — the disclosure spec the section registry must satisfy. Highest-value
  remaining research item by a distance.
- **O-7** the amendment notification date. **O-11 to O-14 are closed** (D25).
- **More consistency rules** as later modules land — RPT figures across sections, capitalisation
  tying to the balance sheet, lock-in reconciling with the build-up. These need M2 and M6 data the
  seed does not yet carry in the shape the rules would read.

Four design points already paid for and worth preserving:

- **Every rule needs a pass state.** EL-016 originally fired for any issuer with a capex object and
  could never be cleared. That is a notice, not a check, and a dashboard item that never goes away
  teaches the reader to skip the list. Fixed by adding `offer.firmFinanceConfirmed`.
- **The score must agree with the findings list.** It first read 100/100 above three outstanding
  items, because the summary counted rules but not document gaps. The score is the first thing an
  issuer looks at; it cannot contradict what is directly beneath it.
- **A link that scrolls nowhere is worse than plain text** (D22). It teaches the reader that the
  links do not work, and they stop trying the ones that do.
- **The six-month rule is two rules** (D23). BSE looks at the issuer's rejected application, NSE at
  the merchant banker's returned drafts. Any future "these two criteria are basically the same"
  simplification should be checked against this pair first.

**Wave 1, what is left after 2026-09-10.** Issue Procedure — the largest single section in the
document at 29 to 36 pages measured — is complete. Other Regulatory is now substantially complete —
jurisdiction, experts, fees, previous issues, outstanding instruments, option to subscribe, stock
market data, tax implications, capitalisation, revaluation, purchase of property, payment to
officers and the Reg 300(1)(c) statement all landed. In descending value:

1. ~~Issue Procedure~~ — **COMPLETE 2026-09-10.** Every subsection observed across the corpus is
   built. The Do's and Don'ts reproduce only the items verified in two or more sources; a banker may
   add more, and D29 records why we do not.
2. **Definitions** — 130 entries authored, up from 79. What is left is the **sector glossary**,
   which cannot come from another issuer's document at all, and a handful of entries that belong to
   one issuer alone (its manufacturing units, its industry report, its disassociated promoter
   group). Neither is extractable; both need the issuer.
3. **Other Regulatory stragglers** — "Fees Payable to Others" is in Maxwell ALONE and was left out
   for that reason; Servicing Behaviour and Status of Investor Complaints are not yet checked for
   two-source support.

**Main Provisions of AoA (~38pp) is the largest remaining section but is blocked** — extracted per-issuer from the company's own articles, so it needs S7 upload and extraction, not templating.

---

## Known gaps carried

- IRDAI exposure-norms list — only the first limb verified
- Section 40(3) separate-bank-account bullet — rests on Maxwell alone
- R-007, R-012 still `PROPOSAL-ONLY`
- Part A of Schedule VI full text (O-5) — the disclosure spec the registry must satisfy
- ~~The exchange criteria come from one prospectus per exchange.~~ **Corroborated 2026-09-10** — and
  it found five wrong criteria, which is the strongest argument in the project for never shipping a
  single-sourced one. Rows still resting on one document say so in `05-rule-sources.md`; N-08 is the
  main one.
- ~~Three criteria are stated differently by two bankers.~~ **Settled 2026-09-10 (D25).** O-11 to
  O-14 all closed against the rulebooks, recorded as R-028 to R-031 at a new `DETERMINED` confidence
  level. The superseded readings stay in the rows so the change is auditable.
- **The woman-director requirement is not ruled.** Rule 3 triggers at Rs 100 crore paid-up capital,
  four times the SME ceiling, so it cannot bind through capital; the turnover limb could in theory,
  but the fact base carries no director gender.
- **The monetary-assets test is silent where the split is not disclosed.** Defaulting it to zero
  would silently pass a test that never ran.
- **E-06 checks that a website address is stated and well formed**, not that the site is reachable.
  The rule says so in its own finding text.
- **Table cells cannot carry placeholders.** A gap inside a table is a plain string, invisible to
  `collectPlaceholders`, so it raises no finding. Issue Structure is correct only because it also
  places a placeholder in the paragraph above the table. A test now enforces that pairing; the real
  fix (placeholder runs inside cells) waits until a section needs it.

---

## Gotchas discovered

- **`create-next-app` overwrites `CLAUDE.md`** with a stub pointing at its `AGENTS.md`. Restored; the `@AGENTS.md` import is kept at the top.
- **Directory name `Setu` has a capital letter** — npm rejects it as a package name. Scaffold elsewhere and move.
- **`@types/node` shipped as ^20** while Node is v22; vitest would not install. Bumped to ^22.
- **Zod 4 `io: 'input'` omits `additionalProperties: false`**, which Claude strict tool use needs. `extractionSchemaFor()` adds it back (D19).
- **The `s` regex flag** needs an es2018 target; use `[\s\S]`.
- **Bold must be split BEFORE `{{ }}` substitution**, or `**{{ x }}**` leaves orphaned asterisks.
- **Tailwind's `target:` variant styles the element carrying the id**, not an ancestor. The gap anchor sits on the `<mark>`, with the `<a>` wrapped around it — the other way round, the highlight never lights up on arrival.
- **ToC page numbers are not physical PDF pages** — search the text, do not trust the ToC number.
- **`pdftotext` to a file, then node, beats shell pipelines.** `grep`/`tr` on a whole prospectus collapsed to one line either crashes or hangs; a 120s timeout was hit that way. WebFetch also fails on SEBI PDFs — download and extract locally.
- **Filters chain** (`| date | upper`), which matters inside the capitalised statutory clauses.
- **Browser screenshots sometimes return blank** at certain scroll positions while the DOM is correct. Verify content through `javascript_tool`, not screenshots alone.
- **`vitest run` swallows `console.log`** unless given `--silent=false`.
- **`new Date(y, m, d)` is LOCAL time and `toISOString()` is UTC.** Mixing them moved a regulatory deadline a day earlier. Do date arithmetic on the ISO string parts, or use `getUTC*` throughout.
- **Prospectus section headings vary by drafter** — `CAPITAL STRUCTURE` versus `SECTION V - CAPITAL STRUCTURE`, and three different spellings of the financial section. **The auditor's examination report is a far better anchor than the heading above it.** Match headings case-sensitively; they are set in capitals, and matching loosely lands on cross-references in body text.
- **"Authorized" and "Authorised" both appear** — 4 of 7 documents use the American spelling in the capital structure table.
- **An issuer's eligibility list may appear TWICE** in one document, and the second list is not a repeat. Om Galaxy has a Reg 228/230 list, then a 15-item exchange list, then the Reg 229(3) list — and E-09 and E-10 appear only in the middle one. Reading the 229(3) list alone concluded, wrongly, that two criteria had no corpus support at all.

---

## Environment notes

- **No Anthropic API credits.** Not blocking: S3, S4, S5, S6, S11 need none. Only S7 (extraction), S9 (narrative) and S10 (risk narrative) do.
- Supabase: not created. Local JSON until S7.
- Vercel: not created.
- Corpus gaps: 17 more prospectuses; missing sectors (IT/services, trading, textiles, chemicals, pharma); only 1 OFS example; 5+ fixed-price documents needed before that branch.
