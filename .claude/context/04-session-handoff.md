# Session handoff

**Overwrite this file at the end of every session.** It is a snapshot, not a log — history belongs in `03-decision-log.md`.

---

**Last updated:** 2026-09-11 (evening session — Gemini wired, S9/S10 opened)
**Current stage:** S0, S3, S5, S6, S8, S11 CLOSED. S4 Wave 1 extraction finished; Wave 2 computed sections built. **S9 and S10 now genuinely in progress** — no longer credit-blocked (D43), and no longer just scaffolding: real drafted content exists and has been read on the rendered page (D55).
**Status:** **593 tests passing, tsc clean, dev server runs.** Document renders **29 of the 37 numbered subsections**. **All ten intake modules exist** and Vardhman completes nine of them outright (see S8 below). **Issue Procedure is COMPLETE**, the glossary is at **130 definitions plus 129 abbreviations**, and **Risk Factors is a real, populated section** — 15 archetypes, 11 of which fire on Vardhman with LLM-drafted prose behind every one.

**The progress indicator said "25 of 37" until 2026-09-10 and was wrong** — it counted registry entries against numbered subsections. Every spec now carries `partOf`, the header counts distinct values, and a test holds it. The count has moved honestly since — 24 → 25 (D45, Risk Factors) → 26 (D50, History) → 27 (D51, Our Business) → 28 (D52, Objects of the Issue) → 29 (D54, MD&A) — each one a real section with a passing traceability gate behind it, not a relabelling.
**Rules: 55** — 43 eligibility, 12 consistency. The pre-check runs 26; no issuer sees 26 questions, since the criteria diverge by exchange.
**No rule hedges any more** — the four disputes are settled (D25) and every finding gives a firm pass or fail with a clause.
**Scope:** FULL BUILD, S0 through S13. No deadline pressure.

**Standing instruction: do not commit or push unless the user asks.**

---

## Done

### S9 / S10 — Gemini wired, risk archetypes, the drafting harness, four narrative sections — **IN PROGRESS 2026-09-11** (D43–D55)

**The provider decision.** Gemini free tier, not Claude, not paid — a hobby-project call (D43),
made explicitly with the trade-off written down: free-tier content trains Google's models, fine for
the Vardhman seed and the public corpus, would need revisiting before any real issuer's data reached
it. `lib/llm/client.ts` — `LlmClient` interface, `createGeminiClient()`, `createFakeClient()` for
tests (D14 made mechanical). **Read D47 before writing any extraction prompt**: the first real call
proved the extraction schema was forcing the model to invent a CIN, a date and a website — fixed by
making `extractionSchemaFor()` never mark anything `required`, since "required for a usable fact
base" is `isUsable()`'s job, not the tool schema's.

**The risk engine (S10).** `lib/risk/` — `RiskArchetype` (trigger/materiality/detail/factSlice),
`selectRisks()`. **15 archetypes**, each traced to a corpus document or an existing computed table,
never invented from the schema alone (D44, D46, D48, D49, D52, D53, D54) — see the decision log for
which document(s) support each one and which themes were checked and deliberately NOT built
(universal boilerplate has no place here). `lib/document/sections/risk-factors.ts` renders them for
real — Risk Factors is `producer: 'computed'`, not `'narrative'`, since the selection and the terse
`detail()` sentence are pure TS (D45).

**The drafting harness (S9).** `lib/llm/narrative.ts` — `draftNarrative()` (one shared no-invention
system prompt), `untraceableNumbers()` (the mechanical subset of the "20 sentences must trace" gate:
every number in a draft must appear in its factSlice). `lib/store/narrative-store.ts` — append-only
per-id versions, same shape as `fact-store.ts`. **`readNarrative(id, currentFactSlice)` only returns
a draft if the factSlice matches EXACTLY** (D51) — added after a draft written for Vardhman leaked,
unchanged, into a completely different issuer's rendered document in an existing test. `promptSpec`
now lives on `SectionSpec` for real (D51); `renderSection`'s `narrative` case reads the store, same
honest fallback shape as everything else — real content where it exists, a placeholder where it
does not.

