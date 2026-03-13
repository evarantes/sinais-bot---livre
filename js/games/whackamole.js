(function(){
window.Games.whackamole = function(container, cb) {
    const HOLES=9, DURATION=30;
    let score=0, timeLeft=DURATION, active=-1, timer, spawnTimer, running=false;
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:16px;';
    const info=document.createElement('div'); info.style.cssText='display:flex;gap:24px;font-size:16px;font-weight:bold;';
    const grid=document.createElement('div'); grid.style.cssText='display:grid;grid-template-columns:repeat(3,100px);gap:12px;';
    const startBtn=document.createElement('button'); startBtn.className='btn btn-play'; startBtn.textContent='Iniciar'; startBtn.onclick=start;
    wrap.append(info,grid,startBtn); container.appendChild(wrap);

    const holes=[];
    for(let i=0;i<HOLES;i++){
        const h=document.createElement('div');
        h.style.cssText='width:100px;height:100px;border-radius:50%;background:#1a1a3e;border:3px solid #2a2a5a;display:flex;align-items:center;justify-content:center;font-size:40px;cursor:pointer;transition:all 0.1s;user-select:none;';
        h.onclick=()=>whack(i);
        grid.appendChild(h); holes.push(h);
    }
    function render(){
        info.innerHTML=`<span style="color:#00f0ff">Pontos: ${score}</span><span style="color:#ffcc00">Tempo: ${timeLeft}s</span>`;
        holes.forEach((h,i)=>{
            if(i===active){ h.textContent='🐹'; h.style.borderColor='#00ff88'; h.style.background='#1a3a1e'; }
            else { h.textContent=''; h.style.borderColor='#2a2a5a'; h.style.background='#1a1a3e'; }
        });
    }
    function spawn(){
        active=Math.floor(Math.random()*HOLES);
        render();
        setTimeout(()=>{ if(active>=0){ active=-1; render(); } }, 800+Math.random()*600);
    }
    function whack(i){
        if(!running||i!==active) return;
        score+=10; cb.onScore(score); active=-1;
        holes[i].textContent='💥'; holes[i].style.borderColor='#ffcc00';
        setTimeout(render,200);
    }
    function start(){
        score=0; timeLeft=DURATION; running=true; cb.onScore(0);
        startBtn.style.display='none';
        spawnTimer=setInterval(spawn,1000);
        timer=setInterval(()=>{
            timeLeft--;
            if(timeLeft<=0){ running=false; clearInterval(timer); clearInterval(spawnTimer); active=-1; render();
                info.innerHTML+=`<span style="color:#ff00aa">Fim!</span>`;
                startBtn.style.display='block'; startBtn.textContent='Jogar de Novo';
                cb.onGameOver(score);
            }
            render();
        },1000);
        render();
    }
    render();
    return { destroy(){ clearInterval(timer); clearInterval(spawnTimer); running=false; } };
};
})();
