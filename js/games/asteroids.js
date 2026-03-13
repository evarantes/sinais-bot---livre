(function(){
    window.Games = window.Games || {};
    window.Games['asteroids'] = function(container, callbacks) {
        var W = 480, H = 400;
        var canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.style.background = '#0a0a1a';
        canvas.style.border = '2px solid #2a2a5a';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var score = 0, lives = 3, gameOver = false, animId = null, lastTime = 0;
        var ship, bullets, asteroids, particles;
        var keys = {};

        function init() {
            score = 0; lives = 3; gameOver = false;
            ship = {x: W/2, y: H/2, angle: -Math.PI/2, vx: 0, vy: 0, thrust: false, invincible: 120};
            bullets = [];
            asteroids = [];
            particles = [];
            for (var i = 0; i < 5; i++) spawnAsteroid(3);
            callbacks.onScore(0);
            removeGameOverScreen();
        }

        function removeGameOverScreen() {
            var existing = container.querySelector('.game-over-screen');
            if (existing) existing.remove();
        }

        function spawnAsteroid(size, x, y) {
            var a = {
                x: x !== undefined ? x : Math.random() * W,
                y: y !== undefined ? y : Math.random() * H,
                vx: (Math.random() - 0.5) * (4 - size) * 1.5,
                vy: (Math.random() - 0.5) * (4 - size) * 1.5,
                size: size,
                radius: size * 12,
                vertices: []
            };
            if (x === undefined) {
                while (Math.abs(a.x - W/2) < 80 && Math.abs(a.y - H/2) < 80) {
                    a.x = Math.random() * W;
                    a.y = Math.random() * H;
                }
            }
            var numV = 8 + Math.floor(Math.random() * 5);
            for (var i = 0; i < numV; i++) {
                var angle = (i / numV) * Math.PI * 2;
                var r = a.radius * (0.7 + Math.random() * 0.3);
                a.vertices.push({x: Math.cos(angle) * r, y: Math.sin(angle) * r});
            }
            asteroids.push(a);
        }

        function wrap(obj) {
            if (obj.x < -20) obj.x = W + 20;
            if (obj.x > W + 20) obj.x = -20;
            if (obj.y < -20) obj.y = H + 20;
            if (obj.y > H + 20) obj.y = -20;
        }

        function update(dt) {
            if (gameOver) return;
            var f = dt / 16.67;

            if (keys['ArrowLeft']) ship.angle -= 0.05 * f;
            if (keys['ArrowRight']) ship.angle += 0.05 * f;
            if (keys['ArrowUp']) {
                ship.vx += Math.cos(ship.angle) * 0.12 * f;
                ship.vy += Math.sin(ship.angle) * 0.12 * f;
                ship.thrust = true;
            } else {
                ship.thrust = false;
            }
            var speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
            if (speed > 5) { ship.vx *= 5/speed; ship.vy *= 5/speed; }
            ship.vx *= 0.995; ship.vy *= 0.995;
            ship.x += ship.vx * f; ship.y += ship.vy * f;
            wrap(ship);
            if (ship.invincible > 0) ship.invincible -= f;

            for (var i = bullets.length - 1; i >= 0; i--) {
                bullets[i].x += bullets[i].vx * f;
                bullets[i].y += bullets[i].vy * f;
                bullets[i].life -= f;
                if (bullets[i].life <= 0) bullets.splice(i, 1);
                else wrap(bullets[i]);
            }

            for (var i = asteroids.length - 1; i >= 0; i--) {
                asteroids[i].x += asteroids[i].vx * f;
                asteroids[i].y += asteroids[i].vy * f;
                wrap(asteroids[i]);
            }

            for (var i = particles.length - 1; i >= 0; i--) {
                particles[i].x += particles[i].vx * f;
                particles[i].y += particles[i].vy * f;
                particles[i].life -= f;
                if (particles[i].life <= 0) particles.splice(i, 1);
            }

            for (var bi = bullets.length - 1; bi >= 0; bi--) {
                for (var ai = asteroids.length - 1; ai >= 0; ai--) {
                    var dx = bullets[bi].x - asteroids[ai].x;
                    var dy = bullets[bi].y - asteroids[ai].y;
                    if (Math.sqrt(dx*dx + dy*dy) < asteroids[ai].radius) {
                        var a = asteroids[ai];
                        for (var p = 0; p < 5; p++) {
                            particles.push({x: a.x, y: a.y, vx: (Math.random()-0.5)*3, vy: (Math.random()-0.5)*3, life: 30, color: '#ff6600'});
                        }
                        if (a.size === 3) { score += 20; spawnAsteroid(2, a.x, a.y); spawnAsteroid(2, a.x, a.y); }
                        else if (a.size === 2) { score += 50; spawnAsteroid(1, a.x, a.y); spawnAsteroid(1, a.x, a.y); }
                        else { score += 100; }
                        callbacks.onScore(score);
                        asteroids.splice(ai, 1);
                        bullets.splice(bi, 1);
                        break;
                    }
                }
            }

            if (ship.invincible <= 0) {
                for (var ai = 0; ai < asteroids.length; ai++) {
                    var dx = ship.x - asteroids[ai].x;
                    var dy = ship.y - asteroids[ai].y;
                    if (Math.sqrt(dx*dx + dy*dy) < asteroids[ai].radius + 8) {
                        lives--;
                        if (lives <= 0) {
                            gameOver = true;
                            callbacks.onGameOver(score);
                            showGameOver();
                        } else {
                            ship.x = W/2; ship.y = H/2; ship.vx = 0; ship.vy = 0;
                            ship.invincible = 120;
                        }
                        break;
                    }
                }
            }

            if (asteroids.length === 0) {
                for (var i = 0; i < 5 + Math.floor(score / 500); i++) spawnAsteroid(3);
            }
        }

        function draw() {
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            if (!gameOver && (ship.invincible <= 0 || Math.floor(ship.invincible) % 6 < 3)) {
                ctx.save();
                ctx.translate(ship.x, ship.y);
                ctx.rotate(ship.angle);
                ctx.strokeStyle = '#00ff88';
                ctx.shadowColor = '#00ff88';
                ctx.shadowBlur = 10;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(15, 0);
                ctx.lineTo(-10, -8);
                ctx.lineTo(-6, 0);
                ctx.lineTo(-10, 8);
                ctx.closePath();
                ctx.stroke();
                if (ship.thrust) {
                    ctx.strokeStyle = '#ff6600';
                    ctx.shadowColor = '#ff6600';
                    ctx.beginPath();
                    ctx.moveTo(-6, -4);
                    ctx.lineTo(-14 - Math.random()*6, 0);
                    ctx.lineTo(-6, 4);
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
                ctx.restore();
            }

            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 6;
            bullets.forEach(function(b) {
                ctx.beginPath();
                ctx.arc(b.x, b.y, 2, 0, Math.PI*2);
                ctx.fill();
            });
            ctx.shadowBlur = 0;

            ctx.strokeStyle = '#aaaaff';
            ctx.lineWidth = 1.5;
            asteroids.forEach(function(a) {
                ctx.beginPath();
                ctx.moveTo(a.x + a.vertices[0].x, a.y + a.vertices[0].y);
                for (var j = 1; j < a.vertices.length; j++) {
                    ctx.lineTo(a.x + a.vertices[j].x, a.y + a.vertices[j].y);
                }
                ctx.closePath();
                ctx.stroke();
            });

            particles.forEach(function(p) {
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life / 30;
                ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
            });
            ctx.globalAlpha = 1;

            ctx.fillStyle = '#ffcc00';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Lives: ' + lives, 5, H - 5);
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

        var shootCooldown = 0;
        function onKeyDown(e) {
            keys[e.key] = true;
            if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.preventDefault();
            if (e.key === ' ' && !gameOver && shootCooldown <= 0) {
                bullets.push({
                    x: ship.x + Math.cos(ship.angle) * 15,
                    y: ship.y + Math.sin(ship.angle) * 15,
                    vx: Math.cos(ship.angle) * 7 + ship.vx * 0.3,
                    vy: Math.sin(ship.angle) * 7 + ship.vy * 0.3,
                    life: 50
                });
                shootCooldown = 10;
            }
        }
        function onKeyUp(e) { keys[e.key] = false; }

        function tickCooldown() {
            if (shootCooldown > 0) shootCooldown--;
            requestAnimationFrame(tickCooldown);
        }

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
        init();
        animId = requestAnimationFrame(loop);
        tickCooldown();

        return {
            destroy: function() {
                if (animId) cancelAnimationFrame(animId);
                document.removeEventListener('keydown', onKeyDown);
                document.removeEventListener('keyup', onKeyUp);
            }
        };
    };
})();
