# DoodleDuel Admin — Frontend Master Prompt

*Paste everything below the line into your coding agent. It builds a full-control admin console for the DoodleDuel site, using only HTML, CSS and vanilla JavaScript, with the same monochrome design system as the game. Read section 3 first: it explains what "full control" can and cannot mean without a backend.*

---

# MASTER PROMPT — DOODLEDUEL ADMIN CONSOLE

## Full-Control Admin Dashboard — Frontend Only

## 1. Role and mission

Act as a senior frontend engineer, product designer for data-heavy interfaces, and accessibility specialist.

Build the **DoodleDuel Admin Console**: a polished, responsive dashboard from which an administrator can configure and control every part of the DoodleDuel frontend: site content, words, players, rooms, assets, theme, feature flags, moderation, game rules, data backup, and an audit trail.

This phase is **frontend only**:

- **Allowed:** HTML, plain CSS, vanilla JavaScript (ES2020+ native modules), Canvas or inline SVG for charts, Web Crypto, `localStorage`, `IndexedDB`, `BroadcastChannel`, `FileReader`, Blob downloads.
- **Forbidden:** any backend, server API, `fetch` to your own endpoints, WebSocket or Socket.IO code, database server, React, TypeScript, bundlers, CSS frameworks, chart libraries, and npm dependencies. No build step.

The result must be a **working admin prototype**, not a mockup: every form saves, every table sorts and filters, every change is visible on the public site.

## 2. Operating rules for you, the agent

1. Inspect the existing DoodleDuel repository first (`css/`, `js/`, `public/assets/`) and reuse its tokens, components, router and storage helpers. Do not fork the design system.
2. Do not ask clarifying questions. Decide, record each decision in `README.md` under **Assumptions**, and continue.
3. Work in the stages of section 16. Verify each stage before the next.
4. Keep files small and single-purpose (about 400 lines maximum per JavaScript file).
5. Never use `eval`, `new Function`, `document.write`, inline event handlers, or `innerHTML` with data that is not a trusted static template.

## 3. Honesty rule: what "full control" means here

Without a server, an admin console can only control **this browser's copy** of the site. State this clearly in the UI and README:

- Show a persistent **Local Admin Mode** badge with help text: *Changes apply to this browser only. A real deployment needs a backend and server-side authentication.*
- The login gate is a **UI convenience, not security**. Anyone with DevTools can bypass client-side checks. Never describe it as secure, never store a plaintext password, and never claim role enforcement is real.
- Roles (Owner, Admin, Moderator, Viewer) are simulated: they hide or disable controls and are recorded in the audit log, but they do not protect data.
- "Players", "rooms" and "reports" are the simulated entities from the DoodleDuel demo engine plus sample data the admin can create. Do not imply real users.

## 4. Architecture and integration with the public site

The admin must **actually drive** the game site, so use a shared configuration layer.

- `js/shared/config-service.js` (new, used by both the public app and the admin): reads and writes one versioned `siteConfig` object, validates it against a schema with safe defaults, and exposes `get()`, `set(patch)`, `reset(section)`, and `subscribe(listener)`.
- The public app consumes config only through this service: landing copy, feature highlights, footer pages, default game settings, word lists, scoring weights, blocklist, feature flags, maintenance banner, avatar and asset overrides.
- Changes propagate live between the admin tab and the public tab with `BroadcastChannel` (fall back to the `storage` event). The public site re-renders the affected parts without a reload.
- Config is stored in `localStorage` (small data) and `IndexedDB` (large data: uploaded images, audit log, word lists). Wrap every storage call in `try/catch` and degrade to memory with a one-time notice.
- Keys are namespaced and versioned: `doodleduel:v1:*`. Add a small migration runner (`schemaVersion`) so future versions can upgrade stored data.
- The admin talks only to `js/admin/services/admin-service.js`, which implements an interface a future Node.js service can replace: `listWords`, `saveWord`, `deleteWord`, `listPlayers`, `updatePlayer`, `listRooms`, `closeRoom`, `getConfig`, `saveConfig`, `listAudit`, `exportData`, `importData`, `resetData`. Do not add fake `fetch` calls or fake sockets.

## 5. Design system

Reuse the DoodleDuel tokens exactly. Do not introduce new colors.

