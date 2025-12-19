CREATE TABLE `product_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`tag_group_id` text NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`price` real DEFAULT 0,
	`active` integer DEFAULT 1,
	`sort_order` integer DEFAULT 0,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text
);
