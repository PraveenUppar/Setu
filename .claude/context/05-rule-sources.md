# Rule sources — regulatory citations

**This file is the ONLY valid source of regulatory numbers for the rule pack.**

Not the domain primer. Not the plan. Not model memory.

**Append-only.** When a regulation changes, add a new row marked `SUPERSEDES <id>` — never edit an old one. Old issuers were assessed under old rules.

---

## Status — 2026-09-09

**Partially researched. NOT yet gate-passing — but most of the eligibility engine is now buildable.**

No entry is at `CONFIRMED`, because the notified ICDR text could not be retrieved directly — sebi.gov.in serves the regulations page without a readable body, and the consolidated PDF was not located. Everything rests on secondary sources.

| | Count | Buildable |
|---|---|---|
| `CORROBORATED` | 2 (R-001, R-002) | yes |
| `AS-APPLIED` | 18 regulations + 18 BSE (E-*) + 11 NSE (N-*) | yes |
| `PROPOSAL-ONLY` | **2** (R-007 minimum issue size, R-012 migration compliance) | **no** |

**Both exchanges are double-sourced** — BSE from S2 + S7, NSE from S5 + S6 + S8.

**The eligibility engine is buildable.** The two remaining unconfirmed items are peripheral: minimum issue size (every corpus issuer clears it comfortably) and post-listing migration compliance (which is a LODR obligation after listing, not an eligibility gate).

### The board memo was wrong on three of four numbers

Corroborating against real documents changed these:

| Item | Board memo proposed | Actually in force |
|---|---|---|
| Operating profit | Rs 3 crore | **Rs 1 crore** |
| GCP cap | 10% of issue size | **15%** of gross proceeds (Rs 10 crore cap confirmed) |
| MPC lock-in | 5 years | **3 years** (phased release above MPC confirmed) |
| Per-shareholder OFS cap | 20% of pre-issue holding | **50%**, fully diluted |
| OFS total cap | 20% of issue size | 20% — **confirmed** |
| Face value Rs 10 mandate | proposed | **not in force** |

**A rule pack built from the board memo would have been wrong on five of six.** This is the single strongest argument for the citation discipline.

The six proposal-only entries — issue size, OFS caps, promoter lock-in, GCP cap, migration compliance, face value — must not have rules built on them until the notified text is read.

### Confidence levels

| Level | Meaning | Safe to build a rule on? |
|---|---|---|
| `CONFIRMED` | Notified regulation text read verbatim | Yes |
| `CORROBORATED` | 2+ independent secondary sources agree | Yes, with the caveat noted |
| `AS-APPLIED` | A real prospectus states it as a condition it had to meet | Yes for exchange criteria; it is what an issuer was actually held to |
| `PROPOSAL-ONLY` | SEBI board memo proposal; final notification unverified | **No.** Do not build a rule. |

### Sources used

| Ref | Source |
|---|---|
| **S1** | SEBI board memo, *Review of SME framework under SEBI (ICDR) Regulations, 2018*, Jan 2025 — https://www.sebi.gov.in/sebi_data/meetingfiles/jan-2025/1735725342588_1.pdf (retrieved 2026-09-09, 49pp). **Proposals + public-comment responses. Not the notified text.** |
| **S2** | Om Galaxy Limited RHP, BSE SME, dated 2026-09-04, "Other Regulatory and Statutory Disclosures" pp.324–329 — `corpus/prospectus/bookbuilt__manufacturing__om-galaxy__bse-sme__2026-09__rhp.pdf`. **As-applied**: a 2026 issuer stating the conditions it met, with regulation citations. |
| **S3** | Web search summary of the ICDR Third Amendment 2025 (notified 2025-10-31, in force 30 days after gazette) and SME criteria commentary. **Weakest source — secondary commentary.** |
| **S4** | Maxwell Engineering DRHP cover page — `corpus/prospectus/bookbuilt__engineering__maxwell-engineering__nse-emerge__2026-08__drhp.pdf` |
| **S5** | Maxwell Engineering DRHP, **NSE Emerge**, dated 2026-08-15, "Eligibility for the Issue" pp.295–300 — same file. **As-applied**, and the NSE Emerge counterpart to S2. |
| **S6** | Ideas Electricals & Engineers DRHP, **NSE Emerge**, dated 2026-09-02, "Eligibility for the Issue" pp.269–271 — `corpus/prospectus/bookbuilt__electricals__ideas-electricals__nse-emerge__2026-09__drhp.pdf`. Second NSE source. |
| **S7** | Shakti Polytarp RHP, **BSE SME**, dated 2026-09-08, eligibility + "BSE Eligibility Norms" pp.322–325 — `corpus/prospectus/bookbuilt__plastics__shakti-polytarp__bse-sme__2026-09__rhp.pdf`. Second BSE source — **and a PRE-AMENDMENT vintage document.** See CRITICAL FINDING. |

