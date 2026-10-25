# DoodleDuel — Frontend Master Prompt

*Paste everything below the line into your coding agent (Claude Code, Codex, Cursor). It merges your original master prompt and your monochrome design system, resolves the conflicts between them, and adds the asset manifest, engine rules and verification steps the first version was missing.*

---

# MASTER PROMPT — DOODLEDUEL

## Premium Monochrome Multiplayer Drawing and Guessing Game — Frontend Only

## 1. Role and mission

Act as a senior frontend engineer, UI/UX designer, canvas and game-loop specialist, and accessibility reviewer.

Build **DoodleDuel**: a complete, polished, responsive drawing-and-guessing game with original branding. It is inspired by the general genre of online draw-and-guess games, but it must not copy the branding, layouts, names or assets of any existing game.

This phase is **frontend only**:

- **Allowed:** one `index.html`, plain CSS files, and vanilla JavaScript (ES2020+ native modules), the Canvas API, Web Audio API, Clipboard API, `localStorage` and `sessionStorage`.
- **Forbidden:** any backend, server API, `fetch` to your own endpoints, WebSocket or Socket.IO code, database, React, TypeScript, Node.js runtime code, bundlers, transpilers, CSS frameworks, or npm dependencies. No build step. The app must open from any static file server.

The result must be a **working playable prototype**, not a mockup. Do not stop after a visual design. Implement the interactions and verify them.

## 2. Operating rules for you, the agent

1. Inspect the repository and `public/assets/` first. Use real assets where they exist.
2. Do not ask clarifying questions. Make reasonable decisions, record each one in `README.md` under **Assumptions**, and continue.
3. Work in the stages of section 17. Finish and manually verify each stage before starting the next.
4. Keep files small and single-purpose. No JavaScript file over roughly 400 lines; split it instead.
5. Never use `eval`, `new Function`, `document.write`, inline event handlers or `innerHTML` with user-controlled text.
6. When this prompt and a general habit disagree, follow this prompt.

## 3. Demo Mode honesty rule

Everything multiplayer is simulated in the browser. That includes opponents, room codes, joins, chat, timers and scores.

- Show a persistent **Demo Mode** badge on the lobby, the game screen and the results screen, with a tooltip or help text: *All players are simulated on this device.*
- Name simulated players like players but mark them with a small "Bot" label in the player list.
- Joining a room code only works for rooms created in this browser session. An unknown code must show a clear, friendly error rather than a fake success.
- Never imply a cross-device connection. No fake "connecting to server" delays presented as networking.

## 4. Resolved decisions (conflicts between the two source documents)

| Topic | Decision |
| --- | --- |
| Base black | Use `#000000` (design system). The earlier `#050505` is dropped. |
| Muted text | `#A3A3A3` dark, `#666666` light (design system). |
| Glass surface | `rgba(255,255,255,0.05)` dark, `rgba(0,0,0,0.04)` light. A "strong glass" token `rgba(255,255,255,0.11)` dark, `rgba(0,0,0,0.08)` light is used only for hovered or selected panels. |
| Borders | `rgba(255,255,255,0.12)` dark, `rgba(0,0,0,0.12)` light. |
| Accent | White in dark mode, black in light mode. No chromatic accents anywhere in the UI. |
| Drawing colors | The **interface** is strictly monochrome. The **drawing palette** is content, not chrome, so the provided color swatches (red, orange, yellow, green, blue, purple) are allowed inside the palette only. They must never appear in buttons, borders, glows, badges or backgrounds. |
| Selected swatch or tool | Never indicate selection by color alone. Use a ring plus a check mark or a raised state, and `aria-pressed`. |
| Default stroke | White in dark mode, near-black (`#111111`) in light mode, switching automatically if the user has not picked a color. |
| Language of the project | HTML is used for structure. All styling is CSS and all behavior is JavaScript. |

## 5. Design system

### 5.1 Tokens (single source of truth)

Define everything in `css/tokens.css` as CSS custom properties on `:root`, with theme overrides on `[data-theme="light"]`. Components consume semantic tokens only; no raw hex or rgba values inside component files.

