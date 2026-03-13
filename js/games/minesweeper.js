(function(){
window.Games.minesweeper = function(container, cb) {
    const ROWS=9, COLS=9, MINES=10, SZ=36;
    let grid, revealed, flags, dead, won, score;
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:12px;';
    const info=document.createElement('div'); info.style.cssText='font-size:14px;color:#8888aa;';
    const board=document.createElement('div'); board.style.cssText=`display:grid;grid-template-columns:repeat(${COLS},${SZ}px);gap:2px;`;
    const restartBtn=document.createElement('button'); restartBtn.className='btn btn-secondary'; restartBtn.textContent='Nova Partida'; restartBtn.onclick=init;
    wrap.append(info,board,restartBtn); container.appendChild(wrap);

    function init(){
        grid=Array.from({length:ROWS},()=>Array(COLS).fill(0));
        revealed=Array.from({length:ROWS},()=>Array(COLS).fill(false));
        flags=Array.from({length:ROWS},()=>Array(COLS).fill(false));
        dead=false; won=false; score=0; cb.onScore(0);
        let placed=0;
        while(placed<MINES){ const r=Math.floor(Math.random()*ROWS),c=Math.floor(Math.random()*COLS); if(grid[r][c]!==-1){ grid[r][c]=-1; placed++; } }
        for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(grid[r][c]!==-1){
            let n=0; for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){ const nr=r+dr,nc=c+dc; if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&grid[nr][nc]===-1) n++; }
            grid[r][c]=n;
        }
        render();
    }
    function reveal(r,c){
        if(r<0||r>=ROWS||c<0||c>=COLS||revealed[r][c]||flags[r][c]) return;
        revealed[r][c]=true;
        if(grid[r][c]===0) for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++) reveal(r+dr,c+dc);
    }
    function checkWin(){
        for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(grid[r][c]!==-1&&!revealed[r][c]) return false;
        return true;
    }
    const NCOLORS=['','#00f0ff','#00ff88','#ff6600','#ff0055','#aa44ff','#ffcc00','#fff','#888'];
    function render(){
        board.innerHTML='';
        const flagCount=flags.flat().filter(Boolean).length;
        info.textContent=dead?'💥 Boom! Game Over': won?'🎉 Você venceu!': `💣 ${MINES-flagCount} minas restantes`;
        for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
            const cell=document.createElement('div');
            cell.style.cssText=`width:${SZ}px;height:${SZ}px;display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:14px;font-weight:bold;cursor:pointer;user-select:none;`;
            if(revealed[r][c]){
                cell.style.background='#12122a'; cell.style.border='1px solid #1a1a3e';
                if(grid[r][c]===-1) cell.textContent='💣';
                else if(grid[r][c]>0){ cell.textContent=grid[r][c]; cell.style.color=NCOLORS[grid[r][c]]; }
            } else {
                cell.style.background='#2a2a5a'; cell.style.border='1px solid #3a3a6a';
                if(flags[r][c]) cell.textContent='🚩';
                cell.onclick=()=>{
                    if(dead||won) return;
                    if(grid[r][c]===-1){ dead=true; for(let rr=0;rr<ROWS;rr++) for(let cc=0;cc<COLS;cc++) revealed[rr][cc]=true; cb.onGameOver(score); }
                    else { reveal(r,c); score+=5; cb.onScore(score); if(checkWin()){ won=true; score+=100; cb.onScore(score); cb.onGameOver(score); } }
                    render();
                };
                cell.oncontextmenu=(e)=>{ e.preventDefault(); if(!dead&&!won){ flags[r][c]=!flags[r][c]; render(); } };
            }
            board.appendChild(cell);
        }
    }
    init();
    return { destroy(){} };
};
})();
