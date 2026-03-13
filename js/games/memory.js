(function(){
    window.Games = window.Games || {};
    window.Games['memory'] = function(container, callbacks) {
        var PAIRS = 8;
        var EMOJIS = ['🎮','🎲','🎯','🎪','🚀','⭐','🌙','🔥'];
        var cards, flipped, matched, score, moves, startTime, gameOver, lockBoard;
        var wrapper, gridEl, statusEl, gameOverDiv;
        var flipTimeout = null;

        var style = document.createElement('style');
        style.textContent = [
            '.memory-card{width:80px;height:80px;perspective:600px;cursor:pointer;display:inline-block;}',
            '.memory-card-inner{position:relative;width:100%;height:100%;transition:transform 0.5s;transform-style:preserve-3d;}',
            '.memory-card.flipped .memory-card-inner{transform:rotateY(180deg);}',
            '.memory-card-front,.memory-card-back{position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:32px;border:2px solid #2a2a5a;}',
            '.memory-card-back{background:#1a1a3e;color:#00f0ff;font-size:24px;}',
            '.memory-card-front{background:linear-gradient(135deg,#1a1a3e,#222260);transform:rotateY(180deg);}',
            '.memory-card.matched .memory-card-inner{opacity:0.6;}',
            '.memory-card.matched .memory-card-front{border-color:#00ff88;box-shadow:0 0 10px rgba(0,255,136,0.3);}',
        ].join('\n');
        container.appendChild(style);

        wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:16px;';
        container.appendChild(wrapper);

        statusEl = document.createElement('div');
        statusEl.style.cssText = 'font-family:"Press Start 2P",cursive;font-size:12px;color:#00f0ff;display:flex;gap:24px;';
        wrapper.appendChild(statusEl);

        gridEl = document.createElement('div');
        gridEl.style.cssText = 'display:grid;grid-template-columns:repeat(4,80px);gap:8px;';
        wrapper.appendChild(gridEl);

        function init() {
            var emojis = EMOJIS.slice(0, PAIRS);
            cards = emojis.concat(emojis);
            shuffle(cards);
            flipped = [];
            matched = [];
            score = 0;
            moves = 0;
            gameOver = false;
            lockBoard = false;
            startTime = Date.now();
            if (gameOverDiv) { gameOverDiv.remove(); gameOverDiv = null; }
            if (flipTimeout) { clearTimeout(flipTimeout); flipTimeout = null; }
            callbacks.onScore(0);
            render();
        }

        function shuffle(arr) {
            for (var i = arr.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
            }
        }

        function render() {
            gridEl.innerHTML = '';
            for (var i = 0; i < cards.length; i++) {
                var card = document.createElement('div');
                card.className = 'memory-card';
                card.dataset.index = i;
                if (matched.indexOf(i) !== -1) card.classList.add('flipped', 'matched');
                if (flipped.indexOf(i) !== -1) card.classList.add('flipped');

                var inner = document.createElement('div');
                inner.className = 'memory-card-inner';

                var back = document.createElement('div');
                back.className = 'memory-card-back';
                back.textContent = '?';

                var front = document.createElement('div');
                front.className = 'memory-card-front';
                front.textContent = cards[i];

                inner.appendChild(back);
                inner.appendChild(front);
                card.appendChild(inner);
                card.addEventListener('click', onCardClick);
                gridEl.appendChild(card);
            }
            updateStatus();
        }

        function updateStatus() {
            var elapsed = Math.floor((Date.now() - startTime) / 1000);
            statusEl.innerHTML = '<span>Pares: ' + (matched.length / 2) + '/' + PAIRS + '</span><span>Jogadas: ' + moves + '</span><span>Tempo: ' + elapsed + 's</span>';
        }

        var statusInterval = setInterval(function() {
            if (!gameOver) updateStatus();
        }, 1000);

        function onCardClick(e) {
            if (gameOver || lockBoard) return;
            var el = e.currentTarget;
            var idx = parseInt(el.dataset.index);
            if (flipped.indexOf(idx) !== -1 || matched.indexOf(idx) !== -1) return;

            flipped.push(idx);
            el.classList.add('flipped');

            if (flipped.length === 2) {
                moves++;
                lockBoard = true;
                var i0 = flipped[0], i1 = flipped[1];
                if (cards[i0] === cards[i1]) {
                    matched.push(i0, i1);
                    flipped = [];
                    lockBoard = false;
                    score = (matched.length / 2) * 10;
                    callbacks.onScore(score);

                    var matchedEls = gridEl.querySelectorAll('.memory-card');
                    matchedEls[i0].classList.add('matched');
                    matchedEls[i1].classList.add('matched');

                    if (matched.length === cards.length) {
                        endGame();
                    }
                } else {
                    flipTimeout = setTimeout(function() {
                        var allCards = gridEl.querySelectorAll('.memory-card');
                        allCards[i0].classList.remove('flipped');
                        allCards[i1].classList.remove('flipped');
                        flipped = [];
                        lockBoard = false;
                    }, 800);
                }
                updateStatus();
            }
        }

        function endGame() {
            gameOver = true;
            var elapsed = Math.floor((Date.now() - startTime) / 1000);
            var timeBonus = Math.max(0, 100 - elapsed);
            var finalScore = score + timeBonus;
            callbacks.onScore(finalScore);
            callbacks.onGameOver(finalScore);
            showGameOver(finalScore, elapsed);
        }

        function showGameOver(finalScore, time) {
            gameOverDiv = document.createElement('div');
            gameOverDiv.style.cssText = 'text-align:center;margin-top:16px;';
            gameOverDiv.innerHTML = '<div style="font-family:\'Press Start 2P\',cursive;font-size:14px;color:#00ff88;margin-bottom:8px;">Parabéns!</div>' +
                '<div style="color:#ffcc00;font-size:14px;margin-bottom:4px;">Pontuação: ' + finalScore + '</div>' +
                '<div style="color:#8888aa;font-size:12px;margin-bottom:12px;">Tempo: ' + time + 's | Jogadas: ' + moves + '</div>';
            var btn = document.createElement('button');
            btn.className = 'btn btn-play';
            btn.textContent = 'Reiniciar';
            btn.addEventListener('click', function() { init(); });
            gameOverDiv.appendChild(btn);
            wrapper.appendChild(gameOverDiv);
        }

        init();

        return {
            destroy: function() {
                clearInterval(statusInterval);
                if (flipTimeout) clearTimeout(flipTimeout);
                if (style.parentNode) style.parentNode.removeChild(style);
                if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
            }
        };
    };
})();