- **Color:** `--bg-primary`, `--bg-secondary`, `--bg-tertiary`, `--bg-hover`, `--text-primary`, `--text-secondary`, `--accent`, `--glass`, `--glass-strong`, `--border`, `--focus-ring`.
  - Dark: `#000000`, `#0D0D0D`, `#171717`, hover `#1A1A1A`, text `#FFFFFF` and `#A3A3A3`.
  - Light: `#FFFFFF`, `#F5F5F5`, `#EBEBEB`, hover `#EEEEEE`, text `#111111` and `#666666`.
- **Typography:** Inter for UI and body, Cormorant Garamond for large editorial headings only, JetBrains Mono for room codes, timers, scores and labels. Load from Google Fonts with `font-display: swap` and keep system fallbacks (`system-ui`, `Georgia`, `ui-monospace`).
- **Spacing:** multiples of 4px: `--space-1` 4, `--space-2` 8, `--space-3` 12, `--space-4` 16, `--space-6` 24, `--space-8` 32, `--space-12` 48, `--space-16` 64, `--space-24` 96.
- **Radius:** `--radius-sm` 6, `--radius-md` 10, `--radius-lg` 16, `--radius-xl` 24, `--radius-full` 9999.
- **Elevation:** four levels (flat, subtle, raised, overlay) as `--shadow-0` to `--shadow-3`, softer in light mode.
- **Glass:** `--blur: 16px` (allowed range 12 to 20px).
- **Motion:** `--dur-fast: 150ms`, `--dur-base: 250ms`, `--dur-slow: 400ms`, one easing token. Animate `transform` and `opacity` only.
- **Layers:** `--z-base`, `--z-nav`, `--z-dropdown`, `--z-modal`, `--z-toast`.
- **Breakpoints:** 480, 768, 1024, 1280 (document in a comment, since custom properties cannot be used in media queries).

### 5.2 Components

Build reusable classes in `css/components.css`:

- **Buttons:** primary, secondary, ghost, icon. Min height 44px for touch. States: hover, active, focus-visible, disabled, loading.
- **Cards and panels:** glass surface, border, radius, padding tokens, with decorative layers separated from content layers so text always stays readable.
- **Inputs:** visible labels, consistent height, distinct focus, disabled and invalid states, accessible error text linked with `aria-describedby`.
- **Navigation:** active-state indication, keyboard operable, collapses on mobile.
- **Modal:** focus trap, `Escape` to close, returns focus to the opener, backdrop blur, `aria-modal`.
- **Toast:** polite live region for copy confirmations and errors.

### 5.3 Glass rules

- Provide a solid fallback under `@supports not (backdrop-filter: blur(1px))` so panels stay readable.
- Do not stack more than two blurred layers on one screen area. Blur is expensive.
- Highlights are subtle grayscale hairlines. No colored glow, no neon, no gradients beyond a faint neutral sheen.

## 6. Assets

All artwork is provided as transparent PNGs. Treat the manifest below as authoritative and put it in `js/assets.js` as the only place file paths appear.

### 6.1 Folders and manifest

- `public/assets/avatars/` (320 x 320, circular artwork on a transparent background): `samurai`, `ninja`, `cat`, `fox`, `robot`, `skull`, `ghost`, `bear`, `astronaut`, `penguin`.
- `public/assets/toolbar/`:
  - Tools: `brush`, `eraser`, `fill`, `eyedropper`, `undo`, `redo`, `clear`, `more`.
  - Colors: `color-black`, `color-dark-gray`, `color-gray`, `color-white`, `color-red`, `color-orange`, `color-yellow`, `color-green`, `color-blue`, `color-purple`.
  - Brush sizes: `brush-size-small`, `brush-size-medium-small`, `brush-size-medium`, `brush-size-large`, `brush-size-selected`.
- `public/assets/game-status/`:
  - Rewards: `trophy`, `crown-large`, `crown-small`, `medal-1`, `medal-2`, `medal-3`, `star`, `badge`.
  - States: `correct`, `wrong`, `notification`, `add-player`, `offline`.
  - Timers: `hourglass-icon`, `fast-timer`, `loading`.
  - Round banners (contain baked-in text): `countdown-3`, `countdown-2`, `countdown-1`, `go`, `word-guessed`, `round-over`.
  - Illustrations: `empty-lobby`, `disconnected`, `podium`, `hourglass-splash`, `finish-flag`.