### The discrepancy that proves the gate's worth

**Operating profit threshold.** S1 (board memo) proposes **Rs 3 crore** and explicitly rejects reducing it: *"we may continue with the proposal without any modification."* But S2 (a real 2026 RHP) and S3 both say **Rs 1 crore**.

Two independent sources beat one proposal. The threshold was evidently reduced between board approval and notification. **R-002 is recorded at Rs 1 crore**, and it must be confirmed against the notified text before the eligibility engine ships.

Had I written this from the board memo alone, or from memory, either would have been wrong.

---

## CRITICAL FINDING — the rule pack must be effective-date aware

Corroborating across four documents surfaced a **direct contradiction on minimum allottees**:

| Document | Exchange | Dated | Minimum allottees |
|---|---|---|---|
| Om Galaxy RHP | BSE SME | 2026-09-04 | **200** |
| Maxwell DRHP | NSE Emerge | 2026-08-15 | **200** |
| Ideas Electricals DRHP | NSE Emerge | 2026-09-02 | **200** |
| **Shakti Polytarp RHP** | **BSE SME** | **2026-09-08** | **50** |

All four are 2026 filings on SME platforms. Three say 200; one says 50.

**Shakti is not wrong — it is a different vintage.** The SME amendments apply to **draft offer documents filed after the date of notification**. Shakti's RHP is dated September 2026, but its *DRHP* was evidently filed before notification, so the whole issue stays under the pre-amendment rules.

Shakti corroborates this elsewhere. Its BSE norms state operating profit *"from operations for at least 2 financial years preceding the application"* with **no rupee threshold**, and attaches the Rs 1 crore to **net worth** instead. Om Galaxy and Maxwell both state Rs 1 crore for **operating profit**. Shakti's whole eligibility section reads as the pre-amendment regime.

### What this means for the build

**A rule cannot be a single current value. Every rule needs an effective-date range, and eligibility must be evaluated against the issuer's DRHP filing date — not today's date.**

```ts
type Rule = {
  // ...
  effectiveFrom?: string   // ISO date; rule applies to DRHPs filed on/after
  effectiveTo?: string     // ISO date; superseded after this
}
```

The eligibility engine takes the intended (or actual) DRHP filing date as an input and selects the applicable rule set. An issuer being advised today falls under the current rules; one whose DRHP is already filed may not.

This also validates D10's "rule pack is versioned data, never baked into prompts" — but makes it concrete and urgent rather than a nice-to-have. **Add `effectiveFrom` to the `Rule` type in S6.**

### Consequence timelines also differ

Three formulations of the Reg 268 repayment consequence across the corpus:

| Document | Window | Interest |
|---|---|---|
| Om Galaxy | 4 days | 15% per annum |
| Shakti | 4 days | as prescribed under Companies Act s.40 and ICDR |
| Ideas | **8 working days** | as prescribed under Companies Act 2013 |

The 200 figure is solid; **the consequence timeline is not.** Do not encode 4 days or 15% until the notified text confirms which applies.

---

## Entries

### R-001 — Post-issue paid-up capital bands

- **threshold:** Reg 229(1): post-issue paid-up capital **up to Rs 10 crore** -> may issue on SME platform. Reg 229(2): **more than Rs 10 crore and up to Rs 25 crore** -> may also issue on SME platform.
- **clause:** ICDR Reg 229(1), 229(2), Chapter IX
- **verbatim (S2):** "eligible for the Issue in accordance with Regulation 229(2) ... as we are a Company whose post Issue paid-up capital is more than ten crore rupees and up to twenty-five crore rupees"
- **corroboration (S4):** "AS THE COMPANY'S POST OFFER FACE VALUE CAPITAL EXCEEDS 1000 LAKHS BUT DOES NOT EXCEED 2500 LAKHS" — cites Reg 229(2)
- **confidence:** `CORROBORATED` (S2 + S4, two independent issuers)
- **checked:** 2026-09-09

### R-002 — Operating profit track record

- **threshold:** Operating profit (EBITDA) of **at least Rs 1 crore from operations in at least 2 of the 3 preceding financial years**
- **clause:** Chapter IX eligibility — exact sub-regulation TBC
- **verbatim (S2):** "Our Company is having operating profit of at least 1 crore from operation for at least 2 (Two) out of 3 (Three) financial years"
- **verbatim (S5, NSE Emerge):** "Our Company has operating profits (earnings before interest, depreciation and tax) of 1 Crore from operations for at least two out of three previous financial years preceding the application date"
- **CONFLICT (S1):** board memo proposed **Rs 3 crore** — "operating profit (earnings before interest, depreciation and tax) of Rs. 3 crore from operations for any 2 out of 3 financial years preceding the application", and rejected reduction requests
- **confidence:** `CORROBORATED` at **Rs 1 crore** — three independent sources (S2 BSE SME, S5 NSE Emerge, S3 commentary)
- **notes:** **O-1 substantially resolved.** Both exchanges state Rs 1 crore under Reg 229(3), and both are 2026 filings. The board memo's Rs 3 crore was either not notified or was reduced before notification. Real 2026 issuers are held to Rs 1 crore at both venues. Still worth confirming against notified text, but no longer blocking.
- **checked:** 2026-09-09

