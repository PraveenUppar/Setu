# Build TODO

Each stage ends with something demoable and a manual test gate. **Do not advance until the gate passes.**

`🔴 core` (MVP dies without it) · `🟡 demo` (needed for the pitch) · `🟢 extended`

**Progress:** S0 ▢ · S1 ▢ · S2 ▢ · S3 ▢ · S4 ▢ · S5 ▢ · S6 ▢ · S7 ▢ · S8 ▢ · S9 ▢ · S10 ▢ · S11 ▢ · S12 ▢ · S13 ▢

---

## 🔴 S0 — Corpus & research · 2 days

**No code.** This is the spec, the templates, and the tests all at once.

### Corpus
- [ ] Pull 25 SME prospectuses (chittorgarh.com; also bsesme.com, nseindia.com/emerge, merchant-banker sites)
- [ ] Filter to **fixed-price** issues; tag by sector — 6–8 manufacturing, 3–4 IT/services, 3–4 trading, 2–3 textiles, 2–3 chemicals, 2–3 messy (litigation-heavy / group-heavy / has OFS)
- [ ] **Reverse the corpus:** for 20, split restated-financials pages → `fixtures/input/`, capital-structure pages → `fixtures/truth/`. Free paired dataset.
- [ ] MCA21 (mca.gov.in): full document sets for 3 companies — MOA/AOA, AOC-4, MGT-7, **PAS-3** (allotment history), DIR-12
- [ ] 10 SME annual reports (free) as extra extraction inputs

### Research
- [ ] Read ICDR **Chapter IX** + **Schedule VI**
- [ ] Build `.claude/context/05-rule-sources.md`: threshold → clause → verbatim text → URL → date checked
- [ ] Verify 2025 amendments specifically: EBITDA track record · OFS cap · GCP cap · promoter-loan-repayment restriction · minimum allottees · phased lock-in · comment period
- [ ] Build the section map from 5 real fixed-price ToCs — every section/subsection with observed page counts

### ✅ Gate
- [ ] Can name every section of a fixed-price SME draft prospectus from own map
- [ ] **Every threshold has a clause citation and a URL.** Zero numbers from memory.
- [ ] 20 input/ground-truth pairs on disk

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

- [ ] **M3** Promoters & Promoter Group — KYC, career history, family tree, other holdings
- [ ] **M4** Board & Management — DINs, other directorships, remuneration
- [ ] **M5** Business Operations — customer/supplier concentration, capacity & utilisation, order book, plants, headcount
- [ ] **M6** Financials — restated financials, RPT, indebtedness, contingent liabilities *(CFO/auditor)*
- [ ] **M7** Legal & Litigation — criminal, civil, tax, statutory across company/directors/promoters/group *(counsel)*
- [ ] **M8** Approvals & Licences — sector-switched checklist with validity dates
- [ ] **M9** The Offer — issue size, objects break-up, capex quotations, chartered engineer certificate
- [ ] **M10** Group Companies & RPT
- [ ] Remaining Wave 2 computed: Management tables · Promoter Group tables · Litigation tables · Approvals register · Financial Indebtedness

### ✅ Gate
- [ ] Every module fillable end to end
- [ ] Vardhman completable start to finish
- [ ] Each module's computed sections render correctly

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

- [ ] `renderDocx()` over the same `DocumentNode` AST as `renderHtml()`
- [ ] Heading hierarchy, numbering, `TableOfContents` field, headers/footers, page numbers
- [ ] Table rendering that doesn't overflow the page
- [ ] Placeholders as highlighted blocks
- [ ] **`UNSIGNED DRAFT — NOT FOR FILING` watermark** until MB certification
- [ ] PDF export · gap report (.xlsx) · document vault (.zip) · provenance map

### ✅ Gate
- [ ] Export → **open in actual Microsoft Word**
- [ ] ToC populates on F9
- [ ] Page numbers correct, no table overflows, placeholders visible
- [ ] 250+ pages for a complete Vardhman
- [ ] Watermark present pre-sign-off, absent post

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
