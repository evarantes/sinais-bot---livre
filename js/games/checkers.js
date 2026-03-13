(function(){
    window.Games = window.Games || {};
    window.Games['checkers'] = function(container, callbacks) {
        var canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.style.background = '#0a0a1a';
        canvas.style.borderRadius = '8px';
        canvas.style.cursor = 'pointer';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var SIZE = 8;
        var CELL = canvas.width / SIZE;
        var board = [];
        var selected = null;
        var validMoves = [];
        var playerTurn = true;
        var gameOver = false;
        var score = 0;
        var playerCaptures = 0;
        var restartBtn = null;
        var aiTimeout = null;

        function initBoard() {
            board = [];
            for (var r = 0; r < SIZE; r++) {
                board[r] = [];
                for (var c = 0; c < SIZE; c++) {
                    board[r][c] = null;
                    if ((r + c) % 2 === 1) {
                        if (r < 3) board[r][c] = { player: 2, king: false };
                        else if (r > 4) board[r][c] = { player: 1, king: false };
                    }
                }
            }
        }
        initBoard();

        function getMoves(r, c, boardState) {
            var piece = boardState[r][c];
            if (!piece) return [];
            var moves = [];
            var dirs = [];
            if (piece.player === 1 || piece.king) dirs.push(-1);
            if (piece.player === 2 || piece.king) dirs.push(1);

            for (var d = 0; d < dirs.length; d++) {
                var dr = dirs[d];
                for (var dc = -1; dc <= 1; dc += 2) {
                    var nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && boardState[nr][nc] === null) {
                        moves.push({ r: nr, c: nc, captures: [] });
                    }
                    var jr = r + dr * 2, jc = c + dc * 2;
                    if (jr >= 0 && jr < SIZE && jc >= 0 && jc < SIZE && boardState[jr][jc] === null && boardState[nr] && boardState[nr][nc] && boardState[nr][nc].player !== piece.player) {
                        moves.push({ r: jr, c: jc, captures: [{ r: nr, c: nc }] });
                    }
                }
            }
            return moves;
        }

        function getCaptureMoves(r, c, boardState) {
            return getMoves(r, c, boardState).filter(function(m) { return m.captures.length > 0; });
        }

        function getAllMoves(player, boardState) {
            var allMoves = [];
            var hasCapture = false;
            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    if (boardState[r][c] && boardState[r][c].player === player) {
                        var moves = getMoves(r, c, boardState);
                        for (var i = 0; i < moves.length; i++) {
                            if (moves[i].captures.length > 0) hasCapture = true;
                            allMoves.push({ from: { r: r, c: c }, to: moves[i] });
                        }
                    }
                }
            }
            if (hasCapture) {
                allMoves = allMoves.filter(function(m) { return m.to.captures.length > 0; });
            }
            return allMoves;
        }

        function applyMove(fromR, fromC, move, boardState) {
            boardState[move.r][move.c] = boardState[fromR][fromC];
            boardState[fromR][fromC] = null;
            for (var i = 0; i < move.captures.length; i++) {
                boardState[move.captures[i].r][move.captures[i].c] = null;
            }
            if (boardState[move.r][move.c].player === 1 && move.r === 0) boardState[move.r][move.c].king = true;
            if (boardState[move.r][move.c].player === 2 && move.r === SIZE - 1) boardState[move.r][move.c].king = true;
        }

        function countPieces(player) {
            var n = 0;
            for (var r = 0; r < SIZE; r++)
                for (var c = 0; c < SIZE; c++)
                    if (board[r][c] && board[r][c].player === player) n++;
            return n;
        }

        function checkGameOver() {
            if (countPieces(1) === 0) { endGame(2); return true; }
            if (countPieces(2) === 0) { endGame(1); return true; }
            if (getAllMoves(playerTurn ? 1 : 2, board).length === 0) {
                endGame(playerTurn ? 2 : 1);
                return true;
            }
            return false;
        }

        function endGame(winner) {
            gameOver = true;
            if (winner === 1) score = playerCaptures * 10 + 50;
            else score = playerCaptures * 10;
            callbacks.onScore(score);
            callbacks.onGameOver(score);
            draw();
        }

        function handleClick(e) {
            if (gameOver || !playerTurn) return;
            var rect = canvas.getBoundingClientRect();
            var mx = (e.clientX - rect.left) * (canvas.width / rect.width);
            var my = (e.clientY - rect.top) * (canvas.height / rect.height);
            var c = Math.floor(mx / CELL);
            var r = Math.floor(my / CELL);
            if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return;

            if (selected) {
                var mv = null;
                for (var i = 0; i < validMoves.length; i++) {
                    if (validMoves[i].r === r && validMoves[i].c === c) { mv = validMoves[i]; break; }
                }
                if (mv) {
                    var capCount = mv.captures.length;
                    applyMove(selected.r, selected.c, mv, board);
                    playerCaptures += capCount;
                    score = playerCaptures * 10;
                    callbacks.onScore(score);

                    if (capCount > 0) {
                        var moreCaps = getCaptureMoves(mv.r, mv.c, board);
                        if (moreCaps.length > 0) {
                            selected = { r: mv.r, c: mv.c };
                            validMoves = moreCaps;
                            draw();
                            return;
                        }
                    }

                    selected = null; validMoves = [];
                    draw();
                    if (!checkGameOver()) {
                        playerTurn = false;
                        aiTimeout = setTimeout(doAiMove, 500);
                    }
                    return;
                }

                if (board[r][c] && board[r][c].player === 1) {
                    selectPiece(r, c);
                    return;
                }
                selected = null; validMoves = [];
                draw();
                return;
            }

            if (board[r][c] && board[r][c].player === 1) {
                selectPiece(r, c);
            }
        }

        function selectPiece(r, c) {
            var allMoves = getAllMoves(1, board);
            var hasCapture = allMoves.some(function(m) { return m.to.captures.length > 0; });

            var pieceMoves = allMoves.filter(function(m) { return m.from.r === r && m.from.c === c; });
            if (pieceMoves.length === 0) {
                selected = null; validMoves = [];
                draw(); return;
            }
            selected = { r: r, c: c };
            validMoves = pieceMoves.map(function(m) { return m.to; });
            draw();
        }

        function doAiMove() {
            if (gameOver) return;
            var moves = getAllMoves(2, board);
            if (moves.length === 0) { endGame(1); return; }
            var move = moves[Math.floor(Math.random() * moves.length)];
            applyMove(move.from.r, move.from.c, move.to, board);

            if (move.to.captures.length > 0) {
                var moreCaps = getCaptureMoves(move.to.r, move.to.c, board);
                while (moreCaps.length > 0) {
                    var cap = moreCaps[Math.floor(Math.random() * moreCaps.length)];
                    applyMove(move.to.r, move.to.c, cap, board);
                    move.to = cap;
                    moreCaps = getCaptureMoves(cap.r, cap.c, board);
                }
            }

            playerTurn = true;
            draw();
            checkGameOver();
        }

        canvas.addEventListener('click', handleClick);

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    ctx.fillStyle = (r + c) % 2 === 0 ? '#1a1a2e' : '#2a1a3e';
                    ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
                }
            }

            if (selected) {
                ctx.fillStyle = 'rgba(0,240,255,0.3)';
                ctx.fillRect(selected.c * CELL, selected.r * CELL, CELL, CELL);
                ctx.fillStyle = 'rgba(0,255,136,0.25)';
                for (var i = 0; i < validMoves.length; i++) {
                    ctx.fillRect(validMoves[i].c * CELL, validMoves[i].r * CELL, CELL, CELL);
                }
            }

            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    var p = board[r][c];
                    if (!p) continue;
                    var cx = c * CELL + CELL / 2;
                    var cy = r * CELL + CELL / 2;
                    ctx.beginPath();
                    ctx.arc(cx, cy, CELL / 2 - 6, 0, Math.PI * 2);
                    ctx.fillStyle = p.player === 1 ? '#ff00aa' : '#f0f0f0';
                    ctx.fill();
                    ctx.strokeStyle = p.player === 1 ? '#cc0088' : '#cccccc';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    if (p.king) {
                        ctx.fillStyle = '#ffcc00';
                        ctx.font = 'bold 18px "Press Start 2P", monospace';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('K', cx, cy);
                    }
                }
            }

            if (gameOver) {
                ctx.fillStyle = 'rgba(10,10,26,0.85)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                var won = countPieces(1) > 0 && (countPieces(2) === 0 || getAllMoves(2, board).length === 0);
                ctx.fillStyle = won ? '#00ff88' : '#ff00aa';
                ctx.font = '18px "Press Start 2P", monospace';
                ctx.fillText(won ? 'VOCÊ VENCEU!' : 'IA VENCEU!', canvas.width / 2, canvas.height / 2 - 40);
                ctx.fillStyle = '#00f0ff';
                ctx.font = '14px "Press Start 2P", monospace';
                ctx.fillText('Pontos: ' + score, canvas.width / 2, canvas.height / 2);

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
            selected = null; validMoves = [];
            playerTurn = true; gameOver = false;
            score = 0; playerCaptures = 0;
            callbacks.onScore(0);
            draw();
        }

        draw();

        return {
            destroy: function() {
                canvas.removeEventListener('click', handleClick);
                if (aiTimeout) clearTimeout(aiTimeout);
                if (restartBtn) restartBtn.remove();
            }
        };
    };
})();
