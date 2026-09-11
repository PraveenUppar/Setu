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

---

## D22 — The document keeps its section boundaries, and every link resolves or does not render

**Problem, 2026-09-10.** The gap dashboard listed what was wrong; the document rendered the same gaps highlighted; nothing connected them. A finding said "Holds up: Issue Structure" and left the reader to scroll 23 pages — later 280 — to find the sentence it was about.

Connecting them needs the section boundary, and `renderDocument` had already thrown it away by flattening every section into one `DocumentNode[]`. There is nothing in a flat tree to point at.

### Consequence

**`renderSections` is the primary output; the flat tree is derived from it.** `RenderedSection` carries `{ id, title, group, anchor, nodes }`, and `flattenSections` produces exactly what `renderDocument` produced before, so the DOCX renderer is unaffected — the boundaries exist for navigation, not for rendering.

**Three anchor namespaces, all derived from one identifier** (`lib/anchors.ts`): `sec-` from a section spec id, `gap-` from a fact path, `finding-` from a rule id. The dashboard and the document agree on where to point only because neither invents its own id. The prefixes are load-bearing: a completeness rule id embeds its fact path (`CM-company.website`), so without them the gap and its finding slug to the same string.

**One gap has exactly one anchor**, on its first occurrence in the document (`gapAnchorKeys`). A fact used in nine sections is one thing to provide and one finding, and duplicate DOM ids would send the link to whichever the browser found first.

**A finding links to the placeholder, not the top of the section.** Landing the reader at a section heading and leaving them to hunt for the highlight is barely better than not linking.

**A `blocks` entry that names a section which is not built stays plain text.** Rules name sections from the regulation, and 24 of 37 do not exist yet; a link that scrolls nowhere teaches the reader that the links do not work. The difference in appearance is the statement about which sections exist. `linkFindings` matches by subsection title, then by numbered-section group, then gives up.

**Rules out:** rules naming sections by spec id, which would bind a regulatory citation to the build order. `blocks` stays a list of human titles and is resolved afterwards.

### Second finding: a gap inside a table cannot report itself

Table cells are plain strings in the AST, so `[TO BE PROVIDED]` in one is invisible to `collectPlaceholders` and never becomes a finding. Issue Structure is right only because it also carries a placeholder in the paragraph above the table (D20). Nothing enforced that. A test now does: any section whose table holds a gap must also produce a placeholder. The alternative — placeholders inside cells — waits until a section actually needs it.

---

## D23 — Exchange criteria are seventeen separate rules, not one shared check

**Problem, 2026-09-10.** E-05 to E-18 (BSE SME) and N-05 to N-11 (NSE Emerge) sit on top of SEBI's requirements under Reg 229(3), and they overlap heavily. The tempting shape is one rule per *subject* — one insolvency rule, one regulatory-action rule, one six-month rule — switched internally by exchange.

That shape is wrong, and the six-month rule shows why. **E-10 asks whether the ISSUER's own application was rejected by the exchange in the last six months. N-08 asks whether the MERCHANT BANKER has had a draft offer document returned by NSE in the last six months.** Same window, different party, different fix — and the second is not even answerable at pre-check time, because there is no banker yet. Collapsed into one rule they would share a fact, and feeding one exchange the other's fact would produce a confident wrong answer.

### Consequence

**One rule per criterion per exchange**, each with its own `appliesTo`, its own citation and its own fact. EL-022 to EL-038. Where the two exchanges genuinely ask the same question — NCLT, winding-up, BIFR, delisted-company association — one rule serves both and says so in its clause.

**Facts follow the criterion's own shape.** The regulatory-action tests are DATES, not booleans, because BSE looks back three years at the company and one year at the promoters while NSE states no window at all and reaches group companies. A boolean could not answer either question, and inventing NSE a three-year window to match BSE would put a limit in the tool that is not in the source.

**Windows are measured from `offer.intendedFilingDate`, not from today.** An issuer planning to file in four months needs to know whether the window will still be open then.

**Three criteria deliberately have no rule:**

| Criterion | Why not |
|---|---|
| E-07 promoter shares in demat | Restates Reg 230(1)(d), already EL-014. Two findings for one defect teaches the reader the list is padded. |
| N-05 no promoter loan repayment | Restates Reg 230(1)(h), already EL-015. |
| E-14 board composition | "Compliant with Companies Act 2013" states no threshold, no citation row exists, and SME-listed entities are exempted from parts of LODR. Rule zero: no citation, no rule. Recorded as O-11. |

### The conversion trap

E-09 requires no change of name in the year before the application. **Every SME issuer changes its name in that year**, because s.23 requires converting to a public limited company first, and "Private Limited" becomes "Limited".

A blocker firing on the mandatory step is one no issuer can ever clear — the pattern that teaches a reader to skip the dashboard. Silently excluding conversions is worse: if BSE does read it as a change of name, the issuer hears that from the exchange instead of from us.

