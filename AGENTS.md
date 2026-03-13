# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a **static HTML/CSS/JS arcade game platform** ("Arcade Clássico - Jogos Retrô"). No build tools, no package managers, no bundlers. All games are vanilla JavaScript files loaded dynamically via `<script>` tags from `js/games/`.

### Project structure

- `index.html` - Main page with lobby, store, tasks, profile views
- `css/style.css` - Neon/dark theme styles
- `js/app.js` - Core app logic (navigation, game loading, credits, tasks, localStorage persistence)
- `js/games/*.js` - Individual game files, each registering on `window.Games[gameId]`

### Development server

Serve files with any static HTTP server from the workspace root:

```
npx http-server /workspace -p 8080 --cors -c-1
```

Then open `http://localhost:8080` in a browser.

### Linting

No formal linter is configured. Use `node --check <file>.js` to validate JavaScript syntax:

```
node --check js/app.js
node --check js/games/breakout.js
```

### Testing

- No automated test framework. All testing is manual via the browser.
- Each game file can be syntax-checked with `node --check`.
- Games are loaded on-demand when clicked in the lobby UI.

### Key gotchas

- Free games (cost=0) can be played immediately. Paid games require credits (buy via Store or complete Tasks).
- Game state (credits, unlocked games, high scores, tasks) persists in `localStorage` under key `arcade_save`.
- The game catalog is defined in `GAME_CATALOG` array in `js/app.js`. Each game's `id` must match its filename in `js/games/`.
- Chrome in the Cloud VM may show a "Restore pages?" dialog on restart; use `--user-data-dir` with a fresh directory to avoid this.
