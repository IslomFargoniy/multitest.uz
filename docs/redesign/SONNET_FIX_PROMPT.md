# MultiTest.uz — Redesign fixes (brief for the coding agent)

The "A · Night Focus" redesign (`docs/redesign/ANTIGRAVITY_PROMPT.md`, §2 tokens) is merged and deployed.
This brief fixes the problems found in review. Read this file, `AGENTS.md` and §1–§2 of
`docs/redesign/ANTIGRAVITY_PROMPT.md` before you start. Work phase by phase (§5), tick `[x]` when done,
and report to the owner in **Uzbek (Latin)**.

## 1. Rules

1. Presentation only (same rules as ANTIGRAVITY_PROMPT §1): no PHP, routes, props, handlers, ViewModels,
   repositories or business logic. All text via `t('key', 'Default')`, new keys in uz/en/ru.
2. Branch per phase from `main`: `fix/design-<n>-<slug>`; small commits (`fix(ui): …`); **do not push, do not deploy**
   unless the owner explicitly says so in this session (procedure in §6).
3. After every phase run and paste: `npx tsc --noEmit`, `npm run build`, `php artisan test`,
   `cd android && ./gradlew :app:compileDebugKotlin`. APK builds follow `AGENTS.md` (bump `android/version.properties`).
4. Only touch the files named in a task unless a compile error forces a one-line follow-up; say so in the report.

## 2. Root cause of the main bug (read carefully)

In the Telegram Mini App (and any phone) the **bottom navigation does not show which tab is active**.
`resources/js/components/app-bottom-nav.tsx` marks the active item with `bg-secondary text-foreground`
on a `bg-surface-sunken` bar:

| Pair | Dark | Light |
|---|---|---|
| active pill `--secondary` vs bar `--surface-sunken` | `#172040` vs `#0D1326` → **1.16 : 1** | `#EEF1F8` vs `#F0F3F9` → **1.02 : 1** |
| active text `--foreground` vs inactive `--muted-foreground` | 2.09 : 1 | — |

Both differences are invisible on a phone. Also the button's `font-semibold` is overridden by the inner
`<span className="… font-medium">`, so the label weight never changes. The same weak pattern is used by the
desktop sidebar (`--sidebar-accent` = `--secondary` on `--sidebar` = `--surface-sunken`) and by Android's
`NavigationBar` (`indicatorColor = secondaryContainer`, `selected*Color = NightPrimary` ≈ 3.6 : 1 on surface).

**The rule from now on — every "current/selected" state must be visible without relying on a background
tint alone:**
- foreground (icon + label) switches to `--accent-text` (`#AEB5FF` dark = 9.5 : 1 on the bar, `#4049C8` light),
- label weight 700 vs 500,
- plus a tinted indicator `--nav-active-bg` (see §3.1),
- plus `aria-current="page"` (links) / `aria-selected` / `data-state` as appropriate.

## 3. Tasks

### 3.1 Tokens — `resources/css/app.css`
Add and expose in `@theme` (as `--color-nav-active-bg`, `--color-nav-active-fg`):
```
:root  { --nav-active-bg: #C3C8FF; --nav-active-fg: #2E35A8; }
.dark  { --nav-active-bg: #262F66; --nav-active-fg: #AEB5FF; }
```
Point `--sidebar-accent` → `var(--nav-active-bg)` and `--sidebar-accent-foreground` → `var(--nav-active-fg)`
in both themes (keep `--sidebar` as is). Do not change any other token.
Check (paste output): contrast of `--nav-active-bg` vs `--surface-sunken` ≥ 1.4 : 1 and `--nav-active-fg` on
`--nav-active-bg` ≥ 4.5 : 1, both themes. Use this snippet:
```bash
python3 -c "
def L(h):
  h=h.lstrip('#');r,g,b=[int(h[i:i+2],16)/255 for i in(0,2,4)];f=lambda c:c/12.92 if c<=.03928 else((c+.055)/1.055)**2.4
  return .2126*f(r)+.7152*f(g)+.0722*f(b)
def C(a,b):x,y=sorted([L(a),L(b)],reverse=True);return round((x+.05)/(y+.05),2)
print(C('#262F66','#0D1326'),C('#AEB5FF','#262F66'),C('#C3C8FF','#F0F3F9'),C('#2E35A8','#C3C8FF'))"   # expected: 1.48 6.46 1.45 5.95
```
If a value fails, adjust only the `--nav-active-bg` lightness, keep the hue.

### 3.2 Bottom navigation — `resources/js/components/app-bottom-nav.tsx` (P0)
- Replace each `<button>` + `router.visit` with Inertia `<Link href={item.href} onClick={() => impact('light')} … >`
  (same haptic, real link semantics, `prefetch` allowed). Add `aria-current={isActive ? 'page' : undefined}`.
  Wrap the items in `<nav aria-label={t('nav.bottom', 'Asosiy menyu')}>`.
- Active match: compare the path without query string, using a `match` prefix per item:
  `/dashboard`, `/test`, `/attempt`, `/settings` (so Profile stays active on every `/settings/*` page).
- If the bar renders on `/practice/*` (exam), hide it there (focus mode). Do not change any other layout.
- Item layout (Material 3 style): column, gap 4px, min-height 56px.
  Icon sits in a 56×30 pill: active `bg-nav-active-bg text-nav-active-fg`, inactive transparent `text-muted-foreground`;
  icon size 22, `strokeWidth` 2.25 active / 2 inactive.
  Label 12px: active `font-bold text-nav-active-fg`, inactive `font-medium text-muted-foreground`.
  Remove the per-item rounded background on the whole button.
