# MultiTest.uz — Redesign "A · Night Focus" (brief for the coding agent)

You are redesigning the **presentation layer** of MultiTest.uz (web + Android) to one approved direction:
**"A — Night Focus"**: dark, calm, one indigo accent, readable type, numbers in a geometric display face.
This file is the single source of truth. When something is not specified here, choose the simplest option
that follows the tokens below — do not invent new colors, sizes, fonts or components.

Work phase by phase (§9). Start each session by reading this whole file and `AGENTS.md`.
Tick `[x]` in §9 as you finish items. Answer the owner in **Uzbek (Latin)**.

---

## 1. Hard rules (never break these)

1. **Presentation only.** Do NOT change backend PHP, routes, controllers, database, API responses, Inertia prop
   names, form field names, validation, or any business logic in React/Kotlin (timers, recording, uploads, retries,
   anti-cheat, auth). If a visual change seems to need a logic change, STOP and ask.
   - `resources/js/components/practice/QuestionPlayer.tsx`: change only JSX markup and classes. Keep every hook,
     ref, handler, effect and the `finalize()` / upload queue exactly as they are.
   - Android `SpeakingExamViewModel.kt`, repositories, network: untouched.
2. **i18n.** All user-visible text goes through `t('key', 'Default text')`. Reuse existing keys in
   `resources/lang/{uz,en,ru}.json`; when you add a key, add it to **all three** files (uz, en, ru) with real
   translations. Never hardcode Uzbek/English text in JSX.
3. **No new UI libraries.** Use what exists: Tailwind v4, Radix/shadcn components in `resources/js/components/ui`,
   `lucide-react` icons, `sonner`. Android: Material 3 Compose. Allowed new dependency: Android
   `androidx.compose.ui:ui-text-google-fonts` (for Manrope/Space Grotesk), nothing else.
4. **No emoji as icons**, no gradients, no glow/blur effects, no colored left borders on cards,
   no `animate-bounce`/`animate-pulse` decorations (only the recording dot may pulse).
5. **Accessibility:** real `<button>`/`<a>`; icon-only buttons have `aria-label`; text contrast ≥ 4.5:1;
   touch targets ≥ 44px; visible focus ring (`--ring`); colors are never the only signal (add text/icon).
6. **Verification after every phase** (all must pass, paste the results in your report):
   ```bash
   npx tsc --noEmit
   npm run build
   php artisan test          # backend must stay green; you are not changing PHP
   cd android && ./gradlew :app:compileDebugKotlin
   ```
   Android APK builds follow `AGENTS.md`: bump `android/version.properties` on every `assembleDebug/Release`.
7. **Git:** one branch per phase from `main`: `design/phase-<n>-<slug>`. Small commits
   (`style(web): …`, `style(android): …`). Never push, never deploy, never touch `.env`, `deploy.md`, `supervisor/`.
8. Do not reformat files you don't change. Run `npx prettier --write` only on changed frontend files.

---

## 2. Design tokens

### 2.1 Colors — Dark (default)

| Token | Hex | Use |
|---|---|---|
| `background` | `#0B1020` | page background |
| `surface` (card) | `#111830` | cards, panels |
| `surface-2` (muted bg) | `#172040` | chips, inputs, hover rows, active nav item |
| `surface-sunken` | `#0D1326` | header bar, audio player, transcript boxes |
| `border` | `#1E2744` | card borders, dividers |
| `border-strong` | `#2A3557` | secondary buttons, inputs, emphasized card |
| `foreground` | `#E8ECF5` | primary text |
| `muted-foreground` | `#9AA5BD` | secondary text, labels |
| `primary` | `#5B63E6` | primary buttons/fills (white text on it) |
| `primary-foreground` | `#FFFFFF` | text on primary |
| `accent-text` | `#AEB5FF` | links, numeric chips, selected text |
| `chart` / progress | `#7B86FF` | bars, timer ring, waveform |
| `success` | `#3FCF8E` (text `#6EE0A8`, bg `#173628`) | "Baholandi", recording dot |
| `warning` | `#F5B14C` (text `#F5C46A`, bg `#3A2A12`, banner bg `#2A2140`, banner border `#4A3A2A`) | "Ovoz eshitilmadi", notices |
| `danger` | `#F07178` (bg `#3A1820`) | errors, destructive |
| `ring` | `#7B86FF` | focus ring (2px, offset 2px) |

