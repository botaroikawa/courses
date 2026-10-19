import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header_nav_items" DROP CONSTRAINT "header_nav_items_link_page_id_pages_id_fk";
  
  ALTER TABLE "_header_v_version_nav_items" DROP CONSTRAINT "_header_v_version_nav_items_link_page_id_pages_id_fk";
  
  ALTER TABLE "footer_nav_items" DROP CONSTRAINT "footer_nav_items_link_page_id_pages_id_fk";
  
  ALTER TABLE "_footer_v_version_nav_items" DROP CONSTRAINT "_footer_v_version_nav_items_link_page_id_pages_id_fk";
  
  DROP INDEX "header_nav_items_link_link_page_idx";
  DROP INDEX "_header_v_version_nav_items_link_link_page_idx";
  DROP INDEX "footer_nav_items_link_link_page_idx";
  DROP INDEX "_footer_v_version_nav_items_link_link_page_idx";
  ALTER TABLE "header_rels" ADD COLUMN "pages_id" uuid;
  ALTER TABLE "header_rels" ADD COLUMN "courses_id" uuid;
  ALTER TABLE "header_rels" ADD COLUMN "lessons_id" uuid;
  ALTER TABLE "_header_v_rels" ADD COLUMN "pages_id" uuid;
  ALTER TABLE "_header_v_rels" ADD COLUMN "courses_id" uuid;
  ALTER TABLE "_header_v_rels" ADD COLUMN "lessons_id" uuid;
  ALTER TABLE "footer_rels" ADD COLUMN "pages_id" uuid;
  ALTER TABLE "footer_rels" ADD COLUMN "courses_id" uuid;
  ALTER TABLE "footer_rels" ADD COLUMN "lessons_id" uuid;
  ALTER TABLE "_footer_v_rels" ADD COLUMN "pages_id" uuid;
  ALTER TABLE "_footer_v_rels" ADD COLUMN "courses_id" uuid;
  ALTER TABLE "_footer_v_rels" ADD COLUMN "lessons_id" uuid;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_rels" ADD CONSTRAINT "header_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_rels" ADD CONSTRAINT "_header_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_rels" ADD CONSTRAINT "_header_v_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_header_v_rels" ADD CONSTRAINT "_header_v_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_rels" ADD CONSTRAINT "footer_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_rels" ADD CONSTRAINT "_footer_v_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_rels" ADD CONSTRAINT "_footer_v_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_rels" ADD CONSTRAINT "_footer_v_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_rels_pages_id_idx" ON "header_rels" USING btree ("pages_id");
  CREATE INDEX "header_rels_courses_id_idx" ON "header_rels" USING btree ("courses_id");
  CREATE INDEX "header_rels_lessons_id_idx" ON "header_rels" USING btree ("lessons_id");
  CREATE INDEX "_header_v_rels_pages_id_idx" ON "_header_v_rels" USING btree ("pages_id");
  CREATE INDEX "_header_v_rels_courses_id_idx" ON "_header_v_rels" USING btree ("courses_id");
  CREATE INDEX "_header_v_rels_lessons_id_idx" ON "_header_v_rels" USING btree ("lessons_id");
  CREATE INDEX "footer_rels_pages_id_idx" ON "footer_rels" USING btree ("pages_id");
  CREATE INDEX "footer_rels_courses_id_idx" ON "footer_rels" USING btree ("courses_id");
  CREATE INDEX "footer_rels_lessons_id_idx" ON "footer_rels" USING btree ("lessons_id");
  CREATE INDEX "_footer_v_rels_pages_id_idx" ON "_footer_v_rels" USING btree ("pages_id");
  CREATE INDEX "_footer_v_rels_courses_id_idx" ON "_footer_v_rels" USING btree ("courses_id");
  CREATE INDEX "_footer_v_rels_lessons_id_idx" ON "_footer_v_rels" USING btree ("lessons_id");
  -- Nav links to pages move from their own column to the polymorphic relationship table
  INSERT INTO "header_rels" ("parent_id", "path", "pages_id")
    SELECT "_parent_id", 'navItems.' || ("_order" - 1) || '.link.doc', "link_page_id"
    FROM "header_nav_items" WHERE "link_page_id" IS NOT NULL;
  INSERT INTO "_header_v_rels" ("parent_id", "path", "pages_id")
    SELECT "_parent_id", 'version.navItems.' || ("_order" - 1) || '.link.doc', "link_page_id"
    FROM "_header_v_version_nav_items" WHERE "link_page_id" IS NOT NULL;
  INSERT INTO "footer_rels" ("parent_id", "path", "pages_id")
    SELECT "_parent_id", 'navItems.' || ("_order" - 1) || '.link.doc', "link_page_id"
    FROM "footer_nav_items" WHERE "link_page_id" IS NOT NULL;
  INSERT INTO "_footer_v_rels" ("parent_id", "path", "pages_id")
    SELECT "_parent_id", 'version.navItems.' || ("_order" - 1) || '.link.doc', "link_page_id"
    FROM "_footer_v_version_nav_items" WHERE "link_page_id" IS NOT NULL;
  ALTER TABLE "header_nav_items" DROP COLUMN "link_page_id";
  ALTER TABLE "_header_v_version_nav_items" DROP COLUMN "link_page_id";
  ALTER TABLE "footer_nav_items" DROP COLUMN "link_page_id";
  ALTER TABLE "_footer_v_version_nav_items" DROP COLUMN "link_page_id";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "header_rels" DROP CONSTRAINT "header_rels_pages_fk";
  
  ALTER TABLE "header_rels" DROP CONSTRAINT "header_rels_courses_fk";
  
  ALTER TABLE "header_rels" DROP CONSTRAINT "header_rels_lessons_fk";
  
  ALTER TABLE "_header_v_rels" DROP CONSTRAINT "_header_v_rels_pages_fk";
  
  ALTER TABLE "_header_v_rels" DROP CONSTRAINT "_header_v_rels_courses_fk";
  
  ALTER TABLE "_header_v_rels" DROP CONSTRAINT "_header_v_rels_lessons_fk";
  
  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_pages_fk";
  
  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_courses_fk";
  
  ALTER TABLE "footer_rels" DROP CONSTRAINT "footer_rels_lessons_fk";
  
  ALTER TABLE "_footer_v_rels" DROP CONSTRAINT "_footer_v_rels_pages_fk";
  
  ALTER TABLE "_footer_v_rels" DROP CONSTRAINT "_footer_v_rels_courses_fk";
  
  ALTER TABLE "_footer_v_rels" DROP CONSTRAINT "_footer_v_rels_lessons_fk";
  
  DROP INDEX "header_rels_pages_id_idx";
  DROP INDEX "header_rels_courses_id_idx";
  DROP INDEX "header_rels_lessons_id_idx";
  DROP INDEX "_header_v_rels_pages_id_idx";
  DROP INDEX "_header_v_rels_courses_id_idx";
  DROP INDEX "_header_v_rels_lessons_id_idx";
  DROP INDEX "footer_rels_pages_id_idx";
  DROP INDEX "footer_rels_courses_id_idx";
  DROP INDEX "footer_rels_lessons_id_idx";
  DROP INDEX "_footer_v_rels_pages_id_idx";
  DROP INDEX "_footer_v_rels_courses_id_idx";
  DROP INDEX "_footer_v_rels_lessons_id_idx";
  ALTER TABLE "header_nav_items" ADD COLUMN "link_page_id" uuid;
  ALTER TABLE "_header_v_version_nav_items" ADD COLUMN "link_page_id" uuid;
  ALTER TABLE "footer_nav_items" ADD COLUMN "link_page_id" uuid;
  ALTER TABLE "_footer_v_version_nav_items" ADD COLUMN "link_page_id" uuid;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_header_v_version_nav_items" ADD CONSTRAINT "_header_v_version_nav_items_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_nav_items" ADD CONSTRAINT "footer_nav_items_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_footer_v_version_nav_items" ADD CONSTRAINT "_footer_v_version_nav_items_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "header_nav_items_link_link_page_idx" ON "header_nav_items" USING btree ("link_page_id");
  CREATE INDEX "_header_v_version_nav_items_link_link_page_idx" ON "_header_v_version_nav_items" USING btree ("link_page_id");
  CREATE INDEX "footer_nav_items_link_link_page_idx" ON "footer_nav_items" USING btree ("link_page_id");
  CREATE INDEX "_footer_v_version_nav_items_link_link_page_idx" ON "_footer_v_version_nav_items" USING btree ("link_page_id");
  ALTER TABLE "header_rels" DROP COLUMN "pages_id";
  ALTER TABLE "header_rels" DROP COLUMN "courses_id";
  ALTER TABLE "header_rels" DROP COLUMN "lessons_id";
  ALTER TABLE "_header_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_header_v_rels" DROP COLUMN "courses_id";
  ALTER TABLE "_header_v_rels" DROP COLUMN "lessons_id";
  ALTER TABLE "footer_rels" DROP COLUMN "pages_id";
  ALTER TABLE "footer_rels" DROP COLUMN "courses_id";
  ALTER TABLE "footer_rels" DROP COLUMN "lessons_id";
  ALTER TABLE "_footer_v_rels" DROP COLUMN "pages_id";
  ALTER TABLE "_footer_v_rels" DROP COLUMN "courses_id";
  ALTER TABLE "_footer_v_rels" DROP COLUMN "lessons_id";`)
}
