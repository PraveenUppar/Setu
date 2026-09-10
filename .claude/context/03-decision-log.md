# Decision log

**Append-only.** Never rewrite an entry. To change a decision, add a new one that supersedes it by number.

Format: what was decided · why · what it rules out.

---

## D1 — Target fixed-price SME issues first

The more common SME route and a materially simpler document: no book-building, anchor investors, or price-band machinery. Roughly 20 pages and 60 questions lighter.

**Rules out:** book-built support in v1. Section specs carry `appliesIf` so the branch can be added later without restructuring.

---

## D2 — Classify sections by producer, not chapter order

Boilerplate ~50–60% (template, no LLM) · computed ~15% (pure TS) · narrative 25–30% (grounded LLM) · external ~20% (auditor/CA).

Only ~25% of the document needs a model at all. This is what makes the output defensible to a regulator.

**Rules out:** building Section I → II → III. Build in producer waves.

---

## D3 — Specs are data; engines are code

One module engine and one document engine. Modules 3–10 and sections 12–35 become content, not engineering.

**Rules out:** hand-built pages per module. Adding a disclosure requirement must be adding one object to an array.

---

## D4 — All TypeScript, no Python service

Claude reads PDFs natively, which deletes the document-parsing service that would otherwise force a second language and deployment. What remains — Zod schema reuse across client validation, server validation, Claude tool-use schema, and types — is worth more than Python's document libraries, because a form-heavy app lives in the frontend and Pydantic can't cross that boundary.

**Rules out:** FastAPI, PyMuPDF, pdfplumber, Tesseract, python-docx.

**Refined in D12.**

---

## D5 — Hybrid Postgres: JSONB fact base, relational everything else

Fact base is nested, 400+ fields, evolving — relational modelling means ~40 tables and a migration per new disclosure field. Everything queryable (gaps, section status, comments, audit log) goes in real tables.

**Rules out:** all-relational (drowns in migrations) and all-JSONB (slow, awkward dashboard).

---

## D6 — Never invent

Missing fact → `[TO BE PROVIDED: <ask>]` **and** a gap, from the same check. Companies Act s.34/35 makes a misstatement in an offer document a real liability.

**Rules out:** any "best guess" fill, any prose generated outside a `factSlice`.

---

## D7 — DOCX is the primary export

Merchant bankers redline in Word. A PDF-only deliverable is dead on arrival.

**Rules out:** LaTeX, Puppeteer HTML→PDF as the primary path. Chose `docx` (npm) over docxtemplater (template-fill, wrong for 280 dynamic pages), Pandoc (needs a binary, loses ToC/table control).

---

## D8 — No real auth for the hackathon

Role-switcher dropdown over one seeded org. Saves ~1.5 days, costs nothing in the demo.

**Rules out:** Supabase Auth wiring, session management, invite flows in v1. Module *assignment* is still modelled in the DB so the workflow demo is real.

---

## D9 — Preserve the intermediary explicitly

Section-level review workflow; exports watermarked `UNSIGNED DRAFT — NOT FOR FILING` until merchant-banker certification. The MB's due diligence certificate is statutory — we could not remove it even if we wanted to.

Also the honest answer to "aren't you replacing bankers?": no, their job moves from writing to reviewing.

**Rules out:** any "file directly with the exchange" flow.

---

## D10 — Regulatory numbers require a citation

Every threshold entering the rule pack needs clause + verbatim text + URL + date checked, recorded in `05-rule-sources.md`. SME norms were amended materially in 2025.

**Rules out:** thresholds from model memory, from the domain primer, or from any planning document. The primer is orientation only.

---

## D11 — Reverse the corpus for test data

A published prospectus contains its own inputs. Split restated-financials pages → test input; capital-structure pages → ground truth. Twenty prospectuses = twenty labelled pairs, free.

**Rules out:** "we have no test data" as a reason to skip verification. S5 and S7 gates both depend on these pairs.

---

## D12 — Hybrid PDF handling, refining D4

Claude processes PDF pages as **both text and image** (~1,500–3,000 tokens/page vs ~500–800 for plain text). Route by document type:

