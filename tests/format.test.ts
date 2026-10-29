import { describe, expect, it } from 'vitest';
import { formatDate, formatTime, fromDateTimeLocal, toDateTimeLocal } from '../src/server/format';

const EVENT_START = 1794794400000; // 2026-11-16 09:00 WIB

describe('format tanggal WIB', () => {
  it('menampilkan tanggal dalam zona Asia/Jakarta', () => {
    expect(formatDate(EVENT_START)).toBe('16 November 2026');
    expect(formatTime(EVENT_START)).toBe('09.00');
  });

  it('bolak-balik datetime-local memakai WIB', () => {
    expect(toDateTimeLocal(EVENT_START)).toBe('2026-11-16T09:00');
    expect(fromDateTimeLocal('2026-11-16T09:00')).toBe(EVENT_START);
  });
});
