# Public site

The pages visitors and students see, and the rules they follow. What each page shows is in [product.md](product.md#journeys); this file covers how the site reads content and what a change touches.

**Status (2026-10-19):** catalogue, course, lesson, category and instructor pages built. Enrollment, progress and quizzes are not (phases 5 and 6): the course page's only action is "Start course", a link to the first lesson.

## Routes

All under `src/app/(frontend)/[locale]`, English segments in every locale (`/es/courses/…`):

| Route | Page |
| --- | --- |
| `/courses` | Catalogue |
| `/courses/<course>` | Course |
| `/courses/<course>/<lesson>` | Lesson |
| `/categories/<category>` | Category |
| `/instructors/<instructor>` | Instructor |
| `/<page>` | `pages`, through the catch-all route |

Href builders live in `src/lib/paths.ts`. A page slug cannot take a first segment the app owns (`reservedSlugs`: `courses`, `account`, `login`…); the pages collection rejects it.

## Reading content

`src/lib/course-data.ts` is the only place the site reads courses and lessons.

- **What counts:** a course or lesson exists in a language once it is published there (`_status` is per locale). Staff in draft mode (opened from the admin's preview) see drafts instead. Lesson counts, durations and syllabuses only include what counts.
- **Syllabus:** `buildSyllabus` (`src/lib/catalogue.ts`) keeps the course's module order and drops lessons that do not count or whose `course` is another course; modules left empty disappear. A lesson's URL exists only through its course's syllabus, so a lesson in no syllabus, or under the wrong course, is a 404.
- **Courses, categories and instructors** are read with the visitor's access, so a private cover or photo never reaches a visitor.
- **Lessons** are read with `overrideAccess`, filtered to what counts: titles, summaries and order are public even though the API only hands out free previews. Their content is fetched separately, only after `canReadLesson` allows it.
- **Lesson content** therefore populates private files too; the renderer shows them to staff previewing only ([media.md](media.md)).

## Lesson access

`canReadLesson` (`src/lib/course-data.ts`) is the one place that decides it: free previews for everyone, every lesson for a signed-in student (Better Auth session) and for staff previewing. Everyone else gets the title, summary and a prompt to sign up or sign in, which returns to the lesson afterwards (`redirect`, carried between both forms). Paid access will add its rule there.

## Catalogue

Sort and filters (`?sort=popular&category=design&level=beginner&duration=short`) are parsed by `parseCatalogueQuery`; unknown values are ignored, so old links keep working. Sorting and filtering run in memory over every course that counts in the locale (`applyCatalogueQuery`): fine for hundreds of courses, to revisit with thousands. Only categories with a course in the locale are offered as filters.

## SEO

- Canonical URL and hreflang alternates for every page (`alternatesFor` in `src/lib/seo.ts`), limited to the locales where the document is published; a lesson needs its course published there too. Categories and instructors have no drafts, so they list every locale.
- The catalogue keeps one canonical URL whatever the query string.
- Lessons that are not free previews are `noindex` and stay out of the sitemap.
- Course pages carry `Course` structured data (`jsonLd`, which escapes `<`).
- `src/app/sitemap.ts` lists pages, the catalogue, courses, free-preview lessons, categories and instructors per locale.

## Preview

Pages, courses and lessons have the admin's preview button and live preview (`src/lib/preview.ts`). Both open `/api/preview`, which turns on draft mode for signed-in staff and redirects to the document in the edited locale. It also sets the language cookie (`NEXT_LOCALE`) to that locale: English URLs have no prefix, and the cookie would otherwise redirect them to the editor's own language. Previewing therefore switches the editor's site language to the one they are editing. A lesson's URL needs its course: a lesson in no course has no preview.

## Badges

- **Preview:** a free lesson, shown to visitors only.
- **New:** a lesson first published in the locale more than a day after its course, within the last 30 days (`isNewLesson`), so a course that has just launched does not mark every lesson as new. Phase 5 may refine it per student.