- `public/assets/sounds/`: empty by default. Sounds are generated with Web Audio.

All files are `.png`. Intrinsic sizes vary (icons 140 to 290px, banners up to about 400px wide), so size them with CSS and keep the aspect ratio by setting only width or only height.

### 6.2 Asset handling rules

- One helper, `assetUrl(group, name)`, plus one `<img>` factory that sets `alt`, `width`, `height`, `decoding="async"` and `loading="lazy"` (except above-the-fold images).
- **Fallbacks, never blocking:** on `error`, replace avatars with an initial-letter circle and everything else with a small inline SVG or CSS shape. A missing file must never throw or stop startup.
- **Dark artwork on light theme:** the artwork was drawn for dark surfaces. In light mode, place avatars and status art on a dark-toned chip (`--bg-tertiary` inverted token such as `--chip-bg`) instead of recoloring the PNGs. Do not use CSS filters that introduce color.
- **Baked-in text:** `word-guessed`, `round-over`, `go`, and `countdown-*` may only be used for exactly those states. Dynamic text (names, scores, round numbers, the secret word) is always real HTML.
- Use game-status assets sparingly, for the states they belong to, not as decoration on every panel.
  - `empty-lobby`: lobby with only the user. `disconnected` and `offline`: a simulated player drop. `podium`, `trophy`, `crown-*`, `medal-*`: results. `countdown-*`, `go`: round start. `word-guessed`: a correct guess. `round-over`: round end. `finish-flag`: final round complete. `hourglass-*`, `fast-timer`: timer and word-selection states. `loading`: any wait over 300ms.
- Toolbar icons render at 32px visual size inside 44px hit targets.

## 7. Pages and navigation

A single `index.html` containing one `<section data-view="...">` per view, a tiny hash router (`#/`, `#/play`, `#/lobby`, `#/game`, `#/results`) and a focus-managed view switcher. Works on any static server, supports browser back and forward, and moves focus to the view heading on every change.

**A. Landing:** logo and nav; hero with the Cormorant Garamond title; one-paragraph explainer; **Play Now** (primary) and **Create Room** (secondary); three to four feature highlights; a live preview of the glass drawing board that animates a short looping sample stroke (paused when the tab is hidden or reduced motion is on); footer with About, Privacy, Rules and Credits as simple modals or anchored sections.

**B. Play setup:** editable nickname (2 to 16 characters, trimmed, validated); avatar picker for 10 avatars (radio-group semantics, arrow-key navigation); theme toggle; **Create Room**; join-by-code input and **Join Room**; **Practice** (single player); basic settings: rounds (2 to 8), draw time (30 to 120s), word difficulty (easy, medium, hard, mixed), hints on or off, number of bots (1 to 7). Persist nickname, avatar, theme and settings.

**C. Lobby:** room code in mono type with copy button and invite-link copy (Clipboard API with a textarea `execCommand` fallback and a visible success or failure toast); player list with avatar, nickname, host crown, "Bot" label and simulated status; player count; settings panel (editable only by the host); **Start Game**, **Leave Room**; Demo Mode badge; `empty-lobby` illustration when no bots exist. Bots join with small randomized delays (400 to 1600ms) using managed timers.

**D. Game:** scoreboard (rank, avatar, name, score, "guessed" or "drawing" state shown by icon plus text); round `n / total`; mono countdown; drawer identity; masked word for guessers; word-choice panel with three options for the drawer; glass drawing board; toolbar; chat and guess panel; correct-guess feedback; round summary overlay; final transition to results.

**E. Results:** winner with podium and trophy, full ranking with `medal-1/2/3`, rounds completed, **Play Again** (same room and settings, scores reset), **Return to Lobby**, **Home**.

**F. Settings modal** (reachable from the nav on every view): theme (dark, light, system), sound effects toggle (default off), reduced-motion preference (system, on, off), drawing board options (show grid dots, smoothing on or off, default stroke size), and **Clear local data** with a confirmation dialog.

