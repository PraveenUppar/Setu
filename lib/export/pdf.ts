import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

/**
 * PDF export — a print of the DOCX, not a third renderer.
 *
 * The document has one AST and two renderers, HTML and DOCX, and the DOCX is
 * the deliverable (D7). A PDF produced by a third renderer would drift from
 * it the way the architecture note warns HTML and DOCX would have; a PDF
 * printed FROM the DOCX cannot. So this shells out to LibreOffice, which is
 * what the S11 verification used, and says plainly when it is not installed
 * rather than falling back to something that looks like the document and is
 * not.
 */

const run = promisify(execFile);

const WINDOWS_DEFAULT = 'C:\\Program Files\\LibreOffice\\program\\soffice.exe';

/** Where LibreOffice is, or null. `SETU_SOFFICE` wins; then PATH; then the Windows default. */
export function findSoffice(): string | null {
  const configured = process.env.SETU_SOFFICE;
  if (configured) return existsSync(configured) ? configured : null;
  if (process.platform === 'win32' && existsSync(WINDOWS_DEFAULT)) return WINDOWS_DEFAULT;
  // On PATH: let the shell resolve it. We cannot cheaply verify without
  // running it, so `soffice` is returned and the conversion reports failure.
  return process.platform === 'win32' ? null : 'soffice';
}

export class PdfUnavailableError extends Error {
  constructor() {
    super('PDF export needs LibreOffice. Install it, or set SETU_SOFFICE to the path of soffice.');
    this.name = 'PdfUnavailableError';
  }
}

/** Convert DOCX bytes to PDF bytes through LibreOffice, in a temporary directory. */
export async function docxToPdf(docx: Buffer, basename = 'document'): Promise<Buffer> {
  const soffice = findSoffice();
  if (!soffice) throw new PdfUnavailableError();

  const dir = await mkdtemp(join(tmpdir(), 'setu-pdf-'));
  try {
    const input = join(dir, `${basename}.docx`);
    await writeFile(input, docx);
    // A private profile directory keeps a running desktop LibreOffice from
    // swallowing the request, and lets two conversions run at once.
    const profile = `file:///${join(dir, 'profile').replace(/\\/g, '/')}`;
    await run(
      soffice,
      ['--headless', `-env:UserInstallation=${profile}`, '--convert-to', 'pdf', '--outdir', dir, input],
      { timeout: 120_000, windowsHide: true },
    );
    return await readFile(join(dir, `${basename}.pdf`));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
