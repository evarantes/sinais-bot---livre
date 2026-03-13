(function(){
    window.Games = window.Games || {};
    window.Games['bubbleshooter'] = function(container, callbacks) {
        var canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 500;
        canvas.style.display = 'block';
        canvas.style.margin = '0 auto';
        canvas.style.background = '#0a0a1a';
        canvas.style.borderRadius = '8px';
        container.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var W = canvas.width, H = canvas.height;
        var BUBBLE_R = 18;
        var COLS = 10;
        var ROWS = 12;
        var colors = ['#ff00aa', '#00f0ff', '#00ff88', '#ffcc00', '#aa44ff', '#ff4444'];
        var grid = [];
        var score = 0;
        var gameOver = false;
        var restartBtn = null;

        var shooter = { x: W / 2, y: H - 40, angle: -Math.PI / 2 };
        var currentBubble = null;
        var nextColor = null;
        var flyingBubble = null;
        var deadLine = H - 80;

        function rowOffset(row) { return (row % 2 === 1) ? BUBBLE_R : 0; }

        function initGrid() {
            grid = [];
            for (var r = 0; r < ROWS; r++) {
                grid[r] = [];
                var cols = (r % 2 === 1) ? COLS - 1 : COLS;
                for (var c = 0; c < cols; c++) {
                    if (r < 5) {
                        grid[r][c] = { color: colors[Math.floor(Math.random() * colors.length)] };
                    } else {
                        grid[r][c] = null;
                    }
                }
            }
        }
        initGrid();

        function getBubblePos(row, col) {
            var x = col * BUBBLE_R * 2 + BUBBLE_R + rowOffset(row);
            var y = row * BUBBLE_R * 1.73 + BUBBLE_R;
            return { x: x, y: y };
        }

        function getGridColsForRow(row) { return (row % 2 === 1) ? COLS - 1 : COLS; }

        function pickColor() {
            var used = {};
            for (var r = 0; r < ROWS; r++)
                for (var c = 0; c < getGridColsForRow(r); c++)
                    if (grid[r] && grid[r][c]) used[grid[r][c].color] = true;
            var available = Object.keys(used);
            if (available.length === 0) available = colors.slice(0, 3);
            return available[Math.floor(Math.random() * available.length)];
        }

        currentBubble = { color: pickColor() };
        nextColor = pickColor();

        function onMouseMove(e) {
            if (gameOver || flyingBubble) return;
            var rect = canvas.getBoundingClientRect();
            var mx = (e.clientX - rect.left) * (W / rect.width);
            var my = (e.clientY - rect.top) * (H / rect.height);
            var angle = Math.atan2(my - shooter.y, mx - shooter.x);
            if (angle > -0.15) angle = -0.15;
            if (angle < -Math.PI + 0.15) angle = -Math.PI + 0.15;
            shooter.angle = angle;
        }

        function onClick(e) {
            if (gameOver || flyingBubble || !currentBubble) return;
            flyingBubble = {
                x: shooter.x,
                y: shooter.y,
                vx: Math.cos(shooter.angle) * 10,
                vy: Math.sin(shooter.angle) * 10,
                color: currentBubble.color
            };
            currentBubble = { color: nextColor };
            nextColor = pickColor();
        }

        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('click', onClick);

        function snapToGrid(bx, by) {
            var bestDist = Infinity, bestR = 0, bestC = 0;
            for (var r = 0; r < ROWS; r++) {
                var cols = getGridColsForRow(r);
                for (var c = 0; c < cols; c++) {
                    if (grid[r] && grid[r][c]) continue;
                    var pos = getBubblePos(r, c);
                    var d = Math.sqrt((bx - pos.x) * (bx - pos.x) + (by - pos.y) * (by - pos.y));
                    if (d < bestDist) { bestDist = d; bestR = r; bestC = c; }
                }
            }
            return { row: bestR, col: bestC };
        }

        function getNeighbors(row, col) {
            var neighbors = [];
            var offsets;
            if (row % 2 === 0) {
                offsets = [[-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]];
            } else {
                offsets = [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]];
            }
            for (var i = 0; i < offsets.length; i++) {
                var nr = row + offsets[i][0], nc = col + offsets[i][1];
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < getGridColsForRow(nr)) {
                    neighbors.push({ row: nr, col: nc });
                }
            }
            return neighbors;
        }

        function findCluster(row, col, color) {
            var visited = {};
            var cluster = [];
            var stack = [{ row: row, col: col }];
            while (stack.length > 0) {
                var cur = stack.pop();
                var key = cur.row + ',' + cur.col;
                if (visited[key]) continue;
                visited[key] = true;
                if (!grid[cur.row] || !grid[cur.row][cur.col]) continue;
                if (grid[cur.row][cur.col].color !== color) continue;
                cluster.push(cur);
                var nbrs = getNeighbors(cur.row, cur.col);
                for (var i = 0; i < nbrs.length; i++) stack.push(nbrs[i]);
            }
            return cluster;
        }

        function findFloating() {
            var attached = {};
            var stack = [];
            for (var c = 0; c < getGridColsForRow(0); c++) {
                if (grid[0] && grid[0][c]) {
                    stack.push({ row: 0, col: c });
                    attached['0,' + c] = true;
                }
            }
            while (stack.length > 0) {
                var cur = stack.pop();
                var nbrs = getNeighbors(cur.row, cur.col);
                for (var i = 0; i < nbrs.length; i++) {
                    var key = nbrs[i].row + ',' + nbrs[i].col;
                    if (attached[key]) continue;
                    if (grid[nbrs[i].row] && grid[nbrs[i].row][nbrs[i].col]) {
                        attached[key] = true;
                        stack.push(nbrs[i]);
                    }
                }
            }
            var floating = [];
            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < getGridColsForRow(r); c++) {
                    if (grid[r] && grid[r][c] && !attached[r + ',' + c]) {
                        floating.push({ row: r, col: c });
                    }
                }
            }
            return floating;
        }

        function checkDeadLine() {
            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < getGridColsForRow(r); c++) {
                    if (grid[r] && grid[r][c]) {
                        var pos = getBubblePos(r, c);
                        if (pos.y + BUBBLE_R >= deadLine) return true;
                    }
                }
            }
            return false;
        }

        function checkEmpty() {
            for (var r = 0; r < ROWS; r++)
                for (var c = 0; c < getGridColsForRow(r); c++)
                    if (grid[r] && grid[r][c]) return false;
            return true;
        }

        function update() {
            if (gameOver || !flyingBubble) return;

            flyingBubble.x += flyingBubble.vx;
            flyingBubble.y += flyingBubble.vy;

            if (flyingBubble.x - BUBBLE_R <= 0 || flyingBubble.x + BUBBLE_R >= W) {
                flyingBubble.vx = -flyingBubble.vx;
                flyingBubble.x = Math.max(BUBBLE_R, Math.min(W - BUBBLE_R, flyingBubble.x));
            }

            var hit = false;
            if (flyingBubble.y - BUBBLE_R <= 0) hit = true;

            if (!hit) {
                for (var r = 0; r < ROWS && !hit; r++) {
                    for (var c = 0; c < getGridColsForRow(r) && !hit; c++) {
                        if (!grid[r] || !grid[r][c]) continue;
                        var pos = getBubblePos(r, c);
                        var dx = flyingBubble.x - pos.x;
                        var dy = flyingBubble.y - pos.y;
                        if (Math.sqrt(dx * dx + dy * dy) < BUBBLE_R * 1.8) hit = true;
                    }
                }
            }

            if (hit) {
                var snap = snapToGrid(flyingBubble.x, flyingBubble.y);
                if (!grid[snap.row]) grid[snap.row] = [];
                grid[snap.row][snap.col] = { color: flyingBubble.color };
                flyingBubble = null;

                var cluster = findCluster(snap.row, snap.col, grid[snap.row][snap.col].color);
                if (cluster.length >= 3) {
                    for (var i = 0; i < cluster.length; i++) {
                        grid[cluster[i].row][cluster[i].col] = null;
                    }
                    score += cluster.length * 10;
                    callbacks.onScore(score);

                    var floating = findFloating();
                    for (var i = 0; i < floating.length; i++) {
                        grid[floating[i].row][floating[i].col] = null;
                        score += 10;
                    }
                    if (floating.length > 0) callbacks.onScore(score);
                }

                if (checkEmpty()) {
                    score += 100;
                    callbacks.onScore(score);
                    gameOver = true;
                    callbacks.onGameOver(score);
                } else if (checkDeadLine()) {
                    gameOver = true;
                    callbacks.onGameOver(score);
                }
            }
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = '#0a0a1a';
            ctx.fillRect(0, 0, W, H);

            ctx.strokeStyle = '#ff004433';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(0, deadLine);
            ctx.lineTo(W, deadLine);
            ctx.stroke();
            ctx.setLineDash([]);

            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < getGridColsForRow(r); c++) {
                    if (!grid[r] || !grid[r][c]) continue;
                    var pos = getBubblePos(r, c);
                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, BUBBLE_R - 1, 0, Math.PI * 2);
                    ctx.fillStyle = grid[r][c].color;
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(pos.x - 5, pos.y - 5, 4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    ctx.fill();
                }
            }

            if (flyingBubble) {
                ctx.beginPath();
                ctx.arc(flyingBubble.x, flyingBubble.y, BUBBLE_R - 1, 0, Math.PI * 2);
                ctx.fillStyle = flyingBubble.color;
                ctx.fill();
            }

            if (currentBubble && !gameOver) {
                ctx.beginPath();
                ctx.arc(shooter.x, shooter.y, BUBBLE_R - 1, 0, Math.PI * 2);
                ctx.fillStyle = currentBubble.color;
                ctx.fill();

                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(shooter.x, shooter.y);
                ctx.lineTo(
                    shooter.x + Math.cos(shooter.angle) * 50,
                    shooter.y + Math.sin(shooter.angle) * 50
                );
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(shooter.x + 50, shooter.y, 12, 0, Math.PI * 2);
                ctx.fillStyle = nextColor;
                ctx.globalAlpha = 0.6;
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.font = '8px "Press Start 2P", monospace';
                ctx.fillStyle = '#888';
                ctx.textAlign = 'center';
                ctx.fillText('NEXT', shooter.x + 50, shooter.y + 24);
            }

            if (gameOver) {
                ctx.fillStyle = 'rgba(10,10,26,0.85)';
                ctx.fillRect(0, 0, W, H);
                var won = checkEmpty();
                ctx.fillStyle = won ? '#00ff88' : '#ff00aa';
                ctx.font = '18px "Press Start 2P", monospace';
                ctx.textAlign = 'center';
                ctx.fillText(won ? 'VITÓRIA!' : 'GAME OVER', W / 2, H / 2 - 30);
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
            initGrid();
            score = 0; gameOver = false; flyingBubble = null;
            currentBubble = { color: pickColor() };
            nextColor = pickColor();
            shooter.angle = -Math.PI / 2;
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
                canvas.removeEventListener('mousemove', onMouseMove);
                canvas.removeEventListener('click', onClick);
                if (restartBtn) restartBtn.remove();
            }
        };
    };
})();
