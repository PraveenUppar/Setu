import { describe, it, expect } from 'vitest';
import { formatTimestamp } from './timestamp';

describe('formatTimestamp', () => {
  it('formats in a fixed locale and timezone, regardless of the running environment', () => {
    // UTC midnight is 05:30 IST the same calendar day.
    expect(formatTimestamp('2026-09-12T00:00:00.000Z')).toBe('12 Sept 2026, 5:30 am');
  });

  it('is deterministic for the same instant', () => {
    const iso = '2026-01-01T18:45:00.000Z';
    expect(formatTimestamp(iso)).toBe(formatTimestamp(iso));
  });
});
