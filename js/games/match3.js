(function(){
    window.Games = window.Games || {};
    window.Games['match3'] = function(container, callbacks) {
        var GRID = 8;
        var GEMS = ['💎', '🔴', '🟢', '🔵', '🟡', '🟣'];
        var CELL_SIZE = 50;
        var score = 0;
        var gameOver = false;
        var selected = null;
        var animating = false;
        var timeLeft = 60;
        var timerInterval = null;
        var board = [];
        var restartBtn = null;

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;background:#0a0a1a;padding:16px;border-radius:8px;user-select:none;';
        container.appendChild(wrapper);

        var timerDiv = document.createElement('div');
        timerDiv.style.cssText = 'font-family:"Press Start 2P",monospace;font-size:14px;color:#00f0ff;margin-bottom:12px;';
        timerDiv.textContent = '⏱ 60s';
        wrapper.appendChild(timerDiv);

        var gridDiv = document.createElement('div');
        gridDiv.style.cssText = 'display:grid;grid-template-columns:repeat(' + GRID + ',' + CELL_SIZE + 'px);grid-template-rows:repeat(' + GRID + ',' + CELL_SIZE + 'px);gap:2px;background:#111;border:2px solid #00f0ff;border-radius:8px;padding:4px;';
        wrapper.appendChild(gridDiv);

        var cells = [];

        function randomGem() { return Math.floor(Math.random() * GEMS.length); }

        function initBoard() {
            board = [];
            for (var r = 0; r < GRID; r++) {
                board[r] = [];
                for (var c = 0; c < GRID; c++) {
                    var gem;
                    do {
                        gem = randomGem();
                    } while (
                        (c >= 2 && board[r][c-1] === gem && board[r][c-2] === gem) ||
                        (r >= 2 && board[r-1][c] === gem && board[r-2][c] === gem)
                    );
                    board[r][c] = gem;
                }
            }
        }

        function createCells() {
            gridDiv.innerHTML = '';
            cells = [];
            for (var r = 0; r < GRID; r++) {
                cells[r] = [];
                for (var c = 0; c < GRID; c++) {
                    var cell = document.createElement('div');
                    cell.style.cssText = 'width:' + CELL_SIZE + 'px;height:' + CELL_SIZE + 'px;display:flex;align-items:center;justify-content:center;font-size:28px;cursor:pointer;background:#1a1a2e;border-radius:6px;transition:transform 0.15s,background 0.15s;';
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    cell.addEventListener('click', cellClicked);
                    gridDiv.appendChild(cell);
                    cells[r][c] = cell;
                }
            }
        }

        function renderBoard() {
            for (var r = 0; r < GRID; r++) {
                for (var c = 0; c < GRID; c++) {
                    cells[r][c].textContent = board[r][c] >= 0 ? GEMS[board[r][c]] : '';
                    cells[r][c].style.background = '#1a1a2e';
                    cells[r][c].style.transform = 'scale(1)';
                }
            }
            if (selected) {
                cells[selected.r][selected.c].style.background = '#2a2a5a';
                cells[selected.r][selected.c].style.transform = 'scale(1.1)';
            }
        }

        function cellClicked(e) {
            if (gameOver || animating) return;
            var r = parseInt(e.target.dataset.row);
            var c = parseInt(e.target.dataset.col);
            if (isNaN(r) || isNaN(c)) return;

            if (!selected) {
                selected = { r: r, c: c };
                renderBoard();
                return;
            }

            var dr = Math.abs(selected.r - r);
            var dc = Math.abs(selected.c - c);
            if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
                trySwap(selected.r, selected.c, r, c);
            } else {
                selected = { r: r, c: c };
                renderBoard();
            }
        }

        function trySwap(r1, c1, r2, c2) {
            animating = true;
            var temp = board[r1][c1];
            board[r1][c1] = board[r2][c2];
            board[r2][c2] = temp;

            var matches = findMatches();
            if (matches.length > 0) {
                selected = null;
                renderBoard();
                processMatches(matches);
            } else {
                board[r2][c2] = board[r1][c1];
                board[r1][c1] = temp;
                selected = null;
                animating = false;
                renderBoard();
            }
        }

        function findMatches() {
            var matched = {};

            for (var r = 0; r < GRID; r++) {
                for (var c = 0; c < GRID - 2; c++) {
                    if (board[r][c] >= 0 && board[r][c] === board[r][c+1] && board[r][c] === board[r][c+2]) {
                        var len = 3;
                        while (c + len < GRID && board[r][c + len] === board[r][c]) len++;
                        for (var i = 0; i < len; i++) matched[r + ',' + (c + i)] = true;
                        c += len - 1;
                    }
                }
            }
            for (var c = 0; c < GRID; c++) {
                for (var r = 0; r < GRID - 2; r++) {
                    if (board[r][c] >= 0 && board[r][c] === board[r+1][c] && board[r][c] === board[r+2][c]) {
                        var len = 3;
                        while (r + len < GRID && board[r + len][c] === board[r][c]) len++;
                        for (var i = 0; i < len; i++) matched[(r + i) + ',' + c] = true;
                        r += len - 1;
                    }
                }
            }

            var result = [];
            for (var key in matched) {
                var parts = key.split(',');
                result.push({ r: parseInt(parts[0]), c: parseInt(parts[1]) });
            }
            return result;
        }

        function processMatches(matches) {
            for (var i = 0; i < matches.length; i++) {
                board[matches[i].r][matches[i].c] = -1;
                cells[matches[i].r][matches[i].c].style.transform = 'scale(0)';
            }
            score += matches.length * 10;
            callbacks.onScore(score);

            setTimeout(function() {
                dropGems();
                fillEmpty();
                renderBoard();

                setTimeout(function() {
                    var newMatches = findMatches();
                    if (newMatches.length > 0) {
                        processMatches(newMatches);
                    } else {
                        animating = false;
                    }
                }, 200);
            }, 250);
        }

        function dropGems() {
            for (var c = 0; c < GRID; c++) {
                var writePos = GRID - 1;
                for (var r = GRID - 1; r >= 0; r--) {
                    if (board[r][c] >= 0) {
                        board[writePos][c] = board[r][c];
                        if (writePos !== r) board[r][c] = -1;
                        writePos--;
                    }
                }
                for (var r = writePos; r >= 0; r--) {
                    board[r][c] = -1;
                }
            }
        }

        function fillEmpty() {
            for (var r = 0; r < GRID; r++) {
                for (var c = 0; c < GRID; c++) {
                    if (board[r][c] < 0) {
                        board[r][c] = randomGem();
                    }
                }
            }
        }

        function startTimer() {
            timerInterval = setInterval(function() {
                timeLeft--;
                timerDiv.textContent = '⏱ ' + timeLeft + 's';
                if (timeLeft <= 10) timerDiv.style.color = '#ff00aa';
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                    gameOver = true;
                    callbacks.onGameOver(score);
                    showEndScreen();
                }
            }, 1000);
        }

        function showEndScreen() {
            var overlay = document.createElement('div');
            overlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(10,10,26,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10;border-radius:8px;';
            overlay.innerHTML = '<div style="font-family:\'Press Start 2P\',monospace;font-size:18px;color:#ff00aa;margin-bottom:12px;">TEMPO ESGOTADO!</div><div style="font-family:\'Press Start 2P\',monospace;font-size:14px;color:#00f0ff;">Pontos: ' + score + '</div>';
            wrapper.style.position = 'relative';
            wrapper.appendChild(overlay);

            restartBtn = document.createElement('button');
            restartBtn.textContent = 'Reiniciar';
            restartBtn.style.cssText = 'display:block;margin:16px auto;padding:10px 32px;font-family:"Press Start 2P",monospace;font-size:14px;background:#ff00aa;color:#fff;border:none;border-radius:6px;cursor:pointer;';
            restartBtn.addEventListener('click', restart);
            overlay.appendChild(restartBtn);
        }

        function restart() {
            if (timerInterval) clearInterval(timerInterval);
            wrapper.querySelectorAll('div[style*="position:absolute"]').forEach(function(el) { el.remove(); });
            restartBtn = null;
            score = 0; gameOver = false; selected = null; animating = false;
            timeLeft = 60;
            timerDiv.style.color = '#00f0ff';
            timerDiv.textContent = '⏱ 60s';
            initBoard();
            renderBoard();
            callbacks.onScore(0);
            startTimer();
        }

        initBoard();
        createCells();
        renderBoard();
        startTimer();

        return {
            destroy: function() {
                if (timerInterval) clearInterval(timerInterval);
            }
        };
    };
})();
