(function(){
window.Games.tictactoe = function(container, cb) {
    let board=Array(9).fill(null), turn='X', done=false, score=0, wins=0;
    const div = document.createElement('div');
    div.style.cssText='display:flex;flex-direction:column;align-items:center;gap:16px;';
    const info = document.createElement('div');
    info.style.cssText='font-size:18px;font-weight:bold;color:#00f0ff;min-height:30px;';
    const grid = document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:repeat(3,90px);gap:8px;';
    const restartBtn = document.createElement('button');
    restartBtn.textContent='Nova Partida'; restartBtn.className='btn btn-secondary';
    restartBtn.onclick=restart;
    div.append(info,grid,restartBtn); container.appendChild(div);

    function render(){
        grid.innerHTML='';
        board.forEach((v,i)=>{
            const cell=document.createElement('div');
            cell.style.cssText='width:90px;height:90px;display:flex;align-items:center;justify-content:center;background:#1a1a3e;border:1px solid #2a2a5a;border-radius:8px;font-size:36px;cursor:pointer;transition:all 0.2s;font-weight:bold;';
            cell.style.color=v==='X'?'#00f0ff':'#ff00aa';
            cell.textContent=v||'';
            cell.onmouseenter=()=>{ if(!v&&!done) cell.style.background='#222260'; };
            cell.onmouseleave=()=>{ cell.style.background='#1a1a3e'; };
            cell.onclick=()=>{ if(!v&&!done&&turn==='X') makeMove(i); };
            grid.appendChild(cell);
        });
        info.textContent=done? (checkWin('X')?'Você venceu! 🎉':checkWin('O')?'Computador venceu':'Empate!') : 'Sua vez (X)';
    }
    function makeMove(i){
        board[i]='X';
        if(checkEnd()) { render(); return; }
        turn='O';
        info.textContent='Computador pensando...';
        render();
        setTimeout(()=>{ aiMove(); turn='X'; checkEnd(); render(); },400);
    }
    function aiMove(){
        const empty=board.map((v,i)=>v===null?i:-1).filter(i=>i>=0);
        if(empty.length===0) return;
        for(let m of empty){ board[m]='O'; if(checkWin('O')){ return; } board[m]=null; }
        for(let m of empty){ board[m]='X'; if(checkWin('X')){ board[m]='O'; return; } board[m]=null; }
        if(board[4]===null){ board[4]='O'; return; }
        board[empty[Math.floor(Math.random()*empty.length)]]='O';
    }
    const WINS=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    function checkWin(p){ return WINS.some(w=>w.every(i=>board[i]===p)); }
    function checkEnd(){
        if(checkWin('X')){ done=true; score+=50; wins++; App.addStat('tictactoe_wins',1); cb.onScore(score); cb.onGameOver(score); return true; }
        if(checkWin('O')){ done=true; cb.onGameOver(score); return true; }
        if(board.every(v=>v!==null)){ done=true; score+=10; cb.onScore(score); cb.onGameOver(score); return true; }
        return false;
    }
    function restart(){ board=Array(9).fill(null); turn='X'; done=false; render(); }
    render();
    return { destroy(){} };
};
})();
