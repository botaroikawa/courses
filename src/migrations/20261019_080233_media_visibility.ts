import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_media_subtitles_locale" AS ENUM('en', 'es', 'ca');
  CREATE TYPE "public"."enum_media_visibility" AS ENUM('public', 'private');
  CREATE TYPE "public"."enum__media_v_version_subtitles_locale" AS ENUM('en', 'es', 'ca');
  CREATE TYPE "public"."enum__media_v_version_visibility" AS ENUM('public', 'private');
  CREATE TABLE "media_subtitles" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"locale" "enum_media_subtitles_locale",
  	"file_id" uuid
  );
  
  CREATE TABLE "_media_v_version_subtitles" (
  	"_order" integer NOT NULL,
  	"_parent_id" uuid NOT NULL,
  	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  	"locale" "enum__media_v_version_subtitles_locale",
  	"file_id" uuid,
  	"_uuid" varchar
  );
  
  ALTER TABLE "media_locales" ALTER COLUMN "alt" DROP NOT NULL;
  ALTER TABLE "_media_v_locales" ALTER COLUMN "version_alt" DROP NOT NULL;
  ALTER TABLE "media" ADD COLUMN "visibility" "enum_media_visibility" DEFAULT 'public' NOT NULL;
  ALTER TABLE "media" ADD COLUMN "duration" numeric;
  ALTER TABLE "_media_v" ADD COLUMN "version_visibility" "enum__media_v_version_visibility" DEFAULT 'public' NOT NULL;
  ALTER TABLE "_media_v" ADD COLUMN "version_duration" numeric;
  ALTER TABLE "media_subtitles" ADD CONSTRAINT "media_subtitles_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_subtitles" ADD CONSTRAINT "media_subtitles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_media_v_version_subtitles" ADD CONSTRAINT "_media_v_version_subtitles_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_media_v_version_subtitles" ADD CONSTRAINT "_media_v_version_subtitles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_media_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_subtitles_order_idx" ON "media_subtitles" USING btree ("_order");
  CREATE INDEX "media_subtitles_parent_id_idx" ON "media_subtitles" USING btree ("_parent_id");
  CREATE INDEX "media_subtitles_file_idx" ON "media_subtitles" USING btree ("file_id");
  CREATE INDEX "_media_v_version_subtitles_order_idx" ON "_media_v_version_subtitles" USING btree ("_order");
  CREATE INDEX "_media_v_version_subtitles_parent_id_idx" ON "_media_v_version_subtitles" USING btree ("_parent_id");
  CREATE INDEX "_media_v_version_subtitles_file_idx" ON "_media_v_version_subtitles" USING btree ("file_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_subtitles" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_media_v_version_subtitles" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media_subtitles" CASCADE;
  DROP TABLE "_media_v_version_subtitles" CASCADE;
  ALTER TABLE "media_locales" ALTER COLUMN "alt" SET NOT NULL;
  ALTER TABLE "_media_v_locales" ALTER COLUMN "version_alt" SET NOT NULL;
  ALTER TABLE "media" DROP COLUMN "visibility";
  ALTER TABLE "media" DROP COLUMN "duration";
  ALTER TABLE "_media_v" DROP COLUMN "version_visibility";
  ALTER TABLE "_media_v" DROP COLUMN "version_duration";
  DROP TYPE "public"."enum_media_subtitles_locale";
  DROP TYPE "public"."enum_media_visibility";
  DROP TYPE "public"."enum__media_v_version_subtitles_locale";
  DROP TYPE "public"."enum__media_v_version_visibility";`)
}
