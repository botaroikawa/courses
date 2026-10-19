# Content model

How the collections relate and the invariants the code keeps. Field definitions live in `src/collections`; this file holds the reasons and what a change breaks. Product behaviour is in [product.md](product.md).

**Status (2026-10-19):** designed, not built.

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
- `enrollmentCount` is stored and updated on enroll and leave, so the "most popular" sort never counts rows on every catalogue load.
- Lesson count and total duration are computed from lessons published in the requested locale, at read time: they differ per locale.
- Same editing setup as `pages`: shared English slug, SEO tab, drafts with autosave, scheduled publish, live preview.

## lessons

- `course` is read-only, written by a course hook from `modules`. A lesson in no module has no URL; the admin list shows its course as empty.
- A lesson appears once, in one module of one course. Its slug is unique within that course, not site-wide.
- `content` is the shared Lexical editor ([editor.md](editor.md)).
- `readingTime` is localized and computed on save: the locale's word count at 200 words per minute, plus the duration of every video block. Images and components add nothing. No manual override.
- `firstPublishedAt` is set when the lesson is first published in a locale; it drives the "New" badge.
- `freePreview` makes the lesson public and indexable; every other lesson is `noindex`.
- `quiz`: questions of type single choice, multiple choice or true/false; each option has an optional explanation shown after answering.

## Localization

Two strategies, on purpose:

- **Lesson content is localized as a whole.** Each locale holds its own Lexical tree, block data included (a chart's CSV exists once per locale). Writing is free-form and locales may restructure. The cost: fixing a number means fixing it per locale, or editing Spanish and re-running translation.
- **Quiz structure is shared, its text is localized.** Questions, options and which answers are correct are one non-localized array; prompts, option labels and explanations are localized fields. A correct answer can never differ between languages, and attempts point to the same questions in every locale.

Slugs are shared and in English everywhere (see `CLAUDE.md`).

## Student data

Payload's `req.user` is always an admin. Students write through server actions that check the Better Auth session and then call the Local API with `overrideAccess: true`. In `/admin` these collections are read-only, visible to the `admin` role only, which may delete single records for support requests.

- **enrollments**: one per (user, course). `enrolledAt`, `completedAt`. Leaving deletes the row and keeps lesson progress.
- **lesson-progress**: one per (user, lesson), with `completedAt`. Holds no course, so moving a lesson to another course carries its progress along.
- **quiz-attempts**: one per (user, lesson), overwritten on each attempt: answers, score, date. Grading runs in a server action; correct answers never reach the browser.

Open detail: which locale defines "every published lesson" when setting `completedAt`. Proposed: the locale the student is using when they complete the last lesson.

## Deletions

Deleting is a conscious act; the admin warns that unpublishing is the way to retire content without losing data.

- **User**: sessions and accounts (already), plus enrollments, progress and quiz attempts.
- **Lesson**: its progress and quiz attempts; it is removed from its module.
- **Course**: its enrollments. Open detail: whether its lessons are deleted too or left without a course.
