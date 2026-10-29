import { sqliteTable, text, integer, index, uniqueIndex, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

const ts = (name: string) => integer(name);

export const users = sqliteTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull().unique(),
    role: text('role', { enum: ['alumni', 'editor', 'admin'] }).notNull().default('alumni'),
    status: text('status', { enum: ['pending', 'active', 'suspended'] }).notNull().default('pending'),
    emailVerifiedAt: ts('email_verified_at'),
    lastLoginAt: ts('last_login_at'),
    createdAt: ts('created_at').notNull(),
    updatedAt: ts('updated_at').notNull(),
  },
  (t) => [index('users_role_idx').on(t.role), index('users_status_idx').on(t.status)],
);

export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    expiresAt: ts('expires_at').notNull(),
    ipHash: text('ip_hash'),
    userAgent: text('user_agent'),
    createdAt: ts('created_at').notNull(),
  },
  (t) => [index('sessions_user_idx').on(t.userId), index('sessions_expires_idx').on(t.expiresAt)],
);

export const magicLinks = sqliteTable(
  'magic_links',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: ts('expires_at').notNull(),
    usedAt: ts('used_at'),
    createdAt: ts('created_at').notNull(),
  },
  (t) => [index('magic_links_user_idx').on(t.userId)],
);

export const alumniProfiles = sqliteTable(
  'alumni_profiles',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    slug: text('slug').notNull().unique(),
    fullName: text('full_name').notNull(),
    angkatan: integer('angkatan').notNull(),
    program: text('program'),
    nim: text('nim'),
    photoKey: text('photo_key'),
    thumbKey: text('thumb_key'),
    city: text('city'),
    province: text('province'),
    country: text('country').default('Indonesia'),
    company: text('company'),
    jobTitle: text('job_title'),
    industry: text('industry'),
    bio: text('bio'),
    linkedinUrl: text('linkedin_url'),
    instagramUrl: text('instagram_url'),
    websiteUrl: text('website_url'),
    phone: text('phone'),
    whatsapp: text('whatsapp'),
    showEmail: integer('show_email', { mode: 'boolean' }).notNull().default(false),
    showPhone: integer('show_phone', { mode: 'boolean' }).notNull().default(false),
    showWorkplace: integer('show_workplace', { mode: 'boolean' }).notNull().default(true),
    directoryVisible: integer('directory_visible', { mode: 'boolean' }).notNull().default(true),
    status: text('status', { enum: ['draft', 'published', 'hidden'] }).notNull().default('draft'),
    cardNo: text('card_no').unique(),
    cardToken: text('card_token').unique(),
    verifiedAt: ts('verified_at'),
    createdAt: ts('created_at').notNull(),
    updatedAt: ts('updated_at').notNull(),
  },
  (t) => [
    index('profiles_angkatan_idx').on(t.angkatan),
    index('profiles_program_idx').on(t.program),
    index('profiles_city_idx').on(t.city),
    index('profiles_industry_idx').on(t.industry),
    index('profiles_company_idx').on(t.company),
    index('profiles_name_idx').on(t.fullName),
    index('profiles_visibility_idx').on(t.status, t.directoryVisible),
  ],
);

export const jobs = sqliteTable(
  'jobs',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    company: text('company').notNull(),
    companyLogoKey: text('company_logo_key'),
    location: text('location'),
    workMode: text('work_mode', { enum: ['onsite', 'hybrid', 'remote'] }).notNull().default('onsite'),
    employmentType: text('employment_type', {
      enum: ['full', 'part', 'contract', 'internship', 'freelance'],
    })
      .notNull()
      .default('full'),
    category: text('category'),
    descriptionMd: text('description_md').notNull(),
    descriptionHtml: text('description_html').notNull(),
    salaryMin: integer('salary_min'),
    salaryMax: integer('salary_max'),
    applyUrl: text('apply_url'),
    contactEmail: text('contact_email'),
    submittedByUserId: text('submitted_by_user_id').references(() => users.id, { onDelete: 'set null' }),
    submitterName: text('submitter_name'),
    submitterEmail: text('submitter_email'),
    status: text('status', { enum: ['draft', 'pending', 'published', 'rejected', 'expired'] })
      .notNull()
      .default('pending'),
    featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
    moderatorNote: text('moderator_note'),
    expiresAt: ts('expires_at'),
    publishedAt: ts('published_at'),
    createdAt: ts('created_at').notNull(),
    updatedAt: ts('updated_at').notNull(),
  },
  (t) => [
    index('jobs_status_idx').on(t.status, t.publishedAt),
    index('jobs_expires_idx').on(t.expiresAt),
    index('jobs_category_idx').on(t.category),
    index('jobs_location_idx').on(t.location),
  ],
);

export const jobBookmarks = sqliteTable(
  'job_bookmarks',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    jobId: text('job_id')
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),
    createdAt: ts('created_at').notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.jobId] })],
);

export const posts = sqliteTable(
  'posts',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    excerpt: text('excerpt'),
    coverKey: text('cover_key'),
    category: text('category'),
    contentMd: text('content_md').notNull(),
    contentHtml: text('content_html').notNull(),
    status: text('status', { enum: ['draft', 'published'] }).notNull().default('draft'),
    authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
    publishedAt: ts('published_at'),
    createdAt: ts('created_at').notNull(),
    updatedAt: ts('updated_at').notNull(),
  },
  (t) => [index('posts_status_idx').on(t.status, t.publishedAt)],
);

