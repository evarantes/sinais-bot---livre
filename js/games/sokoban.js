(function(){
    window.Games = window.Games || {};
    window.Games['sokoban'] = function(container, callbacks) {
        var W = 400, H = 400;
        var canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.style.background = '#0a0a1a';
        canvas.style.border = '2px solid #2a2a5a';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var score = 0, gameOver = false, animId = null, lastTime = 0;
        var currentLevel = 0;
        var player, boxes, targets, walls;
        var CELL, COLS, ROWS, offsetX, offsetY;

        var LEVELS = [
            {
                map: [
                    '########',
                    '#......#',
                    '#.#..#.#',
                    '#..B.B.#',
                    '#.T.T..#',
                    '#..P...#',
                    '#......#',
                    '########'
                ]
            },
            {
                map: [
                    '#########',
                    '#.......#',
                    '#.##.##.#',
                    '#.B..B..#',
                    '#..T.T..#',
                    '#.......#',
                    '#...P...#',
                    '#.......#',
                    '#########'
                ]
            },
            {
                map: [
                    '##########',
                    '#........#',
                    '#.##..##.#',
                    '#.B.BB...#',
                    '#........#',
                    '#..T.TT..#',
                    '#........#',
                    '#...P....#',
                    '#........#',
                    '##########'
                ]
            },
            {
                map: [
                    '########',
                    '#......#',
                    '#.#.##.#',
                    '#.B.B..#',
                    '#.T..T.#',
                    '#..B...#',
                    '#..T.P.#',
                    '#......#',
                    '########'
                ]
            },
            {
                map: [
                    '###########',
                    '#.........#',
                    '#.##.#.##.#',
                    '#..B.B.B..#',
                    '#.........#',
                    '#..T.T.T..#',
                    '#.##.#.##.#',
                    '#.B.....B.#',
                    '#..T...T..#',
                    '#....P....#',
                    '###########'
                ]
            }
        ];

        function init() {
            score = 0; gameOver = false; currentLevel = 0;
            callbacks.onScore(0);
            loadLevel(currentLevel);
            removeGameOverScreen();
        }

        function removeGameOverScreen() {
            var existing = container.querySelector('.game-over-screen');
            if (existing) existing.remove();
        }

        function loadLevel(lvl) {
            var map = LEVELS[lvl].map;
            ROWS = map.length;
            COLS = map[0].length;
            CELL = Math.min(Math.floor(W / COLS), Math.floor(H / ROWS));
            offsetX = Math.floor((W - COLS * CELL) / 2);
            offsetY = Math.floor((H - ROWS * CELL) / 2);

            player = null;
            boxes = [];
            targets = [];
            walls = [];

            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < map[r].length; c++) {
                    var ch = map[r][c];
                    if (ch === '#') walls.push({x: c, y: r});
                    else if (ch === 'B') boxes.push({x: c, y: r});
                    else if (ch === 'T') targets.push({x: c, y: r});
                    else if (ch === 'P') player = {x: c, y: r};
                }
            }
        }

        function isWall(x, y) {
            for (var i = 0; i < walls.length; i++) {
                if (walls[i].x === x && walls[i].y === y) return true;
            }
            return false;
        }

        function getBox(x, y) {
            for (var i = 0; i < boxes.length; i++) {
                if (boxes[i].x === x && boxes[i].y === y) return boxes[i];
            }
            return null;
        }

        function isTarget(x, y) {
            for (var i = 0; i < targets.length; i++) {
                if (targets[i].x === x && targets[i].y === y) return true;
            }
            return false;
        }

        function tryMove(dx, dy) {
            if (gameOver) return;
            var nx = player.x + dx;
            var ny = player.y + dy;
            if (isWall(nx, ny)) return;

            var box = getBox(nx, ny);
            if (box) {
                var bx = nx + dx;
                var by = ny + dy;
                if (isWall(bx, by) || getBox(bx, by)) return;
                box.x = bx;
                box.y = by;
            }

            player.x = nx;
            player.y = ny;

            checkWin();
        }

        function checkWin() {
            var allOnTarget = true;
            for (var i = 0; i < targets.length; i++) {
                var onIt = false;
                for (var j = 0; j < boxes.length; j++) {
                    if (boxes[j].x === targets[i].x && boxes[j].y === targets[i].y) {
                        onIt = true; break;
                    }
                }
                if (!onIt) { allOnTarget = false; break; }
            }

            if (allOnTarget) {
                score += 50;
                callbacks.onScore(score);
                currentLevel++;
                if (currentLevel >= LEVELS.length) {
                    gameOver = true;
                    callbacks.onGameOver(score);
                    showGameOver(true);
                } else {
                    loadLevel(currentLevel);
                }
            }
        }

        function draw() {
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < COLS; c++) {
                    var sx = offsetX + c * CELL;
                    var sy = offsetY + r * CELL;

                    if (isWall(c, r)) {
                        ctx.fillStyle = '#2a2a5a';
                        ctx.fillRect(sx, sy, CELL, CELL);
                        ctx.strokeStyle = '#3a3a7a';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(sx + 1, sy + 1, CELL - 2, CELL - 2);
                    } else {
                        ctx.fillStyle = '#0f0f20';
                        ctx.fillRect(sx, sy, CELL, CELL);
                    }
                }
            }

            targets.forEach(function(t) {
                var sx = offsetX + t.x * CELL + CELL / 2;
                var sy = offsetY + t.y * CELL + CELL / 2;
                ctx.strokeStyle = '#ff00aa';
                ctx.shadowColor = '#ff00aa';
                ctx.shadowBlur = 6;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(sx, sy, CELL / 3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(sx, sy, CELL / 6, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
            });

            boxes.forEach(function(b) {
                var sx = offsetX + b.x * CELL + 2;
                var sy = offsetY + b.y * CELL + 2;
                var onTarget = isTarget(b.x, b.y);
                ctx.fillStyle = onTarget ? '#00ff88' : '#ff6600';
                ctx.shadowColor = onTarget ? '#00ff88' : '#ff6600';
                ctx.shadowBlur = 8;
                ctx.fillRect(sx, sy, CELL - 4, CELL - 4);
                ctx.strokeStyle = onTarget ? '#005533' : '#663300';
                ctx.lineWidth = 2;
                ctx.strokeRect(sx + 2, sy + 2, CELL - 8, CELL - 8);
                ctx.beginPath();
                ctx.moveTo(sx + 2, sy + 2);
                ctx.lineTo(sx + CELL - 6, sy + CELL - 6);
                ctx.moveTo(sx + CELL - 6, sy + 2);
                ctx.lineTo(sx + 2, sy + CELL - 6);
                ctx.stroke();
                ctx.shadowBlur = 0;
            });

            if (player) {
                var sx = offsetX + player.x * CELL + CELL / 2;
                var sy = offsetY + player.y * CELL + CELL / 2;
                ctx.fillStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(sx, sy, CELL / 2 - 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(sx - 4, sy - 3, 3, 0, Math.PI * 2);
                ctx.arc(sx + 4, sy - 3, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(sx - 4, sy - 3, 1.5, 0, Math.PI * 2);
                ctx.arc(sx + 4, sy - 3, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            ctx.fillStyle = '#ffcc00';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Level ' + (currentLevel + 1) + '/' + LEVELS.length, 5, 15);
            ctx.textAlign = 'right';
            ctx.fillText('R=Restart', W - 5, 15);
        }

        function showGameOver(won) {
            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
            overlay.innerHTML = '<h2>' + (won ? 'All Levels Complete!' : 'Game Over') + '</h2><p>Pontuação: ' + score + '</p>';
            var btn = document.createElement('button');
            btn.className = 'btn btn-play';
            btn.textContent = 'Reiniciar';
            btn.addEventListener('click', function() { init(); });
            overlay.appendChild(btn);
            container.appendChild(overlay);
        }

        function loop(timestamp) {
            animId = requestAnimationFrame(loop);
            draw();
        }

        function onKeyDown(e) {
            switch(e.key) {
                case 'ArrowUp':    tryMove(0, -1); e.preventDefault(); break;
                case 'ArrowDown':  tryMove(0, 1); e.preventDefault(); break;
                case 'ArrowLeft':  tryMove(-1, 0); e.preventDefault(); break;
                case 'ArrowRight': tryMove(1, 0); e.preventDefault(); break;
                case 'r': case 'R': loadLevel(currentLevel); break;
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
