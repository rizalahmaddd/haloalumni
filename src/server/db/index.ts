import { env } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

export function getDb() {
  return drizzle(env.DB, { schema });
}

export function getD1() {
  return env.DB;
}

export function getBuckets() {
  return { media: env.MEDIA, private: env.PRIVATE };
}

export { schema };
export * from './schema';