export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  contentMd: text('content_md').notNull(),
  contentHtml: text('content_html').notNull(),
  status: text('status', { enum: ['draft', 'published'] }).notNull().default('published'),
  showInFooter: integer('show_in_footer', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: ts('updated_at').notNull(),
});

export const events = sqliteTable(
  'events',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    descriptionMd: text('description_md').notNull(),
    descriptionHtml: text('description_html').notNull(),
    coverKey: text('cover_key'),
    location: text('location'),
    mode: text('mode', { enum: ['offline', 'online', 'hybrid'] }).notNull().default('offline'),
    startsAt: ts('starts_at').notNull(),
    endsAt: ts('ends_at'),
    registrationClosesAt: ts('registration_closes_at'),
    capacity: integer('capacity'),
    status: text('status', { enum: ['draft', 'published', 'cancelled', 'done'] })
      .notNull()
      .default('draft'),
    createdAt: ts('created_at').notNull(),
    updatedAt: ts('updated_at').notNull(),
  },
  (t) => [index('events_status_idx').on(t.status, t.startsAt)],
);

export const eventRegistrations = sqliteTable(
  'event_registrations',
  {
    id: text('id').primaryKey(),
    eventId: text('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    guests: integer('guests').notNull().default(0),
    note: text('note'),
    status: text('status', { enum: ['registered', 'waitlist', 'cancelled', 'attended'] })
      .notNull()
      .default('registered'),
    createdAt: ts('created_at').notNull(),
  },
  (t) => [
    uniqueIndex('event_registrations_unique_idx').on(t.eventId, t.userId),
    index('event_registrations_status_idx').on(t.eventId, t.status),
  ],
);

export const donationCampaigns = sqliteTable(
  'donation_campaigns',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    descriptionMd: text('description_md').notNull(),
    descriptionHtml: text('description_html').notNull(),
    coverKey: text('cover_key'),
    targetAmount: integer('target_amount').notNull().default(0),
    bankInfo: text('bank_info'),
    deadline: ts('deadline'),
    status: text('status', { enum: ['draft', 'active', 'closed'] }).notNull().default('draft'),
    createdAt: ts('created_at').notNull(),
    updatedAt: ts('updated_at').notNull(),
  },
  (t) => [index('campaigns_status_idx').on(t.status, t.deadline)],
);

export const donations = sqliteTable(
  'donations',
  {
    id: text('id').primaryKey(),
    campaignId: text('campaign_id')
      .notNull()
      .references(() => donationCampaigns.id, { onDelete: 'cascade' }),
    donorName: text('donor_name').notNull(),
    donorEmail: text('donor_email'),
    donorUserId: text('donor_user_id').references(() => users.id, { onDelete: 'set null' }),
    amount: integer('amount').notNull(),
    transferDate: text('transfer_date'),
    proofKey: text('proof_key'),
    message: text('message'),
    isAnonymous: integer('is_anonymous', { mode: 'boolean' }).notNull().default(false),
    status: text('status', { enum: ['pending', 'verified', 'rejected'] }).notNull().default('pending'),
    verifiedBy: text('verified_by').references(() => users.id, { onDelete: 'set null' }),
    verifiedAt: ts('verified_at'),
    createdAt: ts('created_at').notNull(),
  },
  (t) => [
    index('donations_campaign_idx').on(t.campaignId, t.status),
    index('donations_status_idx').on(t.status, t.createdAt),
  ],
);

export const media = sqliteTable(
  'media',
  {
    id: text('id').primaryKey(),
    key: text('key').notNull().unique(),
    bucket: text('bucket', { enum: ['media', 'private'] }).notNull().default('media'),
    filename: text('filename').notNull(),
    mime: text('mime').notNull(),
    size: integer('size').notNull(),
    width: integer('width'),
    height: integer('height'),
    alt: text('alt'),
    uploadedBy: text('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: ts('created_at').notNull(),
  },
  (t) => [index('media_created_idx').on(t.createdAt)],
);

export const contactMessages = sqliteTable(
  'contact_messages',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    subject: text('subject'),
    message: text('message').notNull(),
    toUserId: text('to_user_id').references(() => users.id, { onDelete: 'set null' }),
    ipHash: text('ip_hash'),
    status: text('status', { enum: ['new', 'read', 'replied', 'spam'] }).notNull().default('new'),
    createdAt: ts('created_at').notNull(),
  },
  (t) => [index('contact_status_idx').on(t.status, t.createdAt)],
);

export const rateLimits = sqliteTable('rate_limits', {
  key: text('key').primaryKey(),
  windowStart: integer('window_start').notNull(),
  count: integer('count').notNull(),
});

export const auditLogs = sqliteTable(
  'audit_logs',
  {
    id: text('id').primaryKey(),
    actorId: text('actor_id').references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(),
    entityType: text('entity_type'),
    entityId: text('entity_id'),
    meta: text('meta'),
    createdAt: ts('created_at').notNull(),
  },
  (t) => [index('audit_created_idx').on(t.createdAt)],
);

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: ts('updated_at').notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(alumniProfiles, { fields: [users.id], references: [alumniProfiles.userId] }),
  sessions: many(sessions),
}));

export const profilesRelations = relations(alumniProfiles, ({ one }) => ({
  user: one(users, { fields: [alumniProfiles.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type AlumniProfile = typeof alumniProfiles.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Page = typeof pages.$inferSelect;
export type AlumnusEvent = typeof events.$inferSelect;
export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type DonationCampaign = typeof donationCampaigns.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type MediaItem = typeof media.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type SettingRow = typeof settings.$inferSelect;
