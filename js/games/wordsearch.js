(function(){
window.Games.wordsearch = function(container, cb) {
    const WORDS=['PYTHON','JAVA','HTML','CSS','REACT','NODE','GIT','API'];
    const SZ=10;
    let grid, placed, found, score;
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:12px;';
    const info=document.createElement('div'); info.style.cssText='font-size:14px;color:#8888aa;';
    const wordsDiv=document.createElement('div'); wordsDiv.style.cssText='display:flex;flex-wrap:wrap;gap:8px;justify-content:center;';
    const board=document.createElement('div'); board.style.cssText=`display:grid;grid-template-columns:repeat(${SZ},36px);gap:2px;`;
    const restartBtn=document.createElement('button'); restartBtn.className='btn btn-secondary'; restartBtn.textContent='Novo Jogo'; restartBtn.onclick=init;
    wrap.append(info,wordsDiv,board,restartBtn); container.appendChild(wrap);

    let selecting=false, selStart=null, selCells=[];
    function init(){
        grid=Array.from({length:SZ},()=>Array(SZ).fill('')); placed=[]; found=[]; score=0; cb.onScore(0);
        WORDS.forEach(w=>placeWord(w));
        for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++) if(!grid[r][c]) grid[r][c]=String.fromCharCode(65+Math.floor(Math.random()*26));
        render();
    }
    function placeWord(word){
        const dirs=[[0,1],[1,0],[1,1],[0,-1],[-1,0]];
        for(let attempt=0;attempt<100;attempt++){
            const [dr,dc]=dirs[Math.floor(Math.random()*dirs.length)];
            const r=Math.floor(Math.random()*SZ), c=Math.floor(Math.random()*SZ);
            let ok=true;
            for(let i=0;i<word.length;i++){
                const nr=r+dr*i, nc=c+dc*i;
                if(nr<0||nr>=SZ||nc<0||nc>=SZ||(grid[nr][nc]&&grid[nr][nc]!==word[i])){ ok=false; break; }
            }
            if(ok){
                for(let i=0;i<word.length;i++) grid[r+dr*i][c+dc*i]=word[i];
                placed.push(word); return;
            }
        }
    }
    function getCellsBetween(r1,c1,r2,c2){
        const cells=[];
        const dr=Math.sign(r2-r1), dc=Math.sign(c2-c1);
        const len=Math.max(Math.abs(r2-r1),Math.abs(c2-c1));
        for(let i=0;i<=len;i++) cells.push([r1+dr*i,c1+dc*i]);
        return cells;
    }
    function render(){
        info.textContent=`Encontradas: ${found.length}/${placed.length}`;
        wordsDiv.innerHTML='';
        placed.forEach(w=>{
            const s=document.createElement('span');
            s.style.cssText=`padding:4px 8px;border-radius:4px;font-size:12px;font-weight:bold;${found.includes(w)?'background:rgba(0,255,136,0.2);color:#00ff88;text-decoration:line-through;':'background:#1a1a3e;color:#8888aa;'}`;
            s.textContent=w; wordsDiv.appendChild(s);
        });
        board.innerHTML='';
        const foundCells=new Set();
        found.forEach(w=>{
            for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
                [[0,1],[1,0],[1,1],[0,-1],[-1,0]].forEach(([dr,dc])=>{
                    let ok=true;
                    for(let i=0;i<w.length;i++){ const nr=r+dr*i,nc=c+dc*i; if(nr<0||nr>=SZ||nc<0||nc>=SZ||grid[nr][nc]!==w[i]){ ok=false; break; } }
                    if(ok) for(let i=0;i<w.length;i++) foundCells.add(`${r+dr*i},${c+dc*i}`);
                });
            }
        });
        const selSet=new Set(selCells.map(([r,c])=>`${r},${c}`));
        for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
            const cell=document.createElement('div');
            cell.style.cssText='width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:14px;font-weight:bold;cursor:pointer;user-select:none;';
            cell.style.background=foundCells.has(`${r},${c}`)?'rgba(0,255,136,0.2)':selSet.has(`${r},${c}`)?'rgba(0,240,255,0.2)':'#1a1a3e';
            cell.style.color=foundCells.has(`${r},${c}`)?'#00ff88':'#e8e8f0';
            cell.textContent=grid[r][c];
            cell.onmousedown=(e)=>{ e.preventDefault(); selecting=true; selStart=[r,c]; selCells=[[r,c]]; render(); };
            cell.onmouseenter=()=>{ if(selecting){ selCells=getCellsBetween(selStart[0],selStart[1],r,c); render(); } };
            cell.onmouseup=()=>{ if(selecting){ checkSelection(); selecting=false; selCells=[]; render(); } };
            board.appendChild(cell);
        }
    }
    function checkSelection(){
        const word=selCells.map(([r,c])=>grid[r][c]).join('');
        const wordRev=word.split('').reverse().join('');
        placed.forEach(w=>{
            if(!found.includes(w)&&(word===w||wordRev===w)){
                found.push(w); score+=20; cb.onScore(score);
                if(found.length===placed.length){ score+=50; cb.onScore(score); cb.onGameOver(score); }
            }
        });
    }
    document.addEventListener('mouseup',()=>{ if(selecting){ selecting=false; selCells=[]; render(); } });
    init();
    return { destroy(){} };
};
})();
