(function(){
    window.Games = window.Games || {};
    window.Games['snake'] = function(container, callbacks) {
        var W = 400, H = 400, CELL = 20;
        var COLS = W / CELL, ROWS = H / CELL;
        var canvas = document.createElement('canvas');
        canvas.width = W; canvas.height = H;
        canvas.style.background = '#0a0a1a';
        canvas.style.border = '2px solid #2a2a5a';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var snake, dir, nextDir, food, score, gameOver, speed, lastTime, accum;
        var animId = null;
        var intervals = [];
        var timeouts = [];

        function init() {
            var startX = Math.floor(COLS / 2);
            var startY = Math.floor(ROWS / 2);
            snake = [{x: startX, y: startY}, {x: startX - 1, y: startY}, {x: startX - 2, y: startY}];
            dir = {x: 1, y: 0};
            nextDir = {x: 1, y: 0};
            food = null;
            score = 0;
            gameOver = false;
            speed = 120;
            lastTime = 0;
            accum = 0;
            placeFood();
            callbacks.onScore(0);
            removeGameOverScreen();
        }

        function removeGameOverScreen() {
            var existing = container.querySelector('.game-over-screen');
            if (existing) existing.remove();
        }

        function placeFood() {
            var positions = [];
            for (var x = 0; x < COLS; x++) {
                for (var y = 0; y < ROWS; y++) {
                    var onSnake = false;
                    for (var i = 0; i < snake.length; i++) {
                        if (snake[i].x === x && snake[i].y === y) { onSnake = true; break; }
                    }
                    if (!onSnake) positions.push({x: x, y: y});
                }
            }
            if (positions.length > 0) {
                food = positions[Math.floor(Math.random() * positions.length)];
            }
        }

        function update() {
            if (gameOver) return;
            dir = {x: nextDir.x, y: nextDir.y};
            var head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

            if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
                endGame(); return;
            }
            for (var i = 0; i < snake.length; i++) {
                if (snake[i].x === head.x && snake[i].y === head.y) {
                    endGame(); return;
                }
            }

            snake.unshift(head);
            if (food && head.x === food.x && head.y === food.y) {
                score += 10;
                callbacks.onScore(score);
                placeFood();
                if (speed > 60) speed -= 2;
            } else {
                snake.pop();
            }
        }

        function draw() {
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            ctx.strokeStyle = 'rgba(42,42,90,0.3)';
            ctx.lineWidth = 0.5;
            for (var x = 0; x <= COLS; x++) {
                ctx.beginPath(); ctx.moveTo(x * CELL, 0); ctx.lineTo(x * CELL, H); ctx.stroke();
            }
            for (var y = 0; y <= ROWS; y++) {
                ctx.beginPath(); ctx.moveTo(0, y * CELL); ctx.lineTo(W, y * CELL); ctx.stroke();
            }

            for (var i = 0; i < snake.length; i++) {
                var s = snake[i];
                if (i === 0) {
                    ctx.fillStyle = '#00ff88';
                    ctx.shadowColor = '#00ff88';
                    ctx.shadowBlur = 10;
                } else {
                    ctx.fillStyle = '#00cc66';
                    ctx.shadowBlur = 0;
                }
                ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
                ctx.shadowBlur = 0;
            }

            if (food) {
                ctx.fillStyle = '#ff00aa';
                ctx.shadowColor = '#ff00aa';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }

        function endGame() {
            gameOver = true;
            callbacks.onGameOver(score);
            showGameOver();
        }

        function showGameOver() {
            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
            overlay.innerHTML = '<h2>Game Over</h2><p>Pontuação: ' + score + '</p>';
            var btn = document.createElement('button');
            btn.className = 'btn btn-play';
            btn.textContent = 'Reiniciar';
            btn.addEventListener('click', function() {
                init();
            });
            overlay.appendChild(btn);
            container.appendChild(overlay);
        }

        function loop(timestamp) {
            animId = requestAnimationFrame(loop);
            if (!lastTime) { lastTime = timestamp; }
            var delta = timestamp - lastTime;
            lastTime = timestamp;
            accum += delta;
            while (accum >= speed) {
                update();
                accum -= speed;
            }
            draw();
        }

        function onKeyDown(e) {
            if (gameOver) return;
            switch(e.key) {
                case 'ArrowUp':    if (dir.y !== 1) nextDir = {x:0, y:-1}; e.preventDefault(); break;
                case 'ArrowDown':  if (dir.y !== -1) nextDir = {x:0, y:1}; e.preventDefault(); break;
                case 'ArrowLeft':  if (dir.x !== 1) nextDir = {x:-1, y:0}; e.preventDefault(); break;
                case 'ArrowRight': if (dir.x !== -1) nextDir = {x:1, y:0}; e.preventDefault(); break;
            }
        }

        document.addEventListener('keydown', onKeyDown);
        init();
        animId = requestAnimationFrame(loop);

        return {
            destroy: function() {
                if (animId) cancelAnimationFrame(animId);
                document.removeEventListener('keydown', onKeyDown);
                intervals.forEach(clearInterval);
                timeouts.forEach(clearTimeout);
            }
        };
    };
})();
