import { docxFilename, renderDocx } from '@/lib/document/docx';
import { renderSections } from '@/lib/document/section';
import { sectionRegistry } from '@/lib/document/sections';
import { loadIssuer } from '@/lib/issuer';

export const dynamic = 'force-dynamic';

/**
 * GET /export/docx — the document as it stands, as a Word file.
 *
 * Renders the same sections the preview page renders, from the same loaded
 * issuer, so what downloads is what was on screen. There is no parameter to
 * lift the watermark: certification is an action the merchant banker takes
 * in the review workflow (S12), not a query string anyone can add.
 */
export async function GET() {
  const { facts, version } = loadIssuer();
  const sections = renderSections(sectionRegistry, { facts });
  const options = { facts, version, certified: false };

  const bytes = await renderDocx(sections, options);

  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${docxFilename(facts, options)}"`,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'no-store',
    },
  });
}
