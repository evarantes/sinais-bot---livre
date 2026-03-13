(function(){
    window.Games = window.Games || {};
    window.Games['slidingpuzzle'] = function(container, callbacks) {
        var moves = 0;
        var destroyed = false;
        var tiles = [];
        var emptyIdx = 15;
        var solved = false;

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:16px;user-select:none;';
        container.appendChild(wrapper);

        var movesEl = document.createElement('div');
        movesEl.style.cssText = 'font-family:"Press Start 2P",cursive;font-size:14px;color:#00f0ff;';
        movesEl.textContent = 'Movimentos: 0';
        wrapper.appendChild(movesEl);

        var board = document.createElement('div');
        board.style.cssText = 'display:grid;grid-template-columns:repeat(4,80px);gap:4px;background:#0a0a1a;padding:4px;border-radius:12px;border:2px solid #2a2a5a;';
        wrapper.appendChild(board);

        for (var i = 0; i < 16; i++) {
            tiles.push(i);
        }

        function shuffle() {
            var current = 15;
            for (var i = 0; i < 500; i++) {
                var neighbors = getNeighbors(current);
                var pick = neighbors[Math.floor(Math.random() * neighbors.length)];
                tiles[current] = tiles[pick];
                tiles[pick] = 0;
                current = pick;
            }
            emptyIdx = current;
        }

        function getNeighbors(idx) {
            var row = Math.floor(idx / 4);
            var col = idx % 4;
            var result = [];
            if (row > 0) result.push(idx - 4);
            if (row < 3) result.push(idx + 4);
            if (col > 0) result.push(idx - 1);
            if (col < 3) result.push(idx + 1);
            return result;
        }

        function isSolved() {
            for (var i = 0; i < 15; i++) {
                if (tiles[i] !== i + 1) return false;
            }
            return tiles[15] === 0;
        }

        function render() {
            board.innerHTML = '';
            for (var i = 0; i < 16; i++) {
                var cell = document.createElement('div');
                if (tiles[i] === 0) {
                    cell.style.cssText = 'width:80px;height:80px;background:transparent;border-radius:8px;';
                } else {
                    cell.style.cssText = 'width:80px;height:80px;background:#1a1a3e;border:1px solid #2a2a5a;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-family:"Press Start 2P",cursive;font-size:16px;color:#00f0ff;transition:all 0.15s ease;';
                    cell.textContent = tiles[i];
                    cell.dataset.pos = i;
                    cell.addEventListener('mouseenter', function() { this.style.background = '#222260'; });
                    cell.addEventListener('mouseleave', function() { this.style.background = '#1a1a3e'; });
                    cell.addEventListener('click', function() {
                        if (destroyed || solved) return;
                        var pos = parseInt(this.dataset.pos);
                        handleClick(pos);
                    });
                }
                board.appendChild(cell);
            }
        }

        function handleClick(pos) {
            var neighbors = getNeighbors(pos);
            if (neighbors.indexOf(emptyIdx) === -1) return;

            tiles[emptyIdx] = tiles[pos];
            tiles[pos] = 0;
            emptyIdx = pos;
            moves++;
            movesEl.textContent = 'Movimentos: ' + moves;

            var currentScore = Math.max(100, 1000 - moves * 5);
            callbacks.onScore(currentScore);

            render();

            if (isSolved()) {
                solved = true;
                var finalScore = Math.max(100, 1000 - moves * 5);
                var overlay = document.createElement('div');
                overlay.className = 'game-over-screen';
                overlay.innerHTML = '<h2>Parabéns!</h2>' +
                    '<p>Resolvido em ' + moves + ' movimentos</p>' +
                    '<p>Pontuação: ' + finalScore + '</p>' +
                    '<button class="btn btn-play" style="margin-top:12px;">Reiniciar</button>';
                overlay.querySelector('button').addEventListener('click', function() {
                    container.innerHTML = '';
                    window.Games['slidingpuzzle'](container, callbacks);
                });
                container.appendChild(overlay);
                callbacks.onGameOver(finalScore);
            }
        }

        shuffle();
        render();

        return {
            destroy: function() {
                destroyed = true;
                container.innerHTML = '';
            }
        };
    };
})();
