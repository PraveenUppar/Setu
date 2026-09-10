import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ModuleForm } from '@/components/module-form';
import { allProgress, feedsIntoTitles, findModule } from '@/lib/modules';
import { applicableFields, fieldStatus, toFieldView } from '@/lib/modules/types';
import { getFact } from '@/lib/facts/provenance';
import { readFactBase } from '@/lib/store/fact-store';

export const dynamic = 'force-dynamic';

export default async function ModulePage({ params }: { params: Promise<{ moduleId: string }> }) {
  const { moduleId } = await params;
  const module = findModule(moduleId);
  if (!module) notFound();

  const { facts } = readFactBase();
  const fields = applicableFields(module, facts);

  /**
   * Everything the form needs is resolved HERE, into plain data.
   *
   * A Field carries a Zod schema and two functions, and neither crosses the
   * server/client boundary. Validation and showIf both run on this side, where
   * the schema and the whole fact base already live, so the browser never
   * carries Zod or the section registry.
   */
  const views = fields.map((f) => {
    const value = getFact(facts, f.path);
    return toFieldView(f, value, feedsIntoTitles(f.feedsInto), fieldStatus(f, facts, value).issues);
  });

  const progress = allProgress(facts).find((p) => p.moduleId === module.id)!;

  return (
    <div className="min-h-full bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-2xl px-8 py-6">
          <Link href="/intake" className="text-xs text-zinc-500 underline decoration-dotted underline-offset-2">
            All modules
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            <span className="mr-2 text-zinc-400">{module.id}</span>
            {module.title}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">{module.purpose}</p>

          {module.requestsDocuments.length > 0 && (
            <div className="mt-4 rounded border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Worth having to hand
              </p>
              <ul className="mt-1 space-y-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                {module.requestsDocuments.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-4 text-sm text-zinc-500">
            {progress.answered} of {progress.applicable} answered
            {progress.withIssues > 0 && (
              <span className="text-amber-700 dark:text-amber-500">
                {' '}
                · {progress.withIssues} need attention
              </span>
            )}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-8 py-8">
        <div className="rounded-lg border border-zinc-200 bg-white px-6 py-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <ModuleForm moduleId={module.id} fields={views} />
        </div>

        <p className="mt-6 text-xs text-zinc-500">
          Every answer saves as you leave the field, and each save is a new version — nothing is
          overwritten. Leave and come back whenever you like.
        </p>
      </main>
    </div>
  );
}
