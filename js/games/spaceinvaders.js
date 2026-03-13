(function(){
    window.Games = window.Games || {};
    window.Games['spaceinvaders'] = function(container, callbacks) {
        var canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 500;
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.style.background = '#0a0a1a';
        canvas.style.borderRadius = '8px';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var W = canvas.width, H = canvas.height;
        var score = 0;
        var lives = 3;
        var gameOver = false;
        var gameWon = false;

        var player = { x: W / 2 - 20, y: H - 50, w: 40, h: 16, speed: 5 };
        var bullets = [];
        var alienBullets = [];
        var aliens = [];
        var alienDir = 1;
        var alienSpeed = 1;
        var alienDropDist = 20;
        var alienShootChance = 0.005;
        var keys = {};

        var COLS = 8, ROWS = 5;
        var alienW = 32, alienH = 20, alienPadX = 10, alienPadY = 10;
        var gridW = COLS * (alienW + alienPadX);
        var offsetX = (W - gridW) / 2;

        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                aliens.push({
                    x: offsetX + c * (alienW + alienPadX),
                    y: 40 + r * (alienH + alienPadY),
                    w: alienW, h: alienH, alive: true
                });
            }
        }

        var totalAliens = aliens.length;

        function aliveCount() {
            var n = 0;
            for (var i = 0; i < aliens.length; i++) if (aliens[i].alive) n++;
            return n;
        }

        function keydown(e) {
            keys[e.key] = true;
            if (e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
            if (e.key === ' ' && !gameOver) {
                bullets.push({ x: player.x + player.w / 2 - 2, y: player.y, w: 4, h: 10 });
            }
        }
        function keyup(e) { keys[e.key] = false; }
        document.addEventListener('keydown', keydown);
        document.addEventListener('keyup', keyup);

        function endGame(won) {
            if (gameOver) return;
            gameOver = true;
            gameWon = won;
            callbacks.onGameOver(score);
        }

        function update() {
            if (gameOver) return;

            if (keys['ArrowLeft']) player.x -= player.speed;
            if (keys['ArrowRight']) player.x += player.speed;
            if (player.x < 0) player.x = 0;
            if (player.x > W - player.w) player.x = W - player.w;

            for (var i = bullets.length - 1; i >= 0; i--) {
                bullets[i].y -= 6;
                if (bullets[i].y < -10) { bullets.splice(i, 1); continue; }
                for (var j = 0; j < aliens.length; j++) {
                    var a = aliens[j];
                    if (a.alive && rectsOverlap(bullets[i], a)) {
                        a.alive = false;
                        bullets.splice(i, 1);
                        score += 10;
                        callbacks.onScore(score);
                        var alive = aliveCount();
                        alienSpeed = 1 + (totalAliens - alive) / totalAliens * 3;
                        alienShootChance = 0.005 + (totalAliens - alive) / totalAliens * 0.015;
                        if (alive === 0) endGame(true);
                        break;
                    }
                }
            }

            var moveDown = false;
            var leftMost = W, rightMost = 0;
            for (var i = 0; i < aliens.length; i++) {
                if (!aliens[i].alive) continue;
                if (aliens[i].x < leftMost) leftMost = aliens[i].x;
                if (aliens[i].x + aliens[i].w > rightMost) rightMost = aliens[i].x + aliens[i].w;
            }
            if (alienDir === 1 && rightMost + alienSpeed >= W) { alienDir = -1; moveDown = true; }
            else if (alienDir === -1 && leftMost - alienSpeed <= 0) { alienDir = 1; moveDown = true; }

            for (var i = 0; i < aliens.length; i++) {
                if (!aliens[i].alive) continue;
                aliens[i].x += alienDir * alienSpeed;
                if (moveDown) aliens[i].y += alienDropDist;
                if (aliens[i].y + aliens[i].h >= player.y) { endGame(false); return; }
                if (aliens[i].alive && Math.random() < alienShootChance / aliveCount()) {
                    alienBullets.push({ x: aliens[i].x + aliens[i].w / 2 - 2, y: aliens[i].y + aliens[i].h, w: 4, h: 10 });
                }
            }

            for (var i = alienBullets.length - 1; i >= 0; i--) {
                alienBullets[i].y += 4;
                if (alienBullets[i].y > H) { alienBullets.splice(i, 1); continue; }
                if (rectsOverlap(alienBullets[i], player)) {
                    alienBullets.splice(i, 1);
                    lives--;
                    if (lives <= 0) { endGame(false); return; }
                }
            }
        }

        function rectsOverlap(a, b) {
            return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.moveTo(player.x + player.w / 2, player.y - 6);
            ctx.lineTo(player.x, player.y + player.h);
            ctx.lineTo(player.x + player.w, player.y + player.h);
            ctx.closePath();
            ctx.fill();

            for (var i = 0; i < aliens.length; i++) {
                if (!aliens[i].alive) continue;
                var a = aliens[i];
                ctx.fillStyle = '#ff00aa';
                ctx.fillRect(a.x, a.y, a.w, a.h);
                ctx.fillStyle = '#0a0a1a';
                ctx.fillRect(a.x + 6, a.y + 5, 6, 6);
                ctx.fillRect(a.x + a.w - 12, a.y + 5, 6, 6);
            }

            ctx.fillStyle = '#00ff88';
            for (var i = 0; i < bullets.length; i++) {
                ctx.fillRect(bullets[i].x, bullets[i].y, bullets[i].w, bullets[i].h);
            }

            ctx.fillStyle = '#ffcc00';
            for (var i = 0; i < alienBullets.length; i++) {
                ctx.fillRect(alienBullets[i].x, alienBullets[i].y, alienBullets[i].w, alienBullets[i].h);
            }

            ctx.fillStyle = '#ff00aa';
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('VIDAS: ' + lives, 10, 25);

            if (gameOver) {
                ctx.fillStyle = 'rgba(10,10,26,0.85)';
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = gameWon ? '#00ff88' : '#ff00aa';
                ctx.font = '20px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(gameWon ? 'VITÓRIA!' : 'GAME OVER', W / 2, H / 2 - 40);
                ctx.fillStyle = '#00f0ff';
                ctx.font = '14px "Press Start 2P", monospace';
                ctx.fillText('Pontos: ' + score, W / 2, H / 2);

                if (!restartBtn) {
                    restartBtn = document.createElement('button');
                    restartBtn.textContent = 'Reiniciar';
                    restartBtn.style.cssText = 'display:block;margin:16px auto;padding:10px 32px;font-family:"Press Start 2P",monospace;font-size:14px;background:#ff00aa;color:#fff;border:none;border-radius:6px;cursor:pointer;';
                    restartBtn.addEventListener('click', restart);
                    container.appendChild(restartBtn);
                }
            }
        }

        var restartBtn = null;

        function restart() {
            if (restartBtn) { restartBtn.remove(); restartBtn = null; }
            score = 0; lives = 3; gameOver = false; gameWon = false;
            bullets = []; alienBullets = [];
            alienDir = 1; alienSpeed = 1; alienShootChance = 0.005;
            player.x = W / 2 - 20;
            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < COLS; c++) {
                    var idx = r * COLS + c;
                    aliens[idx].x = offsetX + c * (alienW + alienPadX);
                    aliens[idx].y = 40 + r * (alienH + alienPadY);
                    aliens[idx].alive = true;
                }
            }
            callbacks.onScore(0);
        }

        var animId = null;
        function loop() {
            update();
            draw();
            animId = requestAnimationFrame(loop);
        }
        animId = requestAnimationFrame(loop);

        return {
            destroy: function() {
                if (animId) cancelAnimationFrame(animId);
                document.removeEventListener('keydown', keydown);
                document.removeEventListener('keyup', keyup);
                if (restartBtn) restartBtn.remove();
            }
        };
    };
})();
