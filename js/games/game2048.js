(function(){
window.Games.game2048 = function(container, cb) {
    const SZ=4;
    let grid, score, dead;
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:16px;';
    const scoreDiv=document.createElement('div'); scoreDiv.style.cssText='font-size:16px;color:#ffcc00;font-weight:bold;';
    const board=document.createElement('div'); board.style.cssText='display:grid;grid-template-columns:repeat(4,80px);gap:8px;background:#12122a;padding:10px;border-radius:12px;';
    const restartBtn=document.createElement('button'); restartBtn.className='btn btn-secondary'; restartBtn.textContent='Nova Partida'; restartBtn.onclick=init;
    wrap.append(scoreDiv,board,restartBtn); container.appendChild(wrap);

    const COLORS={0:'#1a1a3e',2:'#2a2a5a',4:'#3a3a6a',8:'#ff6600',16:'#ff4400',32:'#ff2200',64:'#ff0055',128:'#ffcc00',256:'#00ff88',512:'#00f0ff',1024:'#aa44ff',2048:'#ff00aa'};
    function init(){
        grid=Array.from({length:SZ},()=>Array(SZ).fill(0)); score=0; dead=false;
        addTile(); addTile(); render(); cb.onScore(0);
    }
    function addTile(){
        const empty=[];
        for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++) if(!grid[r][c]) empty.push([r,c]);
        if(!empty.length) return;
        const [r,c]=empty[Math.floor(Math.random()*empty.length)];
        grid[r][c]=Math.random()<0.9?2:4;
    }
    function slide(row){
        let a=row.filter(v=>v), merged=false;
        for(let i=0;i<a.length-1;i++) if(a[i]===a[i+1]){ a[i]*=2; score+=a[i]; a.splice(i+1,1); merged=true; }
        while(a.length<SZ) a.push(0);
        return {row:a, changed:a.some((v,i)=>v!==row[i])};
    }
    function move(dir){
        if(dead) return;
        let moved=false;
        if(dir==='left') for(let r=0;r<SZ;r++){ const res=slide(grid[r]); if(res.changed){ grid[r]=res.row; moved=true; } }
        else if(dir==='right') for(let r=0;r<SZ;r++){ const res=slide([...grid[r]].reverse()); if(res.changed){ grid[r]=res.row.reverse(); moved=true; } }
        else if(dir==='up') for(let c=0;c<SZ;c++){ const col=grid.map(r=>r[c]); const res=slide(col); if(res.changed){ res.row.forEach((v,r)=>grid[r][c]=v); moved=true; } }
        else if(dir==='down') for(let c=0;c<SZ;c++){ const col=grid.map(r=>r[c]).reverse(); const res=slide(col); if(res.changed){ res.row.reverse().forEach((v,r)=>grid[r][c]=v); moved=true; } }
        if(moved){ addTile(); cb.onScore(score); if(isGameOver()){ dead=true; cb.onGameOver(score); } }
        render();
    }
    function isGameOver(){
        for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
            if(!grid[r][c]) return false;
            if(c<SZ-1&&grid[r][c]===grid[r][c+1]) return false;
            if(r<SZ-1&&grid[r][c]===grid[r+1][c]) return false;
        }
        return true;
    }
    function render(){
        board.innerHTML=''; scoreDiv.textContent='Pontos: '+score;
        for(let r=0;r<SZ;r++) for(let c=0;c<SZ;c++){
            const cell=document.createElement('div');
            const v=grid[r][c];
            cell.style.cssText=`width:80px;height:80px;display:flex;align-items:center;justify-content:center;border-radius:8px;font-weight:bold;font-size:${v>=1024?'18px':v>=128?'22px':'26px'};`;
            cell.style.background=COLORS[v]||'#aa44ff'; cell.style.color=v<=4?'#8888aa':'#fff';
            cell.textContent=v||'';
            board.appendChild(cell);
        }
    }
    function kd(e){
        const map={'ArrowLeft':'left','ArrowRight':'right','ArrowUp':'up','ArrowDown':'down'};
        if(map[e.key]){ e.preventDefault(); move(map[e.key]); }
        if((e.key==='r'||e.key==='R')&&dead) init();
    }
    document.addEventListener('keydown',kd);
    init();
    return { destroy(){ document.removeEventListener('keydown',kd); } };
};
})();
