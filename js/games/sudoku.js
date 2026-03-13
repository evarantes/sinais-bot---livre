(function(){
window.Games.sudoku = function(container, cb) {
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:12px;';
    const info=document.createElement('div'); info.style.cssText='font-size:14px;color:#8888aa;';
    const board=document.createElement('div'); board.style.cssText='display:grid;grid-template-columns:repeat(9,40px);gap:1px;background:#2a2a5a;padding:1px;border-radius:4px;';
    const numPad=document.createElement('div'); numPad.style.cssText='display:flex;gap:6px;';
    const restartBtn=document.createElement('button'); restartBtn.className='btn btn-secondary'; restartBtn.textContent='Novo Jogo'; restartBtn.onclick=init;
    wrap.append(info,board,numPad,restartBtn); container.appendChild(wrap);

    let solution, puzzle, selected=null, score=0, errors=0;
    function generateBoard(){
        const base=[[1,2,3,4,5,6,7,8,9],[4,5,6,7,8,9,1,2,3],[7,8,9,1,2,3,4,5,6],
            [2,3,1,5,6,4,8,9,7],[5,6,4,8,9,7,2,3,1],[8,9,7,2,3,1,5,6,4],
            [3,1,2,6,4,5,9,7,8],[6,4,5,9,7,8,3,1,2],[9,7,8,3,1,2,6,4,5]];
        for(let i=0;i<20;i++){
            const a=Math.floor(Math.random()*3)*3, b=a+Math.floor(Math.random()*3), c=a+Math.floor(Math.random()*3);
            if(b!==c) base.forEach(r=>[r[b],r[c]]=[r[c],r[b]]);
        }
        solution=base.map(r=>[...r]);
        puzzle=base.map(r=>[...r]);
        let removals=40;
        while(removals>0){
            const r=Math.floor(Math.random()*9), c=Math.floor(Math.random()*9);
            if(puzzle[r][c]!==0){ puzzle[r][c]=0; removals--; }
        }
    }
    function render(){
        info.textContent=`Erros: ${errors}/3`;
        board.innerHTML='';
        for(let r=0;r<9;r++) for(let c=0;c<9;c++){
            const cell=document.createElement('div');
            cell.style.cssText='width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:bold;cursor:pointer;';
            cell.style.background=(selected&&selected[0]===r&&selected[1]===c)?'rgba(0,240,255,0.2)':'#12122a';
            const isOriginal=solution[r][c]===puzzle[r][c]&&puzzle[r][c]!==0;
            cell.style.color=puzzle[r][c]===0?'transparent':isOriginal?'#8888aa':'#00f0ff';
            cell.textContent=puzzle[r][c]||'';
            if(c%3===2&&c<8) cell.style.borderRight='2px solid #3a3a6a';
            if(r%3===2&&r<8) cell.style.borderBottom='2px solid #3a3a6a';
            cell.onclick=()=>{ if(solution[r][c]!==puzzle[r][c]||puzzle[r][c]===0){ selected=[r,c]; render(); } };
            board.appendChild(cell);
        }
        numPad.innerHTML='';
        for(let n=1;n<=9;n++){
            const btn=document.createElement('button');
            btn.textContent=n; btn.style.cssText='width:36px;height:36px;background:#1a1a3e;border:1px solid #2a2a5a;color:#e8e8f0;border-radius:6px;cursor:pointer;font-weight:bold;';
            btn.onclick=()=>placeNumber(n);
            numPad.appendChild(btn);
        }
    }
    function placeNumber(n){
        if(!selected) return;
        const [r,c]=selected;
        if(solution[r][c]===puzzle[r][c]&&puzzle[r][c]!==0) return;
        if(n===solution[r][c]){
            puzzle[r][c]=n; score+=5; cb.onScore(score);
            if(puzzle.every((row,ri)=>row.every((v,ci)=>v===solution[ri][ci]))){
                score+=100; cb.onScore(score); cb.onGameOver(score);
                info.textContent='🎉 Parabéns! Sudoku completo!'; info.style.color='#00ff88';
            }
        } else {
            errors++;
            if(errors>=3){ cb.onGameOver(score); info.textContent='Game Over!'; info.style.color='#ff0055'; }
        }
        render();
    }
    function kd(e){
        const n=parseInt(e.key);
        if(n>=1&&n<=9) placeNumber(n);
    }
    document.addEventListener('keydown',kd);
    function init(){ selected=null; score=0; errors=0; cb.onScore(0); generateBoard(); render(); }
    init();
    return { destroy(){ document.removeEventListener('keydown',kd); } };
};
})();