### R-003 — Underwriting

- **threshold:** Issue must be **100% underwritten**; the BRLM must underwrite **minimum 15% of the total issue size** on its own account
- **clause:** ICDR **Reg 260**
- **verbatim (S2):** "In accordance with Regulation 260 of the SEBI ICDR Regulations, this Issue will be 100% underwritten and that the Book Running Lead Manager to the Issue shall underwrite minimum 15% of the Total Issue Size."
- **confidence:** `AS-APPLIED`
- **checked:** 2026-09-09

### R-004 — Market making

- **threshold:** Compulsory market making for a **minimum of 3 years** from the date of listing
- **clause:** ICDR **Reg 261(1)**
- **verbatim (S2):** "In accordance with Regulation 261(1) ... compulsory Market Making for a minimum period of three (3) years from the date of listing"
- **confidence:** `AS-APPLIED`
- **checked:** 2026-09-09

### R-005 — Minimum number of allottees

- **threshold:** Minimum **200** allottees. If fewer, no allotment is made and application money is unblocked forthwith; if not repaid within **4 days**, the company and every officer in default is liable to repay with interest at **15% per annum**.
- **clause:** ICDR **Reg 268**, **Reg 268(1)**
- **verbatim (S2):** "the total number of proposed allottees in the Issue shall be greater than or Equal to Two Hundred (200), otherwise, the entire application money will be unblocked forthwith. If such money is not repaid within Four (4) Days ... liable to repay such application money, with an interest at the rate of fifteen per cent per annum"
- **corroboration (S5):** "the total number of proposed Allottees in the Issue shall be greater than or equal to two hundred, failing which, the entire application money will be refunded forthwith"
- **corroboration (S6 Ideas, NSE):** "greater than or equal to two hundred (200)"
- **PRE-AMENDMENT VALUE: 50.** S7 (Shakti Polytarp, BSE SME) states "greater than or equal to fifty" — a pre-amendment-vintage document. See the CRITICAL FINDING above.
- **confidence:** `AS-APPLIED` — **upgraded from PROPOSAL-ONLY.** Three 2026 issuers across both exchanges certify 200.
- **effectiveFrom:** the 2025 SME amendment notification date — **exact date still needed**, and it is the pivot for which value applies
- **notes:** Consequence timeline unresolved — 4 days vs 8 working days, 15% p.a. vs Companies Act rate. Encode 200; do not encode the consequence yet.
- **checked:** 2026-09-09

### R-020 — General ineligibility conditions

- **threshold:** An issuer is ineligible if any of the following applies:
  - **228(a)** issuer, promoters, promoter group or directors debarred from accessing capital markets by SEBI
  - **228(b)** promoters or directors are promoter/director of any other company so debarred
  - **228(c)** issuer, any promoter or any director is a **wilful defaulter or fraudulent borrower**
  - **228(d)** any promoter or director is a **fugitive economic offender**
  - **228(e)** there are **outstanding convertible securities or any other right** entitling any person to an option to receive equity shares
- **clause:** ICDR **Reg 228(a)–(e)**
- **confidence:** `AS-APPLIED` — corroborated across exchanges: S6 (Ideas, NSE Emerge) and S7 (Shakti, BSE SME), clause by clause
- **notes:** 228(e) is a **hard blocker with a long lead time** — outstanding convertibles must be converted or extinguished before filing. Surface this in the eligibility pre-check, not late.
- **checked:** 2026-09-09

### R-021 — General conditions for the issue

- **threshold:**
  - **230(1)(a)** application made to the SME platform; that exchange is the Designated Stock Exchange
  - **230(1)(b)** agreement entered with depositories for dematerialisation of securities already issued and proposed to be issued
  - **230(1)(c)** **all present equity share capital is fully paid up**
  - **230(1)(d)** specified securities held by promoters, promoter group, selling shareholders, directors, KMP, senior management, QIBs, employees, SR equity shareholders, and entities regulated by Financial Sector Regulators are **already in dematerialised form**
- **clause:** ICDR **Reg 230(1)(a)–(d)**
- **confidence:** `AS-APPLIED` — corroborated by S6 and S7
- **notes:** **Scope of 230(1)(d) differs by vintage.** S7 (pre-amendment) states only "held by the promoters"; S6 lists the full class. Use the broader list for current filings; another effective-date case.
- **checked:** 2026-09-09

