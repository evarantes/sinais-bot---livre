(function(){
window.Games.memory = function(container, cb) {
    const EMOJIS=['🐶','🐱','🐸','🦊','🐻','🐼','🐵','🦁'];
    let cards=[...EMOJIS,...EMOJIS].sort(()=>Math.random()-0.5);
    let flipped=[], matched=[], score=0, moves=0, startTime=Date.now(), done=false;
    const wrap=document.createElement('div');
    wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:16px;';
    const info=document.createElement('div');
    info.style.cssText='display:flex;gap:24px;font-size:14px;color:#8888aa;';
    const grid=document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:repeat(4,80px);gap:10px;';
    wrap.append(info,grid); container.appendChild(wrap);

    function render(){
        grid.innerHTML='';
        const elapsed=Math.floor((Date.now()-startTime)/1000);
        info.innerHTML=`<span>Movimentos: ${moves}</span><span>Tempo: ${elapsed}s</span><span>Pares: ${matched.length/2}/8</span>`;
        cards.forEach((emoji,i)=>{
            const card=document.createElement('div');
            const show=flipped.includes(i)||matched.includes(i);
            card.style.cssText=`width:80px;height:80px;display:flex;align-items:center;justify-content:center;border-radius:10px;font-size:36px;cursor:pointer;transition:all 0.3s;user-select:none;`;
            if(show){ card.style.background='#1a1a3e'; card.style.border='1px solid #00f0ff'; card.textContent=emoji; }
            else { card.style.background='linear-gradient(135deg,#2a2a5a,#1a1a3e)'; card.style.border='1px solid #2a2a5a'; card.textContent='?'; card.style.color='#555'; }
            if(matched.includes(i)){ card.style.borderColor='#00ff88'; card.style.opacity='0.6'; }
            card.onclick=()=>flip(i);
            grid.appendChild(card);
        });
    }
    function flip(i){
        if(done||flipped.length>=2||flipped.includes(i)||matched.includes(i)) return;
        flipped.push(i); moves++; render();
        if(flipped.length===2){
            setTimeout(()=>{
                if(cards[flipped[0]]===cards[flipped[1]]){
                    matched.push(...flipped); score+=20; cb.onScore(score);
                    if(matched.length===cards.length){
                        done=true;
                        const t=Math.floor((Date.now()-startTime)/1000);
                        if(t<60) App.addStat('memory_fast',1);
                        score+=Math.max(0,100-t); cb.onScore(score); cb.onGameOver(score);
                    }
                }
                flipped=[]; render();
            },600);
        }
    }
    render();
    const timer=setInterval(()=>{ if(!done) render(); },1000);
    return { destroy(){ clearInterval(timer); } };
};
})();