So it is **two rules**: EL-025 blocks on a genuine name change, and EL-038 reports the conversion at `minor` severity with what to confirm and why. Whether BSE reads it as a change of status or of name is O-12, and EL-038 is what that answer will settle.

**Rules out:** a check returning its own severity. The engine merges rule metadata into the finding precisely so a check cannot report a clause or a severity other than the one it is registered under, and needing two severities is a sign of needing two rules.

### The pre-check grew, and stayed short

24 of the 50 rules are now pre-check rules, but no issuer answers 24 questions: the exchange criteria diverge, so a BSE issuer never sees N-06 or N-10 and an NSE issuer never sees E-08, E-09, E-10 or E-18. The form gained a sixth step and shows only the criteria that govern the exchange selected in step one.

`preCheck` marks what a promoter can answer on day one — not everything that could be asked. E-05 needs a balance sheet, E-13 turns on whether an action was *material*, and N-08 is about a banker who has not been appointed. Those stay out.

---

## D24 — Close the corpus at 8, and corroborate every criterion before shipping it

**Decision, 2026-09-10.** The corpus target drops from 25 prospectuses to **8** (7 on disk plus the missing fixed-price document). MCA21 document sets are dropped entirely; annual reports stop at 4.

The reason is not budget. It is that reading the documents we already had, properly, was worth more than adding more of them — and we had not done that.

### What re-reading the corpus found

The exchange criteria were recorded from **one prospectus per exchange**. Reading a second BSE document (Century) and a second NSE document (Photonics) changed **five** criteria and added **four** that were missing:

| Criterion | Was recorded as | Actually |
|---|---|---|
| **E-09** name change | "No name change in the last 1 year" — a flat bar | One BSE source says that; the other applies a **50% revenue test** on the activity the new name indicates. Two documents, same vintage, different rules |
| **E-05** net tangible assets | "Positive" | One source says positive, the other says **"more than Rs 3 Crore"** |
| **E-13** regulatory action, 1 year | promoters only | promoters, **group companies and companies promoted by the promoters** |
| **N-06** IBC against promoting companies | NSE only | **stated at BSE too** — a BSE issuer would have been told nothing |
| **N-10** trading suspension | NSE only | **stated at BSE too** |
| **E-16 / N-11** delisted companies | BSE reaches every director, NSE carves out independent directors | The carve-out **varies by drafter, not by exchange** — two of four documents have it, one on each platform |
| **E-19, E-20** | missing | Trading suspension and the five-year SEBI-action test, both stated at both exchanges |
| **R-026, R-027** | missing | **Reg 229(4)** (a converted firm needs one full financial year) and **Reg 229(5)** (a majority promoter change starts a one-year wait) — two regulations nobody had read |

Photonics also quotes **Reg 229(6)** and **Reg 230(2)** by number, which turned R-002's operating profit threshold and R-010's GCP cap from "as-applied by two bankers" into actual sub-regulation citations. O-1 closed as a result.

### Consequence

**A single-sourced criterion does not ship.** Where the corpus disagrees with itself the rule says so in the finding text rather than picking a side — see EL-025 (name change), EL-039 (net tangible assets) and EL-033 (independent directors). An issuer being told "two documents state this differently, confirm with the exchange" is better served than one told a confident wrong thing.

**The corpus is closed because it did its job**, not because it is complete. What remains open — Schedule VI Part A (O-5), the amendment notification date (O-7), and the three formulation disputes — needs SEBI's or BSE's own text, and no number of additional prospectuses will settle them.

### The paired dataset

`fixtures/corpus/` splits each prospectus into restated financials (INPUT) and Capital Structure (TRUTH): the expensive half of an extraction test set, free, already reconciled by a merchant banker. All 7 documents yield both halves.

Building it taught three things now recorded in `fixtures/corpus/README.md`: section headings are not stable across drafters, **the auditor's examination report is a far more reliable anchor than the section heading above it** (it took the build from 4 of 7 to 7 of 7), and four of seven documents spell it "Authorized Share Capital" where the regulations say "Authorised".

---

## D25 — A resolved dispute becomes a decision, not a warning

**Decision, 2026-09-10.** The four open questions left by D24 are settled against the underlying rulebooks, and the rules that were hedging now give a clean pass or fail.

| Was | Now | Authority |
|---|---|---|
| **E-14** unruled — "compliant with the Companies Act" states no threshold | **EL-044.** Minimum 3 directors; at least one third independent once post-issue capital reaches Rs 10 crore or turnover Rs 100 crore | Companies Act s.149(1), s.149(4) and Rule 4. **LODR Reg 15(2)(b) exempts SME-listed entities from Reg 17–27**, which is what makes the Companies Act the whole test (R-028) |
| **E-05** "positive net tangible assets", with a minor finding about a disputed Rs 3 crore figure | **EL-022 blocks below Rs 3 crore**, and **EL-039 blocks where more than half of it is monetary assets** | BSE SME revised entry norms, January 2024 (R-029) |
| **E-09** major finding stating two readings and asking the issuer to confirm | **EL-025 blocks** on failing the 50% revenue test. The flat-bar reading is gone | BSE SME criteria, per ICDR Reg 5(1)(e) (R-030) |
| **E-16 / N-11** finding saying the independent-director carve-out was unsettled | **EL-033 states the carve-out.** The fact itself is now defined to exclude independent directorships | BSE SME disciplinary criteria (R-031) |

