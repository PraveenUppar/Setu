import type { DocumentNode, Run } from '@/lib/document/nodes';

/**
 * HTML renderer for the document AST.
 *
 * Pairs with `renderDocx` over the same `DocumentNode[]` — both consume one
 * tree so the preview and the deliverable cannot drift.
 *
 * Placeholders are rendered prominently on purpose. A gap the issuer can see
 * is doing its job; a gap hidden in 280 pages is not.
 */

function RunSpan({ run }: { run: Run }) {
  if (run.placeholder) {
    return (
      <mark
        className="rounded-sm bg-amber-100 px-1 py-0.5 text-amber-900 ring-1 ring-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:ring-amber-800"
        data-fact-path={run.placeholder.factPath}
        title={`Missing: ${run.placeholder.ask}`}
      >
        {run.text}
      </mark>
    );
  }

  let content: React.ReactNode = run.text;
  if (run.bold) content = <strong>{content}</strong>;
  if (run.italic) content = <em>{content}</em>;
  return <>{content}</>;
}

function Runs({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((run, i) => (
        <RunSpan key={i} run={run} />
      ))}
    </>
  );
}

const HEADING_CLASS: Record<number, string> = {
  1: 'mt-10 mb-4 text-2xl font-semibold tracking-tight',
  2: 'mt-8 mb-3 text-xl font-semibold tracking-tight',
  3: 'mt-6 mb-2 text-base font-semibold',
  4: 'mt-4 mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500',
};

function NodeView({ node }: { node: DocumentNode }) {
  switch (node.type) {
    case 'heading': {
      const Tag = (['h1', 'h2', 'h3', 'h4'] as const)[node.level - 1];
      return (
        <Tag id={node.anchor} className={HEADING_CLASS[node.level]}>
          {node.text}
        </Tag>
      );
    }

    case 'paragraph':
      return (
        <p className="my-3 text-justify leading-relaxed">
          <Runs runs={node.runs} />
        </p>
      );

    case 'list': {
      const Tag = node.ordered ? 'ol' : 'ul';
      return (
        <Tag
          className={`my-3 ml-6 space-y-1 ${node.ordered ? 'list-decimal' : 'list-disc'}`}
        >
          {node.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              <Runs runs={item} />
            </li>
          ))}
        </Tag>
      );
    }

    case 'table':
      return (
        <figure className="my-5">
          {node.caption && (
            <figcaption className="mb-2 text-sm font-medium">{node.caption}</figcaption>
          )}
          {/* Wide tables scroll inside their own container, never the page */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-y border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                  {node.headers.map((header, i) => (
                    <th
                      key={i}
                      className={`px-3 py-2 font-medium ${
                        node.numericColumns?.includes(i) ? 'text-right' : 'text-left'
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {node.rows.map((row, r) => (
                  <tr key={r} className="border-b border-zinc-200 dark:border-zinc-800">
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={`px-3 py-1.5 ${
                          node.numericColumns?.includes(c)
                            ? 'text-right tabular-nums'
                            : 'text-left'
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {node.footnotes?.map((note, i) => (
            <p key={i} className="mt-2 text-xs text-zinc-500">
              {note}
            </p>
          ))}
        </figure>
      );

    case 'toc':
      return (
        <div className="my-6 rounded border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700">
          Table of contents — generated on export
        </div>
      );

    case 'pageBreak':
      return <hr className="my-8 border-dashed border-zinc-300 dark:border-zinc-700" />;
  }
}

export function DocumentView({ nodes }: { nodes: DocumentNode[] }) {
  return (
    <article className="text-[15px] text-zinc-800 dark:text-zinc-200">
      {nodes.map((node, i) => (
        <NodeView key={i} node={node} />
      ))}
    </article>
  );
}
