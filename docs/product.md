# Product

Open Knowledge is a course platform. Lessons are mostly written text with images and interactive components; a few embed video. Every course is free today; paid access is planned.

**Status (2026-10-19):** courses, lessons, categories and instructors can be edited in `/admin` with the shared editor and its blocks, and student data is limited to admins. The public pages, enrollment, progress and quizzes are designed, not built. Mark a section as built when its phase lands.

## People

| Who | Account | Can |
| --- | --- | --- |
| Visitor | none | Browse the catalogue, course pages, categories, instructors and free-preview lessons |
| Student | `users` (Better Auth, signs up on the site) | Read every lesson, enroll, track progress, take quizzes |
| Editor | `admins`, role `editor` | Manage content in `/admin`; never sees student data |
| Admin | `admins`, role `admin` | Everything, including student data |
| Instructor | none: a public profile | Shown on the courses they teach; optional on every course |

A **support** role is planned: student data without content. Student-data access goes through one access helper so the role is added in one place.

## Concepts

- **Course**: its page (summary, syllabus, progress) is the entry point and is public. Holds an ordered list of modules.
- **Module**: a titled group of lessons inside a course. No page, no URL.
- **Lesson**: belongs to exactly one course and is never reused in another. Text with images, plus videos and components placed anywhere in the text. Optional quiz at the end.
- **Free preview**: a lesson readable without an account. The only lessons search engines index.
- **Enrollment**: a student's membership in a course; it is what "My courses" lists. Created by "Start course", or automatically when the student completes a first lesson of a course they had not started. Leaving a course deletes the enrollment and keeps the progress, so re-enrolling restores it.
- **Course completed**: the enrollment gets a completion date when every published lesson is complete. The date stays as a milestone when lessons are added later; the course page then shows the real progress (11/12) and marks the new lessons as "New".
- **Progress**: a lesson is complete when the student presses "Mark as complete". Always manual, video lessons included, because a lesson mixes text, images and video.
- **Quiz**: self-assessment. Never blocks completing a lesson. Only the last attempt is kept. Requires an account: visitors see it locked with a prompt to sign up or sign in.

## Journeys

**Catalogue** (`/courses`): sort by newest (default, featured courses first), most popular (enrollment count), duration or A–Z. Filter by category, level and duration bucket (< 1 h, 1–3 h, > 3 h). Sort and filters live in the query string; the page has one canonical URL.

**Course page** (`/courses/<course>`): cover, summary, description, what you'll learn, requirements, level, category, instructors, lesson count and total duration, and the syllabus with per-lesson progress and "Preview" / "New" badges. Actions: Start, Continue, Leave. Continue opens the first incomplete lesson in syllabus order, or the first lesson once the course is complete.

**Lesson** (`/courses/<course>/<lesson>`): title as the only H1, table of contents from H2 and H3, content, quiz, "Mark as complete", previous / next lesson.

**My courses** (under `/account`): enrolled courses in the current language. A course not published in that language stays listed, labelled "Available in Spanish" and linking to that version.

Other public pages: `/categories/<category>`, `/instructors/<instructor>`.

## Languages

Editors write in Spanish first; English and Catalan follow (an AI translation button is planned). A course or lesson appears in a language only once it is published in that language: lesson counts, durations and the catalogue only count what is published there. "My courses" is the one exception (see above). Progress belongs to the lesson, so it is the same in every language.

## SEO

Indexable: catalogue, course pages, categories, instructors and free-preview lessons. Every other lesson is `noindex` and stays out of the sitemap, since search engines cannot read it anyway.

## Planned, and the seam left for each

- **Paid access**: enrollment is the record a purchase will create; lesson access is decided in one place; media gets a course-gated visibility level ([media.md](media.md)).
- **AI translation (es → en, ca)**: translates each locale's lesson content as a whole and the quiz's text fields ([content-model.md](content-model.md#localization)).
- **Support role**: see People.
- **Certificates**: would add a per-lesson "quiz must be passed" flag; completion dates already exist.
- **Not planned yet**: learning paths (groups of courses), comments, reviews, resuming a video where it stopped, bespoke interactive widgets, maths formulas, tabs, third-party embeds.
