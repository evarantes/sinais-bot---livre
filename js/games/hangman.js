(function(){
    window.Games = window.Games || {};
    window.Games['hangman'] = function(container, callbacks) {
        var WORDS = [
            'PYTHON','JAVASCRIPT','PROGRAMADOR','COMPUTADOR','INTERNET',
            'TECLADO','MONITOR','CELULAR','ARQUIVO','SISTEMA',
            'CODIGO','BROWSER','DIGITAL','SERVIDOR','MEMORIA',
            'HARDWARE','SOFTWARE','ANDROID','CONSOLE','DESKTOP',
            'WIRELESS','NETWORK','PIXEL','ROUTER','BACKUP',
            'CURSOR','DELETE','DRIVER','FOLDER','TABLET',
            'BANCO','DADOS','LINUX','GITHUB','CLOUD'
        ];

        var word = '';
        var guessed = [];
        var wrong = 0;
        var maxWrong = 6;
        var gameOver = false;
        var won = false;
        var score = 0;

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:16px;padding:16px;';
        container.appendChild(wrapper);

        var canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 220;
        canvas.style.cssText = 'background:#0a0a1a;border-radius:8px;border:1px solid #2a2a5a;';
        wrapper.appendChild(canvas);
        var ctx = canvas.getContext('2d');

        var wordDisplay = document.createElement('div');
        wordDisplay.style.cssText = 'font-family:"Press Start 2P",monospace;font-size:20px;letter-spacing:8px;color:#00f0ff;text-shadow:0 0 10px #00f0ff66;';
        wrapper.appendChild(wordDisplay);

        var wrongDisplay = document.createElement('div');
        wrongDisplay.style.cssText = 'font-family:monospace;font-size:14px;color:#ff00aa;';
        wrapper.appendChild(wrongDisplay);

        var keyboard = document.createElement('div');
        keyboard.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:center;gap:6px;max-width:400px;';
        wrapper.appendChild(keyboard);

        var keyButtons = {};

        function init() {
            word = WORDS[Math.floor(Math.random() * WORDS.length)];
            guessed = [];
            wrong = 0;
            gameOver = false;
            won = false;
            score = 0;
            createKeyboard();
            renderWord();
            renderHangman();
            wrongDisplay.textContent = '';
        }

        function createKeyboard() {
            keyboard.innerHTML = '';
            keyButtons = {};
            var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (var i = 0; i < letters.length; i++) {
                var btn = document.createElement('button');
                btn.textContent = letters[i];
                btn.dataset.letter = letters[i];
                btn.style.cssText = 'width:38px;height:38px;border:1px solid #2a2a5a;background:#1a1a3e;color:#e8e8f0;border-radius:6px;font-family:monospace;font-size:16px;font-weight:bold;cursor:pointer;transition:all 0.2s;';
                btn.addEventListener('click', onLetterClick);
                btn.addEventListener('mouseenter', function() {
                    if (!this.disabled) this.style.background = '#2a2a5a';
                });
                btn.addEventListener('mouseleave', function() {
                    if (!this.disabled) this.style.background = '#1a1a3e';
                });
                keyboard.appendChild(btn);
                keyButtons[letters[i]] = btn;
            }
        }

        function onLetterClick(e) {
            if (gameOver) return;
            var letter = e.currentTarget.dataset.letter;
            if (guessed.indexOf(letter) !== -1) return;
            guessed.push(letter);

            e.currentTarget.disabled = true;
            e.currentTarget.style.cursor = 'default';

            if (word.indexOf(letter) === -1) {
                wrong++;
                e.currentTarget.style.background = '#3a1020';
                e.currentTarget.style.borderColor = '#ff00aa';
                e.currentTarget.style.color = '#ff00aa';
            } else {
                e.currentTarget.style.background = '#0a3020';
                e.currentTarget.style.borderColor = '#00ff88';
                e.currentTarget.style.color = '#00ff88';
            }

            renderWord();
            renderHangman();

            var wrongLetters = guessed.filter(function(l) { return word.indexOf(l) === -1; });
            wrongDisplay.textContent = 'Erros: ' + wrongLetters.join(', ');

            if (wrong >= maxWrong) {
                gameOver = true;
                won = false;
                revealWord();
                showGameOverScreen();
                callbacks.onGameOver(score);
            } else if (isWon()) {
                gameOver = true;
                won = true;
                var remaining = word.length - guessed.filter(function(l) { return word.indexOf(l) !== -1; }).length;
                score = Math.max(remaining, 0) * 10 + (maxWrong - wrong) * 10;
                callbacks.onScore(score);
                showGameOverScreen();
                callbacks.onGameOver(score);
            }
        }

        function onKeyPress(e) {
            if (gameOver) return;
            var key = e.key.toUpperCase();
            if (key.length === 1 && key >= 'A' && key <= 'Z' && keyButtons[key] && !keyButtons[key].disabled) {
                keyButtons[key].click();
            }
        }
        document.addEventListener('keydown', onKeyPress);

        function renderWord() {
            var display = '';
            for (var i = 0; i < word.length; i++) {
                if (guessed.indexOf(word[i]) !== -1) {
                    display += word[i];
                } else {
                    display += '_';
                }
            }
            wordDisplay.textContent = display;
        }

        function revealWord() {
            wordDisplay.textContent = word;
            wordDisplay.style.color = '#ff00aa';
        }

        function isWon() {
            for (var i = 0; i < word.length; i++) {
                if (guessed.indexOf(word[i]) === -1) return false;
            }
            return true;
        }

        function renderHangman() {
            ctx.clearRect(0, 0, 200, 220);
            ctx.strokeStyle = '#2a2a5a';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';

            ctx.beginPath(); ctx.moveTo(30, 200); ctx.lineTo(170, 200); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(60, 200); ctx.lineTo(60, 30); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(60, 30); ctx.lineTo(130, 30); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(130, 30); ctx.lineTo(130, 50); ctx.stroke();

            ctx.strokeStyle = '#ff00aa';
            ctx.lineWidth = 2;

            if (wrong >= 1) {
                ctx.beginPath(); ctx.arc(130, 65, 15, 0, Math.PI * 2); ctx.stroke();
            }
            if (wrong >= 2) {
                ctx.beginPath(); ctx.moveTo(130, 80); ctx.lineTo(130, 140); ctx.stroke();
            }
            if (wrong >= 3) {
                ctx.beginPath(); ctx.moveTo(130, 95); ctx.lineTo(105, 120); ctx.stroke();
            }
            if (wrong >= 4) {
                ctx.beginPath(); ctx.moveTo(130, 95); ctx.lineTo(155, 120); ctx.stroke();
            }
            if (wrong >= 5) {
                ctx.beginPath(); ctx.moveTo(130, 140); ctx.lineTo(105, 175); ctx.stroke();
            }
            if (wrong >= 6) {
                ctx.beginPath(); ctx.moveTo(130, 140); ctx.lineTo(155, 175); ctx.stroke();
            }
        }

        function showGameOverScreen() {
            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
            var title = document.createElement('h2');
            title.textContent = won ? 'Você Venceu!' : 'Game Over!';
            title.style.color = won ? '#00ff88' : '#ff00aa';
            var wordTxt = document.createElement('p');
            wordTxt.textContent = 'Palavra: ' + word;
            wordTxt.style.cssText = 'color:#00f0ff;font-family:"Press Start 2P",monospace;font-size:14px;';
            var scoreTxt = document.createElement('p');
            scoreTxt.textContent = 'Pontuação: ' + score;
            scoreTxt.style.color = '#ffcc00';
            var btn = document.createElement('button');
            btn.textContent = 'Reiniciar';
            btn.className = 'btn btn-play';
            btn.style.marginTop = '12px';
            btn.addEventListener('click', restartGame);
            overlay.appendChild(title);
            overlay.appendChild(wordTxt);
            overlay.appendChild(scoreTxt);
            overlay.appendChild(btn);
            container.appendChild(overlay);
        }

        function restartGame() {
            var ovl = container.querySelector('.game-over-screen');
            if (ovl) ovl.remove();
            wordDisplay.style.color = '#00f0ff';
            callbacks.onScore(0);
            init();
        }

        init();

        return {
            destroy: function() {
                document.removeEventListener('keydown', onKeyPress);
            }
        };
    };
})();
