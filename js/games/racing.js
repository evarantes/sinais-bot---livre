(function(){
window.Games.racing = function(container, cb) {
    const W=300, H=500;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    let car={x:W/2-15,w:30,h:50}, obstacles=[], score=0, dead=false, raf, keys={}, speed=3, frame=0;

    function update(){
        if(dead) return;
        frame++; score=Math.floor(frame/10); cb.onScore(score);
        speed=3+frame*0.003;
        if(keys['ArrowLeft']) car.x=Math.max(50,car.x-4);
        if(keys['ArrowRight']) car.x=Math.min(W-50-car.w,car.x+4);
        if(frame%Math.max(15,60-Math.floor(frame/100))===0){
            const lane=50+Math.random()*(W-100-40);
            obstacles.push({x:lane,y:-60,w:35,h:50,color:`hsl(${Math.random()*360},70%,50%)`});
        }
        obstacles.forEach(o=>o.y+=speed);
        obstacles=obstacles.filter(o=>o.y<H+60);
        obstacles.forEach(o=>{
            if(car.x+car.w>o.x&&car.x<o.x+o.w&&H-70+car.h>o.y&&H-70<o.y+o.h){ dead=true; cb.onGameOver(score); }
        });
    }
    function draw(){
        ctx.fillStyle='#333'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#1a1a1a'; ctx.fillRect(50,0,W-100,H);
        ctx.strokeStyle='#ffcc00'; ctx.lineWidth=2; ctx.setLineDash([20,20]);
        ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle='#fff'; ctx.fillRect(48,0,2,H); ctx.fillRect(W-50,0,2,H);
        for(let i=0;i<H;i+=40){ const y=(i+frame*speed)%H; ctx.fillStyle='#555'; ctx.fillRect(48,y,2,20); ctx.fillRect(W-50,y,2,20); }
        ctx.fillStyle='#00f0ff'; ctx.fillRect(car.x,H-70,car.w,car.h);
        ctx.fillStyle='#004466'; ctx.fillRect(car.x+3,H-65,car.w-6,15);
        obstacles.forEach(o=>{ ctx.fillStyle=o.color; ctx.fillRect(o.x,o.y,o.w,o.h); ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(o.x+3,o.y+5,o.w-6,12); });
        if(dead){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#ff00aa'; ctx.font='18px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('BATEU!',W/2,H/2-10); ctx.fillStyle='#ffcc00'; ctx.font='14px "Press Start 2P"'; ctx.fillText(score+' pts',W/2,H/2+20); ctx.fillStyle='#aaa'; ctx.font='11px Inter'; ctx.fillText('R para reiniciar',W/2,H/2+45); ctx.textAlign='start'; }
    }
    function kd(e){ keys[e.key]=true; if((e.key==='r'||e.key==='R')&&dead){ car.x=W/2-15; obstacles=[]; score=0; dead=false; speed=3; frame=0; cb.onScore(0); } if(['ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault(); }
    function ku(e){ keys[e.key]=false; }
    document.addEventListener('keydown',kd); document.addEventListener('keyup',ku);
    function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); document.removeEventListener('keyup',ku); } };
};
})();