**EL-038 is deleted.** It existed to flag that the private-to-public conversion might count as a change of name. Under the revenue test the question dissolves: a conversion changes the name but not the activity the name indicates, so it passes by definition. The exclusion moved into `nameChangesInWindow` with a comment explaining why.

### Why hedging was the wrong output

A finding that says "two sources disagree, ask the exchange" is honest about our evidence and useless to the reader. The issuer still does not know whether they pass, and the one thing they came for is that answer. Hedging is the right position while a dispute is genuinely open; it is the wrong position the moment it is not.

**`DETERMINED` is a new confidence level** in `05-rule-sources.md` for exactly this: a criterion that two corpus documents stated differently and that has since been settled against the rulebook, with the clause recorded. The superseded reading stays in the row, so the change is auditable rather than silently overwritten — which is also why the file's append-only discipline still holds.

### What did not change

**Rule zero still applies.** Each of these got a citation row (R-028 to R-031) before the rule was written, and the row names the specific provision — not "the BSE rulebook" but s.149(4), Reg 15(2)(b), the January 2024 revision. **E-14 was unruled for a week precisely because it had no such row**, and that was the correct behaviour until one existed.

**Two limitations are recorded rather than papered over.** The woman-director requirement is not ruled: Rule 3 triggers at Rs 100 crore paid-up capital, four times the SME ceiling, so it cannot bind through capital, and the fact base carries no director gender for the turnover limb. The monetary-assets test is silent where the split has not been disclosed, since a default of zero would silently pass a test that never ran.

---

## D26 — Held-out verification has to check WHERE a match sits, not just whether it matches

**Two findings from verifying the Wave 1 sections added on 2026-09-10.**

### One paragraph was single-sourced, and only the held-out check caught it

The Disclaimer in Respect of Jurisdiction was extracted from Om Galaxy and Photonics, which are word-for-word identical for three paragraphs. Om Galaxy carries a **fourth**:

> "No person outside India is eligible to bid for Equity Shares in the Issue unless that person has received the preliminary offering memorandum..."

It is in **Om Galaxy alone** — not in Century, not in any of the four NSE filings. It had been written into the template because the surrounding paragraphs matched so cleanly that the block read as one unit.

**Removed.** One source is not extraction, it is copying, and copying one issuer's paragraph into another issuer's offer document is D21's finding wearing different clothes.

### The mirror-image mistake: a match that proves nothing

Checking the withdrawal rules, Century appeared to **contradict** both extraction sources. They say Individual Investors may withdraw until the closing date and QIBs and NIIs may not withdraw at all; Century appeared to say "Any of the Bidders are not permitted to withdraw or lower their Bids at any stage".

That sentence is **risk factor 58**, about price movement between bidding and allotment. Century's actual Issue Procedure text says exactly what the extraction sources say.

**A grep hit is not a verification.** The same phrase carries different meaning in the risk factors, the definitions and the procedure, and "present in the held-out document" is only evidence when it is present *in the same section*. The first pass over the exchange criteria made the same class of error in reverse — concluding E-09 and E-10 had no corpus support because they sit in Om Galaxy's *second* eligibility list rather than its Reg 229(3) list (D24).

**Both directions are now part of the checklist**: a clause needs two extraction sources before it is written, and a held-out mismatch needs its context read before it is believed.

---

## D27 — The held-out document is a question, not a verdict

**Finding, 2026-09-10, extracting the UPI subsection.** Century Business Media describes UPI Phase III as a future timeline, "as may be prescribed by SEBI". Five other documents state it as **mandatory for public issues opening on or after December 1, 2023**.

The held-out document is the one that is wrong. Its banker used boilerplate written before the phase was notified, exactly as Shakti Polytarp carries pre-amendment allottee figures (D16).

**So the rule is not "the held-out document decides".** It is:

1. A clause needs **two extraction sources** before it is written.
2. A **held-out mismatch is a question**, and the question has to be answered by reading the context and weighing the sources — not by deferring to the held-out document.

Both failure modes are now on record. D26 caught the first: believing a mismatch without reading it, when Century's apparent contradiction on withdrawal rights turned out to be a risk factor. This is the opposite one: a genuine mismatch where the held-out document loses 5 to 1.

### Single-source sentences cluster in one document

Three sentences have now been caught being drafted from a single source, and **all three were Om Galaxy's**:

| Sentence | Section |
|---|---|
| "No person outside India is eligible to bid..." | Jurisdiction disclaimer |
| The four entity types with whom a UPI ID may be lodged | UPI |
| "All SCSBs offering the facility ... shall also provide the facility to apply using the UPI Mechanism" | UPI |

