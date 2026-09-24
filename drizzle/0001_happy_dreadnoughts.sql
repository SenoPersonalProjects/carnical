CREATE INDEX `idx_characters_owner_updated` ON `characters` (`owner_id`,`updated_at`);
--> statement-breakpoint
PRAGMA optimize;
