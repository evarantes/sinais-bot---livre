(function(){
window.Games.slidingpuzzle = function(container, cb) {
    const SZ=4, TILE=80;
    let tiles, moves, score, done, timer, startTime;
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:16px;';
    const info=document.createElement('div'); info.style.cssText='font-size:14px;color:#8888aa;';
    const board=document.createElement('div'); board.style.cssText=`display:grid;grid-template-columns:repeat(${SZ},${TILE}px);gap:4px;`;
    const restartBtn=document.createElement('button'); restartBtn.className='btn btn-secondary'; restartBtn.textContent='Embaralhar'; restartBtn.onclick=init;
    wrap.append(info,board,restartBtn); container.appendChild(wrap);

    function init(){
        tiles=Array.from({length:SZ*SZ-1},(_,i)=>i+1); tiles.push(0);
        for(let i=tiles.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [tiles[i],tiles[j]]=[tiles[j],tiles[i]]; }
        if(!isSolvable()) [tiles[0],tiles[1]]=[tiles[1],tiles[0]];
        moves=0; score=0; done=false; startTime=Date.now(); cb.onScore(0);
        if(timer) clearInterval(timer);
        timer=setInterval(()=>{ if(!done) render(); },1000);
        render();
    }
    function isSolvable(){
        let inv=0;
        const flat=tiles.filter(t=>t!==0);
        for(let i=0;i<flat.length;i++) for(let j=i+1;j<flat.length;j++) if(flat[i]>flat[j]) inv++;
        const emptyRow=SZ-Math.floor(tiles.indexOf(0)/SZ);
        return SZ%2!==0?inv%2===0:(emptyRow%2===0)!==(inv%2===0);
    }
    function isWon(){ return tiles.every((v,i)=>i===tiles.length-1?v===0:v===i+1); }
    function render(){
        const elapsed=Math.floor((Date.now()-startTime)/1000);
        info.textContent=done?`🎉 Completo! ${moves} movimentos, ${elapsed}s`:`Movimentos: ${moves} | Tempo: ${elapsed}s`;
        board.innerHTML='';
        tiles.forEach((v,i)=>{
            const cell=document.createElement('div');
            cell.style.cssText=`width:${TILE}px;height:${TILE}px;display:flex;align-items:center;justify-content:center;border-radius:8px;font-size:22px;font-weight:bold;cursor:pointer;transition:all 0.15s;user-select:none;`;
            if(v===0){ cell.style.background='transparent'; }
            else { cell.style.background='#2a2a5a'; cell.style.border='1px solid #3a3a6a'; cell.style.color='#00f0ff'; cell.textContent=v; }
            cell.onclick=()=>clickTile(i);
            board.appendChild(cell);
        });
    }
    function clickTile(i){
        if(done) return;
        const ei=tiles.indexOf(0);
        const r1=Math.floor(i/SZ),c1=i%SZ,r2=Math.floor(ei/SZ),c2=ei%SZ;
        if((Math.abs(r1-r2)+Math.abs(c1-c2))===1){
            [tiles[i],tiles[ei]]=[tiles[ei],tiles[i]]; moves++;
            if(isWon()){ done=true; score=Math.max(10,200-moves*2); cb.onScore(score); cb.onGameOver(score); clearInterval(timer); }
            render();
        }
    }
    init();
    return { destroy(){ if(timer) clearInterval(timer); } };
};
})();
