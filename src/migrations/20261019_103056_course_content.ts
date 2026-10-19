import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_courses_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum_courses_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__courses_v_version_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "public"."enum__courses_v_published_locale" AS ENUM('en', 'es', 'ca');
  CREATE TYPE "public"."enum__courses_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_lessons_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__lessons_v_published_locale" AS ENUM('en', 'es', 'ca');
  CREATE TYPE "public"."enum__lessons_v_version_status" AS ENUM('draft', 'published');
  CREATE TABLE "courses_outcomes" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "courses_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "courses_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "courses_modules_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "courses" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"cover_id" uuid,
  	"slug" varchar,
  	"level" "enum_courses_level",
  	"category_id" uuid,
  	"featured" boolean DEFAULT false,
  	"enrollment_count" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "courses_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"description" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" uuid,
  	"first_published_at" timestamp(3) with time zone,
  	"_status" "enum_courses_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "courses_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"lessons_id" uuid,
  	"instructors_id" uuid,
  	"admins_id" uuid
  );
  
  CREATE TABLE "_courses_v_version_outcomes" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_courses_v_version_requirements" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_courses_v_version_modules" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_courses_v_version_modules_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_courses_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_cover_id" uuid,
  	"version_slug" varchar,
  	"version_level" "enum__courses_v_version_level",
  	"version_category_id" uuid,
  	"version_featured" boolean DEFAULT false,
  	"version_enrollment_count" numeric DEFAULT 0,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"published_locale" "enum__courses_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_courses_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_description" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" uuid,
  	"version_first_published_at" timestamp(3) with time zone,
  	"version__status" "enum__courses_v_version_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_courses_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"lessons_id" uuid,
  	"instructors_id" uuid,
  	"admins_id" uuid
  );
  
  CREATE TABLE "lessons" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"slug" varchar,
  	"course_id" uuid,
  	"free_preview" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "lessons_locales" (
  	"title" varchar,
  	"summary" varchar,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" uuid,
  	"reading_time" numeric,
  	"first_published_at" timestamp(3) with time zone,
  	"_status" "enum_lessons_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "lessons_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid
  );
  
  CREATE TABLE "_lessons_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_slug" varchar,
  	"version_course_id" uuid,
  	"version_free_preview" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"published_locale" "enum__lessons_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_lessons_v_locales" (
  	"version_title" varchar,
  	"version_summary" varchar,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" uuid,
  	"version_reading_time" numeric,
  	"version_first_published_at" timestamp(3) with time zone,
  	"version__status" "enum__lessons_v_version_status" DEFAULT 'draft',
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_lessons_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid
  );
  
  CREATE TABLE "categories" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"_order" varchar,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categories_locales" (
  	"name" varchar NOT NULL,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "categories_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid
  );
  
  CREATE TABLE "_categories_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version__order" varchar,
  	"version_slug" varchar NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_categories_v_locales" (
  	"version_name" varchar NOT NULL,
  	"version_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_categories_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid
  );
  
  CREATE TABLE "instructors_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "instructors" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"photo_id" uuid,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "instructors_locales" (
  	"headline" varchar,
  	"bio" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "instructors_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid
  );
  
  CREATE TABLE "_instructors_v_version_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_instructors_v" (
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"parent_id" uuid,
  	"version_name" varchar NOT NULL,
  	"version_slug" varchar NOT NULL,
  	"version_photo_id" uuid,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_instructors_v_locales" (
  	"version_headline" varchar,
  	"version_bio" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" uuid NOT NULL
  );
  
  CREATE TABLE "_instructors_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" uuid NOT NULL,
  	"path" varchar NOT NULL,
  	"admins_id" uuid
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "courses_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "lessons_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categories_id" uuid;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "instructors_id" uuid;
  ALTER TABLE "courses_outcomes" ADD CONSTRAINT "courses_outcomes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_requirements" ADD CONSTRAINT "courses_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_modules" ADD CONSTRAINT "courses_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_modules_locales" ADD CONSTRAINT "courses_modules_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_locales" ADD CONSTRAINT "courses_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "courses_locales" ADD CONSTRAINT "courses_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_instructors_fk" FOREIGN KEY ("instructors_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "courses_rels" ADD CONSTRAINT "courses_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_outcomes" ADD CONSTRAINT "_courses_v_version_outcomes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_requirements" ADD CONSTRAINT "_courses_v_version_requirements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_modules" ADD CONSTRAINT "_courses_v_version_modules_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_version_modules_locales" ADD CONSTRAINT "_courses_v_version_modules_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v_version_modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_parent_id_courses_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v" ADD CONSTRAINT "_courses_v_version_category_id_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v_locales" ADD CONSTRAINT "_courses_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_courses_v_locales" ADD CONSTRAINT "_courses_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_instructors_fk" FOREIGN KEY ("instructors_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_courses_v_rels" ADD CONSTRAINT "_courses_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_locales" ADD CONSTRAINT "lessons_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "lessons_locales" ADD CONSTRAINT "lessons_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_rels" ADD CONSTRAINT "lessons_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "lessons_rels" ADD CONSTRAINT "lessons_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v" ADD CONSTRAINT "_lessons_v_parent_id_lessons_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lessons_v" ADD CONSTRAINT "_lessons_v_version_course_id_courses_id_fk" FOREIGN KEY ("version_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lessons_v_locales" ADD CONSTRAINT "_lessons_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_lessons_v_locales" ADD CONSTRAINT "_lessons_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_rels" ADD CONSTRAINT "_lessons_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_lessons_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_lessons_v_rels" ADD CONSTRAINT "_lessons_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_locales" ADD CONSTRAINT "categories_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories_rels" ADD CONSTRAINT "categories_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v" ADD CONSTRAINT "_categories_v_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_categories_v_locales" ADD CONSTRAINT "_categories_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v_rels" ADD CONSTRAINT "_categories_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_categories_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_categories_v_rels" ADD CONSTRAINT "_categories_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructors_links" ADD CONSTRAINT "instructors_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructors" ADD CONSTRAINT "instructors_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "instructors_locales" ADD CONSTRAINT "instructors_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructors_rels" ADD CONSTRAINT "instructors_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "instructors_rels" ADD CONSTRAINT "instructors_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructors_v_version_links" ADD CONSTRAINT "_instructors_v_version_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_instructors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructors_v" ADD CONSTRAINT "_instructors_v_parent_id_instructors_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."instructors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_instructors_v" ADD CONSTRAINT "_instructors_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_instructors_v_locales" ADD CONSTRAINT "_instructors_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_instructors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructors_v_rels" ADD CONSTRAINT "_instructors_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_instructors_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_instructors_v_rels" ADD CONSTRAINT "_instructors_v_rels_admins_fk" FOREIGN KEY ("admins_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "courses_outcomes_order_idx" ON "courses_outcomes" USING btree ("_order");
  CREATE INDEX "courses_outcomes_parent_id_idx" ON "courses_outcomes" USING btree ("_parent_id");
  CREATE INDEX "courses_outcomes_locale_idx" ON "courses_outcomes" USING btree ("_locale");
  CREATE INDEX "courses_requirements_order_idx" ON "courses_requirements" USING btree ("_order");
  CREATE INDEX "courses_requirements_parent_id_idx" ON "courses_requirements" USING btree ("_parent_id");
  CREATE INDEX "courses_requirements_locale_idx" ON "courses_requirements" USING btree ("_locale");
  CREATE INDEX "courses_modules_order_idx" ON "courses_modules" USING btree ("_order");
  CREATE INDEX "courses_modules_parent_id_idx" ON "courses_modules" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "courses_modules_locales_locale_parent_id_unique" ON "courses_modules_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "courses_cover_idx" ON "courses" USING btree ("cover_id");
  CREATE UNIQUE INDEX "courses_slug_idx" ON "courses" USING btree ("slug");
  CREATE INDEX "courses_category_idx" ON "courses" USING btree ("category_id");
  CREATE INDEX "courses_updated_at_idx" ON "courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "courses" USING btree ("created_at");
  CREATE INDEX "courses_meta_meta_image_idx" ON "courses_locales" USING btree ("meta_image_id","_locale");
  CREATE INDEX "courses_first_published_at_idx" ON "courses_locales" USING btree ("first_published_at","_locale");
  CREATE INDEX "courses__status_idx" ON "courses_locales" USING btree ("_status","_locale");
  CREATE UNIQUE INDEX "courses_locales_locale_parent_id_unique" ON "courses_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "courses_rels_order_idx" ON "courses_rels" USING btree ("order");
  CREATE INDEX "courses_rels_parent_idx" ON "courses_rels" USING btree ("parent_id");
  CREATE INDEX "courses_rels_path_idx" ON "courses_rels" USING btree ("path");
  CREATE INDEX "courses_rels_lessons_id_idx" ON "courses_rels" USING btree ("lessons_id");
  CREATE INDEX "courses_rels_instructors_id_idx" ON "courses_rels" USING btree ("instructors_id");
  CREATE INDEX "courses_rels_admins_id_idx" ON "courses_rels" USING btree ("admins_id");
  CREATE INDEX "_courses_v_version_outcomes_order_idx" ON "_courses_v_version_outcomes" USING btree ("_order");
  CREATE INDEX "_courses_v_version_outcomes_parent_id_idx" ON "_courses_v_version_outcomes" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_version_outcomes_locale_idx" ON "_courses_v_version_outcomes" USING btree ("_locale");
  CREATE INDEX "_courses_v_version_requirements_order_idx" ON "_courses_v_version_requirements" USING btree ("_order");
  CREATE INDEX "_courses_v_version_requirements_parent_id_idx" ON "_courses_v_version_requirements" USING btree ("_parent_id");
  CREATE INDEX "_courses_v_version_requirements_locale_idx" ON "_courses_v_version_requirements" USING btree ("_locale");
  CREATE INDEX "_courses_v_version_modules_order_idx" ON "_courses_v_version_modules" USING btree ("_order");
  CREATE INDEX "_courses_v_version_modules_parent_id_idx" ON "_courses_v_version_modules" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_courses_v_version_modules_locales_locale_parent_id_unique" ON "_courses_v_version_modules_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_courses_v_parent_idx" ON "_courses_v" USING btree ("parent_id");
  CREATE INDEX "_courses_v_version_version_cover_idx" ON "_courses_v" USING btree ("version_cover_id");
  CREATE INDEX "_courses_v_version_version_slug_idx" ON "_courses_v" USING btree ("version_slug");
  CREATE INDEX "_courses_v_version_version_category_idx" ON "_courses_v" USING btree ("version_category_id");
  CREATE INDEX "_courses_v_version_version_updated_at_idx" ON "_courses_v" USING btree ("version_updated_at");
  CREATE INDEX "_courses_v_version_version_created_at_idx" ON "_courses_v" USING btree ("version_created_at");
  CREATE INDEX "_courses_v_created_at_idx" ON "_courses_v" USING btree ("created_at");
  CREATE INDEX "_courses_v_updated_at_idx" ON "_courses_v" USING btree ("updated_at");
  CREATE INDEX "_courses_v_published_locale_idx" ON "_courses_v" USING btree ("published_locale");
  CREATE INDEX "_courses_v_latest_idx" ON "_courses_v" USING btree ("latest");
  CREATE INDEX "_courses_v_autosave_idx" ON "_courses_v" USING btree ("autosave");
  CREATE INDEX "_courses_v_version_meta_version_meta_image_idx" ON "_courses_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE INDEX "_courses_v_version_version_first_published_at_idx" ON "_courses_v_locales" USING btree ("version_first_published_at","_locale");
  CREATE INDEX "_courses_v_version_version__status_idx" ON "_courses_v_locales" USING btree ("version__status","_locale");
  CREATE UNIQUE INDEX "_courses_v_locales_locale_parent_id_unique" ON "_courses_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_courses_v_rels_order_idx" ON "_courses_v_rels" USING btree ("order");
  CREATE INDEX "_courses_v_rels_parent_idx" ON "_courses_v_rels" USING btree ("parent_id");
  CREATE INDEX "_courses_v_rels_path_idx" ON "_courses_v_rels" USING btree ("path");
  CREATE INDEX "_courses_v_rels_lessons_id_idx" ON "_courses_v_rels" USING btree ("lessons_id");
  CREATE INDEX "_courses_v_rels_instructors_id_idx" ON "_courses_v_rels" USING btree ("instructors_id");
  CREATE INDEX "_courses_v_rels_admins_id_idx" ON "_courses_v_rels" USING btree ("admins_id");
  CREATE INDEX "lessons_slug_idx" ON "lessons" USING btree ("slug");
  CREATE INDEX "lessons_course_idx" ON "lessons" USING btree ("course_id");
  CREATE INDEX "lessons_updated_at_idx" ON "lessons" USING btree ("updated_at");
  CREATE INDEX "lessons_created_at_idx" ON "lessons" USING btree ("created_at");
  CREATE INDEX "lessons_meta_meta_image_idx" ON "lessons_locales" USING btree ("meta_image_id","_locale");
  CREATE INDEX "lessons_first_published_at_idx" ON "lessons_locales" USING btree ("first_published_at","_locale");
  CREATE INDEX "lessons__status_idx" ON "lessons_locales" USING btree ("_status","_locale");
  CREATE UNIQUE INDEX "lessons_locales_locale_parent_id_unique" ON "lessons_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "lessons_rels_order_idx" ON "lessons_rels" USING btree ("order");
  CREATE INDEX "lessons_rels_parent_idx" ON "lessons_rels" USING btree ("parent_id");
  CREATE INDEX "lessons_rels_path_idx" ON "lessons_rels" USING btree ("path");
  CREATE INDEX "lessons_rels_admins_id_idx" ON "lessons_rels" USING btree ("admins_id");
  CREATE INDEX "_lessons_v_parent_idx" ON "_lessons_v" USING btree ("parent_id");
  CREATE INDEX "_lessons_v_version_version_slug_idx" ON "_lessons_v" USING btree ("version_slug");
  CREATE INDEX "_lessons_v_version_version_course_idx" ON "_lessons_v" USING btree ("version_course_id");
  CREATE INDEX "_lessons_v_version_version_updated_at_idx" ON "_lessons_v" USING btree ("version_updated_at");
  CREATE INDEX "_lessons_v_version_version_created_at_idx" ON "_lessons_v" USING btree ("version_created_at");
  CREATE INDEX "_lessons_v_created_at_idx" ON "_lessons_v" USING btree ("created_at");
  CREATE INDEX "_lessons_v_updated_at_idx" ON "_lessons_v" USING btree ("updated_at");
  CREATE INDEX "_lessons_v_published_locale_idx" ON "_lessons_v" USING btree ("published_locale");
  CREATE INDEX "_lessons_v_latest_idx" ON "_lessons_v" USING btree ("latest");
  CREATE INDEX "_lessons_v_autosave_idx" ON "_lessons_v" USING btree ("autosave");
  CREATE INDEX "_lessons_v_version_meta_version_meta_image_idx" ON "_lessons_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE INDEX "_lessons_v_version_version_first_published_at_idx" ON "_lessons_v_locales" USING btree ("version_first_published_at","_locale");
  CREATE INDEX "_lessons_v_version_version__status_idx" ON "_lessons_v_locales" USING btree ("version__status","_locale");
  CREATE UNIQUE INDEX "_lessons_v_locales_locale_parent_id_unique" ON "_lessons_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_lessons_v_rels_order_idx" ON "_lessons_v_rels" USING btree ("order");
  CREATE INDEX "_lessons_v_rels_parent_idx" ON "_lessons_v_rels" USING btree ("parent_id");
  CREATE INDEX "_lessons_v_rels_path_idx" ON "_lessons_v_rels" USING btree ("path");
  CREATE INDEX "_lessons_v_rels_admins_id_idx" ON "_lessons_v_rels" USING btree ("admins_id");
  CREATE INDEX "categories__order_idx" ON "categories" USING btree ("_order");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "categories_locales_locale_parent_id_unique" ON "categories_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "categories_rels_order_idx" ON "categories_rels" USING btree ("order");
  CREATE INDEX "categories_rels_parent_idx" ON "categories_rels" USING btree ("parent_id");
  CREATE INDEX "categories_rels_path_idx" ON "categories_rels" USING btree ("path");
  CREATE INDEX "categories_rels_admins_id_idx" ON "categories_rels" USING btree ("admins_id");
  CREATE INDEX "_categories_v_parent_idx" ON "_categories_v" USING btree ("parent_id");
  CREATE INDEX "_categories_v_version_version__order_idx" ON "_categories_v" USING btree ("version__order");
  CREATE INDEX "_categories_v_version_version_slug_idx" ON "_categories_v" USING btree ("version_slug");
  CREATE INDEX "_categories_v_version_version_updated_at_idx" ON "_categories_v" USING btree ("version_updated_at");
  CREATE INDEX "_categories_v_version_version_created_at_idx" ON "_categories_v" USING btree ("version_created_at");
  CREATE INDEX "_categories_v_created_at_idx" ON "_categories_v" USING btree ("created_at");
  CREATE INDEX "_categories_v_updated_at_idx" ON "_categories_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_categories_v_locales_locale_parent_id_unique" ON "_categories_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_categories_v_rels_order_idx" ON "_categories_v_rels" USING btree ("order");
  CREATE INDEX "_categories_v_rels_parent_idx" ON "_categories_v_rels" USING btree ("parent_id");
  CREATE INDEX "_categories_v_rels_path_idx" ON "_categories_v_rels" USING btree ("path");
  CREATE INDEX "_categories_v_rels_admins_id_idx" ON "_categories_v_rels" USING btree ("admins_id");
  CREATE INDEX "instructors_links_order_idx" ON "instructors_links" USING btree ("_order");
  CREATE INDEX "instructors_links_parent_id_idx" ON "instructors_links" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "instructors_slug_idx" ON "instructors" USING btree ("slug");
  CREATE INDEX "instructors_photo_idx" ON "instructors" USING btree ("photo_id");
  CREATE INDEX "instructors_updated_at_idx" ON "instructors" USING btree ("updated_at");
  CREATE INDEX "instructors_created_at_idx" ON "instructors" USING btree ("created_at");
  CREATE UNIQUE INDEX "instructors_locales_locale_parent_id_unique" ON "instructors_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "instructors_rels_order_idx" ON "instructors_rels" USING btree ("order");
  CREATE INDEX "instructors_rels_parent_idx" ON "instructors_rels" USING btree ("parent_id");
  CREATE INDEX "instructors_rels_path_idx" ON "instructors_rels" USING btree ("path");
  CREATE INDEX "instructors_rels_admins_id_idx" ON "instructors_rels" USING btree ("admins_id");
  CREATE INDEX "_instructors_v_version_links_order_idx" ON "_instructors_v_version_links" USING btree ("_order");
  CREATE INDEX "_instructors_v_version_links_parent_id_idx" ON "_instructors_v_version_links" USING btree ("_parent_id");
  CREATE INDEX "_instructors_v_parent_idx" ON "_instructors_v" USING btree ("parent_id");
  CREATE INDEX "_instructors_v_version_version_slug_idx" ON "_instructors_v" USING btree ("version_slug");
  CREATE INDEX "_instructors_v_version_version_photo_idx" ON "_instructors_v" USING btree ("version_photo_id");
  CREATE INDEX "_instructors_v_version_version_updated_at_idx" ON "_instructors_v" USING btree ("version_updated_at");
  CREATE INDEX "_instructors_v_version_version_created_at_idx" ON "_instructors_v" USING btree ("version_created_at");
  CREATE INDEX "_instructors_v_created_at_idx" ON "_instructors_v" USING btree ("created_at");
  CREATE INDEX "_instructors_v_updated_at_idx" ON "_instructors_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_instructors_v_locales_locale_parent_id_unique" ON "_instructors_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_instructors_v_rels_order_idx" ON "_instructors_v_rels" USING btree ("order");
  CREATE INDEX "_instructors_v_rels_parent_idx" ON "_instructors_v_rels" USING btree ("parent_id");
  CREATE INDEX "_instructors_v_rels_path_idx" ON "_instructors_v_rels" USING btree ("path");
  CREATE INDEX "_instructors_v_rels_admins_id_idx" ON "_instructors_v_rels" USING btree ("admins_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instructors_fk" FOREIGN KEY ("instructors_id") REFERENCES "public"."instructors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_lessons_id_idx" ON "payload_locked_documents_rels" USING btree ("lessons_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_instructors_id_idx" ON "payload_locked_documents_rels" USING btree ("instructors_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses_outcomes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_requirements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_modules_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "courses_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_version_outcomes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_version_requirements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_version_modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_version_modules_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_courses_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "lessons_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_lessons_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categories_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_categories_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_categories_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_categories_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructors_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructors_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "instructors_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructors_v_version_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructors_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructors_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_instructors_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "courses_outcomes" CASCADE;
  DROP TABLE "courses_requirements" CASCADE;
  DROP TABLE "courses_modules" CASCADE;
  DROP TABLE "courses_modules_locales" CASCADE;
  DROP TABLE "courses" CASCADE;
  DROP TABLE "courses_locales" CASCADE;
  DROP TABLE "courses_rels" CASCADE;
  DROP TABLE "_courses_v_version_outcomes" CASCADE;
  DROP TABLE "_courses_v_version_requirements" CASCADE;
  DROP TABLE "_courses_v_version_modules" CASCADE;
  DROP TABLE "_courses_v_version_modules_locales" CASCADE;
  DROP TABLE "_courses_v" CASCADE;
  DROP TABLE "_courses_v_locales" CASCADE;
  DROP TABLE "_courses_v_rels" CASCADE;
  DROP TABLE "lessons" CASCADE;
  DROP TABLE "lessons_locales" CASCADE;
  DROP TABLE "lessons_rels" CASCADE;
  DROP TABLE "_lessons_v" CASCADE;
  DROP TABLE "_lessons_v_locales" CASCADE;
  DROP TABLE "_lessons_v_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "categories_locales" CASCADE;
  DROP TABLE "categories_rels" CASCADE;
  DROP TABLE "_categories_v" CASCADE;
  DROP TABLE "_categories_v_locales" CASCADE;
  DROP TABLE "_categories_v_rels" CASCADE;
  DROP TABLE "instructors_links" CASCADE;
  DROP TABLE "instructors" CASCADE;
  DROP TABLE "instructors_locales" CASCADE;
  DROP TABLE "instructors_rels" CASCADE;
  DROP TABLE "_instructors_v_version_links" CASCADE;
  DROP TABLE "_instructors_v" CASCADE;
  DROP TABLE "_instructors_v_locales" CASCADE;
  DROP TABLE "_instructors_v_rels" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_courses_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_lessons_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_instructors_fk";
  
  DROP INDEX "payload_locked_documents_rels_courses_id_idx";
  DROP INDEX "payload_locked_documents_rels_lessons_id_idx";
  DROP INDEX "payload_locked_documents_rels_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_instructors_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "courses_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "lessons_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "instructors_id";
  DROP TYPE "public"."enum_courses_level";
  DROP TYPE "public"."enum_courses_status";
  DROP TYPE "public"."enum__courses_v_version_level";
  DROP TYPE "public"."enum__courses_v_published_locale";
  DROP TYPE "public"."enum__courses_v_version_status";
  DROP TYPE "public"."enum_lessons_status";
  DROP TYPE "public"."enum__lessons_v_published_locale";
  DROP TYPE "public"."enum__lessons_v_version_status";`)
}
