ALTER TABLE "telegram_links" ADD COLUMN IF NOT EXISTS "telegram_user_id" text;
--> statement-breakpoint
ALTER TABLE "telegram_links" ADD COLUMN IF NOT EXISTS "telegram_username" text;
