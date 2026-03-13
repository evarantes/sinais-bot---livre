(function(){
    window.Games = window.Games || {};
    window.Games['breakout'] = function(container, callbacks) {
        var W = 480, H = 400;
        var canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        canvas.style.background = '#0a0a1a';
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var score = 0;
        var lives = 3;
        var gameOver = false;
        var won = false;
        var animId = null;

        var paddleW = 80, paddleH = 12, paddleX = (W - paddleW) / 2;
        var ballR = 6, ballX = W / 2, ballY = H - 40, ballDX = 3, ballDY = -3;
        var rightPressed = false, leftPressed = false;
        var useMouseControl = false;

        var brickRows = 5, brickCols = 8;
        var brickW = 52, brickH = 18, brickPad = 4, brickOffTop = 40, brickOffLeft = (W - (brickCols * (brickW + brickPad) - brickPad)) / 2;
        var brickColors = ['#ff00aa', '#00f0ff', '#00ff88', '#ffcc00', '#aa44ff'];
        var bricks = [];
        for (var r = 0; r < brickRows; r++) {
            bricks[r] = [];
            for (var c = 0; c < brickCols; c++) {
                bricks[r][c] = { x: 0, y: 0, alive: true };
            }
        }

        function resetBall() {
            ballX = W / 2;
            ballY = H - 40;
            ballDX = 3 * (Math.random() > 0.5 ? 1 : -1);
            ballDY = -3;
        }

        function keyDown(e) {
            if (e.key === 'ArrowRight' || e.key === 'Right') { rightPressed = true; useMouseControl = false; }
            if (e.key === 'ArrowLeft' || e.key === 'Left') { leftPressed = true; useMouseControl = false; }
        }
        function keyUp(e) {
            if (e.key === 'ArrowRight' || e.key === 'Right') rightPressed = false;
            if (e.key === 'ArrowLeft' || e.key === 'Left') leftPressed = false;
        }
        function mouseMove(e) {
            var rect = canvas.getBoundingClientRect();
            var relX = e.clientX - rect.left;
            useMouseControl = true;
            paddleX = relX - paddleW / 2;
            if (paddleX < 0) paddleX = 0;
            if (paddleX + paddleW > W) paddleX = W - paddleW;
        }

        document.addEventListener('keydown', keyDown);
        document.addEventListener('keyup', keyUp);
        canvas.addEventListener('mousemove', mouseMove);

        function bricksRemaining() {
            var count = 0;
            for (var r = 0; r < brickRows; r++)
                for (var c = 0; c < brickCols; c++)
                    if (bricks[r][c].alive) count++;
            return count;
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            for (var r = 0; r < brickRows; r++) {
                for (var c = 0; c < brickCols; c++) {
                    if (!bricks[r][c].alive) continue;
                    var bx = brickOffLeft + c * (brickW + brickPad);
                    var by = brickOffTop + r * (brickH + brickPad);
                    bricks[r][c].x = bx;
                    bricks[r][c].y = by;
                    ctx.fillStyle = brickColors[r % brickColors.length];
                    ctx.shadowColor = brickColors[r % brickColors.length];
                    ctx.shadowBlur = 6;
                    ctx.fillRect(bx, by, brickW, brickH);
                    ctx.shadowBlur = 0;
                }
            }

            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 10;
            ctx.fillRect(paddleX, H - 24, paddleW, paddleH);
            ctx.shadowBlur = 0;

            ctx.beginPath();
            ctx.arc(ballX, ballY, ballR, 0, Math.PI * 2);
            ctx.fillStyle = '#ffcc00';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.closePath();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#e8e8f0';
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.fillText('Vidas: ' + lives, 10, 20);
            ctx.fillText('Pontos: ' + score, W - 180, 20);
        }

        function update() {
            if (gameOver) return;

            if (!useMouseControl) {
                if (rightPressed && paddleX + paddleW < W) paddleX += 5;
                if (leftPressed && paddleX > 0) paddleX -= 5;
            }

            ballX += ballDX;
            ballY += ballDY;

            if (ballX + ballR > W || ballX - ballR < 0) ballDX = -ballDX;
            if (ballY - ballR < 0) ballDY = -ballDY;

            if (ballY + ballR > H - 24 && ballY + ballR < H - 12 &&
                ballX > paddleX && ballX < paddleX + paddleW) {
                ballDY = -Math.abs(ballDY);
                var hitPos = (ballX - paddleX) / paddleW;
                ballDX = 5 * (hitPos - 0.5);
            }

            if (ballY + ballR > H) {
                lives--;
                if (lives <= 0) {
                    gameOver = true;
                    showGameOver();
                    callbacks.onGameOver(score);
                    return;
                }
                resetBall();
            }

            for (var r = 0; r < brickRows; r++) {
                for (var c = 0; c < brickCols; c++) {
                    var b = bricks[r][c];
                    if (!b.alive) continue;
                    if (ballX + ballR > b.x && ballX - ballR < b.x + brickW &&
                        ballY + ballR > b.y && ballY - ballR < b.y + brickH) {
                        ballDY = -ballDY;
                        b.alive = false;
                        score += 10;
                        callbacks.onScore(score);

                        if (bricksRemaining() === 0) {
                            gameOver = true;
                            won = true;
                            showGameOver();
                            callbacks.onGameOver(score);
                            return;
                        }
                    }
                }
            }
        }

        function showGameOver() {
            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
            var title = document.createElement('h2');
            title.textContent = won ? 'Você Venceu!' : 'Game Over';
            title.style.color = won ? '#00ff88' : '#ff00aa';
            var scoreTxt = document.createElement('p');
            scoreTxt.textContent = 'Pontuação: ' + score;
            scoreTxt.style.color = '#ffcc00';
            var btn = document.createElement('button');
            btn.textContent = 'Reiniciar';
            btn.className = 'btn btn-play';
            btn.style.marginTop = '12px';
            btn.addEventListener('click', restart);
            overlay.appendChild(title);
            overlay.appendChild(scoreTxt);
            overlay.appendChild(btn);
            container.appendChild(overlay);
        }

        function restart() {
            var ovl = container.querySelector('.game-over-screen');
            if (ovl) ovl.remove();
            score = 0;
            lives = 3;
            gameOver = false;
            won = false;
            paddleX = (W - paddleW) / 2;
            for (var r = 0; r < brickRows; r++)
                for (var c = 0; c < brickCols; c++)
                    bricks[r][c].alive = true;
            resetBall();
            callbacks.onScore(0);
        }

        function loop() {
            update();
            draw();
            animId = requestAnimationFrame(loop);
        }

        animId = requestAnimationFrame(loop);

        return {
            destroy: function() {
                if (animId) cancelAnimationFrame(animId);
                document.removeEventListener('keydown', keyDown);
                document.removeEventListener('keyup', keyUp);
                canvas.removeEventListener('mousemove', mouseMove);
            }
        };
    };
})();
