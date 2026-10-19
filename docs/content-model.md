# Content model

How the collections relate and the invariants the code keeps. Field definitions live in `src/collections`; this file holds the reasons and what a change breaks. Product behaviour is in [product.md](product.md).

**Status (2026-10-19):** courses, lessons, categories and instructors are built, without quizzes. Student data (enrollments, progress, quiz attempts) is designed, not built.

```
categories 1──* courses *──* instructors
courses ──modules[]──> lessons        (ordered; a lesson sits in exactly one course)
users 1──* enrollments *──1 courses
users 1──* lesson-progress *──1 lessons
users 1──* quiz-attempts *──1 lessons
```

Content collections sit in the "Courses" admin group; student data in "Students".

## courses

- `modules` (array: localized title + ordered `lessons` relationship) is the single source of a lesson's course membership and order.
- One `category`; `instructors` optional; `level` is beginner, intermediate or advanced; `featured` pins a course to the top of the catalogue and the home page.
- `enrollmentCount` is stored so the "most popular" sort never counts rows on every catalogue load. Requests cannot write it (field access); enroll and leave will keep it current. Course versions hold a copy of it, so it must be written like a lesson's `course` (below), straight to the row and every version, or publishing a draft brings back an old count.
- `firstPublishedAt` (per locale) drives the "newest" sort, so a course drafted for months still counts as new when it comes out.
- Lesson count and total duration are computed from lessons published in the requested locale, at read time: they differ per locale.
- Same editing setup as `pages`: shared English slug, SEO tab, drafts with autosave, scheduled publish. Live preview arrives with the course pages.

### Syllabus and membership

A lesson's `course` mirrors the syllabus of the course **as last published** (the course's main row), so a course draft never moves lessons. `syncLessonCourse` (`src/lib/course-lessons.ts`) runs after every course save and writes `course` straight to the lesson row and to every version of it: no new lesson version, no pending lesson draft touched, and publishing or restoring an old lesson version keeps the current course. Lessons cannot set it themselves.

- The syllabus picker only offers lessons without a course or already in this one.
- Publishing a course checks that each lesson appears once, belongs to no other course, and that slugs are unique among its lessons. To move a lesson, remove it from the first course and publish that course first.
- The site builds a syllabus from the course's modules and skips any lesson whose `course` is not that course.

## lessons

- `course` is read-only and derived (see above). A lesson in no module has no URL; the admin list shows its course as empty.
- A lesson appears once, in one module of one course. Its slug is unique within that course, not site-wide, so it is a text field generated from the title: Payload's native slug field enforces site-wide uniqueness. The lesson's slug field and the course's publish check both enforce it.
- `content` is the shared Lexical editor ([editor.md](editor.md)).
- `readingTime` (minutes, per locale) is computed on every save from the locale's words at 200 per minute (`src/lib/reading-time.ts`), rounded up, plus the `duration` of each Video block ([editor.md](editor.md)). Images and other blocks add nothing. No manual override.
- `firstPublishedAt` is set when the lesson is first published in a locale and never moves; it drives the "New" badge.
- `freePreview` makes the lesson public and indexable; every other lesson is `noindex`.
- Through the API, visitors only get published free previews (`freePreviewOrStaff`). Students authenticate with Better Auth, never with Payload, so the site reads other lessons on the server after checking the session.
- `quiz` (not built): questions of type single choice, multiple choice or true/false; each option has an optional explanation shown after answering.

## categories and instructors

Plain collections without drafts; names and texts fall back to Spanish like everything else. Categories are ordered by dragging rows in the admin list (`orderable`). Instructors are public profiles with no link to `admins`.

## Localization

Two strategies, on purpose:

- **Lesson content is localized as a whole.** Each locale holds its own Lexical tree, block data included (a chart's CSV exists once per locale). Writing is free-form and locales may restructure. The cost: fixing a number means fixing it per locale, or editing Spanish and re-running translation.
- **Quiz structure is shared, its text is localized.** Questions, options and which answers are correct are one non-localized array; prompts, option labels and explanations are localized fields. A correct answer can never differ between languages, and attempts point to the same questions in every locale.

Slugs are shared and in English everywhere (see `CLAUDE.md`).

## Student data

Payload's `req.user` is always an admin. Students write through server actions that check the Better Auth session and then call the Local API with `overrideAccess: true`. In `/admin` these collections are read-only, and only roles allowed by `canManageStudents` (`src/access`) see them, `users` included: today the `admin` role, which may delete single records for support requests.

- **enrollments**: one per (user, course). `enrolledAt`, `completedAt`. Leaving deletes the row and keeps lesson progress.
- **lesson-progress**: one per (user, lesson), with `completedAt`. Holds no course, so moving a lesson to another course carries its progress along.
- **quiz-attempts**: one per (user, lesson), overwritten on each attempt: answers, score, date. Grading runs in a server action; correct answers never reach the browser.

## Deletions

Deleting is a conscious act; the admin descriptions say that unpublishing is the way to retire content without losing data.

- **User**: sessions and accounts (built), plus enrollments, progress and quiz attempts.
- **Lesson**: removed from every syllabus, course versions included (the database cascades the relationship rows). Its progress and quiz attempts go with it once those exist.
- **Course**: its lessons stay, without a course, ready to be added to another one (the database sets their `course` to null). Its enrollments go with it once those exist.
- **Category**: its courses keep a null category and cannot be published again until they get a new one.
- **Any link target** (page, course, lesson): links to it in rich text keep the id and render as plain text; header and footer items lose their target and disappear until edited ([editor.md](editor.md)).

Open detail: which locale defines "every published lesson" when setting `completedAt`. Proposed: the locale the student is using when they complete the last lesson.
