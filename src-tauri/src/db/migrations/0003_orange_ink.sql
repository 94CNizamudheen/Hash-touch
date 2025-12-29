CREATE TABLE `printers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`printer_type` text NOT NULL,
	`ip_address` text,
	`port` integer,
	`is_active` integer DEFAULT 0 NOT NULL,
	`created_at` text,
	`updated_at` text
);
