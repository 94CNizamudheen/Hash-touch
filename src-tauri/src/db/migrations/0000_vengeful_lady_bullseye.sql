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
	`kds_view_mode` text DEFAULT 'grid',
	`kds_settings` text DEFAULT '{}',
	`ws_server_mode` integer DEFAULT 0,
	`ws_server_url` text DEFAULT 'ws://localhost:9001',
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
CREATE TABLE `charge_mappings` (
	`id` text PRIMARY KEY NOT NULL,
	`charge_id` text NOT NULL,
	`category_id` text,
	`product_id` text,
	`product_group_id` text,
	`active` integer DEFAULT 1,
	`sort_order` integer DEFAULT 0,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `charges` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text,
	`name` text NOT NULL,
	`percentage` text,
	`is_tax` integer DEFAULT 0,
	`transaction_type_id` text,
	`parent_charge_id` text,
	`active` integer DEFAULT 1,
	`sort_order` integer DEFAULT 0,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text
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
CREATE TABLE `location` (
	`server_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT 1,
	`selected` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text,
	`name` text NOT NULL,
	`processor` text,
	`active` integer DEFAULT 1,
	`sort_order` integer DEFAULT 0,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
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
	`is_sold_out` integer DEFAULT 0,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	`media` text,
	`overrides` text
);
--> statement-breakpoint
CREATE TABLE `queue_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_id` text NOT NULL,
	`ticket_number` text NOT NULL,
	`token_number` integer NOT NULL,
	`status` text DEFAULT 'WAITING' NOT NULL,
	`source` text,
	`location_id` text,
	`order_mode` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`called_at` text,
	`served_at` text
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`ticket_data` text NOT NULL,
	`sync_status` text DEFAULT 'PENDING' NOT NULL,
	`sync_error` text,
	`sync_attempts` integer DEFAULT 0,
	`order_status` text DEFAULT 'PENDING',
	`location_id` text,
	`order_mode_name` text,
	`ticket_amount` integer,
	`items_count` integer,
	`queue_number` integer,
	`ticket_number` integer,
	`created_at` text,
	`updated_at` text,
	`synced_at` text
);
--> statement-breakpoint
CREATE TABLE `transaction_types` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text,
	`name` text NOT NULL,
	`active` integer DEFAULT 1,
	`sort_order` integer DEFAULT 0,
	`created_at` text,
	`updated_at` text,
	`deleted_at` text,
	`created_by` text,
	`updated_by` text,
	`deleted_by` text
);
--> statement-breakpoint
CREATE TABLE `workdays` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workday_id` text,
	`start_user` text,
	`end_user` text,
	`start_time` text,
	`end_time` text,
	`location_id` text NOT NULL,
	`total_sales` real,
	`total_taxes` real,
	`total_ticket_count` integer,
	`work_period_informations` text,
	`department_ticket_informations` text,
	`add_on` text,
	`auto_closed` integer,
	`external_processed` integer,
	`work_period_day` text,
	`business_date` text,
	`sync_status` text DEFAULT 'PENDING',
	`sync_error` text,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `work_shift_draft` (
	`id` integer PRIMARY KEY NOT NULL,
	`data` text NOT NULL,
	`updated_at` text
);