### R-006 — Minimum application size

- **threshold:** Minimum application is **two lots per application**, and the minimum application size shall be **above Rs 2,00,000**
- **clause:** ICDR **Reg 267**
- **verbatim (S2):** "in accordance with Regulation 267 of the SEBI ICDR Regulations, the minimum application size shall be two lots per application. Provided that the minimum application size shall be above Rs 2,00,000."
- **confidence:** `AS-APPLIED` — **upgraded from PROPOSAL-ONLY.** The Rs 2 lakh proposal was notified (not the alternate Rs 4 lakh). Reg 267 is the clause.
- **notes:** "Two lots" and "above Rs 2,00,000" are **both** conditions. A rule must check both.
- **checked:** 2026-09-09

### R-007 — Minimum issue size

- **threshold:** S1 proposes issue size must be **more than Rs 10 crore**
- **verbatim (S1):** "an issuer should be eligible to make an initial public offer only if the issue size is more than Rs. 10 crore" — comment response: "there is no change made in the proposal"
- **confidence:** `PROPOSAL-ONLY`
- **checked:** 2026-09-09

### R-008 — Offer for sale caps

- **threshold:** **Two separate caps, both apply:**
  - **Reg 230(1)(f)** — total OFS **shall not exceed 20% of the total issue size**
  - **Reg 230(1)(g)** — per selling shareholder, shares offered **shall not exceed 50% of that shareholder's pre-issue shareholding on a fully diluted basis**
- **clause:** ICDR **Reg 230(1)(f)**, **Reg 230(1)(g)**
- **verbatim (S8):** "the size of offer for sale by selling shareholders shall not exceed twenty per cent of the total issue size" / "the shares being offered for sale by selling shareholders shall not exceed fifty per cent of such selling shareholders' pre-issue shareholding on a fully diluted basis"
- **confidence:** `AS-APPLIED` — **upgraded from PROPOSAL-ONLY.** S8 is the only corpus document with an actual OFS, so it is the authoritative source here.
- **notes:** The board memo proposed **20%** for the per-shareholder cap; the notified figure is **50%**. **O-3 resolved** — the 50% in the web commentary is correct and is Reg 230(1)(g); the "10%" tier in that summary does not appear in the SME provisions.
- **checked:** 2026-09-09

### R-009 — Promoter lock-in

- **threshold:** The full lock-in ladder:

  | Holding | Lock-in |
  |---|---|
  | **Minimum Promoter's Contribution** — at least **20% of post-issue equity share capital** held by promoters | **3 years** from allotment |
  | Promoter holding **in excess of MPC** — first 50% | **1 year** from allotment |
  | Promoter holding **in excess of MPC** — remaining 50% | **2 years** from allotment |
  | Entire pre-issue capital held by **persons other than promoters** | **1 year** from allotment |
  | Anchor investor portion — 50% | 90 days from allotment |
  | Anchor investor portion — remaining 50% | 30 days from allotment |
  | VCF / Cat I or II AIF / FVCI pre-IPO holdings | exempt, if held **1 year** from date of purchase |

- **verbatim (S2):** "held by our Promoters shall be considered as promoter's contribution ... and locked-in for a period of three years from the date of Allotment"
- **corroboration (S5):** "an aggregate of at least 20% of the post Issue Equity Share capital of our Company held by our Promoters shall be locked-in for a period of three years from the date of allotment"
- **confidence:** `AS-APPLIED` — **upgraded from PROPOSAL-ONLY.** Both exchanges, both post-amendment documents.
- **notes:** **The board memo proposed 5 years for MPC. Actual documents say 3 years** — the increase was evidently not notified. The **phased release above MPC (50% at 1yr, 50% at 2yr) IS confirmed.** So the memo was right about the phasing and wrong about the MPC duration.
- **checked:** 2026-09-09

### R-010 — General Corporate Purposes cap

- **threshold:** GCP shall not exceed **15% of the gross proceeds of the issue, or Rs 10 crore, whichever is lower**
- **verbatim (S2):** "the total amount to be utilized towards general corporate purposes will not exceed 15% of the Gross Proceeds from the Issue or Rs 1,000.00 Lakhs, whichever is lower, in accordance with the SEBI ICDR Regulations"
- **corroboration (S5):** "the amount for general corporate purposes ... shall not exceed fifteen percent of the amount being raised by our Company or Rs 10 Crores, whichever is less"
- **confidence:** `AS-APPLIED` — **upgraded from PROPOSAL-ONLY.** Both exchanges agree.
- **notes:** **The board memo proposed 10%. The notified figure is 15%.** Also: **issue-related expenses are NOT counted as GCP** — S5: "any issue related expenses shall not be considered as a part of General Corporate Purpose." That matters for the consistency rule that reconciles objects + issue expenses against issue size; they are separate buckets.
- **checked:** 2026-09-09

