(function(){
window.Games.connectfour = function(container, cb) {
    const ROWS=6, COLS=7, SZ=60;
    let grid, turn, done, score=0;
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:12px;';
    const info=document.createElement('div'); info.style.cssText='font-size:16px;font-weight:bold;color:#00f0ff;min-height:28px;';
    const board=document.createElement('div'); board.style.cssText=`display:grid;grid-template-columns:repeat(${COLS},${SZ}px);gap:4px;background:#0044cc;padding:10px;border-radius:12px;`;
    const restartBtn=document.createElement('button'); restartBtn.className='btn btn-secondary'; restartBtn.textContent='Nova Partida'; restartBtn.onclick=init;
    wrap.append(info,board,restartBtn); container.appendChild(wrap);

    function init(){
        grid=Array.from({length:ROWS},()=>Array(COLS).fill(0)); turn=1; done=false; render();
    }
    function dropPiece(col){
        for(let r=ROWS-1;r>=0;r--) if(!grid[r][col]){ grid[r][col]=turn; return r; }
        return -1;
    }
    function checkWin(p){
        for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
            const dirs=[[0,1],[1,0],[1,1],[1,-1]];
            for(const [dr,dc] of dirs){
                let count=0;
                for(let i=0;i<4;i++){ const nr=r+dr*i,nc=c+dc*i; if(nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&grid[nr][nc]===p) count++; else break; }
                if(count===4) return true;
            }
        }
        return false;
    }
    function aiMove(){
        for(let c=0;c<COLS;c++){ const r=getRow(c); if(r>=0){ grid[r][c]=2; if(checkWin(2)){ grid[r][c]=0; return c; } grid[r][c]=0; } }
        for(let c=0;c<COLS;c++){ const r=getRow(c); if(r>=0){ grid[r][c]=1; if(checkWin(1)){ grid[r][c]=0; return c; } grid[r][c]=0; } }
        if(!grid[0][3]) return 3;
        const avail=[]; for(let c=0;c<COLS;c++) if(!grid[0][c]) avail.push(c);
        return avail[Math.floor(Math.random()*avail.length)];
    }
    function getRow(col){ for(let r=ROWS-1;r>=0;r--) if(!grid[r][col]) return r; return -1; }
    function render(){
        board.innerHTML='';
        info.textContent=done?'':turn===1?'Sua vez (🔴)':'Computador...';
        for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
            const cell=document.createElement('div');
            cell.style.cssText=`width:${SZ}px;height:${SZ}px;border-radius:50%;cursor:pointer;transition:all 0.2s;`;
            cell.style.background=grid[r][c]===1?'#ff0055':grid[r][c]===2?'#ffcc00':'#0a0a2e';
            cell.onclick=()=>play(c);
            board.appendChild(cell);
        }
    }
    function play(col){
        if(done||turn!==1) return;
        const r=dropPiece(col); if(r<0) return;
        if(checkWin(1)){ done=true; info.textContent='Você venceu! 🎉'; info.style.color='#00ff88'; score+=50; cb.onScore(score); cb.onGameOver(score); render(); return; }
        if(grid.every(row=>row.every(v=>v))){ done=true; info.textContent='Empate!'; cb.onGameOver(score); render(); return; }
        turn=2; render();
        setTimeout(()=>{
            const ac=aiMove(); dropPiece(ac);
            if(checkWin(2)){ done=true; info.textContent='Computador venceu 😔'; info.style.color='#ff0055'; cb.onGameOver(score); }
            else if(grid.every(row=>row.every(v=>v))){ done=true; info.textContent='Empate!'; cb.onGameOver(score); }
            turn=1; render();
        },500);
    }
    init();
    return { destroy(){} };
};
})();
