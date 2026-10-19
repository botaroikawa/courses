# Rich-text editor

One Lexical configuration shared by lessons and `pages`, with one renderer. A block that makes no sense on pages is excluded there.

**Status (2026-10-19):** designed, not built; `pages` uses the default Lexical editor today.

## Text

- Headings H2–H4. H1 belongs to the document's `title` field.
- Bold, italic, underline, strikethrough, inline code; ordered, unordered and check lists; quote; horizontal rule; tables (Lexical's native table feature).
- Inline links: external URLs, or internal pages, courses and lessons stored as relationships, so a slug change never breaks them.
- Images from `media`, with an optional caption and click-to-zoom.
- **Table of contents**: generated from H2 and H3. Each heading gets an anchor slugified from its text; duplicates get a numeric suffix.

## Blocks

| Block | Holds | Renders with |
| --- | --- | --- |
| Link | The shared link field: target (page, course, lesson or external URL), new tab, appearance `link` or `button`, variant `default`, `secondary`, `outline` or `ghost`, size `sm`, `default` or `lg` | shadcn `Button` or a link. The same field is used outside the editor (header, footer) |
| Code | Language, optional file name, code | Shiki on the server, copy button |
| Callout | Kind (info, tip, warning, danger), rich text | |
| Video | A video from `media`, optional caption | Native `<video>` with the file's subtitles |
| Chart | Type (bar, line, area, pie), title, caption, CSV with a header row, x-axis column | shadcn charts (Recharts). CSV is validated on save |
| Function plot | Axis ranges and labels, optional hidden ticks for conceptual plots, curves (expression in `x` + label), labelled points, shaded regions above or below a curve | Mafs. Expressions go through a safe maths parser; `eval` is never used |
| Funnel | Stages: label, optional description, optional value | Conversion rates when values are present, a uniform conceptual funnel otherwise. Will gain features |
| Collapsible | Title, rich text | For example exercise solutions |

Every animated block honours reduced motion (see `CLAUDE.md`).

## Adding or changing a block

A block is not done until each point is settled:

1. Config in the shared editor, and whether `pages` gets it.
2. Renderer, server-rendered unless it needs interactivity.
3. Reading time: whether it contributes. Text nodes count wherever they sit, rich text inside a block included; other block fields do not (`src/lib/reading-time.ts`). The Video block must add its file's `duration` through the lessons' reading-time hook.
4. Translation: which fields carry translatable text, so AI translation handles them.
5. Reduced motion, if anything moves.
6. UI strings in `messages/{en,es,ca}.json`.
7. This file.

Removing or reshaping a block touches every lesson that uses it, in every locale: plan a migration.

## Not built yet

Bespoke widgets (a component written in code and picked from a block), maths formulas, tabs, third-party embeds. Each would be a new block.
