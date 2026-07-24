CREATE TABLE `quote_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`industry` text NOT NULL,
	`what_you_sell` text,
	`revenue_band` text NOT NULL,
	`selected_services` text NOT NULL,
	`project_total` integer NOT NULL,
	`monthly_total` integer NOT NULL,
	`resend_contact_id` text,
	`created_at` text NOT NULL
);