### R-011 — No repayment of promoter/related-party loans from proceeds

- **threshold:** Objects of the issue must **not** include repayment of loans from promoters, promoter group members, or any related party, from gross proceeds, whether directly or indirectly
- **clause:** S1 section 12; Chapter IX
- **verbatim (S2):** "The Objects of the Issue does not consist of Repayment of Loan from Promoters, members of the Promoter Group or any related party, from the Gross proceeds, whether directly or indirectly."
- **confidence:** `AS-APPLIED` — a 2026 issuer certified compliance, so this is in force
- **checked:** 2026-09-09

### R-012 — Migration / post-listing compliance

- **threshold:** An SME whose **post-issue paid-up capital exceeds Rs 25 crore** becomes subject to main-board LODR corporate governance and disclosure obligations including quarterly results, even without migrating
- **verbatim (S1):** "such Company shall be subjected to Main Board compliances of corporate governance and disclosures under LODR including quarterly results, when its post issue paid-up capital increases beyond 25 crore"
- **confidence:** `PROPOSAL-ONLY`
- **checked:** 2026-09-09

### R-013 — Face value

- **threshold:** S1 proposed mandating **face value Rs 10**. **NOT IN FORCE** — do not build this rule.
- **evidence:** Face values across the corpus, all 2026 filings: Rs 10 (Century, Maxwell, Ideas, Photonics, Quanto, Shakti) and **Rs 5 (Om Galaxy, Axiom Gas)**. Om Galaxy is post-amendment on every other test (200 allottees, Rs 1 crore operating profit) yet carries Rs 5.
- **confidence:** `AS-APPLIED` that the mandate is **not applicable** — a post-amendment issuer listed at Rs 5
- **notes:** Either not notified, or prospective only for newly incorporated companies as the memo suggested. **A rule requiring Rs 10 would wrongly reject real 2026 issuers.**
- **checked:** 2026-09-09

### R-022 — Firm arrangements of finance

- **threshold:** The issuer must have made **firm arrangements of finance through verifiable means for 75% of the stated means of finance** for the project, **excluding** the amount to be raised through the issue and existing internal accruals
- **clause:** ICDR **Reg 230(1)(e)**; **Paragraph 9(C)(1) of Part A of Schedule VI**
- **verbatim (S8):** "it has made firm arrangements of finance through verifiable means towards seventy-five per cent. of the stated means of finance for the project proposed to be funded f[rom the issue]"
- **confidence:** `AS-APPLIED` — S8, corroborated by S2 citing the same clause pair
- **notes:** Only bites where the objects include a **project**. An issuer funding entirely from net proceeds plus internal accruals is exempt — S2 states exactly that exemption. `appliesTo` must check for a project object.
- **checked:** 2026-09-09

### R-023 — Minimum issue size as a proportion of post-issue capital

- **threshold:** The issue must be for **at least 25% of the post-issue paid-up equity share capital**
- **clause:** **Rule 19(2)(b) of the Securities Contracts (Regulation) Rules, 1957**, read with ICDR **Reg 252**
- **verbatim (S2):** "In terms of Rule 19(2)(b) of the Securities Contracts (Regulation) Rules, 1957, as amended (the "SCRR") read with Regulation 252 of SEBI ICDR Regulations, 2018, the Issue is being made for at least 25% of the post-Issue Paid-up Equity Share capital of our Company."
- **corroboration (S5):** same sentence, "at least 25% of the post-Offer Paid-up Equity Share capital"
- **confidence:** `AS-APPLIED` — identical wording on both exchanges
- **checked:** 2026-09-09

### R-024 — Allocation split in a book-built SME issue

- **threshold:**

  | Category | Allocation |
  |---|---|
  | QIBs | **not more than 50%** of the net issue, proportionate |
  | Anchor Investors (out of the QIB portion) | **up to 60%** of the QIB portion, discretionary |
  | — of the anchor portion, domestic mutual funds | **33.33%** reserved |
  | — of the anchor portion, life insurance and pension funds | **6.67%** reserved |
  | Mutual Funds (of the net QIB portion, excluding anchor) | **5%**, proportionate |
  | Non-Institutional Investors | **not less than 15%** of the net issue |
  | — NII sub-category, application above two lots and up to Rs 10 lakh | **one-third** |
  | — NII sub-category, application above Rs 10 lakh | **two-thirds** |
  | Individual Investors | **not less than 35%** of the net issue |

