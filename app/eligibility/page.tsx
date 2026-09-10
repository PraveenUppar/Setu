'use client';

import { useMemo, useState } from 'react';
import { formatAs, money } from '@/lib/facts/money';
import { runPreCheck, type PreCheckInput, type PreCheckYear } from '@/lib/rules/precheck';
import type { Exchange } from '@/lib/facts/schema';

/**
 * The standalone eligibility pre-check.
 *
 * No signup, no document, no merchant banker — a promoter answers what they
 * already know and gets a cited verdict. Today the alternative is paying an
 * intermediary for a preliminary assessment, or far more often never finding
 * out at all.
 *
 * Five steps, and every question says why it is being asked. Someone who has
 * never done this does not know what a "bid lot" is, and should not have to
 * before learning whether they qualify at all.
 */

const cr = (v: string) => money(v || '0', 'crores');

interface YearForm {
  yearEnding: string;
  profitBeforeTax: string;
  financeCosts: string;
  depreciation: string;
  otherIncome: string;
  netWorth: string;
  totalBorrowings: string;
  shareholdersEquity: string;
  cashFlowFromOperations: string;
  netPurchaseOfFixedAssets: string;
  netBorrowings: string;
  interestPaidNetOfTax: string;
}

const emptyYear = (yearEnding: number): YearForm => ({
  yearEnding: String(yearEnding),
  profitBeforeTax: '',
  financeCosts: '',
  depreciation: '',
  otherIncome: '',
  netWorth: '',
  totalBorrowings: '',
  shareholdersEquity: '',
  cashFlowFromOperations: '',
  netPurchaseOfFixedAssets: '',
  netBorrowings: '',
  interestPaidNetOfTax: '',
});

const STEPS = ['Listing', 'Company', 'Capital', 'Financials', 'Declarations'] as const;

function Field({
  label,
  why,
  children,
}: {
  label: string;
  why?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {why && <span className="mt-1 block text-xs text-zinc-500">{why}</span>}
    </label>
  );
}

const inputClass =
  'mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm tabular-nums outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900';