- Bar: keep `bg-surface-sunken border border-border rounded-xl` (no shadows). Bottom offset: keep
  `env(safe-area-inset-bottom)`, and in Telegram also respect
  `var(--tg-safe-area-inset-bottom, 0px)` + `var(--tg-content-safe-area-inset-bottom, 0px)` (Telegram sets these CSS
  vars on `:root`): `bottom: calc(0.75rem + max(env(safe-area-inset-bottom), var(--tg-safe-area-inset-bottom, 0px)))`.
  Keep the content padding in `app-sidebar-layout.tsx` consistent with the new height.

### 3.3 Other selected states (web) (P1)
Apply the §2 rule, nothing else:
- `components/ui/sidebar.tsx` menu buttons: `data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-semibold`
  (the tokens now map to nav-active); icons inherit color.
- `components/nav-main.tsx`: active text → `text-nav-active-fg`.
- `layouts/settings/layout.tsx`: active tab = `bg-nav-active-bg text-nav-active-fg font-semibold`, icon `text-nav-active-fg`.
- `components/practice/StepTabs.tsx`: current step uses `bg-primary text-primary-foreground`; completed `bg-secondary text-muted-foreground` + check icon; upcoming outline. (Only classes.)
- `components/Header/Navigation/HeaderLink.tsx` (landing): active = `text-nav-active-fg font-semibold` + 2px bottom border `border-b-2 border-nav-active-fg`.
- `components/ui/toggle.tsx` / toggle-group: `data-[state=on]:bg-nav-active-bg data-[state=on]:text-nav-active-fg`.

### 3.4 Web leftovers (P2)
- Remove `backdrop-blur*` from `components/Header/index.tsx` (use solid `bg-card` / `bg-black/60` overlay) and
  `components/MobileSearchModal.tsx`. Remove emoji from code comments in `Footer/index.tsx`, `Header/index.tsx`,
  `auth/login-card.tsx`, `auth/register-card.tsx` (comments only).

### 3.5 Android (P1/P2) — `android/app/src/main/java/uz/multitest/app/`
- `core/theme/Color.kt`: add `NavActiveBg = #262F66`, `NavActiveFg = #AEB5FF` (light: `#C3C8FF`, `#2E35A8`); delete the
  unused aliases `RosePink`, `CoralOrange` (grep first; must be 0 usages).
- `presentation/navigation/BottomNavBar.kt`: `NavigationBarItemDefaults.colors(selectedIconColor = NavActiveFg,
  selectedTextColor = NavActiveFg, indicatorColor = NavActiveBg, unselectedIconColor = onSurfaceVariant,
  unselectedTextColor = onSurfaceVariant)`; selected label `FontWeight.Bold`; container `surfaceContainer`/sunken
  with a 1dp top `Border` divider.
- `presentation/splash/SplashScreen.kt`: replace the vertical gradient background with solid `colorScheme.background`.
- `presentation/components/CommonComponents.kt`: mic level bars → solid `Chart` (recording) / `Border` (idle);
  remove the unused `gradient` parameter from `GradientButton` and fix every call site (grep).
- Optional (P2, only if time): in `presentation/**` replace direct `Night*` color constants with
  `MaterialTheme.colorScheme.*` equivalents (mapping: NightBackground→background, NightSurface→surface,
  NightSurface2→surfaceVariant, NightTextMuted→onSurfaceVariant, NightBorder→outlineVariant, NightBorderStrong→outline,
  NightPrimary→primary). Status colors (success/warning/danger/CEFR) stay as named constants.

## 4. Acceptance (paste results)
- Contrast snippet from §3.1: all four values pass.
- `grep -rn "backdrop-blur" resources/js | wc -l` → 0; `grep -rn "RosePink\|CoralOrange\|verticalGradient\|horizontalGradient" android/app/src/main/java | wc -l` → 0.
- `grep -n "aria-current" resources/js/components/app-bottom-nav.tsx` → present.
- Screens the owner must check in Telegram (list them in the report): bottom nav on Dashboard, Testlar,
  Urinishlar, Profil (dark **and** light); desktop sidebar active item; Settings tabs; Android bottom nav.

## 5. Phases
- [x] **Phase 1 — P0:** §3.1 tokens + §3.2 bottom navigation.
- [x] **Phase 2 — P1:** §3.3 other selected states (web) + Android bottom nav (§3.5 first bullet pair).
- [x] **Phase 3 — P2:** §3.4 web leftovers + rest of §3.5 (+ optional Night* migration). Build the debug APK at the end per `AGENTS.md`.

## 6. Deploy (ONLY when the owner explicitly asks in this session)
SSH is allowed for `younine@193.180.213.188`; run commands with `sudo -n`. Never print `.env` values.
```bash
cd /var/www/multitest_uz_usr69/data/www/multitest.uz
php artisan down --retry=60
git pull origin main          # must be a fast-forward; if not, STOP and report
COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev -o --no-interaction
npm ci && npm run build
php artisan migrate --force   # expected: "Nothing to migrate" for this work
php artisan optimize
chown -R multitest_uz_usr69:multitest_uz_usr69 storage bootstrap/cache
php artisan queue:restart
php artisan up
```
Then check `https://multitest.uz/`, `/login`, `/up` return 200 and that no new `production.ERROR` lines appear
in `storage/logs/laravel*.log` for 2 minutes. Report the result.

## 7. Report template (Uzbek)
```
## Faza N — <nomi>
Branch: fix/design-N-...
O'zgargan fayllar: ...
Kontrast: <4 ta qiymat>
Tekshiruv: tsc ✓/✗ · build ✓/✗ · php artisan test ✓/✗ · Android compile ✓/✗
Telegram'da tekshirish kerak bo'lgan ekranlar: ...
Savollar / to'xtagan joylar: ...
```