That is not chance. Om Galaxy is the longest document in the corpus at 509 pages and the primary BSE extraction source, so it carries more text that no one else carries, and its extra sentences sit inside blocks whose other paragraphs match word for word. **The risk is concentrated, not evenly spread**, and every extraction from it needs the per-clause source count run explicitly rather than eyeballed.

### What was deliberately left out, and why

The UPI Phase I and Phase II history — three paragraphs of 2019 and 2020 circular numbers and extended deadlines — is **omitted**. It has no effect on an issue opening in 2026, since every such issue is Phase III mandatory, and the circular numbers are corroborated by only two documents. Omitting is safe; quoting a circular number that may be wrong is not. A merchant banker who wants the history can add it.

---

## D28 — A convention that varies is a fact, not a derivation

**Finding, 2026-09-10, extracting Terms of Payment.** Anchor Investors pay into named escrow accounts, and the document states the names. The obvious move is to build them from the company name, the way the corpus appears to:

> "OM GALAXY LIMITED-ANCHOR RESIDENT ACCOUNT"

Three corpus documents state it three different ways:

| Document | Resident anchor escrow account |
|---|---|
| Om Galaxy | `OM GALAXY LIMITED-ANCHOR RESIDENT ACCOUNT` |
| Axiom Gas | `AXIOM GAS ENGINEERING LIMITED - ANCHOR R ACCOUNT` |
| Century Business Media | `CENTURY BUSINESS MEDIA LIMITED-ANCHOR ACCOUNT-R` |
| Ideas Electricals | `[dot]` — blank at draft stage |

Hyphen, spaced hyphen, suffix order, "RESIDENT" versus "R" — no two agree, and the fourth document tells us why: **the name is whatever the bank actually opened the account as**, which at draft stage nobody knows yet.

**So both names are facts and render as gaps.** Deriving them would produce a string that reads perfectly and matches no bank's records — and a wrong account name in a prospectus misdirects anchor money.

This is D20's finding in a new place. There, the category allotment counts looked computable and were a banker's judgement. Here the account name looks derivable and is a bank's record. **The tell is the same both times: several documents, several answers, no rule that reproduces any of them.** When that happens, stop deriving and ask.

The issue price in the same subsection is the honest version of the same shape: all four documents print "[dot]" because the price is not fixed until the book closes, so it is a gap that closes at pricing rather than a number to invent.

---

## D29 — Two sources agreed, both were wrong, and it had already shipped

**The most serious extraction defect found so far, 2026-09-10.**

Extracting the Do's and Don'ts turned up this item:

| Document | Wording |
|---|---|
| Om Galaxy | "Do not Bid for a Bid Amount exceeding Rs 200,000 for Bids by Individual Bidders" |
| Maxwell | "Do not Bid for a Bid Amount exceeding Rs 200,000 and 2 lots (for Bids by IIs)" |
| Century (held out) | "Do not Bid for a Bid Amount exceeding Rs 500,000 (for Bids by UPI Bidders)" |

Two extraction sources agree on a Rs 2,00,000 cap for individual bidders. **Both are wrong for an SME issue**, and they contradict their own documents: R-006 requires the Bid Amount to EXCEED Rs 2,00,000, which both state elsewhere in the same Issue Procedure. It is main-board retail boilerplate that survived a copy-paste into an SME document.

The held-out document has the rule that actually exists — the **UPI ceiling**, Rs 5,00,000, which all five extraction sources state with the circular reference (SEBI/HO/CFD/DIL2/CIR/P/2022/45, applications up to Rs 5,00,000 must use UPI). It is a threshold at which UPI becomes mandatory, not a cap on what an individual may bid.

### It had already shipped

Checking the rendered document rather than the new section, the same wrong figure was **already in Grounds for Technical Rejection**, extracted in an earlier session:

> "Bids by Individual Bidders with a Bid Amount exceeding Rs 2,00,000."

As a REJECTION ground that is materially worse than as a Don't. Followed literally it tells the issuer to reject **every valid SME retail bid**, because every one of them exceeds Rs 2,00,000 by definition. It has no support in any rejection-grounds list in the corpus — three documents state only the generic "amounts greater than the maximum permissible amounts prescribed by the regulations". It was carried across from the Don'ts list during that earlier extraction.

**Removed.** This is the second time this exact failure mode has been caught in this one section: the cut-off price ground had the same shape, where following Maxwell would have rejected valid retail bids.

### What changes

**Section-local assertions are not enough.** Every test written for these sections checked the section under test, and the defect sat in a different section rendering into the same document. The guard is now a whole-document check: R-006 says the Bid Amount must exceed Rs 2,00,000, so nothing anywhere in the document may cap or reject an individual bid at that figure.

**Two extraction sources is a floor, not a proof.** The rule has always been "two sources agreeing is not enough" — three of the earlier held-out findings were cases where both sources agreed and were wrong. This is the first where both sources were wrong *and internally inconsistent with their own documents*, which is a signal worth looking for directly: **when an extracted clause contradicts a figure the same document states elsewhere, the clause is copied, not drafted.**

