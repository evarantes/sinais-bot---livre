(function(){
window.Games.arkanoid = function(container, cb) {
    const W=400, H=500;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    const ROWS=6, COLS=8, BW=W/COLS-4, BH=16;
    let paddle={x:W/2-35,w:70,h:10}, ball={x:W/2,y:H-40,vx:0,vy:0,r:5,launched:false};
    let bricks=[], score=0, lives=3, dead=false, raf, powerups=[];
    const BCOLORS=['#ff0055','#ff6600','#ffcc00','#00ff88','#00f0ff','#aa44ff'];
    function initBricks(){
        bricks=[];
        for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
            const hp=r<2?2:1;
            bricks.push({x:c*(BW+4)+2,y:r*(BH+4)+40,w:BW,h:BH,hp,color:BCOLORS[r]});
        }
    }
    initBricks();
    function update(){
        if(dead) return;
        if(!ball.launched){ ball.x=paddle.x+paddle.w/2; ball.y=H-paddle.h-15; return; }
        ball.x+=ball.vx; ball.y+=ball.vy;
        if(ball.x<ball.r||ball.x>W-ball.r) ball.vx*=-1;
        if(ball.y<ball.r) ball.vy*=-1;
        if(ball.y>H){ lives--; if(lives<=0){ dead=true; cb.onGameOver(score); } else { ball.launched=false; ball.vx=0; ball.vy=0; } return; }
        if(ball.y+ball.r>=H-paddle.h-5&&ball.x>=paddle.x&&ball.x<=paddle.x+paddle.w){
            ball.vy=-Math.abs(ball.vy); ball.vx+=(ball.x-(paddle.x+paddle.w/2))*0.12;
        }
        bricks.forEach(b=>{
            if(b.hp<=0) return;
            if(ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.w&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.h){
                b.hp--; ball.vy*=-1; score+=b.hp<=0?15:5; cb.onScore(score);
                if(Math.random()<0.15&&b.hp<=0) powerups.push({x:b.x+b.w/2,y:b.y,vy:2,type:Math.random()<0.5?'wide':'life'});
            }
        });
        powerups.forEach(p=>{ p.y+=p.vy;
            if(p.y>H-paddle.h-10&&p.x>=paddle.x&&p.x<=paddle.x+paddle.w){
                if(p.type==='wide') paddle.w=Math.min(120,paddle.w+20);
                if(p.type==='life') lives++;
                p.y=H+50;
            }
        });
        powerups=powerups.filter(p=>p.y<H+50);
        if(bricks.every(b=>b.hp<=0)){ score+=100; cb.onScore(score); initBricks(); ball.launched=false; ball.vx=0; ball.vy=0; }
    }
    function draw(){
        ctx.fillStyle='#0a0a2e'; ctx.fillRect(0,0,W,H);
        bricks.forEach(b=>{ if(b.hp<=0) return; ctx.globalAlpha=b.hp>1?1:0.7; ctx.fillStyle=b.color; ctx.fillRect(b.x,b.y,b.w,b.h); }); ctx.globalAlpha=1;
        ctx.fillStyle='#00f0ff'; ctx.fillRect(paddle.x,H-paddle.h-5,paddle.w,paddle.h);
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();
        powerups.forEach(p=>{ ctx.fillStyle=p.type==='wide'?'#00ff88':'#ff00aa'; ctx.beginPath(); ctx.arc(p.x,p.y,6,0,Math.PI*2); ctx.fill(); });
        ctx.fillStyle='#ff0055'; ctx.font='14px "Press Start 2P"'; ctx.fillText('❤️'.repeat(lives),10,25);
        if(dead){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#ff00aa'; ctx.font='20px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('GAME OVER',W/2,H/2); ctx.fillStyle='#aaa'; ctx.font='12px Inter'; ctx.fillText('R para reiniciar',W/2,H/2+30); ctx.textAlign='start'; }
        else if(!ball.launched){ ctx.fillStyle='#8888aa'; ctx.font='12px Inter'; ctx.textAlign='center'; ctx.fillText('ESPAÇO para lançar',W/2,H-40); ctx.textAlign='start'; }
    }
    function mm(e){ const r=canvas.getBoundingClientRect(); paddle.x=Math.max(0,Math.min(W-paddle.w,e.clientX-r.left-paddle.w/2)); }
    canvas.addEventListener('mousemove',mm);
    function kd(e){
        if(e.key===' '&&!ball.launched&&!dead){ ball.launched=true; ball.vx=(Math.random()-0.5)*3; ball.vy=-4; e.preventDefault(); }
        if(e.key==='ArrowLeft') paddle.x=Math.max(0,paddle.x-20);
        if(e.key==='ArrowRight') paddle.x=Math.min(W-paddle.w,paddle.x+20);
        if((e.key==='r'||e.key==='R')&&dead){ dead=false; score=0; lives=3; paddle.w=70; initBricks(); ball.launched=false; cb.onScore(0); }
        if(['ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    }
    document.addEventListener('keydown',kd);
    function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); } };
};
})();