- **clause:** ICDR **Reg 229(2)**, Chapter IX, read with the SEBI ICDR allocation provisions
- **confidence:** `AS-APPLIED` — S2 and S5 state the same figures on both exchanges
- **notes:** Under-subscription in any category **except the QIB portion** may be met by spill-over from another category, at the discretion of the company in consultation with the BRLM and the designated stock exchange. Under-subscription in the QIB portion may **not** be met by spill-over. Under-subscription in the anchor portion returns to the QIB portion. Under-subscription in the life-insurance and pension reservation may go to domestic mutual funds.
- **checked:** 2026-09-09

### R-025 — Minimum subscription

- **threshold:** The issuer must receive a **minimum subscription of 90% of the issue**. Minimum subscription does **not** apply where the issue is in the nature of an offer for sale only.
- **verbatim (S2):** "Our Company is required to receive a minimum subscription of 90% of the Issue. However, in case the Issue is in the nature of offer for sale only, then minimum subscription may not be applicable."
- **corroboration:** S5 (Maxwell, NSE Emerge) and Century Business Media state the same, near-verbatim
- **confidence:** `AS-APPLIED` — **three independent sources across both exchanges**
- **notes:** Distinct from R-019 (Companies Act s.39, the 60-day full-subscription refund). This is the ICDR floor on how much of the issue must be taken up.
- **checked:** 2026-09-10

---

## Reg 230(1) — the complete general conditions list

Recovered in full from S8. This is the backbone of the eligibility engine.

| Clause | Condition |
|---|---|
| **230(1)(a)** | Application made to the SME platform; that exchange is the Designated Stock Exchange |
| **230(1)(b)** | Agreement with depositories for dematerialisation of securities already issued and proposed to be issued |
| **230(1)(c)** | All present equity share capital is **fully paid up** |
| **230(1)(d)** | Specified securities held by promoters, promoter group, selling shareholders, directors, KMP, senior management, QIBs, employees, SR equity shareholders and entities regulated by Financial Sector Regulators are **in dematerialised form** |
| **230(1)(e)** | Firm arrangements of finance for **75%** of stated means of finance (R-022) |
| **230(1)(f)** | OFS **not more than 20% of total issue size** (R-008) |
| **230(1)(g)** | Per selling shareholder, **not more than 50% of pre-issue shareholding**, fully diluted (R-008) |
| **230(1)(h)** | Objects **must not** include repayment of loans from promoter, promoter group or any related party, directly or indirectly (R-011) |

### R-014 — Schedule VI compliance

- **threshold:** SME offer documents must comply with **Part A of Schedule VI** of ICDR. Exemptions from eligibility norms are sought under **Reg 300**.
- **verbatim (S2):** "Our Company is in compliance with the provisions specified in Part A of Schedule VI of the SEBI ICDR Regulations ... no exemption from eligibility norms has been sought under Regulation 300"
- **confidence:** `AS-APPLIED`
- **notes:** **Part A of Schedule VI is the disclosure specification the section registry must satisfy.** Retrieving its text is the highest-value remaining research task.
- **checked:** 2026-09-09

---

## BSE SME exchange criteria — from S2, as-applied

Stated under Reg 229(3) ("track record and/or other eligibility conditions of SME Platform"). These sit **on top of** SEBI's requirements. NSE Emerge criteria differ and are not yet captured.

| # | Condition | Confidence |
|---|---|---|
| E-01 | Net worth **at least Rs 1 crore in 2 of 3 financial years** | `AS-APPLIED` |
| E-02 | **Track record of more than 3 years** | `AS-APPLIED` |
| E-03 | Operating profit **Rs 1 crore in 2 of 3 FYs** (see R-002) | `AS-APPLIED` |
| E-04 | **Leverage ratio (total debt to equity) not more than 3:1** | `AS-APPLIED` |
| E-05 | Positive net tangible assets (disclosed as a 3-year table) | `AS-APPLIED` |
| E-06 | Functional website | `AS-APPLIED` |
| E-07 | Promoter shareholding in dematerialised form | `AS-APPLIED` |
| E-08 | **No change in promoters having significant control in the 1 year preceding** | `AS-APPLIED` |
| E-09 | No name change in the last 1 year | `AS-APPLIED` |
| E-10 | Application not rejected by the exchange in the last 6 complete months | `AS-APPLIED` |
| E-11 | Not referred to NCLT under the Insolvency and Bankruptcy Code | `AS-APPLIED` |
| E-12 | No admitted winding-up petition; no liquidator appointed | `AS-APPLIED` |
| E-13 | No material regulatory/disciplinary action by an exchange or regulator in past **3 years** (company) / **1 year** (promoters) | `AS-APPLIED` |
| E-14 | Board composition compliant with Companies Act 2013 | `AS-APPLIED` |
| E-15 | Tripartite agreements with **both** NSDL and CDSL plus the RTA | `AS-APPLIED` |
| E-16 | Promoters/directors not promoters or directors of compulsorily delisted companies | `AS-APPLIED` |
| E-17 | Not referred to BIFR | `AS-APPLIED` |
| E-18 | No pending defaults on interest/principal to debenture, bond or fixed deposit holders | `AS-APPLIED` |

