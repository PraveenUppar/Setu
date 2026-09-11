# Build TODO

Each stage ends with something demoable and a manual test gate. **Do not advance until the gate passes.**

`🔴 core` (MVP dies without it) · `🟡 demo` (needed for the pitch) · `🟢 extended`

**Progress** (`[x]` done, `[~]` partial, `[ ]` not started) — updated 2026-09-11

| S0 | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 | S10 | S11 | S12 | S13 |
|----|----|----|----|----|----|----|----|----|----|-----|-----|-----|-----|
| [x] | [x] | [x] | [x] | [~] | [x] | [x] | [ ] | [x] | [ ] | [ ] | [~] | [ ] | [ ] |

**Tests, tsc and dev-server status live in `.claude/context/04-session-handoff.md`** — this table is stage-level only, so the two cannot contradict each other.

- **S0 closed 2026-09-10** at 8 prospectuses rather than 25. Criteria corroborated across documents, paired fixtures built. 2 of 27 rule rows remain `PROPOSAL-ONLY` and carry no rules; O-5 (Schedule VI Part A) and O-7 (notification date) need SEBI's own text and stay open.
- **S4 partial:** engine complete; **11 of the 37 numbered subsections** built, as 30 registry sections. Wave 1 extraction is finished — what remains is computed (S8), narrative (S9/S10), the AoA (S7) or external.
- **S3 and S5 done 2026-09-10** — module engine, M1, M2, the repeater with spreadsheet paste, and the computed capital tables. A real issuer's answers now replace the seed.
- **S6 closed 2026-09-10:** rule engine, gap dashboard, standalone `/eligibility` pre-check, finding-to-document links, and all 32 exchange criteria ruled. Every finding gives a firm pass or fail with a clause — no rule hedges. Remaining consistency rules wait on M2 and M6 data (S5, S8).
- **S8 built 2026-09-11:** M3–M10 as content against the engine (136 fields), ten Wave 2 computed sections, 22 of 37 subsections rendering at ~65 pages. The engine needed three things first — columns on the field, money/boolean/list cells, and a None state (D37, D38). Vardhman completes nine modules outright; M9 leaves the three DRHP-stage unknowns. Stragglers listed in the handoff.
- **S11 built 2026-09-11:** `renderDocx()` over the same AST, `/export/docx`, pre-filled ToC, highlighted and bookmarked placeholders, draft notice in the header until certified. **No page watermark, by user decision (D35).** Verified through LibreOffice render; the open-in-Word gate is the user's. PDF, gap report, vault and provenance map still to do.

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

## 🔴 S7 — Upload & extraction · 2 days ⭐

**Highest technical risk. Time-boxed hard — if it slips, seed the fact base directly and move on.**

- [ ] Upload to Supabase Storage; `documents` table; per-sector required-document checklist
- [ ] **Async job pattern** — upload → `extractions` row `pending` → process → client polls. Never block a request.
- [ ] **Two-pass page targeting** — read text layer locally to find relevant page ranges, then send only those pages
- [ ] Text/image routing — text layer + simple layout → send extracted text; scanned or complex tables → send PDF blocks
- [ ] Claude extraction: `zod-to-json-schema` → tool-use → structured JSON **with page numbers**
- [ ] **Review-and-confirm UI** — extracted value beside rendered source page, highlighted. Confirm / Edit.
- [ ] Confidence flagging for low-certainty extractions
- [ ] **Save every extraction result to `fixtures/` so downstream work doesn't re-call the API**

### ✅ Gate
- [ ] Upload a real SME annual report → 20+ facts with correct page refs
- [ ] Click an extracted fact → jumps to right page, right highlight
- [ ] Run 3 S0 input documents, hand-diff against ground truth, **record field-level accuracy** (this is a slide)
- [ ] Nothing enters the fact base without confirmation

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

- [ ] Grounded drafting harness: `factSlice` scoping (model sees **only** that section's facts), no-invention system prompt, forced fact citation, placeholder-on-missing
- [ ] Our Business
- [ ] Industry Overview — marked *"draft — to be replaced by commissioned report"*
- [ ] MD&A
- [ ] History and Corporate Matters
- [ ] Objects of the Offer
- [ ] Basis for Offer Price
- [ ] Regenerate-per-section, keep prior versions

### ✅ Gate
- [ ] **20 random generated sentences → every one traces to a fact-base entry.** Any that don't are the bug that matters most.
- [ ] Remove a fact → prose degrades to a placeholder, does not invent
- [ ] Output matches the S0 reference prospectuses in register and structure

---

## 🟡 S10 — Risk factor engine · 1.5 days ⭐

- [ ] `RiskArchetype`: `id`, `category`, `trigger(fb)`, `materiality(fb)`, `factSlice(fb)`, `fallbackTemplate`
- [ ] **~40 archetypes** across business / financial / legal / promoter / industry / offer — harvest by clustering the S0 corpus's risk sections
- [ ] Trigger firing against the fact base; materiality ordering
- [ ] LLM narrative from `factSlice` only, real numbers substituted
- [ ] **"🔍 Why this was flagged"** — rule, threshold, source module, materiality rank
- [ ] Dismiss-with-reason, logged

### ✅ Gate
- [ ] Vardhman fires 12–16 risks
- [ ] Each explains why it fired
- [ ] Top-5 concentration at 61.3% fires customer concentration with the real number
- [ ] Dismissals persist and are logged

---

## 🔴 S11 — DOCX export · 1.5 days ⭐

- [x] `renderDocx()` over the same `DocumentNode` AST as `renderHtml()` — over `RenderedSection[]`, so bookmarks come free
- [x] Heading hierarchy, ~~numbering~~, `TableOfContents` field, headers/footers, page numbers — headings are not numbered: the corpus does not number subsections, so numbering would be invented structure
- [x] Table rendering that doesn't overflow the page — fixed layout, grid sums to the text width
- [x] Placeholders as highlighted blocks — highlighted runs, bookmarked on first occurrence
- [x] ~~watermark~~ **`UNSIGNED DRAFT — NOT FOR FILING` notice in the running header** until MB certification (D35 — no page watermark, user decision)
- [ ] PDF export · gap report (.xlsx) · document vault (.zip) · provenance map

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
- **Industry Overview** — normally a commissioned CRISIL/CARE/D&B report. We draft; it gets replaced.
- **Book-built issues** — fixed-price first.

Being explicit about what you don't do shows you understand where professional obligations sit.