- **Interface:** strictly black, white and neutral grayscale. Dark: `#000000`, `#0D0D0D`, `#171717`, text `#FFFFFF` / `#A3A3A3`. Light: `#FFFFFF`, `#F5F5F5`, `#EBEBEB`, text `#111111` / `#666666`. Glass `rgba(255,255,255,0.05)` dark and `rgba(0,0,0,0.04)` light, borders `0.12`, blur 12 to 20px.
- **No chromatic UI.** Status (success, warning, danger, info) is communicated with **icon + text + pattern or weight**, never color alone. Use distinct icons (check, triangle, octagon, info) in grayscale.
- **Fonts:** Inter for UI, JetBrains Mono for IDs, counts, timestamps and code, Cormorant Garamond only for the dashboard title.
- **Spacing, radius, elevation, motion, z-index:** use the existing tokens. Data-dense views use `--space-2` and `--space-3` inside tables and `--space-6` between sections.
- **Charts** are drawn with Canvas or inline SVG in grayscale only. Differentiate series with line style (solid, dashed, dotted), markers and direct labels, not hue.
- Support dark and light themes, reduced motion, and a **density toggle** (comfortable or compact).

## 6. Layout and navigation

- Single `admin.html` (or the `#/admin` route if the game is one SPA; choose one and document it) with a hash router: `#/admin/dashboard`, `/words`, `/players`, `/rooms`, `/content`, `/assets`, `/theme`, `/game-rules`, `/features`, `/moderation`, `/analytics`, `/audit`, `/data`, `/team`, `/settings`.
- **Desktop:** fixed sidebar (collapsible to icons), top bar with global search, theme toggle, Local Admin Mode badge, role switcher (for simulation) and logout.
- **Mobile:** sidebar becomes an off-canvas drawer, tables become stacked cards or horizontal-scroll containers, primary actions stay reachable.
- **Command palette** (`Ctrl or Cmd + K`): jump to any page, run quick actions (add word, close all rooms, export data, toggle maintenance), fully keyboard operable.
- Breadcrumbs, unsaved-changes guard on forms (`beforeunload` and route change), and a visible **Saved / Saving / Error** indicator.
- Focus moves to the page heading on every route change. Include a skip link.

## 7. Authentication gate (simulated)

- First run: the admin creates an Owner passcode (minimum 8 characters, strength meter with text feedback). Store only a **salted PBKDF2 hash** via Web Crypto (`SubtleCrypto.deriveBits`, at least 150,000 iterations, random salt). Never store the passcode itself.
- Later runs: login form with a labeled field, generic error text ("Incorrect passcode"), client-side attempt limiter (5 failures then a 30-second lockout using a stored timestamp), and a visible note that this gate is not real security.
- Session stored in `sessionStorage` with an idle timeout (default 15 minutes, configurable), a countdown warning dialog 60 seconds before logout, and a **Lock now** button.
- "Forgot passcode" is a documented local reset that wipes admin data after a typed confirmation. It must not bypass the gate silently.
- Authentication code is isolated in `js/admin/auth.js` so it can be swapped for real server auth later.

## 8. Roles and permissions (simulated)

Define a permission map in one file (`js/admin/permissions.js`) and use it everywhere through `can(permission)`.

| Role | Scope |
| --- | --- |
| Owner | Everything, including team management, reset and data import |
| Admin | Everything except team management and full reset |
| Moderator | Players, rooms, moderation, reports; read-only elsewhere |
| Viewer | Read-only dashboards, analytics and audit log |

Controls the current role cannot use are **disabled with an explanatory tooltip**, not hidden silently. Every permission denial and every role switch is written to the audit log.

## 9. Modules (full-control scope)

Each module has: a list or table view, a detail or edit panel, search, filters, sorting, pagination or virtual rendering over 100 rows, bulk actions, empty state, loading state, error state, and an undo toast after destructive actions.

### 9.1 Dashboard

- Summary cards: words, categories, simulated players, active simulated rooms, open reports, feature flags on, last backup date, storage used (estimate via `navigator.storage.estimate()` when available).
- Quick actions: add word, create sample room, toggle maintenance, export backup.
- Recent audit activity (last 10) and a health checklist (missing assets, empty categories, no backup in 7 days, storage nearly full).
- Mini charts: games played per day and top words, from simulated and logged data.

### 9.2 Words manager