- Scanned, or complex financial tables → send PDF blocks (the vision is what you're paying for)
- Digital-born and text-heavy (MOA/AOA, resolutions, litigation lists) → extract text locally and send text

`unpdf` / `pdf-parse` are pure JS, so D4 still holds — no Python.

Also: two-pass page targeting. Read the text layer to find relevant page ranges, then send only those (~4x reduction).

**Supersedes** the "always send the whole PDF to Claude" reading of D4.

---

## D13 — Corrected PDF limits

Earlier planning assumed 100 pages and a 200k context window. Actual: **32MB per request, 600 pages**; the 100-page cap applies only to 200k-context models. Opus 5 and Sonnet 5 both have **1M context**.

A 300-page prospectus fits in one request. Use the Files API to sidestep the 32MB ceiling.

**Rules out:** splitting prospectuses for context reasons. Page targeting remains worthwhile for cost and rate limits, not necessity.

---

## D14 — Fixtures over re-extraction

Every extraction result is snapshotted to `fixtures/`. Downstream work (rule engine, renderers, dashboard) iterates against fixtures, never the live API.

Primary cost control — the difference between ~300 API calls and ~30 during development — and it makes tests deterministic.

**Rules out:** tests that call the API.

---

## D15 — Book-built first. SUPERSEDES D1.

**Evidence, 2026-09-09.** Of 8 SME prospectuses in `corpus/prospectus/`, **7 are book-built and 1 is fixed price** (Quanto Agroworld). All cite ICDR Chapter IX Reg 229(1)/229(2), so all are genuine SME-platform issues.

D1's premise — "fixed price is the more common SME route" — was **wrong**, or at least outdated. SME issue sizes have grown and book-building has followed.

**Two reasons to switch:**

1. The evidence says book-built is the common case now.
2. Template extraction needs ~5 documents of the same type to diff. With 7 book-built documents that can start immediately; with 1 fixed-price document the fixed-price-specific templates cannot be extracted at all.

**This is a narrow change, not a fork.** Comparing Quanto against the book-built documents, ~85–90% of the content is identical. Differences concentrate in five places:

| Section | How it differs |
|---|---|
| Cover page | Price band + floor/cap vs stated issue price |
| Basis for Issue Price | Book-building demand assessment vs fixed justification |
| Offer Structure | QIB / NII / RII allocation vs fixed-price split |
| Offer Procedure | Bidding, bid lots, ASBA bidding vs straight application |
| Terms of the Offer | Partial differences |

`Section.appliesIf` already handles this by design. The fixed-price branch stays cheap to add later.

**Also changes:** the document is now **DRHP → RHP → Prospectus**, not Draft Prospectus → Prospectus. "Red herring" is correct terminology again.

**Rules out:** fixed-price-specific template extraction until the corpus has 5+ fixed-price documents. Keep `appliesIf` branch points on all five sections above so the branch can be added without restructuring.

---

## D16 — Rules are effective-date scoped, evaluated against the DRHP filing date

**Evidence, 2026-09-09.** Four 2026 SME prospectuses contradict each other on minimum allottees: Om Galaxy (BSE), Maxwell (NSE) and Ideas (NSE) all say **200**; Shakti Polytarp (BSE) says **50**.

Shakti is not wrong. SEBI's SME amendments apply to **draft offer documents filed after the notification date**, so an issue whose DRHP predates notification stays under the old regime for its whole life. Shakti's eligibility section corroborates this throughout — it states operating profit with no rupee threshold and attaches Rs 1 crore to net worth instead, which is the pre-amendment shape.

**Consequence.** A rule cannot carry a single current value:

```ts
type Rule = {
  // ...
  effectiveFrom?: string   // ISO date; applies to DRHPs filed on/after
  effectiveTo?: string     // ISO date; superseded after this
}
```

The eligibility engine takes the issuer's **intended or actual DRHP filing date** as an input and selects the applicable rule set. An issuer being advised today is under current rules; one already filed may not be.

This makes D10's "rule pack is versioned data" concrete rather than aspirational.

**Also affected:** Reg 230(1)(d)'s scope differs by vintage — Shakti states only "held by the promoters", Ideas lists the full class (promoter group, selling shareholders, directors, KMP, senior management, QIBs, employees, SR shareholders, financial-sector-regulated entities).

**Rules out:** a single flat rule registry. **Add `effectiveFrom` to the `Rule` type in S6** — retrofitting it later means re-auditing every rule.

**Blocked on:** O-7 — the exact notification date of the 2025 SME amendment. Every `effectiveFrom` depends on it.

**RESOLVED 2026-09-09 by user decision — see D17.**

---

## D17 — Build for current rules only. Minimum allottees is 200.

**User decision, 2026-09-09:** "it is 200".

The tool advises issuers preparing a DRHP **now**, so current rules always apply. The pre-amendment regime (50 allottees, unquantified operating profit, narrow Reg 230(1)(d) scope) is not a case we serve.

**What this changes from D16:**
- Rule values are the current ones. **200 allottees**, Rs 1 crore operating profit, 15% GCP cap, 3-year MPC lock-in, 20%/50% OFS caps.
- No date-selection logic in the eligibility engine, and no need for O-7's notification date.
- **Keep `effectiveFrom` on the `Rule` type anyway.** It costs nothing now, it documents which regime a rule belongs to, and regulations will change again. Populate it when a date is known; leave it undefined meaning "current".

**Rules out:** evaluating an issuer against a historical rule set; any UI asking for a DRHP filing date in order to pick rules.

**Note for the corpus:** Shakti Polytarp remains a pre-amendment document. Do not use it as a source for rule *values* — only for template text, where the boilerplate is unaffected.

---

## D18 — Provenance lives beside the facts, not wrapped around them

The plan (MM5) described `Fact<T> = { value, source, ref, ... }` wrapping every field. **Implementing it that way is wrong**, for a concrete reason discovered while writing the schemas.

The same Zod schemas drive form validation *and* Claude's extraction tool schema (MM3). If every field were a provenance wrapper, the extraction schema would ask the model to report its own `source`, `confidence` and `updatedBy` — inviting it to fabricate provenance. We want plain values back and attach provenance ourselves, from what we know about the call.

**Shape:**

```ts
type IssuerRecord = {
  facts: FactBase          // plain, exactly matching the Zod schemas
  provenance: ProvenanceMap // flat, keyed by FactPath
  version: number
}
```

`lib/facts/provenance.ts` implements `getFact`/`setFact`/`listPaths` over dotted paths with array indices (`capital.allotments[2].issuePrice`). `setFact` is immutable and structure-sharing, since the fact base is append-only.

MM5 still holds — every fact still has provenance. It is stored parallel, not nested.

**Also:** `isUsable(value, provenance)` is the single gate. An extracted fact with `confirmed !== true` is **not usable** and renders as a placeholder plus a gap. That enforces "extraction never lands silently" in one place rather than at every call site.

---

## D19 — Zod 4 native JSON Schema; `zod-to-json-schema` removed

The installed Zod is **4.5.4**, which has native `z.toJSONSchema()`. The separate `zod-to-json-schema` package is redundant and has been uninstalled.

**Gotcha worth remembering:** `io: 'input'` omits `additionalProperties: false`; the default `output` mode includes it but also marks defaulted fields as `required`.

For extraction we want **input semantics** — a field with a default must not be `required`, or the model is forced to invent values it could not find. So `extractionSchemaFor()` generates in input mode and then walks the tree adding `additionalProperties: false` to every object node, which Claude's strict tool use requires.

Covered by `lib/facts/schema.test.ts`.

---

## D20 — Computed sections must be verified against published ground truth, and some figures are not computable at all

**Evidence, 2026-09-10.** Building Issue Structure, I inferred a rule for the QIB / NII / Individual share counts from Om Galaxy's own figures: NII and Individual round UP to a whole lot (they are "not less than"), QIB absorbs the remainder (it is "not more than"). It was plausible and it summed correctly.

Tested against Om Galaxy's published table, **it missed by one lot.**

Its net issue of 1,10,83,200 splits as QIB 55,37,600 / NII 16,64,000 / Individual 38,81,600 — 49.96% / 15.01% / 35.02%, with QIB sitting **2.5 lots below** an exact 50% and Individual 1.5 lots above. Ceiling, flooring and rounding to the lot were each tried; each missed.

**There is no rule.** The split is a discretionary judgement the merchant banker makes at pricing, within the R-024 bounds.

### Two standing consequences

**1. Every computed section gets a ground-truth test.** Feed a corpus issuer its own inputs and assert we reproduce its published table exactly. "Close" is a failure — a number that looks right and is wrong is worse than a visible gap, especially in an allotment table.

**2. Distinguish derived from discretionary.** Some figures follow deterministically from facts (net issue = issue less market maker reservation; issue as a percentage of post-issue capital). Others are professional judgement inside regulatory bounds. **Only the first may be computed.** The second is a gap, however tempting it is to fill because the corpus leaves it blank too.

The pull here is real and worth naming: computing something the published documents show as `[dot]` makes our output look better than theirs. That is exactly when to check whether it is computable at all.

**Rules out:** deriving category allotment counts. A test asserts `derivedTerms` does not expose them, so it cannot creep back.

**Note:** the same conclusion was reached for Basis of Allotment one commit earlier and then talked out of. The ground-truth test is what held the line.

---

## D21 — There is no safe bulk-copy tier for glossary text

**Evidence, 2026-09-10.** Definitions is ~200 entries and 17 pages, and most of it looks like standard regulatory boilerplate. The obvious move is to extract a corpus glossary, filter out the issuer-specific entries, and bulk import the rest.

I wrote that filter (`scripts/build-glossary.mjs`). It rejects any proper noun that is not a statute, regulator or standard market term, plus anything carrying a date. Of 207 merged entries it passed 31.

**Three of those 31 still carried Om Galaxy's own facts:**

| Term | Leaked |
|---|---|
| Equity Shares | "...of face value of **5** each" — its face value |
| Auditor | "...firm registration number **124851W**" — its auditor |
| Stock Exchange | "...refers to, **BSE Limited**" — its exchange |

They slipped through because issuer specifics are **not always capitalised proper nouns**. They are bare numbers, registration codes and two-word names. No regex separates them reliably.

**And the failure is invisible.** The text reads perfectly while carrying another company's facts into a legal document. That is MM4 — never invent — wearing a different hat: not fabricated text, but *borrowed* text, which is arguably worse because it is specific and plausible.

### Consequence

**Every glossary entry is either fact-driven or deliberately authored.** Fact-driven means a template with substitution, as in `sections/definitions.ts` — `face value of Rs {{ capital.faceValue }} each`. The ~143 entries the filter rejects as issuer-specific mostly need to *become* fact-driven templates, not be filtered back in.

`build-glossary.mjs` is kept as a **triage tool** — it says which entries need attention and why. Its output is a review queue, not a product artifact, and is named so.

**Rules out:** copying glossary text from one issuer's prospectus into another's. The same caution applies to any section where the corpus text embeds issuer facts inline rather than in a table.
