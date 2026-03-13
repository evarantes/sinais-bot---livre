(function(){
    window.Games = window.Games || {};
    window.Games['solitaire'] = function(container, callbacks) {
        var score = 0;
        var gameOver = false;
        var restartBtn = null;

        var SUITS = ['♠', '♥', '♦', '♣'];
        var SUIT_COLORS = { '♠': '#00f0ff', '♣': '#00f0ff', '♥': '#ff00aa', '♦': '#ff00aa' };
        var RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

        var stock = [];
        var waste = [];
        var foundations = [[], [], [], []];
        var tableau = [[], [], [], [], [], [], []];
        var selectedCards = null;
        var selectedSource = null;

        function createDeck() {
            var deck = [];
            for (var s = 0; s < 4; s++) {
                for (var r = 0; r < 13; r++) {
                    deck.push({ suit: SUITS[s], rank: RANKS[r], value: r + 1, faceUp: false });
                }
            }
            return shuffle(deck);
        }

        function shuffle(arr) {
            for (var i = arr.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
            }
            return arr;
        }

        function isRed(card) { return card.suit === '♥' || card.suit === '♦'; }

        function canPlaceOnTableau(card, targetPile) {
            if (targetPile.length === 0) return card.rank === 'K';
            var top = targetPile[targetPile.length - 1];
            if (!top.faceUp) return false;
            return isRed(card) !== isRed(top) && card.value === top.value - 1;
        }

        function canPlaceOnFoundation(card, foundIdx) {
            var pile = foundations[foundIdx];
            if (pile.length === 0) return card.rank === 'A';
            var top = pile[pile.length - 1];
            return card.suit === top.suit && card.value === top.value + 1;
        }

        function deal() {
            var deck = createDeck();
            stock = []; waste = [];
            foundations = [[], [], [], []];
            tableau = [[], [], [], [], [], [], []];
            for (var i = 0; i < 7; i++) {
                for (var j = 0; j <= i; j++) {
                    var card = deck.pop();
                    card.faceUp = (j === i);
                    tableau[i].push(card);
                }
            }
            stock = deck;
            for (var i = 0; i < stock.length; i++) stock[i].faceUp = false;
        }

        deal();

        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:center;background:#0a0a1a;padding:12px;border-radius:8px;user-select:none;min-width:560px;';
        container.appendChild(wrapper);

        var topRow = document.createElement('div');
        topRow.style.cssText = 'display:flex;gap:8px;margin-bottom:16px;width:100%;justify-content:center;';
        wrapper.appendChild(topRow);

        var tableauRow = document.createElement('div');
        tableauRow.style.cssText = 'display:flex;gap:8px;width:100%;justify-content:center;align-items:flex-start;';
        wrapper.appendChild(tableauRow);

        var CARD_W = 60;
        var CARD_H = 84;
        var CARD_OVERLAP = 22;
        var CARD_FACE_OVERLAP = 28;

        function cardHTML(card, small) {
            if (!card) return '';
            var color = SUIT_COLORS[card.suit];
            if (!card.faceUp) {
                return '<div style="width:' + CARD_W + 'px;height:' + (small ? 20 : CARD_H) + 'px;background:linear-gradient(135deg,#1a1a3e,#2a1a5e);border:1px solid #444;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:18px;cursor:pointer;">🂠</div>';
            }
            var h = small ? CARD_FACE_OVERLAP : CARD_H;
            return '<div style="width:' + CARD_W + 'px;height:' + h + 'px;background:#1a1a2e;border:1px solid ' + color + ';border-radius:4px;padding:2px 4px;cursor:pointer;position:relative;overflow:hidden;flex-shrink:0;">' +
                '<div style="font-family:\'Press Start 2P\',monospace;font-size:9px;color:' + color + ';">' + card.rank + card.suit + '</div>' +
                (small ? '' : '<div style="position:absolute;bottom:2px;right:4px;font-size:16px;color:' + color + ';">' + card.suit + '</div>') +
                '</div>';
        }

        function emptySlot() {
            return '<div style="width:' + CARD_W + 'px;height:' + CARD_H + 'px;background:rgba(255,255,255,0.03);border:1px dashed #333;border-radius:4px;"></div>';
        }

        function render() {
            topRow.innerHTML = '';
            tableauRow.innerHTML = '';

            var stockDiv = document.createElement('div');
            stockDiv.style.cssText = 'cursor:pointer;';
            stockDiv.innerHTML = stock.length > 0 ?
                '<div style="width:' + CARD_W + 'px;height:' + CARD_H + 'px;background:linear-gradient(135deg,#1a1a3e,#2a1a5e);border:2px solid #00f0ff;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px;color:#00f0ff;font-family:\'Press Start 2P\',monospace;">' + stock.length + '</div>' :
                '<div style="width:' + CARD_W + 'px;height:' + CARD_H + 'px;background:rgba(0,240,255,0.05);border:1px dashed #00f0ff;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#00f0ff;cursor:pointer;">↺</div>';
            stockDiv.addEventListener('click', function() {
                if (gameOver) return;
                clearSelection();
                if (stock.length > 0) {
                    var card = stock.pop();
                    card.faceUp = true;
                    waste.push(card);
                } else {
                    while (waste.length > 0) {
                        var c = waste.pop();
                        c.faceUp = false;
                        stock.push(c);
                    }
                }
                render();
            });
            topRow.appendChild(stockDiv);

            var wasteDiv = document.createElement('div');
            wasteDiv.style.cssText = 'position:relative;width:' + CARD_W + 'px;height:' + CARD_H + 'px;';
            if (waste.length > 0) {
                var topCard = waste[waste.length - 1];
                wasteDiv.innerHTML = cardHTML(topCard, false);
                wasteDiv.addEventListener('click', function() {
                    if (gameOver) return;
                    if (waste.length === 0) return;
                    if (selectedSource && selectedSource.type === 'waste') {
                        clearSelection();
                        render();
                        return;
                    }
                    clearSelection();
                    selectedCards = [waste[waste.length - 1]];
                    selectedSource = { type: 'waste' };
                    render();
                    highlightSelected(wasteDiv);
                });
            } else {
                wasteDiv.innerHTML = emptySlot();
            }
            topRow.appendChild(wasteDiv);

            var spacer = document.createElement('div');
            spacer.style.width = CARD_W + 'px';
            topRow.appendChild(spacer);

            for (var f = 0; f < 4; f++) {
                (function(fi) {
                    var fDiv = document.createElement('div');
                    fDiv.style.cssText = 'position:relative;';
                    if (foundations[fi].length > 0) {
                        var topCard = foundations[fi][foundations[fi].length - 1];
                        fDiv.innerHTML = cardHTML(topCard, false);
                    } else {
                        fDiv.innerHTML = '<div style="width:' + CARD_W + 'px;height:' + CARD_H + 'px;background:rgba(0,255,136,0.05);border:1px dashed #00ff88;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:16px;color:#00ff88;">' + SUITS[fi] + '</div>';
                    }
                    fDiv.addEventListener('click', function() {
                        if (gameOver) return;
                        if (selectedCards && selectedCards.length === 1) {
                            if (canPlaceOnFoundation(selectedCards[0], fi)) {
                                removeSelected();
                                selectedCards[0].faceUp = true;
                                foundations[fi].push(selectedCards[0]);
                                score += 10;
                                callbacks.onScore(score);
                                clearSelection();
                                flipTopCards();
                                render();
                                checkWin();
                                return;
                            }
                        }
                        clearSelection();
                        render();
                    });
                    topRow.appendChild(fDiv);
                })(f);
            }

            for (var t = 0; t < 7; t++) {
                (function(ti) {
                    var colDiv = document.createElement('div');
                    colDiv.style.cssText = 'display:flex;flex-direction:column;min-height:' + (CARD_H + 120) + 'px;width:' + CARD_W + 'px;';

                    if (tableau[ti].length === 0) {
                        var emptyDiv = document.createElement('div');
                        emptyDiv.innerHTML = emptySlot();
                        emptyDiv.addEventListener('click', function() {
                            if (gameOver) return;
                            if (selectedCards && selectedCards.length > 0 && selectedCards[0].rank === 'K') {
                                removeSelected();
                                for (var k = 0; k < selectedCards.length; k++) {
                                    selectedCards[k].faceUp = true;
                                    tableau[ti].push(selectedCards[k]);
                                }
                                clearSelection();
                                flipTopCards();
                                render();
                                return;
                            }
                            clearSelection();
                            render();
                        });
                        colDiv.appendChild(emptyDiv);
                    } else {
                        for (var ci = 0; ci < tableau[ti].length; ci++) {
                            (function(cardIdx) {
                                var card = tableau[ti][cardIdx];
                                var isLast = cardIdx === tableau[ti].length - 1;
                                var cardDiv = document.createElement('div');
                                cardDiv.innerHTML = cardHTML(card, !isLast);
                                cardDiv.addEventListener('click', function(e) {
                                    e.stopPropagation();
                                    if (gameOver) return;
                                    if (!card.faceUp) {
                                        if (cardIdx === tableau[ti].length - 1) {
                                            card.faceUp = true;
                                            render();
                                        }
                                        return;
                                    }

                                    if (selectedCards) {
                                        if (selectedSource && selectedSource.type === 'tableau' && selectedSource.col === ti && selectedSource.startIdx === cardIdx) {
                                            clearSelection();
                                            render();
                                            return;
                                        }
                                        if (isLast && canPlaceOnTableau(selectedCards[0], tableau[ti])) {
                                            removeSelected();
                                            for (var k = 0; k < selectedCards.length; k++) {
                                                selectedCards[k].faceUp = true;
                                                tableau[ti].push(selectedCards[k]);
                                            }
                                            clearSelection();
                                            flipTopCards();
                                            render();
                                            return;
                                        }
                                        clearSelection();
                                    }

                                    var cards = tableau[ti].slice(cardIdx);
                                    var valid = true;
                                    for (var v = 0; v < cards.length; v++) {
                                        if (!cards[v].faceUp) { valid = false; break; }
                                    }
                                    if (valid) {
                                        selectedCards = cards;
                                        selectedSource = { type: 'tableau', col: ti, startIdx: cardIdx };
                                        render();
                                    }
                                });
                                colDiv.appendChild(cardDiv);
                            })(ci);
                        }
                    }
                    tableauRow.appendChild(colDiv);
                })(t);
            }

            if (selectedSource) {
                if (selectedSource.type === 'waste') {
                    var wasteEl = topRow.children[1];
                    if (wasteEl) highlightSelected(wasteEl);
                } else if (selectedSource.type === 'tableau') {
                    var col = tableauRow.children[selectedSource.col];
                    if (col) {
                        for (var ci = selectedSource.startIdx; ci < tableau[selectedSource.col].length; ci++) {
                            var childDiv = col.children[ci];
                            if (childDiv) childDiv.style.outline = '2px solid #ffcc00';
                        }
                    }
                }
            }

            if (gameOver) showEndScreen();
        }

        function highlightSelected(el) {
            el.style.outline = '2px solid #ffcc00';
            el.style.borderRadius = '4px';
        }

        function clearSelection() {
            selectedCards = null;
            selectedSource = null;
        }

        function removeSelected() {
            if (!selectedSource) return;
            if (selectedSource.type === 'waste') {
                waste.pop();
            } else if (selectedSource.type === 'tableau') {
                tableau[selectedSource.col].splice(selectedSource.startIdx);
            }
        }

        function flipTopCards() {
            for (var t = 0; t < 7; t++) {
                if (tableau[t].length > 0) {
                    tableau[t][tableau[t].length - 1].faceUp = true;
                }
            }
        }

        function checkWin() {
            var total = 0;
            for (var f = 0; f < 4; f++) total += foundations[f].length;
            if (total === 52) {
                gameOver = true;
                score += 100;
                callbacks.onScore(score);
                callbacks.onGameOver(score);
            }
        }

        function showEndScreen() {
            var existing = wrapper.querySelector('.sol-overlay');
            if (existing) return;
            var overlay = document.createElement('div');
            overlay.className = 'sol-overlay';
            overlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(10,10,26,0.9);display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:10;border-radius:8px;';
            overlay.innerHTML = '<div style="font-family:\'Press Start 2P\',monospace;font-size:18px;color:#00ff88;margin-bottom:12px;">PARABÉNS!</div><div style="font-family:\'Press Start 2P\',monospace;font-size:14px;color:#00f0ff;">Pontos: ' + score + '</div>';
            wrapper.style.position = 'relative';

            restartBtn = document.createElement('button');
            restartBtn.textContent = 'Reiniciar';
            restartBtn.style.cssText = 'display:block;margin:16px auto;padding:10px 32px;font-family:"Press Start 2P",monospace;font-size:14px;background:#ff00aa;color:#fff;border:none;border-radius:6px;cursor:pointer;';
            restartBtn.addEventListener('click', doRestart);
            overlay.appendChild(restartBtn);
            wrapper.appendChild(overlay);
        }

        function doRestart() {
            var existing = wrapper.querySelector('.sol-overlay');
            if (existing) existing.remove();
            restartBtn = null;
            score = 0; gameOver = false;
            deal();
            clearSelection();
            callbacks.onScore(0);
            render();
        }

        render();

        return {
            destroy: function() {
                if (restartBtn) restartBtn.remove();
            }
        };
    };
})();