## 8. Glass drawing surface (Option B)

Layers, bottom to top, inside one `.board` container with a fixed aspect ratio of 4:3 (`aspect-ratio: 4 / 3`, fluid width):

1. Neutral grayscale backdrop (optionally a very faint dot grid when enabled in settings).
2. Translucent glass surface (`--glass` plus blur).
3. The crisp `<canvas>` (transparent, never given `opacity`).
4. Pointer-transparent feedback overlay (`pointer-events: none`): cursor ring showing brush size, countdown pulse, frozen-state veil.

Requirements:

- `touch-action: none` on the canvas; prevent default on pointer events; use `setPointerCapture` and handle `pointercancel`, `lostpointercapture` and leaving the window mid-stroke.
- No `opacity` on the canvas element. Strokes are fully opaque.
- Strokes and the eraser must stay usable and visible when `backdrop-filter` is unsupported (fallback solid surface from section 5.3).
- Add a visible keyboard-accessible alternative for the page (shortcuts for undo, redo, brush, eraser) and announce state changes through a polite live region.

## 9. Drawing engine (`canvas.js`, `drawing-tools.js`)

### 9.1 Data model, independent of pixels

Coordinates are stored **normalized to the board** (x and y from 0 to 1) so resizing never loses or distorts the drawing.

```js
// one operation in the ordered list
{ id, type: 'stroke', tool: 'brush' | 'eraser', color, size /* fraction of board width */, points: [[x, y], ...] }
{ id, type: 'clear' }
```

State: `ops[]` (committed), `redoStack[]`, `activeStroke` (in progress). A new committed op clears `redoStack`. A `clear` op is undoable. Cap history at about 200 ops and cap points per stroke by dropping points closer than 0.5 CSS pixels.

### 9.2 Rendering

- The canvas backing store is `cssWidth * devicePixelRatio` by `cssHeight * devicePixelRatio`; scale the context once so drawing uses CSS pixel units.
- Re-measure with `ResizeObserver`, then **replay `ops[]` from scratch**. Never read pixels back to resize.
- Strokes use `lineCap = 'round'`, `lineJoin = 'round'` and quadratic-curve smoothing between midpoints so lines look smooth rather than jagged.
- **Eraser:** render as `globalCompositeOperation = 'destination-out'` on the same transparent canvas so the glass surface shows through. Reset the composite mode after each op.
- A single-tap dot (down and up with no movement) must render as a round dot.
- During a stroke, draw incrementally for speed; on commit, no full redraw is needed unless a resize occurred.
- Batch pointer input with `requestAnimationFrame`, use `getCoalescedEvents()` when available, and stop all animation loops when `document.hidden`.

### 9.3 Tools

- **Brush** and **Eraser:** fully functional.
- **Sizes:** five sizes mapped to the five size icons (for example 0.004, 0.008, 0.014, 0.022, 0.034 of board width), with `brush-size-selected` as the active ring.
- **Colors:** 10 swatches from the assets, grayscale first. Selecting any color while the eraser is active switches back to the brush.
- **Undo, Redo, Clear:** disabled states reflect availability; Clear asks for confirmation (inline confirm popover or the shared modal). Shortcuts: `Ctrl or Cmd + Z`, `Ctrl or Cmd + Shift + Z` and `Ctrl or Cmd + Y`.
- **Stretch goals (implement only after everything else passes):** `fill` as a scanline flood fill recorded as a snapshot operation, and `eyedropper` sampling the committed stroke color under the pointer. If skipped, hide these two buttons rather than show dead controls.

### 9.4 Who may draw

Only the current drawer can draw, and only during `DRAWING`. For guessers, pointer input is ignored and the board shows the drawer's strokes.

## 10. Local demo engine (`game-engine.js`, `state.js`)

### 10.1 Single source of truth

One `store` holds all state and exposes `getState()`, `dispatch(action)` and `subscribe(listener)`. UI modules only render from state and call service functions. No module keeps its own copy of game truth.

### 10.2 State machine

