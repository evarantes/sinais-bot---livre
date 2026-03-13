(function(){
window.Games.bubbleshooter = function(container, cb) {
    const W=360, H=480, R=18, COLS=10;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    const COLORS=['#ff0055','#00ff88','#0066ff','#ffcc00','#aa44ff','#ff6600'];
    let grid=[], shooter={x:W/2,y:H-30,angle:Math.PI/2,color:null}, bullet=null, score=0, dead=false, raf, aimX=W/2;

    function initGrid(){
        grid=[];
        for(let r=0;r<6;r++){
            const row=[];
            for(let c=0;c<COLS;c++){
                const x=c*R*2+R+(r%2?R:0), y=r*R*1.7+R;
                row.push({x,y,color:COLORS[Math.floor(Math.random()*COLORS.length)],alive:true});
            }
            grid.push(row);
        }
    }
    function nextColor(){ shooter.color=COLORS[Math.floor(Math.random()*COLORS.length)]; }
    function shoot(){
        if(bullet||dead) return;
        const dx=aimX-shooter.x, dy=0-shooter.y;
        const mag=Math.sqrt(dx*dx+dy*dy);
        bullet={x:shooter.x,y:shooter.y,vx:dx/mag*6,vy:dy/mag*6,color:shooter.color};
        nextColor();
    }
    function update(){
        if(!bullet||dead) return;
        bullet.x+=bullet.vx; bullet.y+=bullet.vy;
        if(bullet.x<R||bullet.x>W-R) bullet.vx*=-1;
        if(bullet.y<R){ snap(); return; }
        for(const row of grid) for(const b of row){
            if(!b.alive) continue;
            const dx=bullet.x-b.x, dy=bullet.y-b.y;
            if(Math.sqrt(dx*dx+dy*dy)<R*1.8){ snap(); return; }
        }
    }
    function snap(){
        let bestR=-1, bestC=0, bestDist=Infinity;
        for(let r=0;r<grid.length;r++) for(let c=0;c<grid[r].length;c++){
            if(grid[r][c].alive) continue;
            const dx=bullet.x-grid[r][c].x, dy=bullet.y-grid[r][c].y, d=Math.sqrt(dx*dx+dy*dy);
            if(d<bestDist){ bestDist=d; bestR=r; bestC=c; }
        }
        if(bestR>=0&&bestDist<R*3){ grid[bestR][bestC].alive=true; grid[bestR][bestC].color=bullet.color; removeMatches(bestR,bestC); }
        bullet=null;
        if(grid.some(row=>row.some(b=>b.alive&&b.y>H-80))){ dead=true; cb.onGameOver(score); }
    }
    function removeMatches(sr,sc){
        const color=grid[sr][sc].color, visited=new Set(), matches=[];
        function flood(r,c){
            const key=`${r},${c}`; if(visited.has(key)) return; visited.add(key);
            if(r<0||r>=grid.length||c<0||c>=grid[r].length||!grid[r][c].alive||grid[r][c].color!==color) return;
            matches.push([r,c]);
            flood(r-1,c); flood(r+1,c); flood(r,c-1); flood(r,c+1); flood(r-1,c-1); flood(r+1,c+1);
        }
        flood(sr,sc);
        if(matches.length>=3){ matches.forEach(([r,c])=>{ grid[r][c].alive=false; score+=10; }); cb.onScore(score); }
    }
    function draw(){
        ctx.fillStyle='#0a0a2e'; ctx.fillRect(0,0,W,H);
        grid.forEach(row=>row.forEach(b=>{
            if(!b.alive) return;
            ctx.fillStyle=b.color; ctx.beginPath(); ctx.arc(b.x,b.y,R-1,0,Math.PI*2); ctx.fill();
        }));
        if(bullet){ ctx.fillStyle=bullet.color; ctx.beginPath(); ctx.arc(bullet.x,bullet.y,R-1,0,Math.PI*2); ctx.fill(); }
        ctx.fillStyle=shooter.color; ctx.beginPath(); ctx.arc(shooter.x,shooter.y,R,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle='#8888aa'; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(shooter.x,shooter.y);
        const dx=aimX-shooter.x, dy=0-shooter.y, mag=Math.sqrt(dx*dx+dy*dy);
        ctx.lineTo(shooter.x+dx/mag*60,shooter.y+dy/mag*60); ctx.stroke(); ctx.setLineDash([]);
        if(dead){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#ff00aa'; ctx.font='18px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('GAME OVER',W/2,H/2); ctx.textAlign='start'; }
    }
    function mm(e){ const r=canvas.getBoundingClientRect(); aimX=Math.max(0,Math.min(W,e.clientX-r.left)); }
    canvas.addEventListener('mousemove',mm);
    canvas.addEventListener('click',shoot);
    function kd(e){ if((e.key==='r'||e.key==='R')&&dead){ score=0; dead=false; bullet=null; initGrid(); nextColor(); cb.onScore(0); } }
    document.addEventListener('keydown',kd);
    initGrid(); nextColor();
    function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); } };
};
})();
