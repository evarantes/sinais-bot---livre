(function(){
window.Games.simon = function(container, cb) {
    const COLORS=[{bg:'#ff0055',lit:'#ff4488',name:'Vermelho'},{bg:'#00ff88',lit:'#66ffbb',name:'Verde'},{bg:'#0066ff',lit:'#4499ff',name:'Azul'},{bg:'#ffcc00',lit:'#ffee66',name:'Amarelo'}];
    let sequence=[], playerIdx=0, score=0, playing=false, showing=false;
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:20px;';
    const info=document.createElement('div'); info.style.cssText='font-size:16px;color:#00f0ff;font-weight:bold;min-height:30px;';
    const grid=document.createElement('div'); grid.style.cssText='display:grid;grid-template-columns:repeat(2,120px);gap:12px;';
    const startBtn=document.createElement('button'); startBtn.className='btn btn-play'; startBtn.textContent='Iniciar'; startBtn.onclick=startRound;
    wrap.append(info,grid,startBtn); container.appendChild(wrap);

    const btns=COLORS.map((c,i)=>{
        const btn=document.createElement('div');
        btn.style.cssText=`width:120px;height:120px;border-radius:16px;cursor:pointer;transition:all 0.15s;background:${c.bg};opacity:0.6;`;
        btn.onclick=()=>playerPress(i);
        grid.appendChild(btn);
        return btn;
    });
    function flash(idx,dur=400){
        btns[idx].style.opacity='1'; btns[idx].style.background=COLORS[idx].lit; btns[idx].style.transform='scale(1.05)';
        setTimeout(()=>{ btns[idx].style.opacity='0.6'; btns[idx].style.background=COLORS[idx].bg; btns[idx].style.transform='scale(1)'; },dur*0.7);
    }
    function startRound(){
        if(showing) return;
        sequence.push(Math.floor(Math.random()*4));
        playerIdx=0; showing=true; playing=false;
        info.textContent='Observe...';
        startBtn.style.display='none';
        let i=0;
        const iv=setInterval(()=>{
            if(i>=sequence.length){ clearInterval(iv); showing=false; playing=true; info.textContent='Sua vez!'; return; }
            flash(sequence[i]); i++;
        },600);
    }
    function playerPress(idx){
        if(!playing||showing) return;
        flash(idx,200);
        if(idx!==sequence[playerIdx]){ info.textContent=`Game Over! Rodadas: ${sequence.length-1}`; playing=false; startBtn.style.display='block'; startBtn.textContent='Tentar de Novo'; sequence=[]; cb.onGameOver(score); return; }
        playerIdx++;
        if(playerIdx===sequence.length){
            score+=10; cb.onScore(score);
            playing=false;
            info.textContent='Correto! ✨';
            setTimeout(startRound,1000);
        }
    }
    info.textContent='Clique em Iniciar para começar';
    return { destroy(){ playing=false; showing=false; } };
};
})();
