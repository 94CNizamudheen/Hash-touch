CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text,
	`active` integer DEFAULT 1,
	`sort_order` integer DEFAULT 0,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text,
	`media` text
);
