import { z } from 'zod';

/**
 * Astro's form action parser turns empty fields into `null`. These helpers
 * coerce null/undefined back to an empty string so optional text fields can
 * keep their normal `string` type inside handlers.
 */
export function optionalText(max = 300) {
  return z.preprocess((value) => (value == null ? '' : value), z.string().trim().max(max));
}

export const optionalCheckbox = z.preprocess(
  (value) => (value == null ? '' : value),
  z.string(),
);
