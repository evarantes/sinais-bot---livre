(function(){
    window.Games = window.Games || {};
    window.Games['sudoku'] = function(container, callbacks) {
        var startTime = Date.now();
        var score = 0;
        var gameOver = false;
        var solved = [];
        var puzzle = [];
        var userGrid = [];
        var fixed = [];
        var selectedCell = null;

        function generateSolved() {
            var grid = [];
            for (var i = 0; i < 9; i++) { grid[i] = []; for (var j = 0; j < 9; j++) grid[i][j] = 0; }
            fillGrid(grid);
            return grid;
        }

        function fillGrid(grid) {
            var cell = findEmpty(grid);
            if (!cell) return true;
            var r = cell[0], c = cell[1];
            var nums = shuffle([1,2,3,4,5,6,7,8,9]);
            for (var i = 0; i < nums.length; i++) {
                if (isValid(grid, r, c, nums[i])) {
                    grid[r][c] = nums[i];
                    if (fillGrid(grid)) return true;
                    grid[r][c] = 0;
                }
            }
            return false;
        }

        function findEmpty(grid) {
            for (var r = 0; r < 9; r++)
                for (var c = 0; c < 9; c++)
                    if (grid[r][c] === 0) return [r, c];
            return null;
        }

        function isValid(grid, row, col, num) {
            for (var i = 0; i < 9; i++) {
                if (grid[row][i] === num) return false;
                if (grid[i][col] === num) return false;
            }
            var br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
            for (var r = br; r < br + 3; r++)
                for (var c = bc; c < bc + 3; c++)
                    if (grid[r][c] === num) return false;
            return true;
        }

        function shuffle(arr) {
            for (var i = arr.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
            }
            return arr;
        }

        function makePuzzle(solvedGrid, clues) {
            var p = [];
            var f = [];
            for (var r = 0; r < 9; r++) {
                p[r] = []; f[r] = [];
                for (var c = 0; c < 9; c++) {
                    p[r][c] = solvedGrid[r][c];
                    f[r][c] = true;
                }
            }
            var cells = [];
            for (var r = 0; r < 9; r++) for (var c = 0; c < 9; c++) cells.push([r, c]);
            shuffle(cells);
            var toRemove = 81 - clues;
            var removed = 0;
            for (var i = 0; i < cells.length && removed < toRemove; i++) {
                var rr = cells[i][0], cc = cells[i][1];
                p[rr][cc] = 0;
                f[rr][cc] = false;
                removed++;
            }
            return { puzzle: p, fixed: f };
        }

        solved = generateSolved();
        var result = makePuzzle(solved, 35);
        puzzle = result.puzzle;
        fixed = result.fixed;
        userGrid = [];
        for (var r = 0; r < 9; r++) {
            userGrid[r] = [];
            for (var c = 0; c < 9; c++) userGrid[r][c] = puzzle[r][c];
        }

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;background:#0a0a1a;padding:16px;border-radius:8px;';
        container.appendChild(wrapper);

        var table = document.createElement('table');
        table.style.cssText = 'border-collapse:collapse;background:#111;';
        wrapper.appendChild(table);

        var cells = [];
        for (var r = 0; r < 9; r++) {
            var tr = document.createElement('tr');
            cells[r] = [];
            for (var c = 0; c < 9; c++) {
                var td = document.createElement('td');
                td.style.cssText = 'width:44px;height:44px;text-align:center;font-size:18px;font-family:"Press Start 2P",monospace;cursor:pointer;border:1px solid #333;';
                if (c % 3 === 0) td.style.borderLeft = '2px solid #00f0ff';
                if (c === 8) td.style.borderRight = '2px solid #00f0ff';
                if (r % 3 === 0) td.style.borderTop = '2px solid #00f0ff';
                if (r === 8) td.style.borderBottom = '2px solid #00f0ff';

                if (fixed[r][c]) {
                    td.textContent = puzzle[r][c];
                    td.style.color = '#00f0ff';
                    td.style.background = '#0d1a2a';
                } else {
                    td.style.color = '#fff';
                    td.style.background = '#0a0a1a';
                }
                td.dataset.row = r;
                td.dataset.col = c;
                td.addEventListener('click', cellClick);
                tr.appendChild(td);
                cells[r][c] = td;
            }
            table.appendChild(tr);
        }

        function cellClick(e) {
            if (gameOver) return;
            var r = parseInt(e.target.dataset.row);
            var c = parseInt(e.target.dataset.col);
            if (fixed[r][c]) return;
            if (selectedCell) {
                cells[selectedCell[0]][selectedCell[1]].style.outline = 'none';
            }
            selectedCell = [r, c];
            e.target.style.outline = '2px solid #ff00aa';
        }

        function onKeydown(e) {
            if (gameOver || !selectedCell) return;
            var num = parseInt(e.key);
            if (num >= 1 && num <= 9) {
                var r = selectedCell[0], c = selectedCell[1];
                userGrid[r][c] = num;
                cells[r][c].textContent = num;
                if (num !== solved[r][c]) {
                    cells[r][c].style.color = '#ff00aa';
                } else {
                    cells[r][c].style.color = '#00ff88';
                }
                checkCompletion();
            }
            if (e.key === 'Backspace' || e.key === 'Delete') {
                var r = selectedCell[0], c = selectedCell[1];
                userGrid[r][c] = 0;
                cells[r][c].textContent = '';
                cells[r][c].style.color = '#fff';
            }
        }
        document.addEventListener('keydown', onKeydown);

        var numPad = document.createElement('div');
        numPad.style.cssText = 'display:flex;gap:6px;margin-top:12px;flex-wrap:wrap;justify-content:center;';
        for (var n = 1; n <= 9; n++) {
            (function(num) {
                var btn = document.createElement('button');
                btn.textContent = num;
                btn.style.cssText = 'width:40px;height:40px;font-family:"Press Start 2P",monospace;font-size:14px;background:#1a1a2e;color:#00f0ff;border:1px solid #00f0ff;border-radius:6px;cursor:pointer;';
                btn.addEventListener('click', function() {
                    if (gameOver || !selectedCell) return;
                    var r = selectedCell[0], c = selectedCell[1];
                    userGrid[r][c] = num;
                    cells[r][c].textContent = num;
                    if (num !== solved[r][c]) {
                        cells[r][c].style.color = '#ff00aa';
                    } else {
                        cells[r][c].style.color = '#00ff88';
                    }
                    checkCompletion();
                });
                numPad.appendChild(btn);
            })(n);
        }
        var clearBtn = document.createElement('button');
        clearBtn.textContent = '✕';
        clearBtn.style.cssText = 'width:40px;height:40px;font-size:16px;background:#1a1a2e;color:#ff00aa;border:1px solid #ff00aa;border-radius:6px;cursor:pointer;';
        clearBtn.addEventListener('click', function() {
            if (gameOver || !selectedCell) return;
            var r = selectedCell[0], c = selectedCell[1];
            userGrid[r][c] = 0;
            cells[r][c].textContent = '';
            cells[r][c].style.color = '#fff';
        });
        numPad.appendChild(clearBtn);
        wrapper.appendChild(numPad);

        function checkCompletion() {
            for (var r = 0; r < 9; r++)
                for (var c = 0; c < 9; c++)
                    if (userGrid[r][c] === 0) return;

            var correct = true;
            for (var r = 0; r < 9; r++)
                for (var c = 0; c < 9; c++)
                    if (userGrid[r][c] !== solved[r][c]) correct = false;

            if (correct) {
                gameOver = true;
                var elapsed = (Date.now() - startTime) / 1000;
                var timeBonus = Math.max(0, Math.floor(300 - elapsed));
                score = 100 + timeBonus;
                callbacks.onScore(score);
                callbacks.onGameOver(score);
                showEndScreen('PARABÉNS!', '#00ff88');
            } else {
                for (var r = 0; r < 9; r++) {
                    for (var c = 0; c < 9; c++) {
                        if (!fixed[r][c] && userGrid[r][c] !== 0 && userGrid[r][c] !== solved[r][c]) {
                            cells[r][c].style.color = '#ff00aa';
                        }
                    }
                }
            }
        }

        var restartBtn = null;
        function showEndScreen(msg, color) {
            var overlay = document.createElement('div');
            overlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(10,10,26,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10;';
            overlay.innerHTML = '<div style="font-family:\'Press Start 2P\',monospace;font-size:20px;color:' + color + ';margin-bottom:12px;">' + msg + '</div><div style="font-family:\'Press Start 2P\',monospace;font-size:14px;color:#00f0ff;">Pontos: ' + score + '</div>';
            wrapper.style.position = 'relative';
            wrapper.appendChild(overlay);

            restartBtn = document.createElement('button');
            restartBtn.textContent = 'Reiniciar';
            restartBtn.style.cssText = 'display:block;margin:16px auto;padding:10px 32px;font-family:"Press Start 2P",monospace;font-size:14px;background:#ff00aa;color:#fff;border:none;border-radius:6px;cursor:pointer;';
            restartBtn.addEventListener('click', function() {
                container.innerHTML = '';
                var newInstance = window.Games['sudoku'](container, callbacks);
                currentDestroy = newInstance.destroy;
            });
            overlay.appendChild(restartBtn);
        }

        var currentDestroy = function() {
            document.removeEventListener('keydown', onKeydown);
        };

        return {
            destroy: function() {
                currentDestroy();
            }
        };
    };
})();
