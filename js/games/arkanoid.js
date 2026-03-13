(function(){
    window.Games = window.Games || {};
    window.Games['arkanoid'] = function(container, callbacks) {
        var W = 480, H = 500;
        var canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.style.background = '#0a0a1a';
        canvas.style.border = '2px solid #2a2a5a';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var score = 0, lives = 3, gameOver = false, animId = null, lastTime = 0;
        var level = 0;
        var paddle, balls, bricks, powerups;
        var keys = {};
        var launched = false;

        var LEVELS = [
            function(b) {
                for (var r = 0; r < 5; r++)
                    for (var c = 0; c < 10; c++)
                        b.push({x: 8 + c * 46, y: 40 + r * 22, w: 42, h: 18, color: ['#ff0055','#ff6600','#ffcc00','#00ff88','#00f0ff'][r], hits: 1, powerup: (r===0&&c===2)?'W':(r===2&&c===7)?'B':(r===4&&c===5)?'S':null});
            },
            function(b) {
                for (var r = 0; r < 7; r++)
                    for (var c = 0; c < 10; c++)
                        if ((r + c) % 2 === 0)
                            b.push({x: 8 + c * 46, y: 40 + r * 22, w: 42, h: 18, color: ['#ff00aa','#aa44ff','#00f0ff','#00ff88','#ffcc00','#ff6600','#ff0055'][r], hits: r < 2 ? 2 : 1, powerup: (r===1&&c===4)?'W':(r===3&&c===6)?'B':(r===5&&c===2)?'S':null});
            },
            function(b) {
                for (var r = 0; r < 8; r++)
                    for (var c = 0; c < 10; c++) {
                        var dx = Math.abs(c - 4.5), dy = Math.abs(r - 3.5);
                        if (dx + dy < 5)
                            b.push({x: 8 + c * 46, y: 40 + r * 22, w: 42, h: 18, color: dx+dy<2?'#ff0055':dx+dy<3?'#ffcc00':'#00f0ff', hits: dx+dy<2?3:dx+dy<3?2:1, powerup: (r===3&&c===4)?'B':(r===1&&c===5)?'W':(r===5&&c===3)?'S':null});
                    }
            }
        ];

        function init() {
            score = 0; lives = 3; gameOver = false; level = 0;
            callbacks.onScore(0);
            removeGameOverScreen();
            loadLevel();
        }

        function removeGameOverScreen() {
            var existing = container.querySelector('.game-over-screen');
            if (existing) existing.remove();
        }

        function loadLevel() {
            paddle = {x: W / 2 - 40, y: H - 30, w: 80, h: 12, speed: 6};
            balls = [{x: W / 2, y: H - 42, vx: 3, vy: -3, r: 5}];
            bricks = [];
            powerups = [];
            launched = false;
            LEVELS[level % LEVELS.length](bricks);
        }

        function update(dt) {
            if (gameOver) return;
            var f = dt / 16.67;

            if (keys['ArrowLeft']) paddle.x -= paddle.speed * f;
            if (keys['ArrowRight']) paddle.x += paddle.speed * f;
            if (paddle.x < 0) paddle.x = 0;
            if (paddle.x + paddle.w > W) paddle.x = W - paddle.w;

            if (!launched) {
                balls[0].x = paddle.x + paddle.w / 2;
                balls[0].y = paddle.y - balls[0].r;
                return;
            }

            for (var bi = balls.length - 1; bi >= 0; bi--) {
                var ball = balls[bi];
                ball.x += ball.vx * f;
                ball.y += ball.vy * f;

                if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx); }
                if (ball.x + ball.r > W) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx); }
                if (ball.y - ball.r < 0) { ball.y = ball.r; ball.vy = Math.abs(ball.vy); }

                if (ball.y + ball.r > paddle.y && ball.y + ball.r < paddle.y + paddle.h + 5 &&
                    ball.x > paddle.x - ball.r && ball.x < paddle.x + paddle.w + ball.r && ball.vy > 0) {
                    ball.vy = -Math.abs(ball.vy);
                    var hitPos = (ball.x - paddle.x) / paddle.w - 0.5;
                    ball.vx = hitPos * 6;
                    var spd = Math.sqrt(ball.vx*ball.vx + ball.vy*ball.vy);
                    var targetSpd = 4;
                    ball.vx = (ball.vx / spd) * targetSpd;
                    ball.vy = (ball.vy / spd) * targetSpd;
                }

                if (ball.y > H + 20) {
                    balls.splice(bi, 1);
                    continue;
                }

                for (var bri = bricks.length - 1; bri >= 0; bri--) {
                    var br = bricks[bri];
                    if (ball.x + ball.r > br.x && ball.x - ball.r < br.x + br.w &&
                        ball.y + ball.r > br.y && ball.y - ball.r < br.y + br.h) {
                        var overlapLeft = (ball.x + ball.r) - br.x;
                        var overlapRight = (br.x + br.w) - (ball.x - ball.r);
                        var overlapTop = (ball.y + ball.r) - br.y;
                        var overlapBottom = (br.y + br.h) - (ball.y - ball.r);
                        var minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
                        if (minOverlap === overlapTop || minOverlap === overlapBottom) ball.vy = -ball.vy;
                        else ball.vx = -ball.vx;
                        br.hits--;
                        if (br.hits <= 0) {
                            score += 10;
                            callbacks.onScore(score);
                            if (br.powerup) {
                                powerups.push({x: br.x + br.w/2, y: br.y, type: br.powerup, vy: 2});
                            }
                            bricks.splice(bri, 1);
                        }
                        break;
                    }
                }
            }

            for (var pi = powerups.length - 1; pi >= 0; pi--) {
                powerups[pi].y += powerups[pi].vy * f;
                if (powerups[pi].y > paddle.y && powerups[pi].y < paddle.y + paddle.h + 10 &&
                    powerups[pi].x > paddle.x && powerups[pi].x < paddle.x + paddle.w) {
                    score += 25;
                    callbacks.onScore(score);
                    var type = powerups[pi].type;
                    if (type === 'W') paddle.w = Math.min(160, paddle.w + 30);
                    else if (type === 'B' && balls.length > 0) {
                        var b = balls[0];
                        balls.push({x: b.x, y: b.y, vx: -b.vx, vy: b.vy, r: 5});
                    }
                    else if (type === 'S') {
                        balls.forEach(function(b) { b.vx *= 0.7; b.vy *= 0.7; });
                    }
                    powerups.splice(pi, 1);
                } else if (powerups[pi].y > H + 20) {
                    powerups.splice(pi, 1);
                }
            }

            if (balls.length === 0) {
                lives--;
                if (lives <= 0) {
                    gameOver = true;
                    callbacks.onGameOver(score);
                    showGameOver();
                } else {
                    balls = [{x: paddle.x + paddle.w/2, y: paddle.y - 5, vx: 3, vy: -3, r: 5}];
                    launched = false;
                }
            }

            if (bricks.length === 0) {
                level++;
                loadLevel();
            }
        }

        function draw() {
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            bricks.forEach(function(br) {
                ctx.fillStyle = br.color;
                ctx.shadowColor = br.color;
                ctx.shadowBlur = 4;
                ctx.fillRect(br.x, br.y, br.w, br.h);
                if (br.hits > 1) {
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.fillRect(br.x, br.y, br.w, br.h);
                    ctx.fillStyle = '#fff';
                    ctx.font = '10px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(br.hits, br.x + br.w/2, br.y + br.h/2 + 3);
                }
                if (br.powerup) {
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 10px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(br.powerup, br.x + br.w/2, br.y + br.h/2 + 3);
                }
                ctx.shadowBlur = 0;
            });

            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 8;
            balls.forEach(function(b) {
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.shadowBlur = 0;

            var pwColors = {'W': '#00ff88', 'B': '#ff00aa', 'S': '#ffcc00'};
            powerups.forEach(function(p) {
                ctx.fillStyle = pwColors[p.type] || '#fff';
                ctx.shadowColor = pwColors[p.type] || '#fff';
                ctx.shadowBlur = 6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(p.type, p.x, p.y + 4);
                ctx.shadowBlur = 0;
            });

            ctx.fillStyle = '#ffcc00';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Lives: ' + lives, 5, H - 5);
            ctx.textAlign = 'center';
            ctx.fillText('Level ' + (level + 1), W/2, H - 5);

            if (!launched) {
                ctx.fillStyle = '#00ff88';
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('Press SPACE to launch', W/2, H/2);
            }
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
            if (e.key === ' ') {
                e.preventDefault();
                if (!launched && !gameOver) launched = true;
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
