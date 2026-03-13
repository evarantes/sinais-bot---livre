(function(){
window.Games.checkers = function(container, cb) {
    const SZ=8, CELL=50;
    let board, selected=null, turn='r', score=0, done=false;
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:12px;';
    const info=document.createElement('div'); info.style.cssText='font-size:14px;color:#00f0ff;font-weight:bold;min-height:24px;';
    const boardDiv=document.createElement('div'); boardDiv.style.cssText=`display:grid;grid-template-columns:repeat(${SZ},${CELL}px);`;
    const restartBtn=document.createElement('button'); restartBtn.className='btn btn-secondary'; restartBtn.textContent='Nova Partida'; restartBtn.onclick=init;
    wrap.append(info,boardDiv,restartBtn); container.appendChild(wrap);

    function init(){
        board=Array.from({length:SZ},()=>Array(SZ).fill(null));
        for(let r=0;r<3;r++) for(let c=0;c<SZ;c++) if((r+c)%2===1) board[r][c]='b';
        for(let r=5;r<8;r++) for(let c=0;c<SZ;c++) if((r+c)%2===1) board[r][c]='r';
        selected=null; turn='r'; done=false; score=0; cb.onScore(0); render();
    }
    function getMoves(r,c){
        const p=board[r][c]; if(!p) return [];
        const moves=[], dirs=p.includes('r')?[[-1,-1],[-1,1]]:[[1,-1],[1,1]];
        if(p.includes('K')) dirs.push(...(p.includes('r')?[[1,-1],[1,1]]:[[-1,-1],[-1,1]]));
        dirs.forEach(([dr,dc])=>{
            const nr=r+dr,nc=c+dc;
            if(nr>=0&&nr<SZ&&nc>=0&&nc<SZ){
                if(!board[nr][nc]) moves.push({r:nr,c:nc,cap:null});
                else if(!board[nr][nc].includes(p[0])){
                    const jr=nr+dr,jc=nc+dc;
                    if(jr>=0&&jr<SZ&&jc>=0&&jc<SZ&&!board[jr][jc]) moves.push({r:jr,c:jc,cap:{r:nr,c:nc}});
                }
            }
        });
        return moves;
    }
    function render(){
        info.textContent=done?'Fim de jogo!':(turn==='r'?'Sua vez (🔴)':'Computador (⚫)');
        boardDiv.innerHTML='';
        const moves=selected?getMoves(selected[0],selected[1]):[];
        const moveSet=new Set(moves.map(m=>`${m.r},${m.c}`));
        for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
            const cell=document.createElement('div');
            cell.style.cssText=`width:${CELL}px;height:${CELL}px;display:flex;align-items:center;justify-content:center;font-size:28px;cursor:pointer;`;
            cell.style.background=(r+c)%2===0?'#2a1a0a':'#1a0a00';
            if(selected&&selected[0]===r&&selected[1]===c) cell.style.background='#003355';
            if(moveSet.has(`${r},${c}`)) cell.style.background='#004400';
            const p=board[r][c];
            if(p){ cell.textContent=p.includes('r')?'🔴':'⚫'; if(p.includes('K')) cell.style.border='2px solid gold'; }
            cell.onclick=()=>cellClick(r,c);
            boardDiv.appendChild(cell);
        }
    }
    function cellClick(r,c){
        if(done||turn!=='r') return;
        if(board[r][c]&&board[r][c].includes('r')){ selected=[r,c]; render(); return; }
        if(!selected) return;
        const moves=getMoves(selected[0],selected[1]);
        const m=moves.find(mv=>mv.r===r&&mv.c===c);
        if(!m){ selected=null; render(); return; }
        board[r][c]=board[selected[0]][selected[1]]; board[selected[0]][selected[1]]=null;
        if(m.cap){ board[m.cap.r][m.cap.c]=null; score+=10; cb.onScore(score); }
        if(r===0&&board[r][c]==='r') board[r][c]='rK';
        selected=null; turn='b'; render();
        if(!board.flat().some(p=>p&&p.includes('b'))){ done=true; score+=50; cb.onScore(score); cb.onGameOver(score); info.textContent='Você venceu! 🎉'; render(); return; }
        setTimeout(aiTurn,600);
    }
    function aiTurn(){
        if(done) return;
        let best=null, bestCap=false;
        for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
            if(!board[r][c]||!board[r][c].includes('b')) continue;
            getMoves(r,c).forEach(m=>{
                if(!best||m.cap&&!bestCap||(Math.random()<0.3)){ best={fr:r,fc:c,...m}; bestCap=!!m.cap; }
            });
        }
        if(!best){ done=true; score+=50; cb.onScore(score); cb.onGameOver(score); info.textContent='Você venceu! 🎉'; render(); return; }
        board[best.r][best.c]=board[best.fr][best.fc]; board[best.fr][best.fc]=null;
        if(best.cap) board[best.cap.r][best.cap.c]=null;
        if(best.r===7&&board[best.r][best.c]==='b') board[best.r][best.c]='bK';
        if(!board.flat().some(p=>p&&p.includes('r'))){ done=true; cb.onGameOver(score); info.textContent='Computador venceu 😔'; }
        turn='r'; render();
    }
    init();
    return { destroy(){} };
};
})();