---

## D30 — Do not promote the held-out document to a source, even for one clause

**Decision, 2026-09-10, finishing Issue Procedure.** Two clauses came up with exactly one extraction source plus the held-out document:

- "In case of Bidders (excluding NIIs and QIBs) Bidding at cut-off price, the Bidders may instruct the SCSBs to block Bid Amount based on the Cap Price less Discount" — Om Galaxy and Century.
- The Rs 5,00,000 UPI ceiling *as a Don't* — Century's phrasing, though the underlying rule has five extraction sources.

Two independent documents state each. The temptation is to count Century and move on, since holding it out is a methodology choice rather than a claim that it is unreliable.

**The answer is no, and the reason is that the check is worth more than the clause.** Using the held-out document as a source for a clause means that clause has no independent verifier, permanently — and Century has now caught a real defect six times. Spending that on a sentence about discount mechanics, in an issue with no discount, is a bad trade.

Both were handled by looking for the substance elsewhere. The cut-off blocking rule is already covered by `issueProcedurePriceLevels` from two extraction sources. The UPI ceiling is stated from the five sources that carry the underlying rule, phrased as a Don't — which is a different thing from copying Century's sentence.

**The rule stands as: two EXTRACTION sources, and the held-out document only ever votes against.**

### While there: caught myself inventing

The anchor investor draft carried "the allotment is made at the Anchor Investor Allocation Price **and the excess is not refunded**". The first half is in three documents. The second half was an inference — plausible, unstated, and exactly the kind of sentence that MM4 exists to stop. Replaced with what the three sources actually say: "Allotment to successful Anchor Investors will be at the higher price, that is, at the Anchor Investor Allocation Price."

The inference may even be correct. It is still not extraction.

---

## D31 — Re-extract before authoring, and diff the glossaries rather than the entries

**2026-09-10, taking the Definitions glossary from 79 authored entries to 130.**

The stored fixture, `fixtures/definitions/om-galaxy-definitions.json`, turned out to be **one entry per LINE** rather than per term — every description truncated at the first line wrap. It was fine as the review queue it was built to be, and useless for authoring.

Re-extracting with the `-table` recipe plus **continuation merging** — an empty left column continues the previous description, and a term with no description at all is a wrapped term — produced 220 whole pairs from Om Galaxy and 436 from Maxwell.

**Diffing the two glossaries is what made the batch safe.** The 46 settlement-machinery definitions agree almost word for word across both documents, which is the signal that they describe SEBI's process rather than the issuer. That is a much stronger test than reading one document carefully: D21's filter failed precisely because issuer facts hide as bare numbers, and a second document makes them visible as differences.

Every entry was still rewritten rather than pasted. Om Galaxy's "Bidding Centers" description ends by naming its own Registered Office; its "Chairman", "ISIN", "Banker to our Company", "Material Subsidiary" and "Auditor" entries are pure issuer facts — those became fact-driven entries that render a gap when the appointment has not been made.

### A citation conflict the glossary surfaced

Om Galaxy, Maxwell and Axiom define **Fraudulent Borrower** as Regulation 2(1)(lll) of the SEBI ICDR Regulations. Maxwell **also** defines **Wilful Defaulter** as Regulation 2(1)(lll), and so does Century. The same sub-regulation cannot define both.

The glossary cites it for Fraudulent Borrower, where three independent documents agree, and defines Wilful Defaulter **without a sub-regulation number**. Recorded as O-15. No rule depends on it — EL-010 cites Reg 228(c) — so this is a disclosure-accuracy question rather than an engine one, but shipping a confident wrong citation in a glossary that a merchant banker will read is not free.

### What the tests now hold

- **No term is defined twice.** 130 entries across six arrays; a term in two of them renders twice in one alphabetical table.
- **No other issuer's name, auditor registration number or ISIN appears in any description** — the specific strings D21's filter let through.
- **Book-building terms disappear from a fixed-price issue** while the ASBA machinery stays.

---

## D32 — Wave 1 extraction is finished, and the single-source pattern held to the end

