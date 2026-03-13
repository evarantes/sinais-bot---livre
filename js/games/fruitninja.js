(function(){
    window.Games = window.Games || {};
    window.Games['fruitninja'] = function(container, callbacks) {
        var canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.style.background = '#0a0a1a';
        canvas.style.borderRadius = '8px';
        canvas.style.cursor = 'crosshair';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var W = canvas.width, H = canvas.height;
        var score = 0;
        var gameOver = false;
        var bombs = 3;
        var timeLeft = 45;
        var timerInterval = null;
        var restartBtn = null;

        var fruits = [];
        var sliceTrail = [];
        var particles = [];
        var sliceEffects = [];
        var mouseDown = false;
        var lastMouse = { x: -1, y: -1 };

        var FRUIT_TYPES = [
            { emoji: '🍎', color: '#ff4444', points: 10 },
            { emoji: '🍊', color: '#ff8800', points: 10 },
            { emoji: '🍋', color: '#ffcc00', points: 10 },
            { emoji: '🍉', color: '#00ff88', points: 10 },
            { emoji: '🍇', color: '#aa44ff', points: 10 },
            { emoji: '🍓', color: '#ff00aa', points: 10 },
            { emoji: '🥝', color: '#00cc44', points: 10 },
            { emoji: '🍑', color: '#ffaa88', points: 10 }
        ];
        var BOMB = { emoji: '💣', color: '#ff0000' };

        var spawnTimer = 0;
        var spawnInterval = 40;

        function spawnFruit() {
            var isBomb = Math.random() < 0.12;
            var type = isBomb ? BOMB : FRUIT_TYPES[Math.floor(Math.random() * FRUIT_TYPES.length)];
            var x = 40 + Math.random() * (W - 80);
            var vx = (Math.random() - 0.5) * 4;
            var vy = -(8 + Math.random() * 5);
            fruits.push({
                x: x,
                y: H + 20,
                vx: vx,
                vy: vy,
                r: 22,
                type: type,
                isBomb: isBomb,
                sliced: false,
                rotation: 0,
                rotSpeed: (Math.random() - 0.5) * 0.2
            });
        }

        function onMouseDown(e) {
            if (gameOver) return;
            mouseDown = true;
            var rect = canvas.getBoundingClientRect();
            lastMouse.x = (e.clientX - rect.left) * (W / rect.width);
            lastMouse.y = (e.clientY - rect.top) * (H / rect.height);
        }
        function onMouseUp() { mouseDown = false; lastMouse = { x: -1, y: -1 }; sliceTrail = []; }
        function onMouseMove(e) {
            if (gameOver || !mouseDown) return;
            var rect = canvas.getBoundingClientRect();
            var mx = (e.clientX - rect.left) * (W / rect.width);
            var my = (e.clientY - rect.top) * (H / rect.height);

            sliceTrail.push({ x: mx, y: my, life: 8 });
            if (sliceTrail.length > 20) sliceTrail.shift();

            for (var i = 0; i < fruits.length; i++) {
                var f = fruits[i];
                if (f.sliced) continue;
                var dx = mx - f.x;
                var dy = my - f.y;
                if (Math.sqrt(dx * dx + dy * dy) < f.r + 10) {
                    f.sliced = true;
                    if (f.isBomb) {
                        bombs--;
                        addParticles(f.x, f.y, '#ff0000', 15);
                        sliceEffects.push({ x: f.x, y: f.y, text: '💥', life: 30 });
                        if (bombs <= 0) {
                            endGame();
                            return;
                        }
                    } else {
                        score += f.type.points;
                        callbacks.onScore(score);
                        addParticles(f.x, f.y, f.type.color, 8);
                        sliceEffects.push({ x: f.x, y: f.y, text: '+10', life: 25, color: f.type.color });
                    }
                }
            }

            lastMouse.x = mx;
            lastMouse.y = my;
        }

        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('mouseleave', onMouseUp);
        canvas.addEventListener('mousemove', onMouseMove);

        function addParticles(x, y, color, count) {
            for (var i = 0; i < count; i++) {
                var angle = Math.random() * Math.PI * 2;
                var speed = 2 + Math.random() * 4;
                particles.push({
                    x: x, y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 20 + Math.random() * 15,
                    color: color,
                    r: 2 + Math.random() * 3
                });
            }
        }

        function endGame() {
            if (gameOver) return;
            gameOver = true;
            if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
            callbacks.onGameOver(score);
        }

        function update() {
            if (gameOver) return;

            spawnTimer++;
            if (spawnTimer >= spawnInterval) {
                var count = 1 + Math.floor(Math.random() * 3);
                for (var i = 0; i < count; i++) {
                    setTimeout(spawnFruit, i * 100);
                }
                spawnTimer = 0;
                spawnInterval = 30 + Math.floor(Math.random() * 30);
            }

            for (var i = fruits.length - 1; i >= 0; i--) {
                var f = fruits[i];
                f.x += f.vx;
                f.vy += 0.2;
                f.y += f.vy;
                f.rotation += f.rotSpeed;
                if (f.y > H + 50 || f.sliced) {
                    fruits.splice(i, 1);
                }
            }

            for (var i = particles.length - 1; i >= 0; i--) {
                var p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.1;
                p.life--;
                if (p.life <= 0) particles.splice(i, 1);
            }

            for (var i = sliceTrail.length - 1; i >= 0; i--) {
                sliceTrail[i].life--;
                if (sliceTrail[i].life <= 0) sliceTrail.splice(i, 1);
            }

            for (var i = sliceEffects.length - 1; i >= 0; i--) {
                sliceEffects[i].life--;
                sliceEffects[i].y -= 1;
                if (sliceEffects[i].life <= 0) sliceEffects.splice(i, 1);
            }
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            if (sliceTrail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(sliceTrail[0].x, sliceTrail[0].y);
                for (var i = 1; i < sliceTrail.length; i++) {
                    ctx.lineTo(sliceTrail[i].x, sliceTrail[i].y);
                }
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 10;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }

            for (var i = 0; i < fruits.length; i++) {
                var f = fruits[i];
                ctx.save();
                ctx.translate(f.x, f.y);
                ctx.rotate(f.rotation);
                ctx.font = '36px serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(f.type.emoji, 0, 0);
                ctx.restore();
            }

            for (var i = 0; i < particles.length; i++) {
                var p = particles[i];
                ctx.globalAlpha = p.life / 30;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            for (var i = 0; i < sliceEffects.length; i++) {
                var se = sliceEffects[i];
                ctx.globalAlpha = se.life / 25;
                if (se.text === '💥') {
                    ctx.font = '36px serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(se.text, se.x, se.y);
                } else {
                    ctx.font = '14px "Press Start 2P", monospace';
                    ctx.fillStyle = se.color || '#fff';
                    ctx.textAlign = 'center';
                    ctx.fillText(se.text, se.x, se.y);
                }
            }
            ctx.globalAlpha = 1;

            ctx.fillStyle = '#ff00aa';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            var bombStr = '';
            for (var i = 0; i < bombs; i++) bombStr += '💣';
            for (var i = bombs; i < 3; i++) bombStr += '💀';
            ctx.fillText(bombStr, 10, 25);

            ctx.fillStyle = '#00f0ff';
            ctx.textAlign = 'right';
            ctx.fillText('⏱ ' + timeLeft + 's', W - 10, 25);

            if (gameOver) {
                ctx.fillStyle = 'rgba(10,10,26,0.85)';
                ctx.fillRect(0, 0, W, H);
                ctx.fillStyle = bombs <= 0 ? '#ff00aa' : '#ffcc00';
                ctx.font = '18px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(bombs <= 0 ? 'BOMBA!' : 'TEMPO!', W / 2, H / 2 - 30);
                ctx.fillStyle = '#00f0ff';
                ctx.font = '14px "Press Start 2P", monospace';
                ctx.fillText('Pontos: ' + score, W / 2, H / 2 + 5);

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
            if (timerInterval) clearInterval(timerInterval);
            score = 0; gameOver = false; bombs = 3; timeLeft = 45;
            fruits = []; particles = []; sliceTrail = []; sliceEffects = [];
            spawnTimer = 0; mouseDown = false;
            callbacks.onScore(0);
            startTimer();
        }

        function startTimer() {
            timerInterval = setInterval(function() {
                if (gameOver) return;
                timeLeft--;
                if (timeLeft <= 0) {
                    endGame();
                }
            }, 1000);
        }

        startTimer();

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
                if (timerInterval) clearInterval(timerInterval);
                canvas.removeEventListener('mousedown', onMouseDown);
                canvas.removeEventListener('mouseup', onMouseUp);
                canvas.removeEventListener('mouseleave', onMouseUp);
                canvas.removeEventListener('mousemove', onMouseMove);
                if (restartBtn) restartBtn.remove();
            }
        };
    };
})();
