(function(){
    window.Games = window.Games || {};
    window.Games['whackamole'] = function(container, callbacks) {
        var score = 0;
        var timeLeft = 30;
        var intervals = [];
        var timeouts = [];
        var destroyed = false;
        var moleSpeed = 1500;

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:16px;user-select:none;';
        container.appendChild(wrapper);

        var timerEl = document.createElement('div');
        timerEl.style.cssText = 'font-family:"Press Start 2P",cursive;font-size:16px;color:#00f0ff;';
        timerEl.textContent = 'Tempo: 30s';
        wrapper.appendChild(timerEl);

        var grid = document.createElement('div');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,80px);gap:12px;';
        wrapper.appendChild(grid);

        var holes = [];
        for (var i = 0; i < 9; i++) {
            var hole = document.createElement('div');
            hole.style.cssText = 'width:80px;height:80px;background:#1a1a3e;border:2px solid #2a2a5a;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.15s;position:relative;overflow:hidden;';
            hole.dataset.idx = i;
            hole.dataset.mole = '0';

            var moleSpan = document.createElement('span');
            moleSpan.style.cssText = 'font-size:40px;opacity:0;transform:translateY(40px);transition:all 0.2s ease;position:absolute;';
            moleSpan.textContent = '\uD83D\uDC39';
            hole.appendChild(moleSpan);

            hole.addEventListener('click', function(e) {
                var h = this;
                if (h.dataset.mole === '1') {
                    h.dataset.mole = '0';
                    var sp = h.querySelector('span');
                    sp.style.opacity = '0';
                    sp.style.transform = 'translateY(40px)';
                    h.style.background = '#00ff88';
                    var resetTimeout = setTimeout(function() {
                        if (!destroyed) h.style.background = '#1a1a3e';
                    }, 200);
                    timeouts.push(resetTimeout);
                    score += 10;
                    callbacks.onScore(score);
                }
            });

            grid.appendChild(hole);
            holes.push(hole);
        }

        function showMole() {
            if (destroyed) return;
            var available = holes.filter(function(h) { return h.dataset.mole === '0'; });
            if (available.length === 0) return;
            var hole = available[Math.floor(Math.random() * available.length)];
            hole.dataset.mole = '1';
            var sp = hole.querySelector('span');
            sp.style.opacity = '1';
            sp.style.transform = 'translateY(0)';

            var duration = 800 + Math.random() * (moleSpeed - 300);
            var hideTimeout = setTimeout(function() {
                if (!destroyed && hole.dataset.mole === '1') {
                    hole.dataset.mole = '0';
                    sp.style.opacity = '0';
                    sp.style.transform = 'translateY(40px)';
                }
            }, duration);
            timeouts.push(hideTimeout);
        }

        var moleInterval = setInterval(function() {
            showMole();
            if (timeLeft < 15) showMole();
        }, 700);
        intervals.push(moleInterval);

        var timerInterval = setInterval(function() {
            if (destroyed) return;
            timeLeft--;
            timerEl.textContent = 'Tempo: ' + timeLeft + 's';

            if (timeLeft <= 10) moleSpeed = 900;
            if (timeLeft <= 5) moleSpeed = 600;

            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
        intervals.push(timerInterval);

        function endGame() {
            if (destroyed) return;
            clearAllTimers();

            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
            overlay.innerHTML = '<h2>Fim de Jogo!</h2>' +
                '<p>Pontuação: ' + score + '</p>' +
                '<button class="btn btn-play" style="margin-top:12px;">Reiniciar</button>';
            overlay.querySelector('button').addEventListener('click', function() {
                container.innerHTML = '';
                window.Games['whackamole'](container, callbacks);
            });
            container.appendChild(overlay);

            callbacks.onGameOver(score);
        }

        function clearAllTimers() {
            intervals.forEach(function(id) { clearInterval(id); });
            timeouts.forEach(function(id) { clearTimeout(id); });
            intervals = [];
            timeouts = [];
        }

        return {
            destroy: function() {
                destroyed = true;
                clearAllTimers();
                container.innerHTML = '';
            }
        };
    };
})();
