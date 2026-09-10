/**
 * Classify an extracted corpus glossary into a REVIEW QUEUE.
 *
 * THIS DOES NOT PRODUCE A SHIPPABLE GLOSSARY. It was written to, and it failed.
 * Read this before trying again.
 *
 * The idea was: a prospectus glossary is ~200 entries, most of them standard
 * regulatory definitions, so filter out the issuer-specific ones and bulk
 * import the rest. The filter rejects proper nouns that are not statutes or
 * regulators, plus anything carrying a date.
 *
 * Of 207 merged entries it passed 31. Three of those 31 STILL carried Om
 * Galaxy's own data:
 *
 *   "Equity Shares"  -> "...of face value of 5 each"      (its face value)
 *   "Auditor"        -> "...firm registration number 124851W" (its auditor)
 *   "Stock Exchange" -> "...refers to, BSE Limited"        (its exchange)
 *
 * They slipped past because issuer specifics are not always capitalised proper
 * nouns — they are bare numbers, registration codes and two-word names. No
 * regex separates them reliably, and the failure is invisible: the text reads
 * perfectly while carrying another company's facts.
 *
 * CONCLUSION: there is no safe bulk-copy tier. Every glossary entry is either
 * fact-driven (a template with substitution, as in sections/definitions.ts) or
 * genuinely invariant and authored deliberately. The ~143 entries this rejects
 * as issuer-specific mostly need to BECOME fact-driven templates, not be
 * filtered back in.
 *
 * Keep this script as a triage tool: it tells you which entries need attention
 * and why. Do not wire its output into the document.
 *
 * Usage: node scripts/build-glossary.mjs
 */
import fs from 'node:fs';

const SOURCE = 'fixtures/definitions/om-galaxy-definitions.json';
const OUTPUT = 'fixtures/definitions/review-queue.json';

const raw = JSON.parse(fs.readFileSync(SOURCE, 'utf8'));

/* 1. Merge rows where the TERM wrapped across lines. -table gives us the term
      column split when a term is long, leaving a stub row behind. */
const merged = [];
for (const p of raw) {
  const prev = merged[merged.length - 1];
  const prevLooksTruncated =
    prev && prev.desc.length < 40 && /[a-z]$/.test(prev.term) && !/\.$/.test(prev.term);
  if (prev && p.term.length < 40 && (!p.desc || prevLooksTruncated)) {
    prev.term = `${prev.term} ${p.term}`.replace(/\s+/g, ' ').trim();
    prev.desc = `${prev.desc} ${p.desc}`.replace(/\s+/g, ' ').trim();
  } else {
    merged.push({
      term: p.term.replace(/\s+/g, ' ').trim(),
      desc: p.desc.replace(/\s+/g, ' ').trim(),
    });
  }
}

/* 2. Proper nouns that are safe: statutes, regulators, market infrastructure,
      investor categories, standard abbreviations. Anything else capitalised is
      treated as issuer-specific. */
