CREATE TABLE `product_tag_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`min_items` integer DEFAULT 0,
	`max_items` integer DEFAULT 0,
	`active` integer DEFAULT 1,
	`sort_order` integer DEFAULT 0,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text
);
