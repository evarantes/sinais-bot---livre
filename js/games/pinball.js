(function(){
    window.Games = window.Games || {};
    window.Games['pinball'] = function(container, callbacks) {
        var W = 300, H = 500;
        var canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.style.background = '#0a0a1a';
        canvas.style.border = '2px solid #2a2a5a';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var score = 0, ballsLeft = 3, gameOver = false, animId = null, lastTime = 0;
        var ball, bumpers, flippers, launched, launchPower;
        var keys = {};
        var GRAVITY = 0.15;
        var particles = [];

        function init() {
            score = 0; ballsLeft = 3; gameOver = false;
            launched = false; launchPower = 0;
            ball = null;
            bumpers = [
                {x: W/2, y: 130, r: 20, score: 50, color: '#ff0055'},
                {x: W/4, y: 200, r: 18, score: 30, color: '#ff6600'},
                {x: W*3/4, y: 200, r: 18, score: 30, color: '#ffcc00'},
                {x: W/2, y: 270, r: 15, score: 20, color: '#00ff88'},
                {x: W/3, y: 340, r: 14, score: 10, color: '#00f0ff'},
                {x: W*2/3, y: 340, r: 14, score: 10, color: '#aa44ff'}
            ];
            flippers = {
                left: {x: W/2 - 60, y: H - 60, angle: 0.3, targetAngle: 0.3, length: 55},
                right: {x: W/2 + 60, y: H - 60, angle: Math.PI - 0.3, targetAngle: Math.PI - 0.3, length: 55}
            };
            particles = [];
            prepareBall();
            callbacks.onScore(0);
            removeGameOverScreen();
        }

        function removeGameOverScreen() {
            var existing = container.querySelector('.game-over-screen');
            if (existing) existing.remove();
        }

        function prepareBall() {
            ball = {x: W - 20, y: H - 80, vx: 0, vy: 0, r: 6, active: false};
            launched = false;
            launchPower = 0;
        }

        function launchBall() {
            ball.active = true;
            ball.vy = -8 - launchPower * 6;
            ball.vx = -1 - Math.random() * 2;
            launched = true;
        }

        function dist(x1, y1, x2, y2) {
            return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
        }

        function update(dt) {
            if (gameOver) return;
            var f = dt / 16.67;

            if (keys['ArrowLeft']) flippers.left.targetAngle = -0.5;
            else flippers.left.targetAngle = 0.3;
            if (keys['ArrowRight']) flippers.right.targetAngle = Math.PI + 0.5;
            else flippers.right.targetAngle = Math.PI - 0.3;

            flippers.left.angle += (flippers.left.targetAngle - flippers.left.angle) * 0.3 * f;
            flippers.right.angle += (flippers.right.targetAngle - flippers.right.angle) * 0.3 * f;

            if (!launched && keys[' ']) {
                launchPower = Math.min(1, launchPower + 0.03 * f);
            }

            if (!ball.active) return;

            ball.vy += GRAVITY * f;
            ball.x += ball.vx * f;
            ball.y += ball.vy * f;

            if (ball.x - ball.r < 15) { ball.x = 15 + ball.r; ball.vx = Math.abs(ball.vx) * 0.8; }
            if (ball.x + ball.r > W - 15) { ball.x = W - 15 - ball.r; ball.vx = -Math.abs(ball.vx) * 0.8; }
            if (ball.y - ball.r < 10) { ball.y = 10 + ball.r; ball.vy = Math.abs(ball.vy) * 0.8; }

            var wallAngleL = Math.atan2(H - 60 - 50, W/2 - 60 - 15);
            var wallAngleR = Math.atan2(H - 60 - 50, W - 15 - (W/2 + 60));
            if (ball.x < W/2 - 20 && ball.y > 50) {
                var wy = 50 + (ball.x - 15) / (W/2 - 60 - 15) * (H - 60 - 50);
                if (ball.y > wy && ball.x < 50) {
                    ball.vx = Math.abs(ball.vx) * 0.9 + 0.5;
                    ball.x += 2;
                }
            }
            if (ball.x > W/2 + 20 && ball.y > 50) {
                var wy = 50 + (W - 15 - ball.x) / (W - 15 - (W/2 + 60)) * (H - 60 - 50);
                if (ball.y > wy && ball.x > W - 50) {
                    ball.vx = -Math.abs(ball.vx) * 0.9 - 0.5;
                    ball.x -= 2;
                }
            }

            for (var i = 0; i < bumpers.length; i++) {
                var b = bumpers[i];
                var d = dist(ball.x, ball.y, b.x, b.y);
                if (d < ball.r + b.r) {
                    var nx = (ball.x - b.x) / d;
                    var ny = (ball.y - b.y) / d;
                    ball.x = b.x + nx * (ball.r + b.r + 1);
                    ball.y = b.y + ny * (ball.r + b.r + 1);
                    var dot = ball.vx * nx + ball.vy * ny;
                    ball.vx = (ball.vx - 2 * dot * nx) * 1.1;
                    ball.vy = (ball.vy - 2 * dot * ny) * 1.1;
                    score += b.score;
                    callbacks.onScore(score);
                    for (var p = 0; p < 5; p++) {
                        particles.push({x: ball.x, y: ball.y, vx: (Math.random()-0.5)*4, vy: (Math.random()-0.5)*4, life: 15, color: b.color});
                    }
                    b._flash = 10;
                }
                if (b._flash > 0) b._flash -= f;
            }

            var flips = [flippers.left, flippers.right];
            var isLeft = [true, false];
            for (var fi = 0; fi < 2; fi++) {
                var fl = flips[fi];
                var endX = fl.x + Math.cos(fl.angle) * fl.length;
                var endY = fl.y + Math.sin(fl.angle) * fl.length;
                var dx = endX - fl.x, dy = endY - fl.y;
                var len = Math.sqrt(dx*dx + dy*dy);
                var ux = dx/len, uy = dy/len;
                var bx = ball.x - fl.x, by = ball.y - fl.y;
                var proj = bx*ux + by*uy;
                proj = Math.max(0, Math.min(len, proj));
                var closestX = fl.x + ux * proj;
                var closestY = fl.y + uy * proj;
                var cd = dist(ball.x, ball.y, closestX, closestY);
                if (cd < ball.r + 5) {
                    var nx = (ball.x - closestX) / (cd || 1);
                    var ny = (ball.y - closestY) / (cd || 1);
                    ball.x = closestX + nx * (ball.r + 6);
                    ball.y = closestY + ny * (ball.r + 6);
                    var flipperSpeed = (fl.targetAngle - fl.angle) * 5;
                    ball.vy = -Math.abs(ball.vy) * 0.6 - 3 - Math.abs(flipperSpeed) * 2;
                    ball.vx += flipperSpeed * (isLeft[fi] ? -1 : 1) * 1.5;
                }
            }

            var speed = Math.sqrt(ball.vx*ball.vx + ball.vy*ball.vy);
            if (speed > 12) { ball.vx *= 12/speed; ball.vy *= 12/speed; }

            if (ball.y > H + 20) {
                ballsLeft--;
                if (ballsLeft <= 0) {
                    gameOver = true;
                    callbacks.onGameOver(score);
                    showGameOver();
                } else {
                    prepareBall();
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

            ctx.strokeStyle = '#2a2a5a';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(15, 50);
            ctx.lineTo(15, H);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(W - 15, 50);
            ctx.lineTo(W - 15, H);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(W / 2, 50, W / 2 - 15, Math.PI, 0);
            ctx.stroke();

            ctx.strokeStyle = '#1a1a4a';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(15, H - 10);
            ctx.lineTo(flippers.left.x - 10, flippers.left.y + 5);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(W - 15, H - 10);
            ctx.lineTo(flippers.right.x + 10, flippers.right.y + 5);
            ctx.stroke();

            bumpers.forEach(function(b) {
                var flash = b._flash > 0;
                ctx.fillStyle = flash ? '#ffffff' : b.color;
                ctx.shadowColor = b.color;
                ctx.shadowBlur = flash ? 20 : 10;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
                ctx.fill();
                ctx.fillStyle = flash ? b.color : '#fff';
                ctx.font = 'bold 10px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(b.score, b.x, b.y + 4);
                ctx.shadowBlur = 0;
            });

            var flips = [flippers.left, flippers.right];
            flips.forEach(function(fl) {
                var endX = fl.x + Math.cos(fl.angle) * fl.length;
                var endY = fl.y + Math.sin(fl.angle) * fl.length;
                ctx.strokeStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 8;
                ctx.lineWidth = 8;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(fl.x, fl.y);
                ctx.lineTo(endX, endY);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.lineCap = 'butt';
            });

            if (ball) {
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI*2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            if (!launched && !gameOver) {
                ctx.fillStyle = '#ff0055';
                ctx.fillRect(W - 25, H - 70, 10, 60);
                ctx.fillStyle = '#00ff88';
                ctx.fillRect(W - 25, H - 70 + 60 * (1 - launchPower), 10, 60 * launchPower);
                ctx.fillStyle = '#ffcc00';
                ctx.font = '8px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText('SPACE', W - 20, H - 75);
            }

            particles.forEach(function(p) {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = Math.max(0, p.life / 15);
                ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
            });
            ctx.globalAlpha = 1;

            ctx.fillStyle = '#ffcc00';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Balls: ' + ballsLeft, 20, 30);
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
            if (e.key === ' ') e.preventDefault();
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
        }
        function onKeyUp(e) {
            if (e.key === ' ' && !launched && ball && !ball.active && !gameOver) {
                launchBall();
            }
            keys[e.key] = false;
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
