import { describe, expect, it } from 'vitest';
import { optionalCheckbox, optionalText } from '../src/server/form-schema';

describe('optionalText', () => {
  it('mengubah null dan undefined menjadi string kosong', () => {
    expect(optionalText().parse(null)).toBe('');
    expect(optionalText().parse(undefined)).toBe('');
  });

  it('memangkas spasi dan membatasi panjang', () => {
    expect(optionalText(5).parse('  halo  ')).toBe('halo');
    expect(optionalText(5).safeParse('terlalu panjang').success).toBe(false);
  });
});

describe('optionalCheckbox', () => {
  it('menerima nilai tidak ada sebagai string kosong', () => {
    expect(optionalCheckbox.parse(null)).toBe('');
    expect(optionalCheckbox.parse('on')).toBe('on');
  });
});