### 2.2 Colors — Light (keep the appearance toggle working)

| Token | Hex |
|---|---|
| `background` | `#F5F7FB` |
| `surface` | `#FFFFFF` |
| `surface-2` | `#EEF1F8` |
| `surface-sunken` | `#F0F3F9` |
| `border` | `#DDE3EF` |
| `border-strong` | `#C9D1E2` |
| `foreground` | `#0F1424` |
| `muted-foreground` | `#566078` |
| `primary` | `#4F57D9` / on-primary `#FFFFFF` |
| `accent-text` | `#4049C8` |
| `chart` | `#5B63E6` |
| `success` | text `#157F3B`, bg `#E3F4E8` |
| `warning` | text `#9A5B00`, bg `#FCF1DC`, border `#EBD6AE` |
| `danger` | text `#B42318`, bg `#FDECEC` |

### 2.3 CEFR levels (UzBMB multilevel, score 0–75) — use everywhere, web and Android

| Level | Range | Dark fill | Light fill | Label color on fill |
|---|---|---|---|---|
| Below A1 / A1 | 0–15 | `#3A3F52` | `#D5D9E3` | `#F1F3F8` / `#0F1424` |
| A2 | 16–37 | `#6B5A2E` | `#EBD9A8` | `#F8EED3` / `#3D2F08` |
| B1 | 38–50 | `#8A6F1E` | `#E2B95A` | `#FFF5DA` / `#3A2A00` |
| B2 | 51–64 | `#3D4FA8` | `#9EB0EC` | `#EEF1FF` / `#14205A` |
| C1 | 65–75 | `#2F7A5A` | `#9ED8BE` | `#E6FFF3` / `#0B3D27` |

Scale bar = 5 segments with widths proportional to the ranges: `grid-template-columns: 16fr 22fr 13fr 14fr 11fr`,
gap 3px, height 10px (8px on mobile), white 4×20px marker at `left: score/75*100%` with a 3px ring in the card color.

### 2.4 Typography

- Text: **Manrope** (400, 500, 600, 700). Numbers that matter (scores, timer, counts): **Space Grotesk** (500, 600, 700),
  `font-variant-numeric: tabular-nums`.
- Web: load both via Google Fonts `<link>` in `resources/views/app.blade.php` (with `preconnect`, `display=swap`);
  set `--font-sans: 'Manrope', ui-sans-serif, system-ui, sans-serif;` and add `--font-display: 'Space Grotesk', …`
  in the `@theme` block so `font-display` works as a Tailwind class.
- Scale (px): **12** caption · **14** small/labels · **15** body (default) · **18** card title · **22** section title ·
  **28** page title · **40** exam question · **56–72** big numbers. Nothing below 12px. Line-height 1.5 for text, 1–1.2 for big numbers.
- Weights: body 400/500, labels 600, titles 700. `font-black` (900) is **forbidden** except on Space Grotesk numbers.
- **No UPPERCASE + wide tracking** labels (`uppercase tracking-[0.2em]` etc.). Labels are sentence case, 14px, weight 600, `muted-foreground`.

### 2.5 Shape, spacing, elevation

- Radius: **8px** (chips, small buttons, inputs) · **10px** (buttons) · **12px** (cards, panels, banners) · **16px** (modals, mobile cards) · full (avatars, pills, round play button).
  Forbidden: `rounded-[2rem]`, `rounded-[2.5rem]`, `rounded-3xl`, any arbitrary radius.
- Spacing: 4px grid. Card padding 24px (mobile 16–18px). Gap between cards 16px; between page sections 24px.
- Page container: `max-w-[1200px] mx-auto px-6`, top padding 32px.
- Elevation: **no shadows** in dark; borders only. Light mode may use `shadow-sm` on cards. No hover "lift" transforms.
- Buttons: height 44px (40px in dense toolbars), padding-x 18px, 14px/600. Variants:
  primary (`bg-primary text-primary-foreground`), secondary (`bg-surface-2 border border-strong`),
  outline (transparent + `border-strong`), ghost, destructive (`danger`).
- Status pill: `px-2.5 py-1 rounded-full text-[13px] font-semibold` with the status bg/text pair above.

---

## 3. Implementing the tokens (web) — Phase 1

File: `resources/css/app.css`.

