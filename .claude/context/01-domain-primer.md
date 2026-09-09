# Domain primer — SME IPOs in India

> ⚠️ **Every regulatory number in this file is UNVERIFIED background.** It exists to orient, not to cite.
> The only valid source for anything that enters the rule pack is `05-rule-sources.md`, populated during S0
> from the live SEBI text. SME norms were amended materially in 2025.

---

## What an IPO is

A company sells shares to the public for the first time and lists them. Two things can happen at once:

- **Fresh issue** — new shares, money goes to the company
- **Offer for Sale (OFS)** — existing shareholders sell, money goes to them

Most SME IPOs are majority fresh issue.

## Two regimes

| | Main Board | **SME Platform** |
|---|---|---|
| Listed on | NSE / BSE main | **BSE SME** or **NSE Emerge** |
| Who vets the document | **SEBI** issues observations | **The Exchange** vets it; SEBI does not issue observations |
| Post-issue paid-up capital | No cap | Capped *(verify)* |
| Min application size | ~₹15,000 | **₹1,00,000** — deliberately high, keeps retail out |
| Underwriting | Optional | **100% mandatory**; MB takes a share on own book |
| Market making | No | **Mandatory, 3 years** |
| Post-listing reporting | Quarterly | Half-yearly |
| Typical raise | ₹500 cr+ | ₹10–50 cr |
| Typical timeline | 6–9 months | 4–8 months |

The SME route exists because main-board compliance is impossible for a ₹20 cr raise. **The irony this project attacks: the offer document itself was never simplified.** An SME draft prospectus is 250–400 pages and reads almost identically to a main-board one.

## Fixed price vs book built — we target fixed price

| Route | Document names |
|---|---|
| Book-built | Draft Red Herring Prospectus (DRHP) → RHP → Prospectus |
| **Fixed price** ← our target | **Draft Prospectus → Prospectus** |

"Red herring" means *the price is missing*. Fixed-price issues state the price upfront, so there's no red herring — and no book-building, anchor investor, or price-band machinery. Roughly 20 pages and 60 questions lighter.

---

## Who's involved (the cost structure we attack)

| Role | Does | Rough SME cost |
|---|---|---|
| **Merchant Banker / BRLM** | Owns the process, drafts the document, due diligence, statutory sign-off, underwrites | ₹40–80 L + underwriting |
| **Legal counsel** | Litigation, material contracts, AoA, regulatory sections | ₹10–25 L |
| **Peer-reviewed CA** | Restates 3 years of financials | ₹8–20 L |
| **Registrar (RTA)** | Applications, allotment | ₹3–8 L |
| **Company Secretary** | Corporate records, resolutions, filings | Internal + retainer |
| **Market maker** | 3-year mandatory liquidity | Inventory cost |
| **Industry research firm** | The commissioned industry report | ₹5–15 L |

Total issue expenses commonly **8–15% of a small raise**. That's the disproportion the problem statement names.

**The MB's due diligence certificate and sign-off are statutory.** We cannot and must not remove them — hence the certification gate and the watermark.

---

## The filing process

```
 1. Pre-IPO housekeeping (1–3 mo)  Pvt Ltd → Public Ltd. Clean the cap table.
                                   Often a bonus issue. Regularise ROC filings.
                                   Settle related-party loans.
 2. Appoint intermediaries         MB, legal, peer-reviewed CA, RTA, banker,
                                   market maker, industry researcher
 3. Due diligence (2–3 mo)         MB issues a 60–100 page Due Diligence
                                   Questionnaire. ← THE BOTTLENECK WE REPLACE
 4. Financial restatement          Auditor restates 3 FYs + stub to ICDR format
 5. Drafting (1–2 mo)              The 300-page document gets written
 6. Corporate approvals            Board resolution + shareholder special
                                   resolution under Sec 62(1)(c)
 7. FILE Draft Prospectus          With BSE SME / NSE Emerge (+ SEBI intimation,
                                   + fees). NOT filed with SEBI for observations.
 8. Exchange scrutiny (1–3 mo)     Queries, factory site visit, promoter
                                   interview before the listing committee
 9. In-principle approval          From the exchange
10. File Prospectus with RoC       Now a statutory document
11. Marketing                      Roadshows
12. Issue opens (min 3 days)       ASBA / UPI
13. Basis of allotment             Min allottees must be met or the issue fails
14. Listing                        T+3
```