`HOME -> SETUP -> LOBBY -> WORD_SELECTION -> DRAWING -> ROUND_RESULTS -> (WORD_SELECTION | GAME_RESULTS)`; `GAME_RESULTS -> LOBBY | HOME | WORD_SELECTION` (Play Again). Illegal transitions are ignored and logged to the console with `console.warn`.

### 10.3 Timers

- One `TimerManager` owns every `setTimeout` and `setInterval`, keyed by name. Starting a named timer cancels the previous one with that name.
- Leaving a view, leaving a room or finishing a round calls `timers.clearAll(scope)`.
- The countdown derives remaining time from `Date.now()` against an end timestamp rather than counting ticks, so it stays accurate if the tab is throttled. Pause visuals when hidden.

### 10.4 Rules

- **Drawer rotation:** every player draws once per round cycle, in a shuffled but fair order. The user may be chosen as the drawer.
- **Word selection:** the drawer sees three words from the configured difficulty; the user as drawer has 15 seconds to choose or one is picked automatically. Bots pick after 1 to 3 seconds.
- **Hints:** guessers see underscores per letter and spaces preserved (for example `_ _ _ _   _ _ _ _ _`). If hints are on, reveal one random letter at 50% and another at 75% of the time limit. The secret word is **never present in guesser-visible DOM or state** that the UI renders; keep it inside the engine and compare there.
- **Guess matching:** normalize with trim, lowercase, Unicode NFD diacritic removal and collapsed whitespace. A correct guess is accepted once per player. If the guess is a "close" miss (edit distance 1 on words of 5 or more letters), show a private "So close!" message without revealing the word.
- **Scoring:** guesser points = `100 + round(400 * timeRemaining / drawTime)`, with a bonus of 50 for the first correct guesser. Drawer points = `round(average of guesser points * 0.5)` for each correct guess, capped at 250 per round. Compute with integers only.
- **Round end:** when all guessers have guessed or time expires, reveal the word, show the round summary with points gained, then advance after a short controlled delay (skippable).
- **Bots:** each bot has a skill value (0.3 to 0.9) used to schedule its guess time as a fraction of the round, with random chance of never guessing. Bot chat includes a few harmless wrong guesses from the word pool and short reactions. No bot may ever guess instantly.
- **Bot drawing (when a bot is the drawer):** replay procedural strokes that progressively fill the board (looping curves, spirals, zigzags drawn point by point over time). This is a convincing placeholder; do not claim it depicts the word.
- **Practice mode:** the user draws every round, no bots guess, a gentle "Practice" label replaces the timer pressure (timer optional).
- **Pausing:** if the tab is hidden for more than the remaining time, the round simply ends on return; never fire stale timers in bursts.

### 10.5 Backend-ready service boundary

UI code must only talk to `js/services/game-service.js`, which re-exports the active implementation. The demo implementation lives in `js/services/demo-service.js` and implements exactly this interface:

```js
createRoom(settings) -> room
joinRoom(code, player) -> room | error
leaveRoom()
updateSettings(patch)
startGame()
chooseWord(index)
submitStroke(op)      // drawer only
submitGuess(text)
finishRound()         // internal timer, also exposed for tests
playAgain()
```

The service emits events through a small `EventEmitter` using the names a socket server would later use: `room:updated`, `round:started`, `round:hint`, `stroke:added`, `board:cleared`, `chat:message`, `player:guessed`, `round:ended`, `game:ended`. Do not add fake `fetch`, fake WebSocket objects or unused dependencies. A future Node.js and Socket.IO service must be able to replace `demo-service.js` without touching any UI module.

## 11. Chat and guessing (`chat.js`)

- Message list with avatar, nickname, text, and a distinct system-message style (join, leave, correct guess, hint, round events) that does not rely on color alone.
- Input: max 60 characters for guesses, trimmed, no empty sends, Enter sends, light client-side rate limit (one message per 400ms).
- All user and bot text is inserted with `textContent` or `createTextNode`. Never `innerHTML`.
- `role="log"` with `aria-live="polite"` so new messages are announced without stealing focus; auto-scroll only when the user is already near the bottom.
- The input is disabled with a clear reason ("You are drawing", "You already guessed it", "Round not active").
- A correct guess by the user shows a private confirmation and a public "X guessed the word" system line **without** the word.

