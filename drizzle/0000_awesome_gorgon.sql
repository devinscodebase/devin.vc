CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`from_name` text NOT NULL,
	`from_email` text NOT NULL,
	`subject` text NOT NULL,
	`message` text,
	`metadata` text,
	`resend_email_id` text,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL,
	`read_at` text
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`first_name` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`resend_contact_id` text,
	`token` text NOT NULL,
	`subscribed_at` text NOT NULL,
	`confirmed_at` text,
	`unsubscribed_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);