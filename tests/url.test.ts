import { describe, expect, it } from 'vitest';
import { normalizeHttpUrl, safeRedirectPath, sanitizeSearchTerm } from '../src/server/url';

describe('normalizeHttpUrl', () => {
  it('accepts http and https URLs', () => {
    expect(normalizeHttpUrl('https://example.com/lowongan')).toBe('https://example.com/lowongan');
    expect(normalizeHttpUrl('http://example.com')).toBe('http://example.com/');
  });

  it('rejects javascript, data, and protocol-relative URLs', () => {
    expect(normalizeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeHttpUrl('data:text/html,hi')).toBeNull();
    expect(normalizeHttpUrl('//evil.com')).toBeNull();
    expect(normalizeHttpUrl('not a url')).toBeNull();
  });

  it('allows mailto only when requested', () => {
    expect(normalizeHttpUrl('mailto:hr@example.com', { allowMailto: true })).toBe('mailto:hr@example.com');
    expect(normalizeHttpUrl('mailto:hr@example.com')).toBeNull();
  });

  it('returns null for empty values', () => {
    expect(normalizeHttpUrl('')).toBeNull();
    expect(normalizeHttpUrl(null)).toBeNull();
  });
});

describe('safeRedirectPath', () => {
  it('keeps same-origin absolute paths', () => {
    expect(safeRedirectPath('/akun/profil')).toBe('/akun/profil');
    expect(safeRedirectPath('/direktori/rina-pratiwi?tab=karier')).toBe('/direktori/rina-pratiwi?tab=karier');
  });

  it('rejects open redirects and absolute URLs', () => {
    expect(safeRedirectPath('//evil.com')).toBe('/');
    expect(safeRedirectPath('https://evil.com')).toBe('/');
    expect(safeRedirectPath('/\\evil.com')).toBe('/');
    expect(safeRedirectPath(null, '/akun')).toBe('/akun');
  });
});

describe('sanitizeSearchTerm', () => {
  it('strips LIKE wildcards and escapes', () => {
    expect(sanitizeSearchTerm(' 100%_alumni\\ ')).toBe('100alumni');
    expect(sanitizeSearchTerm(null)).toBe('');
  });
});
