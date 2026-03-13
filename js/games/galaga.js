(function(){
    window.Games = window.Games || {};
    window.Games['galaga'] = function(container, callbacks) {
        var W = 400, H = 500;
        var canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.style.background = '#0a0a1a';
        canvas.style.border = '2px solid #2a2a5a';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var score = 0, lives = 3, gameOver = false, animId = null, lastTime = 0;
        var player, playerBullets, enemies, enemyBullets, particles;
        var keys = {};
        var wave = 0;
        var waveTimer = 0;
        var shootCD = 0;

        function init() {
            score = 0; lives = 3; gameOver = false; wave = 0;
            player = {x: W/2, y: H - 40, w: 24, h: 24};
            playerBullets = [];
            enemies = [];
            enemyBullets = [];
            particles = [];
            spawnWave();
            callbacks.onScore(0);
            removeGameOverScreen();
        }

        function removeGameOverScreen() {
            var existing = container.querySelector('.game-over-screen');
            if (existing) existing.remove();
        }

        function spawnWave() {
            wave++;
            var rows = Math.min(4, 2 + Math.floor(wave / 2));
            var cols = Math.min(8, 5 + Math.floor(wave / 3));
            for (var r = 0; r < rows; r++) {
                for (var c = 0; c < cols; c++) {
                    var type = r === 0 ? 2 : r === 1 ? 1 : 0;
                    enemies.push({
                        x: 50 + c * 40,
                        y: -30 - r * 35,
                        targetY: 50 + r * 35,
                        w: 24, h: 20,
                        type: type,
                        hp: type === 2 ? 2 : 1,
                        entering: true,
                        diving: false,
                        diveAngle: 0,
                        diveSpeed: 0,
                        color: type === 2 ? '#ff0055' : type === 1 ? '#ff6600' : '#00f0ff',
                        scoreVal: type === 2 ? 30 : type === 1 ? 20 : 10
                    });
                }
            }
            waveTimer = 0;
        }

        var formationDir = 1;
        var formationX = 0;

        function update(dt) {
            if (gameOver) return;
            var f = dt / 16.67;
            shootCD -= f;

            if (keys['ArrowLeft']) player.x -= 4 * f;
            if (keys['ArrowRight']) player.x += 4 * f;
            if (player.x < 0) player.x = 0;
            if (player.x + player.w > W) player.x = W - player.w;

            formationX += formationDir * 0.3 * f;
            if (formationX > 30) formationDir = -1;
            if (formationX < -30) formationDir = 1;

            for (var i = playerBullets.length - 1; i >= 0; i--) {
                playerBullets[i].y -= 6 * f;
                if (playerBullets[i].y < -10) playerBullets.splice(i, 1);
            }

            for (var i = enemyBullets.length - 1; i >= 0; i--) {
                enemyBullets[i].y += 4 * f;
                if (enemyBullets[i].y > H + 10) enemyBullets.splice(i, 1);
            }

            for (var i = particles.length - 1; i >= 0; i--) {
                particles[i].x += particles[i].vx * f;
                particles[i].y += particles[i].vy * f;
                particles[i].life -= f;
                if (particles[i].life <= 0) particles.splice(i, 1);
            }

            enemies.forEach(function(e) {
                if (e.entering) {
                    e.y += 2 * f;
                    if (e.y >= e.targetY) {
                        e.y = e.targetY;
                        e.entering = false;
                    }
                } else if (e.diving) {
                    e.x += Math.sin(e.diveAngle) * 2 * f;
                    e.y += e.diveSpeed * f;
                    e.diveAngle += 0.05 * f;
                    if (e.y > H + 30) {
                        e.y = -30;
                        e.diving = false;
                        e.entering = true;
                    }
                } else {
                    e.x += formationDir * 0.3 * f;
                }

                if (!e.entering && !e.diving && Math.random() < 0.0008 * f) {
                    e.diving = true;
                    e.diveSpeed = 2 + Math.random() * 2;
                    e.diveAngle = Math.random() * Math.PI * 2;
                }

                if (Math.random() < 0.001 * f && !e.entering) {
                    enemyBullets.push({x: e.x + e.w/2, y: e.y + e.h});
                }
            });

            for (var bi = playerBullets.length - 1; bi >= 0; bi--) {
                for (var ei = enemies.length - 1; ei >= 0; ei--) {
                    var b = playerBullets[bi], e = enemies[ei];
                    if (b && b.x > e.x && b.x < e.x + e.w && b.y > e.y && b.y < e.y + e.h) {
                        e.hp--;
                        playerBullets.splice(bi, 1);
                        if (e.hp <= 0) {
                            score += e.scoreVal;
                            callbacks.onScore(score);
                            for (var p = 0; p < 6; p++) {
                                particles.push({x: e.x + e.w/2, y: e.y + e.h/2, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4, life: 20, color: e.color});
                            }
                            enemies.splice(ei, 1);
                        }
                        break;
                    }
                }
            }

            for (var bi = enemyBullets.length - 1; bi >= 0; bi--) {
                var b = enemyBullets[bi];
                if (b.x > player.x && b.x < player.x + player.w && b.y > player.y && b.y < player.y + player.h) {
                    enemyBullets.splice(bi, 1);
                    loseLife();
                    break;
                }
            }

            for (var ei = 0; ei < enemies.length; ei++) {
                var e = enemies[ei];
                if (e.diving && e.x < player.x + player.w && e.x + e.w > player.x && e.y < player.y + player.h && e.y + e.h > player.y) {
                    enemies.splice(ei, 1);
                    loseLife();
                    break;
                }
            }

            if (enemies.length === 0) {
                spawnWave();
            }
        }

        function loseLife() {
            lives--;
            if (lives <= 0) {
                gameOver = true;
                callbacks.onGameOver(score);
                showGameOver();
            } else {
                player.x = W/2; player.y = H - 40;
            }
        }

        function draw() {
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            for (var i = 0; i < 30; i++) {
                ctx.fillStyle = 'rgba(255,255,255,' + (0.3 + Math.random()*0.3) + ')';
                ctx.fillRect((i * 137 + wave * 3) % W, (i * 89 + wave * 7) % H, 1, 1);
            }

            if (!gameOver) {
                ctx.fillStyle = '#00ff88';
                ctx.shadowColor = '#00ff88';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.moveTo(player.x + player.w/2, player.y);
                ctx.lineTo(player.x, player.y + player.h);
                ctx.lineTo(player.x + player.w/4, player.y + player.h - 5);
                ctx.lineTo(player.x + player.w/2, player.y + player.h);
                ctx.lineTo(player.x + player.w*3/4, player.y + player.h - 5);
                ctx.lineTo(player.x + player.w, player.y + player.h);
                ctx.closePath();
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            ctx.shadowBlur = 5;
            playerBullets.forEach(function(b) {
                ctx.fillStyle = '#ffcc00';
                ctx.shadowColor = '#ffcc00';
                ctx.fillRect(b.x - 1, b.y, 2, 8);
            });

            enemyBullets.forEach(function(b) {
                ctx.fillStyle = '#ff0055';
                ctx.shadowColor = '#ff0055';
                ctx.fillRect(b.x - 1, b.y, 2, 6);
            });
            ctx.shadowBlur = 0;

            enemies.forEach(function(e) {
                ctx.fillStyle = e.color;
                ctx.shadowColor = e.color;
                ctx.shadowBlur = 6;
                if (e.type === 2) {
                    ctx.beginPath();
                    ctx.moveTo(e.x + e.w/2, e.y);
                    ctx.lineTo(e.x + e.w, e.y + e.h*0.6);
                    ctx.lineTo(e.x + e.w*0.8, e.y + e.h);
                    ctx.lineTo(e.x + e.w*0.2, e.y + e.h);
                    ctx.lineTo(e.x, e.y + e.h*0.6);
                    ctx.closePath();
                    ctx.fill();
                } else if (e.type === 1) {
                    ctx.fillRect(e.x + 2, e.y + 2, e.w - 4, e.h - 4);
                    ctx.fillRect(e.x - 3, e.y + 6, 6, 8);
                    ctx.fillRect(e.x + e.w - 3, e.y + 6, 6, 8);
                } else {
                    ctx.beginPath();
                    ctx.arc(e.x + e.w/2, e.y + e.h/2, e.w/2 - 2, 0, Math.PI*2);
                    ctx.fill();
                }
                ctx.shadowBlur = 0;
            });

            particles.forEach(function(p) {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.life / 20);
                ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
            });
            ctx.globalAlpha = 1;

            ctx.fillStyle = '#ffcc00';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Lives: ' + lives, 5, H - 5);
            ctx.textAlign = 'right';
            ctx.fillText('Wave ' + wave, W - 5, H - 5);
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
            keys[e.key] = true;
            if (e.key === ' ' && !gameOver && shootCD <= 0) {
                playerBullets.push({x: player.x + player.w/2, y: player.y});
                shootCD = 12;
                e.preventDefault();
            }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
        }
        function onKeyUp(e) { keys[e.key] = false; }

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        init();
        animId = requestAnimationFrame(loop);

        return {
            destroy: function() {
                if (animId) cancelAnimationFrame(animId);
                document.removeEventListener('keydown', onKeyDown);
                document.removeEventListener('keyup', onKeyUp);
            }
        };
    };
})();
