import { assemble } from '@/lib/export/bundle';
import { buildGapReport, gapReportFilename } from '@/lib/export/gap-report';

export const dynamic = 'force-dynamic';

/** GET /export/gaps — the findings, placeholders and provenance as a workbook. */
export async function GET() {
  const a = assemble();
  const bytes = await buildGapReport(a);

  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${gapReportFilename(a.facts, a.version)}"`,
      'Content-Length': String(bytes.byteLength),
      'Cache-Control': 'no-store',
    },
  });
}