- Full CRUD for words with `text`, `category`, `difficulty` (easy, medium, hard), `enabled`, `tags`, `createdAt`.
- Category manager: add, rename, merge, delete (with reassign prompt), reorder.
- Validation: letters and spaces only, 2 to 32 characters, trimmed, case-insensitive duplicate detection with a clear merge or skip choice.
- Bulk: select many, enable, disable, change category or difficulty, delete.
- Import and export CSV and JSON with a **preview and error report** before applying; reject files over a size limit; never execute imported content.
- A live "preview in game" panel showing how three random words would appear for the drawer.

### 9.3 Players and avatars (simulated)

- Table of known profiles: nickname, avatar, role (player, bot), created, last seen, games played, score, status (active, muted, banned).
- Actions: rename, change avatar from the 10 avatars (with preview and the initials fallback), mute, ban, unban, delete, reset stats, add sample players or bots.
- Bulk actions with confirmation. Muted and banned states must be honored by the public demo engine (muted players cannot chat, banned nicknames cannot join).

### 9.4 Rooms (simulated)

- Live list of rooms from the demo engine: code, host, players, state, round, started time.
- Actions: inspect (players, settings, current round, scoreboard), kick a player, force-end round, force-end game, close room, create sample room.
- Auto-refresh every 2 seconds only while the tab is visible; clean up on route leave.

### 9.5 Content editor (landing and pages)

- Edit hero title and subtitle, button labels, feature highlight cards (add, edit, reorder, remove), footer links, and the About, Privacy, Rules and Credits page bodies.
- Rich text is **not** allowed. Use a limited, safe Markdown subset (paragraphs, bold, italics, links, lists) converted with a small hand-written parser that builds DOM nodes and allows only `http`, `https` and `mailto` links.
- Split-pane **live preview** that renders exactly what the public site will show, plus Publish, Revert to last published, and Reset to default. Keep the last 10 revisions per page with restore.

### 9.6 Assets manager

- Gallery of every asset group from the manifest (avatars, toolbar, game-status) with name, intrinsic size, file status (found or missing), and where it is used.
- A **missing assets report** produced by trying to load each image.
- Replace an asset by uploading a PNG, WebP or SVG: validate type and size (maximum 1 MB), read with `FileReader`, store in `IndexedDB`, and have the public site prefer the override with fallback to the original file. Reset override per asset.
- Show a preview on both dark and light surfaces. SVG uploads are rendered only through `<img>` and never inlined.

### 9.7 Theme and branding

- Edit the grayscale token set only: surface levels, glass opacity (0.02 to 0.15), blur (8 to 24px), border opacity, radius scale, and font choices from a safe list.
- Built-in **contrast checker** computing WCAG ratios for text on every surface in both themes. Block saving any combination below AA (4.5:1 body, 3:1 large text and UI) with a clear explanation.
- The color pickers are restricted to neutral grays (equal R, G and B). Reject anything chromatic.
- Live preview using real components; Reset to defaults.

### 9.8 Game rules

- Defaults and limits for rounds (2 to 8), draw time (30 to 180s), bots (0 to 7), hint timing, word choices per turn, scoring weights (base, time bonus, first-guess bonus, drawer ratio), close-guess sensitivity, and chat cooldown.
- Presets (Quick, Standard, Marathon) and a **simulator**: run a headless dry run of N demo rounds with the chosen rules and show the resulting score distribution in a chart.
- Show a clear diff of changes before saving.

### 9.9 Feature flags

- Toggles with descriptions and a safe default for: chat, practice mode, sound effects, reduced-motion default, fill and eyedropper tools, bots, hints, public avatar upload (off), new-player registration, and **maintenance mode**.
- Maintenance mode shows a grayscale banner or full-page notice on the public site with an editable message and an optional scheduled end time. The admin console remains reachable.
- Each flag shows where it takes effect and who last changed it.

### 9.10 Moderation

- Blocklist manager for nicknames, chat words and words in the word list (add, remove, import, test a string against the list).
- Chat filter settings: masking style (asterisks or removal), strictness, and rate limits.
- **Reports queue** (simulated sample reports plus any generated by the demo engine): status (open, reviewing, resolved, dismissed), assign, add note, resolve with action (warn, mute, ban, dismiss), full history per report.
- Chat log viewer for the current session with search and a "copy for review" action.

### 9.11 Analytics

- Grayscale line, bar and donut-style charts (Canvas or SVG, hand-written) for games per day, average round length, correct-guess rate, popular categories, and hardest words. Data comes from lightweight local event logging added to the demo engine (`game:started`, `round:ended`, `guess:correct`).
- Date range picker (7, 30, 90 days), table view for every chart (accessible alternative), and CSV export.
- Every chart has a text summary and `role="img"` with an `aria-label`.

