CREATE TABLE `device_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`config` text,
	`sync_status` text DEFAULT 'PENDING',
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP,
	`last_sync_at` integer
);
--> statement-breakpoint
CREATE TABLE `location` (
	`server_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT 1,
	`selected` integer DEFAULT 0
);
