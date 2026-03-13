(function(){
window.Games.sokoban = function(container, cb) {
    const SZ=36;
    const LEVELS=[
        {map:['#####','#   #','# $ #','# . #','# @ #','#####'],w:5,h:6},
        {map:['######','#    #','# $$ #','# .. #','# @  #','######'],w:6,h:6},
        {map:['#######','#     #','# $.$ #','#  @  #','# $.$ #','#     #','#######'],w:7,h:7},
        {map:['########','#   #  #','# $  $ #','# .##. #','#  @   #','########'],w:8,h:6},
        {map:['########','#      #','# $$.$ #','#.# #.##','# $  @ #','#   #  #','########'],w:8,h:7},
    ];
    let level=0, grid, playerPos, moves, score=0, done;
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:12px;';
    const info=document.createElement('div'); info.style.cssText='font-size:14px;color:#8888aa;';
    const canvas=document.createElement('canvas');
    const restartBtn=document.createElement('button'); restartBtn.className='btn btn-secondary'; restartBtn.textContent='Reiniciar Nível'; restartBtn.onclick=()=>loadLevel(level);
    wrap.append(info,canvas,restartBtn); container.appendChild(wrap);
    const ctx=canvas.getContext('2d');

    function loadLevel(n){
        if(n>=LEVELS.length){ done=true; cb.onGameOver(score); return; }
        const lv=LEVELS[n]; canvas.width=lv.w*SZ; canvas.height=lv.h*SZ;
        grid=lv.map.map(row=>row.split(''));
        playerPos=null; moves=0; done=false;
        for(let r=0;r<grid.length;r++) for(let c=0;c<grid[r].length;c++) if(grid[r][c]==='@'){ playerPos={r,c}; grid[r][c]=' '; }
        draw();
    }
    function draw(){
        const lv=LEVELS[level];
        ctx.fillStyle='#0a0a2e'; ctx.fillRect(0,0,canvas.width,canvas.height);
        info.textContent=done?'🎉 Todos os níveis completos!':`Nível ${level+1}/${LEVELS.length} | Movimentos: ${moves}`;
        for(let r=0;r<grid.length;r++) for(let c=0;c<grid[r].length;c++){
            const x=c*SZ, y=r*SZ, ch=grid[r][c];
            if(ch==='#'){ ctx.fillStyle='#3a3a6a'; ctx.fillRect(x,y,SZ,SZ); }
            else {
                if(ch==='.'||ch==='*'){ ctx.fillStyle='rgba(0,255,136,0.2)'; ctx.fillRect(x,y,SZ,SZ); ctx.fillStyle='#00ff88'; ctx.beginPath(); ctx.arc(x+SZ/2,y+SZ/2,4,0,Math.PI*2); ctx.fill(); }
                if(ch==='$'||ch==='*'){ ctx.fillStyle=ch==='*'?'#00ff88':'#ffcc00'; ctx.fillRect(x+6,y+6,SZ-12,SZ-12); }
            }
        }
        if(playerPos){ ctx.fillStyle='#00f0ff'; ctx.beginPath(); ctx.arc(playerPos.c*SZ+SZ/2,playerPos.r*SZ+SZ/2,SZ/2-4,0,Math.PI*2); ctx.fill(); }
    }
    function move(dr,dc){
        if(done) return;
        const nr=playerPos.r+dr, nc=playerPos.c+dc;
        if(nr<0||nr>=grid.length||nc<0||nc>=grid[0].length||grid[nr][nc]==='#') return;
        if(grid[nr][nc]==='$'||grid[nr][nc]==='*'){
            const br=nr+dr, bc=nc+dc;
            if(br<0||br>=grid.length||bc<0||bc>=grid[0].length||grid[br][bc]==='#'||grid[br][bc]==='$'||grid[br][bc]==='*') return;
            grid[br][bc]=grid[br][bc]==='.'?'*':'$';
            grid[nr][nc]=grid[nr][nc]==='*'?'.':' ';
        }
        playerPos={r:nr,c:nc}; moves++;
        if(checkWin()){ score+=Math.max(10,100-moves*2); cb.onScore(score); level++; setTimeout(()=>loadLevel(level),500); }
        draw();
    }
    function checkWin(){
        for(let r=0;r<grid.length;r++) for(let c=0;c<grid[r].length;c++) if(grid[r][c]==='$') return false;
        return true;
    }
    function kd(e){
        if(e.key==='ArrowUp') move(-1,0);
        else if(e.key==='ArrowDown') move(1,0);
        else if(e.key==='ArrowLeft') move(0,-1);
        else if(e.key==='ArrowRight') move(0,1);
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    }
    document.addEventListener('keydown',kd);
    loadLevel(0);
    return { destroy(){ document.removeEventListener('keydown',kd); } };
};
})();
