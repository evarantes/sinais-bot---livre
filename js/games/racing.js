(function(){
    window.Games = window.Games || {};
    window.Games['racing'] = function(container, callbacks) {
        var W = 300, H = 500;
        var canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.style.background = '#0a0a1a';
        canvas.style.border = '2px solid #2a2a5a';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var score = 0, gameOver = false, animId = null, lastTime = 0;
        var player, obstacles, roadOffset, speed, scoreTimer;
        var keys = {};

        var LANE_W = 60;
        var ROAD_L = 50;
        var ROAD_R = W - 50;
        var ROAD_W = ROAD_R - ROAD_L;
        var CAR_W = 36, CAR_H = 60;

        function init() {
            score = 0; gameOver = false;
            player = {x: W / 2 - CAR_W / 2, y: H - 100};
            obstacles = [];
            roadOffset = 0;
            speed = 3;
            scoreTimer = 0;
            callbacks.onScore(0);
            removeGameOverScreen();
        }

        function removeGameOverScreen() {
            var existing = container.querySelector('.game-over-screen');
            if (existing) existing.remove();
        }

        function spawnObstacle() {
            var lanes = [ROAD_L + 10, ROAD_L + ROAD_W / 3, ROAD_L + ROAD_W * 2 / 3 - 10];
            var laneX = lanes[Math.floor(Math.random() * lanes.length)];
            var colors = ['#ff0055', '#ff6600', '#aa44ff', '#00f0ff', '#ffcc00'];
            obstacles.push({
                x: laneX,
                y: -CAR_H - 20,
                w: CAR_W,
                h: CAR_H,
                speed: 1 + Math.random() * 2,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        function update(dt) {
            if (gameOver) return;
            var f = dt / 16.67;

            if (keys['ArrowLeft']) player.x -= 4 * f;
            if (keys['ArrowRight']) player.x += 4 * f;
            if (player.x < ROAD_L + 5) player.x = ROAD_L + 5;
            if (player.x + CAR_W > ROAD_R - 5) player.x = ROAD_R - 5 - CAR_W;

            roadOffset += speed * f;
            if (roadOffset > 40) roadOffset -= 40;

            scoreTimer += f;
            if (scoreTimer >= 10) {
                score++;
                scoreTimer -= 10;
                callbacks.onScore(score);
            }

            speed += 0.002 * f;

            if (Math.random() < 0.015 * f) spawnObstacle();

            for (var i = obstacles.length - 1; i >= 0; i--) {
                obstacles[i].y += (speed + obstacles[i].speed) * f;
                if (obstacles[i].y > H + 50) {
                    obstacles.splice(i, 1);
                    continue;
                }

                var o = obstacles[i];
                if (player.x < o.x + o.w && player.x + CAR_W > o.x &&
                    player.y < o.y + o.h && player.y + CAR_H > o.y) {
                    gameOver = true;
                    callbacks.onGameOver(score);
                    showGameOver();
                    return;
                }
            }
        }

        function draw() {
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = '#1a1a2a';
            ctx.fillRect(ROAD_L, 0, ROAD_W, H);

            ctx.fillStyle = '#0a3a0a';
            ctx.fillRect(0, 0, ROAD_L, H);
            ctx.fillRect(ROAD_R, 0, W - ROAD_R, H);

            ctx.strokeStyle = '#ffcc00';
            ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(ROAD_L, 0); ctx.lineTo(ROAD_L, H); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(ROAD_R, 0); ctx.lineTo(ROAD_R, H); ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.setLineDash([20, 20]);
            for (var lane = 1; lane < 3; lane++) {
                var lx = ROAD_L + lane * (ROAD_W / 3);
                ctx.beginPath();
                ctx.moveTo(lx, -40 + roadOffset);
                for (var dy = -40 + roadOffset; dy < H + 40; dy += 40) {
                    ctx.moveTo(lx, dy);
                    ctx.lineTo(lx, dy + 20);
                }
                ctx.stroke();
            }
            ctx.setLineDash([]);

            if (!gameOver) {
                drawCar(player.x, player.y, CAR_W, CAR_H, '#00ff88', true);
            }

            obstacles.forEach(function(o) {
                drawCar(o.x, o.y, o.w, o.h, o.color, false);
            });

            ctx.fillStyle = '#ffcc00';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Score: ' + score, 5, 20);
            ctx.textAlign = 'right';
            ctx.fillText('Speed: ' + Math.floor(speed * 10), W - 5, 20);
        }

        function drawCar(x, y, w, h, color, isPlayer) {
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.fillRect(x + 4, y, w - 8, h);
            ctx.fillRect(x, y + 10, w, h - 20);

            ctx.fillStyle = isPlayer ? '#003322' : '#330011';
            ctx.fillRect(x + 6, y + 5, w - 12, h * 0.25);
            ctx.fillRect(x + 6, y + h * 0.55, w - 12, h * 0.25);

            if (isPlayer) {
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(x + 2, y + h - 6, 6, 4);
                ctx.fillRect(x + w - 8, y + h - 6, 6, 4);
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(x + 2, y + 2, 6, 4);
                ctx.fillRect(x + w - 8, y + 2, 6, 4);
            } else {
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(x + 2, y + h - 6, 6, 4);
                ctx.fillRect(x + w - 8, y + h - 6, 6, 4);
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(x + 2, y + 2, 6, 4);
                ctx.fillRect(x + w - 8, y + 2, 6, 4);
            }
            ctx.shadowBlur = 0;
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
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp') e.preventDefault();
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
