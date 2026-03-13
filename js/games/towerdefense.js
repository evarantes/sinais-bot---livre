(function(){
    window.Games = window.Games || {};
    window.Games['towerdefense'] = function(container, callbacks) {
        var W = 500, H = 400;
        var canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.style.background = '#0a0a1a';
        canvas.style.border = '2px solid #2a2a5a';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var CELL = 40;
        var COLS = Math.floor(W / CELL);
        var ROWS = Math.floor(H / CELL);
        var score = 0, gameOver = false, animId = null, lastTime = 0;
        var towers, enemies, bullets, particles;
        var towerBudget = 5;
        var escaped = 0;
        var maxEscaped = 10;
        var waveNum = 0;
        var maxWaves = 5;
        var waveTimer = 0;
        var spawnTimer = 0;
        var enemiesToSpawn = 0;
        var waveActive = false;
        var allWavesDone = false;

        var path = [];

        function buildPath() {
            path = [];
            var y = Math.floor(ROWS / 2);
            for (var x = 0; x <= COLS; x++) {
                path.push({x: x, y: y});
            }
            var turns = [
                {atX: 3, dy: -2}, {atX: 5, dy: 2}, {atX: 7, dy: -2}, {atX: 9, dy: 2}
            ];
            path = [];
            var cx = 0, cy = Math.floor(ROWS / 2);
            while (cx <= COLS) {
                path.push({x: cx, y: cy});
                var turn = null;
                for (var t = 0; t < turns.length; t++) {
                    if (turns[t].atX === cx) { turn = turns[t]; break; }
                }
                if (turn) {
                    var dy = turn.dy > 0 ? 1 : -1;
                    for (var s = 0; s < Math.abs(turn.dy); s++) {
                        cy += dy;
                        cy = Math.max(1, Math.min(ROWS - 2, cy));
                        path.push({x: cx, y: cy});
                    }
                }
                cx++;
            }
        }

        function isOnPath(gx, gy) {
            for (var i = 0; i < path.length; i++) {
                if (path[i].x === gx && path[i].y === gy) return true;
            }
            return false;
        }

        function init() {
            score = 0; gameOver = false; escaped = 0;
            towerBudget = 5; waveNum = 0; allWavesDone = false;
            waveTimer = 120; waveActive = false;
            towers = []; enemies = []; bullets = []; particles = [];
            buildPath();
            callbacks.onScore(0);
            removeGameOverScreen();
        }

        function removeGameOverScreen() {
            var existing = container.querySelector('.game-over-screen');
            if (existing) existing.remove();
        }

        function spawnEnemy() {
            var startNode = path[0];
            enemies.push({
                x: startNode.x * CELL + CELL / 2,
                y: startNode.y * CELL + CELL / 2,
                pathIdx: 0,
                speed: 0.8 + waveNum * 0.15,
                hp: 2 + waveNum,
                maxHp: 2 + waveNum,
                color: '#ff0055'
            });
        }

        function startWave() {
            waveNum++;
            if (waveNum > maxWaves) {
                allWavesDone = true;
                return;
            }
            enemiesToSpawn = 4 + waveNum * 2;
            spawnTimer = 0;
            waveActive = true;
        }

        function dist(x1, y1, x2, y2) {
            return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
        }

        function update(dt) {
            if (gameOver) return;
            var f = dt / 16.67;

            if (!waveActive && !allWavesDone) {
                waveTimer -= f;
                if (waveTimer <= 0) startWave();
            }

            if (waveActive) {
                spawnTimer -= f;
                if (spawnTimer <= 0 && enemiesToSpawn > 0) {
                    spawnEnemy();
                    enemiesToSpawn--;
                    spawnTimer = 40;
                    if (enemiesToSpawn <= 0) waveActive = false;
                }
            }

            if (allWavesDone && enemies.length === 0) {
                gameOver = true;
                callbacks.onGameOver(score);
                showGameOver();
                return;
            }

            for (var ei = enemies.length - 1; ei >= 0; ei--) {
                var e = enemies[ei];
                if (e.pathIdx < path.length - 1) {
                    var target = path[e.pathIdx + 1];
                    var tx = target.x * CELL + CELL / 2;
                    var ty = target.y * CELL + CELL / 2;
                    var dx = tx - e.x, dy = ty - e.y;
                    var d = Math.sqrt(dx*dx + dy*dy);
                    if (d < e.speed * f * 2) {
                        e.x = tx; e.y = ty;
                        e.pathIdx++;
                    } else {
                        e.x += (dx / d) * e.speed * f;
                        e.y += (dy / d) * e.speed * f;
                    }
                } else {
                    escaped++;
                    enemies.splice(ei, 1);
                    if (escaped >= maxEscaped) {
                        gameOver = true;
                        callbacks.onGameOver(score);
                        showGameOver();
                        return;
                    }
                    continue;
                }
            }

            towers.forEach(function(t) {
                t.cooldown -= f;
                if (t.cooldown <= 0) {
                    var closest = null, closestDist = 999;
                    enemies.forEach(function(e) {
                        var d = dist(t.x, t.y, e.x, e.y);
                        if (d < t.range && d < closestDist) {
                            closest = e; closestDist = d;
                        }
                    });
                    if (closest) {
                        bullets.push({x: t.x, y: t.y, tx: closest.x, ty: closest.y, speed: 5, damage: t.damage});
                        t.cooldown = t.fireRate;
                        t.targetAngle = Math.atan2(closest.y - t.y, closest.x - t.x);
                    }
                }
            });

            for (var bi = bullets.length - 1; bi >= 0; bi--) {
                var b = bullets[bi];
                var dx = b.tx - b.x, dy = b.ty - b.y;
                var d = Math.sqrt(dx*dx + dy*dy);
                if (d < b.speed * f * 2) {
                    for (var ei = enemies.length - 1; ei >= 0; ei--) {
                        if (dist(b.tx, b.ty, enemies[ei].x, enemies[ei].y) < CELL) {
                            enemies[ei].hp -= b.damage;
                            if (enemies[ei].hp <= 0) {
                                score += 10;
                                callbacks.onScore(score);
                                for (var p = 0; p < 4; p++) {
                                    particles.push({x: enemies[ei].x, y: enemies[ei].y, vx: (Math.random()-0.5)*3, vy: (Math.random()-0.5)*3, life: 20, color: '#ff6600'});
                                }
                                enemies.splice(ei, 1);
                            }
                            break;
                        }
                    }
                    bullets.splice(bi, 1);
                } else {
                    b.x += (dx / d) * b.speed * f;
                    b.y += (dy / d) * b.speed * f;
                }
            }

            for (var i = particles.length - 1; i >= 0; i--) {
                particles[i].x += particles[i].vx * f;
                particles[i].y += particles[i].vy * f;
                particles[i].life -= f;
                if (particles[i].life <= 0) particles.splice(i, 1);
            }
        }

        function draw() {
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            ctx.strokeStyle = '#1a1a3a';
            ctx.lineWidth = 0.5;
            for (var x = 0; x <= COLS; x++) {
                ctx.beginPath(); ctx.moveTo(x*CELL,0); ctx.lineTo(x*CELL,H); ctx.stroke();
            }
            for (var y = 0; y <= ROWS; y++) {
                ctx.beginPath(); ctx.moveTo(0,y*CELL); ctx.lineTo(W,y*CELL); ctx.stroke();
            }

            ctx.fillStyle = '#1a1a3a';
            for (var i = 0; i < path.length; i++) {
                ctx.fillRect(path[i].x * CELL, path[i].y * CELL, CELL, CELL);
            }
            ctx.strokeStyle = '#333366';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(path[0].x * CELL + CELL/2, path[0].y * CELL + CELL/2);
            for (var i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x * CELL + CELL/2, path[i].y * CELL + CELL/2);
            }
            ctx.stroke();

            towers.forEach(function(t) {
                ctx.fillStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 8;
                ctx.fillRect(t.x - 12, t.y - 12, 24, 24);
                ctx.strokeStyle = '#005566';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(t.x, t.y, t.range, 0, Math.PI*2);
                ctx.stroke();
                ctx.shadowBlur = 0;

                ctx.strokeStyle = '#ffcc00';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(t.x, t.y);
                ctx.lineTo(t.x + Math.cos(t.targetAngle || 0) * 15, t.y + Math.sin(t.targetAngle || 0) * 15);
                ctx.stroke();
            });

            enemies.forEach(function(e) {
                ctx.fillStyle = e.color;
                ctx.shadowColor = e.color;
                ctx.shadowBlur = 5;
                ctx.beginPath();
                ctx.arc(e.x, e.y, 10, 0, Math.PI*2);
                ctx.fill();
                ctx.shadowBlur = 0;

                var hpPct = e.hp / e.maxHp;
                ctx.fillStyle = '#333';
                ctx.fillRect(e.x - 12, e.y - 16, 24, 4);
                ctx.fillStyle = hpPct > 0.5 ? '#00ff88' : '#ff6600';
                ctx.fillRect(e.x - 12, e.y - 16, 24 * hpPct, 4);
            });

            ctx.fillStyle = '#ffcc00';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 4;
            bullets.forEach(function(b) {
                ctx.beginPath();
                ctx.arc(b.x, b.y, 3, 0, Math.PI*2);
                ctx.fill();
            });
            ctx.shadowBlur = 0;

            particles.forEach(function(p) {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.life / 20);
                ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
            });
            ctx.globalAlpha = 1;

            ctx.fillStyle = '#ffcc00';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Towers: ' + towerBudget, 5, H - 5);
            ctx.textAlign = 'center';
            ctx.fillText('Wave ' + Math.min(waveNum, maxWaves) + '/' + maxWaves, W/2, H - 5);
            ctx.textAlign = 'right';
            ctx.fillText('Escaped: ' + escaped + '/' + maxEscaped, W - 5, H - 5);

            if (towerBudget > 0 && !gameOver) {
                ctx.fillStyle = 'rgba(0,240,255,0.15)';
                ctx.font = '9px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Click to place tower', W/2, 15);
            }
        }

        function showGameOver() {
            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
            var won = allWavesDone && escaped < maxEscaped;
            overlay.innerHTML = '<h2>' + (won ? 'You Win!' : 'Game Over') + '</h2><p>Pontuação: ' + score + '</p>';
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

        function onClick(e) {
            if (gameOver || towerBudget <= 0) return;
            var rect = canvas.getBoundingClientRect();
            var mx = (e.clientX - rect.left) * (W / rect.width);
            var my = (e.clientY - rect.top) * (H / rect.height);
            var gx = Math.floor(mx / CELL);
            var gy = Math.floor(my / CELL);
            if (gx < 0 || gx >= COLS || gy < 0 || gy >= ROWS) return;
            if (isOnPath(gx, gy)) return;
            for (var i = 0; i < towers.length; i++) {
                var tx = Math.floor((towers[i].x) / CELL);
                var ty = Math.floor((towers[i].y) / CELL);
                if (tx === gx && ty === gy) return;
            }
            var adjacentToPath = false;
            for (var dx = -1; dx <= 1; dx++) {
                for (var dy = -1; dy <= 1; dy++) {
                    if (isOnPath(gx + dx, gy + dy)) { adjacentToPath = true; break; }
                }
                if (adjacentToPath) break;
            }
            if (!adjacentToPath) return;
            towers.push({
                x: gx * CELL + CELL / 2,
                y: gy * CELL + CELL / 2,
                range: CELL * 2.5,
                damage: 1,
                fireRate: 25,
                cooldown: 0,
                targetAngle: 0
            });
            towerBudget--;
        }

        canvas.addEventListener('click', onClick);
        init();
        animId = requestAnimationFrame(loop);

        return {
            destroy: function() {
                if (animId) cancelAnimationFrame(animId);
                canvas.removeEventListener('click', onClick);
            }
        };
    };
})();
