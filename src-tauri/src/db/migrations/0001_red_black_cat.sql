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
