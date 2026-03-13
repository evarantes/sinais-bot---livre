(function(){
    window.Games = window.Games || {};
    window.Games['tetris'] = function(container, callbacks) {
        var COLS = 10, ROWS = 20, CELL = 30;
        var W = COLS * CELL, H = ROWS * CELL;
        var canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.style.background = '#0a0a1a';
        canvas.style.border = '2px solid #2a2a5a';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var PIECES = {
            I: {shape:[[1,1,1,1]], color:'#00f0ff'},
            O: {shape:[[1,1],[1,1]], color:'#ffcc00'},
            T: {shape:[[0,1,0],[1,1,1]], color:'#aa44ff'},
            S: {shape:[[0,1,1],[1,1,0]], color:'#00ff88'},
            Z: {shape:[[1,1,0],[0,1,1]], color:'#ff00aa'},
            J: {shape:[[1,0,0],[1,1,1]], color:'#4488ff'},
            L: {shape:[[0,0,1],[1,1,1]], color:'#ff8800'}
        };
        var PIECE_KEYS = ['I','O','T','S','Z','J','L'];

        var grid, piece, pieceX, pieceY, pieceType;
        var score, totalLinesCleared, gameOver;
        var dropInterval, dropTime, lastTime;
        var animId = null;

        function init() {
            grid = [];
            for (var r = 0; r < ROWS; r++) {
                grid[r] = [];
                for (var c = 0; c < COLS; c++) { grid[r][c] = null; }
            }
            score = 0;
            totalLinesCleared = 0;
            gameOver = false;
            dropInterval = 800;
            dropTime = 0;
            lastTime = 0;
            callbacks.onScore(0);
            removeGameOverScreen();
            spawnPiece();
        }

        function removeGameOverScreen() {
            var existing = container.querySelector('.game-over-screen');
            if (existing) existing.remove();
        }

        function spawnPiece() {
            pieceType = PIECE_KEYS[Math.floor(Math.random() * PIECE_KEYS.length)];
            piece = PIECES[pieceType].shape.map(function(row) { return row.slice(); });
            pieceX = Math.floor((COLS - piece[0].length) / 2);
            pieceY = 0;

            if (collides(piece, pieceX, pieceY)) {
                gameOver = true;
                callbacks.onGameOver(score);
                showGameOver();
            }
        }

        function collides(shape, px, py) {
            for (var r = 0; r < shape.length; r++) {
                for (var c = 0; c < shape[r].length; c++) {
                    if (shape[r][c]) {
                        var nx = px + c, ny = py + r;
                        if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
                        if (ny >= 0 && grid[ny][nx] !== null) return true;
                    }
                }
            }
            return false;
        }

        function lockPiece() {
            var color = PIECES[pieceType].color;
            for (var r = 0; r < piece.length; r++) {
                for (var c = 0; c < piece[r].length; c++) {
                    if (piece[r][c]) {
                        var ny = pieceY + r, nx = pieceX + c;
                        if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
                            grid[ny][nx] = color;
                        }
                    }
                }
            }
            clearLines();
            spawnPiece();
        }

        function clearLines() {
            var cleared = 0;
            for (var r = ROWS - 1; r >= 0; r--) {
                var full = true;
                for (var c = 0; c < COLS; c++) {
                    if (grid[r][c] === null) { full = false; break; }
                }
                if (full) {
                    grid.splice(r, 1);
                    var newRow = [];
                    for (var c2 = 0; c2 < COLS; c2++) newRow.push(null);
                    grid.unshift(newRow);
                    cleared++;
                    r++;
                }
            }
            if (cleared > 0) {
                var bonus = [0, 100, 300, 500, 800];
                score += bonus[cleared] || (cleared * 200);
                totalLinesCleared += cleared;
                callbacks.onScore(score);
                App.addStat('tetris_lines', cleared);
                dropInterval = Math.max(100, 800 - totalLinesCleared * 20);
            }
        }

        function rotate(shape) {
            var rows = shape.length, cols = shape[0].length;
            var rotated = [];
            for (var c = 0; c < cols; c++) {
                rotated[c] = [];
                for (var r = rows - 1; r >= 0; r--) {
                    rotated[c].push(shape[r][c]);
                }
            }
            return rotated;
        }

        function tryRotate() {
            var rotated = rotate(piece);
            if (!collides(rotated, pieceX, pieceY)) { piece = rotated; return; }
            if (!collides(rotated, pieceX - 1, pieceY)) { piece = rotated; pieceX--; return; }
            if (!collides(rotated, pieceX + 1, pieceY)) { piece = rotated; pieceX++; return; }
            if (!collides(rotated, pieceX - 2, pieceY)) { piece = rotated; pieceX -= 2; return; }
            if (!collides(rotated, pieceX + 2, pieceY)) { piece = rotated; pieceX += 2; return; }
        }

        function moveDown() {
            if (gameOver) return;
            if (!collides(piece, pieceX, pieceY + 1)) {
                pieceY++;
            } else {
                lockPiece();
            }
        }

        function draw() {
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            ctx.strokeStyle = 'rgba(42,42,90,0.2)';
            ctx.lineWidth = 0.5;
            for (var c = 0; c <= COLS; c++) {
                ctx.beginPath(); ctx.moveTo(c * CELL, 0); ctx.lineTo(c * CELL, H); ctx.stroke();
            }
            for (var r = 0; r <= ROWS; r++) {
                ctx.beginPath(); ctx.moveTo(0, r * CELL); ctx.lineTo(W, r * CELL); ctx.stroke();
            }

            for (var r2 = 0; r2 < ROWS; r2++) {
                for (var c2 = 0; c2 < COLS; c2++) {
                    if (grid[r2][c2]) {
                        drawCell(c2, r2, grid[r2][c2]);
                    }
                }
            }

            if (piece && !gameOver) {
                var ghostY = pieceY;
                while (!collides(piece, pieceX, ghostY + 1)) ghostY++;
                var color = PIECES[pieceType].color;
                ctx.globalAlpha = 0.2;
                for (var pr = 0; pr < piece.length; pr++) {
                    for (var pc = 0; pc < piece[pr].length; pc++) {
                        if (piece[pr][pc]) {
                            ctx.fillStyle = color;
                            ctx.fillRect((pieceX + pc) * CELL + 1, (ghostY + pr) * CELL + 1, CELL - 2, CELL - 2);
                        }
                    }
                }
                ctx.globalAlpha = 1;

                for (var pr2 = 0; pr2 < piece.length; pr2++) {
                    for (var pc2 = 0; pc2 < piece[pr2].length; pc2++) {
                        if (piece[pr2][pc2]) {
                            drawCell(pieceX + pc2, pieceY + pr2, color);
                        }
                    }
                }
            }
        }

        function drawCell(x, y, color) {
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 4;
            ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2);
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(255,255,255,0.15)';
            ctx.fillRect(x * CELL + 1, y * CELL + 1, CELL - 2, 3);
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(x * CELL + 1, y * CELL + CELL - 4, CELL - 2, 3);
        }

        function update(timestamp) {
            if (gameOver) return;
            if (!lastTime) lastTime = timestamp;
            var dt = timestamp - lastTime;
            lastTime = timestamp;
            dropTime += dt;
            if (dropTime >= dropInterval) {
                moveDown();
                dropTime = 0;
            }
        }

        function loop(timestamp) {
            animId = requestAnimationFrame(loop);
            update(timestamp);
            draw();
        }

        function showGameOver() {
            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
            overlay.innerHTML = '<h2>Game Over</h2><p>Pontuação: ' + score + '</p><p style="font-size:14px;color:#8888aa;">Linhas: ' + totalLinesCleared + '</p>';
            var btn = document.createElement('button');
            btn.className = 'btn btn-play';
            btn.textContent = 'Reiniciar';
            btn.addEventListener('click', function() { init(); });
            overlay.appendChild(btn);
            container.appendChild(overlay);
        }

        function onKeyDown(e) {
            if (gameOver) return;
            switch(e.key) {
                case 'ArrowLeft':
                    if (!collides(piece, pieceX - 1, pieceY)) pieceX--;
                    e.preventDefault(); break;
                case 'ArrowRight':
                    if (!collides(piece, pieceX + 1, pieceY)) pieceX++;
                    e.preventDefault(); break;
                case 'ArrowDown':
                    moveDown();
                    dropTime = 0;
                    e.preventDefault(); break;
                case 'ArrowUp':
                    tryRotate();
                    e.preventDefault(); break;
            }
        }

        document.addEventListener('keydown', onKeyDown);
        init();
        animId = requestAnimationFrame(loop);

        return {
            destroy: function() {
                if (animId) cancelAnimationFrame(animId);
                document.removeEventListener('keydown', onKeyDown);
            }
        };
    };
})();
