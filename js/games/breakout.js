(function(){
window.Games.breakout = function(container, cb) {
    const W=480, H=400;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    const ROWS=5, COLS=8, BW=W/COLS-4, BH=18;
    let paddle={x:W/2-40,w:80,h:10}, ball={x:W/2,y:H-30,vx:3,vy:-3,r:5};
    let bricks=[], score=0, dead=false, raf;
    const BCOLORS=['#ff0055','#ff6600','#ffcc00','#00ff88','#00f0ff'];
    function initBricks(){ bricks=[]; for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) bricks.push({x:c*(BW+4)+2,y:r*(BH+4)+40,w:BW,h:BH,alive:true,color:BCOLORS[r]}); }
    initBricks();
    function update(){
        if(dead) return;
        ball.x+=ball.vx; ball.y+=ball.vy;
        if(ball.x<ball.r||ball.x>W-ball.r) ball.vx*=-1;
        if(ball.y<ball.r) ball.vy*=-1;
        if(ball.y>H){ dead=true; cb.onGameOver(score); return; }
        if(ball.y+ball.r>=H-paddle.h-5&&ball.x>=paddle.x&&ball.x<=paddle.x+paddle.w){
            ball.vy=-Math.abs(ball.vy); ball.vx+=(ball.x-(paddle.x+paddle.w/2))*0.1;
        }
        bricks.forEach(b=>{
            if(!b.alive) return;
            if(ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.w&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.h){
                b.alive=false; ball.vy*=-1; score+=10; cb.onScore(score);
            }
        });
        if(bricks.every(b=>!b.alive)){ score+=100; cb.onScore(score); initBricks(); ball.vx*=1.1; ball.vy*=1.1; }
    }
    function draw(){
        ctx.fillStyle='#0a0a2e'; ctx.fillRect(0,0,W,H);
        bricks.forEach(b=>{ if(!b.alive) return; ctx.fillStyle=b.color; ctx.fillRect(b.x,b.y,b.w,b.h); });
        ctx.fillStyle='#00f0ff'; ctx.fillRect(paddle.x,H-paddle.h-5,paddle.w,paddle.h);
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();
        if(dead){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#ff00aa'; ctx.font='20px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('GAME OVER',W/2,H/2); ctx.fillStyle='#aaa'; ctx.font='12px Inter'; ctx.fillText('R para reiniciar',W/2,H/2+30); ctx.textAlign='start'; }
    }
    function mm(e){ const r=canvas.getBoundingClientRect(); paddle.x=Math.max(0,Math.min(W-paddle.w,e.clientX-r.left-paddle.w/2)); }
    function kd(e){
        if(e.key==='ArrowLeft') paddle.x=Math.max(0,paddle.x-30);
        if(e.key==='ArrowRight') paddle.x=Math.min(W-paddle.w,paddle.x+30);
        if((e.key==='r'||e.key==='R')&&dead){ dead=false; score=0; ball={x:W/2,y:H-30,vx:3,vy:-3,r:5}; paddle.x=W/2-40; initBricks(); cb.onScore(0); }
        if(['ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    }
    canvas.addEventListener('mousemove',mm); document.addEventListener('keydown',kd);
    function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); canvas.removeEventListener('mousemove',mm); document.removeEventListener('keydown',kd); } };
};
})();
