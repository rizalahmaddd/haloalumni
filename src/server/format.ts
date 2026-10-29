import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const TIME_ZONE = 'Asia/Jakarta';

const dateLong = new Intl.DateTimeFormat('id-ID', {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const dateShort = new Intl.DateTimeFormat('id-ID', {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dateTime = new Intl.DateTimeFormat('id-ID', {
  timeZone: TIME_ZONE,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const timeOnly = new Intl.DateTimeFormat('id-ID', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export function formatDate(ms: number | null | undefined): string {
  if (!ms) return '-';
  return dateLong.format(new Date(ms));
}

export function formatDateShort(ms: number | null | undefined): string {
  if (!ms) return '-';
  return dateShort.format(new Date(ms));
}

export function formatDateTime(ms: number | null | undefined): string {
  if (!ms) return '-';
  return dateTime.format(new Date(ms));
}

export function formatTime(ms: number | null | undefined): string {
  if (!ms) return '-';
  return timeOnly.format(new Date(ms));
}

export function timeAgo(ms: number | null | undefined): string {
  if (!ms) return '-';
  return formatDistanceToNow(new Date(ms), { addSuffix: true, locale: localeId });
}

export function toDateTimeLocal(ms: number | null | undefined): string {
  if (!ms) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(ms));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';
  const hour = get('hour') === '24' ? '00' : get('hour');
  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`;
}

export function fromDateTimeLocal(value: string): number | null {
  if (!value) return null;
  const parsed = new Date(`${value}:00+07:00`).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}