**2026-09-10.** The last four extractable boilerplate subsections are built: Certain Conventions (#2), Dividend Policy (#22), Restrictions on Foreign Ownership (#34) and Declaration (#37). Wave 1 extraction is complete.

**10 of the 37 numbered subsections, 42 rendered pages.** What remains in S4 is not extraction work: computed sections wait on S3/S5/S8, narrative on S9/S10 and API credits, Main Provisions of AoA on S7 upload, and two subsections are external deliverables from the auditor and the CA.

### Three decisions in this batch worth keeping

**Page cross-references are dropped.** The corpus writes 'see "Definitions and Abbreviations" on page 1'. We do not paginate until DOCX export, so any page number written here is invented and wrong in every document. Section names are kept; a test asserts no `on page N` survives.

**No sectoral cap is recited.** Restrictions on Foreign Ownership describes the FDI regime, which is identical for every issuer, but the permitted foreign investment percentage varies by sector. The corpus documents point at the FDI Policy rather than stating a number, and so does this — a cap recited for the wrong sector is worse than silence.

**The Declaration signature block is computed, not typed.** It is the page that carries personal liability under Section 26, signed by every Director plus the Company Secretary and the Chief Financial Officer. Building it from `management.directors` means it cannot silently omit someone; where no board is recorded it raises a gap rather than printing an empty list.

### The fourth single-sourced sentence, in the fourth different section

Dividend Policy carried "all Equity Shareholders whose names appear in the register of members on the record date are entitled to be paid". Om Galaxy alone; Maxwell's only mention of a record date is in an unrelated context.

That is now **four for four** — every single-sourced sentence caught across four separate sections has been Om Galaxy's. At 509 pages it is the longest document in the corpus and the primary BSE extraction source, so it carries more text nobody else carries, and that text sits inside blocks whose other paragraphs match word for word. **Running the per-clause source count is no longer a precaution when extracting from it; it is the method.**

---

## D33 — An invalid answer is saved, and a real issuer never starts from the seed

**Two decisions from building S3, both about what honesty means in a form.**

### An invalid value is stored, not rejected

`saveField` writes whatever the issuer typed and reports the problems alongside it. Refusing to store a value that fails its schema would lose their work every time they typed a half-finished date — and it would make the gap dashboard lie by omission.

**A field that is WRONG is a different state from a field that is EMPTY**, and the document has to be able to show the difference. An empty field is a question nobody has answered; a wrong one is an answer somebody needs to look at again. Collapsing them into "not answered" hides the second.

### A real issuer's answers go over an EMPTY fact base, never over the demo seed

The obvious implementation is to start every issuer on the Vardhman seed and let them overwrite it field by field. It renders beautifully from the first keystroke.

It is also the exact failure D21 records, moved from text into product: a document that reads as complete while carrying another company's face value, another company's auditor, another company's registered office in every place the issuer has not reached yet. The reader cannot tell which figures are theirs.

So `withAnswers` lays the issuer's answers over `emptyFactBase()`. Everything unanswered renders as a visible gap and appears in the findings list. Typing one company name produces **56 findings and 29/100 readiness**, which looks discouraging and is correct — that IS the state of a document with one fact in it.

### While there: two things the browser found that types did not

**Zod schemas and functions cannot cross the server/client boundary.** Passing a `Field` to the form is a runtime error, not a type error, so it reached the browser before it failed. The fix is a `FieldView` of plain data built on the server — which is the better shape anyway: validation and `showIf` both run where the schema and the whole fact base already are, and the browser carries neither Zod nor the section registry.

**React's `onBlur` listens for `focusout`, not `blur`.** `blur` does not bubble, so a synthetic one never reaches the handler. Worth knowing for any future browser verification of a form.

---

## D34 — The bug the unit tests could not see

**2026-09-10, building the repeater.** `parsePaste` had eight passing tests: tab separation, grouping separators stripped, empty numeric cells left undefined rather than zero, short rows padded instead of shifted, Windows line endings, single-cell pastes ignored. All green.

The bug was one line away, in the code that put the parsed rows into the list:

```ts
const before = rows.slice(0, i);
const after = rows.slice(i + 1);          // wrong
commit([...before, ...parsed, ...after]);
```

Pasting five rows into row 0 of a five-row table gave **nine rows** — the pasted five, plus the four the paste should have covered. An issuer pasting their full allotment history over a partly typed list gets every row twice and a cumulative total that silently doubles.

Only the browser found it. The parser was never wrong; the splice was, and no test of the parser could have reached it.

**`applyPaste` now follows spreadsheet semantics:** pasting N rows at row i overwrites rows i through i+N-1 and leaves anything beyond intact. Pasting the same block twice is now idempotent, which is the property that actually matters — a nervous issuer will paste again to be sure.

### The general lesson, which has now appeared twice in this session

D29 was the same shape: every test written for a section checked that section, and the defect sat one section away in the same document. Here every test written for the parser checked the parser, and the defect sat one function away in the caller.

**Test the seam, not just the part.** Where a pure function feeds a stateful caller, the caller is where the interesting mistakes live.

### Two smaller things worth keeping

**`revalidatePath('/intake')` does not reach `/intake/m2`.** It needs `revalidatePath('/intake', 'layout')`. Without it the live consistency banner appears only after a manual reload — and a consistency check the issuer has to go looking for is not live.

**The running total is a mitigation, not a fix.** It made the doubled figure visible immediately, which is why the bug was caught in seconds rather than in week nine. But a mistake the issuer has to notice is worse than one that cannot happen, and the fix was still the right call.

---

## D35 — No page watermark; the draft state lives in the running header

**User decision, 2026-09-11, on seeing the first DOCX export.**

D9 recorded the export as "watermarked `UNSIGNED DRAFT — NOT FOR FILING` until merchant-banker
certification". The first S11 build did that with a text frame in the header, and the render
showed why it was wrong before the user did: a frame is a layout object, so with wrapping off it
painted OVER the body, and a Definitions row underneath it was unreadable. A redline the banker
cannot read is not a deliverable.

The second build used Word's own watermark markup — a WordArt text path at a negative z-index,
behind the text — which rendered correctly. The user asked for it to be removed regardless.

**What carries the draft state now:** the notice in the running header, on every page, in red,
beside the company and document name. It goes when `certified` is set, exactly as the watermark
would have. The `certified` option, the filename suffix and the `Cache-Control: no-store` on the
route are unchanged; S12's certification action is still what lifts them.

**Supersedes** the watermark half of D9. The certification gate itself stands.

---

## D36 — The table of contents is written into the field, not left for Word to fill

**2026-09-11.** A ToC in Word is a field, and a field is empty until something computes it.
Word does on open (the document sets `updateFields`) or on F9; LibreOffice, Google Docs and any
PDF conversion never do. The first export opened with a "TABLE OF CONTENTS" heading and nothing
under it, and the user asked whether it had been missed.

The entries are now written into the field as cached content: every numbered section and every
heading down to level 3, each an internal hyperlink to its bookmark, styled with `toc 1` to
`toc 3` so the levels indent. Word replaces them with its own on update, using the same styles,
so the ToC looks the same before and after — except for page numbers, which nothing can supply
before Word paginates and which are blank until the field updates.

**Also from this build:**

- **`renderSections` is what the DOCX consumes, not a second tree.** The renderer walks the same
  `RenderedSection[]` as the HTML view, so the gaps, bookmarks and headings agree by
  construction. `lib/issuer.ts` is the one place that decides which issuer both render.
- **Word bookmarks are not DOM ids.** 40 characters, letters, digits and underscores. `bookmarkName`
  in `lib/anchors.ts` maps the existing anchors rather than inventing a second vocabulary; long
  ones keep a readable prefix and a hash.
- **Tables are fixed-layout with explicit widths that sum to the text width.** Autofit lets a
  nine-column shareholding table run past the right margin; fixed widths cannot.
- **Rendering caught a data defect the tests had not.** The EXIM abbreviation carried U+FFFD
  where the corpus has an en dash. The source PDF was checked and the character corrected.

---

## D37 — "None" is an answer, and the store must be able to hold it

**2026-09-11, building M3 to M10.** The S8 gate is "Vardhman completable start to finish", and it
failed on the first run for a reason that was not a bug in the seed: `promoters.pledgedSharesDetails`
is null, meaning no pledged shares, and `isAnswered(null)` was false. Every "date of the last
regulatory action, if any" and every "details, if any" had the same problem, and so did every
table whose empty state is meaningful — no litigation, no disassociations, no selling shareholders.
A form that cannot say "none" cannot complete, and an issuer would be asked "any pledged shares?"
forever after answering no.

The wrong fix was to type "none" into the box, which then reads as a disclosure. The wrong fix for
tables was a boolean beside each one. The right fix is that the store distinguishes THREE states:

| Stored value | Means |
|---|---|
| absent (`undefined`) | nobody has reached this question |
| `null`, or `[]` for a table | someone chose **None** |
| a value | an answer |

`isAnswered` now counts null and an empty array as answered. That is safe only because nothing
writes them by accident: the form offers "None / not applicable" on fields whose schema takes null
(`isNullable`, derived from the Zod schema, not declared), and the repeater writes `[]` only from
its own "None / no entries" button or when the last row is removed — a table someone merely clicked
into is never saved. D33 said empty and wrong are different states; this adds that empty and none
are too.

**The seed is not padded to pass the gate.** Vardhman is a DRHP, and three M9 answers cannot exist
at that stage — the two anchor escrow account names (D28) and the expert consents. The gate now
states exactly those three as the only unanswered fields across all ten modules, which is a
stronger claim than 100% and a true one.

---

## D38 — Columns live on the field; the repeater knows money, yes/no and lists

**2026-09-11.** Two things S5 left that S8 could not build on.

**The page held a map from fact path to repeater columns.** Three entries for M2, and every new
table would have been a fourth line of UI code, against the rule that a module is content. Columns
are now `Field.columns`, declared with the field, and the page reads them. `feedsInto` gained the
same treatment for the other direction: a field may name a section that is in the map but not yet
built (`plannedSections`), and the form says "Our Business (not yet drafted)" rather than either
promising a place that does not exist (D22) or hiding where the answer goes. A test holds that a
planned id is removed the day the section is built.

**Every money cell in M2 was a `number` column.** Typing a face value stored `10`, `zMoney` wanted
`"10"`, and the row failed as "expected string, received number" — the browser gate had pasted the
seed's strings, so it never saw it. The plain form had the same defect on `currency` fields. The
repeater now has `money` (a decimal string, commas and "Rs" stripped), `boolean` (a Yes/No select,
reading yes/no/y/n/1/0 from a paste) and `list` (semicolons, for other directorships and committee
members), and empty text cells save as absent rather than `""` so an optional DIN left blank does
not fail the DIN pattern. `parseCell` is the one place a cell becomes a value, for typing and for
paste alike — D34's lesson about the seam, applied before the seam existed.

---

## D39 — What Wave 2 computes, and what it deliberately still asks

**2026-09-11.** Ten computed sections landed from M3 to M10. The line between derived and asked
(D20, D28) was drawn per figure:

**Computed, never asked:** the promoters' aggregate holding and the directors' shareholding (from
the M2 register, so the three sections cannot disagree); the board composition sentence and every
age (from flags and dates of birth); each committee member's nature of directorship (looked up on
the board); the litigation materiality threshold and the material creditor threshold (from M6,
with the arithmetic both corpus documents print); the indebtedness summary by category (from the
facility list); the capitalisation totals and ratios; the contingent liability and RPT totals.