**Four real narrative sections, each deliberately scoped to what the fact base can honestly
support**, not the full chapter a real prospectus carries: History and Corporate Matters (D50,
incorporation/name changes/conversion — pure facts, no judgement), Our Business (D51, the flagship
section, scoped to the "Overview" opening paragraph only), Objects of the Issue (D52, the narrative
half of an "N + C" section — the computed means-of-finance tables are NOT built), MD&A (D54, revenue
and PAT trend with pre-computed growth percentages).

**D55 — render and look, applied to S9/S10 output for the first time, caught a real systemic bug.**
Five archetypes (all predating D52's money-formatting lesson) were printing raw rupee integers —
`21000000`, and once a materiality threshold as `1208333.3333333333333333334` — into both the
computed fallback AND the model's factSlice. The traceability gate could not catch this: every
number WAS in the factSlice, just never formatted. Fixed at the source
(`formatAs()` before a money value reaches either path), re-drafted all eleven risks that fire on
Vardhman, re-rendered, re-read the pages. **Do this again before the next archetype batch ships** —
nothing that produces money for a document is verified until someone has looked at the actual page.

**Not yet built:** ~25 more archetypes toward the ~40 target (auditor qualification and unsecured
loans repayable-on-demand were seen but need more corroboration or a clearer fact); the same harness
applied to Basis for Issue Price or Industry Overview, both of which need data this fact base does
not carry yet (peer comparables, a commissioned industry report) — new intake, not just new prompts.
S7 (extraction from uploaded documents) is untouched — the harness that would power it exists and is
proven, but nothing reads an uploaded PDF yet.

### S8 — Modules M3–M10 and Wave 2 computed sections — **CLOSED 2026-09-11** (D37, D38, D39)

**Engine changes first, because "pure content" was not quite true:** `Field.columns` replaces the
page's column map; the repeater gained `money`, `boolean` and `list` cell types (fixing an S5 bug
where every money cell stored a number and failed `zMoney`); nullable fields and tables have a
**None** state that saves `null` / `[]` and counts as answered (D37); `plannedSections` lets a field
name a section not yet built and say so. `lib/rules/precheck.ts` now spreads `emptyFactBase()`, so
a schema addition lands in one place.

**Schemas:** `promoters`, `management`, `business`, `legal`, `approvals`, `group-companies` are
real files now, each with the fields its section prints; `financials` gained the capitalisation
lines, `borrowings` and `contingentLiabilityItems`; `capital.depositoryAgreements` gained dates.

**Modules** (`lib/modules/m3-*.ts` to `m10-*.ts`): 136 fields across the ten, every one with a
"why we ask", a clause where one exists, and a destination. Vardhman completes nine outright; M9
leaves exactly the three DRHP-stage unknowns (anchor escrow names, expert consents) unanswered,
and the gate test names them.

