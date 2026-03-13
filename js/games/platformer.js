(function(){
    window.Games = window.Games || {};
    window.Games['platformer'] = function(container, callbacks) {
        var W = 600, H = 400;
        var canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.style.background = '#0a0a1a';
        canvas.style.border = '2px solid #2a2a5a';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var score = 0, lives = 3, gameOver = false, animId = null, lastTime = 0;
        var player, platforms, coins, enemies, flag, cameraX;
        var keys = {};
        var GRAVITY = 0.4;
        var LEVEL_W = 2400;

        function init() {
            score = 0; lives = 3; gameOver = false; cameraX = 0;
            buildLevel();
            callbacks.onScore(0);
            removeGameOverScreen();
        }

        function removeGameOverScreen() {
            var existing = container.querySelector('.game-over-screen');
            if (existing) existing.remove();
        }

        function buildLevel() {
            player = {x: 50, y: 300, w: 20, h: 28, vx: 0, vy: 0, onGround: false, facing: 1};
            platforms = [
                {x: 0, y: 370, w: LEVEL_W, h: 30, color: '#1a4a1a'},
            ];
            coins = [];
            enemies = [];

            var px = 150;
            for (var i = 0; i < 20; i++) {
                var pw = 60 + Math.random() * 100;
                var py = 200 + Math.random() * 140;
                platforms.push({x: px, y: py, w: pw, h: 15, color: '#2a2a6a'});

                if (Math.random() < 0.6) {
                    coins.push({x: px + pw/2, y: py - 25, w: 14, h: 14, collected: false});
                }
                if (Math.random() < 0.35 && pw > 70) {
                    enemies.push({
                        x: px + 10, y: py - 24, w: 20, h: 20,
                        minX: px, maxX: px + pw - 20,
                        vx: 1 + Math.random(), color: '#ff0055'
                    });
                }
                px += pw + 30 + Math.random() * 80;
            }

            for (var i = 0; i < 10; i++) {
                coins.push({x: 100 + i * 220 + Math.random() * 100, y: 340, w: 14, h: 14, collected: false});
            }

            flag = {x: LEVEL_W - 100, y: 300, w: 20, h: 70};
        }

        function update(dt) {
            if (gameOver) return;
            var f = dt / 16.67;

            if (keys['ArrowLeft']) { player.vx = -3.5; player.facing = -1; }
            else if (keys['ArrowRight']) { player.vx = 3.5; player.facing = 1; }
            else { player.vx *= 0.85; }

            if ((keys[' '] || keys['ArrowUp']) && player.onGround) {
                player.vy = -9;
                player.onGround = false;
            }

            player.vy += GRAVITY * f;
            if (player.vy > 12) player.vy = 12;

            player.x += player.vx * f;
            player.y += player.vy * f;

            player.onGround = false;
            for (var i = 0; i < platforms.length; i++) {
                var p = platforms[i];
                if (player.x + player.w > p.x && player.x < p.x + p.w) {
                    if (player.y + player.h > p.y && player.y + player.h < p.y + p.h + player.vy * f + 5 && player.vy >= 0) {
                        player.y = p.y - player.h;
                        player.vy = 0;
                        player.onGround = true;
                    }
                    if (player.y < p.y + p.h && player.y > p.y && player.vy < 0) {
                        player.y = p.y + p.h;
                        player.vy = 0;
                    }
                }
            }

            if (player.x < 0) player.x = 0;
            if (player.y > H + 50) {
                loseLife();
                return;
            }

            for (var i = 0; i < coins.length; i++) {
                if (!coins[i].collected &&
                    player.x + player.w > coins[i].x && player.x < coins[i].x + coins[i].w &&
                    player.y + player.h > coins[i].y && player.y < coins[i].y + coins[i].h) {
                    coins[i].collected = true;
                    score += 10;
                    callbacks.onScore(score);
                }
            }

            for (var i = enemies.length - 1; i >= 0; i--) {
                var e = enemies[i];
                e.x += e.vx * f;
                if (e.x <= e.minX || e.x + e.w >= e.maxX) e.vx = -e.vx;

                if (player.x + player.w > e.x && player.x < e.x + e.w &&
                    player.y + player.h > e.y && player.y < e.y + e.h) {
                    if (player.vy > 0 && player.y + player.h < e.y + e.h / 2 + 5) {
                        enemies.splice(i, 1);
                        player.vy = -6;
                        score += 25;
                        callbacks.onScore(score);
                    } else {
                        loseLife();
                        return;
                    }
                }
            }

            if (player.x + player.w > flag.x && player.x < flag.x + flag.w &&
                player.y + player.h > flag.y && player.y < flag.y + flag.h) {
                score += 100;
                callbacks.onScore(score);
                gameOver = true;
                callbacks.onGameOver(score);
                showGameOver(true);
                return;
            }

            cameraX = player.x - W / 3;
            if (cameraX < 0) cameraX = 0;
            if (cameraX > LEVEL_W - W) cameraX = LEVEL_W - W;
        }

        function loseLife() {
            lives--;
            if (lives <= 0) {
                gameOver = true;
                callbacks.onGameOver(score);
                showGameOver(false);
            } else {
                player.x = 50; player.y = 300; player.vx = 0; player.vy = 0;
                cameraX = 0;
            }
        }

        function draw() {
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            ctx.save();
            ctx.translate(-cameraX, 0);

            platforms.forEach(function(p) {
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.w, p.h);
                ctx.strokeStyle = '#3a6a3a';
                ctx.lineWidth = 1;
                ctx.strokeRect(p.x, p.y, p.w, p.h);
            });

            coins.forEach(function(c) {
                if (c.collected) return;
                ctx.fillStyle = '#ffcc00';
                ctx.shadowColor = '#ffcc00';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(c.x + c.w/2, c.y + c.h/2, c.w/2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#aa8800';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('$', c.x + c.w/2, c.y + c.h/2 + 4);
                ctx.shadowBlur = 0;
            });

            enemies.forEach(function(e) {
                ctx.fillStyle = e.color;
                ctx.shadowColor = e.color;
                ctx.shadowBlur = 6;
                ctx.fillRect(e.x, e.y, e.w, e.h);
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(e.x + 6, e.y + 7, 3, 0, Math.PI*2);
                ctx.arc(e.x + 14, e.y + 7, 3, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(e.x + 7, e.y + 7, 1.5, 0, Math.PI*2);
                ctx.arc(e.x + 15, e.y + 7, 1.5, 0, Math.PI*2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            ctx.fillStyle = '#ff0055';
            ctx.fillRect(flag.x + 2, flag.y, 4, flag.h);
            ctx.fillStyle = '#00ff88';
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(flag.x + 6, flag.y);
            ctx.lineTo(flag.x + 25, flag.y + 12);
            ctx.lineTo(flag.x + 6, flag.y + 24);
            ctx.fill();
            ctx.shadowBlur = 0;

            if (!gameOver) {
                ctx.fillStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 8;
                ctx.fillRect(player.x, player.y, player.w, player.h);
                ctx.fillStyle = '#0088aa';
                ctx.fillRect(player.x + 3, player.y + player.h - 8, player.w - 6, 8);
                ctx.fillStyle = '#fff';
                var eyeX = player.facing === 1 ? player.x + 13 : player.x + 5;
                ctx.beginPath();
                ctx.arc(eyeX, player.y + 8, 3, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(eyeX + player.facing, player.y + 8, 1.5, 0, Math.PI*2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            ctx.restore();

            ctx.fillStyle = '#ffcc00';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Lives: ' + lives, 5, 20);
            ctx.textAlign = 'right';
            ctx.fillText('Score: ' + score, W - 5, 20);
        }

        function showGameOver(won) {
            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
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

        function onKeyDown(e) {
            keys[e.key] = true;
            if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].indexOf(e.key) >= 0) e.preventDefault();
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
