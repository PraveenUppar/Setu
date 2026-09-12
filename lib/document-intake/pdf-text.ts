import { getDocumentProxy, extractText } from 'unpdf';

/**
 * The text layer of an uploaded PDF, one string per page.
 *
 * `unpdf` ships a serverless build of Mozilla's PDF.js with no native
 * dependency — the corpus work this session shelled out to `pdftotext`
 * (D0's gotcha: "pdftotext to a file, then node, beats shell pipelines"),
 * which is fine on a machine that has it installed and wrong for a Next.js
 * route that might run anywhere. `mergePages: false` keeps the page
 * boundaries, which two-pass targeting (`page-targeting.ts`) needs.
 */
export async function pdfPageTexts(bytes: Uint8Array): Promise<string[]> {
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: false });
  return text;
}
