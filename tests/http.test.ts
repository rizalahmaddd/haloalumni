import { describe, expect, it } from 'vitest';
import { withParams } from '../src/server/http';
import { formatRupiah, stripMarkdown, truncate } from '../src/server/util';

describe('withParams', () => {
  it('membangun URL dengan parameter yang tidak kosong', () => {
    expect(withParams('/masuk', { sukses: 'Terkirim', error: '' })).toBe(
      '/masuk?sukses=Terkirim',
    );
  });

  it('mengembalikan path tanpa query jika semua kosong', () => {
    expect(withParams('/direktori', { q: '', page: undefined })).toBe('/direktori');
  });
});

describe('format', () => {
  it('memformat rupiah tanpa desimal', () => {
    expect(formatRupiah(2500000)).toContain('2.500.000');
  });

  it('memotong teks panjang', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcd…');
  });

  it('membuang sintaks markdown untuk ringkasan', () => {
    expect(stripMarkdown('## Judul\n\n**Tebal** dan [tautan](https://x)')).toContain('Tebal');
    expect(stripMarkdown('**Tebal**')).not.toContain('**');
  });
});
