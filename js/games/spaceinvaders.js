(function(){
window.Games.spaceinvaders = function(container, cb) {
    const W=400, H=500;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    let player={x:W/2-15,y:H-40,w:30,h:20}, bullets=[], enemies=[], eBullets=[];
    let score=0, dead=false, raf, keys={}, wave=1;
    function spawnWave(){
        enemies=[];
        for(let r=0;r<3+Math.min(wave,4);r++) for(let c=0;c<8;c++)
            enemies.push({x:30+c*42,y:30+r*32,w:28,h:20,alive:true,type:r%3});
    }
    spawnWave();
    let eDir=1, eSpeed=0.3+wave*0.1, eMoveTimer=0;
    function update(){
        if(dead) return;
        if(keys['ArrowLeft']) player.x=Math.max(0,player.x-4);
        if(keys['ArrowRight']) player.x=Math.min(W-player.w,player.x+4);
        bullets.forEach(b=>b.y-=6);
        bullets=bullets.filter(b=>b.y>0);
        eBullets.forEach(b=>b.y+=3);
        eBullets=eBullets.filter(b=>b.y<H);
        eMoveTimer++;
        if(eMoveTimer>10){
            eMoveTimer=0;
            let hitEdge=false;
            enemies.forEach(e=>{ if(!e.alive) return; e.x+=eDir*10; if(e.x<=0||e.x+e.w>=W) hitEdge=true; });
            if(hitEdge){ eDir*=-1; enemies.forEach(e=>{ if(e.alive) e.y+=15; }); }
        }
        bullets.forEach(b=>{ enemies.forEach(e=>{ if(!e.alive) return;
            if(b.x>e.x&&b.x<e.x+e.w&&b.y>e.y&&b.y<e.y+e.h){ e.alive=false; b.y=-10; score+=10; cb.onScore(score); }
        }); });
        eBullets.forEach(b=>{
            if(b.x>player.x&&b.x<player.x+player.w&&b.y>player.y&&b.y<player.y+player.h){ dead=true; cb.onGameOver(score); }
        });
        enemies.forEach(e=>{ if(e.alive&&e.y+e.h>=player.y){ dead=true; cb.onGameOver(score); } });
        if(Math.random()<0.02){ const alive=enemies.filter(e=>e.alive); if(alive.length){ const e=alive[Math.floor(Math.random()*alive.length)]; eBullets.push({x:e.x+e.w/2,y:e.y+e.h}); } }
        if(enemies.every(e=>!e.alive)){ wave++; eSpeed+=0.1; spawnWave(); }
    }
    function draw(){
        ctx.fillStyle='#0a0a1a'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#00f0ff'; ctx.fillRect(player.x,player.y,player.w,player.h);
        ctx.fillStyle='#00ff88';
        bullets.forEach(b=>ctx.fillRect(b.x-1,b.y,3,8));
        const EC=['#ff0055','#ffcc00','#aa44ff'];
        enemies.forEach(e=>{ if(!e.alive) return; ctx.fillStyle=EC[e.type]; ctx.fillRect(e.x,e.y,e.w,e.h); });
        ctx.fillStyle='#ff4444';
        eBullets.forEach(b=>ctx.fillRect(b.x-1,b.y,3,8));
        if(dead){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#ff00aa'; ctx.font='20px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('GAME OVER',W/2,H/2); ctx.fillStyle='#aaa'; ctx.font='12px Inter'; ctx.fillText('R para reiniciar',W/2,H/2+30); ctx.textAlign='start'; }
    }
    function kd(e){
        keys[e.key]=true;
        if(e.key===' '&&!dead){ bullets.push({x:player.x+player.w/2,y:player.y}); e.preventDefault(); }
        if((e.key==='r'||e.key==='R')&&dead){ dead=false; score=0; wave=1; player.x=W/2-15; bullets=[]; eBullets=[]; spawnWave(); cb.onScore(0); }
        if(['ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    }
    function ku(e){ keys[e.key]=false; }
    document.addEventListener('keydown',kd); document.addEventListener('keyup',ku);
    function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); document.removeEventListener('keyup',ku); } };
};
})();