1. Replace the values in `:root` (light) and `.dark` (dark) with §2.1/§2.2, mapped to the **existing shadcn variable
   names** so current components keep working:
   `--background, --foreground, --card (=surface), --card-foreground, --popover, --popover-foreground, --primary,
   --primary-foreground, --secondary (=surface-2), --secondary-foreground, --muted (=surface-2), --muted-foreground,
   --accent (=surface-2), --accent-foreground, --destructive, --border, --input (=border-strong), --ring,
   --sidebar* (sidebar = surface-sunken, sidebar-accent = surface-2)` and add new ones:
   `--surface-sunken, --border-strong, --accent-text, --chart, --success, --success-bg, --warning, --warning-bg,
   --danger-bg`, each exposed in `@theme` as `--color-…` so classes like `bg-surface-sunken`, `text-accent-text`,
   `border-border-strong`, `bg-success-bg` exist.
2. **Telegram Mini App:** the current tokens use `var(--tg-theme-*, …)` overrides. Remove those overrides for
   `--background`, `--primary`, `--card`, `--foreground` so the brand stays consistent inside Telegram. Keep the
   Telegram header/bottom-bar color sync in `telegram-theme-provider.tsx`, but make it send our `--background`.
3. Set `--radius: 0.75rem` (12px) and keep the `radius-sm/md/lg` derivation.
4. Default appearance = **dark** for new visitors (`use-appearance.tsx` default `'dark'` instead of `'system'`);
   the toggle in Settings › Appearance still offers light/dark/system.

**Usage rules for every file you touch:**
- Colors only through tokens: `bg-background`, `bg-card`, `bg-secondary`, `bg-surface-sunken`, `border-border`,
  `border-border-strong`, `text-foreground`, `text-muted-foreground`, `text-accent-text`, `bg-primary`, status tokens.
  Remove hardcoded Tailwind palette classes (`slate-*`, `gray-*`, `indigo-*`, `purple-*`, `blue-*`, `violet-*`,
  `pink-*`, …) and their `dark:` twins — the tokens already switch.
- Remove `text-[9px]`, `text-[10px]`, `text-[11px]`, `tracking-[…]`, `uppercase` labels, `font-black` (except numbers),
  arbitrary radii, `shadow-2xl`, `backdrop-blur`, gradients.

Acceptance check at the end of the project (paste the output):
```bash
grep -rEc "text-\[(9|10|11)px\]|rounded-\[[0-9.]+rem\]|tracking-\[0\.[0-9]+em\]" resources/js | awk -F: '$2>0' | wc -l   # → 0 files
grep -rE "(bg|text|border|from|to)-(slate|gray|indigo|purple|violet|blue|pink)-[0-9]{2,3}" resources/js | wc -l      # → 0 (charts may keep CSS vars)
grep -rn "font-black" resources/js | grep -v "font-display" | wc -l                                                  # → 0
```

---

## 4. Shared web components to create — Phase 1

Put them in `resources/js/components/design/`. Typed props, no business logic, i18n inside.

| Component | Props | Look |
|---|---|---|
| `PageHeader` | `title`, `subtitle?`, `breadcrumbs?: {label, href?}[]`, `actions?: ReactNode` | breadcrumb 13px muted, h1 28/700, subtitle muted; actions right, wrap on mobile |
| `Card` (reuse `ui/card` restyled) | — | `bg-card border border-border rounded-xl p-6` |
| `ScoreSummary` | `score: number \| null`, `max = 75`, `source: 'teacher' \| 'ai' \| 'pending'` | label "Umumiy ball · AI" / "· O'qituvchi"; big Space Grotesk 72px number + "/ 75"; `CefrBadge` right; `CefrScale` below; pending → "—" and text "Baholanmoqda" |
| `CefrBadge` | `score` | level from §2.3, colored fill, 18px/700, radius 8 |
| `CefrScale` | `score` | §2.3 bar with marker + labels row (12px muted) |
| `CriteriaBars` | `items: {label, value: number \| null}[]` (0–15) | grid `150px 1fr 48px`; 8px track `bg-secondary`, fill `bg-chart`; "x/15" in Space Grotesk; `null` → row shows "—" and no fill |
| `StatusPill` | `status: 'graded' \| 'no_speech' \| 'wrong_language' \| 'off_topic' \| 'pending' \| 'ai_error'` | §2.5 pill; texts: Baholandi / Ovoz eshitilmadi / Boshqa tilda javob / Savolga mos emas / Baholanmoqda / AI xatosi |
| `NoticeBanner` | `tone: 'warning' \| 'danger' \| 'info'`, `title`, `children` | 12px radius, tone bg + border, lucide icon 22px, title 700 |
| `AudioPlayer` (restyle `AudioWaveform`) | `src` | `bg-surface-sunken border rounded-[10px] p-3`; 40px round primary play button; waveform bars `bg-chart`; duration Space Grotesk 13px muted |
| `QuestionResultRow` | `index`, `question` (html), `answer` | collapsible (`<button aria-expanded>`), header: number chip 32px `bg-secondary text-accent-text`, question 15/600, `StatusPill`, score "45/75"; body (2 columns ≥ 720px): player + transcript box | AI feedback list |
| `EmptyState`, `LoadingState` | `title`, `description?`, `action?` | centered, lucide icon 32px muted |

