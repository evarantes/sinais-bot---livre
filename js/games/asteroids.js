(function(){
window.Games.asteroids = function(container, cb) {
    const W=500, H=500;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    let ship={x:W/2,y:H/2,angle:0,vx:0,vy:0}, bullets=[], asteroids=[], score=0, dead=false, raf, keys={};
    function spawnAsteroids(n){ for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2; asteroids.push({x:Math.random()*W,y:Math.random()*H,vx:Math.cos(a)*(1+Math.random()),vy:Math.sin(a)*(1+Math.random()),r:30+Math.random()*15}); } }
    spawnAsteroids(5);
    function wrap(o){ o.x=(o.x+W)%W; o.y=(o.y+H)%H; }
    function update(){
        if(dead) return;
        if(keys['ArrowLeft']) ship.angle-=0.07;
        if(keys['ArrowRight']) ship.angle+=0.07;
        if(keys['ArrowUp']){ ship.vx+=Math.cos(ship.angle)*0.12; ship.vy+=Math.sin(ship.angle)*0.12; }
        ship.vx*=0.99; ship.vy*=0.99;
        ship.x+=ship.vx; ship.y+=ship.vy; wrap(ship);
        bullets.forEach(b=>{ b.x+=b.vx; b.y+=b.vy; b.life--; wrap(b); });
        bullets=bullets.filter(b=>b.life>0);
        asteroids.forEach(a=>{ a.x+=a.vx; a.y+=a.vy; wrap(a); });
        bullets.forEach(b=>{
            asteroids.forEach(a=>{
                if(a.r<=0) return;
                const dx=b.x-a.x, dy=b.y-a.y;
                if(Math.sqrt(dx*dx+dy*dy)<a.r){ b.life=0; score+=Math.round(100/a.r*10); cb.onScore(score);
                    if(a.r>15){ const ang=Math.random()*Math.PI*2;
                        asteroids.push({x:a.x,y:a.y,vx:Math.cos(ang)*2,vy:Math.sin(ang)*2,r:a.r*0.6});
                        asteroids.push({x:a.x,y:a.y,vx:-Math.cos(ang)*2,vy:-Math.sin(ang)*2,r:a.r*0.6});
                    }
                    a.r=0;
                }
            });
        });
        asteroids=asteroids.filter(a=>a.r>0);
        asteroids.forEach(a=>{ const dx=ship.x-a.x, dy=ship.y-a.y; if(Math.sqrt(dx*dx+dy*dy)<a.r+8){ dead=true; cb.onGameOver(score); } });
        if(!asteroids.length) spawnAsteroids(5+Math.floor(score/200));
    }
    function draw(){
        ctx.fillStyle='#0a0a1a'; ctx.fillRect(0,0,W,H);
        ctx.save(); ctx.translate(ship.x,ship.y); ctx.rotate(ship.angle);
        ctx.strokeStyle=dead?'#ff0055':'#00f0ff'; ctx.lineWidth=2; ctx.beginPath();
        ctx.moveTo(15,0); ctx.lineTo(-10,8); ctx.lineTo(-6,0); ctx.lineTo(-10,-8); ctx.closePath(); ctx.stroke();
        if(keys['ArrowUp']&&!dead){ ctx.fillStyle='#ff6600'; ctx.beginPath(); ctx.moveTo(-8,4); ctx.lineTo(-16,0); ctx.lineTo(-8,-4); ctx.fill(); }
        ctx.restore();
        ctx.fillStyle='#fff'; bullets.forEach(b=>{ ctx.beginPath(); ctx.arc(b.x,b.y,2,0,Math.PI*2); ctx.fill(); });
        ctx.strokeStyle='#8888aa'; ctx.lineWidth=1.5;
        asteroids.forEach(a=>{ ctx.beginPath(); ctx.arc(a.x,a.y,a.r,0,Math.PI*2); ctx.stroke(); });
        if(dead){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#ff00aa'; ctx.font='20px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('GAME OVER',W/2,H/2); ctx.fillStyle='#aaa'; ctx.font='12px Inter'; ctx.fillText('R para reiniciar',W/2,H/2+30); ctx.textAlign='start'; }
    }
    let shootCooldown=0;
    function kd(e){
        keys[e.key]=true;
        if(e.key===' '&&!dead&&shootCooldown<=0){
            bullets.push({x:ship.x+Math.cos(ship.angle)*15,y:ship.y+Math.sin(ship.angle)*15,vx:Math.cos(ship.angle)*7,vy:Math.sin(ship.angle)*7,life:50});
            shootCooldown=8; e.preventDefault();
        }
        if((e.key==='r'||e.key==='R')&&dead){ ship={x:W/2,y:H/2,angle:0,vx:0,vy:0}; bullets=[]; asteroids=[]; score=0; dead=false; spawnAsteroids(5); cb.onScore(0); }
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    }
    function ku(e){ keys[e.key]=false; }
    document.addEventListener('keydown',kd); document.addEventListener('keyup',ku);
    function loop(){ update(); draw(); if(shootCooldown>0) shootCooldown--; raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); document.removeEventListener('keyup',ku); } };
};
})();