### 9.12 Audit log

- Append-only record of every change: timestamp, actor role, action, entity, before and after summary, and a diff view.
- Filters by date, actor, module and action type, search, and CSV or JSON export. The log has a size cap (for example 5,000 entries) with oldest-first rotation and a notice.
- Entries cannot be edited or deleted from the UI. Only the Owner's full reset clears the log, and that act is itself recorded first.

### 9.13 Data: backup, restore, reset

- **Export:** one JSON file containing config, words, players, content revisions, flags, blocklist and audit log (optionally excluding images), with a `schemaVersion`, `exportedAt` and a checksum.
- **Import:** validate against the schema, show a summary of what will change, offer Merge or Replace, and create an automatic pre-import backup in `IndexedDB`.
- **Reset:** per-module reset and full reset, each requiring the user to type a confirmation phrase (for example `RESET WORDS`).
- Reminder banner when no backup has been made for 7 days.

### 9.14 Team (simulated)

- Local list of admin profiles with role, created date, last login and status. Add, edit role, disable, delete (Owner only, never the last Owner).
- Clearly labeled as simulated.

### 9.15 Settings

- Idle timeout, theme, density, reduced-motion preference, date and time format, default landing module, keyboard shortcut reference, and change passcode (requires the current one).

## 10. Cross-cutting UX rules

- **Confirmation levels:** reversible actions get an undo toast (10 seconds); destructive or bulk actions get a confirm dialog naming the exact items; irreversible actions require typing a phrase.
- **Forms:** visible labels, inline validation on blur, error summaries linked with `aria-describedby`, disabled-with-reason submit buttons, and unsaved-changes protection.
- **Tables:** semantic `<table>` with `scope` headers, sortable columns announced with `aria-sort`, sticky header, row selection with a select-all checkbox, keyboard navigation, column visibility menu, and persistent sort and filter per module.
- **Empty, loading and error states** are designed for every module, not left blank.
- **Notifications:** polite live region toasts, never the only place an error appears.
- **Keyboard:** every action reachable, shortcuts documented in a dialog opened with `?`.

## 11. Data model (starting point)

Define and validate these in `js/shared/schema.js`. Reject unknown shapes on import.

```js
siteConfig = {
  schemaVersion: 1,
  content: { hero, features: [], pages: { about, privacy, rules, credits } },
  gameRules: { rounds, drawTime, bots, hints, wordChoices, scoring: {...}, chatCooldownMs },
  flags: { chat, practice, sound, bots, hints, fillTool, eyedropper, maintenance: { on, message, endsAt } },
  theme: { tokens: {...}, density },
  moderation: { blocklist: { nicknames: [], chat: [], words: [] }, filter: {...} }
}
word   = { id, text, category, difficulty, enabled, tags: [], createdAt }
player = { id, nickname, avatar, kind, status, stats: {...}, createdAt, lastSeenAt }
report = { id, type, targetId, reason, status, notes: [], createdAt }
audit  = { id, at, actorRole, action, entity, summary, before, after }
```

## 12. Project structure

```
doodleduel/
├── admin.html
├── css/admin/
│   ├── admin-layout.css
│   ├── admin-components.css   (tables, forms, dialogs, toasts, charts)
│   └── admin-responsive.css
├── js/shared/
│   ├── config-service.js
│   ├── schema.js
│   ├── storage-idb.js
│   └── sync.js                (BroadcastChannel wrapper)
└── js/admin/
    ├── admin.js               (bootstrap)
    ├── router.js
    ├── auth.js
    ├── permissions.js
    ├── audit.js
    ├── command-palette.js
    ├── services/admin-service.js
    ├── ui/                    (table, form, dialog, toast, chart, markdown, diff)
    └── modules/               (dashboard, words, players, rooms, content, assets,
                               theme, game-rules, features, moderation, analytics,
                               audit-view, data, team, settings)
```

Each module exports `mount(root, ctx)` and `unmount()`. Use one listener-registration utility so listeners and timers are removed on route leave. No listener is ever attached twice.

## 13. Security, privacy and robustness

