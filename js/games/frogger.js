(function(){
    window.Games = window.Games || {};
    window.Games['frogger'] = function(container, callbacks) {
        var W = 400, H = 480;
        var canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.style.background = '#0a0a1a';
        canvas.style.border = '2px solid #2a2a5a';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var CELL = 40;
        var COLS = W / CELL;
        var ROWS = H / CELL;
        var score = 0, lives = 3, gameOver = false, animId = null, lastTime = 0;

        var frog, lanes, moveCD;

        function init() {
            score = 0; lives = 3; gameOver = false; moveCD = 0;
            frog = {x: Math.floor(COLS / 2), y: ROWS - 1};
            buildLanes();
            callbacks.onScore(0);
            removeGameOverScreen();
        }

        function removeGameOverScreen() {
            var existing = container.querySelector('.game-over-screen');
            if (existing) existing.remove();
        }

        function buildLanes() {
            lanes = [];
            lanes.push({type: 'safe', y: 0, objects: []});
            for (var i = 1; i <= 5; i++) {
                var speed = (0.5 + Math.random() * 1.5) * (i % 2 === 0 ? 1 : -1);
                var objs = [];
                var count = 2 + Math.floor(Math.random() * 2);
                for (var j = 0; j < count; j++) {
                    objs.push({x: j * (W / count) + Math.random() * 40, w: 60 + Math.random() * 40});
                }
                lanes.push({type: 'river', y: i, speed: speed, objects: objs, color: '#4a2800'});
            }
            lanes.push({type: 'safe', y: 6, objects: []});
            for (var i = 7; i <= 11; i++) {
                var speed = (1 + Math.random() * 2) * (i % 2 === 0 ? 1 : -1);
                var objs = [];
                var count = 2 + Math.floor(Math.random() * 2);
                for (var j = 0; j < count; j++) {
                    objs.push({x: j * (W / count) + Math.random() * 30, w: 50 + Math.random() * 30});
                }
                lanes.push({type: 'road', y: i, speed: speed, objects: objs, color: '#cc0000'});
            }
            lanes.push({type: 'safe', y: ROWS - 1, objects: []});
        }

        function update(dt) {
            if (gameOver) return;
            if (moveCD > 0) moveCD -= dt;

            var onLog = false;
            var logSpeed = 0;

            lanes.forEach(function(lane) {
                if (lane.type === 'road' || lane.type === 'river') {
                    lane.objects.forEach(function(obj) {
                        obj.x += lane.speed * (dt / 16.67);
                        if (obj.x > W + 50) obj.x = -obj.w - 10;
                        if (obj.x < -obj.w - 50) obj.x = W + 10;
                    });
                }
            });

            var frogPx = frog.x * CELL + CELL / 2;
            var frogPy = frog.y * CELL;
            var currentLane = null;
            for (var i = 0; i < lanes.length; i++) {
                if (lanes[i].y === frog.y) { currentLane = lanes[i]; break; }
            }

            if (currentLane && currentLane.type === 'road') {
                for (var j = 0; j < currentLane.objects.length; j++) {
                    var obj = currentLane.objects[j];
                    if (frogPx > obj.x && frogPx < obj.x + obj.w) {
                        loseLife();
                        return;
                    }
                }
            }

            if (currentLane && currentLane.type === 'river') {
                var onAny = false;
                for (var j = 0; j < currentLane.objects.length; j++) {
                    var obj = currentLane.objects[j];
                    if (frogPx > obj.x - 5 && frogPx < obj.x + obj.w + 5) {
                        onAny = true;
                        var pxMove = currentLane.speed * (dt / 16.67);
                        frog.x += pxMove / CELL;
                        if (frog.x < 0 || frog.x >= COLS) {
                            loseLife();
                            return;
                        }
                        break;
                    }
                }
                if (!onAny) {
                    loseLife();
                    return;
                }
            }

            if (frog.y === 0) {
                score += 50;
                callbacks.onScore(score);
                frog.x = Math.floor(COLS / 2);
                frog.y = ROWS - 1;
            }
        }

        function loseLife() {
            lives--;
            if (lives <= 0) {
                gameOver = true;
                callbacks.onGameOver(score);
                showGameOver();
            } else {
                frog.x = Math.floor(COLS / 2);
                frog.y = ROWS - 1;
            }
        }

        function draw() {
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            lanes.forEach(function(lane) {
                var ly = lane.y * CELL;
                if (lane.type === 'safe') {
                    ctx.fillStyle = '#0a3a0a';
                    ctx.fillRect(0, ly, W, CELL);
                } else if (lane.type === 'road') {
                    ctx.fillStyle = '#1a1a2a';
                    ctx.fillRect(0, ly, W, CELL);
                    ctx.strokeStyle = '#333355';
                    ctx.setLineDash([10, 10]);
                    ctx.beginPath();
                    ctx.moveTo(0, ly + CELL); ctx.lineTo(W, ly + CELL);
                    ctx.stroke();
                    ctx.setLineDash([]);
                    lane.objects.forEach(function(obj) {
                        ctx.fillStyle = lane.color || '#cc0000';
                        ctx.shadowColor = lane.color || '#cc0000';
                        ctx.shadowBlur = 5;
                        ctx.fillRect(obj.x, ly + 5, obj.w, CELL - 10);
                        ctx.fillStyle = '#ffcc00';
                        ctx.fillRect(obj.x + 3, ly + CELL / 2 - 2, 4, 4);
                        ctx.fillRect(obj.x + obj.w - 7, ly + CELL / 2 - 2, 4, 4);
                        ctx.shadowBlur = 0;
                    });
                } else if (lane.type === 'river') {
                    ctx.fillStyle = '#000066';
                    ctx.fillRect(0, ly, W, CELL);
                    lane.objects.forEach(function(obj) {
                        ctx.fillStyle = '#6b3a00';
                        ctx.shadowColor = '#6b3a00';
                        ctx.shadowBlur = 3;
                        ctx.fillRect(obj.x, ly + 8, obj.w, CELL - 16);
                        ctx.strokeStyle = '#4a2800';
                        ctx.lineWidth = 1;
                        for (var lx = obj.x + 5; lx < obj.x + obj.w - 5; lx += 12) {
                            ctx.beginPath();
                            ctx.moveTo(lx, ly + 10); ctx.lineTo(lx, ly + CELL - 10);
                            ctx.stroke();
                        }
                        ctx.shadowBlur = 0;
                    });
                }
            });

            if (!gameOver) {
                var fx = Math.round(frog.x) * CELL;
                var fy = frog.y * CELL;
                ctx.fillStyle = '#00ff44';
                ctx.shadowColor = '#00ff44';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.ellipse(frog.x * CELL + CELL / 2, fy + CELL / 2, CELL / 2 - 3, CELL / 2 - 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#00cc33';
                ctx.beginPath();
                ctx.arc(frog.x * CELL + CELL / 2 - 5, fy + CELL / 2 - 4, 3, 0, Math.PI * 2);
                ctx.arc(frog.x * CELL + CELL / 2 + 5, fy + CELL / 2 - 4, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(frog.x * CELL + CELL / 2 - 5, fy + CELL / 2 - 4, 1.5, 0, Math.PI * 2);
                ctx.arc(frog.x * CELL + CELL / 2 + 5, fy + CELL / 2 - 4, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            ctx.fillStyle = '#ffcc00';
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('Lives: ' + lives, 5, H - 5);
            ctx.textAlign = 'right';
            ctx.fillText('Goal ↑', W - 5, 25);
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
            if (gameOver || moveCD > 0) return;
            var moved = false;
            switch(e.key) {
                case 'ArrowUp':    if (frog.y > 0) { frog.y--; moved = true; } e.preventDefault(); break;
                case 'ArrowDown':  if (frog.y < ROWS - 1) { frog.y++; moved = true; } e.preventDefault(); break;
                case 'ArrowLeft':  if (frog.x > 0) { frog.x = Math.round(frog.x) - 1; moved = true; } e.preventDefault(); break;
                case 'ArrowRight': if (frog.x < COLS - 1) { frog.x = Math.round(frog.x) + 1; moved = true; } e.preventDefault(); break;
            }
            if (moved) moveCD = 120;
        }

        document.addEventListener('keydown', onKeyDown);
        init();
        animId = requestAnimationFrame(loop);

        return {
            destroy: function() {
                if (animId) cancelAnimationFrame(animId);
                document.removeEventListener('keydown', onKeyDown);
            }
        };
    };
})();
