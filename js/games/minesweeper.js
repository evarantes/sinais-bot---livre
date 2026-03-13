(function(){
    window.Games = window.Games || {};
    window.Games['minesweeper'] = function(container, callbacks) {
        var ROWS = 9, COLS = 9, MINES = 10;
        var grid = [];
        var revealed = [];
        var flagged = [];
        var mineLocations = [];
        var gameOver = false;
        var won = false;
        var score = 0;
        var firstClick = true;

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px;';
        container.appendChild(wrapper);

        var info = document.createElement('div');
        info.style.cssText = 'font-family:"Press Start 2P",monospace;font-size:12px;color:#e8e8f0;display:flex;gap:24px;';
        wrapper.appendChild(info);

        var mineCounter = document.createElement('span');
        mineCounter.textContent = 'Minas: ' + MINES;
        mineCounter.style.color = '#ff00aa';
        info.appendChild(mineCounter);

        var board = document.createElement('div');
        board.style.cssText = 'display:grid;grid-template-columns:repeat(9,36px);grid-template-rows:repeat(9,36px);gap:2px;background:#1a1a3e;padding:4px;border-radius:8px;border:1px solid #2a2a5a;';
        wrapper.appendChild(board);

        var cells = [];
        var numColors = {1:'#4488ff',2:'#00ff88',3:'#ff4444',4:'#aa44ff',5:'#ff00aa',6:'#00f0ff',7:'#ffcc00',8:'#e8e8f0'};

        function initGrid() {
            grid = [];
            revealed = [];
            flagged = [];
            mineLocations = [];
            for (var r = 0; r < ROWS; r++) {
                grid[r] = [];
                revealed[r] = [];
                flagged[r] = [];
                for (var c = 0; c < COLS; c++) {
                    grid[r][c] = 0;
                    revealed[r][c] = false;
                    flagged[r][c] = false;
                }
            }
        }

        function placeMines(safeR, safeC) {
            var placed = 0;
            while (placed < MINES) {
                var r = Math.floor(Math.random() * ROWS);
                var c = Math.floor(Math.random() * COLS);
                if (grid[r][c] === -1) continue;
                if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
                grid[r][c] = -1;
                mineLocations.push([r, c]);
                placed++;
            }
            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < COLS; c++) {
                    if (grid[r][c] === -1) continue;
                    var count = 0;
                    for (var dr = -1; dr <= 1; dr++)
                        for (var dc = -1; dc <= 1; dc++) {
                            var nr = r + dr, nc = c + dc;
                            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] === -1)
                                count++;
                        }
                    grid[r][c] = count;
                }
            }
        }

        function createBoard() {
            board.innerHTML = '';
            cells = [];
            for (var r = 0; r < ROWS; r++) {
                cells[r] = [];
                for (var c = 0; c < COLS; c++) {
                    var cell = document.createElement('div');
                    cell.style.cssText = 'width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:#2a2a5a;border-radius:4px;cursor:pointer;font-family:monospace;font-size:16px;font-weight:bold;user-select:none;transition:background 0.15s;';
                    cell.dataset.r = r;
                    cell.dataset.c = c;
                    cell.addEventListener('click', onCellClick);
                    cell.addEventListener('contextmenu', onCellRightClick);
                    cell.addEventListener('mouseenter', function() { if (!gameOver) this.style.background = '#3a3a6a'; });
                    cell.addEventListener('mouseleave', function() {
                        var cr = parseInt(this.dataset.r), cc = parseInt(this.dataset.c);
                        if (!revealed[cr][cc] && !gameOver) this.style.background = '#2a2a5a';
                    });
                    board.appendChild(cell);
                    cells[r][c] = cell;
                }
            }
        }

        function onCellClick(e) {
            if (gameOver) return;
            var r = parseInt(e.currentTarget.dataset.r);
            var c = parseInt(e.currentTarget.dataset.c);
            if (flagged[r][c] || revealed[r][c]) return;

            if (firstClick) {
                placeMines(r, c);
                firstClick = false;
            }

            if (grid[r][c] === -1) {
                revealAllMines();
                gameOver = true;
                showGameOverScreen(false);
                callbacks.onGameOver(score);
                return;
            }

            revealCell(r, c);
            updateScore();
            if (checkWin()) {
                won = true;
                gameOver = true;
                score += 50;
                callbacks.onScore(score);
                showGameOverScreen(true);
                callbacks.onGameOver(score);
            }
        }

        function onCellRightClick(e) {
            e.preventDefault();
            if (gameOver) return;
            var r = parseInt(e.currentTarget.dataset.r);
            var c = parseInt(e.currentTarget.dataset.c);
            if (revealed[r][c]) return;

            flagged[r][c] = !flagged[r][c];
            cells[r][c].textContent = flagged[r][c] ? '🚩' : '';
            var flagCount = 0;
            for (var i = 0; i < ROWS; i++)
                for (var j = 0; j < COLS; j++)
                    if (flagged[i][j]) flagCount++;
            mineCounter.textContent = 'Minas: ' + (MINES - flagCount);
        }

        function revealCell(r, c) {
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
            if (revealed[r][c] || flagged[r][c]) return;
            revealed[r][c] = true;
            var cell = cells[r][c];
            cell.style.background = '#12122a';
            cell.style.cursor = 'default';

            if (grid[r][c] > 0) {
                cell.textContent = grid[r][c];
                cell.style.color = numColors[grid[r][c]] || '#e8e8f0';
            } else if (grid[r][c] === 0) {
                for (var dr = -1; dr <= 1; dr++)
                    for (var dc = -1; dc <= 1; dc++)
                        if (dr !== 0 || dc !== 0) revealCell(r + dr, c + dc);
            }
        }

        function revealAllMines() {
            for (var i = 0; i < mineLocations.length; i++) {
                var mr = mineLocations[i][0], mc = mineLocations[i][1];
                cells[mr][mc].textContent = '💣';
                cells[mr][mc].style.background = '#3a1020';
            }
        }

        function updateScore() {
            var count = 0;
            for (var r = 0; r < ROWS; r++)
                for (var c = 0; c < COLS; c++)
                    if (revealed[r][c]) count++;
            score = count * 5;
            callbacks.onScore(score);
        }

        function checkWin() {
            for (var r = 0; r < ROWS; r++)
                for (var c = 0; c < COLS; c++)
                    if (grid[r][c] !== -1 && !revealed[r][c]) return false;
            return true;
        }

        function showGameOverScreen(isWin) {
            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
            var title = document.createElement('h2');
            title.textContent = isWin ? 'Você Venceu!' : 'Boom! Game Over';
            title.style.color = isWin ? '#00ff88' : '#ff00aa';
            var scoreTxt = document.createElement('p');
            scoreTxt.textContent = 'Pontuação: ' + score;
            scoreTxt.style.color = '#ffcc00';
            var btn = document.createElement('button');
            btn.textContent = 'Reiniciar';
            btn.className = 'btn btn-play';
            btn.style.marginTop = '12px';
            btn.addEventListener('click', restartGame);
            overlay.appendChild(title);
            overlay.appendChild(scoreTxt);
            overlay.appendChild(btn);
            container.appendChild(overlay);
        }

        function restartGame() {
            var ovl = container.querySelector('.game-over-screen');
            if (ovl) ovl.remove();
            score = 0;
            gameOver = false;
            won = false;
            firstClick = true;
            initGrid();
            createBoard();
            mineCounter.textContent = 'Minas: ' + MINES;
            callbacks.onScore(0);
        }

        initGrid();
        createBoard();

        return {
            destroy: function() {
                for (var r = 0; r < ROWS; r++)
                    for (var c = 0; c < COLS; c++) {
                        cells[r][c].removeEventListener('click', onCellClick);
                        cells[r][c].removeEventListener('contextmenu', onCellRightClick);
                    }
            }
        };
    };
})();