## 12. Word list (`data/words.js`)

A plain exported object organized by category and difficulty. At least 6 categories (for example animals, food, objects, places, actions, fantasy) by 3 difficulties with at least 10 words each (more than 180 words total). Provide a `pickWords(difficulty, count, excluding)` helper that avoids repeats within a game. Keep words one or two words long, plain letters and spaces only, original content, no offensive terms.

## 13. Sound and motion

- Web Audio only, with a lazily created `AudioContext` after the first user gesture. **Off by default.** Master toggle plus volume in settings.
- Generated cues: countdown tick, round start, correct guess, round end, winner fanfare, soft UI click. Short, quiet, and never layered on rapid repeats.
- Respect `prefers-reduced-motion` and the user setting (`data-motion="reduced"` on `<html>`): reduce transitions to opacity or instant, disable the landing-page loop, skip confetti-style effects.
- Cinematic effects (countdown 3, 2, 1, `go` banner, `word-guessed` banner, winner reveal) use `transform` and `opacity`, are short (under 1.2s each), and never block input for longer than the countdown itself.

## 14. Persistence (`storage.js`)

- Namespaced and versioned keys: `doodleduel:v1:profile`, `doodleduel:v1:settings`, `doodleduel:v1:theme`.
- Every read and write is wrapped in `try/catch`. If storage is unavailable (private mode, quota), fall back to in-memory state and show a single non-blocking notice once.
- Validate and sanitize anything read from storage before use; discard corrupt data and fall back to defaults.
- Theme default follows `prefers-color-scheme`, then the saved choice wins. Apply the theme before first paint (a tiny inline script in `<head>`) to avoid a flash.
- "Clear local data" removes only `doodleduel:*` keys, after confirmation, then resets the UI.

## 15. Project structure

```
doodleduel/
├── index.html
├── README.md
├── css/
│   ├── tokens.css
│   ├── base.css
│   ├── layout.css
│   ├── components.css
│   ├── game.css
│   └── responsive.css
├── js/
│   ├── app.js                 (bootstrap, wiring)
│   ├── navigation.js          (hash router, view focus)
│   ├── state.js               (store, actions)
│   ├── storage.js
│   ├── assets.js              (manifest, assetUrl, image factory, fallbacks)
│   ├── avatars.js             (avatar config, picker, avatar element factory)
│   ├── canvas.js              (layers, resize, replay renderer)
│   ├── drawing-tools.js       (pointer input, tools, undo/redo)
│   ├── chat.js
│   ├── sound.js
│   ├── settings.js
│   ├── ui/                    (small view modules: landing, setup, lobby, game, results)
│   ├── services/
│   │   ├── game-service.js    (single import point for the UI)
│   │   └── demo-service.js    (local simulation)
│   ├── engine/
│   │   ├── timers.js
│   │   ├── scoring.js
│   │   ├── bots.js
│   │   └── guess.js           (normalize, match, near-miss)
│   └── data/
│       └── words.js
└── public/assets/{avatars,toolbar,game-status,sounds}/
```

Use `<script type="module" src="js/app.js">`. Add one event-binding utility that registers listeners per view and removes them on teardown, so no listener is ever attached twice. Each `ui/*` module exports `mount(root)` and `unmount()`.

## 16. Accessibility, performance and security

**Accessibility:** semantic landmarks (`header`, `nav`, `main`, `footer`), one `h1` per view, labeled controls, `aria-pressed` on toggle buttons, accessible names on all icon-only buttons, visible `:focus-visible` rings in both themes, skip link, trap and restore focus in modals, WCAG AA contrast in both themes (verify text, placeholders, disabled states and borders), touch targets of at least 44px, no state conveyed by color alone, and a live region for score and timer milestones (not every second).

**Performance:** no layout thrashing inside pointer handlers; `will-change` only during active animations; lazy-load non-critical images; the page must stay smooth with 8 simulated players and 200 operations in history.

**Security and robustness:** no `eval`, no inline handlers, no dynamic `innerHTML` with user data, strip control characters and collapse whitespace from nicknames and chat, escape nothing manually by relying on `textContent`, safe clipboard fallbacks, handle missing assets and storage failures, and never leak the secret word to guesser-side DOM, attributes or the console.

