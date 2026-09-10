# Corpus

**The PDFs in this directory are gitignored** — roughly 88MB, and once in git history it cannot be cleaned. This file records exactly what the corpus contains so it can be rebuilt.

The corpus is the project's spec, template source, and test fixture set all at once. See `.claude/skills/template-extraction` for how it is used, and `.claude/context/05-rule-sources.md` for what was derived from it.

## Where to get these

| Source | What |
|---|---|
| **chittorgarh.com** | Direct PDF links to every SME IPO document, by year. Best bulk source. |
| **bsesme.com** | Official BSE SME filings |
| **nseindia.com** -> Emerge | Official NSE Emerge filings and annual reports |
| Merchant banker sites | Hem Securities, Beeline / JDA Capital, Indorient, SKI Capital |

## Naming convention

```
<issuetype>__<sector>__<company>__<exchange>__<date>__<doctype>.pdf
ar__<sector>__<company>__<exchange>__<fy>.pdf
```

The issue type leads because it is the critical discriminator — see D15.

## Prospectuses (`corpus/prospectus/`)

| File | Company | Pages | Notes |
|---|---|---|---|
| `bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf` | Om Galaxy Limited | 509 | **Primary BSE SME source** (S2 in rule-sources). Most detailed eligibility disclosures. |
| `bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf` | Maxwell Engineering Solutions Limited | 381 | **Primary NSE Emerge source** (S5). Full NSE criteria including FCFE. |
| `bookbuilt__watertech__photonics-watertech__nse-emerge__2026-06__drhp.pdf` | Photonics Watertech Limited | 391 | **Only document with an OFS.** Sole source for the complete Reg 230(1)(a)-(h) list. |
| `bookbuilt__electricals__ideas-electricals__nse-emerge__2026-09__drhp.pdf` | Ideas Electricals & Engineers Limited | 345 | Second NSE source (S6) |
| `bookbuilt__plastics__shakti-polytarp__bse-sme__2026-09__rhp.pdf` | Shakti Polytarp Limited | 415 | **PRE-AMENDMENT VINTAGE.** States 50 allottees, not 200. Do not use for rule values — template text only. See D16. |
| `bookbuilt__gas-engineering__axiom-gas__nse-emerge__2026-09__rhp.pdf` | Axiom Gas Engineering Limited | 382 | Rs 5 face value; evidence the Rs 10 mandate is not in force |
| `bookbuilt__media__century-business-media__bse-sme__2026-09__rhp.pdf` | Century Business Media Limited | 303 | Smallest; ToC source for the section map |
All seven are text-layer PDFs — `pdftotext` reads them cleanly, no OCR required.

### Missing from disk

| File | Company | Why it matters |
|---|---|---|
| `fixedprice__agro__quanto-agroworld__bse-sme__2026-09__prospectus.pdf` | Quanto Agroworld Limited, 377pp | **The only fixed-price document.** Listed in this inventory but **not present on disk** as of 2026-09-10 — the directory holds seven prospectuses, not eight. Re-download before the fixed-price branch is built (D15), since nothing else in the corpus shows that document flow. |

## Derived from these — `fixtures/corpus/`

Each prospectus is split into a paired extraction fixture: the restated financial information as INPUT, the Capital Structure section as TRUTH. The text is committed even though the PDFs are not. See `fixtures/corpus/README.md`.

## Annual reports (`corpus/annual-reports/`)

Extraction test inputs for S7.

| File | Company | Pages |
|---|---|---|
| `ar__textiles__ab-cotspin__nse-emerge__fy2024-25.pdf` | A B Cotspin India Limited | 250 |
| `ar__agro__tbi-corn__nse-emerge__fy2025-26.pdf` | TBI Corn Limited | 116 |
| `ar__realestate__kontor-space__nse-emerge__fy2025-26.pdf` | Kontor Space Limited | 100 |
| `ar__steel__aditya-ultra-steel__nse-emerge__fy2025-26.pdf` | Aditya Ultra Steel Limited | 63 |

## Target

**The corpus is closed at 8 prospectuses** (decision 2026-09-10, superseding the original 25). Seven are on disk; the eighth is the Quanto fixed-price document listed above, which needs re-downloading.

Eight documents were enough to do the job the corpus exists for. Corroborating the exchange eligibility criteria across three BSE and four NSE documents corrected five criteria and added four that a single document per exchange had missed — see `.claude/context/05-rule-sources.md`, O-6. A larger corpus would keep finding things, but with sharply diminishing returns against the cost of reading each one.

## Known gaps, accepted

- Missing sectors: IT/software services, trading and distribution, textiles, chemicals, pharma. Matters most for the sector glossary (D21) and the risk archetypes (S10), which cannot be generalised from engineering and manufacturing alone.
- **Only one OFS example** (Photonics Watertech). Every OFS rule — Reg 230(1)(f) and (g) — rests on it.
- **Only one fixed-price document, and it is the one missing from disk.**
- Annual reports stop at 4 against an original target of 10. They are S7 extraction inputs, and `fixtures/corpus/` now supplies a better-paired dataset for that purpose.

## Provenance and ethics

Every document here is a public filing, retrieved from the exchange or an aggregator. MCA21 records are also public and may be purchased for testing. **Never add a private company's documents without written permission.**
