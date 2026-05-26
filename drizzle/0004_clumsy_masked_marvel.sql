CREATE TABLE `training_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`asset_slug` text NOT NULL,
	`asset_title` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text NOT NULL,
	`job_title` text NOT NULL,
	`resend_contact_id` text,
	`created_at` text NOT NULL
);
