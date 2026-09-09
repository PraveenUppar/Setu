---
name: rule-authoring
description: How to write a rule for the eligibility, completeness, or consistency engine — citation discipline, the Rule shape, severity assignment, gap messages that tell a first-time issuer what to do, and the pass/fail fixture requirement. Use when adding or changing anything in the rule registry or the gap dashboard.
---

# Rule authoring

The rule engine is the product's differentiator — the answer to "why not just ChatGPT?" It is also the part where being wrong is most expensive.

## Rule zero — no citation, no rule

**Every regulatory threshold must have a row in `.claude/context/05-rule-sources.md` before the rule is written.**

Not from the domain primer (explicitly unverified). Not from a plan document. Not from model memory — SME norms were amended materially in 2025.

If the citation doesn't exist:

1. Say so plainly — do not proceed quietly
2. Verify against the live SEBI text (ICDR Chapter IX, Schedule VI, Master Circular) and the relevant exchange rulebook
3. Write the row: threshold, clause, **verbatim text**, URL, date checked
4. Then write the rule, referencing the row id

**Never** write `// TODO: verify threshold` and move on. That threshold ships.

## The shape

```ts
type Rule = {
  id: string
  clause: string        // row id from 05-rule-sources.md
  severity: 'blocker' | 'major' | 'minor'
  category: 'eligibility' | 'completeness' | 'consistency'
  appliesTo?: (fb: FactBase) => boolean
  check: (fb: FactBase) => Gap | null
}
```

Plain TypeScript functions in a registry array. **Never prompts.** A rule the LLM evaluates is not a rule, it's a suggestion.

## The three categories

| Category | Asks | Runs |
|---|---|---|
| **Eligibility** | Can this issuer list on the SME platform at all? | Standalone pre-check, before signup — and continuously after |
| **Completeness** | Is a mandatory disclosure item missing? | Auto-derived from each section's `requiredFacts` |
| **Consistency** | Do the numbers agree with each other? | On every fact write |

**Consistency rules are the ones that earn the product its keep.** They catch in seconds what currently surfaces in week nine of merchant-banker review:

- Shareholding sums to 100%
- Objects of the offer + issue expenses = issue size
- Capitalisation statement ties to the restated balance sheet
- Capital build-up reconciles with the lock-in table
- RPT figures agree between the financials section and the RPT section
- Allotment history total ties to paid-up capital

## Severity

| Severity | Means | Test |
|---|---|---|
| **blocker** | Cannot file until resolved | Would the exchange reject it, or is it legally required? |
| **major** | Will draw a query; must be addressed before filing | Would a merchant banker refuse to certify? |
| **minor** | Should fix; won't stop the process | Polish, formatting, non-material omission |

When unsure between blocker and major, ask: *does the document become legally defective, or merely weak?* Defective is a blocker.

## Gap messages

The reader is a first-time issuer who does not know the framework. Every gap needs four things:

```
1. WHAT is wrong        — specific, with the actual numbers
2. WHICH clause         — the citation, viewable
3. WHAT it blocks       — which sections or how many pages
4. HOW to fix it        — an action linking to the exact field
```

Good:

```
Objects don't reconcile with issue size

  Objects listed:      ₹19.40 cr
  Issue expenses:      ₹ 1.80 cr
  Total:               ₹21.20 cr
  Issue size:          ₹22.00 cr
  ⚠️ ₹0.80 cr unaccounted

  → ICDR Schedule VI [view text]
  Blocks: Objects of the Offer, Basis for Offer Price
  [ Fix in M9 ]
```

Bad: `Validation failed: objects mismatch`

Show the arithmetic. The user needs to see *why*, not be told *that*.

## Completeness rules come free

Do not hand-write them. Each `Section` spec declares `requiredFacts`; a missing fact renders a `[TO BE PROVIDED]` placeholder **and** raises a gap — one check, both outputs.

If you find yourself writing a completeness rule by hand, the section's `requiredFacts` is probably incomplete instead.

## Testing — non-negotiable

**Every rule gets a passing fixture and a failing fixture.** Vitest. This is the one place tests genuinely earn their keep in a hackathon.

```ts
describe('R-012 promoter contribution', () => {
  it('passes at or above the minimum', ...)
  it('fails below the minimum', ...)
  it('does not apply when appliesTo is false', ...)
})
```

Test against **S0 ground-truth pairs** where possible — a real prospectus's facts should pass its real rules.

## Money

**Every rupee and percentage through `decimal.js`.** `0.1 + 0.2 = 0.30000000000000004` becomes a capitalisation statement that doesn't tie, and the user will never work out why.

Share counts are integers and safe. Prices, percentages, and amounts are not.

## Versioning

The rule pack is **versioned data, never baked into prompts.** When a regulation changes, add a superseding row in `05-rule-sources.md` and a new rule — do not edit the old one. Issuers assessed under old rules must remain explicable.

## Anti-patterns

| Don't | Why |
|---|---|
| Hardcode a threshold inline | It becomes unfindable when the regulation changes |
| Use an LLM to evaluate a rule | Non-deterministic, uncitable, untestable |
| Write a rule without a citation row | The single highest-credibility risk in the project |
| Return a bare boolean | The gap message is most of the value |
| Skip `appliesTo` | Rules firing on issuers they don't govern destroy trust in the dashboard |
| Float arithmetic on money | Silent, and surfaces as an unexplainable mismatch |
