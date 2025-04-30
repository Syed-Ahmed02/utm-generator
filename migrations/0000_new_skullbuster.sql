CREATE TABLE "campaigns" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaigns_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "utm_mediums" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "utm_mediums_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "utm_sources" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "utm_sources_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "utm_urls" (
	"id" integer PRIMARY KEY NOT NULL,
	"base_url" text NOT NULL,
	"source_id" integer NOT NULL,
	"medium_id" integer,
	"campaign_id" integer,
	"content" varchar(255),
	"generated_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "utm_urls" ADD CONSTRAINT "utm_urls_source_id_utm_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."utm_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utm_urls" ADD CONSTRAINT "utm_urls_medium_id_utm_mediums_id_fk" FOREIGN KEY ("medium_id") REFERENCES "public"."utm_mediums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "utm_urls" ADD CONSTRAINT "utm_urls_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE no action ON UPDATE no action;