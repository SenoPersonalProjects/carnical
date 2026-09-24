CREATE TABLE `characters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_id` text NOT NULL,
	`name` text DEFAULT 'Sem nome' NOT NULL,
	`concept` text DEFAULT '' NOT NULL,
	`clan` text DEFAULT '' NOT NULL,
	`sourcebook` text DEFAULT 'core_v5_ptbr' NOT NULL,
	`data` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
