(function(){
    window.Games = window.Games || {};
    window.Games['wordsearch'] = function(container, callbacks) {
        var destroyed = false;
        var score = 0;
        var WORDS = ['SOL', 'LUA', 'MAR', 'RIO', 'CEU', 'FOG'];
        var GRID_SIZE = 10;
        var grid = [];
        var foundWords = [];
        var wordPositions = {};
        var selectedCells = [];

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;gap:24px;align-items:flex-start;user-select:none;flex-wrap:wrap;justify-content:center;';
        container.appendChild(wrapper);

        var gridWrapper = document.createElement('div');
        gridWrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;';
        wrapper.appendChild(gridWrapper);

        var infoEl = document.createElement('div');
        infoEl.style.cssText = 'font-family:"Press Start 2P",cursive;font-size:12px;color:#00f0ff;';
        infoEl.textContent = 'Encontre as palavras!';
        gridWrapper.appendChild(infoEl);

        var gridEl = document.createElement('div');
        gridEl.style.cssText = 'display:grid;grid-template-columns:repeat(10,36px);gap:2px;';
        gridWrapper.appendChild(gridEl);

        var wordListDiv = document.createElement('div');
        wordListDiv.style.cssText = 'display:flex;flex-direction:column;gap:8px;min-width:120px;';
        wrapper.appendChild(wordListDiv);

        var wordListTitle = document.createElement('div');
        wordListTitle.style.cssText = 'font-family:"Press Start 2P",cursive;font-size:11px;color:#ffcc00;margin-bottom:4px;';
        wordListTitle.textContent = 'Palavras:';
        wordListDiv.appendChild(wordListTitle);

        var wordEls = {};
        WORDS.forEach(function(w) {
            var el = document.createElement('div');
            el.style.cssText = 'font-family:monospace;font-size:16px;color:#e8e8f0;padding:4px 8px;background:#1a1a3e;border-radius:6px;border:1px solid #2a2a5a;';
            el.textContent = w;
            el.dataset.word = w;
            wordListDiv.appendChild(el);
            wordEls[w] = el;
        });

        function initGrid() {
            grid = [];
            for (var r = 0; r < GRID_SIZE; r++) {
                grid[r] = [];
                for (var c = 0; c < GRID_SIZE; c++) {
                    grid[r][c] = '';
                }
            }
        }

        function placeWord(word) {
            var directions = [
                [0, 1],
                [1, 0]
            ];
            var attempts = 0;
            while (attempts < 200) {
                var dir = directions[Math.floor(Math.random() * directions.length)];
                var maxR = GRID_SIZE - (dir[0] * word.length);
                var maxC = GRID_SIZE - (dir[1] * word.length);
                if (maxR <= 0 || maxC <= 0) { attempts++; continue; }
                var r = Math.floor(Math.random() * maxR);
                var c = Math.floor(Math.random() * maxC);
                var canPlace = true;
                for (var i = 0; i < word.length; i++) {
                    var nr = r + dir[0] * i;
                    var nc = c + dir[1] * i;
                    if (grid[nr][nc] !== '' && grid[nr][nc] !== word[i]) {
                        canPlace = false;
                        break;
                    }
                }
                if (canPlace) {
                    var positions = [];
                    for (var j = 0; j < word.length; j++) {
                        var pr = r + dir[0] * j;
                        var pc = c + dir[1] * j;
                        grid[pr][pc] = word[j];
                        positions.push(pr + ',' + pc);
                    }
                    wordPositions[word] = positions;
                    return true;
                }
                attempts++;
            }
            return false;
        }

        function fillRandom() {
            var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (var r = 0; r < GRID_SIZE; r++) {
                for (var c = 0; c < GRID_SIZE; c++) {
                    if (grid[r][c] === '') {
                        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
                    }
                }
            }
        }

        function renderGrid() {
            gridEl.innerHTML = '';
            for (var r = 0; r < GRID_SIZE; r++) {
                for (var c = 0; c < GRID_SIZE; c++) {
                    var cell = document.createElement('div');
                    cell.style.cssText = 'width:36px;height:36px;display:flex;align-items:center;justify-content:center;background:#1a1a3e;border:1px solid #2a2a5a;border-radius:4px;cursor:pointer;font-family:monospace;font-size:16px;font-weight:700;color:#e8e8f0;transition:all 0.15s;';
                    cell.textContent = grid[r][c];
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    cell.dataset.key = r + ',' + c;
                    cell.addEventListener('click', onCellClick);
                    gridEl.appendChild(cell);
                }
            }
        }

        function onCellClick(e) {
            if (destroyed) return;
            var cell = e.currentTarget;
            var key = cell.dataset.key;

            var idx = -1;
            for (var i = 0; i < selectedCells.length; i++) {
                if (selectedCells[i] === key) { idx = i; break; }
            }

            if (idx >= 0) {
                selectedCells.splice(idx, 1);
                cell.style.background = '#1a1a3e';
                cell.style.color = '#e8e8f0';
            } else {
                selectedCells.push(key);
                cell.style.background = '#00f0ff';
                cell.style.color = '#0a0a1a';
            }

            checkSelection();
        }

        function checkSelection() {
            var selStr = selectedCells.slice().sort().join('|');
            for (var w = 0; w < WORDS.length; w++) {
                var word = WORDS[w];
                if (foundWords.indexOf(word) >= 0) continue;
                var wp = wordPositions[word];
                if (!wp) continue;
                var wpStr = wp.slice().sort().join('|');
                if (selStr === wpStr || selectedCells.length === wp.length && containsAll(selectedCells, wp)) {
                    foundWords.push(word);
                    score += 20;
                    callbacks.onScore(score);

                    wordEls[word].style.textDecoration = 'line-through';
                    wordEls[word].style.color = '#00ff88';
                    wordEls[word].style.borderColor = '#00ff88';

                    wp.forEach(function(k) {
                        var cells = gridEl.querySelectorAll('[data-key="' + k + '"]');
                        cells.forEach(function(c) {
                            c.style.background = '#00ff88';
                            c.style.color = '#0a0a1a';
                            c.style.pointerEvents = 'none';
                        });
                    });

                    selectedCells = [];
                    clearHighlights();

                    if (foundWords.length === WORDS.length) {
                        endGame();
                    }
                    return;
                }
            }
        }

        function containsAll(arr, target) {
            for (var i = 0; i < target.length; i++) {
                if (arr.indexOf(target[i]) === -1) return false;
            }
            return true;
        }

        function clearHighlights() {
            var allCells = gridEl.querySelectorAll('div');
            allCells.forEach(function(c) {
                var k = c.dataset.key;
                var isFound = false;
                foundWords.forEach(function(w) {
                    if (wordPositions[w] && wordPositions[w].indexOf(k) >= 0) isFound = true;
                });
                if (!isFound) {
                    c.style.background = '#1a1a3e';
                    c.style.color = '#e8e8f0';
                }
            });
        }

        function endGame() {
            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
            overlay.innerHTML = '<h2>Parabéns!</h2>' +
                '<p>Todas as palavras encontradas!</p>' +
                '<p>Pontuação: ' + score + '</p>' +
                '<button class="btn btn-play" style="margin-top:12px;">Reiniciar</button>';
            overlay.querySelector('button').addEventListener('click', function() {
                container.innerHTML = '';
                window.Games['wordsearch'](container, callbacks);
            });
            container.appendChild(overlay);
            callbacks.onGameOver(score);
        }

        initGrid();
        WORDS.forEach(function(w) { placeWord(w); });
        fillRandom();
        renderGrid();

        return {
            destroy: function() {
                destroyed = true;
                container.innerHTML = '';
            }
        };
    };
})();
