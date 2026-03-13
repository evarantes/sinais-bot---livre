(function(){
window.Games.pinball = function(container, cb) {
    const W=300, H=500;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    let ball={x:W-30,y:H-80,vx:0,vy:0,r:8}, launched=false, score=0, dead=false, raf, keys={};
    const bumpers=[{x:100,y:150,r:25},{x:200,y:150,r:25},{x:150,y:250,r:25},{x:80,y:320,r:20},{x:220,y:320,r:20}];
    let leftFlipper=0, rightFlipper=0;
    const LF={x:90,y:H-60,len:60,angle:0.3}, RF={x:210,y:H-60,len:60,angle:Math.PI-0.3};

    function launch(){ if(!launched){ ball.vy=-12-Math.random()*3; ball.vx=(Math.random()-0.5)*2; launched=true; } }
    function update(){
        if(dead||!launched) return;
        ball.vy+=0.15; ball.x+=ball.vx; ball.y+=ball.vy;
        if(ball.x<ball.r){ ball.x=ball.r; ball.vx=Math.abs(ball.vx)*0.8; }
        if(ball.x>W-ball.r){ ball.x=W-ball.r; ball.vx=-Math.abs(ball.vx)*0.8; }
        if(ball.y<ball.r){ ball.y=ball.r; ball.vy=Math.abs(ball.vy)*0.8; }
        if(ball.y>H+20){ if(score>0) cb.onGameOver(score); ball={x:W-30,y:H-80,vx:0,vy:0,r:8}; launched=false; }
        bumpers.forEach(b=>{
            const dx=ball.x-b.x, dy=ball.y-b.y, d=Math.sqrt(dx*dx+dy*dy);
            if(d<ball.r+b.r){
                const nx=dx/d, ny=dy/d;
                ball.vx=nx*5; ball.vy=ny*5;
                ball.x=b.x+nx*(ball.r+b.r+1); ball.y=b.y+ny*(ball.r+b.r+1);
                score+=25; cb.onScore(score);
            }
        });
        const lActive=keys['ArrowLeft']||keys['z'];
        const rActive=keys['ArrowRight']||keys['/'];
        leftFlipper+=(lActive?-0.5:0.3-leftFlipper)*0.3;
        rightFlipper+=(rActive?0.5:-(0.3-Math.abs(rightFlipper)))*0.3;
        [{f:LF,a:leftFlipper,dir:1},{f:RF,a:rightFlipper,dir:-1}].forEach(({f,a})=>{
            const fa=f.angle+a;
            const ex=f.x+Math.cos(fa)*f.len, ey=f.y+Math.sin(fa)*f.len;
            const dx=ex-f.x, dy=ey-f.y, t=Math.max(0,Math.min(1,((ball.x-f.x)*dx+(ball.y-f.y)*dy)/(dx*dx+dy*dy)));
            const cx=f.x+t*dx, cy=f.y+t*dy;
            const dist=Math.sqrt((ball.x-cx)**2+(ball.y-cy)**2);
            if(dist<ball.r+5){
                ball.vy=-Math.abs(ball.vy)-3;
                ball.vx+=(ball.x-f.x)*0.05;
                score+=5; cb.onScore(score);
            }
        });
    }
    function draw(){
        ctx.fillStyle='#0a0a2e'; ctx.fillRect(0,0,W,H);
        ctx.strokeStyle='#2a2a5a'; ctx.lineWidth=2; ctx.strokeRect(2,2,W-4,H-4);
        bumpers.forEach(b=>{ ctx.fillStyle='#ff0055'; ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(b.x,b.y,b.r*0.4,0,Math.PI*2); ctx.fill(); });
        [{f:LF,a:leftFlipper},{f:RF,a:rightFlipper}].forEach(({f,a})=>{
            const fa=f.angle+a;
            ctx.strokeStyle='#00f0ff'; ctx.lineWidth=8; ctx.lineCap='round';
            ctx.beginPath(); ctx.moveTo(f.x,f.y); ctx.lineTo(f.x+Math.cos(fa)*f.len,f.y+Math.sin(fa)*f.len); ctx.stroke();
        });
        ctx.fillStyle=launched?'#fff':'#aaa'; ctx.beginPath(); ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2); ctx.fill();
        if(!launched){ ctx.fillStyle='#ffcc00'; ctx.font='12px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('ESPAÇO',W/2,H/2); ctx.fillText('para lançar',W/2,H/2+20); ctx.textAlign='start'; }
    }
    function kd(e){
        keys[e.key]=true;
        if(e.key===' '){ e.preventDefault(); launch(); }
        if(['ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    }
    function ku(e){ keys[e.key]=false; }
    document.addEventListener('keydown',kd); document.addEventListener('keyup',ku);
    function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); document.removeEventListener('keyup',ku); } };
};
})();
