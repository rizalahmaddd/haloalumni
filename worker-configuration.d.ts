/// <reference types="@cloudflare/workers-types" />

declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    MEDIA: R2Bucket;
    PRIVATE: R2Bucket;
    ASSETS: Fetcher;
    PUBLIC_SITE_URL: string;
    EMAIL_FROM: string;
    MEDIA_PUBLIC_URL?: string;
    SESSION_SECRET?: string;
    RESEND_API_KEY?: string;
    TURNSTILE_SECRET?: string;
    TURNSTILE_SITE_KEY?: string;
    ADMIN_EMAIL?: string;
  }
}