**Steps 3–5 are where the months go. That's the target.**

---

## Section structure — fixed-price draft prospectus

Producer classes: **B** = boilerplate template · **C** = computed · **N** = narrative (LLM) · **X** = external (we don't produce)

| Section | Pages | Producer |
|---|---|---|
| Cover pages (front + back) | 3–5 | B |
| **SECTION I — GENERAL** | | |
| Definitions and Abbreviations | 15–20 | B |
| Conventions, Presentation of Financial/Industry/Market Data | 3–5 | B |
| Forward-Looking Statements | 2–3 | B |
| **SECTION II — SUMMARY OF OFFER DOCUMENT** | 10–15 | derived |
| **SECTION III — RISK FACTORS** | 25–40 | **N — hardest** |
| **SECTION IV — INTRODUCTION** | | |
| The Offer | 2–3 | C |
| Summary of Financial Information | 5–8 | C |
| General Information | 5–8 | B + facts |
| Capital Structure | 15–25 | **C — heavy tables** |
| **SECTION V — PARTICULARS OF THE OFFER** | | |
| Objects of the Offer | 10–15 | N + C |
| Basis for Offer Price | 5–8 | C + N |
| Statement of Special Tax Benefits | 5–8 | **X — CA opinion** |
| **SECTION VI — ABOUT THE COMPANY** | | |
| Industry Overview | 15–25 | N *(replaced by commissioned report)* |
| Our Business | 20–30 | N |
| Key Regulations and Policies | 8–12 | **B — sector-switched** |
| History and Corporate Matters | 8–12 | N + facts |
| Our Management | 15–20 | C |
| Our Promoters and Promoter Group | 10–15 | C |
| Dividend Policy | 1–2 | B |
| **SECTION VII — FINANCIAL INFORMATION** | | |
| Restated Financial Statements | 50–80 | **X — auditor** |
| Other Financial Information / ratios | 3–5 | C |
| MD&A | 15–25 | N |
| Capitalisation Statement | 1–2 | C |
| Financial Indebtedness | 5–10 | C |
| **SECTION VIII — LEGAL AND OTHER INFORMATION** | | |
| Outstanding Litigation and Material Developments | 10–20 | C |
| Government and Other Statutory Approvals | 8–15 | C |
| Other Regulatory and Statutory Disclosures | 12–18 | B |
| **SECTION IX — OFFER RELATED INFORMATION** | | |
| Terms of the Offer | 8–12 | B |
| Offer Structure | 3–5 | B |
| Offer Procedure | 25–35 | **B — pure boilerplate** |
| Restrictions on Foreign Ownership | 2–3 | B |
| **SECTION X — MAIN PROVISIONS OF AoA** | 15–25 | B (from AoA) |
| **SECTION XI — OTHER INFORMATION** | | |
| Material Contracts and Documents for Inspection | 2–4 | C |
| Declaration | 1–2 | B |
| | **~280–400** | |

### The number that justifies the project

Pure boilerplate: Definitions (18) + Offer Procedure (30) + Terms (10) + Regulatory Disclosures (15) + AoA (20) + Key Regulations (10) + assorted (10) ≈ **110+ pages near-identical across every SME issuer**, varying only by substituted variables.

Another ~80 pages are computed tables. Another ~60 is the auditor's restated financials, which we don't touch.

**Genuinely hard, judgment-laden content: ~60–80 pages.** Tractable.

---

## Governing rules

**Primary**
- **SEBI (ICDR) Regulations, 2018** — **Chapter IX** (SME IPOs), **Schedule VI** (offer document disclosures). The bible.
- **Companies Act, 2013** — Sec 23–42 (public offers), **Sec 26** (matters in a prospectus), Sec 32 (red herring), **Sec 34/35 (misstatement liability — why "never invent" is non-negotiable)**, Sec 62(1)(c)

**Secondary**
- SEBI (LODR) 2015 — post-listing, relaxed SME chapter
- SEBI (SAST) 2011, SEBI (PIT) 2015
- SEBI **Master Circular for ICDR**
- **Exchange rulebooks** — BSE SME and NSE Emerge add requirements *on top of* SEBI's, and differ from each other
- ICAI standards for restated financials

### 2025 amendments — all UNVERIFIED, confirm in S0

SEBI tightened SME norms in 2025 after concerns about issue quality. Believed to include: an operating-profit (EBITDA) track record test · OFS cap as a share of issue size, with a per-shareholder cap · General Corporate Purposes cap · restriction on using proceeds to repay promoter/related-party loans · increased minimum allottee count · phased lock-in release above minimum promoter contribution · a public comment period on the draft.

**This is the highest-risk area of the build.** A superseded threshold in the eligibility engine collapses the credibility of the whole tool.

---

## What data is needed

**Corporate** — Incorporation certificate + name-change certs · MOA/AOA · Board and shareholder resolutions (esp. the Sec 62(1)(c) special resolution) · statutory registers · ROC filing history · public-limited conversion documents

**Capital** — Complete allotment history since incorporation (every allotment: date, price, consideration — builds the capital build-up table) · shareholding register · transfer records · promoter holding with acquisition dates and cost (drives lock-in) · ESOP scheme · pre-IPO placement

**Financial** — Audited financials 3 FYs + stub · **restated financials with adjustments (auditor)** · auditor peer-review certificate · trial balances · loan agreements, sanction letters, security, lender NOCs · RPT schedules · contingent liabilities

**People** — Per promoter and director: PAN, Aadhaar, DIN, passport, address proof · education and career · other directorships · remuneration · family relationships (defines the promoter group) · promoter-group entity details

**Business** — Customer concentration (top 5/10 as % revenue) · supplier concentration · order book · installed capacity and utilisation (3 yrs) · product/segment and geographic revenue split · facilities with property documents · headcount by function

**Legal** — Litigation (criminal, civil, tax, statutory) against company, directors, promoters, subsidiaries, group companies, with amounts and status · regulator notices · material contracts · lease deeds and title · IP registrations

**Approvals** *(sector-dependent — branches hard)* — GST · factory licence · pollution control CTE/CTO · fire NOC · trade licence · IEC · plus sector-specific (FSSAI, drug licence, BIS, AYUSH, legal metrology…)

**Offer** — Issue size and structure · objects with detailed break-up · capex quotations · **chartered engineer certificate** for capex objects · working capital assessment · issue expense estimate · commissioned industry report

---

## How this is collected today — the problem in one paragraph

The merchant banker emails a **Due Diligence Questionnaire**: a 60–100 page Word or Excel checklist. The CFO or CS fills it over weeks, by email, in fragments. The MB reviews, finds gaps, sends follow-ups — 5–10 iterations. Legal separately requests the litigation pack. The auditor separately works on restatement. **Nobody has a single view of what's complete.** Version control is `DDQ_v7_final_FINAL_updated.xlsx`. Inconsistencies — cap table vs ROC filing, RPT in financials vs RPT section — surface in week nine, each costing a round trip.

**That's the entire problem.** Not the writing. The collection, the gap-tracking, and the cross-consistency.

> If you can obtain a real DDQ, it is effectively the intake wizard's spec, already written by practitioners.

---

## Test data

Two corpora, and people conflate them:

- **Corpus A — outputs.** Published prospectuses. Public, easy. chittorgarh.com is the best bulk source; also bsesme.com, nseindia.com/emerge, merchant-banker sites.
- **Corpus B — inputs.** What a promoter uploads. Private and hard.

**The trick: reverse the corpus.** A published prospectus *contains its own inputs*. Split out the restated-financials pages → test input. Split out the capital-structure pages → ground truth. Twenty prospectuses gives twenty labelled pairs, free.

**MCA21** (mca.gov.in) sells public documents for any registered Indian company at a small fee: MOA/AOA, AOC-4 (financials), MGT-7 (annual return with shareholding), **PAS-3 (allotment returns — exactly what M2 needs)**, DIR-12. This is the legitimate source of real, messy input documents.

Free alternative: **annual reports of already-listed SME companies** on BSE SME / NSE Emerge.

**Ethics:** MCA21 records are public and fine. A real private company's documents require written permission. If a judge asks where the test data came from, the answer must be clean.
