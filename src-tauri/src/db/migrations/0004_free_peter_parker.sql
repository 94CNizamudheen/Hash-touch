CREATE TABLE `kds_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_number` text NOT NULL,
	`order_id` text,
	`location_id` text,
	`order_mode_name` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`items` text NOT NULL,
	`total_amount` integer,
	`token_number` integer,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE `app_state` ADD `kds_view_mode` text DEFAULT 'grid';--> statement-breakpoint
ALTER TABLE `app_state` ADD `kds_settings` text DEFAULT '{}';