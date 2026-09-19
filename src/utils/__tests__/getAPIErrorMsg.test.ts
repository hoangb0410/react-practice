import { describe, expect, it } from 'vitest';
import { getAPIErrorMsg } from '../getAPIErrorMsg';

describe('getAPIErrorMsg', () => {
  it('returns null for nullish input', () => {
    expect(getAPIErrorMsg(null)).toBeNull();
    expect(getAPIErrorMsg(undefined)).toBeNull();
  });

  it('returns string errors directly', () => {
    expect(getAPIErrorMsg({ errors: 'boom' })).toBe('boom');
  });

  it('extracts first message from errors object', () => {
    expect(getAPIErrorMsg({ errors: { email: 'is required' } })).toBe(
      'is required'
    );
  });

  it('extracts first message from array under a field', () => {
    expect(getAPIErrorMsg({ errors: { email: ['invalid', 'taken'] } })).toBe(
      'invalid'
    );
  });

  it('falls back to top-level message', () => {
    expect(getAPIErrorMsg({ message: 'fallback' })).toBe('fallback');
  });

  it('handles data field instead of errors', () => {
    expect(getAPIErrorMsg({ data: { email: 'bad' } })).toBe('bad');
  });
});