- No `eval` or dynamic code. No `innerHTML` with imported or user-entered data; use `textContent` and DOM APIs. The Markdown subset parser builds nodes and whitelists URL schemes.
- Validate and size-limit every import and upload. Treat imported JSON as hostile: schema-check, strip unknown keys, cap array lengths and string lengths.
- Add a restrictive `<meta http-equiv="Content-Security-Policy">` for the admin page (self scripts, self styles, self and `data:` images, no inline scripts).
- Never log passcodes or hashes. Never put sensitive data in URLs.
- Handle storage quota errors, missing `IndexedDB`, and corrupt records without crashing.
- Make the Local Admin Mode limitation visible, never hidden.

## 14. Accessibility and performance

- WCAG AA in both themes, visible focus rings, accessible names for icon buttons, dialogs with focus trap and restore, 44px touch targets, no state shown by color alone.
- Tables with 5,000 rows must stay responsive: paginate or virtualize, debounce search, and avoid layout thrashing.
- Stop all polling and animation when the tab is hidden. Respect `prefers-reduced-motion`.
- Lazy-load module code with dynamic `import()` per route.

## 15. Acceptance criteria

The work is complete only when **all** are true:

1. The admin opens from a static server, shows Local Admin Mode, and first run creates a hashed Owner passcode.
2. Login lockout, idle timeout, lock now and logout all work.
3. Role simulation disables the right controls with explanations and logs every switch and denial.
4. Words CRUD, categories, bulk actions, validation, and CSV and JSON import and export work with previews.
5. Changing words, copy, rules, flags or theme in the admin changes the public DoodleDuel site live in another tab.
6. Players, rooms and reports can be managed, and mute and ban are honored by the game.
7. Assets can be audited and overridden, with fallback to the original file.
8. The theme editor refuses chromatic values and any combination below AA contrast.
9. Maintenance mode shows the public notice and leaves the admin reachable.
10. Analytics charts render in grayscale with table alternatives and CSV export.
11. The audit log records every change, is append-only from the UI, and exports.
12. Backup, import (with pre-import backup) and per-module and full reset work with typed confirmations.
13. Undo toasts restore deleted items, and unsaved-change guards prevent accidental loss.
14. The command palette and all keyboard shortcuts work.
15. The layout works at 360, 768, 1024 and 1440px with no horizontal page scroll.
16. No backend, framework, bundler or dependency is required, and the console shows no errors.
17. The admin uses only `admin-service.js` and `config-service.js`, so a Node.js service can replace them later.
18. No chromatic color appears anywhere in the interface.

## 16. Delivery stages

1. **Foundation:** shared config service, schema, storage helpers, sync, admin shell, router, theme, permissions.
2. **Auth and audit:** passcode setup, hashed storage, login gate, session timeout, audit log core.
3. **Core data modules:** words, categories, players, rooms.
4. **Site control:** content editor with preview and revisions, flags and maintenance, game rules and simulator.
5. **Appearance and assets:** asset manager, theme editor with contrast checker.
6. **Moderation and analytics:** blocklists, reports queue, event logging, charts.
7. **Data safety:** export, import, backup reminder, resets, team and settings.
8. **Hardening:** command palette, accessibility pass, responsive pass, performance pass, README.

## 17. Manual verification you must perform and report

- Open the public site and the admin in two tabs; change a word, a headline and a flag and confirm the public tab updates without reload.
- Import a deliberately malformed JSON file and an oversized file, and confirm clean rejection.
- Try 6 wrong passcodes, confirm lockout; wait for idle timeout; confirm the warning and logout.
- Switch to the Viewer role and confirm every write control is disabled with an explanation.
- Try to save a theme with a chromatic or low-contrast color and confirm it is blocked.
- Delete 20 words, undo, then restore from a backup.
- Disable `localStorage` and `IndexedDB` in DevTools and confirm graceful fallback and notice.
- Run Lighthouse Accessibility and fix anything below 95.
- Confirm no timers or listeners remain after navigating away from every module.

## 18. How to run

ES modules require HTTP. Document in the README:

```
python3 -m http.server 5173
```

Then open `http://localhost:5173/admin.html`.

## 19. Final report

When finished, reply with files created and modified, features mapped to the 18 acceptance criteria, how to run, manual checks and results, assumptions, and the exact steps to replace `admin-service.js`, `config-service.js` and `auth.js` with a Node.js backend and real authentication later.

Deliver a complete, working, frontend-only admin console. Do not add a backend. Do not use React or TypeScript. Do not claim client-side security.
