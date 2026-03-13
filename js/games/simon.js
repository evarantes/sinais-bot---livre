(function(){
    window.Games = window.Games || {};
    window.Games['simon'] = function(container, callbacks) {
        var COLORS = [
            { id: 'red', base: '#882222', flash: '#ff4444', glow: '#ff444488' },
            { id: 'blue', base: '#222288', flash: '#4444ff', glow: '#4444ff88' },
            { id: 'green', base: '#228822', flash: '#44ff44', glow: '#44ff4488' },
            { id: 'yellow', base: '#888822', flash: '#ffff44', glow: '#ffff4488' }
        ];

        var pattern = [];
        var playerIndex = 0;
        var round = 0;
        var score = 0;
        var gameOver = false;
        var isShowingPattern = false;
        var timeouts = [];

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:20px;padding:24px;';
        container.appendChild(wrapper);

        var roundDisplay = document.createElement('div');
        roundDisplay.style.cssText = 'font-family:"Press Start 2P",monospace;font-size:14px;color:#00f0ff;';
        roundDisplay.textContent = 'Pressione Iniciar';
        wrapper.appendChild(roundDisplay);

        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:150px 150px;grid-template-rows:150px 150px;gap:12px;';
        wrapper.appendChild(grid);

        var buttons = [];
        for (var i = 0; i < 4; i++) {
            var btn = document.createElement('div');
            btn.dataset.index = i;
            btn.style.cssText = 'width:150px;height:150px;border-radius:16px;cursor:pointer;transition:all 0.15s;border:3px solid #2a2a5a;display:flex;align-items:center;justify-content:center;';
            btn.style.background = COLORS[i].base;
            btn.addEventListener('click', onButtonClick);
            btn.addEventListener('mousedown', function() { if (!isShowingPattern && !gameOver) this.style.transform = 'scale(0.95)'; });
            btn.addEventListener('mouseup', function() { this.style.transform = 'scale(1)'; });
            grid.appendChild(btn);
            buttons.push(btn);
        }

        var startBtn = document.createElement('button');
        startBtn.textContent = 'Iniciar';
        startBtn.className = 'btn btn-play';
        startBtn.style.cssText += 'font-size:16px;padding:12px 32px;';
        startBtn.addEventListener('click', startGame);
        wrapper.appendChild(startBtn);

        function startGame() {
            pattern = [];
            playerIndex = 0;
            round = 0;
            score = 0;
            gameOver = false;
            callbacks.onScore(0);
            startBtn.style.display = 'none';
            nextRound();
        }

        function nextRound() {
            round++;
            playerIndex = 0;
            roundDisplay.textContent = 'Rodada ' + round;
            pattern.push(Math.floor(Math.random() * 4));
            showPattern();
        }

        function showPattern() {
            isShowingPattern = true;
            var delay = 0;

            for (var i = 0; i < pattern.length; i++) {
                (function(idx) {
                    var t1 = setTimeout(function() { flashButton(pattern[idx]); }, delay);
                    timeouts.push(t1);
                    delay += 600;
                    var t2 = setTimeout(function() { unflashButton(pattern[idx]); }, delay);
                    timeouts.push(t2);
                    delay += 200;
                })(i);
            }

            var t3 = setTimeout(function() {
                isShowingPattern = false;
                roundDisplay.textContent = 'Sua vez! (' + round + ')';
            }, delay);
            timeouts.push(t3);
        }

        function flashButton(idx) {
            buttons[idx].style.background = COLORS[idx].flash;
            buttons[idx].style.boxShadow = '0 0 30px ' + COLORS[idx].glow + ', inset 0 0 20px ' + COLORS[idx].glow;
            buttons[idx].style.borderColor = COLORS[idx].flash;
        }

        function unflashButton(idx) {
            buttons[idx].style.background = COLORS[idx].base;
            buttons[idx].style.boxShadow = 'none';
            buttons[idx].style.borderColor = '#2a2a5a';
        }

        function onButtonClick(e) {
            if (isShowingPattern || gameOver) return;
            var idx = parseInt(e.currentTarget.dataset.index);

            flashButton(idx);
            var t = setTimeout(function() { unflashButton(idx); }, 200);
            timeouts.push(t);

            if (pattern[playerIndex] === idx) {
                playerIndex++;
                if (playerIndex === pattern.length) {
                    score = round * 10;
                    callbacks.onScore(score);
                    var t2 = setTimeout(function() { nextRound(); }, 800);
                    timeouts.push(t2);
                }
            } else {
                gameOver = true;
                roundDisplay.textContent = 'Errou!';
                showGameOverScreen();
                callbacks.onGameOver(score);
            }
        }

        function showGameOverScreen() {
            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
            var title = document.createElement('h2');
            title.textContent = 'Game Over!';
            title.style.color = '#ff00aa';
            var roundTxt = document.createElement('p');
            roundTxt.textContent = 'Rodadas: ' + (round - 1);
            roundTxt.style.cssText = 'color:#00f0ff;font-family:"Press Start 2P",monospace;font-size:14px;';
            var scoreTxt = document.createElement('p');
            scoreTxt.textContent = 'Pontuação: ' + score;
            scoreTxt.style.color = '#ffcc00';
            var btn = document.createElement('button');
            btn.textContent = 'Reiniciar';
            btn.className = 'btn btn-play';
            btn.style.marginTop = '12px';
            btn.addEventListener('click', restartGame);
            overlay.appendChild(title);
            overlay.appendChild(roundTxt);
            overlay.appendChild(scoreTxt);
            overlay.appendChild(btn);
            container.appendChild(overlay);
        }

        function restartGame() {
            var ovl = container.querySelector('.game-over-screen');
            if (ovl) ovl.remove();
            for (var i = 0; i < timeouts.length; i++) clearTimeout(timeouts[i]);
            timeouts = [];
            for (var i = 0; i < 4; i++) unflashButton(i);
            startBtn.style.display = '';
            roundDisplay.textContent = 'Pressione Iniciar';
            callbacks.onScore(0);
            pattern = [];
            playerIndex = 0;
            round = 0;
            score = 0;
            gameOver = false;
            isShowingPattern = false;
        }

        return {
            destroy: function() {
                for (var i = 0; i < timeouts.length; i++) clearTimeout(timeouts[i]);
                for (var i = 0; i < buttons.length; i++) {
                    buttons[i].removeEventListener('click', onButtonClick);
                }
            }
        };
    };
})();
