import { describe, expect, it } from 'vitest';
import { slugify, uniqueSlug } from '../src/server/slug';
import { newCardToken, newToken } from '../src/server/util';

describe('slugify', () => {
  it('membuat slug dari nama dengan huruf beraksen', () => {
    expect(slugify('Rina Prátiwi')).toBe('rina-pratiwi');
  });

  it('membuang karakter yang tidak aman dan merapikan tanda hubung', () => {
    expect(slugify('  Teknik -- Informatika!!  ')).toBe('teknik-informatika');
  });

  it('memberi fallback untuk input kosong', () => {
    expect(slugify('***')).toBe('alumni');
  });
});

describe('uniqueSlug', () => {
  it('menambahkan sufiks sampai slug unik', async () => {
    const taken = new Set(['rina', 'rina-2']);
    await expect(uniqueSlug('Rina', async (candidate) => taken.has(candidate))).resolves.toBe('rina-3');
  });
});

describe('token', () => {
  it('kartu memakai 16 karakter tanpa huruf ambigu', () => {
    const token = newCardToken();
    expect(token).toHaveLength(16);
    expect(token).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/);
  });

  it('token sesi cukup panjang', () => {
    expect(newToken(40)).toHaveLength(40);
  });
});
