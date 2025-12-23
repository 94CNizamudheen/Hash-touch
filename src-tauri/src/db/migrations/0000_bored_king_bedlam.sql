CREATE TABLE `app_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`tenant_domain` text,
	`access_token` text,
	`selected_location_id` text,
	`brand_id` text,
	`order_mode_names` text DEFAULT '[]',
	`order_mode_ids` text DEFAULT '[]',
	`selected_order_mode_id` text,
	`selected_order_mode_name` text,
	`selected_location_name` text,
	`device_role` text,
	`sync_status` text DEFAULT 'IDLE',
	`theme` text DEFAULT 'light',
	`language` text DEFAULT 'en',
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `cart_draft` (
	`id` integer PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `product_group_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`product_group_id` text NOT NULL,
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
--> statement-breakpoint
CREATE TABLE `product_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text,
	`description` text,
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
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text,
	`description` text,
	`category_id` text,
	`price` real NOT NULL,
	`active` integer DEFAULT 1,
	`sort_order` integer DEFAULT 0,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	`media` text
);
--> statement-breakpoint
CREATE TABLE `work_shift_draft` (
	`id` integer PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated_at` text
);