**Asked, because no rule reproduces it:** the materiality policy DATE (a board resolution); the
group company threshold and its BASE (10% of PAT in one document, 10% of revenue in the other);
the borrowings "as on" date and the auditor's certificate; the post-issue capitalisation column,
which every corpus document prints as "[dot]" because it depends on the issue price.

**Checked, and said so where it fails:** the fund-based outstanding against the balance sheet's
total borrowings; each year's contingent liability items against the year's total; each year's RPT
lines against the year's total; every transaction party against the related party list. A mismatch
is a highlighted reconciliation placeholder, not a silent choice of one figure over the other.

**Summary of Financial Information is external.** It is the auditor's summary statements, which
both sources reproduce in full; a condensed table of our key figures would be a different thing
wearing the section's name.

**Left for later, and listed:** the committees' terms of reference, "Interest of Directors" and
"Interest of Promoters" and the promoter undertakings — boilerplate the fact base does not carry
and Wave 1 extraction has not reached; Other Financial Information (EPS, RoNW, NAV) and Material
Contracts, both computable from facts already held.

---

## D40 — PDF is a print of the DOCX, never a third renderer

**2026-09-11, finishing S11.** The document has one AST and two renderers, and D7 makes the DOCX
the deliverable. A PDF export could have been a third renderer over the same AST; it would have
drifted from the DOCX exactly the way the architecture note warns HTML and DOCX would have, and a
banker comparing the two would find differences that are ours, not theirs.