### R-015 — SEBI does not vet SME offer documents

- **threshold:** A copy of the prospectus is filed with SEBI through the BRLM immediately upon filing with the RoC. **SEBI shall not issue any observation on the issue document.**
- **clause:** ICDR **Reg 246(1)**, **Reg 246(2)**
- **verbatim (S2):** "In terms of Regulation 246(1) ... a copy of the prospectus will be filed with the SEBI through the Book Running Lead Manager immediately upon filing of the Issue document with the Registrar of Companies. However, as per Regulation 246(2) ... the SEBI shall not issue any observation on the Issue document."
- **confidence:** `AS-APPLIED`
- **notes:** Confirms the core premise — the exchange vets, not SEBI. This is why merchant-banker certification carries the weight it does, and why our sign-off gate matters.
- **checked:** 2026-09-09

### R-016 — Due diligence certificate and site visit report

- **threshold:** The BRLM submits a **Due Diligence Certificate with a Site Visit Report annexed**, plus the draft abridged prospectus, along with the draft offer document, to the exchange
- **clause:** ICDR **Reg 246(3)**
- **verbatim (S5):** "In terms of Regulation 246(3) ... our Book Running Lead Manager submits a Due Diligence Certificate to which the Site Visit Report will also be annexed, including additional confirmations as required along with the draft abridged prospectus along with the draft offer document to the NSE Emerge."
- **confidence:** `AS-APPLIED`
- **notes:** A **site visit** is a statutory part of the process. The tool cannot substitute for it — worth saying in the pitch.
- **checked:** 2026-09-09

### R-017 — Refund on listing refusal

- **threshold:** If listing or trading permission is not obtained, refund the entire monies within **4 days** of the exchange's rejection; beyond that, issuer and every director who is an officer in default are jointly and severally liable with **15% per annum** interest
- **clause:** ICDR **Reg 272(2)**
- **confidence:** `AS-APPLIED` (S2)
- **checked:** 2026-09-09

### R-018 — Migration to main board

- **threshold:** An issuer listed on an SME exchange with post-issue paid-up capital **more than Rs 10 crore and up to Rs 25 crore** may migrate to the main board if shareholders approve by **special resolution through postal ballot** and the issuer meets the exchange's listing eligibility criteria
- **clause:** ICDR **Reg 277**
- **verbatim (S2):** "an issuer, whose specified securities are listed on a SME Exchange and whose post-issue paid up capital is more than ten crore rupees and up to twenty five crore rupees, may migrate its specified securities to the main board ... if its shareholders approve such a migration by passing a special resolution through postal ballot"
- **confidence:** `AS-APPLIED`
- **checked:** 2026-09-09

### R-019 — Minimum subscription

- **threshold:** Issue is 100% underwritten, so no minimum subscription level applies. If 100% subscription (including underwriter devolvement) is not received within **60 days** of issue closure, the entire subscription amount is refunded. Companies Act s.39 applies where the stated minimum is not subscribed within **30 days** of the prospectus.
- **clause:** Companies Act 2013 **s.39**; read with ICDR Reg 260
- **confidence:** `AS-APPLIED` (S2)
- **checked:** 2026-09-09

---

## NSE Emerge exchange criteria — from S5, as-applied

Stated under Reg 229(3). **These differ materially from BSE SME's.** Any eligibility rule must be exchange-switched.

| # | Condition | Confidence |
|---|---|---|
| N-01 | Post-issue capital **below Rs 2,500 lakhs** (Rs 25 crore) | `AS-APPLIED` |
| N-02 | **Track record of at least 3 years** as on the date of filing | `AS-APPLIED` |
| N-03 | Operating profit (EBITDA) **Rs 1 crore from operations in at least 2 of 3 preceding FYs** | `AS-APPLIED` |
| N-04 | **Positive Free Cash Flow to Equity (FCFE) in at least 2 of 3 immediately preceding FYs** | `AS-APPLIED` |
| N-05 | No repayment of promoter / promoter group / related party loans from issue proceeds | `AS-APPLIED` |
| N-06 | Not referred to BIFR; no IBC proceedings admitted against the company **or promoting companies** | `AS-APPLIED` |
| N-07 | No winding-up petition admitted by NCLT or a competent court; no liquidator appointed | `AS-APPLIED` |
| N-08 | **None of the merchant bankers involved has had an IPO draft offer document returned by NSE in the past 6 months** | `AS-APPLIED` |
| N-09 | No regulatory or disciplinary action by an exchange or regulator against promoters, promoting companies, or group companies | `AS-APPLIED` |
| N-10 | No suspension of trading against promoters or promoted companies by any nationwide exchange | `AS-APPLIED` |
| N-11 | Promoters/directors (other than independent directors) not promoters or directors of compulsorily delisted companies | `AS-APPLIED` |

