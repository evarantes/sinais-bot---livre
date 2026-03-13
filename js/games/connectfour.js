(function(){
    window.Games = window.Games || {};
    window.Games['connectfour'] = function(container, callbacks) {
        var canvas = document.createElement('canvas');
        var COLS = 7, ROWS = 6;
        var CELL = 60;
        var PAD = 10;
        canvas.width = COLS * CELL + PAD * 2;
        canvas.height = (ROWS + 1) * CELL + PAD * 2;
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.style.background = '#0a0a1a';
        canvas.style.borderRadius = '8px';
        canvas.style.cursor = 'pointer';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var W = canvas.width, H = canvas.height;
        var board = [];
        var currentPlayer = 1;
        var gameOver = false;
        var winner = 0;
        var hoverCol = -1;
        var animating = false;
        var restartBtn = null;

        function initBoard() {
            board = [];
            for (var r = 0; r < ROWS; r++) {
                board[r] = [];
                for (var c = 0; c < COLS; c++) board[r][c] = 0;
            }
        }
        initBoard();

        function getCol(mx) {
            var col = Math.floor((mx - PAD) / CELL);
            return col >= 0 && col < COLS ? col : -1;
        }

        function dropPiece(col, player) {
            for (var r = ROWS - 1; r >= 0; r--) {
                if (board[r][col] === 0) { board[r][col] = player; return r; }
            }
            return -1;
        }

        function undoDrop(col) {
            for (var r = 0; r < ROWS; r++) {
                if (board[r][col] !== 0) { board[r][col] = 0; return; }
            }
        }

        function checkWin(player) {
            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < COLS; c++) {
                    if (board[r][c] !== player) continue;
                    if (c + 3 < COLS && board[r][c+1] === player && board[r][c+2] === player && board[r][c+3] === player) return true;
                    if (r + 3 < ROWS && board[r+1][c] === player && board[r+2][c] === player && board[r+3][c] === player) return true;
                    if (r + 3 < ROWS && c + 3 < COLS && board[r+1][c+1] === player && board[r+2][c+2] === player && board[r+3][c+3] === player) return true;
                    if (r + 3 < ROWS && c - 3 >= 0 && board[r+1][c-1] === player && board[r+2][c-2] === player && board[r+3][c-3] === player) return true;
                }
            }
            return false;
        }

        function isBoardFull() {
            for (var c = 0; c < COLS; c++) if (board[0][c] === 0) return false;
            return true;
        }

        function validCols() {
            var v = [];
            for (var c = 0; c < COLS; c++) if (board[0][c] === 0) v.push(c);
            return v;
        }

        function aiMove() {
            var cols = validCols();
            if (cols.length === 0) return;

            for (var i = 0; i < cols.length; i++) {
                dropPiece(cols[i], 2);
                if (checkWin(2)) { undoDrop(cols[i]); return cols[i]; }
                undoDrop(cols[i]);
            }
            for (var i = 0; i < cols.length; i++) {
                dropPiece(cols[i], 1);
                if (checkWin(1)) { undoDrop(cols[i]); return cols[i]; }
                undoDrop(cols[i]);
            }
            if (cols.indexOf(3) !== -1) return 3;
            return cols[Math.floor(Math.random() * cols.length)];
        }

        function handleClick(e) {
            if (gameOver || animating || currentPlayer !== 1) return;
            var rect = canvas.getBoundingClientRect();
            var col = getCol((e.clientX - rect.left) * (canvas.width / rect.width));
            if (col < 0 || board[0][col] !== 0) return;

            playTurn(col);
        }

        function playTurn(col) {
            var row = dropPiece(col, 1);
            if (row < 0) return;
            draw();

            if (checkWin(1)) {
                gameOver = true; winner = 1;
                callbacks.onScore(50);
                callbacks.onGameOver(50);
                draw();
                return;
            }
            if (isBoardFull()) {
                gameOver = true; winner = 0;
                callbacks.onScore(10);
                callbacks.onGameOver(10);
                draw();
                return;
            }

            currentPlayer = 2;
            animating = true;
            setTimeout(function() {
                var aiCol = aiMove();
                dropPiece(aiCol, 2);
                draw();
                if (checkWin(2)) {
                    gameOver = true; winner = 2;
                    callbacks.onGameOver(0);
                    draw();
                    animating = false;
                    return;
                }
                if (isBoardFull()) {
                    gameOver = true; winner = 0;
                    callbacks.onScore(10);
                    callbacks.onGameOver(10);
                    draw();
                    animating = false;
                    return;
                }
                currentPlayer = 1;
                animating = false;
            }, 400);
        }

        function onMouseMove(e) {
            var rect = canvas.getBoundingClientRect();
            hoverCol = getCol((e.clientX - rect.left) * (canvas.width / rect.width));
            if (!gameOver && !animating) draw();
        }

        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('mousemove', onMouseMove);

        function draw() {
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            if (hoverCol >= 0 && !gameOver && currentPlayer === 1 && !animating) {
                ctx.fillStyle = 'rgba(255,0,170,0.3)';
                ctx.beginPath();
                ctx.arc(PAD + hoverCol * CELL + CELL / 2, CELL / 2, CELL / 2 - 6, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = '#1a3a8a';
            ctx.beginPath();
            ctx.roundRect(PAD - 4, CELL + PAD - 4, COLS * CELL + 8, ROWS * CELL + 8, 10);
            ctx.fill();

            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < COLS; c++) {
                    var cx = PAD + c * CELL + CELL / 2;
                    var cy = CELL + PAD + r * CELL + CELL / 2;
                    ctx.beginPath();
                    ctx.arc(cx, cy, CELL / 2 - 6, 0, Math.PI * 2);
                    if (board[r][c] === 0) ctx.fillStyle = '#0a0a1a';
                    else if (board[r][c] === 1) ctx.fillStyle = '#ff00aa';
                    else ctx.fillStyle = '#ffcc00';
                    ctx.fill();
                }
            }

            if (gameOver) {
                ctx.fillStyle = 'rgba(10,10,26,0.80)';
                ctx.fillRect(0, 0, W, H);
                ctx.textAlign = 'center';
                ctx.font = '18px "Press Start 2P", monospace';
                if (winner === 1) {
                    ctx.fillStyle = '#00ff88';
                    ctx.fillText('VOCÊ VENCEU!', W / 2, H / 2 - 30);
                } else if (winner === 2) {
                    ctx.fillStyle = '#ff00aa';
                    ctx.fillText('IA VENCEU!', W / 2, H / 2 - 30);
                } else {
                    ctx.fillStyle = '#ffcc00';
                    ctx.fillText('EMPATE!', W / 2, H / 2 - 30);
                }

                if (!restartBtn) {
                    restartBtn = document.createElement('button');
                    restartBtn.textContent = 'Reiniciar';
                    restartBtn.style.cssText = 'display:block;margin:16px auto;padding:10px 32px;font-family:"Press Start 2P",monospace;font-size:14px;background:#ff00aa;color:#fff;border:none;border-radius:6px;cursor:pointer;';
                    restartBtn.addEventListener('click', restart);
                    container.appendChild(restartBtn);
                }
            }
        }

        function restart() {
            if (restartBtn) { restartBtn.remove(); restartBtn = null; }
            initBoard();
            currentPlayer = 1; gameOver = false; winner = 0; animating = false;
            callbacks.onScore(0);
            draw();
        }

        draw();

        return {
            destroy: function() {
                canvas.removeEventListener('click', handleClick);
                canvas.removeEventListener('mousemove', onMouseMove);
                if (restartBtn) restartBtn.remove();
            }
        };
    };
})();