So `/export/pdf` prints the DOCX through LibreOffice — the same conversion the S11 verification
used — and returns a plain 501 when LibreOffice is not installed (`SETU_SOFFICE` overrides the
search). The vault ships without the PDF in that case and its manifest says so. An honest absence
over a lookalike.

**Also from this build:**

- **The gap report is the dashboard in a spreadsheet**, because the banker's diligence tracker IS
  a spreadsheet and a list they cannot paste is a list they retype. Findings, Placeholders and
  Provenance sheets; "Where to fix" resolved by fact path to the module and the question, so a
  row names a place a person can go. A `Banker notes` column comes back filled in.
- **One assembly for every export.** `lib/export/bundle.ts` loads the issuer, renders and assesses
  once; the DOCX, PDF, workbook and vault routes all call it. Four routes loading facts for
  themselves would eventually describe four different versions.
- **The vault carries the fact base and the provenance map** beside the document, because a figure
  in a table traces to a fact path and the fact path traces to a person and a date, and diligence
  wants that chain in the same folder.

---

## D41 — EPS is computed, and the share-weighting convention is the one the corpus reproduces

**2026-09-11, building Other Financial Information.** Earnings per share needs the weighted
average number of shares for each year, restated for bonus issues under AS-20. That is derivable
from the allotment build-up — but D20 says a computed figure gets a ground-truth test, and D28
says a convention that varies by drafter is a fact to ask for, not a derivation.

Maxwell prints its weighted counts beside its EPS: 1,00,50,275 / 1,00,07,133 / 1,00,06,775 for
Fiscals 2026 to 2024, from four allotments including a rights issue on March 29, 2025 and two
bonus issues. One rule reproduces all three exactly: **cash allotments count for the days they
were outstanding, inclusive; every bonus issue's total shares are added in full to every earlier
year.** The March 29 rights issue counts three days of 365. The test holds it.

Om Galaxy's history — eighteen allotments, preference capital, and implied weighted counts above
its current share count — could not be reconstructed reliably from layout text and is not used.
One corpus reproduction is thinner than the two-source rule wants; the arithmetic is AS-20's own,
and the method is printed in the note beneath the table so a banker can see it.

**Two conventions vary and are stated, not hidden.** Return on net worth is on closing net worth
(Maxwell) rather than the average of opening and closing (Om Galaxy); EBITDA margin is on revenue
from operations (Maxwell) rather than total income (Om Galaxy). Both documents print their
formula under the table, which is what makes either acceptable; the note here does the same.

**Material Contracts** needed six agreement dates the fact base did not hold. They are M9
questions now, and the two signed before the RHP — banker to the issue, market making — join the
DRHP-stage unknowns the seed leaves open, as Maxwell's DRHP prints them: "dated [dot]".
