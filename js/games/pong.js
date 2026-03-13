(function(){
    window.Games = window.Games || {};
    window.Games['pong'] = function(container, callbacks) {
        var W = 480, H = 360;
        var canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.style.background = '#0a0a1a';
        canvas.style.border = '2px solid #2a2a5a';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var PADDLE_W = 10, PADDLE_H = 70, BALL_R = 6;
        var WIN_SCORE = 7;

        var player, ai, ball, playerScore, aiScore, gameOver;
        var keysDown = {};
        var animId = null;
        var lastTime = 0;
        var speedMultiplier;
        var rallyCount;

        function init() {
            player = {x: 15, y: H / 2 - PADDLE_H / 2, w: PADDLE_W, h: PADDLE_H, speed: 5};
            ai = {x: W - 15 - PADDLE_W, y: H / 2 - PADDLE_H / 2, w: PADDLE_W, h: PADDLE_H, speed: 3.5};
            playerScore = 0;
            aiScore = 0;
            gameOver = false;
            speedMultiplier = 1;
            rallyCount = 0;
            resetBall(1);
            callbacks.onScore(0);
            removeGameOverScreen();
        }

        function removeGameOverScreen() {
            var existing = container.querySelector('.game-over-screen');
            if (existing) existing.remove();
        }

        function resetBall(dirX) {
            ball = {
                x: W / 2,
                y: H / 2,
                vx: 4 * (dirX || (Math.random() > 0.5 ? 1 : -1)),
                vy: (Math.random() * 3 - 1.5)
            };
            speedMultiplier = 1;
            rallyCount = 0;
        }

        function update(dt) {
            if (gameOver) return;

            if (keysDown['w'] || keysDown['W'] || keysDown['ArrowUp']) {
                player.y -= player.speed;
            }
            if (keysDown['s'] || keysDown['S'] || keysDown['ArrowDown']) {
                player.y += player.speed;
            }
            player.y = Math.max(0, Math.min(H - player.h, player.y));

            var aiCenter = ai.y + ai.h / 2;
            var target = ball.y;
            var diff = target - aiCenter;
            var aiMoveSpeed = ai.speed + (rallyCount * 0.05);
            if (Math.abs(diff) > 5) {
                ai.y += (diff > 0 ? 1 : -1) * Math.min(aiMoveSpeed, Math.abs(diff));
            }
            ai.y = Math.max(0, Math.min(H - ai.h, ai.y));

            ball.x += ball.vx * speedMultiplier;
            ball.y += ball.vy * speedMultiplier;

            if (ball.y - BALL_R <= 0) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy); }
            if (ball.y + BALL_R >= H) { ball.y = H - BALL_R; ball.vy = -Math.abs(ball.vy); }

            if (ball.vx < 0 &&
                ball.x - BALL_R <= player.x + player.w &&
                ball.x + BALL_R >= player.x &&
                ball.y >= player.y && ball.y <= player.y + player.h) {
                ball.vx = Math.abs(ball.vx);
                var hitPos = (ball.y - (player.y + player.h / 2)) / (player.h / 2);
                ball.vy = hitPos * 4;
                rallyCount++;
                speedMultiplier = Math.min(2, 1 + rallyCount * 0.05);
            }

            if (ball.vx > 0 &&
                ball.x + BALL_R >= ai.x &&
                ball.x - BALL_R <= ai.x + ai.w &&
                ball.y >= ai.y && ball.y <= ai.y + ai.h) {
                ball.vx = -Math.abs(ball.vx);
                var hitPos2 = (ball.y - (ai.y + ai.h / 2)) / (ai.h / 2);
                ball.vy = hitPos2 * 4;
                rallyCount++;
                speedMultiplier = Math.min(2, 1 + rallyCount * 0.05);
            }

            if (ball.x < 0) {
                aiScore++;
                if (aiScore >= WIN_SCORE) {
                    endGame();
                } else {
                    resetBall(1);
                }
                callbacks.onScore(playerScore);
            }
            if (ball.x > W) {
                playerScore++;
                callbacks.onScore(playerScore);
                if (playerScore >= WIN_SCORE) {
                    endGame();
                } else {
                    resetBall(-1);
                }
            }
        }

        function draw() {
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            ctx.setLineDash([6, 6]);
            ctx.strokeStyle = '#2a2a5a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(W / 2, 0);
            ctx.lineTo(W / 2, H);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 10;
            ctx.fillRect(player.x, player.y, player.w, player.h);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#ff00aa';
            ctx.shadowColor = '#ff00aa';
            ctx.shadowBlur = 10;
            ctx.fillRect(ai.x, ai.y, ai.w, ai.h);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#ffcc00';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#00f0ff';
            ctx.font = '32px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(playerScore, W / 4, 50);
            ctx.fillStyle = '#ff00aa';
            ctx.fillText(aiScore, 3 * W / 4, 50);
        }

        function endGame() {
            gameOver = true;
            callbacks.onGameOver(playerScore);
            showGameOver();
        }

        function showGameOver() {
            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
            var msg = playerScore >= WIN_SCORE ? 'Você Venceu!' : 'IA Venceu!';
            overlay.innerHTML = '<h2>' + msg + '</h2><p>' + playerScore + ' x ' + aiScore + '</p>';
            var btn = document.createElement('button');
            btn.className = 'btn btn-play';
            btn.textContent = 'Reiniciar';
            btn.addEventListener('click', function() { init(); });
            overlay.appendChild(btn);
            container.appendChild(overlay);
        }

        function loop(timestamp) {
            animId = requestAnimationFrame(loop);
            var dt = timestamp - lastTime;
            lastTime = timestamp;
            if (dt > 100) dt = 16;
            update(dt);
            draw();
        }

        function onKeyDown(e) {
            keysDown[e.key] = true;
            if (['ArrowUp','ArrowDown','w','s','W','S'].indexOf(e.key) !== -1) e.preventDefault();
        }
        function onKeyUp(e) {
            keysDown[e.key] = false;
        }

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
