(function(){
window.Games.match3 = function(container, cb) {
    const ROWS=8, COLS=8, SZ=48;
    const GEMS=['💎','🔴','🟢','🔵','⭐','🟣'];
    let grid, selected=null, score=0, moves=30, animating=false;
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:12px;';
    const info=document.createElement('div'); info.style.cssText='display:flex;gap:20px;font-size:14px;font-weight:bold;';
    const board=document.createElement('div'); board.style.cssText=`display:grid;grid-template-columns:repeat(${COLS},${SZ}px);gap:2px;`;
    const restartBtn=document.createElement('button'); restartBtn.className='btn btn-secondary'; restartBtn.textContent='Nova Partida'; restartBtn.onclick=init;
    wrap.append(info,board,restartBtn); container.appendChild(wrap);

    function init(){
        grid=Array.from({length:ROWS},()=>Array.from({length:COLS},()=>GEMS[Math.floor(Math.random()*GEMS.length)]));
        while(findMatches().length) grid=Array.from({length:ROWS},()=>Array.from({length:COLS},()=>GEMS[Math.floor(Math.random()*GEMS.length)]));
        selected=null; score=0; moves=30; animating=false; cb.onScore(0); render();
    }
    function findMatches(){
        const matches=new Set();
        for(let r=0;r<ROWS;r++) for(let c=0;c<COLS-2;c++)
            if(grid[r][c]&&grid[r][c]===grid[r][c+1]&&grid[r][c]===grid[r][c+2]){ matches.add(`${r},${c}`); matches.add(`${r},${c+1}`); matches.add(`${r},${c+2}`); }
        for(let c=0;c<COLS;c++) for(let r=0;r<ROWS-2;r++)
            if(grid[r][c]&&grid[r][c]===grid[r+1][c]&&grid[r][c]===grid[r+2][c]){ matches.add(`${r},${c}`); matches.add(`${r+1},${c}`); matches.add(`${r+2},${c}`); }
        return [...matches].map(s=>s.split(',').map(Number));
    }
    function removeAndFill(){
        const m=findMatches();
        if(!m.length) return false;
        m.forEach(([r,c])=>grid[r][c]=null);
        score+=m.length*10; cb.onScore(score);
        for(let c=0;c<COLS;c++){
            let empty=0;
            for(let r=ROWS-1;r>=0;r--){ if(!grid[r][c]) empty++; else if(empty>0){ grid[r+empty][c]=grid[r][c]; grid[r][c]=null; } }
            for(let r=0;r<empty;r++) grid[r][c]=GEMS[Math.floor(Math.random()*GEMS.length)];
        }
        return true;
    }
    function render(){
        info.innerHTML=`<span style="color:#ffcc00">Pontos: ${score}</span><span style="color:#00f0ff">Movimentos: ${moves}</span>`;
        board.innerHTML='';
        for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
            const cell=document.createElement('div');
            cell.style.cssText=`width:${SZ}px;height:${SZ}px;display:flex;align-items:center;justify-content:center;font-size:28px;cursor:pointer;border-radius:6px;transition:all 0.15s;user-select:none;`;
            cell.style.background=(selected&&selected[0]===r&&selected[1]===c)?'rgba(0,240,255,0.3)':'#1a1a3e';
            cell.textContent=grid[r][c]||'';
            cell.onclick=()=>cellClick(r,c);
            board.appendChild(cell);
        }
    }
    function cellClick(r,c){
        if(animating||moves<=0) return;
        if(!selected){ selected=[r,c]; render(); return; }
        const [sr,sc]=selected;
        if(Math.abs(sr-r)+Math.abs(sc-c)===1){
            [grid[sr][sc],grid[r][c]]=[grid[r][c],grid[sr][sc]];
            if(findMatches().length){
                moves--; animating=true;
                function chain(){ if(removeAndFill()){ render(); setTimeout(chain,300); } else { animating=false; if(moves<=0) cb.onGameOver(score); render(); } }
                chain();
            } else { [grid[sr][sc],grid[r][c]]=[grid[r][c],grid[sr][sc]]; }
        }
        selected=null; render();
    }
    init();
    return { destroy(){} };
};
})();
