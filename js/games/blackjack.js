(function(){
window.Games.blackjack = function(container, cb) {
    const SUITS=['♠','♥','♦','♣'], RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    let deck, playerHand, dealerHand, score, gameState;
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:20px;';
    const dealerDiv=document.createElement('div'); dealerDiv.style.cssText='text-align:center;';
    const playerDiv=document.createElement('div'); playerDiv.style.cssText='text-align:center;';
    const info=document.createElement('div'); info.style.cssText='font-size:18px;font-weight:bold;min-height:30px;';
    const btnsDiv=document.createElement('div'); btnsDiv.style.cssText='display:flex;gap:12px;';
    wrap.append(dealerDiv,info,playerDiv,btnsDiv); container.appendChild(wrap);

    function makeDeck(){ deck=[]; for(const s of SUITS) for(const r of RANKS) deck.push({rank:r,suit:s}); deck.sort(()=>Math.random()-0.5); }
    function cardVal(hand){
        let v=0, aces=0;
        for(const c of hand){ if(c.rank==='A'){v+=11;aces++;} else if(['J','Q','K'].includes(c.rank)) v+=10; else v+=parseInt(c.rank); }
        while(v>21&&aces>0){v-=10;aces--;} return v;
    }
    function renderCard(c,hidden=false){
        const div=document.createElement('div');
        div.style.cssText='display:inline-flex;flex-direction:column;align-items:center;justify-content:center;width:60px;height:85px;border-radius:8px;margin:4px;font-weight:bold;';
        if(hidden){ div.style.background='#2a2a5a'; div.style.border='2px solid #3a3a6a'; div.textContent='?'; div.style.fontSize='24px'; div.style.color='#8888aa'; }
        else { div.style.background='#f0f0f0'; div.style.border='2px solid #ddd'; div.style.color=('♥♦').includes(c.suit)?'#ff0055':'#111';
            div.innerHTML=`<span style="font-size:16px">${c.rank}</span><span style="font-size:20px">${c.suit}</span>`; }
        return div;
    }
    function render(){
        dealerDiv.innerHTML='<div style="color:#ff00aa;font-size:12px;margin-bottom:8px;font-family:\'Press Start 2P\'">DEALER</div>';
        const dCards=document.createElement('div');
        dealerHand.forEach((c,i)=>dCards.appendChild(renderCard(c,gameState==='playing'&&i===1)));
        const dVal=gameState==='playing'?cardVal([dealerHand[0]]):cardVal(dealerHand);
        dealerDiv.innerHTML+=`<div style="color:#8888aa;font-size:13px;margin-top:4px">${gameState==='playing'?dVal+'+ ?':dVal}</div>`;
        dealerDiv.prepend(dealerDiv.firstChild); dealerDiv.insertBefore(dCards,dealerDiv.children[1]);

        playerDiv.innerHTML='<div style="color:#00f0ff;font-size:12px;margin-bottom:8px;font-family:\'Press Start 2P\'">VOCÊ</div>';
        const pCards=document.createElement('div');
        playerHand.forEach(c=>pCards.appendChild(renderCard(c)));
        playerDiv.appendChild(pCards);
        playerDiv.innerHTML+=`<div style="color:#8888aa;font-size:13px;margin-top:4px">${cardVal(playerHand)}</div>`;

        btnsDiv.innerHTML='';
        if(gameState==='playing'){
            const hitBtn=document.createElement('button'); hitBtn.className='btn btn-play'; hitBtn.textContent='Pedir'; hitBtn.onclick=hit;
            const standBtn=document.createElement('button'); standBtn.className='btn btn-secondary'; standBtn.textContent='Parar'; standBtn.onclick=stand;
            btnsDiv.append(hitBtn,standBtn);
        } else {
            const newBtn=document.createElement('button'); newBtn.className='btn btn-play'; newBtn.textContent='Nova Mão'; newBtn.onclick=deal;
            btnsDiv.appendChild(newBtn);
        }
    }
    function deal(){
        makeDeck(); playerHand=[deck.pop(),deck.pop()]; dealerHand=[deck.pop(),deck.pop()]; gameState='playing';
        if(cardVal(playerHand)===21){ stand(); return; }
        render();
    }
    function hit(){
        playerHand.push(deck.pop());
        if(cardVal(playerHand)>21){ gameState='done'; info.textContent='Estourou! 😵'; info.style.color='#ff0055'; cb.onGameOver(score); }
        else if(cardVal(playerHand)===21) stand();
        render();
    }
    function stand(){
        while(cardVal(dealerHand)<17) dealerHand.push(deck.pop());
        gameState='done';
        const pv=cardVal(playerHand), dv=cardVal(dealerHand);
        if(pv>21){ info.textContent='Estourou! 😵'; info.style.color='#ff0055'; }
        else if(dv>21||pv>dv){ info.textContent='Você venceu! 🎉'; info.style.color='#00ff88'; score+=30; cb.onScore(score); }
        else if(pv===dv){ info.textContent='Empate!'; info.style.color='#ffcc00'; score+=10; cb.onScore(score); }
        else { info.textContent='Dealer venceu 😔'; info.style.color='#ff0055'; }
        cb.onGameOver(score);
        render();
    }
    score=0; deal();
    return { destroy(){} };
};
})();
