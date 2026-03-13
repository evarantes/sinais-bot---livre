(function(){
window.Games.fruitninja = function(container, cb) {
    const W=400, H=500;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    const FRUITS=['🍎','🍊','🍋','🍇','🍉','🍓','🍑','🥝'];
    let fruits=[], slices=[], score=0, misses=0, dead=false, raf, mouseX=0, mouseY=0, lastX=0, lastY=0, trail=[];

    function spawn(){
        if(dead) return;
        fruits.push({
            x:Math.random()*W, y:H+30,
            vx:(Math.random()-0.5)*4, vy:-10-Math.random()*4,
            emoji:FRUITS[Math.floor(Math.random()*FRUITS.length)],
            r:25, sliced:false
        });
    }
    function update(){
        if(dead) return;
        fruits.forEach(f=>{
            f.vy+=0.15; f.x+=f.vx; f.y+=f.vy;
            if(!f.sliced&&f.y>H+50){ misses++; f.sliced=true; if(misses>=3){ dead=true; cb.onGameOver(score); } }
        });
        fruits=fruits.filter(f=>f.y<H+100);
        slices=slices.filter(s=>{ s.life--; return s.life>0; });
        trail.push({x:mouseX,y:mouseY,life:10});
        trail=trail.filter(t=>{ t.life--; return t.life>0; });
        const dx=mouseX-lastX, dy=mouseY-lastY;
        if(Math.sqrt(dx*dx+dy*dy)>8){
            fruits.forEach(f=>{
                if(f.sliced) return;
                const dist=Math.sqrt((mouseX-f.x)**2+(mouseY-f.y)**2);
                if(dist<f.r+15){ f.sliced=true; score+=10; cb.onScore(score);
                    slices.push({x:f.x,y:f.y,emoji:f.emoji,life:20});
                }
            });
        }
        lastX=mouseX; lastY=mouseY;
    }
    function draw(){
        ctx.fillStyle='#0a0a2e'; ctx.fillRect(0,0,W,H);
        trail.forEach(t=>{ ctx.globalAlpha=t.life/10*0.5; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(t.x,t.y,3,0,Math.PI*2); ctx.fill(); });
        ctx.globalAlpha=1;
        fruits.forEach(f=>{ if(f.sliced) return; ctx.font='40px serif'; ctx.textAlign='center'; ctx.fillText(f.emoji,f.x,f.y+12); });
        slices.forEach(s=>{ ctx.globalAlpha=s.life/20; ctx.font='30px serif'; ctx.textAlign='center'; ctx.fillText(s.emoji,s.x+(20-s.life)*2,s.y-10); });
        ctx.globalAlpha=1;
        ctx.fillStyle='#ff0055'; ctx.font='14px "Press Start 2P"'; ctx.textAlign='left';
        for(let i=0;i<3;i++) ctx.fillText(i<3-misses?'❤️':'🖤',10+i*30,25);
        ctx.textAlign='start';
        if(dead){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#ff00aa'; ctx.font='20px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('GAME OVER',W/2,H/2-10); ctx.fillStyle='#ffcc00'; ctx.font='14px "Press Start 2P"'; ctx.fillText(score+' pts',W/2,H/2+20); ctx.fillStyle='#aaa'; ctx.font='12px Inter'; ctx.fillText('R para reiniciar',W/2,H/2+50); ctx.textAlign='start'; }
    }
    let spawnTimer=setInterval(spawn,800);
    function mm(e){ const r=canvas.getBoundingClientRect(); mouseX=e.clientX-r.left; mouseY=e.clientY-r.top; }
    canvas.addEventListener('mousemove',mm);
    function kd(e){ if((e.key==='r'||e.key==='R')&&dead){ fruits=[]; slices=[]; score=0; misses=0; dead=false; trail=[]; cb.onScore(0); } }
    document.addEventListener('keydown',kd);
    function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); clearInterval(spawnTimer); document.removeEventListener('keydown',kd); } };
};
})();
