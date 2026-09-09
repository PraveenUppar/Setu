# Section map — SME book-built prospectus

**Built from 5 real ToCs**, 2026-09-09: Maxwell Engineering (NSE Emerge, DRHP, 381pp), Century Business Media (BSE SME, RHP, 303pp), Ideas Electricals (NSE Emerge, DRHP, 345pp), Om Galaxy (BSE SME, RHP, 509pp), Photonics Watertech (NSE Emerge, DRHP, 391pp).

This supersedes the section table in `01-domain-primer.md`, which was written from memory.

---

## Finding 1 — Subsections are invariant; section grouping is not

Top-level section count varies across the five: Maxwell has 13, Om Galaxy 10, Photonics 11, Century and Ideas ~11. Which subsections get grouped under which numbered SECTION is a **presentational choice by the merchant banker**, not a regulatory requirement.

But **the subsection list and its order are essentially identical across all five.**

**Architectural consequence: the section registry's atomic unit is the SUBSECTION.** Section grouping is a presentation layer over it. Do not model top-level sections as the primary key — they will not match the next document you look at.

## Finding 2 — "Issue" vs "Offer" is a house-style toggle

| Term | Documents |
|---|---|
| **Issue** (Objects of the Issue, Terms of the Issue, Issue Procedure, Basis for Issue Price) | Maxwell, Century, Ideas, Om Galaxy — **4 of 5** |
| **Offer** (Objects of the Offer, Terms of the Offer, Offer Procedure, Basis for Offer Price) | Photonics — 1 of 5 |

Same content, same order, different word. **Default to "Issue"**; make it a config toggle. The `sme-domain` skill's terminology table said "the Offer" — that was wrong and has been corrected.

## Finding 3 — There is no "Summary of the Offer Document"

Main-board DRHPs carry a Section II "Summary of the Offer Document". **None of the five SME documents has it.** It was in the original plan and has been removed.

## Finding 4 — Restated Financial Information is one page inline

In all five, "Restated Financial Information" occupies **1 page** in the numbered body. The actual financial statements are **annexed with separate pagination**.

The original plan budgeted 50–80 pages for this. Wrong. It is effectively a pointer into an annexure — which makes the "we don't produce restated financials" scope boundary cleaner than expected: we render the pointer page and attach the auditor's annexure.

---

## The map

Producer: **B** boilerplate template · **C** computed · **N** narrative · **X** external · **D** derived

Pages column: observed range across the five documents.

| # | Subsection | Pages | Producer | Notes |
|---|---|---|---|---|
| 1 | Definitions and Abbreviations | 16–17 | B | Sector-varied term list |
| 2 | Certain Conventions, Presentation of Financial, Industry and Market Data | 2–3 | B | ~95% invariant |
| 3 | Forward Looking Statements | 2 | B | ~99% invariant |
| 4 | Risk Factors | 29–42 | N | Hardest section |
| 5 | The Issue / The Offer | 2–3 | C | |
| 6 | Summary of Financial Information | 4–7 | C | |
| 7 | Summary of Contingent Liabilities | 1 | C | **Was missing from the original plan** |
| 8 | Summary of Related Party Transactions | 2–4 | C | **Was missing from the original plan** |
| 9 | General Information | 11–13 | B + facts | Intermediary details |
| 10 | Capital Structure | 12–18 | C | Heavy tables |
| 11 | Objects of the Issue | 22–32 | N + C | **Far bigger than planned (was 10–15)** |
| 12 | Basis for Issue Price | 7–8 | C + N | |
| 13 | Statement of Special / Possible Tax Benefits | 4 | X | CA opinion |
| 14 | Industry Overview | 20–46 | N | Replaced by commissioned report |
| 15 | Our Business / Business Overview | 35–36 | N | |
| 16 | Key Industry Regulations and Policies | 9–14 | B | **Sector-switched** |
| 17 | History and Corporate Structure / Certain Corporate Matters | 4–7 | N + facts | |
| 18 | Our Subsidiaries, Associates and Joint Ventures | 2 | C | **Conditional** — only Photonics |
| 19 | Our Management | 16–19 | C | |
| 20 | Our Promoters and Promoter Group | 6–7 | C | |
| 21 | Our Group Company / Companies | 1 | C | Present in all 5; **position varies** (About the Company vs Legal) |
| 22 | Dividend Policy | 1 | B | |
| 23 | Restated Financial Information | 1 | X | Pointer; financials annexed separately |
| 24 | Other Financial Information | 1 | C | |
| 25 | Capitalisation Statement | 1 | C | |
| 26 | Management's Discussion and Analysis | 10–21 | N | |
| 27 | Financial Indebtedness | 2–19 | C | Varies hugely by leverage |
| 28 | Outstanding Litigation and Material Developments | 5–6 | C | |
| 29 | Government and Other Approvals | 4–12 | C | |
| 30 | Other Regulatory and Statutory Disclosures | 13–17 | B | ~90% invariant |
| 31 | Terms of the Issue | 10 | B | Book-built variant |
| 32 | Issue Structure | 3–6 | B | Book-built: QIB/NII/RII allocation |
| 33 | Issue Procedure | 29–36 | B | **Largest single template** |
| 34 | Restrictions on Foreign Ownership of Indian Securities | 2–3 | B | ~99% invariant |
| 35 | Main Provisions of the Articles of Association | 25–38 | B | Extracted per-issuer from AoA |
| 36 | Material Contracts and Documents for Inspection | 2–3 | C | |
| 37 | Declaration | 1 | B | |