function YesNo({
  label,
  why,
  value,
  onChange,
}: {
  label: string;
  why?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-zinc-100 py-3 dark:border-zinc-800">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {why && <p className="mt-0.5 text-xs text-zinc-500">{why}</p>}
      </div>
      <div className="flex shrink-0 gap-1">
        {[false, true].map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onChange(v)}
            className={`rounded px-3 py-1 text-sm ${
              value === v
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
          >
            {v ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EligibilityPreCheck() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [exchange, setExchange] = useState<Exchange>('BSE_SME');
  const [isPublicLimited, setIsPublicLimited] = useState(true);
  const [dateOfIncorporation, setDateOfIncorporation] = useState('');
  const [faceValue, setFaceValue] = useState('10');
  const [paidUpShares, setPaidUpShares] = useState('');
  const [authorisedShares, setAuthorisedShares] = useState('');
  const [freshIssueShares, setFreshIssueShares] = useState('');
  const [years, setYears] = useState<YearForm[]>([
    emptyYear(2026),
    emptyYear(2025),
    emptyYear(2024),
  ]);
  const [debarred, setDebarred] = useState(false);
  const [defaulter, setDefaulter] = useState(false);
  const [fugitive, setFugitive] = useState(false);
  const [convertibles, setConvertibles] = useState(false);
  const [partlyPaid, setPartlyPaid] = useState(false);

  const needsCashFlow = exchange === 'NSE_EMERGE';

  const input: PreCheckInput = useMemo(
    () => ({
      exchange,
      isPublicLimited,
      dateOfIncorporation: dateOfIncorporation || '2000-01-01',
      faceValue: money(faceValue || '10'),
      paidUpShares: Number(paidUpShares) || 0,
      authorisedShares: Number(authorisedShares) || 0,
      intendedFreshIssueShares: Number(freshIssueShares) || 0,
      years: years.map(
        (y): PreCheckYear => ({
          yearEnding: Number(y.yearEnding),
          profitBeforeTax: cr(y.profitBeforeTax),
          financeCosts: cr(y.financeCosts),
          depreciationAndAmortisation: cr(y.depreciation),
          otherIncome: cr(y.otherIncome),
          netWorth: cr(y.netWorth),
          totalBorrowings: cr(y.totalBorrowings),
          shareholdersEquity: cr(y.shareholdersEquity),
          ...(needsCashFlow
            ? {
                cashFlowFromOperations: cr(y.cashFlowFromOperations),
                netPurchaseOfFixedAssets: cr(y.netPurchaseOfFixedAssets),
                netBorrowings: cr(y.netBorrowings),
                interestPaidNetOfTax: cr(y.interestPaidNetOfTax),
              }
            : {}),
        }),
      ),
      anyDebarredBySebi: debarred,
      anyWilfulDefaulterOrFraudulentBorrower: defaulter,
      anyFugitiveEconomicOffender: fugitive,
      hasOutstandingConvertibles: convertibles,
      hasPartlyPaidShares: partlyPaid,
    }),
    [exchange, isPublicLimited, dateOfIncorporation, faceValue, paidUpShares, authorisedShares, freshIssueShares, years, debarred, defaulter, fugitive, convertibles, partlyPaid, needsCashFlow],
  );

  const result = useMemo(() => runPreCheck(input), [input]);

  const setYear = (i: number, patch: Partial<YearForm>) =>
    setYears((ys) => ys.map((y, j) => (i === j ? { ...y, ...patch } : y)));

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-12">
        <div
          className={`rounded-lg border p-6 ${
            result.eligible
              ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40'
              : 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/40'
          }`}
        >
          <h1 className="text-2xl font-semibold">
            {result.eligible ? 'Eligible, on what you have told us' : 'Not eligible yet'}
          </h1>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            {result.eligible
              ? `Nothing here stops you listing on ${exchange === 'BSE_SME' ? 'BSE SME' : 'NSE Emerge'}. A full assessment covers more ground once you have engaged a merchant banker.`
              : `${result.summary.blockers} thing${result.summary.blockers === 1 ? '' : 's'} would stop the exchange accepting this today. Each is fixable, and each is explained below.`}
          </p>

          <dl className="mt-5 flex flex-wrap gap-8 text-sm">
            <div>
              <dt className="text-zinc-500">Post-issue capital</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">
                {formatAs(result.postIssueCapital, 'crores')}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Checks passed</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">
                {result.summary.passed} of {result.summary.passed + result.findings.length}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Typical time to listing</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">
                {result.estimatedMonths} to {result.estimatedMonths + 3} months
              </dd>
            </div>
          </dl>
        </div>

        {result.findings.length > 0 && (
          <ul className="mt-6 space-y-4">
            {result.findings.map((f) => (
              <li
                key={f.ruleId}
                className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <p className="font-medium">{f.title}</p>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {f.detail}
                </pre>
                <p className="mt-2 text-xs text-zinc-500">Requirement: {f.clause}</p>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-8 text-xs text-zinc-500">
          This is an indicative check against the eligibility conditions a promoter can answer
          without a merchant banker. It is not advice, and it does not replace the due diligence and
          certification a merchant banker must carry out before filing.
        </p>

        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 rounded bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Change my answers
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Can my company do an SME IPO?</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Five short steps. Nothing is saved and you do not need an account.
      </p>

      <ol className="mt-6 flex flex-wrap gap-2 text-xs">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`rounded px-2 py-1 ${
              i === step
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : i < step
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
            }`}
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>

      <div className="mt-8 space-y-5">
        {step === 0 && (
          <Field
            label="Which exchange are you aiming for?"
            why="The two platforms apply different financial tests. BSE SME looks at leverage and net worth; NSE Emerge looks at free cash flow."
          >
            <select
              className={inputClass}
              value={exchange}
              onChange={(e) => setExchange(e.target.value as Exchange)}
            >
              <option value="BSE_SME">BSE SME</option>
              <option value="NSE_EMERGE">NSE Emerge</option>
            </select>
          </Field>
        )}

        {step === 1 && (
          <>
            <Field
              label="Date of incorporation"
              why="Both exchanges require a track record of at least three years."
            >
              <input
                type="date"
                className={inputClass}
                value={dateOfIncorporation}
                onChange={(e) => setDateOfIncorporation(e.target.value)}
              />
            </Field>
            <YesNo
              label="Is the company already a public limited company?"
              why="Only a public limited company can make a public issue. Converting takes 45 to 60 days, so it is worth knowing early."
              value={isPublicLimited}
              onChange={setIsPublicLimited}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Field label="Face value per share (Rs)">
              <input className={inputClass} value={faceValue} onChange={(e) => setFaceValue(e.target.value)} />
            </Field>
            <Field label="Shares issued today" why="Your current paid-up equity shares, before the IPO.">
              <input className={inputClass} value={paidUpShares} onChange={(e) => setPaidUpShares(e.target.value)} />
            </Field>
            <Field
              label="Authorised shares"
              why="From your Memorandum of Association. If the issue would push you past this, you need a shareholder resolution first."
            >
              <input className={inputClass} value={authorisedShares} onChange={(e) => setAuthorisedShares(e.target.value)} />
            </Field>
            <Field
              label="New shares you intend to issue"
              why="This decides two things at once: whether post-issue capital stays under Rs 25 crore, and whether the issue reaches the 25% minimum."
            >
              <input className={inputClass} value={freshIssueShares} onChange={(e) => setFreshIssueShares(e.target.value)} />
            </Field>
          </>
        )}

        {step === 3 && (
          <>
            <p className="text-sm text-zinc-500">
              Three financial years, most recent first, in Rs crore. These come straight off your
              audited accounts.
            </p>
            {years.map((y, i) => (
              <fieldset key={i} className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
                <legend className="px-1 text-sm font-medium">FY {y.yearEnding}</legend>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {(
                    [
                      ['profitBeforeTax', 'Profit before tax'],
                      ['financeCosts', 'Finance costs'],
                      ['depreciation', 'Depreciation'],
                      ['otherIncome', 'Other income'],
                      ['netWorth', 'Net worth'],
                      ['totalBorrowings', 'Total borrowings'],
                      ['shareholdersEquity', "Shareholders' equity"],
                      ...(needsCashFlow
                        ? ([
                            ['cashFlowFromOperations', 'Cash from operations'],
                            ['netPurchaseOfFixedAssets', 'Fixed asset purchases'],
                            ['netBorrowings', 'Net borrowings'],
                            ['interestPaidNetOfTax', 'Interest paid, net of tax'],
                          ] as const)
                        : []),
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="block">
                      <span className="text-xs text-zinc-500">{label}</span>
                      <input
                        className={inputClass}
                        value={y[key as keyof YearForm]}
                        onChange={(e) => setYear(i, { [key]: e.target.value } as Partial<YearForm>)}
                      />
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </>
        )}

        {step === 4 && (
          <>
            <p className="text-sm text-zinc-500">
              These are absolute bars under Regulation 228. Answering yes to any one of them stops
              the issue until it is resolved.
            </p>
            <YesNo
              label="Is any promoter or director debarred from the capital markets by SEBI?"
              value={debarred}
              onChange={setDebarred}
            />
            <YesNo
              label="Is the company, any promoter or any director a wilful defaulter or fraudulent borrower?"
              value={defaulter}
              onChange={setDefaulter}
            />
            <YesNo
              label="Is any promoter or director a fugitive economic offender?"
              value={fugitive}
              onChange={setFugitive}
            />
            <YesNo
              label="Are there outstanding convertible securities, or rights to receive shares?"
              why="These must be converted or extinguished before filing, which can take months."
              value={convertibles}
              onChange={setConvertibles}
            />
            <YesNo
              label="Are any existing shares only partly paid up?"
              value={partlyPaid}
              onChange={setPartlyPaid}
            />
          </>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          className="rounded px-4 py-2 text-sm text-zinc-600 disabled:opacity-40 dark:text-zinc-400"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => (step === STEPS.length - 1 ? setSubmitted(true) : setStep((s) => s + 1))}
          className="rounded bg-zinc-900 px-4 py-2 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          {step === STEPS.length - 1 ? 'Check my eligibility' : 'Next'}
        </button>
      </div>
    </div>
  );
}
