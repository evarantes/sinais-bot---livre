(function(){
    window.Games = window.Games || {};
    window.Games['pacman'] = function(container, callbacks) {
        var W = 400, H = 400;
        var canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.style.background = '#0a0a1a';
        canvas.style.border = '2px solid #2a2a5a';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var CELL = 20;
        var COLS = W / CELL;
        var ROWS = H / CELL;
        var score = 0;
        var lives = 3;
        var gameOver = false;
        var animId = null;
        var powerMode = false;
        var powerTimer = null;

        var maze = [];
        var dots = [];
        var powerPellets = [];

        function buildMaze() {
            maze = [];
            dots = [];
            powerPellets = [];
            for (var r = 0; r < ROWS; r++) {
                maze[r] = [];
                for (var c = 0; c < COLS; c++) {
                    if (r === 0 || r === ROWS - 1 || c === 0 || c === COLS - 1) {
                        maze[r][c] = 1;
                    } else {
                        maze[r][c] = 0;
                    }
                }
            }
            var walls = [
                [2,2,2,5],[2,8,2,11],[2,14,2,17],
                [4,2,4,4],[4,6,4,8],[4,11,4,13],[4,15,4,17],
                [6,1,6,3],[6,5,6,7],[6,9,6,10],[6,12,6,14],[6,16,6,18],
                [8,2,8,4],[8,6,9,6],[8,8,8,11],[8,13,9,13],[8,15,8,17],
                [10,2,10,4],[10,8,10,11],[10,15,10,17],
                [12,1,12,3],[12,5,12,7],[12,9,12,10],[12,12,12,14],[12,16,12,18],
                [14,2,14,4],[14,6,14,8],[14,11,14,13],[14,15,14,17],
                [16,2,16,5],[16,8,16,11],[16,14,16,17],
                [18,3,18,6],[18,9,18,10],[18,13,18,16]
            ];
            walls.forEach(function(w) {
                for (var r = w[0]; r <= Math.min(w[2], ROWS - 2); r++) {
                    for (var c = w[1]; c <= Math.min(w[3], COLS - 2); c++) {
                        if (r > 0 && r < ROWS - 1 && c > 0 && c < COLS - 1) {
                            maze[r][c] = 1;
                        }
                    }
                }
            });

            for (var r = 1; r < ROWS - 1; r++) {
                for (var c = 1; c < COLS - 1; c++) {
                    if (maze[r][c] === 0) {
                        dots.push({x: c, y: r});
                    }
                }
            }

            powerPellets = [
                {x: 1, y: 1}, {x: COLS - 2, y: 1},
                {x: 1, y: ROWS - 2}, {x: COLS - 2, y: ROWS - 2}
            ];
            powerPellets.forEach(function(pp) {
                if (maze[pp.y][pp.x] === 0) {
                    for (var i = dots.length - 1; i >= 0; i--) {
                        if (dots[i].x === pp.x && dots[i].y === pp.y) {
                            dots.splice(i, 1);
                            break;
                        }
                    }
                }
            });
        }

        var pacman = {x: 10, y: 10, dir: {x: 0, y: 0}, nextDir: {x: 0, y: 0}, mouthOpen: 0, mouthDir: 1};
        var ghosts = [
            {x: 9, y: 8, dir: {x: 1, y: 0}, color: '#ff0000', type: 'chase'},
            {x: 10, y: 8, dir: {x: -1, y: 0}, color: '#ff69b4', type: 'random'}
        ];

        function canMove(x, y) {
            if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
            return maze[y][x] !== 1;
        }

        function resetPositions() {
            pacman.x = 10; pacman.y = 10;
            pacman.dir = {x: 0, y: 0};
            pacman.nextDir = {x: 0, y: 0};
            ghosts[0].x = 9; ghosts[0].y = 8; ghosts[0].dir = {x: 1, y: 0};
            ghosts[1].x = 10; ghosts[1].y = 8; ghosts[1].dir = {x: -1, y: 0};
            powerMode = false;
            if (powerTimer) clearTimeout(powerTimer);
        }

        function init() {
            score = 0;
            lives = 3;
            gameOver = false;
            powerMode = false;
            buildMaze();
            resetPositions();
            callbacks.onScore(0);
            removeGameOverScreen();
        }

        function removeGameOverScreen() {
            var existing = container.querySelector('.game-over-screen');
            if (existing) existing.remove();
        }

        var moveAccum = 0;
        var moveSpeed = 150;
        var ghostAccum = 0;
        var ghostSpeed = 200;
        var lastTime = 0;

        function update(delta) {
            if (gameOver) return;

            moveAccum += delta;
            if (moveAccum >= moveSpeed) {
                moveAccum -= moveSpeed;
                var nx = pacman.x + pacman.nextDir.x;
                var ny = pacman.y + pacman.nextDir.y;
                if (canMove(nx, ny)) {
                    pacman.dir = {x: pacman.nextDir.x, y: pacman.nextDir.y};
                }
                var mx = pacman.x + pacman.dir.x;
                var my = pacman.y + pacman.dir.y;
                if (canMove(mx, my)) {
                    pacman.x = mx;
                    pacman.y = my;
                }

                for (var i = dots.length - 1; i >= 0; i--) {
                    if (dots[i].x === pacman.x && dots[i].y === pacman.y) {
                        dots.splice(i, 1);
                        score += 10;
                        callbacks.onScore(score);
                        break;
                    }
                }

                for (var i = powerPellets.length - 1; i >= 0; i--) {
                    if (powerPellets[i].x === pacman.x && powerPellets[i].y === pacman.y) {
                        powerPellets.splice(i, 1);
                        score += 50;
                        callbacks.onScore(score);
                        powerMode = true;
                        if (powerTimer) clearTimeout(powerTimer);
                        powerTimer = setTimeout(function() { powerMode = false; }, 5000);
                        break;
                    }
                }

                if (dots.length === 0 && powerPellets.length === 0) {
                    buildMaze();
                    resetPositions();
                }
            }

            ghostAccum += delta;
            if (ghostAccum >= ghostSpeed) {
                ghostAccum -= ghostSpeed;
                ghosts.forEach(function(g) {
                    var dirs = [{x:0,y:-1},{x:0,y:1},{x:-1,y:0},{x:1,y:0}];
                    var valid = dirs.filter(function(d) {
                        return canMove(g.x + d.x, g.y + d.y) &&
                               !(d.x === -g.dir.x && d.y === -g.dir.y);
                    });
                    if (valid.length === 0) {
                        valid = dirs.filter(function(d) { return canMove(g.x + d.x, g.y + d.y); });
                    }
                    if (valid.length === 0) return;

                    if (g.type === 'chase' && !powerMode) {
                        valid.sort(function(a, b) {
                            var da = Math.abs((g.x + a.x) - pacman.x) + Math.abs((g.y + a.y) - pacman.y);
                            var db = Math.abs((g.x + b.x) - pacman.x) + Math.abs((g.y + b.y) - pacman.y);
                            return da - db;
                        });
                        g.dir = valid[0];
                    } else if (powerMode && g.type === 'chase') {
                        valid.sort(function(a, b) {
                            var da = Math.abs((g.x + a.x) - pacman.x) + Math.abs((g.y + a.y) - pacman.y);
                            var db = Math.abs((g.x + b.x) - pacman.x) + Math.abs((g.y + b.y) - pacman.y);
                            return db - da;
                        });
                        g.dir = valid[0];
                    } else {
                        g.dir = valid[Math.floor(Math.random() * valid.length)];
                    }
                    g.x += g.dir.x;
                    g.y += g.dir.y;
                });
            }

            pacman.mouthOpen += pacman.mouthDir * 0.15;
            if (pacman.mouthOpen > 1) { pacman.mouthOpen = 1; pacman.mouthDir = -1; }
            if (pacman.mouthOpen < 0) { pacman.mouthOpen = 0; pacman.mouthDir = 1; }

            for (var gi = 0; gi < ghosts.length; gi++) {
                if (ghosts[gi].x === pacman.x && ghosts[gi].y === pacman.y) {
                    if (powerMode) {
                        score += 200;
                        callbacks.onScore(score);
                        ghosts[gi].x = 9 + gi;
                        ghosts[gi].y = 8;
                    } else {
                        lives--;
                        if (lives <= 0) {
                            gameOver = true;
                            callbacks.onGameOver(score);
                            showGameOver();
                        } else {
                            resetPositions();
                        }
                    }
                    break;
                }
            }
        }

        function draw() {
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < COLS; c++) {
                    if (maze[r][c] === 1) {
                        ctx.fillStyle = '#1a1a6a';
                        ctx.fillRect(c * CELL, r * CELL, CELL, CELL);
                        ctx.strokeStyle = '#3333aa';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(c * CELL + 0.5, r * CELL + 0.5, CELL - 1, CELL - 1);
                    }
                }
            }

            ctx.fillStyle = '#ffcc00';
            dots.forEach(function(d) {
                ctx.beginPath();
                ctx.arc(d.x * CELL + CELL / 2, d.y * CELL + CELL / 2, 2, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.fillStyle = '#ff00aa';
            ctx.shadowColor = '#ff00aa';
            ctx.shadowBlur = 8;
            powerPellets.forEach(function(p) {
                ctx.beginPath();
                ctx.arc(p.x * CELL + CELL / 2, p.y * CELL + CELL / 2, 5, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.shadowBlur = 0;

            var px = pacman.x * CELL + CELL / 2;
            var py = pacman.y * CELL + CELL / 2;
            var angle = 0;
            if (pacman.dir.x === 1) angle = 0;
            else if (pacman.dir.x === -1) angle = Math.PI;
            else if (pacman.dir.y === -1) angle = -Math.PI / 2;
            else if (pacman.dir.y === 1) angle = Math.PI / 2;
            var mouth = pacman.mouthOpen * 0.3;
            ctx.fillStyle = '#ffff00';
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(px, py, CELL / 2 - 1, angle + mouth, angle + Math.PI * 2 - mouth);
            ctx.lineTo(px, py);
            ctx.fill();
            ctx.shadowBlur = 0;

            ghosts.forEach(function(g) {
                var gx = g.x * CELL + CELL / 2;
                var gy = g.y * CELL + CELL / 2;
                ctx.fillStyle = powerMode ? '#0000ff' : g.color;
                ctx.shadowColor = powerMode ? '#0000ff' : g.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(gx, gy, CELL / 2 - 1, Math.PI, 0, false);
                ctx.lineTo(gx + CELL / 2 - 1, gy + CELL / 2 - 1);
                for (var w = 0; w < 3; w++) {
                    var wx = gx - CELL / 2 + 1 + (w + 1) * ((CELL - 2) / 3);
                    ctx.lineTo(wx, gy + CELL / 2 - 4);
                    if (w < 2) {
                        var wx2 = gx - CELL / 2 + 1 + (w + 1.5) * ((CELL - 2) / 3);
                        ctx.lineTo(wx2, gy + CELL / 2 - 1);
                    }
                }
                ctx.lineTo(gx - CELL / 2 + 1, gy + CELL / 2 - 1);
                ctx.fill();
                ctx.shadowBlur = 0;

                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(gx - 3, gy - 2, 3, 0, Math.PI * 2);
                ctx.arc(gx + 3, gy - 2, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = powerMode ? '#ff0000' : '#000';
                ctx.beginPath();
                ctx.arc(gx - 3, gy - 2, 1.5, 0, Math.PI * 2);
                ctx.arc(gx + 3, gy - 2, 1.5, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.fillStyle = '#ffcc00';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Lives: ' + lives, 5, H - 5);
        }

        function showGameOver() {
            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
            overlay.innerHTML = '<h2>Game Over</h2><p>Pontuação: ' + score + '</p>';
            var btn = document.createElement('button');
            btn.className = 'btn btn-play';
            btn.textContent = 'Reiniciar';
            btn.addEventListener('click', function() { init(); });
            overlay.appendChild(btn);
            container.appendChild(overlay);
        }

        function loop(timestamp) {
            animId = requestAnimationFrame(loop);
            if (!lastTime) { lastTime = timestamp; return; }
            var delta = timestamp - lastTime;
            lastTime = timestamp;
            if (delta > 100) delta = 100;
            update(delta);
            draw();
        }

        function onKeyDown(e) {
            if (gameOver) return;
            switch(e.key) {
                case 'ArrowUp':    pacman.nextDir = {x:0, y:-1}; e.preventDefault(); break;
                case 'ArrowDown':  pacman.nextDir = {x:0, y:1}; e.preventDefault(); break;
                case 'ArrowLeft':  pacman.nextDir = {x:-1, y:0}; e.preventDefault(); break;
                case 'ArrowRight': pacman.nextDir = {x:1, y:0}; e.preventDefault(); break;
            }
        }

        document.addEventListener('keydown', onKeyDown);
        init();
        animId = requestAnimationFrame(loop);

        return {
            destroy: function() {
                if (animId) cancelAnimationFrame(animId);
                if (powerTimer) clearTimeout(powerTimer);
                document.removeEventListener('keydown', onKeyDown);
            }
        };
    };
})();
