import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { addComment, resolveComment, readThread } from './comment-store';

describe('the comment store', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'setu-comment-store-'));
    process.env.SETU_DATA_DIR = dir;
  });

  afterEach(() => {
    delete process.env.SETU_DATA_DIR;
    rmSync(dir, { recursive: true, force: true });
  });

  it('is empty for a section with no comments', () => {
    expect(readThread('aboutCompany.ourBusiness')).toEqual([]);
  });

  it('posts a comment, unresolved by default', () => {
    const c = addComment('aboutCompany.ourBusiness', 'MERCHANT_BANKER', 'The revenue figure needs a source.');
    expect(c.resolved).toBe(false);

    const thread = readThread('aboutCompany.ourBusiness');
    expect(thread).toHaveLength(1);
    expect(thread[0].text).toContain('needs a source');
  });

  it('resolving is a new event, not an edit of the original post', () => {
    const c = addComment('aboutCompany.ourBusiness', 'MERCHANT_BANKER', 'Fix the date.');
    resolveComment('aboutCompany.ourBusiness', c.id, true);

    const thread = readThread('aboutCompany.ourBusiness');
    expect(thread).toHaveLength(1); // still one comment, latest revision
    expect(thread[0].resolved).toBe(true);
    expect(thread[0].text).toBe('Fix the date.');
  });

  it('reopening a resolved comment does not move it in the thread order', () => {
    const first = addComment('aboutCompany.ourBusiness', 'CFO', 'First comment.');
    addComment('aboutCompany.ourBusiness', 'CFO', 'Second comment.');
    resolveComment('aboutCompany.ourBusiness', first.id, true);
    resolveComment('aboutCompany.ourBusiness', first.id, false);

    const thread = readThread('aboutCompany.ourBusiness');
    expect(thread.map((c) => c.text)).toEqual(['First comment.', 'Second comment.']);
    expect(thread[0].resolved).toBe(false);
  });

  it('keeps threads on different sections apart', () => {
    addComment('aboutCompany.ourBusiness', 'CFO', 'On Our Business.');
    addComment('general.riskFactors', 'LEGAL', 'On Risk Factors.');

    expect(readThread('aboutCompany.ourBusiness')).toHaveLength(1);
    expect(readThread('general.riskFactors')).toHaveLength(1);
  });

  it('resolving an unknown comment id is a no-op, not a crash', () => {
    expect(resolveComment('aboutCompany.ourBusiness', 'does-not-exist', true)).toBeNull();
  });
});