### 4.1 Data rules for results (read carefully — no invented numbers)

- Overall score: `attempt.score` (teacher) if not null → source `teacher`; else `Math.round(attempt.ai_score_avg)` if
  not null → source `ai`; else `pending`.
- Per answer `review_ai` is JSON (string) with keys: `score` (0–75), `level`, `transcript`, `fluency`, `vocabulary`,
  `grammar`, `pronunciation`, `interaction` (each a **text** comment, sometimes containing "Score: X/15"),
  `detected_language`, `is_relevant`, `override_reason` (`no_speech` | `wrong_language` | `not_relevant`).
  If `review_ai` starts with `AI Error` it is not JSON → status `ai_error`.
- Status per answer: `override_reason`→ its status (`not_relevant` → `off_topic`); `score_ai === null` and no review →
  `pending`; otherwise `graded`. The answer score shown is **`answer.score_ai`** (authoritative), never `review.score`.
- Criteria values: parse `/(\d+(?:\.\d+)?)\s*\/\s*15/` from each criterion text. If absent → `null` (show "—").
  Attempt-level criteria = average of non-null values across graded answers; if none → hide `CriteriaBars`.
- AI feedback list: the five criterion texts (strip the "Score: X/15" part), one `<li>` each, under the label
  "AI izohi". For `no_speech` show only one line: "Javob yozilmadi yoki ovoz eshitilmadi." (i18n).
- "Ovoz eshitilmagan" count = answers with status `no_speech`; if > 0 show the warning `NoticeBanner`:
  "{n} ta savolda ovoz eshitilmadi" + "Keyingi safar mikrofon ruxsatini va ovoz balandligini tekshiring."

---

## 5. Web screens (exact layouts)

Layout shell (Phase 2): keep the existing sidebar layout (`app-sidebar-layout`) but restyle: sidebar `bg-surface-sunken`
border-r; nav item 40px high, radius 8, active = `bg-secondary text-foreground font-semibold`, inactive `text-muted-foreground`;
logo "Multitest" + ".uz" in `accent-text`, 18/700, no gradient. Header bar 56px `bg-surface-sunken border-b`.
Mobile: existing bottom nav restyled with the same tokens.

### 5.1 Attempt result — `resources/js/pages/attempt/show.tsx` (Phase 3)
```
PageHeader: breadcrumbs [Urinishlar › {test name}], title "{test} — natija",
            subtitle "{date} · {parts} · {n} savol", actions: [Ulashish (outline)] [Qayta topshirish (secondary)] [Sertifikat (primary)]
Grid (auto-fit, minmax(300px,1fr), gap 16):
  [ScoreSummary + teacher-status pill]  [CriteriaBars card]  [Urinish haqida: dl rows — Javob berilgan, Ovoz eshitilmagan (warning color if >0), Tab almashtirish, Davomiyligi]
NoticeBanner (only if no_speech > 0)
H2 "Savollar" (22/700) then one QuestionResultRow per answer; the first graded one starts expanded.
Teacher/admin only: existing evaluate & re-evaluate actions move into the PageHeader actions (same handlers, restyled).
```
Keep `ShareableCertificateModal` behavior; restyle only.

