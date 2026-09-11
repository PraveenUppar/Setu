import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/**
 * D14: every LLM result is snapshotted to `fixtures/` before anything
 * downstream touches it. Extract once, save the JSON, iterate against the
 * fixture — the difference between one call per issuer/section and one call
 * per test run, and it makes the tests deterministic (D14 rules out tests
 * that call the API at all).
 *
 * Callers choose the path so it reads as data, not as a cache:
 * `fixtures/extractions/<issuer>/<domain>.json`,
 * `fixtures/narrative/<issuer>/<sectionId>.json`,
 * `fixtures/risk/<issuer>/<archetypeId>.json`.
 */
export function snapshotResponse(relativePath: string, response: { raw: string; [k: string]: unknown }): string {
  const path = join('fixtures', relativePath);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(response, null, 2));
  return path;
}
