# Paired extraction fixtures

**Built by `scripts/build-corpus-fixtures.mjs` from the gitignored corpus PDFs.** The text here is committed; the 88MB of PDFs it came from is not.

Every prospectus contains both halves of an extraction test, already reconciled and signed off by a merchant banker:

| | What | Why it is that half |
|---|---|---|
| `input/` | Restated financial information — the auditor's examination report through to the annexures | This is what an extractor reads: dense, tabular, and laid out differently by every auditor |
| `truth/` | Capital Structure — share capital build-up, shareholding pattern, lock-in | This is the correct ANSWER, derived from the same underlying facts and checked by a professional |

That makes the expensive half of building an extractor free: S7 grades itself against these, and S5's computed capital tables can be diffed against them.

## Contents

`manifest.json` records the physical page range and size taken from each document. All seven prospectuses yield both halves.

## Rebuilding

```bash
pdftotext corpus/prospectus/<file>.pdf <scratch>/<company>.txt   # once per document
node scripts/build-corpus-fixtures.mjs --txt <scratch>
```

## What building this taught us

**Section headings are not stable across documents**, which is why the script matches several spellings and why the ToC cannot be trusted:

- `CAPITAL STRUCTURE` alone in four documents, `SECTION V - CAPITAL STRUCTURE` in Maxwell
- The financial section is `RESTATED FINANCIAL INFORMATION`, `FINANCIAL INFORMATION OF THE COMPANY`, or `SECTION VIII – FINANCIAL STATEMENTS` depending on the drafter
- Century has no uppercase financial section heading at all that a regex can anchor on

**The auditor's examination report is the reliable marker.** Every restated financial section opens with one, its wording barely varies, and it is mandatory — where the section heading above it is a house-style choice. Matching on the report rather than the heading is what took this from 4 of 7 documents to 7 of 7.

**Match case-sensitively.** Prospectus headings are set in capitals; matching case-insensitively lands on cross-references in running text. Photonics' financial section was initially found on page 6 — a mixed-case mention in the definitions — instead of page 223.

**Both spellings of "authorised" are in use.** Four of the seven documents write **"Authorized Share Capital"** in the capital structure table where the regulations write "Authorised". Any extraction pattern over these tables must accept either, and so must the glossary.
