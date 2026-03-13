(function(){
    window.Games = window.Games || {};
    window.Games['blackjack'] = function(container, callbacks) {
        var destroyed = false;
        var wins = 0;
        var deck = [];
        var playerHand = [];
        var dealerHand = [];
        var gameActive = false;
        var roundOver = false;
        var suits = ['\u2660', '\u2665', '\u2666', '\u2663'];
        var suitColors = { '\u2660': '#e8e8f0', '\u2665': '#ff00aa', '\u2666': '#ff00aa', '\u2663': '#e8e8f0' };
        var values = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;user-select:none;width:100%;max-width:500px;';
        container.appendChild(wrapper);

        var infoEl = document.createElement('div');
        infoEl.style.cssText = 'font-family:"Press Start 2P",cursive;font-size:12px;color:#00f0ff;';
        infoEl.textContent = 'Vitórias: 0';
        wrapper.appendChild(infoEl);

        var dealerArea = document.createElement('div');
        dealerArea.style.cssText = 'text-align:center;width:100%;';
        wrapper.appendChild(dealerArea);

        var dealerLabel = document.createElement('div');
        dealerLabel.style.cssText = 'font-size:13px;color:#8888aa;margin-bottom:8px;font-weight:600;';
        dealerLabel.textContent = 'Dealer';
        dealerArea.appendChild(dealerLabel);

        var dealerCards = document.createElement('div');
        dealerCards.style.cssText = 'display:flex;gap:8px;justify-content:center;min-height:120px;align-items:center;flex-wrap:wrap;';
        dealerArea.appendChild(dealerCards);

        var dealerScore = document.createElement('div');
        dealerScore.style.cssText = 'font-size:14px;color:#ffcc00;margin-top:6px;font-weight:700;';
        dealerArea.appendChild(dealerScore);

        var messageEl = document.createElement('div');
        messageEl.style.cssText = 'font-family:"Press Start 2P",cursive;font-size:14px;color:#ff00aa;min-height:24px;text-align:center;';
        wrapper.appendChild(messageEl);

        var playerArea = document.createElement('div');
        playerArea.style.cssText = 'text-align:center;width:100%;';
        wrapper.appendChild(playerArea);

        var playerLabel = document.createElement('div');
        playerLabel.style.cssText = 'font-size:13px;color:#8888aa;margin-bottom:8px;font-weight:600;';
        playerLabel.textContent = 'Jogador';
        playerArea.appendChild(playerLabel);

        var playerCards = document.createElement('div');
        playerCards.style.cssText = 'display:flex;gap:8px;justify-content:center;min-height:120px;align-items:center;flex-wrap:wrap;';
        playerArea.appendChild(playerCards);

        var playerScoreEl = document.createElement('div');
        playerScoreEl.style.cssText = 'font-size:14px;color:#ffcc00;margin-top:6px;font-weight:700;';
        playerArea.appendChild(playerScoreEl);

        var btns = document.createElement('div');
        btns.style.cssText = 'display:flex;gap:12px;margin-top:8px;';
        wrapper.appendChild(btns);

        var hitBtn = document.createElement('button');
        hitBtn.className = 'btn btn-play';
        hitBtn.textContent = 'Pedir';
        hitBtn.style.minWidth = '100px';
        hitBtn.addEventListener('click', function() { if (gameActive && !roundOver) hit(); });
        btns.appendChild(hitBtn);

        var standBtn = document.createElement('button');
        standBtn.className = 'btn btn-secondary';
        standBtn.textContent = 'Parar';
        standBtn.style.minWidth = '100px';
        standBtn.addEventListener('click', function() { if (gameActive && !roundOver) stand(); });
        btns.appendChild(standBtn);

        var newRoundBtn = document.createElement('button');
        newRoundBtn.className = 'btn btn-buy';
        newRoundBtn.textContent = 'Nova Rodada';
        newRoundBtn.style.minWidth = '120px';
        newRoundBtn.style.display = 'none';
        newRoundBtn.addEventListener('click', function() { startRound(); });
        btns.appendChild(newRoundBtn);

        function createDeck() {
            deck = [];
            for (var s = 0; s < suits.length; s++) {
                for (var v = 0; v < values.length; v++) {
                    deck.push({ suit: suits[s], value: values[v] });
                }
            }
            for (var i = deck.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
            }
        }

        function drawCard() {
            if (deck.length === 0) createDeck();
            return deck.pop();
        }

        function cardValue(card) {
            if (card.value === 'A') return 11;
            if (['K','Q','J'].indexOf(card.value) >= 0) return 10;
            return parseInt(card.value);
        }

        function handScore(hand) {
            var total = 0;
            var aces = 0;
            for (var i = 0; i < hand.length; i++) {
                total += cardValue(hand[i]);
                if (hand[i].value === 'A') aces++;
            }
            while (total > 21 && aces > 0) {
                total -= 10;
                aces--;
            }
            return total;
        }

        function renderCard(card, hidden) {
            var el = document.createElement('div');
            if (hidden) {
                el.style.cssText = 'width:70px;height:100px;background:linear-gradient(135deg,#2a2a5a,#1a1a3e);border:2px solid #00f0ff;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:28px;';
                el.textContent = '?';
                el.style.color = '#00f0ff';
            } else {
                var color = suitColors[card.suit] || '#e8e8f0';
                el.style.cssText = 'width:70px;height:100px;background:#12122a;border:2px solid #2a2a5a;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;';
                var valSpan = document.createElement('span');
                valSpan.style.cssText = 'font-size:18px;font-weight:700;color:' + color + ';';
                valSpan.textContent = card.value;
                var suitSpan = document.createElement('span');
                suitSpan.style.cssText = 'font-size:20px;color:' + color + ';';
                suitSpan.textContent = card.suit;
                el.appendChild(valSpan);
                el.appendChild(suitSpan);
            }
            return el;
        }

        function renderHands(showDealerAll) {
            dealerCards.innerHTML = '';
            for (var i = 0; i < dealerHand.length; i++) {
                var hidden = (i === 0 && !showDealerAll);
                dealerCards.appendChild(renderCard(dealerHand[i], hidden));
            }
            if (showDealerAll) {
                dealerScore.textContent = 'Total: ' + handScore(dealerHand);
            } else {
                dealerScore.textContent = 'Total: ?';
            }

            playerCards.innerHTML = '';
            for (var j = 0; j < playerHand.length; j++) {
                playerCards.appendChild(renderCard(playerHand[j], false));
            }
            playerScoreEl.textContent = 'Total: ' + handScore(playerHand);
        }

        function startRound() {
            if (destroyed) return;
            playerHand = [];
            dealerHand = [];
            roundOver = false;
            gameActive = true;
            messageEl.textContent = '';
            hitBtn.style.display = '';
            standBtn.style.display = '';
            newRoundBtn.style.display = 'none';

            if (deck.length < 10) createDeck();

            playerHand.push(drawCard());
            dealerHand.push(drawCard());
            playerHand.push(drawCard());
            dealerHand.push(drawCard());

            renderHands(false);

            if (handScore(playerHand) === 21) {
                endRound('Blackjack! Você ganhou!', true);
            }
        }

        function hit() {
            playerHand.push(drawCard());
            renderHands(false);
            if (handScore(playerHand) > 21) {
                endRound('Estourou! Você perdeu.', false);
            } else if (handScore(playerHand) === 21) {
                stand();
            }
        }

        function stand() {
            renderHands(true);
            while (handScore(dealerHand) < 17) {
                dealerHand.push(drawCard());
            }
            renderHands(true);

            var ps = handScore(playerHand);
            var ds = handScore(dealerHand);

            if (ds > 21) {
                endRound('Dealer estourou! Você ganhou!', true);
            } else if (ps > ds) {
                endRound('Você ganhou!', true);
            } else if (ps < ds) {
                endRound('Dealer ganhou.', false);
            } else {
                endRound('Empate!', false);
            }
        }

        function endRound(msg, win) {
            roundOver = true;
            renderHands(true);
            messageEl.textContent = msg;
            messageEl.style.color = win ? '#00ff88' : '#ff00aa';
            hitBtn.style.display = 'none';
            standBtn.style.display = 'none';
            newRoundBtn.style.display = '';

            if (win) {
                wins++;
                infoEl.textContent = 'Vitórias: ' + wins;
                callbacks.onScore(wins * 20);
            }
        }

        var endGameBtn = document.createElement('button');
        endGameBtn.className = 'btn btn-danger';
        endGameBtn.textContent = 'Encerrar Jogo';
        endGameBtn.style.cssText = 'margin-top:12px;font-size:12px;';
        endGameBtn.addEventListener('click', function() {
            gameActive = false;
            var finalScore = wins * 20;

            var overlay = document.createElement('div');
            overlay.className = 'game-over-screen';
            overlay.innerHTML = '<h2>Fim de Jogo!</h2>' +
                '<p>Vitórias: ' + wins + '</p>' +
                '<p>Pontuação: ' + finalScore + '</p>' +
                '<button class="btn btn-play" style="margin-top:12px;">Reiniciar</button>';
            overlay.querySelector('button').addEventListener('click', function() {
                container.innerHTML = '';
                window.Games['blackjack'](container, callbacks);
            });
            container.appendChild(overlay);

            callbacks.onGameOver(finalScore);
        });
        wrapper.appendChild(endGameBtn);

        createDeck();
        startRound();

        return {
            destroy: function() {
                destroyed = true;
                container.innerHTML = '';
            }
        };
    };
})();
