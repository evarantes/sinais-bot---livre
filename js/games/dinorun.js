(function(){
    window.Games = window.Games || {};
    window.Games['dinorun'] = function(container, callbacks) {
        var canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 200;
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.style.background = '#0a0a1a';
        canvas.style.borderRadius = '8px';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var W = canvas.width, H = canvas.height;
        var groundY = H - 30;
        var score = 0;
        var gameOver = false;
        var started = false;
        var speed = 5;
        var frameCount = 0;
        var restartBtn = null;

        var dino = {
            x: 60, y: groundY, w: 30, h: 40,
            vy: 0, jumping: false, ducking: false,
            legFrame: 0
        };
        var dinoStandH = 40;
        var dinoDuckH = 22;
        var gravity = 0.6;
        var jumpForce = -11;

        var obstacles = [];
        var spawnTimer = 0;
        var minSpawnInterval = 60;
        var maxSpawnInterval = 120;
        var nextSpawn = 80;

        var clouds = [];
        for (var i = 0; i < 5; i++) {
            clouds.push({
                x: Math.random() * W,
                y: 20 + Math.random() * 50,
                w: 40 + Math.random() * 30,
                speed: 0.3 + Math.random() * 0.5
            });
        }

        var stars = [];
        for (var i = 0; i < 20; i++) {
            stars.push({ x: Math.random() * W, y: Math.random() * (groundY - 40), size: 1 + Math.random() * 2 });
        }

        var keys = {};

        function keydown(e) {
            keys[e.key] = true;
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
            if (!started && !gameOver) { started = true; }
            if (e.key === ' ' || e.key === 'ArrowUp') {
                if (!dino.jumping && !gameOver) {
                    dino.vy = jumpForce;
                    dino.jumping = true;
                }
            }
        }
        function keyup(e) {
            keys[e.key] = false;
        }
        document.addEventListener('keydown', keydown);
        document.addEventListener('keyup', keyup);

        function spawnObstacle() {
            var type = Math.random();
            if (type < 0.6) {
                var h = 20 + Math.random() * 25;
                var w = 10 + Math.random() * 15;
                obstacles.push({ type: 'cactus', x: W, y: groundY - h, w: w, h: h });
            } else if (type < 0.8) {
                obstacles.push({ type: 'cactus', x: W, y: groundY - 40, w: 20, h: 40 });
            } else {
                var birdY = groundY - 25 - Math.random() * 40;
                obstacles.push({ type: 'bird', x: W, y: birdY, w: 28, h: 16, wingFrame: 0 });
            }
        }

        function update() {
            if (gameOver || !started) return;
            frameCount++;

            speed = 5 + Math.floor(frameCount / 300) * 0.5;
            if (speed > 14) speed = 14;

            dino.ducking = keys['ArrowDown'];
            dino.h = dino.ducking ? dinoDuckH : dinoStandH;
            dino.y = dino.ducking && !dino.jumping ? groundY - dinoDuckH : dino.y;

            if (dino.jumping) {
                dino.vy += gravity;
                dino.y += dino.vy;
                var landY = groundY - dino.h;
                if (dino.y >= landY) {
                    dino.y = landY;
                    dino.vy = 0;
                    dino.jumping = false;
                }
            } else {
                dino.y = groundY - dino.h;
            }

            dino.legFrame = (dino.legFrame + 0.2) % 2;

            spawnTimer++;
            if (spawnTimer >= nextSpawn) {
                spawnObstacle();
                spawnTimer = 0;
                nextSpawn = minSpawnInterval + Math.floor(Math.random() * (maxSpawnInterval - minSpawnInterval));
                minSpawnInterval = Math.max(35, minSpawnInterval - 0.1);
            }

            for (var i = obstacles.length - 1; i >= 0; i--) {
                obstacles[i].x -= speed;
                if (obstacles[i].type === 'bird') obstacles[i].wingFrame = (obstacles[i].wingFrame + 0.15) % 2;
                if (obstacles[i].x + obstacles[i].w < 0) {
                    obstacles.splice(i, 1);
                    continue;
                }
                if (rectsOverlap(
                    dino.x + 4, dino.y + 4, dino.w - 8, dino.h - 4,
                    obstacles[i].x + 2, obstacles[i].y + 2, obstacles[i].w - 4, obstacles[i].h - 4
                )) {
                    endGame();
                    return;
                }
            }

            score = Math.floor(frameCount / 6);
            callbacks.onScore(score);

            for (var i = 0; i < clouds.length; i++) {
                clouds[i].x -= clouds[i].speed;
                if (clouds[i].x + clouds[i].w < 0) {
                    clouds[i].x = W + Math.random() * 100;
                    clouds[i].y = 20 + Math.random() * 50;
                }
            }
        }

        function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
            return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
        }

        function endGame() {
            if (gameOver) return;
            gameOver = true;
            callbacks.onGameOver(score);
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            ctx.fillStyle = '#334';
            for (var i = 0; i < stars.length; i++) {
                ctx.fillRect(stars[i].x, stars[i].y, stars[i].size, stars[i].size);
            }

            ctx.fillStyle = '#1a1a2e';
            for (var i = 0; i < clouds.length; i++) {
                var cl = clouds[i];
                ctx.beginPath();
                ctx.arc(cl.x + cl.w * 0.3, cl.y, 8, 0, Math.PI * 2);
                ctx.arc(cl.x + cl.w * 0.6, cl.y - 4, 10, 0, Math.PI * 2);
                ctx.arc(cl.x + cl.w * 0.8, cl.y, 7, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(W, groundY);
            ctx.stroke();

            ctx.fillStyle = '#0d1a12';
            ctx.fillRect(0, groundY, W, H - groundY);
            for (var i = 0; i < W; i += 20) {
                ctx.fillStyle = '#1a2a1a';
                ctx.fillRect(i + ((frameCount * speed) % 20), groundY + 2, 8, 2);
            }

            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 6;
            if (dino.ducking && !dino.jumping) {
                ctx.fillRect(dino.x, dino.y, dino.w + 8, dino.h);
                ctx.fillStyle = '#0a0a1a';
                ctx.fillRect(dino.x + dino.w + 1, dino.y + 3, 4, 4);
            } else {
                ctx.fillRect(dino.x, dino.y, dino.w, dino.h);
                ctx.fillStyle = '#0a0a1a';
                ctx.fillRect(dino.x + dino.w - 8, dino.y + 5, 5, 4);

                if (!dino.jumping) {
                    ctx.fillStyle = '#00f0ff';
                    if (Math.floor(dino.legFrame) === 0) {
                        ctx.fillRect(dino.x + 5, dino.y + dino.h, 6, 6);
                        ctx.fillRect(dino.x + dino.w - 11, dino.y + dino.h - 3, 6, 3);
                    } else {
                        ctx.fillRect(dino.x + 5, dino.y + dino.h - 3, 6, 3);
                        ctx.fillRect(dino.x + dino.w - 11, dino.y + dino.h, 6, 6);
                    }
                }
            }
            ctx.shadowBlur = 0;

            for (var i = 0; i < obstacles.length; i++) {
                var ob = obstacles[i];
                if (ob.type === 'cactus') {
                    ctx.fillStyle = '#ff00aa';
                    ctx.shadowColor = '#ff00aa';
                    ctx.shadowBlur = 4;
                    ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
                    if (ob.h > 25) {
                        ctx.fillRect(ob.x - 4, ob.y + ob.h * 0.3, 4, 10);
                        ctx.fillRect(ob.x + ob.w, ob.y + ob.h * 0.5, 4, 8);
                    }
                    ctx.shadowBlur = 0;
                } else {
                    ctx.fillStyle = '#ffcc00';
                    ctx.shadowColor = '#ffcc00';
                    ctx.shadowBlur = 4;
                    ctx.fillRect(ob.x, ob.y + 4, ob.w, ob.h - 8);
                    if (Math.floor(ob.wingFrame) === 0) {
                        ctx.fillRect(ob.x + 4, ob.y - 4, ob.w - 8, 6);
                    } else {
                        ctx.fillRect(ob.x + 4, ob.y + ob.h - 2, ob.w - 8, 6);
                    }
                    ctx.shadowBlur = 0;
                }
            }

            ctx.fillStyle = '#00ff88';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'right';
            ctx.fillText('HI ' + String(score).padStart(5, '0'), W - 10, 20);

            if (!started && !gameOver) {
                ctx.fillStyle = '#00f0ff';
                ctx.font = '12px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Espaço para começar', W / 2, H / 2 - 20);
            }

            if (gameOver) {
                ctx.fillStyle = 'rgba(10,10,26,0.85)';
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = '#ff00aa';
                ctx.font = '18px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('GAME OVER', W / 2, H / 2 - 20);
                ctx.fillStyle = '#00f0ff';
                ctx.font = '12px "Press Start 2P", monospace';
                ctx.fillText('Pontos: ' + score, W / 2, H / 2 + 10);

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
            score = 0; gameOver = false; started = false; frameCount = 0;
            speed = 5; spawnTimer = 0; nextSpawn = 80;
            minSpawnInterval = 60; maxSpawnInterval = 120;
            dino.y = groundY - dinoStandH; dino.vy = 0;
            dino.jumping = false; dino.ducking = false; dino.h = dinoStandH;
            obstacles = [];
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
