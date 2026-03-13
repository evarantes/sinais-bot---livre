(function(){
window.Games.maze = function(container, cb) {
    const ROWS=15, COLS=15, SZ=28;
    const canvas=document.createElement('canvas'); canvas.width=COLS*SZ; canvas.height=ROWS*SZ; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    let maze, px, py, score=0, moves=0, level=1;

    function generate(){
        maze=Array.from({length:ROWS},()=>Array(COLS).fill(1));
        function carve(r,c){
            maze[r][c]=0;
            const dirs=[[0,2],[0,-2],[2,0],[-2,0]].sort(()=>Math.random()-0.5);
            for(const [dr,dc] of dirs){
                const nr=r+dr, nc=c+dc;
                if(nr>0&&nr<ROWS-1&&nc>0&&nc<COLS-1&&maze[nr][nc]===1){
                    maze[r+dr/2][c+dc/2]=0; carve(nr,nc);
                }
            }
        }
        carve(1,1); maze[1][1]=0; maze[ROWS-2][COLS-2]=0;
        px=1; py=1; moves=0;
    }
    function draw(){
        ctx.fillStyle='#0a0a2e'; ctx.fillRect(0,0,canvas.width,canvas.height);
        for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
            if(maze[r][c]===1){ ctx.fillStyle='#2a2a5a'; ctx.fillRect(c*SZ,r*SZ,SZ,SZ); }
        }
        ctx.fillStyle='#00ff88'; ctx.fillRect((COLS-2)*SZ+4,(ROWS-2)*SZ+4,SZ-8,SZ-8);
        ctx.fillStyle='#00f0ff'; ctx.beginPath(); ctx.arc(px*SZ+SZ/2,py*SZ+SZ/2,SZ/3,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#8888aa'; ctx.font='12px Inter'; ctx.fillText(`Nível: ${level} | Movimentos: ${moves}`,5,ROWS*SZ-5);
    }
    function kd(e){
        let nx=px, ny=py;
        if(e.key==='ArrowUp') ny--;
        else if(e.key==='ArrowDown') ny++;
        else if(e.key==='ArrowLeft') nx--;
        else if(e.key==='ArrowRight') nx++;
        else return;
        e.preventDefault();
        if(nx>=0&&nx<COLS&&ny>=0&&ny<ROWS&&maze[ny][nx]===0){
            px=nx; py=ny; moves++;
            if(px===COLS-2&&py===ROWS-2){
                const pts=Math.max(10,100-moves); score+=pts; cb.onScore(score);
                level++;
                if(level>5){ cb.onGameOver(score); }
                else { generate(); }
            }
            draw();
        }
    }
    document.addEventListener('keydown',kd);
    generate(); draw();
    return { destroy(){ document.removeEventListener('keydown',kd); } };
};
})();
