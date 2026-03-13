(function(){
    window.Games = window.Games || {};
    window.Games['tictactoe'] = function(container, callbacks) {
        var board, currentPlayer, gameActive, score;
        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:16px;';
        container.appendChild(wrapper);

        var statusEl = document.createElement('div');
        statusEl.style.cssText = 'font-family:"Press Start 2P",cursive;font-size:14px;color:#00f0ff;min-height:24px;text-align:center;';
        wrapper.appendChild(statusEl);

        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,100px);grid-template-rows:repeat(3,100px);gap:4px;';
        wrapper.appendChild(grid);

        var cells = [];
        var gameOverDiv = null;

        function init() {
            board = ['','','','','','','','',''];
            currentPlayer = 'X';
            gameActive = true;
            score = 0;
            grid.innerHTML = '';
            cells = [];
            if (gameOverDiv) { gameOverDiv.remove(); gameOverDiv = null; }

            for (var i = 0; i < 9; i++) {
                var cell = document.createElement('div');
                cell.style.cssText = 'width:100px;height:100px;background:#1a1a3e;border:2px solid #2a2a5a;display:flex;align-items:center;justify-content:center;font-size:40px;cursor:pointer;border-radius:8px;transition:all 0.2s;font-family:"Press Start 2P",cursive;';
                cell.dataset.index = i;
                cell.addEventListener('click', onCellClick);
                cell.addEventListener('mouseenter', function() {
                    if (this.textContent === '' && gameActive) this.style.background = '#222260';
                });
                cell.addEventListener('mouseleave', function() {
                    this.style.background = '#1a1a3e';
                });
                grid.appendChild(cell);
                cells.push(cell);
            }
            statusEl.textContent = 'Sua vez (X)';
            callbacks.onScore(0);
        }

        function onCellClick(e) {
            var idx = parseInt(e.target.dataset.index);
            if (!gameActive || board[idx] !== '' || currentPlayer !== 'X') return;
            makeMove(idx, 'X');
            if (!gameActive) return;
            currentPlayer = 'O';
            statusEl.textContent = 'IA pensando...';
            setTimeout(function() {
                if (!gameActive) return;
                aiMove();
            }, 400);
        }

        function makeMove(idx, player) {
            board[idx] = player;
            cells[idx].textContent = player;
            cells[idx].style.color = player === 'X' ? '#00f0ff' : '#ff00aa';
            cells[idx].style.cursor = 'default';
            cells[idx].style.textShadow = player === 'X' ? '0 0 10px #00f0ff' : '0 0 10px #ff00aa';

            var winner = checkWin();
            if (winner) {
                gameActive = false;
                if (winner === 'X') {
                    score = 10;
                    statusEl.textContent = 'Você venceu!';
                    statusEl.style.color = '#00ff88';
                    highlightWin(winner);
                } else {
                    score = 0;
                    statusEl.textContent = 'IA venceu!';
                    statusEl.style.color = '#ff00aa';
                    highlightWin(winner);
                }
                callbacks.onScore(score);
                callbacks.onGameOver(score);
                showRestart();
                return;
            }
            if (board.indexOf('') === -1) {
                gameActive = false;
                score = 5;
                statusEl.textContent = 'Empate!';
                statusEl.style.color = '#ffcc00';
                callbacks.onScore(score);
                callbacks.onGameOver(score);
                showRestart();
                return;
            }
        }

        function aiMove() {
            var best = minimax(board, 'O');
            makeMove(best.index, 'O');
            if (gameActive) {
                currentPlayer = 'X';
                statusEl.textContent = 'Sua vez (X)';
            }
        }

        function minimax(b, player) {
            var avail = [];
            for (var i = 0; i < 9; i++) { if (b[i] === '') avail.push(i); }

            var w = checkWinBoard(b);
            if (w === 'X') return {score: -10};
            if (w === 'O') return {score: 10};
            if (avail.length === 0) return {score: 0};

            var moves = [];
            for (var j = 0; j < avail.length; j++) {
                var move = {index: avail[j]};
                b[avail[j]] = player;
                var result = minimax(b, player === 'O' ? 'X' : 'O');
                move.score = result.score;
                b[avail[j]] = '';
                moves.push(move);
            }

            var bestMove;
            if (player === 'O') {
                var bestScore = -Infinity;
                for (var k = 0; k < moves.length; k++) {
                    if (moves[k].score > bestScore) { bestScore = moves[k].score; bestMove = k; }
                }
            } else {
                var bestScore2 = Infinity;
                for (var k2 = 0; k2 < moves.length; k2++) {
                    if (moves[k2].score < bestScore2) { bestScore2 = moves[k2].score; bestMove = k2; }
                }
            }
            return moves[bestMove];
        }

        var WIN_COMBOS = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];

        function checkWin() { return checkWinBoard(board); }

        function checkWinBoard(b) {
            for (var i = 0; i < WIN_COMBOS.length; i++) {
                var c = WIN_COMBOS[i];
                if (b[c[0]] !== '' && b[c[0]] === b[c[1]] && b[c[1]] === b[c[2]]) {
                    return b[c[0]];
                }
            }
            return null;
        }

        function highlightWin(winner) {
            for (var i = 0; i < WIN_COMBOS.length; i++) {
                var c = WIN_COMBOS[i];
                if (board[c[0]] === winner && board[c[1]] === winner && board[c[2]] === winner) {
                    for (var j = 0; j < 3; j++) {
                        cells[c[j]].style.background = winner === 'X' ? 'rgba(0,255,136,0.2)' : 'rgba(255,0,170,0.2)';
                        cells[c[j]].style.borderColor = winner === 'X' ? '#00ff88' : '#ff00aa';
                    }
                    break;
                }
            }
        }

        function showRestart() {
            gameOverDiv = document.createElement('div');
            gameOverDiv.style.cssText = 'margin-top:16px;text-align:center;';
            var btn = document.createElement('button');
            btn.className = 'btn btn-play';
            btn.textContent = 'Reiniciar';
            btn.addEventListener('click', function() {
                statusEl.style.color = '#00f0ff';
                init();
            });
            gameOverDiv.appendChild(btn);
            wrapper.appendChild(gameOverDiv);
        }

        init();

        return {
            destroy: function() {
                cells.forEach(function(c) { c.removeEventListener('click', onCellClick); });
                if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
            }
        };
    };
})();
