(function(){
    window.Games = window.Games || {};
    window.Games['game2048'] = function(container, callbacks) {
        var SIZE = 4;
        var board = [];
        var score = 0;
        var gameOver = false;

        var tileColors = {
            0: 'transparent',
            2: '#00f0ff',
            4: '#00ff88',
            8: '#ffcc00',
            16: '#ff8800',
            32: '#ff4444',
            64: '#ff00aa',
            128: '#aa44ff',
            256: '#8844ff',
            512: '#6644ff',
            1024: '#4444ff',
            2048: '#ffcc00'
        };

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px;';
        container.appendChild(wrapper);

        var scoreDisplay = document.createElement('div');
        scoreDisplay.style.cssText = 'font-family:"Press Start 2P",monospace;font-size:12px;color:#ffcc00;';
        scoreDisplay.textContent = 'Pontos: 0';
        wrapper.appendChild(scoreDisplay);

        var gridEl = document.createElement('div');
        gridEl.style.cssText = 'display:grid;grid-template-columns:repeat(4,90px);grid-template-rows:repeat(4,90px);gap:6px;background:#1a1a3e;padding:8px;border-radius:12px;border:2px solid #2a2a5a;';
        wrapper.appendChild(gridEl);

        var cellEls = [];
        for (var i = 0; i < SIZE * SIZE; i++) {
            var cell = document.createElement('div');
            cell.style.cssText = 'width:90px;height:90px;display:flex;align-items:center;justify-content:center;border-radius:8px;font-family:"Press Start 2P",monospace;font-weight:bold;transition:all 0.1s;background:#12122a;';
            gridEl.appendChild(cell);
            cellEls.push(cell);
        }

        function initBoard() {
            board = [];
            for (var r = 0; r < SIZE; r++) {
                board[r] = [];
                for (var c = 0; c < SIZE; c++) board[r][c] = 0;
            }
            addRandom();
            addRandom();
            renderBoard();
        }

        function addRandom() {
            var empty = [];
            for (var r = 0; r < SIZE; r++)
                for (var c = 0; c < SIZE; c++)
                    if (board[r][c] === 0) empty.push([r, c]);
            if (empty.length === 0) return;
            var pick = empty[Math.floor(Math.random() * empty.length)];
            board[pick[0]][pick[1]] = Math.random() < 0.9 ? 2 : 4;
        }

        function renderBoard() {
            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    var val = board[r][c];
                    var cell = cellEls[r * SIZE + c];
                    cell.textContent = val || '';
                    var bg = tileColors[val] || '#aa44ff';
                    if (val === 0) {
                        cell.style.background = '#12122a';
                        cell.style.color = 'transparent';
                        cell.style.boxShadow = 'none';
                    } else {
                        cell.style.background = bg;
                        cell.style.color = val >= 8 ? '#0a0a1a' : '#0a0a1a';
                        cell.style.boxShadow = '0 0 10px ' + bg + '66';
                        cell.style.fontSize = val >= 1024 ? '14px' : val >= 128 ? '18px' : '22px';
                    }
                }
            }
            scoreDisplay.textContent = 'Pontos: ' + score;
        }

        function slide(row) {
            var arr = row.filter(function(v) { return v !== 0; });
            var merged = [];
            for (var i = 0; i < arr.length; i++) {
                if (i + 1 < arr.length && arr[i] === arr[i + 1]) {
                    merged.push(arr[i] * 2);
                    score += arr[i] * 2;
                    i++;
                } else {
                    merged.push(arr[i]);
                }
            }
            while (merged.length < SIZE) merged.push(0);
            return merged;
        }

        function move(dir) {
            if (gameOver) return;
            var moved = false;
            var oldBoard = JSON.stringify(board);

            if (dir === 'left') {
                for (var r = 0; r < SIZE; r++) board[r] = slide(board[r]);
            } else if (dir === 'right') {
                for (var r = 0; r < SIZE; r++) {
                    board[r] = slide(board[r].reverse()).reverse();
                }
            } else if (dir === 'up') {
                for (var c = 0; c < SIZE; c++) {
                    var col = [];
                    for (var r = 0; r < SIZE; r++) col.push(board[r][c]);
                    col = slide(col);
                    for (var r = 0; r < SIZE; r++) board[r][c] = col[r];
                }
            } else if (dir === 'down') {
                for (var c = 0; c < SIZE; c++) {
                    var col = [];
                    for (var r = 0; r < SIZE; r++) col.push(board[r][c]);
                    col.reverse();
                    col = slide(col);
                    col.reverse();
                    for (var r = 0; r < SIZE; r++) board[r][c] = col[r];
                }
            }

            if (JSON.stringify(board) !== oldBoard) {
                addRandom();
                callbacks.onScore(score);
            }
            renderBoard();

            if (!canMove()) {
                gameOver = true;
                showGameOverScreen();
                callbacks.onGameOver(score);
            }
        }

        function canMove() {
            for (var r = 0; r < SIZE; r++)
                for (var c = 0; c < SIZE; c++) {
                    if (board[r][c] === 0) return true;
                    if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return true;
                    if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return true;
                }
            return false;
        }

        function onKeyDown(e) {
            if (gameOver) return;
            var dirs = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
            if (dirs[e.key]) {
                e.preventDefault();
                move(dirs[e.key]);
            }
        }

        document.addEventListener('keydown', onKeyDown);

        var touchStartX = 0, touchStartY = 0;
        function onTouchStart(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
        function onTouchEnd(e) {
            var dx = e.changedTouches[0].clientX - touchStartX;
            var dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) > Math.abs(dy)) {
                move(dx > 0 ? 'right' : 'left');
            } else {
                move(dy > 0 ? 'down' : 'up');
            }
        }
        gridEl.addEventListener('touchstart', onTouchStart);
        gridEl.addEventListener('touchend', onTouchEnd);

        function showGameOverScreen() {
            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
            var title = document.createElement('h2');
            title.textContent = 'Game Over!';
            title.style.color = '#ff00aa';
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
            callbacks.onScore(0);
            initBoard();
        }

        initBoard();

        return {
            destroy: function() {
                document.removeEventListener('keydown', onKeyDown);
                gridEl.removeEventListener('touchstart', onTouchStart);
                gridEl.removeEventListener('touchend', onTouchEnd);
            }
        };
    };
})();
