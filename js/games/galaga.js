(function(){
window.Games.galaga = function(container, cb) {
    const W=400, H=500;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    let ship={x:W/2,y:H-40,w:28,h:20}, bullets=[], enemies=[], eBullets=[], stars=[];
    let score=0, dead=false, raf, keys={}, wave=1, spawnTimer=0;
    for(let i=0;i<50;i++) stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+0.5});

    function spawnWave(){
        for(let i=0;i<6+wave*2;i++){
            const type=Math.floor(Math.random()*3);
            enemies.push({x:50+Math.random()*(W-100),y:-30-i*40,hp:type+1,type,w:24,h:20,phase:Math.random()*Math.PI*2,baseX:50+Math.random()*(W-100)});
        }
    }
    spawnWave();
    function update(){
        if(dead) return;
        if(keys['ArrowLeft']) ship.x=Math.max(0,ship.x-4);
        if(keys['ArrowRight']) ship.x=Math.min(W-ship.w,ship.x+4);
        stars.forEach(s=>{ s.y+=s.s; if(s.y>H) s.y=0; });
        bullets.forEach(b=>b.y-=7); bullets=bullets.filter(b=>b.y>-10);
        eBullets.forEach(b=>b.y+=4); eBullets=eBullets.filter(b=>b.y<H+10);
        spawnTimer++;
        enemies.forEach(e=>{
            if(e.y<80) e.y+=1; else { e.phase+=0.03; e.x=e.baseX+Math.sin(e.phase)*40; }
        });
        if(Math.random()<0.015) enemies.forEach(e=>{ if(Math.random()<0.1) eBullets.push({x:e.x+e.w/2,y:e.y+e.h}); });
        bullets.forEach(b=>enemies.forEach(e=>{
            if(e.hp<=0) return;
            if(b.x>e.x&&b.x<e.x+e.w&&b.y>e.y&&b.y<e.y+e.h){ e.hp--; b.y=-100; if(e.hp<=0){ score+=(e.type+1)*15; cb.onScore(score); } }
        }));
        enemies=enemies.filter(e=>e.hp>0);
        eBullets.forEach(b=>{ if(b.x>ship.x&&b.x<ship.x+ship.w&&b.y>ship.y&&b.y<ship.y+ship.h){ dead=true; cb.onGameOver(score); } });
        if(!enemies.length){ wave++; spawnWave(); }
    }
    function draw(){
        ctx.fillStyle='#0a0a1a'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#334'; stars.forEach(s=>ctx.fillRect(s.x,s.y,1,1));
        ctx.fillStyle='#00f0ff';
        ctx.beginPath(); ctx.moveTo(ship.x+ship.w/2,ship.y); ctx.lineTo(ship.x,ship.y+ship.h); ctx.lineTo(ship.x+ship.w,ship.y+ship.h); ctx.fill();
        ctx.fillStyle='#00ff88'; bullets.forEach(b=>ctx.fillRect(b.x-1,b.y,3,8));
        const EC=['#ff0055','#ffcc00','#aa44ff'];
        enemies.forEach(e=>{ ctx.fillStyle=EC[e.type]; ctx.fillRect(e.x,e.y,e.w,e.h); if(e.hp>1){ ctx.fillStyle='#fff'; ctx.font='10px sans-serif'; ctx.fillText(e.hp,e.x+8,e.y+14); } });
        ctx.fillStyle='#ff4444'; eBullets.forEach(b=>ctx.fillRect(b.x-1,b.y,3,6));
        if(dead){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#ff00aa'; ctx.font='20px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('GAME OVER',W/2,H/2); ctx.fillStyle='#aaa'; ctx.font='12px Inter'; ctx.fillText('R para reiniciar',W/2,H/2+30); ctx.textAlign='start'; }
    }
    let shootCD=0;
    function kd(e){
        keys[e.key]=true;
        if(e.key===' '&&!dead&&shootCD<=0){ bullets.push({x:ship.x+ship.w/2,y:ship.y}); shootCD=6; e.preventDefault(); }
        if((e.key==='r'||e.key==='R')&&dead){ ship.x=W/2; bullets=[]; enemies=[]; eBullets=[]; score=0; dead=false; wave=1; spawnWave(); cb.onScore(0); }
        if(['ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    }
    function ku(e){ keys[e.key]=false; }
    document.addEventListener('keydown',kd); document.addEventListener('keyup',ku);
    function loop(){ update(); draw(); if(shootCD>0) shootCD--; raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); document.removeEventListener('keyup',ku); } };
};
})();
