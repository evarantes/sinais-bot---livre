(function(){
    window.Games = window.Games || {};
    window.Games['flappybird'] = function(container, callbacks) {
        var canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 480;
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.style.background = '#0a0a1a';
        canvas.style.borderRadius = '8px';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var W = canvas.width, H = canvas.height;
        var gravity = 0.4;
        var flapStrength = -6.5;
        var pipeSpeed = 2.5;
        var pipeGap = 130;
        var pipeWidth = 50;
        var pipeSpawnInterval = 2000;
        var groundY = H - 40;

        var bird = { x: 80, y: H / 2, vy: 0, r: 14 };
        var pipes = [];
        var score = 0;
        var gameOver = false;
        var started = false;
        var restartBtn = null;

        function flap() {
            if (gameOver) return;
            if (!started) started = true;
            bird.vy = flapStrength;
        }

        function onKeydown(e) {
            if (e.key === ' ') { e.preventDefault(); flap(); }
        }
        function onClick() { flap(); }
        document.addEventListener('keydown', onKeydown);
        canvas.addEventListener('click', onClick);

        function spawnPipe() {
            var minTop = 60;
            var maxTop = groundY - pipeGap - 60;
            var topH = minTop + Math.random() * (maxTop - minTop);
            pipes.push({
                x: W,
                topH: topH,
                botY: topH + pipeGap,
                w: pipeWidth,
                scored: false
            });
        }

        var pipeTimer = null;
        function startPipeSpawner() {
            spawnPipe();
            pipeTimer = setInterval(spawnPipe, pipeSpawnInterval);
        }

        function update() {
            if (gameOver || !started) return;

            bird.vy += gravity;
            bird.y += bird.vy;

            if (bird.y + bird.r >= groundY) {
                bird.y = groundY - bird.r;
                endGame(); return;
            }
            if (bird.y - bird.r <= 0) {
                bird.y = bird.r;
                bird.vy = 0;
            }

            for (var i = pipes.length - 1; i >= 0; i--) {
                var p = pipes[i];
                p.x -= pipeSpeed;

                if (p.x + p.w < 0) { pipes.splice(i, 1); continue; }

                if (!p.scored && p.x + p.w < bird.x) {
                    p.scored = true;
                    score++;
                    callbacks.onScore(score);
                }

                if (bird.x + bird.r > p.x && bird.x - bird.r < p.x + p.w) {
                    if (bird.y - bird.r < p.topH || bird.y + bird.r > p.botY) {
                        endGame(); return;
                    }
                }
            }
        }

        function endGame() {
            if (gameOver) return;
            gameOver = true;
            if (pipeTimer) { clearInterval(pipeTimer); pipeTimer = null; }
            callbacks.onGameOver(score);
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);

            var grd = ctx.createLinearGradient(0, 0, 0, H);
            grd.addColorStop(0, '#0a0a1a');
            grd.addColorStop(1, '#1a0a2e');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = '#0d3320';
            ctx.fillRect(0, groundY, W, H - groundY);
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(0, groundY, W, 3);

            for (var i = 0; i < pipes.length; i++) {
                var p = pipes[i];
                ctx.fillStyle = '#00ff88';
                ctx.fillRect(p.x, 0, p.w, p.topH);
                ctx.fillRect(p.x, p.botY, p.w, groundY - p.botY);
                ctx.fillStyle = '#00cc66';
                ctx.fillRect(p.x - 4, p.topH - 20, p.w + 8, 20);
                ctx.fillRect(p.x - 4, p.botY, p.w + 8, 20);
            }

            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff8800';
            ctx.beginPath();
            ctx.moveTo(bird.x + bird.r, bird.y);
            ctx.lineTo(bird.x + bird.r + 8, bird.y + 3);
            ctx.lineTo(bird.x + bird.r, bird.y + 6);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#0a0a1a';
            ctx.beginPath();
            ctx.arc(bird.x + 5, bird.y - 3, 3, 0, Math.PI * 2);
            ctx.fill();

            if (!started) {
                ctx.fillStyle = '#00f0ff';
                ctx.font = '14px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Espaço/Clique', W / 2, H / 2 - 20);
                ctx.fillText('para começar', W / 2, H / 2 + 10);
            }

            if (gameOver) {
                ctx.fillStyle = 'rgba(10,10,26,0.85)';
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = '#ff00aa';
                ctx.font = '20px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('GAME OVER', W / 2, H / 2 - 40);
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

        function restart() {
            if (restartBtn) { restartBtn.remove(); restartBtn = null; }
            bird.y = H / 2; bird.vy = 0;
            pipes = []; score = 0; gameOver = false; started = false;
            callbacks.onScore(0);
        }

        var firstStartDone = false;
        var animId = null;

        function loop() {
            if (started && !firstStartDone) {
                firstStartDone = true;
                startPipeSpawner();
            }
            update();
            draw();
            animId = requestAnimationFrame(loop);
        }
        animId = requestAnimationFrame(loop);

        return {
            destroy: function() {
                if (animId) cancelAnimationFrame(animId);
                if (pipeTimer) clearInterval(pipeTimer);
                document.removeEventListener('keydown', onKeydown);
                canvas.removeEventListener('click', onClick);
                if (restartBtn) restartBtn.remove();
            }
        };
    };
})();
