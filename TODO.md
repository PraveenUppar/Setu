# Build TODO

Each stage ends with something demoable and a manual test gate. **Do not advance until the gate passes.**

`🔴 core` (MVP dies without it) · `🟡 demo` (needed for the pitch) · `🟢 extended`

**Progress** (`[x]` done, `[~]` partial, `[ ]` not started) — updated 2026-09-12

| S0 | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | S12 | S13 |
|----|----|----|----|----|----|----|----|----|----|-----|-----|-----|-----|
| [x] | [x] | [x] | [x] | [~] | [x] | [x] | ⏸ | [x] | [x] | [~] | [x] | [ ] | [ ] |

**⏸ = paused by explicit user decision (S7, 2026-09-12) — not done, not abandoned, not being worked on unless the user asks again.** Different from `[ ]` (not started) and `[~]` (in progress): this is a stage someone deliberately chose to stop advancing, with working code left in place.

**Tests, tsc and dev-server status live in `.claude/context/04-session-handoff.md`** — this table is stage-level only, so the two cannot contradict each other.

- **S0 closed 2026-09-10** at 8 prospectuses rather than 25. Criteria corroborated across documents, paired fixtures built. 2 of 27 rule rows remain `PROPOSAL-ONLY` and carry no rules; O-5 (Schedule VI Part A) and O-7 (notification date) need SEBI's own text and stay open.
- **S4 partial:** engine complete; **24 of the 37 numbered subsections** built, as 43 registry sections. Wave 1 extraction and Wave 2 are complete, standing boilerplate included — what remains is narrative (S9/S10), the AoA (S7), or external.
- **S3 and S5 done 2026-09-10** — module engine, M1, M2, the repeater with spreadsheet paste, and the computed capital tables. A real issuer's answers now replace the seed.
- **S6 closed 2026-09-10:** rule engine, gap dashboard, standalone `/eligibility` pre-check, finding-to-document links, and all 32 exchange criteria ruled. Every finding gives a firm pass or fail with a clause — no rule hedges. Remaining consistency rules wait on M2 and M6 data (S5, S8).
- **S7 opened 2026-09-12 (D56), committed and pushed 2026-09-12 afternoon, PAUSED by user decision the same day (D67).** Real, tested, on `origin/main` — 2 of 8 checklist items and 1 of 4 gate items done, the rest partial or not started (see the S7 section below for the verified item-by-item state). **The user decided to skip document upload/extraction entirely: hand-typed form fields only, for as long as this project runs.** Nothing was deleted — `app/extract/`, `lib/document-intake/`, `lib/llm/extraction.ts`, `lib/store/document-storage.ts` all still exist and still pass their tests, dormant rather than removed. Do not resume S7 work without the user explicitly asking again; do not delete it either unless asked.
- **S11 closed 2026-09-11:** `renderDocx()` over the same AST, `/export/docx`, pre-filled ToC, highlighted and bookmarked placeholders, draft notice in the header until certified (no page watermark, D35). Word gate passed. Then `/export/gaps` workbook, `/export/pdf` (LibreOffice print, D40) and `/export/vault`.
- **S8 closed 2026-09-11:** all ten modules on one engine, ten Wave 2 computed sections, 22 of 37 subsections. None-as-an-answer (D37). Vardhman completes nine modules; M9 leaves the three DRHP-stage unknowns.
- **S9 CLOSED 2026-09-12 (D68).** All six planned narrative sections built (History, Our Business, Objects of the Issue, MD&A, Basis for Issue Price D64, Industry Overview D65), and all three gate items now pass, including a real systematic register-and-structure diff against the corpus (D68) that found and fixed three real gaps (Objects of the Issue's list structure, Basis for Issue Price's book-building clause, MD&A's cross-references) and corrected a wrong design assumption about Industry Overview (real SME issuers commonly use public industry data, not a commissioned report).
- **S10 partial, gate fully passing:** 20 of the ~40 target archetypes (D44–D57, D60–D63); every OTHER checklist item and every gate item is done — trigger/materiality engine, LLM narrative per risk, dismiss-with-reason (D58), why-this-was-flagged (D59). Marked partial, not closed, because the breadth target is still over half short, not a mere straggler.

---

## 🔴 S0 — Corpus & research · 2 days

**No code.** This is the spec, the templates, and the tests all at once.

### Corpus — **closed at 8 prospectuses, 2026-09-10** (was 25)

- [x] ~~Pull 25 SME prospectuses~~ → **8**, of which 7 are on disk. Quanto Agroworld (the only fixed-price document) is inventoried but missing and needs re-downloading.
- [x] ~~Filter to fixed-price; tag by sector~~ → **superseded by D15.** The corpus is 7 book-built and 1 fixed-price, which is what reversed the plan to book-built-first in the first place.
- [x] **Reverse the corpus** — `fixtures/corpus/`, restated financials as input and Capital Structure as truth, both halves for all 7 documents. Guarded by `lib/corpus/fixtures.test.ts`.
- [ ] ~~MCA21 full document sets for 3 companies~~ — **dropped.** Needs a paid account and manual downloads per company; PAS-3 allotment history is the only piece the build actually wants, and S7 gets that from the prospectus capital build-up instead.
- [ ] ~~10 SME annual reports~~ → **4 is enough.** They were extraction inputs, and `fixtures/corpus/` is a better-paired dataset for that.

### Research
- [x] Chapter IX read as-applied through the corpus. **Schedule VI Part A text still not located — O-5, the one real research gap left.**
- [x] `05-rule-sources.md` built: R-001 to R-027, 20 BSE criteria (E-01 to E-20), 12 NSE (N-01 to N-12).
- [x] 2025 amendments verified against real filings. The board memo was wrong on 5 of 6 figures.
- [x] Section map from 5 real ToCs (`07-section-map.md`).
- [x] **Exchange criteria corroborated across documents** (2026-09-10) — BSE against 3, NSE against 4. Corrected five criteria, added four, and produced O-12, O-13 and O-14.

### ✅ Gate
- [x] Can name every section of an SME draft prospectus from own map
- [~] **Every threshold has a clause citation.** 2 of 27 rows remain `PROPOSAL-ONLY` (R-007 minimum issue size, R-012 migration compliance) and no rule is built on either. Zero numbers from memory.
- [x] ~~20~~ **7 input/ground-truth pairs on disk** — `fixtures/corpus/`, both halves for every prospectus.

**S0 closes here** except O-5 (Schedule VI Part A) and O-7 (the amendment notification date), both of which need the notified SEBI text rather than another prospectus.

---

## 🔴 S1 — Skeleton & deploy · 0.5 day

- [ ] `create-next-app` (TS, Tailwind, App Router) → `shadcn init`
- [ ] Supabase project: Postgres + storage bucket
- [ ] `npm i zod react-hook-form @hookform/resolvers zod-to-json-schema decimal.js @anthropic-ai/sdk docx @supabase/supabase-js` · `-D vitest`
- [ ] Env config, Anthropic API key
- [ ] **Push to Vercel**

### ✅ Gate
- [ ] Live URL renders
- [ ] Reads and writes one row to Supabase
- [ ] One Claude API call returns

> Deploy on day one. Deploying at the end is how demos die.

---

## 🔴 S2 — Fact base · 1 day

- [ ] `Fact<T>` provenance wrapper
- [ ] Zod schemas per domain: `company`, `capital`, `promoters`, `management`, `business`, `financials`, `legal`, `approvals`, `offer`, `groupCos`
- [ ] `FactPath` addressing (`capital.allotmentHistory[2].issuePrice`) + get/set helpers
- [ ] DB tables: `issuers`, `fact_base_versions` (append-only), `documents`, `extractions`, `gaps`, `section_status`, `comments`, `audit_log`
- [ ] Decimal helpers — every rupee and percent through `decimal.js`
- [ ] **Seed the Vardhman fixture**, complete and realistic

### ✅ Gate
- [ ] Seed loads
- [ ] Read/write a nested fact by path
- [ ] Provenance persists
- [ ] A new version row appends on write
- [ ] `tsc` clean

---

## 🔴 S3 — Module engine + M1 · 1.5 days

- [ ] `Module` and `Field` spec types — `helpText`, `clause`, `feedsInto`, `showIf`, `extractionHint`, `validate`
- [ ] Generic renderer walking the spec → form UI
- [ ] Field types: text, longtext, number, currency, percent, date, select, boolean
- [ ] Debounced per-field autosave → server
- [ ] "ⓘ Why we ask" + "📍 Where this appears" (driven by `feedsInto`)
- [ ] Module list with progress, `dependsOn` gating
- [ ] **M1 — Company & History** (~12 fields, no repeaters)

### ✅ Gate
- [ ] Fill M1 in browser, refresh, data persists
- [ ] Hover a field → see why it's asked and where it lands
- [ ] Toggle a `showIf` condition → field appears/disappears

---

## 🔴🟡 S4 — Document engine + Wave 1 templates · 2.5 days ⭐

**The morale stage.** ~110 pages appear from almost no input.

- [ ] `DocumentNode` AST — `section` | `paragraph` | `table` | `placeholder` | `toc`
- [ ] `renderHtml()` — **section-lazy** (never render 280 pages at once)
- [ ] `Section` spec type: `producer`, `appliesIf`, `requiredFacts`, `clause`, + one of `template`/`compute`/`promptSpec`/`externalNote`
- [ ] Section registry for the full fixed-price structure — **all sections present**, unbuilt ones as placeholders
- [ ] **The live document panel** — progress %, page count, per-section status

### Wave 1 templates (use the `template-extraction` skill)
- [ ] Offer Procedure — 30pp, ~95% invariant · **budget 1 day alone**
- [ ] Main Provisions of AoA — 20pp, extracted from uploaded AoA
- [ ] Definitions & Abbreviations — 18pp, sector-varied
- [ ] Other Regulatory & Statutory Disclosures — 15pp
- [ ] Terms of the Offer — 10pp, fixed-price variant
- [ ] Key Regulations and Policies — 10pp, **sector-switched**
- [ ] Conventions & Presentation — 4pp
- [ ] Offer Structure — 4pp, fixed-price variant
- [ ] Forward-Looking Statements — 3pp
- [ ] Restrictions on Foreign Ownership — 3pp
- [ ] Dividend Policy · Declaration · Cover pages — 6pp

### ✅ Gate
- [ ] With only M1 filled, preview shows **90+ real pages**
- [ ] Render Wave 1 against a real prospectus's facts → diff against its actual text → substantively matching
- [ ] Missing facts render as visible yellow `[TO BE PROVIDED]` blocks
- [ ] Sector switch changes Key Regulations; exchange switch changes Offer Structure

---

## 🔴 S5 — Repeater + M2 + computed capital tables · 2.5 days

**If the repeater is good, the app is good.** It carries ~60% of data volume.

- [ ] **Repeater/table field component** — add/remove/reorder, per-cell validation, running totals, **CSV paste-from-Excel**, computed columns
- [ ] **M2 — Capital & Shareholding**: full allotment history since incorporation, shareholding register, transfers, promoter holdings with acquisition dates and cost
- [ ] Computed: capital build-up history (cumulative)
- [ ] Computed: pre-issue and post-issue shareholding
- [ ] Computed: promoter contribution + **lock-in allocation**
- [ ] Computed: top-10 shareholders
- [ ] Computed: The Offer · Summary of Financial Information · Capitalisation Statement
- [ ] Live consistency: shareholding sums to 100%, allotment total ties to paid-up capital

### ✅ Gate
- [ ] Vardhman allotment history in → all capital tables correct
- [ ] **Run an S0 ground-truth pair** — generated capital structure matches the published prospectus's actual tables
- [ ] Break shareholding to 99.4% → inline error fires immediately
- [ ] Vitest green on build-up, lock-in, capitalisation

---

## 🔴🟡 S6 — Rule engine + gap dashboard + eligibility · 2 days ⭐

**The differentiator.** The answer to "why not just ChatGPT?"

- [ ] `Rule` type: `id`, `clause`, `severity`, `category`, `appliesTo`, `check` → registry array
- [ ] **Eligibility rules** from `05-rule-sources.md` → **standalone no-signup 7-screen pre-check** with cited verdict
- [ ] **Completeness rules** — auto-derived from each section's `requiredFacts`
- [ ] **Consistency rules** — shareholding = 100% · objects + issue expenses = issue size · capitalisation ties to balance sheet · build-up reconciles with lock-in · RPT figures agree across sections
- [ ] Gap dashboard: severity grouping, clause citation, **what it blocks**, fix action linking to the field
- [ ] Readiness score

### ✅ Gate
- [ ] Eligibility check runs standalone in under 10 minutes, cited verdict
- [ ] Deliberately break each consistency rule → correct gap, correct clause
- [ ] Delete a required fact → placeholder in document **and** gap on dashboard, from one check
- [ ] Vitest: pass + fail fixture for every rule

---

## ⏸ S7 — Upload & extraction · PAUSED 2026-09-12 (D67) — was 🔴 · 2 days ⭐

**Highest technical risk. Time-boxed hard — if it slips, seed the fact base directly and move on.**
That risk is exactly why it turned out to be the right one to pause: **the user decided document
upload and AI extraction add more complexity than they're worth for this project, and chose hand-typed
form fields as the permanent path instead — not a temporary fallback while S7 catches up.**

**Nothing below is deleted or being planned around.** The code stays in the tree, stays tested, and
this checklist stays accurate for whenever (if ever) someone picks it back up. Do not resume any item
below without the user explicitly asking first.

**Opened 2026-09-12 (D56). Status below verified against the actual code the same day, not just the
decision-log write-up** — the log describes what was built enthusiastically; this checklist says
plainly what's still missing. Also note: the original plan named Claude for extraction; D43 moved
S7/S9/S10 to Gemini free tier project-wide, so "Claude extraction" below means "Gemini extraction" now
— not a gap, a superseded assumption.

- [~] Upload to Supabase Storage; `documents` table; per-sector required-document checklist — Storage upload/download/list/remove is real (`lib/store/document-storage.ts`); there is no `documents` table anywhere and no per-sector checklist exists at all
- [ ] **Async job pattern** — upload → `extractions` row `pending` → process → client polls. Never block a request. — NOT built: `app/extract/actions.ts`'s `uploadAndExtract` does upload → extract inline in one request; no job table, no polling
- [x] **Two-pass page targeting** — read text layer locally to find relevant page ranges, then send only those pages — real, `lib/document-intake/page-targeting.ts`, used live
- [ ] Text/image routing — text layer + simple layout → send extracted text; scanned or complex tables → send PDF blocks — NOT built: `pdf-text.ts` always extracts the text layer; there is no image/PDF-block path for scanned documents at all
- [~] Gemini extraction: schema → structured JSON **with page numbers** — the structured-JSON half works; page numbers are approximated as one page range for the WHOLE domain (`actions.ts`'s `firstTargetedPage`), not a real number per individual fact
- [~] **Review-and-confirm UI** — extracted value beside rendered source page, highlighted. Confirm / Edit. — a real UI exists (`app/extract/page.tsx`) but shows plain text + a page range per top-level field, not a rendered source page with the value highlighted on it
- [ ] Confidence flagging for low-certainty extractions — NOT built: `Provenance.confidence` exists as a field but nothing ever sets it
- [~] **Save every extraction result to `fixtures/` so downstream work doesn't re-call the API** — the mechanism works (`snapshotResponse`) but only one document has ever been run through it (`fixtures/extraction/om-galaxy.company.json`)

### ✅ Gate
- [~] Upload a real SME annual report → 20+ facts with correct page refs — one real document run (Om Galaxy, one domain, ~25-30 facts), but "page refs" are per-domain approximations, not verified per-fact
- [ ] Click an extracted fact → jumps to right page, right highlight — NOT built: no click/jump handler exists in the review UI at all
- [ ] Run 3 S0 input documents, hand-diff against ground truth, **record field-level accuracy** (this is a slide) — only 1 of 3 documents run; no accuracy number recorded anywhere
- [x] Nothing enters the fact base without confirmation — verified enforced: `confirmExtraction` is the only write path, and `isUsable()` refuses any extracted fact where `confirmed` is not true

---

## 🔴 S8 — Modules M3–M10 · 2.5 days

Pure content. No new components. ~half a day per pair.

- [x] **M3** Promoters & Promoter Group — profiles, family tree by relationship, other ventures, disassociations, the Reg 228 flags
- [x] **M4** Board & Management — board with profiles, changes over three years, KMP, senior management, committees, borrowing powers
- [x] **M5** Business Operations — customer/supplier concentration, facilities with utilisation, order book, headcount, exports
- [x] **M6** Financials — key figures by year, borrowings, contingent liabilities, auditor *(CFO)*. Restated statements stay the auditor's
- [x] **M7** Legal & Litigation — by party, direction and category; the materiality threshold is computed, not asked *(counsel)*
- [x] **M8** Approvals & Licences — by category and unit, with status; tax registrations; depository agreements
- [x] **M9** The Issue — 39 fields: structure, objects, band, intermediaries, dates; showIf by stage and exchange
- [x] **M10** Group Companies & RPT — materiality policy, companies, related parties, transactions by year
- [x] Wave 2 computed: Our Management · Our Promoters and Promoter Group · Our Group Companies · Outstanding Litigation · Government Approvals · Financial Indebtedness · Capitalisation Statement · The Issue · Summary of Contingent Liabilities · Summary of RPTs. Summary of Financial Information is external.
- [ ] Stragglers: Other Financial Information (EPS, RoNW, NAV) · Material Contracts · committee terms of reference · Interest of Directors / Promoters · promoter undertakings

### ✅ Gate
- [x] Every module fillable end to end — every field's seed value passes its schema; every table's columns match its row schema
- [x] Vardhman completable start to finish — nine modules at 100%; M9 leaves exactly the three DRHP-stage unknowns, by design (D37)
- [x] Each module's computed sections render correctly — 42 section tests against the seed's arithmetic; rendered and read in LibreOffice

---

## 🔴🟡 S9 — Drafting harness + Wave 3 narrative · 2 days

- [x] Grounded drafting harness: `factSlice` scoping (model sees **only** that section's facts), no-invention system prompt, forced fact citation, placeholder-on-missing — `lib/llm/narrative.ts`, D50
- [x] Our Business — D51, scoped to the Overview paragraph
- [x] Industry Overview — marked *"draft — to be replaced"* — D65, deliberately no new intake question; **framing corrected at D68** — a real SME prospectus commonly sources this from PUBLIC industry data with a standard non-verification disclaimer, not necessarily a commissioned report (Ideas Electricals states outright, as a risk factor: "We have not commissioned an industry report for the disclosures made in the section titled 'Industry Overview'"). The reasoning (this app has no source for market/competitive data and must not invent one) still holds; only the ORIGINAL "must be a commissioned report" framing was wrong
- [x] MD&A — D54
- [x] History and Corporate Matters — D50
- [x] Objects of the Offer — D52, narrative half only; the computed means-of-finance tables are a separate, unbuilt piece
- [x] Basis for Offer Price — D64, needed one real new question (`offer.industryPeers`)
- [x] Regenerate-per-section, keep prior versions — `lib/store/narrative-store.ts`, append-only

### ✅ Gate
- [x] **20 random generated sentences → every one traces to a fact-base entry.** Done as a stronger, exhaustive version: every one of the 20 drafts on file, re-checked against `untraceableNumbers()` and its own stored factSlice — 0 failures both at D65 (82 sentences) and again after D68's redrafts (80 sentences; Objects of the Issue's redraft is intentionally 1 sentence now that it only frames the real list, not 4).
- [x] Remove a fact → prose degrades to a placeholder, does not invent — `readNarrative(id, currentFactSlice)`'s exact-match requirement (D51) means ANY fact change, not just a removal, falls back to the honest computed sentence or placeholder
- [x] Output matches the S0 reference prospectuses in register and structure — **done as a real systematic pass, 2026-09-12 (D68)**, not just the informal per-section checks (D50–D65). All six sections' openings compared side by side against 2+ corpus documents each. Found and fixed three real structural gaps: Objects of the Issue was folding a numbered list into one prose sentence where every corpus document checked uses a real list (converted the section to render an actual ordered `DocumentNode`, not text); Basis for Issue Price was missing the "assessment of market demand through the Book Building Process" clause every corpus document opens with; MD&A was missing the "read together with Risk Factors and Our Business" cross-reference every corpus document opens with. Also found the ORIGINAL Industry Overview framing was wrong, not just imprecise — see the line below.

---

## 🟡 S10 — Risk factor engine · 1.5 days ⭐

- [x] `RiskArchetype`: `id`, `category`, `trigger(fb)`, `materiality(fb)`, `factSlice(fb)`, `detail(fb)` — `fallbackTemplate` became `detail` (D44), a static template can't show the arithmetic
- [~] **~40 archetypes** across business / financial / legal / promoter / industry / offer — 20 done (D44–D57, D60–D63); promoter has 2, industry and offer have 0
- [x] Trigger firing against the fact base; materiality ordering
- [x] LLM narrative from `factSlice` only, real numbers substituted (D50, D51, D55)
- [x] **"🔍 Why this was flagged"** — `groundedIn` and `sourceModules` (rule/threshold has no clause equivalent for a risk factor; a materiality rank is computed at selection) — D59, `/review/risks` only, never in the printed document
- [x] Dismiss-with-reason, logged — D58, `lib/store/risk-dismissal-store.ts` + `/review/risks`

### ✅ Gate
- [x] Vardhman fires 12–16 risks — 12 of 16 archetypes fire
- [x] Each explains why it fired — D59's `groundedIn`/`sourceModules`/materiality rank, on the review page
- [x] Top-5 concentration at 61.3% fires customer concentration with the real number
- [x] Dismissals persist and are logged — D58, append-only per archetype id

---

## 🔴 S11 — DOCX export · 1.5 days ⭐

- [x] `renderDocx()` over the same `DocumentNode` AST as `renderHtml()` — over `RenderedSection[]`, so bookmarks come free
- [x] Heading hierarchy, ~~numbering~~, `TableOfContents` field, headers/footers, page numbers — headings are not numbered: the corpus does not number subsections, so numbering would be invented structure
- [x] Table rendering that doesn't overflow the page — fixed layout, grid sums to the text width
- [x] Placeholders as highlighted blocks — highlighted runs, bookmarked on first occurrence
- [x] ~~watermark~~ **`UNSIGNED DRAFT — NOT FOR FILING` notice in the running header** until MB certification (D35 — no page watermark, user decision)
- [x] PDF export (a LibreOffice print of the DOCX, D40) · gap report (.xlsx) · document vault (.zip) · provenance map (a sheet in the report and JSON in the vault)

### ✅ Gate
- [x] Export → **open in actual Microsoft Word** — user confirmed 2026-09-11
- [x] ToC populates on F9 — pre-filled with entries and links (D36); page numbers fill on update, confirmed in Word
- [x] Page numbers correct, no table overflows, placeholders visible — confirmed in Word and in the LibreOffice render
- [ ] 250+ pages for a complete Vardhman — 49 now; needs S8/S9 sections
- [x] ~~Watermark~~ Draft notice present pre-sign-off, absent post — tested both ways

---

## 🟡 S12 — Review workflow · 1.5 days ⭐

- [ ] Role switcher (no real auth): Promoter · CFO/CS · Merchant Banker · Auditor · Legal
- [ ] Module assignment + scoped views
- [ ] Section status: Draft → Ready for Review → Reviewed → Locked
- [ ] Section-anchored comment threads
- [ ] Append-only audit log
- [ ] MB certification action → lifts the watermark

### ✅ Gate
- [ ] Assign M6 to CFO, switch roles, see only that module
- [ ] MB comments, marks reviewed, certifies → watermark lifts
- [ ] Audit log shows every action with actor and timestamp

---

## 🟡 S13 — Polish & demo · 1.5 days

- [ ] Seed Vardhman end to end, including the synthetic document pack
- [ ] Error and empty states everywhere
- [ ] Loading states for extraction and drafting
- [ ] **Rehearse the four-beat demo:** eligibility → upload & extract → risk factors → DOCX export
- [ ] Pitch deck; field-level extraction accuracy slide from S7
- [ ] Full run from clean seed — **twice**

### ✅ Gate
- [ ] Clean-seed run works twice in a row with no manual intervention

---

## Scheduling

**Full build ≈ 24 working days.**

| Scope | Stages | Days | Result |
|---|---|---|---|
| **Thin slice** | S0–S6 + S11 | ~12 | Eligibility, 110-page doc, capital tables, gap dashboard, DOCX. Demoable. |
| **Strong demo** | + S7, S9, S10 | ~18 | Adds extraction, narrative, risk engine. All ⭐ live. |
| **Complete** | + S8, S12, S13 | ~24 | Everything |

**~10-day compression:** S0 (compressed) → S1 → S2 → S3 → S4 → S5 (M2 only) → S6 → S11 → S13. Seed the fact base directly; skip extraction, narrative, risk.

**Never cut:** S0 · eligibility check · gap dashboard · DOCX export.

**Cut in this order if behind:** S12 → badges + watermark only · S7 → 2 doc types · S10 → 20 archetypes · S8 → 5 modules · Wave 1 → 8 sections.

---

## Out of scope — say this in the pitch

- **Restated financial statements** — requires a peer-reviewed CA. We capture and structure; we do not restate.
- **Statement of Special Tax Benefits** — requires a CA opinion letter.
- **Legal opinions on litigation materiality** — counsel's call.
- **Industry Overview** — the underlying market/growth/competitive data has to come from a cited public source or a commissioned report (CRISIL/CARE/D&B); real SME prospectuses commonly use the former, not necessarily the latter (D68). We draft only what the issuer's own facts support; the real industry data gets added separately and must replace our draft before filing.
- **Book-built issues** — fixed-price first.

Being explicit about what you don't do shows you understand where professional obligations sit.