### 5.2 Exam — `resources/js/pages/practice/show.tsx` + `QuestionPlayer.tsx` JSX (Phase 4)
```
Top bar (sunken, border-b): left "{test} · {part}" (700) + "Savol {i} / {n}" (13 muted);
  middle: part progress = one 6px bar per part (current = chart color, others = border) with labels under;
  right: "Chiqish" outline button (existing exit handler).
Main (max 1200, wrap): 
  Left card (flex 999 1 520px, padding 40, vertically centered): "Savol {i}" label; question HTML at 40/700 (SafeHtml);
     hint text muted.
  Right card (flex 1 1 340px, centered column, gap 24):
     phase chips grid(3): Tinglash / Tayyorlanish / Gapiring — done = bg-secondary muted with check icon, current = bg-primary white 700;
     ring timer 220px: conic ring (chart color, track = border), inner circle card color, number Space Grotesk 56/700 "0:24", "soniya qoldi" 13 muted;
     mic level meter (existing data) 40px bars, green; above it "● Yozilmoqda" (success) — only while recording;
     button "Javobni yakunlash" secondary full width (existing handler, only if it already exists);
     last save status line 13 muted, e.g. "1-savol javobi saqlandi ✓" (only if the data exists; do not add logic).
Hide the app sidebar on this page (focus mode) if the page already uses AppShell without sidebar — keep as is.
Upload-error state (existing `uploadError`): NoticeBanner danger + "Qayta urinish" primary button.
Anti-cheat modal: Radix Dialog look — card, 16px radius, danger icon, title 18/700, body 15, count pill, primary button.
```

### 5.3 Other pages (Phase 5) — same tokens/components, no layout experiments
- `dashboard.tsx`: first row = "Keyingi qadam" card (continue last unfinished attempt or "Testni boshlash" primary) +
  last result `ScoreSummary` (compact, 48px number). Charts: one `--chart` color series, gridlines `--border`,
  labels `muted-foreground` 12px. Admin stats stay below.
- `test/index.tsx`, `test/show.tsx`, `language/index.tsx`: list rows/cards with title 15/600, meta 14 muted,
  parts count chip; `premium-filters.tsx` restyled as a single filter bar (inputs 40px, radius 8).
- `mock/index.tsx`, `mock/show.tsx`, `mock-student-manager.tsx`: tables → `bg-card` with `border-border` rows,
  header row 14/600 muted, candidate code in Space Grotesk.
- `attempt/index.tsx`, `user/*`: tables as above; score column uses `CefrBadge` + number.
- `auth/*`: centered 400px card, logo, inputs 44px radius 8, primary button full width.
- `settings/*`: forms in cards, max-width 720.
- `welcome.tsx` + `components/Home/*`: lightest pass — tokens, typography, remove gradients/emoji/fake stats;
  do not restructure content.
- Modals (`components/*/create-*-modal.tsx`, `update-*`, `evaluate-attempt-modal.tsx`): radius 16, padding 24,
  title 18/700, footer buttons right-aligned (secondary + primary).

---

## 6. Android — `android/app/src/main/java/uz/multitest/app/` (Phases 6–7)

### 6.1 Theme (Phase 6)
- `core/theme/Color.kt`: replace the palette with §2.1/§2.2/§2.3 values (names: `Background`, `Surface`, `Surface2`,
  `SurfaceSunken`, `Border`, `BorderStrong`, `OnBackground`, `Muted`, `Primary`, `OnPrimary`, `AccentText`, `Chart`,
  `Success*`, `Warning*`, `Danger*`, `Cefr*`; light variants with `Light` suffix). Delete `RosePink`, `CoralOrange`,
  gradients and old names; fix all usages.
- `core/theme/Theme.kt`: full `darkColorScheme`/`lightColorScheme` (primary, onPrimary, background, onBackground,
  surface, onSurface, surfaceVariant=Surface2, onSurfaceVariant=Muted, surfaceContainer*=Surface/Surface2,
  outline=BorderStrong, outlineVariant=Border, error=Danger, secondaryContainer=Surface2). Dark is the default
  (`darkTheme = true` unless the user picked light in Profile — if no such setting exists, just default to dark).
  Status/navigation bar colors = background, using `enableEdgeToEdge` if already present; don't change behavior.
- `core/theme/Type.kt`: Manrope for all text styles, Space Grotesk for `displayLarge/Medium/Small` (numbers) via
  `androidx.compose.ui:ui-text-google-fonts` (`GoogleFont.Provider` with `R.array.com_google_android_gms_fonts_certs`).
  Scale: displayLarge 56, displayMedium 44, headlineSmall 24, titleLarge 20, titleMedium 16/600, bodyLarge 16,
  bodyMedium 14, labelLarge 14/600, labelMedium 12/600. No size below 12sp.