### BSE SME vs NSE Emerge — the material differences

| Criterion | BSE SME | NSE Emerge |
|---|---|---|
| Positive **FCFE**, 2 of 3 FYs | not required | **required** (N-04) |
| **Leverage ratio** debt:equity | **max 3:1** (E-04) | not stated |
| **Net tangible assets** table | **required** (E-05) | not stated |
| Functional website | **required** (E-06) | not stated |
| Promoter shares in demat | **required** (E-07) | not stated |
| No promoter control change, 1 yr | **required** (E-08) | not stated |
| No name change, 1 yr | **required** (E-09) | not stated |
| The 6-month rule | **the company's** application not rejected by the exchange (E-10) | **the merchant banker's** draft documents not returned by NSE (N-08) |
| Net worth Rs 1 cr, 2 of 3 FYs | **required** (E-01) | net worth disclosed but no stated threshold |

**The 6-month rule differs in subject**, which is easy to get wrong: BSE looks at the issuer, NSE looks at the banker. Two different rules, not one.

**Caveat:** each list comes from one prospectus per exchange. A second document per exchange should corroborate before these ship. "Not stated" means absent from that issuer's list, not proven inapplicable.

---

## Open questions

| # | Status | Question | Blocks |
|---|---|---|---|
| **O-1** | **Largely resolved** | Operating profit is **Rs 1 crore**, confirmed at both exchanges by 2026 filings. The board memo's Rs 3 crore was not notified at that level. Worth a final check against notified text, no longer blocking. | — |
| **O-2** | Open | What was **notified** vs merely proposed? Still `PROPOSAL-ONLY`: R-007 issue size, R-008 OFS caps, R-009 lock-in, R-010 GCP cap, R-012 migration compliance, R-013 face value. (R-005 and R-006 resolved.) | 6 rules |
| **O-3** | Open | Do the S3 tiered OFS caps (50% / 10%) apply to SME, or only main board? They contradict S1's flat 20%. | R-008 |
| **O-4** | **Resolved** | NSE Emerge criteria captured from S5 (N-01 to N-11) with a BSE/NSE difference table. | — |
| **O-5** | Open | **Part A of Schedule VI full text** — the disclosure specification the section registry must satisfy. Highest-value remaining item. | Section registry, completeness rules |
| **O-6** | **Resolved** | Corroborated: NSE against S6 (Ideas), BSE against S7 (Shakti). Yielded R-020 (Reg 228) and R-021 (Reg 230(1)), and surfaced the effective-date problem. | — |
| **O-7** | **New, blocking** | **What is the notification date of the 2025 SME amendment?** It is the pivot that decides whether an issuer gets 200 allottees or 50, Rs 1 crore operating profit or none. Every `effectiveFrom` depends on it. | Whole eligibility engine |
| **O-8** | New | Reg 268 consequence timeline: **4 days vs 8 working days**, and **15% p.a. vs Companies Act s.40 rate**. Three formulations across three documents. | R-005 consequence text |
| **O-9** | New | Does the Rs 1 crore attach to **operating profit**, **net worth**, or both? Om Galaxy says both; Maxwell says operating profit; Shakti (pre-amendment) says net worth only, with operating profit unquantified. | R-002, E-01, E-03 |
| **O-10** | New | **Site Visit Report** annexed to the due diligence certificate (R-016) appears in S5 only. S6, S7 and S2 describe Reg 246 without it. Single-source. | R-016 |

---

## Next research actions

1. **Corroborate the exchange criteria** — second document per exchange. No web access needed. Cheapest remaining win. (O-6)
2. **Retrieve the notified ICDR text** for the six remaining `PROPOSAL-ONLY` entries. The consolidated regulations page did not render in WebFetch. **Technique that works: download the PDF to disk, then `pdftotext` locally** — that is how the board memo was read. Try gazette notification PDFs for the 2025 amendments, or a law-database mirror. (O-2, O-3)
3. **Locate Part A of Schedule VI.** (O-5)

---

## Methodological note

**The corpus is a first-rate regulatory source and should be used before the web.**

Each prospectus's "Other Regulatory and Statutory Disclosures" and "Eligibility for the Issue" sections are issuer's counsel certifying, with regulation citations, exactly which conditions the company had to meet — under Companies Act s.34/35 liability. That is weaker than the notified text but **stronger than a proposal document**, and it reflects what is actually enforced.

Two upgrades came from it in one pass: minimum allottees (200) and minimum application size (Rs 2 lakh) both moved from `PROPOSAL-ONLY` to `AS-APPLIED`, and the operating profit conflict was resolved against the board memo.

Read the corpus first. It is free, offline, and current.
