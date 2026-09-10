/**
 * The anchor vocabulary that ties the gap list to the document.
 *
 * A finding and the text it is about are produced by two different engines and
 * rendered in two different places on the page. They agree on where to point
 * only because both compute the id from the same identifier here — a section
 * spec id, a fact path, a rule id — rather than each inventing its own.
 *
 * These are DOM ids today and DOCX bookmarks later, so they stay conservative:
 * lowercase, alphanumeric and hyphens only. The three prefixes keep the
 * namespaces apart, which matters because a completeness rule id embeds the
 * fact path it came from ("CM-company.website"), and without the prefixes the
 * gap and its finding would slug to the same string.
 */

export function slug(value: string): string {
  return value
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/** Where a section starts. The target of "Holds up: Issue Structure". */
export const sectionAnchor = (sectionId: string): string => `sec-${slug(sectionId)}`;

/**
 * The highlighted placeholder itself, on its first occurrence in the document.
 * A gap the issuer can see is doing its job; landing them at the top of a
 * 30-page section and leaving them to find the highlight is not much better
 * than hiding it.
 */
export const gapAnchor = (factPath: string): string => `gap-${slug(factPath)}`;

/** A finding card in the dashboard. The target of the link on a placeholder. */
export const findingAnchor = (ruleId: string): string => `finding-${slug(ruleId)}`;
