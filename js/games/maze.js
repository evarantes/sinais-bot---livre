(function(){
    window.Games = window.Games || {};
    window.Games['maze'] = function(container, callbacks) {
        var destroyed = false;
        var COLS = 15;
        var ROWS = 15;
        var CANVAS_SIZE = 400;
        var CELL = Math.floor(CANVAS_SIZE / COLS);
        var steps = 0;
        var startTime = Date.now();
        var timerInterval = null;
        var animFrame = null;
        var playerR = 0;
        var playerC = 0;
        var goalR = ROWS - 1;
        var goalC = COLS - 1;
        var mazeGrid = [];
        var won = false;

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;user-select:none;';
        container.appendChild(wrapper);

        var statsEl = document.createElement('div');
        statsEl.style.cssText = 'display:flex;gap:24px;font-family:"Press Start 2P",cursive;font-size:11px;';
        wrapper.appendChild(statsEl);

        var stepsEl = document.createElement('span');
        stepsEl.style.color = '#00f0ff';
        stepsEl.textContent = 'Passos: 0';
        statsEl.appendChild(stepsEl);

        var timeEl = document.createElement('span');
        timeEl.style.color = '#ffcc00';
        timeEl.textContent = 'Tempo: 0s';
        statsEl.appendChild(timeEl);

        var canvas = document.createElement('canvas');
        canvas.width = CANVAS_SIZE;
        canvas.height = CANVAS_SIZE;
        canvas.style.cssText = 'border:2px solid #2a2a5a;border-radius:8px;background:#0a0a1a;';
        wrapper.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        function initMaze() {
            mazeGrid = [];
            for (var r = 0; r < ROWS; r++) {
                mazeGrid[r] = [];
                for (var c = 0; c < COLS; c++) {
                    mazeGrid[r][c] = { top: true, right: true, bottom: true, left: true, visited: false };
                }
            }
        }

        function generateMaze() {
            var stack = [];
            var current = { r: 0, c: 0 };
            mazeGrid[0][0].visited = true;
            stack.push(current);

            while (stack.length > 0) {
                var neighbors = [];
                var r = current.r;
                var c = current.c;
                if (r > 0 && !mazeGrid[r-1][c].visited) neighbors.push({ r: r-1, c: c, dir: 'top' });
                if (r < ROWS-1 && !mazeGrid[r+1][c].visited) neighbors.push({ r: r+1, c: c, dir: 'bottom' });
                if (c > 0 && !mazeGrid[r][c-1].visited) neighbors.push({ r: r, c: c-1, dir: 'left' });
                if (c < COLS-1 && !mazeGrid[r][c+1].visited) neighbors.push({ r: r, c: c+1, dir: 'right' });

                if (neighbors.length > 0) {
                    var next = neighbors[Math.floor(Math.random() * neighbors.length)];
                    mazeGrid[next.r][next.c].visited = true;

                    if (next.dir === 'top') { mazeGrid[r][c].top = false; mazeGrid[next.r][next.c].bottom = false; }
                    else if (next.dir === 'bottom') { mazeGrid[r][c].bottom = false; mazeGrid[next.r][next.c].top = false; }
                    else if (next.dir === 'left') { mazeGrid[r][c].left = false; mazeGrid[next.r][next.c].right = false; }
                    else if (next.dir === 'right') { mazeGrid[r][c].right = false; mazeGrid[next.r][next.c].left = false; }

                    stack.push(current);
                    current = next;
                } else {
                    current = stack.pop();
                }
            }
        }

        function drawMaze() {
            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            ctx.strokeStyle = '#2a2a5a';
            ctx.lineWidth = 2;

            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < COLS; c++) {
                    var x = c * CELL;
                    var y = r * CELL;
                    var cell = mazeGrid[r][c];

                    if (cell.top) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + CELL, y); ctx.stroke(); }
                    if (cell.right) { ctx.beginPath(); ctx.moveTo(x + CELL, y); ctx.lineTo(x + CELL, y + CELL); ctx.stroke(); }
                    if (cell.bottom) { ctx.beginPath(); ctx.moveTo(x, y + CELL); ctx.lineTo(x + CELL, y + CELL); ctx.stroke(); }
                    if (cell.left) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + CELL); ctx.stroke(); }
                }
            }

            var gx = goalC * CELL + CELL / 2;
            var gy = goalR * CELL + CELL / 2;
            ctx.fillStyle = '#ffcc00';
            ctx.beginPath();
            drawStar(ctx, gx, gy, 5, CELL * 0.35, CELL * 0.15);
            ctx.fill();

            var px = playerC * CELL + CELL / 2;
            var py = playerR * CELL + CELL / 2;
            ctx.fillStyle = '#00ff88';
            ctx.beginPath();
            ctx.arc(px, py, CELL * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
            var rot = Math.PI / 2 * 3;
            var step = Math.PI / spikes;
            ctx.moveTo(cx, cy - outerR);
            for (var i = 0; i < spikes; i++) {
                ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
                rot += step;
                ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
                rot += step;
            }
            ctx.lineTo(cx, cy - outerR);
            ctx.closePath();
        }

        function movePlayer(dr, dc) {
            if (destroyed || won) return;
            var cell = mazeGrid[playerR][playerC];
            if (dr === -1 && cell.top) return;
            if (dr === 1 && cell.bottom) return;
            if (dc === -1 && cell.left) return;
            if (dc === 1 && cell.right) return;

            var nr = playerR + dr;
            var nc = playerC + dc;
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) return;

            playerR = nr;
            playerC = nc;
            steps++;
            stepsEl.textContent = 'Passos: ' + steps;

            var currentScore = Math.max(50, 500 - steps * 2);
            callbacks.onScore(currentScore);

            drawMaze();

            if (playerR === goalR && playerC === goalC) {
                won = true;
                clearInterval(timerInterval);
                var finalScore = Math.max(50, 500 - steps * 2);
                var elapsed = Math.floor((Date.now() - startTime) / 1000);

                var overlay = document.createElement('div');
                overlay.className = 'game-over-screen';
                overlay.innerHTML = '<h2>Parabéns!</h2>' +
                    '<p>Passos: ' + steps + ' | Tempo: ' + elapsed + 's</p>' +
                    '<p>Pontuação: ' + finalScore + '</p>' +
                    '<button class="btn btn-play" style="margin-top:12px;">Reiniciar</button>';
                overlay.querySelector('button').addEventListener('click', function() {
                    container.innerHTML = '';
                    window.Games['maze'](container, callbacks);
                });
                container.appendChild(overlay);

                callbacks.onGameOver(finalScore);
            }
        }

        function onKeyDown(e) {
            if (destroyed || won) return;
            switch(e.key) {
                case 'ArrowUp': e.preventDefault(); movePlayer(-1, 0); break;
                case 'ArrowDown': e.preventDefault(); movePlayer(1, 0); break;
                case 'ArrowLeft': e.preventDefault(); movePlayer(0, -1); break;
                case 'ArrowRight': e.preventDefault(); movePlayer(0, 1); break;
            }
        }

        document.addEventListener('keydown', onKeyDown);

        timerInterval = setInterval(function() {
            if (destroyed || won) return;
            var elapsed = Math.floor((Date.now() - startTime) / 1000);
            timeEl.textContent = 'Tempo: ' + elapsed + 's';
        }, 1000);

        initMaze();
        generateMaze();
        drawMaze();

        return {
            destroy: function() {
                destroyed = true;
                clearInterval(timerInterval);
                if (animFrame) cancelAnimationFrame(animFrame);
                document.removeEventListener('keydown', onKeyDown);
                container.innerHTML = '';
            }
        };
    };
})();
