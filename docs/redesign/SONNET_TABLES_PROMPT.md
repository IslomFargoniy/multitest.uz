# MultiTest.uz — Tables in rich text + mobile fit (brief for the coding agent)

Goal: tables created in the TinyMCE editor (question text, part descriptions) are shown **with borders and
th/td padding everywhere**: in the editor itself, on the web (exam screen, result page, teacher's test page),
on phones (Telegram Mini App) and in the Android app. Second goal (§3.6): **nothing overflows or gets cut on a
360–390px phone anywhere in the system**, starting with the exam screen.

Read this file and `AGENTS.md` first. Report to the owner in **Uzbek (Latin)**. Tick `[x]` in §6 when done.

## 1. Rules
1. Presentation only. No PHP, routes, props, handlers, ViewModels or data migrations. Existing HTML in the
   database must render correctly as it is (many tables were saved with no border at all).
2. Colors only from the design tokens (`resources/css/app.css`); in places that cannot read CSS variables
   (TinyMCE iframe, Android WebView) use the exact hex values given here.
3. Branch `fix/rich-tables` from `main`; small commits ending with the attribution line from the session;
   **do not push or deploy** unless the owner asks in this session.
4. After each step run and paste: `npx tsc --noEmit`, `npm run build`, `php artisan test`,
   `cd android && ./gradlew :app:compileDebugKotlin`. Android APK builds follow `AGENTS.md`
   (bump `android/version.properties`).

## 2. Why tables look broken now (do not re-investigate, just fix)
- `app.css` already has table rules, but only for `:is(.tinymce-content, .prose) table / th / td`.
  After the redesign, the places that render rich text use `<SafeHtml>` **without** those classes
  (`components/design/QuestionResultRow.tsx`, `components/practice/QuestionPlayer.tsx` ×2,
  `components/question/question-table.tsx`), so no table style applies.
- Even with the class: cell border uses `--border`, which is nearly invisible on `--surface-sunken`;
  in the exam screen the question text is 28–36px bold, so table text inherits that size.
- TinyMCE `content_style` (`components/ui/text-editor.tsx`) only sets the font: inside the editor a table with
  `border="0"` has no visible borders or padding.
- Android `presentation/components/HtmlContentView.kt` → `RichHtmlWebView` has its own CSS with the **old palette**
  (`#1E293B`, `#334155`, `#312E81`, `#A5B4FC`) and `heightIn(max = 340.dp)`, which can cut long tables.

## 3. Tasks

### 3.1 One class for all rich text — `resources/js/components/safe-html.tsx`
- Always add the class `rich-content` to the rendered `<div>`, merged with the caller's `className`
  (`cn('rich-content', className)`).
- Wrap every `<table>` in a horizontal scroll container **after sanitizing**: use a DOMPurify hook or a
  `DOMParser` pass inside the existing `useMemo` to wrap each table in `<div class="rich-table-scroll">…</div>`.
  Keep the existing `ALLOWED_TAGS` / `ALLOWED_ATTR`; do not allow new tags/attributes except `class` on that wrapper
  (add the wrapper after sanitizing so user HTML still cannot set classes).

### 3.2 Table styles — `resources/css/app.css`
Change the existing selectors from `:is(.tinymce-content, .prose)` to `:is(.rich-content, .tinymce-content, .prose)`
(keep the old names working) and set exactly:
```css
:is(.rich-content, .tinymce-content, .prose) .rich-table-scroll {
    max-width: 100%;
    overflow-x: auto;
    margin: 12px 0;
    border: 1px solid var(--border-strong);
    border-radius: 8px;
}
:is(.rich-content, .tinymce-content, .prose) table {
    width: 100% !important;
    border-collapse: collapse !important;
    margin: 0 !important;                 /* the scroll wrapper owns the margin */
    font-size: 16px !important;
    font-weight: 400 !important;
    line-height: 1.5 !important;
    letter-spacing: normal !important;
    text-align: left !important;
    color: var(--foreground) !important;
}
:is(.rich-content, .tinymce-content, .prose) :is(th, td) {
    border: 1px solid var(--border-strong) !important;   /* overrides border="0" / inline border:none */
    padding: 8px 12px !important;
    vertical-align: top !important;
    text-align: left !important;
}
:is(.rich-content, .tinymce-content, .prose) th,
:is(.rich-content, .tinymce-content, .prose) thead td {
    background-color: var(--secondary) !important;
    font-weight: 600 !important;
}
:is(.rich-content, .tinymce-content, .prose) tr > :first-child { border-left: 0 !important; }
:is(.rich-content, .tinymce-content, .prose) tr > :last-child  { border-right: 0 !important; }
:is(.rich-content, .tinymce-content, .prose) tr:first-child > * { border-top: 0 !important; }
:is(.rich-content, .tinymce-content, .prose) tr:last-child > *  { border-bottom: 0 !important; }
```
(The outer frame comes from the wrapper's border + radius; the first/last rules avoid a double outer line.)
Do not change other rules in that block (images, lists).

### 3.3 TinyMCE editor — `resources/js/components/ui/text-editor.tsx` (`init` only)
- Extend `content_style` (keep the body font line) with:
```css
table { border-collapse: collapse; width: 100%; margin: 12px 0; }
th, td { border: 1px solid #C9D1E2 !important; padding: 8px 12px !important; vertical-align: top; text-align: left; }
th, thead td { background: #EEF1F8; font-weight: 600; }
```
  (The editor runs in an iframe with a white page, so use the light-theme hex values.)
- New tables get borders by default:
  `table_default_attributes: { border: '1' }`,
  `table_default_styles: { 'border-collapse': 'collapse', width: '100%' }`.
  If the installed TinyMCE (8.x, see `node_modules/tinymce/package.json`) supports a cell default-styles option,
  set padding/border there too; if not, the CSS above is enough — do not invent option names.
- Verify the server sanitizer keeps these attributes: `app/Support/HtmlSanitizer.php` allows
  `table[border|cellpadding|cellspacing|style|width]`, `td/th[style]` and CSS `border`, `border-collapse`, `padding`.
  Add a PHP test in `tests/Feature/HtmlSanitizerTest.php` proving a TinyMCE table with
  `border="1"` and `style="border-collapse: collapse; width: 100%"` and `td style="padding: 8px 12px"` survives
  sanitizing. (Tests only — do not change the sanitizer unless the test fails; if it fails, report before changing.)

### 3.4 Android — `presentation/components/HtmlContentView.kt` → `RichHtmlWebView`
- Replace the old colors in the inline CSS with the Night Focus tokens:
  body text `#E8ECF5`; table background transparent; cell border `#2A3557`; header cell background `#172040`,
  header text `#E8ECF5` weight 600; keep `padding: 8px 12px`, `border-collapse: collapse`, `text-align: left`
  for cells; add `!important` on cell `border` and `padding` so `border="0"` tables still show lines;
  table font-size 15px.
- Wrap tables so they scroll horizontally instead of shrinking: add `div.tbl{overflow-x:auto}` and wrap each
  `<table…>…</table>` with `<div class="tbl">…</div>` via a simple string replace on `<table` / `</table>` (case-insensitive).
- Height: replace `heightIn(min = 80.dp, max = 340.dp)` so long tables are not cut — use
  `wrapContentHeight()` with `heightIn(min = 80.dp)` only. If the WebView then reports 0 height, keep a max but raise
  it to 600.dp and say so in the report. JavaScript stays disabled.

### 3.5 Practice (exam) flow — web and Android
The exam is where students actually read these tables (Part 3 "Pros / Cons" questions), so this must work during
every phase: intro, listening, preparation and recording. Markup/UI only — do not touch hooks, timers, uploads or
the ViewModel.

**Web**
- `resources/js/components/practice/QuestionPlayer.tsx`: the question `<SafeHtml>` sits in a 28–36px bold block; the
  §3.2 CSS already forces table text to 16px/400. Make sure the left question card can shrink so the table scrolls
  instead of stretching the layout: add `min-w-0` to the card container (`flex-[999_1_520px] …`) and to the
  `<SafeHtml>` wrapper. The part intro `<SafeHtml>` (part description) gets the same treatment.
- Keep the question (and its table) visible in the `audio`, `ready` and `recording` phases — verify, do not change
  phase logic.
- `resources/js/pages/practice/index.tsx` (start screen): the description is printed as plain text
  (`{attempt.mock?.description || attempt.test?.description}`), so HTML descriptions show raw tags/entities.
  Render it with `<SafeHtml className="text-base leading-relaxed text-muted-foreground" html={…} />`.
- Phone (Telegram Mini App, 390px): the table scrolls horizontally inside the card; the page itself must not
  scroll sideways.

**Android** — `presentation/exam/SpeakingExamScreen.kt`
- The question is rendered as `Text(text = parseHtmlToPlainText(questionText), …)` (around line 418), which flattens
  tables (Pros/Cons columns merge into one text) and drops images. Change only this rendering:
  if `questionText` contains `<table` or `<img` (case-insensitive) → render `HtmlContentView(html = questionText)`
  (it already switches to the styled WebView for tables, §3.4); otherwise keep the current `Text` with its current
  style. Same for the part intro description if it can contain HTML (`PartIntroView`, `partDescription`).
- Check that the WebView fits inside the exam layout during preparation and recording (no overlap with the timer
  or buttons); the screen may scroll vertically.

### 3.6 Mobile fit — whole system (P0 first)
Found in review (owner's screenshot from the Telegram Mini App: the Part 3 question text runs out of its card and
over the next card). Fix exactly these, then do the audit at the end of this section.

**P0 — exam screen layout bug** (`components/practice/QuestionPlayer.tsx`, ~lines 455–520)
- The two cards use `flex-[999_1_520px]` and `flex-[1_1_340px]` inside `flex flex-col lg:flex-row`. In the column
  direction (phones) flex-basis becomes the **height**: the question card is forced to ~520px tall and its text
  overflows the border. Make the basis apply only in the row layout:
  `w-full min-w-0 lg:flex-[999_1_520px]` and `w-full lg:flex-[1_1_340px]`; keep `min-h-[460px]` only from `lg:`
  (`lg:min-h-[460px]`), so on phones the cards size to their content.
- Question text size: `text-[22px] leading-snug font-semibold sm:text-[28px] lg:text-[36px] lg:font-bold`
  (36px bold on a 390px phone is too big for Part 3 questions). Tables inside still use the §3.2 16px style.
  Add `break-words` so long words never overflow.
- Phone order: the question must come first and be readable without scrolling past the timer. On `< lg` make the
  timer card compact: one row with the phase label, the timer number (Space Grotesk 32px, ring hidden below `sm`)
  and the mic level; `sticky bottom-0` with `bg-card/border-top` and `pb-[env(safe-area-inset-bottom)]`, so the
  student always sees the remaining time while reading a long question. Desktop (`lg:`) stays as it is.
  Pure layout/classes — reuse the same values and handlers; no logic changes.
- Phase chips (`grid grid-cols-3`): allow wrapping text (`leading-tight`, `min-h-9`) so "Tayyorlanish" fits at 360px.

**P1 — attempt result rows** (`components/design/QuestionResultRow.tsx`)
- The header row puts the question (`truncate`), the status pill, the score and the chevron on one line; on a phone
  the question shrinks to a few characters. Below `sm`: question on its own line with `line-clamp-2`, and a second
  line with status pill + score; from `sm:` keep the current single row.

**P1 — other places**
- `components/mock/mock-student-manager.tsx`: the candidates `<table>` sits in `overflow-hidden`; change the wrapper
  to `overflow-x-auto` and give the table `min-w-[560px]` so columns don't squash on phones.
- `components/design/PageHeader.tsx`: title `text-[22px] sm:text-[28px]`, `break-words`.
- `components/design/ScoreSummary.tsx`: big number `text-[44px] sm:text-[56px]`.
- `components/Home/Hero/index.tsx` (~line 298): score breakdown `grid-cols-4` → `grid-cols-2 sm:grid-cols-4`.
- `components/practice/QuestionPlayer.tsx` and other full-screen pages in the Telegram Mini App: use
  `min-h-dvh` instead of `min-h-screen` where the page is the whole screen (Telegram's in-app browser reports a
  shorter visual viewport).

**Android** (`presentation/exam/SpeakingExamScreen.kt`)
- Besides §3.5 (tables via `HtmlContentView`): question text `headlineSmall` (24sp) is fine, but the content area
  must scroll (`verticalScroll`) and the timer/actions must stay visible (bottom bar), same idea as the web P0.
  If they already do, say so; do not change ViewModel calls.

**Audit (then fix what you find, same rules)**
Run these and handle every hit that can overflow at 360px, or explain in the report why it is fine:
```bash
cd resources/js
grep -rn "flex-\[[0-9]" .                                   # flex-basis inside flex-col = height trap
grep -rnoE "\b(h|min-h)-\[[0-9]+(px|rem)\]" .              # fixed heights on content containers
grep -rnoE "\b(w|min-w)-\[[0-9]+(px|rem)\]" .              # fixed widths: must have max-w-[95vw] or sm: prefix
grep -rnoE "(^|[\" ' ])text-(\[(2[8-9]|[3-9][0-9])px\]|4xl|5xl|6xl|7xl)" . | grep -v "sm:\|md:\|lg:"   # big text without a mobile size
grep -rln "<table" . | xargs grep -L "overflow-x-auto"        # tables without horizontal scroll
grep -rn "whitespace-nowrap" .                                # must not hold long user text
```
Then check every page at 360px and 390px width in the browser dev tools (and in Telegram if you can):
dashboard, test list, test detail, practice start, exam (all phases), attempt list, attempt result, mock list/show,
settings, login/register. Nothing may scroll sideways except intentional table scroll areas.

## 4. Acceptance (paste results)
- `grep -n "rich-content" resources/js/components/safe-html.tsx resources/css/app.css` → present in both.
- `grep -n "table_default_attributes\|th, td" resources/js/components/ui/text-editor.tsx` → present.
- `grep -n "#312E81\|#1E293B\|#A5B4FC\|#334155" android/app/src/main/java/uz/multitest/app/presentation/components/HtmlContentView.kt` → nothing.
- New PHP sanitizer test passes; all checks from rule 4 pass.
- `grep -n "parseHtmlToPlainText(questionText)" android/app/src/main/java/uz/multitest/app/presentation/exam/SpeakingExamScreen.kt`
  → only in the non-table branch (or gone); `HtmlContentView(` is used there for tables/images.
- `grep -n "SafeHtml" resources/js/pages/practice/index.tsx` → present.
- `grep -rn "flex-\[[0-9]" resources/js` → only `lg:`-prefixed usages.
- §3.6 audit greps: every remaining hit explained in the report.
- In the report, list the screens the owner must check with the "Universal healthcare should be adopted globally"
  question (it has a Pros/Cons table): TinyMCE editor (existing table + a newly inserted one), practice start screen, exam screen in every phase
  (listening, preparation, recording) on desktop and on a 390px phone / Telegram Mini App, Android exam screen,
  attempt result page (expanded question), teacher test page; dark and light; 390px phone width; Android app.

## 5. Report template (Uzbek)
```
## Jadvallar — bajarildi
Branch: fix/rich-tables
O'zgargan fayllar: ...
Tekshiruv: tsc ✓/✗ · build ✓/✗ · php artisan test ✓/✗ (yangi sanitizer testi ✓/✗) · Android compile ✓/✗
Qabul grep'lari: ...
Egasi tekshirishi kerak bo'lgan ekranlar: ...
Savollar / og'ishlar: ...
```

## 6. Steps
- [ ] 3.1 `SafeHtml` class + table scroll wrapper
- [ ] 3.2 table CSS
- [ ] 3.3 TinyMCE editor + sanitizer test
- [ ] 3.4 Android WebView table styles and height
- [ ] 3.5 Practice (exam) flow — web `QuestionPlayer` / `practice/index`, Android `SpeakingExamScreen`
- [ ] 3.6 Mobile fit: P0 exam layout → P1 result rows & others → audit (+ debug APK per `AGENTS.md`)