**Computed sections** (`lib/document/sections/`): `management.ts` (#19), `promoters.ts` (#20),
`group-companies.ts` (#21), `indebtedness.ts` (#25 Capitalisation, #27 Indebtedness),
`litigation.ts` (#28), `approvals.ts` (#29), `introduction.ts` (#5 The Issue, #6 Summary of
Financial Information as EXTERNAL, #7 Contingent Liabilities, #8 RPTs). Structure and connecting
sentences from Om Galaxy and Maxwell, both read for every section; what each derives, asks and
checks is in D39. Pure computations sit in `lib/legal/materiality.ts` and `lib/financials/tables.ts`.

**Verified:** 78 new tests — the materiality threshold arithmetic, the indebtedness subtotals, the
capitalisation ratios, each section's specific rows against the seed's own arithmetic, gaps not
crashes for a one-fact issuer, no seed text leaking into a real issuer, the module gate. In the
browser: all ten modules list with honest estimates; M4's board table round-trips a boolean, a
list and a money cell to the store as `true`, `[...]` and a string; removing the last row saves
`[]`. Rendered through LibreOffice: the board table, the litigation section with its computed
threshold, the indebtedness summary — all read as the corpus does.

**Not in S8, listed for later:** committee terms of reference, Interest of Directors / Promoters
and the promoter undertakings (boilerplate, Wave 1 style extraction); Other Financial Information
(EPS, RoNW, NAV — computable) and Material Contracts (computable from M9 dates); the M5 fields feed
Our Business and Risk Factors, which are S9/S10.

### S11 — DOCX export and the working papers — **CLOSED 2026-09-11** (D35, D36, D40)

`lib/document/docx.ts` — `renderDocx(sections, { facts, certified, version })` over the SAME
`RenderedSection[]` the HTML view consumes. Title page, pre-filled and hyperlinked table of
contents (D36), numbered SECTION groups as Heading 1 with the subsections beneath, justified
body, bullet and numbered lists via a numbering config, fixed-layout tables whose grid sums to
the A4 text width, every placeholder as a yellow-highlighted run bookmarked on first occurrence,
page-X-of-Y footer, and the `UNSIGNED DRAFT — NOT FOR FILING` notice in the running header until
`certified` (D35 — **no page watermark, by user decision**).

`app/export/docx/route.ts` serves it; `lib/issuer.ts` is the single loader both the preview and
the export use, so they cannot show different issuers. The home page links to it. There is no
query parameter that lifts the notice — S12's certification action is what will.

`lib/anchors.ts` gained `bookmarkName()`: Word bookmarks are 40 characters, letters, digits and
underscores, so the DOM anchors are mapped rather than duplicated.

**Verified:** 18 vitest cases open the zip and read the XML — heading styles the ToC field
reads, highlight count equals placeholder count, one bookmark per gap and per section, every
run of 40+ characters present, no `{{` leaks, grids sum to the text width, ordered lists restart,
ToC entries link to bookmarks, notice present/absent by `certified`. Then rendered through
LibreOffice and rasterised (pypdfium2 in a scratchpad venv — no pdftoppm on this machine) and
read page by page: 49 pages for Vardhman, tables inside the margins, inline bold preserved.
The route returns 200 with the right MIME type, filename and a valid zip.

**Opened in Microsoft Word by the user, 2026-09-11 — gate passed.** ToC and page numbers
populate on the update-fields prompt; tables and placeholders as intended.

**S11 CLOSED 2026-09-11.** `/export/gaps` (workbook: Findings, Placeholders, Provenance —
`lib/export/gap-report.ts`), `/export/pdf` (a LibreOffice print of the DOCX, 501 without it —
D40, `lib/export/pdf.ts`), `/export/vault` (zip of DOCX, PDF, workbook, fact base, provenance,
manifest — `lib/export/bundle.ts`). One `assemble()` feeds every route. 9 tests open the workbook
and the zip; the PDF test runs where LibreOffice is found. The "250+ pages" gate waits on S9.

**What the render caught that the tests did not** (the D34 lesson, again):
- The first watermark, a text frame, painted OVER the body — a Definitions row was unreadable.
  Only the rasterised page showed it. Watermark since removed (D35), but the lesson stands:
  **render and look at the pages before calling any DOCX change done.**
- The EXIM abbreviation carried U+FFFD for an en dash, in the fixture and the section. Fixed
  against the source PDF.
- The sparse document prints "Bid Lot: 0 Equity Shares" — the empty fact base's zero, in a table
  cell, where a gap should be. That is the known "table cells cannot carry placeholders" gap
  below, now visible in the deliverable rather than only in the preview.

### S0 — Research — **CLOSED 2026-09-10** (D24)

- **Corpus closed at 8 prospectuses**, not 25. **7 are on disk**; the eighth, Quanto Agroworld, is the only fixed-price document and is inventoried but **missing** — re-download before building that branch.
- **Section map** (`07-section-map.md`) from 5 real ToCs. Boilerplate measured at **140pp (32%)**.
- **Rule sources** (`05-rule-sources.md`): **R-001 to R-027** plus **20 BSE (E-01 to E-20)** and **12 NSE (N-01 to N-12)** criteria. Two entries remain `PROPOSAL-ONLY` (R-007, R-012) and carry no rules.
- **Exchange criteria corroborated across documents** — BSE against 3, NSE against 4. This corrected five criteria and added four; see D24 and the section below.
- **Paired extraction dataset built** — `fixtures/corpus/`, restated financials as input and Capital Structure as truth, both halves for all 7 documents, guarded by `lib/corpus/fixtures.test.ts`.
- **Dropped:** MCA21 document sets (needs a paid account; the prospectus build-up gives the same allotment history). Annual reports stay at 4.
- **Still open, and not answerable from prospectuses:** O-5 Schedule VI Part A text, O-7 the amendment notification date, and the three formulation disputes O-12 to O-14.

### S3 — Module engine and M1 — **DONE 2026-09-10**

`lib/modules/` — `types.ts` (Module, Field, FieldView, progress), `m1-company.ts` (13 fields
growing to 15 by `showIf`), `index.ts` (registry, progress, feedsInto resolution).
`components/module-form.tsx` is ONE renderer for all ten modules (MM2); adding M2 adds no UI code.

`lib/store/fact-store.ts` — append-only local JSON. Every write is a numbered version and
`current.json` is a pointer; nothing is overwritten, because "who changed this figure, and when" is
a question a merchant banker asks about a document carrying their signature. A write that changes
nothing is not versioned, since autosave fires on every blur.

**A real issuer now replaces the seed.** `/` reads the store: with no answers it shows the demo
issuer, and once anything is typed it lays the answers over an EMPTY fact base rather than over
Vardhman. Merging onto the seed would have produced a document that reads as complete while
carrying another company's figures in every unanswered place — D21 as a product decision. Verified:
typing one company name gives 56 findings and 29/100, which is the honest state of a blank document.

**Gate passed in the browser:** filled M1, reloaded, answers persisted; every field shows "Why we
ask" with its clause and where it appears; declaring an LLP conversion revealed the conversion-date
field (13 fields to 14); an invalid website saved AND reported "Invalid URL. This does not look
like a usable web address."

### S5 — Repeater, M2 and the capital tables — **DONE 2026-09-10**

`lib/capital/tables.ts` computes the build-up, the shareholding pattern before and after the issue,
the top-ten holders, the promoter contribution and the full lock-in ladder (R-009), plus the two
live consistency checks. `lib/document/sections/capital-structure.ts` renders them — five tables,
entirely computed, nothing typed twice.

`components/repeater.tsx` is the workhorse: add, remove, reorder, running totals, and **paste
straight from a spreadsheet**. The parser lives in `lib/modules/paste.ts` as pure logic, because it
is the highest-risk code in the intake — nobody types an allotment history, and a silent misparse
corrupts the build-up while producing rows that look right.

**Gate passed:** Vardhman's history in gives correct tables; the **ground-truth pair reproduces Om
Galaxy's published build-up row for row** (`lib/capital/tables.test.ts`); breaking the register to
99.4% fires the banner live, without a reload; 20 vitest cases on build-up, lock-in and
capitalisation.

Two things browser verification caught that the unit tests could not:
- **Pasting over existing rows appended instead of overwriting**, so an issuer pasting their full
  history over a partly typed list got every row twice and a doubled cumulative total. `applyPaste`
  now follows spreadsheet semantics. The paste parser's own tests were all green — the bug was in
  the splice, not the parse.
- `revalidatePath('/intake')` does not reach nested module pages; it needs `'layout'`, or the live
  consistency banner only appears after a manual reload.

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
| Certain Conventions and Presentation of Data | template | page cross-references dropped |
| Dividend Policy | template | record-date paragraph dropped, single-sourced |
| Restrictions on Foreign Ownership | template | no sectoral cap recited |
| Declaration | **computed** | signature block built from the fact base |

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

**S8 gate in the browser is the user's to confirm** — fill a module or two on the real issuer and
check the None affordance and the new cell types feel right. Still true, still not done. Then, in
order of value:

1. ~~S11 leftovers~~, ~~Wave 2 stragglers~~ — **done 2026-09-10/11.**
2. **Keep growing S10 (risk archetypes).** All seven corpus documents mined at least once toward
   the ~40 target (15 done). The next pass either needs a deeper re-read of documents already
   checked, or a new fact with no existing table to lean on (auditor qualification,
   unsecured-loans-on-demand were seen, not yet built). Pattern to follow: `lib/risk/archetypes.ts`'s
   own comments cite exactly which corpus documents support each one — match that discipline.
3. **Keep growing S9 (narrative sections).** Four done (History, Our Business, Objects of the
   Issue, MD&A), all deliberately scoped to an opening paragraph the fact base can honestly
   support. The next two planned ones (`particulars.basisForIssuePrice`,
   `aboutCompany.industryOverview`) need data this fact base does NOT carry — peer comparables, a
   commissioned industry report — so they need new M-module intake before a `promptSpec`, not just
   a new prompt.
4. **Before shipping the next archetype or section: render and look (D55).** Generate the DOCX
   (`SETU_DOCX_OUT=<scratchpad>/vardhman.docx npx vitest run lib/document/docx.test.ts`), convert
   with LibreOffice (`"/c/Program Files/LibreOffice/program/soffice.exe" --headless --convert-to
   pdf --outdir <dir> <dir>/vardhman.docx`), rasterise with pypdfium2 in a scratchpad venv, actually
   read the pages. This is what caught D55 — a bug that was invisible to every automated check.
5. **S7 (extraction) is untouched.** The harness exists and is proven (`lib/llm/client.ts`,
   `extractionSchemaFor()` fixed per D47), but nothing reads an uploaded document yet. Two-pass page
   targeting, the review-and-confirm UI, snapshot-to-fixtures discipline (D14) — all still to build.
6. **S12** review workflow, which is what wires `certified` — and lifts the draft notice in every
   export at once, since they all go through `assemble()`.
7. **Browser pass over M3-M10** — still not clicked through since the S8 session's check.

To regenerate DOCX samples without the server:
`SETU_DOCX_OUT=out/vardhman.docx npx vitest run lib/document/docx.test.ts`.


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

**Wave 1 extraction is now finished** except for #16 Key Industry Regulations and Policies, which is
sector-switched: the generic company law and labour law core is shareable, but the sector-specific
half is the same problem as the sector glossary and needs the issuer's sector. Everything else left
in S4 is computed (needs S3/S5/S8), narrative (needs S9/S10 and credits), external (auditor/CA), or
the AoA (needs S7 upload).

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
- **No `pdftoppm` on this machine, and the Browser pane downloads PDFs rather than showing them.**
  To look at a rendered DOCX: LibreOffice `soffice --headless --convert-to pdf`, then rasterise
  with `pypdfium2` + `pillow` in a venv under the scratchpad, then Read the PNGs. The Read tool
  cannot render PDF pages here without pdftoppm.
- **A `docx` text frame with `wrap: none` paints over the body**, not under it. Word's own
  watermark is VML (`v:textpath`, WordArt shapetype 136, negative z-index), and `docx`'s
  `Textbox` emits a stroked, filled box — neither is a drop-in. Moot after D35, but recorded.
- **`docx` cached ToC entries use styles `TOC1`..`TOC3`** and render flat unless those styles are
  defined. Define them with Word's names (`toc 1`) so the regenerated field uses them too.
- **`<w:updateFields/>` with no attribute means true.** Do not assert on `w:val="true"`.
- **`jszip` is a transitive dependency of `docx`**; it is now an explicit devDependency because
  the tests import it.
- **A shell command can be too long to spawn** (`ENAMETOOLONG` from a heredoc'd Python patch of
  the seed). Write the patch to the scratchpad and run the file.
- **The repeater's remove button sits off-canvas on wide tables** (horizontal scroll inside the
  table). The browser tools cannot click it; `javascript_tool` can, for verification.
- **`.data/` is the user's own store.** Anything typed into it during verification must be taken
  back out, as a new version — it is append-only. Done this session (v15 removes v13-v14's test row).
- **`new Date(y, m, d)` is LOCAL time and `toISOString()` is UTC.** Mixing them moved a regulatory deadline a day earlier. Do date arithmetic on the ISO string parts, or use `getUTC*` throughout.
- **Prospectus section headings vary by drafter** — `CAPITAL STRUCTURE` versus `SECTION V - CAPITAL STRUCTURE`, and three different spellings of the financial section. **The auditor's examination report is a far better anchor than the heading above it.** Match headings case-sensitively; they are set in capitals, and matching loosely lands on cross-references in body text.
- **"Authorized" and "Authorised" both appear** — 4 of 7 documents use the American spelling in the capital structure table.
- **An issuer's eligibility list may appear TWICE** in one document, and the second list is not a repeat. Om Galaxy has a Reg 228/230 list, then a 15-item exchange list, then the Reg 229(3) list — and E-09 and E-10 appear only in the middle one. Reading the 229(3) list alone concluded, wrongly, that two criteria had no corpus support at all.
- **The module engine's `Field` type has no object kind, only scalars and tables.** A schema field designed as a nested object (`primaryMarket: { description, revenueSharePercent }`) cannot be asked through the form at all. Caught before it shipped (D54) — flatten to two top-level fields instead.
- **A stored LLM draft must be re-validated against the CURRENT factSlice, not just checked for existence.** `readNarrative(id)` alone let a draft generated for one issuer's facts render, unchanged, for a different issuer entirely — caught by an existing "no seed text leaks" test, not a new one. Fixed by requiring the caller's current factSlice and comparing by `JSON.stringify` equality (D51); the signature is `readNarrative(id, currentFactSlice)` now, not `readNarrative(id)`.
- **The traceability gate (`untraceableNumbers`) needs the same "run it for real" discipline as everything else.** Its first version glued a sentence-ending period onto a preceding number (`1600000.` did not match `1600000`) and could not equate `8.40` with `8.4`. Fixed by parsing every number to a float and comparing values, never substrings (D51).
- **Every money value reaching a `detail()` string or an LLM `factSlice` must go through `formatAs()`.** Five risk archetypes shipped without it and printed raw rupee integers on the actual rendered page — technically traceable (the gate passed), unreadable. `formatAs(v, 'lakhs')` for threshold/litigation-scale figures, `'crores'` for balance-sheet-scale ones, matching what the corpus itself uses at each scale (D55).
- **A model told "state only these facts" will still reach for outside knowledge that happens to be true** — asked to discuss "Fiscal 2026", Gemini wrote "the financial year ended March 31, 2026," correct but untraceable, since the factSlice only ever gave the bare year. Not a gate problem (a WRONG date would look identical) — fixed by naming the exact terminology to use in the instructions, matching what the corpus itself calls these years (D54).
- **`soffice.exe` is not on PATH on this machine** — full path is `/c/Program Files/LibreOffice/program/soffice.exe`. Python is at the Microsoft Store alias; `python -m venv` plus `pip install pypdfium2 pillow` inside it works for rasterising a converted PDF page by page.
- **A heredoc's `cat > file.py` writes to the CURRENT shell cwd, evaluated before a later `cd` in the same command runs.** `SP=...; cat > file.py <<EOF ... EOF; cd "$SP"` writes `file.py` into the ORIGINAL directory, not `$SP` — leaves a stray file in the repo root if that original directory is the project. `cd` first, or use the Write tool with an absolute path.

---

## Environment notes

- **Gemini free tier, `GEMINI_API_KEY` set in `.env.local`, now genuinely in daily use** (D43, D47, D50–D55) — not just a smoke test. This session alone: 2 extraction calls, ~15 risk-narrative drafts, 4 section drafts, several re-drafts after fixing bugs the first pass caught. Not a paid account; see D43 for the data-use trade-off this accepts. `.env.local` is gitignored, never commit it.
- Real narrative output lives in two places: `.data/narratives/` (gitignored, what the app actually renders) and `fixtures/narrative/` + `fixtures/llm-verification/` (committed, D14 snapshots — small, no secrets, worth keeping as before/after proof).
- One-off drafting/verification scripts this session (not committed, but the pattern is worth reusing): a scratchpad `.ts` file using `pathToFileURL()` + dynamic `import()` to load project TS modules, run via `npx tsx`, with `GEMINI_API_KEY` exported into the shell first (`export $(grep -v '^#' .env.local | xargs)`).
- Supabase: not created. Local JSON until S7.
- Vercel: not created.
- Corpus gaps: 17 more prospectuses; missing sectors (IT/services, trading, textiles, chemicals, pharma); only 1 OFS example; 5+ fixed-price documents needed before that branch. All 7 documents on disk are now mined at least once for risk-factor themes (D44–D54).
