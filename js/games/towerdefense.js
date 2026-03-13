(function(){
window.Games.towerdefense = function(container, cb) {
    const W=480, H=400, SZ=40, COLS=12, ROWS=10;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    const PATH=[[0,4],[1,4],[2,4],[3,4],[3,3],[3,2],[4,2],[5,2],[6,2],[6,3],[6,4],[6,5],[6,6],[7,6],[8,6],[9,6],[9,5],[9,4],[10,4],[11,4]];
    let towers=[], enemies=[], bullets=[], hp=10, money=100, score=0, wave=0, raf, spawnTimer=0, waveTimer=0;
    const pathSet=new Set(PATH.map(([c,r])=>`${c},${r}`));

    function spawnWave(){
        wave++; const count=5+wave*2;
        for(let i=0;i<count;i++) setTimeout(()=>{
            if(hp<=0) return;
            enemies.push({x:PATH[0][0]*SZ+SZ/2,y:PATH[0][1]*SZ+SZ/2,hp:20+wave*10,maxHp:20+wave*10,pathIdx:0,speed:1+wave*0.1});
        },i*600);
    }
    function update(){
        if(hp<=0) return;
        enemies.forEach(e=>{
            if(e.pathIdx>=PATH.length-1){ hp--; e.hp=0; if(hp<=0) cb.onGameOver(score); return; }
            const [tx,ty]=[PATH[e.pathIdx+1][0]*SZ+SZ/2,PATH[e.pathIdx+1][1]*SZ+SZ/2];
            const dx=tx-e.x, dy=ty-e.y, d=Math.sqrt(dx*dx+dy*dy);
            if(d<e.speed*2){ e.pathIdx++; } else { e.x+=dx/d*e.speed; e.y+=dy/d*e.speed; }
        });
        towers.forEach(t=>{
            t.cooldown--;
            if(t.cooldown<=0){
                const target=enemies.find(e=>e.hp>0&&Math.sqrt((e.x-t.x)**2+(e.y-t.y)**2)<t.range);
                if(target){ bullets.push({x:t.x,y:t.y,tx:target,dmg:t.dmg}); t.cooldown=t.rate; }
            }
        });
        bullets.forEach(b=>{
            const dx=b.tx.x-b.x, dy=b.tx.y-b.y, d=Math.sqrt(dx*dx+dy*dy);
            if(d<6){ b.tx.hp-=b.dmg; b.dead=true; if(b.tx.hp<=0){ score+=10; money+=5+wave; cb.onScore(score); } }
            else { b.x+=dx/d*6; b.y+=dy/d*6; }
        });
        bullets=bullets.filter(b=>!b.dead);
        enemies=enemies.filter(e=>e.hp>0);
        if(!enemies.length&&waveTimer<=0){ waveTimer=60; }
        if(waveTimer>0){ waveTimer--; if(waveTimer===0) spawnWave(); }
    }
    function draw(){
        ctx.fillStyle='#1a3a1e'; ctx.fillRect(0,0,W,H);
        PATH.forEach(([c,r])=>{ ctx.fillStyle='#554422'; ctx.fillRect(c*SZ,r*SZ,SZ,SZ); });
        for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){ ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.strokeRect(c*SZ,r*SZ,SZ,SZ); }
        towers.forEach(t=>{ ctx.fillStyle=t.type==='basic'?'#0066ff':'#ff6600'; ctx.fillRect(t.x-12,t.y-12,24,24); });
        enemies.forEach(e=>{
            ctx.fillStyle='#ff0055'; ctx.beginPath(); ctx.arc(e.x,e.y,10,0,Math.PI*2); ctx.fill();
            ctx.fillStyle='#333'; ctx.fillRect(e.x-12,e.y-16,24,4);
            ctx.fillStyle='#00ff88'; ctx.fillRect(e.x-12,e.y-16,24*(e.hp/e.maxHp),4);
        });
        ctx.fillStyle='#ffcc00'; bullets.forEach(b=>{ ctx.beginPath(); ctx.arc(b.x,b.y,3,0,Math.PI*2); ctx.fill(); });
        ctx.fillStyle='#e8e8f0'; ctx.font='12px Inter';
        ctx.fillText(`❤️ ${hp}  💰 ${money}  🌊 Wave ${wave}`,10,H-8);
        if(hp<=0){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#ff00aa'; ctx.font='18px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('GAME OVER',W/2,H/2); ctx.textAlign='start'; }
    }
    canvas.addEventListener('click',(e)=>{
        if(hp<=0) return;
        const rect=canvas.getBoundingClientRect();
        const mx=e.clientX-rect.left, my=e.clientY-rect.top;
        const gc=Math.floor(mx/SZ), gr=Math.floor(my/SZ);
        if(pathSet.has(`${gc},${gr}`)) return;
        if(towers.some(t=>Math.floor((t.x)/SZ)===gc&&Math.floor((t.y)/SZ)===gr)) return;
        if(money>=25){
            money-=25;
            towers.push({x:gc*SZ+SZ/2,y:gr*SZ+SZ/2,range:100,dmg:5+wave,rate:30,cooldown:0,type:'basic'});
        }
    });
    spawnWave();
    function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); } };
};
})();
