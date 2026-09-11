import { assemble, buildVault } from '@/lib/export/bundle';

export const dynamic = 'force-dynamic';

/**
 * GET /export/vault — the document and its working papers as one archive:
 * DOCX, PDF where LibreOffice is available, the gap report, the fact base
 * and the provenance map, with a manifest. See lib/export/bundle.
 */
export async function GET() {
  const { zip, filename, pdfOmitted } = await buildVault(assemble());

  return new Response(new Uint8Array(zip), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(zip.byteLength),
      'Cache-Control': 'no-store',
      // A header the browser ignores and a curl user can see; the manifest says the same
      ...(pdfOmitted ? { 'X-Setu-Pdf-Omitted': pdfOmitted } : {}),
    },
  });
}
