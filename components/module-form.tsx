'use client';

import { useState, useTransition } from 'react';
import { saveField } from '@/app/intake/actions';
import type { FieldView } from '@/lib/modules/types';
import { Repeater } from './repeater';

/**
 * ONE renderer for every module (MM2).
 *
 * M1 to M10 are specs; this file is the whole form engine. Adding a module
 * adds no UI code, which is the point — otherwise ten modules become ten
 * forms that drift.
 *
 * Every field shows why it is asked and where the answer lands. That is not
 * decoration: a first-time issuer learns the disclosure framework from it
 * while filling the form, and an issuer who understands the question gives a
 * better answer.
 */

type Saved = 'idle' | 'saving' | 'saved' | 'error';

const inputClass =
  'mt-1 w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ' +
  'focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900';

function Why({ field }: { field: FieldView }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs text-zinc-500 underline decoration-dotted underline-offset-2 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        {open ? 'Hide' : 'Why we ask'}
      </button>
      {open && (
        <div className="mt-2 rounded border-l-2 border-zinc-300 bg-zinc-50 py-2 pl-3 pr-2 text-xs leading-relaxed text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          <p>{field.helpText}</p>
          {field.clause && (
            <p className="mt-2">
              <span className="text-zinc-400">Requirement: </span>
              {field.clause}
            </p>
          )}
          {field.feedsInto.length > 0 && (
            <p className="mt-2">
              <span className="text-zinc-400">Where this appears: </span>
              {field.feedsInto.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Input({
  field,
  value,
  onChange,
}: {
  field: FieldView;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  switch (field.type) {
    case 'boolean':
      return (
        <div className="mt-2 flex gap-1">
          {[true, false].map((v) => (
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
      );

    case 'select':
      return (
        <select
          className={inputClass}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select...</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );

    case 'longtext':
      return (
        <textarea
          rows={3}
          className={inputClass}
          placeholder={field.placeholder}
          value={typeof value === 'string' ? value : value ? JSON.stringify(value) : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'number':
    case 'currency':
    case 'percent':
      return (
        <div className="flex items-baseline gap-2">
          <input
            className={`${inputClass} tabular-nums`}
            inputMode="decimal"
            placeholder={field.placeholder}
            value={value === undefined || value === null ? '' : String(value)}
            onChange={(e) => {
              const raw = e.target.value;
              // An empty box is unanswered, not zero. Coercing it to 0 would
              // report the field as answered and satisfy a rule falsely.
              if (raw === '') return onChange(undefined);
              // Money stays a decimal STRING — the fact base's Money type.
              // Number() here would fail the zMoney schema and put a float
              // into rupee arithmetic.
              onChange(field.type === 'currency' ? raw.replace(/[,\s]/g, '') : Number(raw));
            }}
          />
          {field.suffix && <span className="shrink-0 text-xs text-zinc-500">{field.suffix}</span>}
        </div>
      );

    default:
      return (
        <input
          type={field.type === 'date' ? 'date' : 'text'}
          className={inputClass}
          placeholder={field.placeholder}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

function FieldRow({ field, moduleId }: { field: FieldView; moduleId: string }) {
  const [value, setValue] = useState<unknown>(field.value);
  const [issues, setIssues] = useState<string[]>(field.issues);
  const [state, setState] = useState<Saved>('idle');
  const [, startTransition] = useTransition();

  const commit = (next: unknown) => {
    setValue(next);
    setState('saving');
    startTransition(async () => {
      const result = await saveField(moduleId, field.path, next);
      setIssues(result.issues);
      setState(result.ok ? 'saved' : 'error');
    });
  };

  return (
    <div className="border-b border-zinc-100 py-4 dark:border-zinc-800">
      <div className="flex items-baseline justify-between gap-4">
        <label className="text-sm font-medium">{field.label}</label>
        <span className="shrink-0 text-xs text-zinc-400">
          {state === 'saving' && 'Saving...'}
          {state === 'saved' && 'Saved'}
          {state === 'error' && <span className="text-amber-600">Saved, needs attention</span>}
        </span>
      </div>

      {/*
        Save on blur, not on every keystroke. Each save appends a version, and
        a version per keystroke would bury the real edits in the history.

        A nullable field has a third state beside "answered" and "not yet":
        NONE — no pledged shares, no regulatory action, no change of control.
        It saves as null, which the store keeps apart from an absent answer,
        so the module can complete without the issuer typing "none" into a
        box that then reads as a disclosure.
      */}
      {value === null ? (
        <div className="mt-2 flex items-center gap-3">
          <span className="rounded bg-zinc-900 px-3 py-1 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">
            None
          </span>
          <button
            type="button"
            onClick={() => setValue(undefined)}
            className="text-xs text-zinc-500 underline decoration-dotted underline-offset-2"
          >
            Enter details instead
          </button>
        </div>
      ) : (
        <>
          <div onBlur={() => commit(value)}>
            <Input field={field} value={value} onChange={setValue} />
          </div>
          {field.nullable && (
            <button
              type="button"
              onClick={() => commit(null)}
              className="mt-2 text-xs text-zinc-500 underline decoration-dotted underline-offset-2"
            >
              None / not applicable
            </button>
          )}
        </>
      )}

      {issues.length > 0 && (
        <ul className="mt-2 space-y-0.5">
          {issues.map((i) => (
            <li key={i} className="text-xs text-amber-700 dark:text-amber-500">
              {i}
            </li>
          ))}
        </ul>
      )}

      <Why field={field} />
    </div>
  );
}

/**
 * `fields` arrives already filtered by `showIf` and already carrying its
 * values, resolved section titles and current issues — all computed on the
 * server. A field that appears only after another answer therefore shows on
 * the next load rather than mid-keystroke, which also keeps the form from
 * rearranging under the cursor.
 */
export function ModuleForm({ moduleId, fields }: { moduleId: string; fields: FieldView[] }) {
  return (
    <div>
      {fields.map((f) =>
        f.type === 'table' && f.columns ? (
          <Repeater
            key={f.path}
            moduleId={moduleId}
            path={f.path}
            label={f.label}
            helpText={f.helpText}
            columns={f.columns}
            initial={Array.isArray(f.value) ? (f.value as Record<string, unknown>[]) : []}
            answeredNone={Array.isArray(f.value) && f.value.length === 0}
          />
        ) : (
          <FieldRow key={f.path} field={f} moduleId={moduleId} />
        ),
      )}
    </div>
  );
}
