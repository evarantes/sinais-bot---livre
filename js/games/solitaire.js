(function(){
window.Games.solitaire = function(container, cb) {
    const SUITS=['♠','♥','♦','♣'], RANKS=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    let deck, waste, foundations, tableau, score, moves;
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:8px;font-size:13px;';
    const info=document.createElement('div'); info.style.cssText='display:flex;gap:16px;color:#8888aa;';
    const topRow=document.createElement('div'); topRow.style.cssText='display:flex;gap:8px;margin-bottom:8px;';
    const tabRow=document.createElement('div'); tabRow.style.cssText='display:flex;gap:8px;align-items:flex-start;';
    const restartBtn=document.createElement('button'); restartBtn.className='btn btn-secondary'; restartBtn.textContent='Novo Jogo'; restartBtn.onclick=init;
    wrap.append(info,topRow,tabRow,restartBtn); container.appendChild(wrap);

    function makeDeck(){ const d=[]; for(const s of SUITS) for(const r of RANKS) d.push({rank:r,suit:s,faceUp:false,red:('♥♦').includes(s)}); return d.sort(()=>Math.random()-0.5); }
    function cardStr(c){ return c.rank+c.suit; }
    function rankIdx(r){ return RANKS.indexOf(r); }

    function init(){
        const d=makeDeck(); foundations=[[],[],[],[]]; tableau=[[],[],[],[],[],[],[]]; waste=[]; deck=[]; score=0; moves=0;
        for(let i=0;i<7;i++) for(let j=i;j<7;j++){ const c=d.pop(); c.faceUp=(j===i); tableau[j].push(c); }
        deck=d; cb.onScore(0); render();
    }

    function renderCard(c,small=false){
        const div=document.createElement('div');
        div.style.cssText=`width:${small?40:48}px;height:${small?14:66}px;border-radius:4px;display:flex;align-items:${small?'center':'flex-start'};justify-content:center;padding:2px 4px;font-size:${small?'11px':'13px'};font-weight:bold;cursor:pointer;user-select:none;flex-shrink:0;`;
        if(!c.faceUp){ div.style.background='#2a2a5a'; div.style.border='1px solid #3a3a6a'; }
        else { div.style.background='#f0f0f0'; div.style.border='1px solid #ddd'; div.style.color=c.red?'#cc0000':'#111'; div.textContent=cardStr(c); }
        return div;
    }

    let dragSource=null;
    function render(){
        info.innerHTML=`<span>Pontos: ${score}</span><span>Movimentos: ${moves}</span>`;
        topRow.innerHTML='';
        const deckDiv=document.createElement('div');
        deckDiv.style.cssText='width:50px;height:70px;background:#1a3a1e;border:2px dashed #00ff88;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:20px;';
        deckDiv.textContent=deck.length?'🂠':'↺';
        deckDiv.onclick=drawCard;
        topRow.appendChild(deckDiv);

        const wasteDiv=document.createElement('div');
        wasteDiv.style.cssText='width:50px;height:70px;border:1px solid #2a2a5a;border-radius:6px;display:flex;align-items:center;justify-content:center;';
        if(waste.length){ const wc=renderCard(waste[waste.length-1]); wc.onclick=()=>tryAutoMove('waste'); wasteDiv.appendChild(wc); }
        topRow.appendChild(wasteDiv);

        const spacer=document.createElement('div'); spacer.style.width='20px'; topRow.appendChild(spacer);

        foundations.forEach((f,fi)=>{
            const fd=document.createElement('div');
            fd.style.cssText='width:50px;height:70px;border:2px dashed #ffcc00;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;color:#ffcc00;';
            fd.textContent=f.length?cardStr(f[f.length-1]):SUITS[fi];
            fd.onclick=()=>dropFoundation(fi);
            topRow.appendChild(fd);
        });

        tabRow.innerHTML='';
        tableau.forEach((col,ci)=>{
            const colDiv=document.createElement('div');
            colDiv.style.cssText='display:flex;flex-direction:column;width:52px;min-height:70px;border:1px solid #1a1a3e;border-radius:4px;padding:2px;';
            if(!col.length){ colDiv.style.cursor='pointer'; colDiv.onclick=()=>dropTableau(ci); }
            col.forEach((c,i)=>{
                const cd=renderCard(c,i<col.length-1);
                if(c.faceUp) cd.onclick=()=>clickTableauCard(ci,i);
                colDiv.appendChild(cd);
            });
            tabRow.appendChild(colDiv);
        });
    }

    function drawCard(){
        if(deck.length){ const c=deck.pop(); c.faceUp=true; waste.push(c); }
        else { deck=waste.reverse().map(c=>({...c,faceUp:false})); waste=[]; }
        render();
    }

    function canPlaceFoundation(card,fi){
        const f=foundations[fi];
        if(!f.length) return card.rank==='A'&&card.suit===SUITS[fi];
        const top=f[f.length-1];
        return card.suit===top.suit&&rankIdx(card.rank)===rankIdx(top.rank)+1;
    }

    function canPlaceTableau(card,ci){
        const col=tableau[ci];
        if(!col.length) return card.rank==='K';
        const top=col[col.length-1];
        return top.faceUp&&top.red!==card.red&&rankIdx(card.rank)===rankIdx(top.rank)-1;
    }

    function tryAutoMove(source){
        let card;
        if(source==='waste'&&waste.length) card=waste[waste.length-1];
        else return;
        for(let fi=0;fi<4;fi++){
            if(canPlaceFoundation(card,fi)){ foundations[fi].push(waste.pop()); score+=15; moves++; cb.onScore(score); checkWin(); render(); return; }
        }
        for(let ci=0;ci<7;ci++){
            if(canPlaceTableau(card,ci)){ tableau[ci].push(waste.pop()); moves++; render(); return; }
        }
    }

    function clickTableauCard(ci,idx){
        const col=tableau[ci]; const card=col[idx];
        if(idx===col.length-1){
            for(let fi=0;fi<4;fi++){
                if(canPlaceFoundation(card,fi)){ foundations[fi].push(col.pop()); if(col.length&&!col[col.length-1].faceUp) col[col.length-1].faceUp=true; score+=15; moves++; cb.onScore(score); checkWin(); render(); return; }
            }
        }
        const cards=col.splice(idx);
        for(let ti=0;ti<7;ti++){
            if(ti===ci) continue;
            if(canPlaceTableau(cards[0],ti)){ tableau[ti].push(...cards); if(col.length&&!col[col.length-1].faceUp) col[col.length-1].faceUp=true; moves++; render(); return; }
        }
        col.push(...cards);
    }

    function dropFoundation(fi){
        if(waste.length&&canPlaceFoundation(waste[waste.length-1],fi)){
            foundations[fi].push(waste.pop()); score+=15; moves++; cb.onScore(score); checkWin(); render();
        }
    }
    function dropTableau(ci){
        if(waste.length&&canPlaceTableau(waste[waste.length-1],ci)){
            tableau[ci].push(waste.pop()); moves++; render();
        }
    }

    function checkWin(){
        if(foundations.every(f=>f.length===13)){ score+=200; cb.onScore(score); cb.onGameOver(score); }
    }

    init();
    return { destroy(){} };
};
})();
