---
name: sme-domain
description: SME IPO domain knowledge — section structure of a fixed-price draft prospectus, which producer class each section belongs to, disclosure data requirements, and the citation discipline for regulatory numbers. Use when working on the section registry, module specs, rule definitions, risk archetypes, or anything requiring SEBI/ICDR terminology.
---

# SME IPO domain

Read `.claude/context/01-domain-primer.md` for the full primer. This skill is the working discipline.

## The four producer classes

Every section belongs to exactly one. Get this right before writing anything.

| Class | Share | Method | Never |
|---|---|---|---|
| **Boilerplate** | 50–60% | Template + `{{variables}}` + conditional blocks | Never generate with an LLM |
| **Computed** | ~15% | Pure TypeScript over the fact base, `decimal.js` for money | Never approximate |
| **Narrative** | 25–30% | LLM scoped to a `factSlice` | Never let it see the whole fact base |
| **External** | ~20% | Auditor / CA supplies it | Never draft it ourselves |

Misclassifying a section is the most expensive mistake available. Generating Offer Procedure with an LLM produces 30 pages of plausible, unciteable, legally defective text.

## Citation discipline — the hard rule

**No regulatory number enters code without a row in `.claude/context/05-rule-sources.md`.**

Not from the domain primer (explicitly unverified). Not from a plan document. Not from model memory — SME norms were amended materially in 2025 and training data is unreliable here.

If a rule is needed and the citation doesn't exist yet:

1. Say so plainly
2. Verify against the live SEBI text (ICDR Chapter IX, Schedule VI, the ICDR Master Circular) and the relevant exchange rulebook
3. Write the row — threshold, clause, **verbatim text**, URL, date checked
4. Then write the rule, referencing the row id

Never write a rule with a `TODO: verify threshold` and move on. That threshold will ship.

## Fixed price, not book built

We target fixed-price issues. The document is **Draft Prospectus → Prospectus** — there is no "red herring", because the price is stated upfront.

No book-building, anchor investors, price bands, or price discovery. Section specs carry `appliesIf` so the book-built branch can be added later.

If you find yourself writing "price band" or "DRHP", check whether you've drifted into the main-board or book-built framing.

## Section structure

Eleven sections. The full table with page counts and producer classes is in the primer. The shape:

```
I    General            — definitions, conventions, forward-looking     B
II   Summary            — derived from everything else
III  Risk Factors       — the hardest section                           N
IV   Introduction       — the offer, financials summary, general info,
                          capital structure                             C
V    Particulars        — objects, basis for price, tax benefits      N/C/X
VI   About the Company  — industry, business, regulations, history,
                          management, promoters, dividend            N/B/C
VII  Financial Info     — restated financials, MD&A, capitalisation,
                          indebtedness                                X/N/C
VIII Legal              — litigation, approvals, regulatory disclosures C/B
IX   Offer Information  — terms, structure, procedure, foreign ownership B
X    Articles           — main provisions of AoA                        B
XI   Other              — material contracts, declaration               C/B
```

## Terminology

Use the register of a real prospectus. It is formal, third-person, and specific.

| Use | Not |
|---|---|
| the Issuer / our Company | the client, the business |
| **the Issue** (default) | the IPO, the deal |
| Promoter / Promoter Group | founder, owner |
| DRHP -> RHP -> Prospectus | Draft Prospectus *(fixed-price only)* |
| Restated Financial Information | financials, accounts |
| Offer for Sale (OFS) | secondary sale |
| Lock-in | vesting, holding period |
| material | significant, important |

**"Issue" vs "Offer" is a merchant-banker house style, not a rule.** Measured across 5 real documents: 4 use "Issue" (Objects of the Issue, Terms of the Issue, Issue Procedure, Basis for Issue Price), 1 uses "Offer". Default to **Issue**; make it a config toggle. Never mix the two within one document.

## Scope boundaries — do not cross

Never generate: **restated financial statements** (peer-reviewed CA), the **statement of special tax benefits** (CA opinion letter), or **legal opinions on litigation materiality** (counsel's call).

These render as clearly-marked structural placeholders with an "invite your auditor" action. Being explicit about this is a strength — it shows we understand where professional obligations sit.

## Never invent

Missing fact → `[TO BE PROVIDED: <specific ask>]` **and** a gap, from the same check.

Companies Act s.34/35 makes a misstatement in an offer document a real liability, criminal and civil. A confident fabrication is strictly worse than a visible blank.
