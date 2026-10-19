# Rich-text editor

One Lexical configuration, `contentEditor` (`src/editor`), shared by lessons and `pages`, and one renderer, `<RichText>` (`src/components/rich-text`), for every Lexical field on the site. Pages get every block today; a block that makes no sense on pages would be left out of their editor.

**Status (2026-10-19):** built. The lesson page that shows the table of contents arrives with the public course pages.

## Editors

- `contentEditor`: lessons and pages. Everything below.
- `basicEditor`: paragraphs, inline formatting, lists and links. The config's default, so short texts (course descriptions, instructor bios) use it.
- `nestedEditor`: the rich text inside a Callout or a Collapsible: `basicEditor` plus images and Code. No headings, so the table of contents stays flat.

## Text

- Headings H2–H4. H1 belongs to the document's `title` field.
- Bold, italic, underline, strikethrough, inline code; ordered, unordered and check lists; quote; horizontal rule; tables (Lexical's native table feature, rendered with shadcn `Table`).
- Inline links: external URLs, or pages, courses and lessons stored as documents (see Links).
- Images from `media`, with an optional caption; click to see them full size (shadcn `Dialog`). Only public files go through the image optimizer (see [media.md](media.md)). A non-image file in an upload node renders as a link to it; videos go in the Video block.
- **Table of contents** (`<TableOfContents>`): top-level H2 and H3. Every top-level H2–H4 gets an anchor slugified from its text without accents (`Introducción` → `introduccion`); repeats get `-2`, `-3`… `headingAnchors` (`src/lib/rich-text.ts`) computes them once for both the headings and the table.

## Links

The link field (`linkField` in `src/fields/link.ts`) is shared by the Link block, the header and the footer: a page, course or lesson, or a URL, plus "new tab". Lexical's inline links store the same `{ relationTo, value }` shape.

- Internal targets are documents, never populated (`maxDepth: 0`), so a slug change never breaks a link. `<RichText>` and the header and footer collect the targets (`linkRefsIn`) and resolve them in one query per collection (`getLinkHrefs` in `src/lib/content.ts`).
- A target counts only when it is published in the visitor's language (drafts too while staff preview). A lesson also needs its course to be published there. Anything else renders as plain text, or not at all for a Link block or nav item.
- Hrefs: `/<page>`, `/courses/<course>`, `/courses/<course>/<lesson>`, locale-less for next-intl's `Link` (`src/lib/paths.ts`).
- The URL option takes `https://`, `mailto:`, `tel:` or a site path such as `/courses`, which gets the locale prefix like an internal link. Use it for routes that are not documents (the catalogue, `/account`).
- The lesson picker only offers lessons that belong to a course: the rest have no URL.

## Blocks

Configs in `src/editor/blocks.ts` and `code-block.ts`; renderers in `src/components/rich-text/blocks`. Built on shadcn components wherever one exists.

| Block | Holds | Renders with | Translatable text |
| --- | --- | --- | --- |
| Link | Label, the link field, appearance `link` or `button`, variant `default`, `secondary`, `outline` or `ghost`, size `sm`, `default` or `lg` | shadcn `Button` | label |
| Code | Language, optional file name, code | Payload's code block (Monaco) in the admin; Shiki on the server with light and dark themes, copy button | none |
| Callout | Kind (info, tip, warning, danger), optional title, rich text | shadcn `Alert`, announced as a note | title, rich text |
| Video | A video from `media`, optional caption | Native `<video>` with the file's subtitle tracks, none on by default | caption |
| Chart | Type (bar, line, area, pie), title, caption, CSV with a header row, x-axis column (first column when empty) | shadcn charts (Recharts); the same numbers as a table for screen readers | title, caption, CSV labels |
| Function plot | Axis ranges and labels, hidden numbers for conceptual plots, curves (expression in `x`, label, shading above or below between two x values), labelled points, caption | Mafs, static (no pan or zoom); the curves and points as text for screen readers | axis labels, curve and point labels, caption |
| Funnel | Stages: label, optional description, optional value; caption | shadcn chart (Recharts funnel) plus a list of stages. With values: share of the previous stage and overall conversion. Without: equal steps | labels, descriptions, caption |
| Collapsible | Title, rich text | shadcn `Collapsible`; closed content stays in the page (`hidden="until-found"`), so find-in-page and search engines see it | title, rich text |

Validation on save:

- **Chart CSV** (`src/lib/chart-data.ts`): a header of unique names, at least one row, as many values per row as columns, numbers in every series column (empty is a gap), at most 500 rows; pie charts take one series of values of zero or more. The delimiter is read from the header row: Spanish spreadsheets export `;` with decimal commas, which are accepted whenever commas do not separate columns. Numbers carry no thousands separators.
- **Plot expressions** (`src/lib/math-expression.ts`): a hand-written parser compiles them to closures; nothing reaches `eval` or `Function`. It takes `x`, numbers, `pi`/`π`, `e`, `+ - * / ^` (also `**`, `·`, `×`), implicit multiplication (`2x`, `2(x+1)`), and `sin cos tan asin acos atan sinh cosh tanh sqrt cbrt abs exp ln log log2 floor ceil round sign`. Each maximum must be above its minimum.
- **Funnel**: every stage has a value or none does, and the first value is above 0.

Charts and funnels use the theme's `--chart-1…5` colours, which are greys today; plots use Mafs' palette with the site's background and foreground.

## Reading time

Lessons only (`src/collections/lessons.ts`): text nodes count wherever they sit, rich text inside blocks included, at 200 words a minute (`src/lib/reading-time.ts`); other block fields do not. Each Video block adds its file's `duration`, once per use. Images and other blocks add nothing.

## Adding or changing a block

A block is not done until each point is settled:

1. Config in `src/editor/blocks.ts`, added to `contentEditor` (and to `nestedEditor` if it belongs inside callouts and collapsibles), and whether `pages` gets it.
2. Renderer in `src/components/rich-text/blocks`, wired in `converters.tsx`. Server-rendered unless it needs interactivity; data is parsed on the server and the client gets plain values. Use the shadcn component when one fits.
3. Reading time: whether it contributes (see above).
4. Translation: which fields carry translatable text (the table above), so AI translation handles them.
5. Reduced motion: CSS animations are neutralised globally; JS animations read `useReducedMotionConfig()` (Recharts takes it as `isAnimationActive`).
6. Accessibility: a text alternative for anything drawn.
7. UI strings in `messages/{en,es,ca}.json` (namespace `content`).
8. This file, and `pnpm generate:types` for its `interfaceName`.

Removing or reshaping a block touches every lesson and page that uses it, in every locale: plan a migration.

## Not built yet

Bespoke widgets (a component written in code and picked from a block), maths formulas, tabs, third-party embeds. Each would be a new block.
