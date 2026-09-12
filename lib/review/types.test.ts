import { describe, it, expect } from 'vitest';
import { parseRole } from './types';

describe('parseRole', () => {
  it('accepts a known role', () => {
    expect(parseRole('MERCHANT_BANKER')).toBe('MERCHANT_BANKER');
    expect(parseRole('CFO')).toBe('CFO');
  });

  it('defaults to Promoter for missing or unknown input', () => {
    expect(parseRole(undefined)).toBe('PROMOTER');
    expect(parseRole(null)).toBe('PROMOTER');
    expect(parseRole('')).toBe('PROMOTER');
    expect(parseRole('not-a-role')).toBe('PROMOTER');
  });
});