## 17. Delivery stages

Complete and manually check each stage before moving on.

1. **Foundation:** tokens, base styles, layout, themes (dark and light), `index.html` skeleton, router, store, storage, asset helper with fallbacks.
2. **Landing and setup:** hero, feature highlights, board preview, setup form with validation, avatar picker, persistence.
3. **Lobby:** room creation, copy and share, bot joins with timers, host and settings, `empty-lobby` state, Demo Mode badge.
4. **Canvas and tools:** layered glass board, normalized stroke model, replay renderer, brush, eraser, sizes, colors, undo, redo, clear, resize and high-DPI correctness, mouse and touch.
5. **Engine and chat:** state machine, timers, word selection, hints, guess matching, scoring, bots (guessing and drawing), chat panel.
6. **Feedback and results:** countdown, banners, round summary, scoreboard updates, final results with podium, Play Again, Return to Lobby, Home.
7. **Sound, settings and polish:** Web Audio cues, settings modal, reduced motion, final visual polish.
8. **Hardening:** responsive pass, accessibility pass, bug sweep, README.

## 18. Acceptance criteria

The work is complete only when **all** of these are true:

1. Landing page and all navigation work, including browser back and forward.
2. The user can set a validated nickname and choose one of 10 avatars, and both persist across reloads.
3. Dark and light themes work, follow system preference by default, persist, and show no flash on load.
4. The user can create a room or join one by code; unknown codes show a clear error.
5. The lobby shows correct local state, copy buttons work or fail gracefully, and the Demo Mode badge is visible.
6. The canvas draws with mouse, touch and pen, including single-tap dots.
7. Brush, eraser, five sizes, colors, undo, redo and clear (with confirmation) all work.
8. Resizing the window or rotating a phone keeps the drawing intact and proportional at any devicePixelRatio.
9. The guess panel validates input, never exposes the secret word, and renders text safely.
10. Bots guess and score consistently, and scoring follows section 10.4.
11. Timers progress through rounds with no duplicate intervals, and leaving any view or room leaves zero active timers.
12. Game-status assets appear only in their intended states, and each has a working fallback if the file is missing.
13. Round summary, final results, Play Again, Return to Lobby and Home all work.
14. Layouts work at 360, 768, 1024 and 1440px wide with no horizontal scroll.
15. No backend, framework, bundler or dependency is needed.
16. The browser console shows no errors or warnings during a full game.
17. The app runs from a static server, and the README documents how.
18. UI code talks only to `game-service.js`, so a socket-based service can replace the demo service later.
19. The UI uses no chromatic color anywhere outside the drawing palette.

## 19. Manual verification you must perform and report

- Play one full game (3 rounds, 4 players) in dark mode and one in light mode.
- Test: draw, undo, redo, erase over strokes, clear then undo the clear, resize the window mid-drawing, and switch themes mid-round.
- Test touch input using browser device emulation.
- Block the avatar folder in DevTools and confirm initial-letter fallbacks appear.
- Disable `backdrop-filter` and confirm the board and panels remain readable.
- Enable reduced motion and confirm no looping animations remain.
- Run the Lighthouse Accessibility audit and fix issues scoring below 95.
- Check the Performance panel and confirm no timer leaks after leaving a game (no growing interval list).
- Disable localStorage and confirm the app still runs with an in-memory notice.

## 20. How to run

ES modules require HTTP, so opening `index.html` directly from `file://` will not work. Document at least one of these in the README:

```
python3 -m http.server 5173
```

or any static server such as the VS Code Live Server extension. Open `http://localhost:5173`.

## 21. Final report

When finished, reply with:

- Files created and modified.
- Features implemented, mapped to the 19 acceptance criteria.
- How to run the app.
- Manual checks performed and their results.
- Assumptions you made.
- Known limitations of local demo multiplayer, and the exact steps to replace `demo-service.js` with a Node.js and Socket.IO service later.

Deliver a complete, playable, frontend-only DoodleDuel prototype. Do not introduce a backend. Do not use React or TypeScript. Do not copy proprietary branding or assets from other games.
