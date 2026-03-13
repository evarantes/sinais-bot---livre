(function(){
window.Games.pacman = function(container, cb) {
    const W=420, H=420, SZ=20, COLS=21, ROWS=21;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    const MAP=[
        '#####################',
        '#.........#.........#',
        '#.###.###.#.###.###.#',
        '#o###.###.#.###.###o#',
        '#...................#',
        '#.###.#.#####.#.###.#',
        '#.....#...#...#.....#',
        '#####.### # ###.#####',
        '    #.#       #.#    ',
        '#####.# ## ## #.#####',
        '     .  #   #  .     ',
        '#####.# ##### #.#####',
        '    #.#       #.#    ',
        '#####.# ##### #.#####',
        '#.........#.........#',
        '#.###.###.#.###.###.#',
        '#o..#.....P.....#..o#',
        '###.#.#.#####.#.#.###',
        '#.....#...#...#.....#',
        '#.#######.#.#######.#',
        '#####################',
    ];
    let grid, pac, ghosts, dots, score, dead, dir, nextDir, raf, power, powerTimer;
    function init(){
        grid=[]; dots=new Set(); pac=null; ghosts=[];
        score=0; dead=false; dir={x:0,y:0}; nextDir={x:0,y:0}; power=false; powerTimer=0;
        for(let r=0;r<ROWS;r++){
            grid[r]=[];
            for(let c=0;c<COLS;c++){
                const ch=MAP[r]?MAP[r][c]:' ';
                if(ch==='#') grid[r][c]=1;
                else { grid[r][c]=0; if(ch==='.'||ch==='o') dots.add(`${r},${c}`); if(ch==='P') pac={x:c,y:r,mouth:0}; }
            }
        }
        ghosts=[{x:10,y:9,color:'#ff0055',dx:0,dy:-1},{x:10,y:10,color:'#00f0ff',dx:1,dy:0},{x:9,y:10,color:'#ffcc00',dx:-1,dy:0},{x:11,y:10,color:'#ff6600',dx:0,dy:1}];
        cb.onScore(0);
    }
    function canMove(x,y){ return x>=0&&x<COLS&&y>=0&&y<ROWS&&grid[y][x]!==1; }
    let moveTimer=0;
    function update(){
        if(dead) return;
        moveTimer++;
        if(moveTimer%4===0){
            if(canMove(pac.x+nextDir.x,pac.y+nextDir.y)) dir=nextDir;
            if(canMove(pac.x+dir.x,pac.y+dir.y)){ pac.x+=dir.x; pac.y+=dir.y; }
            pac.x=(pac.x+COLS)%COLS; pac.y=(pac.y+ROWS)%ROWS;
            const key=`${pac.y},${pac.x}`;
            if(dots.has(key)){
                dots.delete(key);
                const ch=MAP[pac.y]?MAP[pac.y][pac.x]:'';
                score+=ch==='o'?50:10;
                if(ch==='o'){ power=true; powerTimer=60; }
                cb.onScore(score);
                if(dots.size===0){ score+=200; cb.onScore(score); cb.onGameOver(score); dead=true; }
            }
        }
        if(power){ powerTimer--; if(powerTimer<=0) power=false; }
        if(moveTimer%6===0) ghosts.forEach(g=>{
            const dirs=[{dx:0,dy:-1},{dx:0,dy:1},{dx:-1,dy:0},{dx:1,dy:0}];
            const valid=dirs.filter(d=>canMove(g.x+d.dx,g.y+d.dy)&&!(d.dx===-g.dx&&d.dy===-g.dy));
            if(valid.length){
                const best=valid.sort((a,b)=>{
                    const da=Math.abs(g.x+a.dx-pac.x)+Math.abs(g.y+a.dy-pac.y);
                    const db=Math.abs(g.x+b.dx-pac.x)+Math.abs(g.y+b.dy-pac.y);
                    return power?db-da:da-db;
                });
                const d=Math.random()<0.7?best[0]:valid[Math.floor(Math.random()*valid.length)];
                g.dx=d.dx; g.dy=d.dy;
            }
            g.x+=g.dx; g.y+=g.dy;
            g.x=(g.x+COLS)%COLS; g.y=(g.y+ROWS)%ROWS;
        });
        ghosts.forEach(g=>{
            if(g.x===pac.x&&g.y===pac.y){
                if(power){ g.x=10; g.y=10; score+=100; cb.onScore(score); }
                else { dead=true; cb.onGameOver(score); }
            }
        });
        pac.mouth=(pac.mouth+0.15)%1;
    }
    function draw(){
        ctx.fillStyle='#000'; ctx.fillRect(0,0,W,H);
        for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
            if(grid[r][c]===1){ ctx.fillStyle='#0033aa'; ctx.fillRect(c*SZ,r*SZ,SZ,SZ); }
            if(dots.has(`${r},${c}`)){ ctx.fillStyle='#ffcc00'; const s=MAP[r][c]==='o'?4:2; ctx.beginPath(); ctx.arc(c*SZ+SZ/2,r*SZ+SZ/2,s,0,Math.PI*2); ctx.fill(); }
        }
        const m=Math.abs(Math.sin(pac.mouth*Math.PI))*0.3;
        const angle=Math.atan2(dir.y,dir.x);
        ctx.fillStyle='#ffcc00'; ctx.beginPath(); ctx.arc(pac.x*SZ+SZ/2,pac.y*SZ+SZ/2,SZ/2-1,angle+m+0.05,angle-m-0.05+Math.PI*2); ctx.lineTo(pac.x*SZ+SZ/2,pac.y*SZ+SZ/2); ctx.fill();
        ghosts.forEach(g=>{
            ctx.fillStyle=power?'#4444ff':g.color;
            ctx.beginPath(); ctx.arc(g.x*SZ+SZ/2,g.y*SZ+SZ/2-2,SZ/2-2,Math.PI,0); ctx.fillRect(g.x*SZ+2,g.y*SZ+SZ/2-2,SZ-4,SZ/2);
        });
        if(dead){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#ff00aa'; ctx.font='18px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('GAME OVER',W/2,H/2); ctx.fillStyle='#aaa'; ctx.font='11px Inter'; ctx.fillText('R para reiniciar',W/2,H/2+25); ctx.textAlign='start'; }
    }
    function kd(e){
        if(e.key==='ArrowUp') nextDir={x:0,y:-1};
        else if(e.key==='ArrowDown') nextDir={x:0,y:1};
        else if(e.key==='ArrowLeft') nextDir={x:-1,y:0};
        else if(e.key==='ArrowRight') nextDir={x:1,y:0};
        else if((e.key==='r'||e.key==='R')&&dead) init();
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    }
    document.addEventListener('keydown',kd);
    init();
    function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); } };
};
})();
