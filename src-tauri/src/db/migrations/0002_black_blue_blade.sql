CREATE TABLE `tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_data` text NOT NULL,
	`sync_status` text DEFAULT 'PENDING' NOT NULL,
	`sync_error` text,
	`sync_attempts` integer DEFAULT 0,
	`location_id` text,
	`order_mode_name` text,
	`ticket_amount` integer,
	`items_count` integer,
	`created_at` text,
	`updated_at` text,
	`synced_at` text
);