const ALLOWED = [
  'SEBI', 'RBI', 'ICDR', 'LODR', 'NSE', 'BSE', 'NSDL', 'CDSL', 'SCRA', 'SCRR',
  'FEMA', 'IRDAI', 'IRDA', 'MCA', 'RoC', 'GoI', 'India', 'Indian', 'Emerge',
  'Companies Act', 'Depositories Act', 'Income Tax Act', 'Securities Act',
  'Contracts Act', 'Partnership Act', 'Regulation', 'Regulations', 'Section',
  'Schedule', 'Chapter', 'Act', 'Rules', 'Circular', 'Master Circular',
  'UPI', 'ASBA', 'PAN', 'GIR', 'DP', 'ID', 'Client', 'Rupees', 'Lakhs',
  'Crores', 'Equity', 'Shares', 'Share', 'Working', 'Day', 'Days', 'Mutual',
  'Fund', 'Funds', 'Anchor', 'Investor', 'Investors', 'Portion', 'Bid', 'Bids',
  'Bidder', 'Bidders', 'Bidding', 'Allotment', 'Allottee', 'Allottees',
  'Prospectus', 'Draft', 'Red', 'Herring', 'Offer', 'Issue', 'Price', 'Band',
  'Floor', 'Cap', 'Lot', 'Net', 'Fresh', 'Sale', 'Selling', 'Shareholder',
  'Shareholders', 'Promoter', 'Promoters', 'Group', 'Company', 'Board',
  'Director', 'Directors', 'Committee', 'Auditors', 'Auditor', 'Registrar',
  'Manager', 'Managers', 'Lead', 'Book', 'Running', 'Syndicate', 'Member',
  'Underwriter', 'Underwriters', 'Market', 'Maker', 'Sponsor', 'Bank', 'Banks',
  'Banker', 'Bankers', 'Escrow', 'Account', 'Accounts', 'Designated',
  'Intermediary', 'Intermediaries', 'Branch', 'Branches', 'Stock', 'Exchange',
  'Exchanges', 'Depository', 'Depositories', 'Participant', 'Beneficiary',
  'Memorandum', 'Articles', 'Association', 'General', 'Information', 'Document',
  'Meeting', 'Resolution', 'Revision', 'Form', 'Forms', 'Advice', 'Slip',
  'Addendum', 'Abridged', 'Basis', 'Cut', 'Off', 'Institutional', 'Individual',
  'Qualified', 'Buyer', 'Buyers', 'Non', 'Retail', 'Employee', 'Employees',
  'Venture', 'Capital', 'Alternative', 'Investment', 'Foreign', 'Portfolio',
  'Systemically', 'Important', 'Banking', 'Financial', 'Companies', 'Insurance',
  'Provident', 'Pension', 'Hindu', 'Undivided', 'Family', 'Families', 'Karta',
  'Limited', 'Liability', 'Partnership', 'Partnerships', 'Trust', 'Trusts',
  'Society', 'Societies', 'Body', 'Corporate', 'Person', 'Persons', 'Resident',
  'Overseas', 'Citizen', 'External', 'Ordinary', 'Currency', 'Convertible',
  'Securities', 'Security', 'Capitalisation', 'Statement', 'Restated',
  'Consolidated', 'Standalone', 'Financial', 'Statements', 'Information',
  'Fiscal', 'Financial Year', 'GAAP', 'ICAI', 'IPO', 'SME', 'CIN', 'DIN',
  'AGM', 'EGM', 'NCLT', 'IBC', 'BIFR', 'MSME', 'GST', 'TDS', 'NAV', 'EPS',
  'RONW', 'QIB', 'QIBs', 'NII', 'NIIs', 'FPI', 'FPIs', 'AIF', 'AIFs', 'VCF',
  'VCFs', 'FVCI', 'FVCIs', 'HUF', 'HUFs', 'SCSB', 'SCSBs', 'NBFC', 'NBFCs',
  'OCB', 'OCBs', 'NRI', 'NRIs', 'OCI', 'NRE', 'NRO', 'FCNR', 'BRLM', 'RTA',
  'CAN', 'MOA', 'AOA', 'DRHP', 'RHP', 'SCSBs', 'The', 'This', 'Such', 'Any',
  'All', 'Unless', 'For', 'In', 'A', 'An', 'As', 'Provided', 'However',
];
const ALLOWED_SET = new Set(ALLOWED.map((w) => w.toLowerCase()));

const HAS_DATE = /\b\d{1,2},\s*20\d\d\b|\b20\d\d\b/;

const clean = [];
const rejected = [];

for (const p of merged) {
  const text = `${p.term} ${p.desc}`;

  if (HAS_DATE.test(text)) {
    rejected.push({ term: p.term, why: 'contains a date' });
    continue;
  }
  if (p.term.length < 2 || p.desc.length < 20) {
    rejected.push({ term: p.term, why: 'too short to be a definition' });
    continue;
  }

  // Any capitalised word not on the allow-list is treated as issuer-specific.
  const capitalised = text.match(/\b[A-Z][A-Za-z]{1,}\b/g) ?? [];
  const suspect = [...new Set(capitalised.filter((w) => !ALLOWED_SET.has(w.toLowerCase())))];
  if (suspect.length > 0) {
    rejected.push({ term: p.term, why: `issuer-specific: ${suspect.slice(0, 3).join(', ')}` });
    continue;
  }

  clean.push(p);
}

fs.writeFileSync(OUTPUT, JSON.stringify(clean, null, 1));

console.log(`source           ${raw.length}`);
console.log(`after term merge ${merged.length}`);
console.log(`passed filter    ${clean.length}  -> ${OUTPUT}  (REVIEW QUEUE, not shippable)`);
console.log(`rejected         ${rejected.length}`);
console.log('');
console.log('--- kept ---');
for (const p of clean.slice(0, 8)) console.log(`  ${p.term.slice(0, 34).padEnd(34)} ${p.desc.slice(0, 74)}`);
console.log('');
console.log('--- rejected, by reason ---');
const byReason = {};
for (const r of rejected) {
  const k = r.why.split(':')[0];
  byReason[k] = (byReason[k] ?? 0) + 1;
}
for (const [k, v] of Object.entries(byReason)) console.log(`  ${String(v).padStart(3)}  ${k}`);
