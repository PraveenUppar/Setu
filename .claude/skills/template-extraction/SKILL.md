---
name: template-extraction
description: Method for turning corpus prospectuses into Wave 1 boilerplate templates — aligning the same section across several real documents, marking invariant text vs variables vs conditional blocks, tracing variables to fact paths, and verifying by re-rendering against a held-out prospectus. Use when building any template-producer section (Offer Procedure, Definitions, Terms of the Offer, AoA, Regulatory Disclosures, Key Regulations).
---

# Template extraction

Turns ~110 pages of near-identical boilerplate into parameterised templates. This is mechanical work with a very high payoff — Wave 1 is ~40% of the document and needs no LLM at runtime.

## Prerequisite

The S0 corpus must exist: **book-built** SME prospectuses (D15 — the corpus is 7:1 book-built), tagged by sector. Without it you are writing plausible-looking legal text from memory, which is exactly the failure this project exists to avoid.

**Exclude pre-amendment vintage documents.** Shakti Polytarp states 50 allottees rather than 200, so its Issue Procedure carries superseded figures throughout. See D16.

## The method

```
1. Take 5 prospectuses, same section
   → prefer different sectors; include BOTH exchanges so
     exchange-specific text shows up as a difference

2. Align paragraph by paragraph

3. Classify every span:
     identical in all 5           → template literal
     differs only in values       → {{variable}}
     present in some only         → conditional block
     differs structurally         → sector or exchange switch

4. Trace each {{variable}} back to a FactPath
     → if no fact path exists, the module spec is missing a field.
       Add it. This is a normal and useful discovery.

5. VERIFY: render against a 6th prospectus's facts,
   diff against its actual text
```

**Step 5 is the whole point.** An unverified template is a guess wearing formatting.

## Budget

| Section | Pages | Effort | Invariance |
|---|---|---|---|
| Offer Procedure | 30 | **1 day** | ~95% |
| Main Provisions of AoA | 20 | 0.5 day | extracted per-issuer from uploaded AoA |
| Definitions & Abbreviations | 18 | 0.5 day | sector-varied |
| Other Regulatory & Statutory Disclosures | 15 | 0.5 day | ~90% |
| Terms of the Offer | 10 | 0.5 day | fixed-price variant |
| Key Regulations and Policies | 10 | 0.5 day | **sector-switched** |
| Conventions · Offer Structure · Forward-Looking · Foreign Ownership · Dividend · Declaration · Covers | ~23 | 1 day total | mostly ~99% |

**~4 days for all of Wave 1**, buying ~123 pages.

## Using an LLM here

An LLM does the paragraph alignment grunt work well — feed it the same section from 5 documents and ask where they differ. **A human confirms the output.** A mangled boilerplate clause is a real legal defect, not a typo.

Never ask a model to *write* boilerplate from memory. Only to *compare* documents you supply.

## Conditional blocks

Common branches:

- **Issue type** — fixed price vs book built (we build fixed price; keep the branch point)
- **Exchange** — BSE SME vs NSE Emerge (procedures and structure differ)
- **Sector** — Key Regulations and Policies switches wholesale; Definitions gains sector terms
- **Structure** — fresh issue only vs includes OFS
- **Entity facts** — has subsidiaries, has group companies, has ESOPs, has pledged shares

Model these as `appliesIf` on the `Section` spec and conditional blocks inside the template — not as separate template files. Separate files drift.

## Output shape

Each template becomes a `Section` spec entry:

```ts
{
  id: 'IX.3.OfferProcedure',
  number: '9.3',
  title: 'Offer Procedure',
  producer: 'template',
  appliesIf: (cfg) => cfg.issueType === 'fixed_price',
  requiredFacts: ['offer.size', 'offer.pricePerShare', 'company.name', ...],
  clause: 'R-0xx',              // from 05-rule-sources.md
  template: `...{{company.name}}...`,
}
```

`requiredFacts` is not optional. It drives gap detection — a missing fact renders a visible placeholder **and** raises a gap, from the same check.

## Verification checklist

Per section, before marking it done:

- [ ] Rendered against a held-out prospectus's facts
- [ ] Diffed against that prospectus's actual text — substantively matching
- [ ] Every `{{variable}}` traces to a real `FactPath`
- [ ] Missing facts produce visible `[TO BE PROVIDED]` blocks, not blanks or invented text
- [ ] Conditional branches tested both ways (sector switch, exchange switch)
- [ ] No text invented — every sentence traceable to the corpus

## Anti-patterns

| Don't | Why |
|---|---|
| Write boilerplate from memory | It will look right and be wrong. This is the highest-risk thing in the project. |
| Extract from a single prospectus | You cannot tell invariant text from that issuer's specifics with n=1 |
| Extract from a pre-amendment document | Superseded figures (50 allottees, Rs 1 lakh application) will be baked into the template. Check the vintage first. |
| Extract from fixed-price documents | Different procedures; D15 targets book-built. Only Quanto is fixed price, and that branch waits for 5+ such documents. |
| Skip step 5 | An unverified template is a guess |
| Separate template files per branch | They drift. Use conditional blocks. |
| Leave a `{{variable}}` untraced | It will render as literal `{{...}}` in a 280-page export |