---

## Finding 5 — The boilerplate share is higher than claimed

Measured on Om Galaxy (434 numbered pages, the most detailed of the five):

| Boilerplate subsection | Pages |
|---|---|
| Main Provisions of AoA | 38 |
| Issue Procedure | 36 |
| Definitions and Abbreviations | 17 |
| Other Regulatory and Statutory Disclosures | 17 |
| Terms of the Issue | 10 |
| Key Regulations and Policies | 9 |
| Issue Structure | 3 |
| Restrictions on Foreign Ownership | 3 |
| Conventions and Presentation | 3 |
| Forward Looking Statements | 2 |
| Dividend Policy | 1 |
| Declaration | 1 |
| **Total** | **140** |

**140 of 434 pages — 32% pure boilerplate**, versus the ~110 pages estimated from memory. The core thesis is stronger than the plan claimed, not weaker.

Add computed sections (~50pp) and the no-LLM share of the document is roughly **44%**.

---

## Wave 1 build order — revised by measured size

| Priority | Subsection | Pages | Invariance |
|---|---|---|---|
| 1 | Issue Procedure | 29–36 | ~95% — biggest win, budget 1 day |
| 2 | Main Provisions of AoA | 25–38 | Per-issuer extraction from uploaded AoA |
| 3 | Definitions and Abbreviations | 16–17 | Sector-varied |
| 4 | Other Regulatory and Statutory Disclosures | 13–17 | ~90% |
| 5 | Terms of the Issue | 10 | Book-built variant |
| 6 | Key Regulations and Policies | 9–14 | Sector-switched |
| 7 | Issue Structure | 3–6 | Book-built: QIB/NII/RII |
| 8 | Conventions · Forward Looking · Foreign Ownership · Dividend · Declaration | ~10 | ~99% each |

---

## Fixed-price branch points

Per D15, keep `Section.appliesIf` on these five. They are the only subsections that differ materially between book-built and fixed price:

- Cover pages — price band + floor/cap vs stated issue price
- Basis for Issue Price — book-building demand assessment vs fixed justification
- Issue Structure — QIB/NII/RII allocation vs fixed-price split
- Issue Procedure — bidding and bid lots vs straight application
- Terms of the Issue — partial differences

Everything else is shared. Cannot build the fixed-price variants until the corpus has 5+ fixed-price documents; currently 1 (Quanto Agroworld).

---

## Corrections to earlier planning

| Item | Planned | Actual |
|---|---|---|
| Summary of the Offer Document | 10–15pp section | **Does not exist in SME documents** |
| Restated Financial Statements | 50–80pp | **1pp pointer**; financials annexed |
| Objects of the Issue | 10–15pp | **22–32pp** |
| Main Provisions of AoA | 15–25pp | **25–38pp** |
| Industry Overview | 15–25pp | **20–46pp** |
| Summary of Contingent Liabilities | absent | **1pp, present in all 5** |
| Summary of Related Party Transactions | absent | **2–4pp, present in all 5** |
| Our Subsidiaries / Associates / JV | absent | **conditional, 2pp** |
| Terminology | "the Offer" | **"the Issue" (4 of 5)** |
| Total boilerplate | ~110pp | **~140pp (32%)** |
