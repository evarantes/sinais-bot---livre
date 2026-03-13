# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a **Classic Arcade Game Platform** — a web application with 35 classic games, a credit/unlock system, and a task/achievement system. All frontend, no backend.

### Tech stack

- Pure HTML5 + CSS3 + vanilla JavaScript (no frameworks or build tools)
- HTML5 Canvas for action games, DOM for puzzle/board games
- `localStorage` for persistence (credits, unlocks, stats, high scores)

### Running

- Serve with any HTTP server: `python3 -m http.server 8080` from the repo root
- Open `http://localhost:8080` in a browser
- No build step required

### Structure

- `index.html` — main SPA entry point
- `css/style.css` — all styles (dark arcade theme)
- `js/app.js` — main app logic (navigation, credits, tasks, game loading)
- `js/games/*.js` — 35 individual game files, loaded dynamically on demand

### Game tiers

- **Free (5):** Snake, Tic-Tac-Toe, Pong, Memory, Tetris
- **10 credits (10):** Breakout, Minesweeper, 2048, Hangman, Simon, Whack-a-Mole, Sliding Puzzle, Blackjack, Word Search, Maze
- **20 credits (10):** Space Invaders, Flappy Bird, Connect Four, Sudoku, Checkers, Dino Run, Bubble Shooter, Match 3, Fruit Ninja, Solitaire
- **30 credits (10):** Pac-Man, Asteroids, Frogger, Arkanoid, Galaga, Tower Defense, Racing, Platformer, Pinball, Sokoban

### Key gotchas

- Game scripts are loaded dynamically via `<script>` injection when a game is first opened. The server must serve JS files from `js/games/`.
- All game state is in `localStorage` under key `arcade_save`. Clear it to reset.
- No linting or testing tools are configured in this repo.
