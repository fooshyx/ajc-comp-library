CREATE TABLE "compositions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"added_by" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"units" jsonb NOT NULL,
	"rating" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "compositions" ADD CONSTRAINT "compositions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;