- Add `core/theme/Shape.kt`: small 8dp, medium 12dp, large 16dp; pass `shapes` to `MaterialTheme`.
- Components (`presentation/components/CommonComponents.kt`): replace `GradientButton` with M3 `Button`
  (height 52dp, shape 14dp) keeping the same parameters/signature so callers compile; cards = `Card` with
  `surface` color + 1dp `Border` outline, no elevation; `ErrorStateView`/`LoadingStateView` restyled; add
  `CefrBadge`, `CefrScale`, `StatusPill`, `ScoreSummaryCard` composables mirroring §4.

### 6.2 Screens (Phase 7) — layouts mirror the web
- `presentation/result/ExamResultScreen.kt`: top app bar (back, "Natija", subtitle test·date); `ScoreSummaryCard`
  (52sp number, badge, scale, "AI bahosi · o'qituvchi hali baholamagan" when applicable); warning banner if any
  `no_speech`; "Savollar" list rows (min 56dp: title, status text colored, score in Space Grotesk) that expand to
  player + transcript + AI feedback; primary "Qayta topshirish" at the bottom. Same data rules as §4.1.
- `presentation/exam/SpeakingExamScreen.kt`: UI only — big ring timer (220dp, `Chart` progress on `Border` track),
  phase chips (Tinglash / Tayyorlanish / Gapiring), question text 24sp/700, mic level bars, upload-failed state uses
  the restyled `ErrorStateView`. Do not change ViewModel calls.
- `presentation/navigation/BottomNavBar.kt`: 3 items — Testlar, Tarix, Profil; M3 `NavigationBar` with the
  active indicator in `Surface2`; mock-join entry becomes a button at the top of the Tests screen (keep the dialog).
- Dashboard/Tests/TestDetail/History/Profile/Auth: tokens + typography + components only; remove emoji, gradients,
  pink/orange accents.
- Strings stay in Uzbek as they are today (no new localization system on Android).

Verify with `./gradlew :app:compileDebugKotlin`; build the debug APK once at the end of Phase 7 following `AGENTS.md`
(bump version, report `android/MultiTest_v<version>_debug.apk`).

---

## 7. Don'ts (common mistakes — check before every commit)

- Changing a prop name, route, API field, or handler "to make the design work".
- New colors not in §2, new fonts, new radii, shadows in dark mode, gradients, emoji.
- Showing `review.score` instead of `score_ai`; inventing criteria numbers; showing 0 for "not graded yet".
- English/Uzbek literals in JSX without `t()`; adding a key to only one locale file.
- Removing the light theme or breaking the appearance toggle.
- Touching `QuestionPlayer` logic, `SpeakingExamViewModel`, repositories, or anything under `app/` (PHP).

## 8. Report template (Uzbek)

```
## Faza N — <nomi>
Branch: design/phase-N-...
O'zgargan ekranlar/komponentlar: ...
Tekshiruv: tsc ✓/✗ · build ✓/✗ · php artisan test ✓/✗ · Android compile ✓/✗/qilinmadi
Grep tekshiruvlari (§3): ...
Ochiq savollar / to'xtatilgan joylar: ...
Skrinshot kerak bo'lgan ekranlar: ...
```

## 9. Phases (tick as you go)

- [x] **Phase 1 — Tokens & components:** §3 tokens in `app.css`, fonts in `app.blade.php`, default dark, §4 components.
- [x] **Phase 2 — Shell:** sidebar, header, mobile bottom nav, `ui/*` (button, card, input, select, dialog, dropdown,
      badge, table-pagination) restyled to tokens.
- [x] **Phase 3 — Attempt result page** (§5.1) + `AttemptAnswer.tsx`, `AttemptPartAccordion.tsx`, `attempt-table.tsx`.
- [x] **Phase 4 — Exam screen** (§5.2) — markup only.
- [ ] **Phase 5 — Remaining web pages** (§5.3) + grep acceptance checks (§3) all at 0.
- [ ] **Phase 6 — Android theme & components** (§6.1).
- [ ] **Phase 7 — Android screens** (§6.2) + debug APK per `AGENTS.md`.
