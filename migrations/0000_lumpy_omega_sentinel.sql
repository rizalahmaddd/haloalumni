CREATE TABLE `alumni_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`slug` text NOT NULL,
	`full_name` text NOT NULL,
	`angkatan` integer NOT NULL,
	`program` text,
	`nim` text,
	`photo_key` text,
	`thumb_key` text,
	`city` text,
	`province` text,
	`country` text DEFAULT 'Indonesia',
	`company` text,
	`job_title` text,
	`industry` text,
	`bio` text,
	`linkedin_url` text,
	`instagram_url` text,
	`website_url` text,
	`phone` text,
	`whatsapp` text,
	`show_email` integer DEFAULT false NOT NULL,
	`show_phone` integer DEFAULT false NOT NULL,
	`show_workplace` integer DEFAULT true NOT NULL,
	`directory_visible` integer DEFAULT true NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`card_no` text,
	`card_token` text,
	`verified_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alumni_profiles_user_id_unique` ON `alumni_profiles` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `alumni_profiles_slug_unique` ON `alumni_profiles` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `alumni_profiles_card_no_unique` ON `alumni_profiles` (`card_no`);--> statement-breakpoint
CREATE UNIQUE INDEX `alumni_profiles_card_token_unique` ON `alumni_profiles` (`card_token`);--> statement-breakpoint
CREATE INDEX `profiles_angkatan_idx` ON `alumni_profiles` (`angkatan`);--> statement-breakpoint
CREATE INDEX `profiles_program_idx` ON `alumni_profiles` (`program`);--> statement-breakpoint
CREATE INDEX `profiles_city_idx` ON `alumni_profiles` (`city`);--> statement-breakpoint
CREATE INDEX `profiles_industry_idx` ON `alumni_profiles` (`industry`);--> statement-breakpoint
CREATE INDEX `profiles_company_idx` ON `alumni_profiles` (`company`);--> statement-breakpoint
CREATE INDEX `profiles_name_idx` ON `alumni_profiles` (`full_name`);--> statement-breakpoint
CREATE INDEX `profiles_visibility_idx` ON `alumni_profiles` (`status`,`directory_visible`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`entity_type` text,
	`entity_id` text,
	`meta` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text,
	`message` text NOT NULL,
	`to_user_id` text,
	`ip_hash` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `contact_status_idx` ON `contact_messages` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `donation_campaigns` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description_md` text NOT NULL,
	`description_html` text NOT NULL,
	`cover_key` text,
	`target_amount` integer DEFAULT 0 NOT NULL,
	`bank_info` text,
	`deadline` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `donation_campaigns_slug_unique` ON `donation_campaigns` (`slug`);--> statement-breakpoint
CREATE INDEX `campaigns_status_idx` ON `donation_campaigns` (`status`,`deadline`);--> statement-breakpoint
CREATE TABLE `donations` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`donor_name` text NOT NULL,
	`donor_user_id` text,
	`amount` integer NOT NULL,
	`transfer_date` text,
	`proof_key` text,
	`message` text,
	`is_anonymous` integer DEFAULT false NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`verified_by` text,
	`verified_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `donation_campaigns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`donor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `donations_campaign_idx` ON `donations` (`campaign_id`,`status`);--> statement-breakpoint
CREATE INDEX `donations_status_idx` ON `donations` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `event_registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`guests` integer DEFAULT 0 NOT NULL,
	`note` text,
	`status` text DEFAULT 'registered' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `event_registrations_unique_idx` ON `event_registrations` (`event_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `event_registrations_status_idx` ON `event_registrations` (`event_id`,`status`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description_md` text NOT NULL,
	`description_html` text NOT NULL,
	`cover_key` text,
	`location` text,
	`mode` text DEFAULT 'offline' NOT NULL,
	`starts_at` integer NOT NULL,
	`ends_at` integer,
	`registration_closes_at` integer,
	`capacity` integer,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);--> statement-breakpoint
CREATE INDEX `events_status_idx` ON `events` (`status`,`starts_at`);--> statement-breakpoint
CREATE TABLE `job_bookmarks` (
	`user_id` text NOT NULL,
	`job_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `job_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`company` text NOT NULL,
	`company_logo_key` text,
	`location` text,
	`work_mode` text DEFAULT 'onsite' NOT NULL,
	`employment_type` text DEFAULT 'full' NOT NULL,
	`category` text,
	`description_md` text NOT NULL,
	`description_html` text NOT NULL,
	`salary_min` integer,
	`salary_max` integer,
	`apply_url` text,
	`contact_email` text,
	`submitted_by_user_id` text,
	`submitter_name` text,
	`submitter_email` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`moderator_note` text,
	`expires_at` integer,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`submitted_by_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `jobs_slug_unique` ON `jobs` (`slug`);--> statement-breakpoint
CREATE INDEX `jobs_status_idx` ON `jobs` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `jobs_expires_idx` ON `jobs` (`expires_at`);--> statement-breakpoint
CREATE INDEX `jobs_category_idx` ON `jobs` (`category`);--> statement-breakpoint
CREATE INDEX `jobs_location_idx` ON `jobs` (`location`);--> statement-breakpoint
CREATE TABLE `magic_links` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`used_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `magic_links_token_hash_unique` ON `magic_links` (`token_hash`);--> statement-breakpoint
CREATE INDEX `magic_links_user_idx` ON `magic_links` (`user_id`);--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`bucket` text DEFAULT 'media' NOT NULL,
	`filename` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`width` integer,
	`height` integer,
	`alt` text,
	`uploaded_by` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_key_unique` ON `media` (`key`);--> statement-breakpoint
CREATE INDEX `media_created_idx` ON `media` (`created_at`);--> statement-breakpoint
CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`content_md` text NOT NULL,
	`content_html` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`show_in_footer` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text,
	`cover_key` text,
	`category` text,
	`content_md` text NOT NULL,
	`content_html` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`author_id` text,
	`published_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE INDEX `posts_status_idx` ON `posts` (`status`,`published_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`window_start` integer NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	`ip_hash` text,
	`user_agent` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_user_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `sessions_expires_idx` ON `sessions` (`expires_at`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'alumni' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`email_verified_at` integer,
	`last_login_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_status_idx` ON `users` (`status`);