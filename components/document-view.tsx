import { findingAnchor, gapAnchor } from '@/lib/anchors';
import type { DocumentNode, Run } from '@/lib/document/nodes';
import { gapAnchorKeys, runKey, type RenderedSection } from '@/lib/document/section-view';

/**
 * HTML renderer for the document AST.
 *
 * Pairs with `renderDocx` over the same `DocumentNode[]` — both consume one
 * tree so the preview and the deliverable cannot drift.
 *
 * Placeholders are rendered prominently on purpose. A gap the issuer can see
 * is doing its job; a gap hidden in 280 pages is not. Each one is also a link
 * back to its finding, where the ask, the clause and the place to fix it are.
 *
 * Deliberately light-only, literal colors throughout (not the app's shadcn
 * dark tokens) — this only ever renders inside the white "paper" surface in
 * `DocumentPager`, made to read like an actual printed document or PDF
 * regardless of the app's own theme.
 */

function RunSpan({ run, anchorId }: { run: Run; anchorId?: string }) {
  if (run.placeholder) {
    return (
      <a
        // The gap report is its own page now (D-design) — a same-page "#id"
        // fragment would go nowhere, so this links across pages.
        href={`/document/gaps#${findingAnchor(`CM-${run.placeholder.factPath}`)}`}
        className="no-underline"
        title={`Missing: ${run.placeholder.ask} — open the finding`}
      >
        {/*
          The id sits on the mark, not the anchor around it, so that :target
          styling lands on the highlight the reader was sent to see. The scroll
          margin keeps it clear of the top edge.
        */}
        <mark
          id={anchorId}
          className="scroll-mt-24 rounded-sm bg-amber-100 px-1 py-0.5 text-amber-900 ring-1 ring-amber-300 target:ring-2 target:ring-amber-500"
          data-fact-path={run.placeholder.factPath}
        >
          {run.text}
        </mark>
      </a>
    );
  }

  let content: React.ReactNode = run.text;
  if (run.bold) content = <strong>{content}</strong>;
  if (run.italic) content = <em>{content}</em>;
  return <>{content}</>;
}

/**
 * `anchored` maps a run's address to the fact path whose id it carries. Only
 * the first occurrence of a gap is in it, so the document never emits the same
 * id twice.
 */
interface Addressing {
  prefix: number[];
  anchored: Map<string, string>;
}

function Runs({ runs, prefix, anchored }: { runs: Run[] } & Addressing) {
  return (
    <>
      {runs.map((run, i) => {
        const factPath = anchored.get(runKey(...prefix, i));
        return (
          <RunSpan key={i} run={run} anchorId={factPath ? gapAnchor(factPath) : undefined} />
        );
      })}
    </>
  );
}

const HEADING_CLASS: Record<number, string> = {
  1: 'font-heading mt-10 mb-4 text-2xl font-semibold tracking-tight text-zinc-900',
  2: 'font-heading mt-8 mb-3 text-xl font-semibold tracking-tight text-zinc-900',
  3: 'font-heading mt-6 mb-2 text-base font-semibold text-zinc-900',
  4: 'mt-4 mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500',
};

function NodeView({ node, prefix, anchored }: { node: DocumentNode } & Addressing) {
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
        <p className="my-3 text-justify leading-relaxed text-zinc-800">
          <Runs runs={node.runs} prefix={prefix} anchored={anchored} />
        </p>
      );

    case 'list': {
      const Tag = node.ordered ? 'ol' : 'ul';
      return (
        <Tag
          className={`my-3 ml-6 space-y-1 text-zinc-800 ${node.ordered ? 'list-decimal' : 'list-disc'}`}
        >
          {node.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              <Runs runs={item} prefix={[...prefix, i]} anchored={anchored} />
            </li>
          ))}
        </Tag>
      );
    }

    case 'table':
      return (
        <figure className="my-5">
          {node.caption && (
            <figcaption className="mb-2 text-sm font-medium text-zinc-900">{node.caption}</figcaption>
          )}
          {/* Wide tables scroll inside their own container, never the page */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm text-zinc-800">
              <thead>
                <tr className="border-y border-zinc-300 bg-zinc-50">
                  {node.headers.map((header, i) => (
                    <th
                      key={i}
                      className={`px-3 py-2 font-medium text-zinc-900 ${
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
                  <tr key={r} className="border-b border-zinc-200">
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
        <div className="my-6 rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500">
          Table of contents — generated on export
        </div>
      );

    case 'pageBreak':
      return <hr className="my-8 border-dashed border-zinc-300" />;
  }
}

export function DocumentView({ sections }: { sections: RenderedSection[] }) {
  const anchored = gapAnchorKeys(sections);

  return (
    <article className="text-[15px] text-zinc-800">
      {sections.map((section, s) => (
        // The section id is what a finding's "Holds up" link scrolls to. The
        // scroll margin keeps the heading off the top edge of the viewport.
        <section key={section.id} id={section.anchor} className="scroll-mt-6">
          {section.nodes.map((node, n) => (
            <NodeView key={n} node={node} prefix={[s, n]} anchored={anchored} />
          ))}
        </section>
      ))}
    </article>
  );
}
