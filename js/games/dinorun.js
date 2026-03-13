(function(){
window.Games.dinorun = function(container, cb) {
    const W=600, H=200;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    let dino={y:H-50,vy:0,h:40,w:30,ducking:false}, obstacles=[], score=0, dead=false, started=false, raf, speed=4, frame=0;
    const GROUND=H-10, GRAVITY=0.6, JUMP=-11;

    function update(){
        if(!started||dead) return;
        frame++; score=Math.floor(frame/6); cb.onScore(score);
        speed=4+frame*0.002;
        dino.vy+=GRAVITY; dino.y+=dino.vy;
        dino.h=dino.ducking?20:40;
        if(dino.y>=GROUND-dino.h){ dino.y=GROUND-dino.h; dino.vy=0; }
        if(frame%Math.max(30,80-Math.floor(frame/50))===0){
            const type=Math.random()<0.7?'cactus':'bird';
            obstacles.push({x:W,y:type==='bird'?GROUND-60:GROUND-30,w:20,h:type==='bird'?20:30,type});
        }
        obstacles.forEach(o=>o.x-=speed);
        obstacles=obstacles.filter(o=>o.x>-30);
        const dy=dino.y, dh=dino.h, dw=dino.w, dx=50;
        obstacles.forEach(o=>{
            if(dx+dw>o.x+4&&dx<o.x+o.w-4&&dy+dh>o.y+4&&dy<o.y+o.h-4){ dead=true; cb.onGameOver(score); }
        });
    }
    function draw(){
        ctx.fillStyle='#0a0a2e'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#2a2a5a'; ctx.fillRect(0,GROUND,W,10);
        ctx.fillStyle='#00ff88'; ctx.fillRect(50,dino.y,dino.w,dino.h);
        ctx.fillStyle='#fff'; ctx.fillRect(65,dino.y+5,6,6);
        obstacles.forEach(o=>{ ctx.fillStyle=o.type==='cactus'?'#00aa44':'#ff6600'; ctx.fillRect(o.x,o.y,o.w,o.h); });
        ctx.fillStyle='#8888aa'; ctx.font='12px "Press Start 2P"'; ctx.textAlign='right'; ctx.fillText(String(score).padStart(5,'0'),W-10,25); ctx.textAlign='start';
        if(!started){ ctx.fillStyle='#00f0ff'; ctx.font='14px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('ESPAÇO para começar',W/2,H/2); ctx.textAlign='start'; }
        if(dead){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#ff00aa'; ctx.font='18px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('GAME OVER',W/2,H/2-10); ctx.fillStyle='#aaa'; ctx.font='11px Inter'; ctx.fillText('R para reiniciar',W/2,H/2+20); ctx.textAlign='start'; }
    }
    function kd(e){
        if(e.key===' '||e.key==='ArrowUp'){
            e.preventDefault();
            if(dead) return;
            if(!started) started=true;
            if(dino.y>=GROUND-dino.h-1) dino.vy=JUMP;
        }
        if(e.key==='ArrowDown'){ e.preventDefault(); dino.ducking=true; }
        if((e.key==='r'||e.key==='R')&&dead){ dino={y:H-50,vy:0,h:40,w:30,ducking:false}; obstacles=[]; score=0; dead=false; started=false; speed=4; frame=0; cb.onScore(0); }
    }
    function ku(e){ if(e.key==='ArrowDown') dino.ducking=false; }
    document.addEventListener('keydown',kd); document.addEventListener('keyup',ku);
    function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); document.removeEventListener('keyup',ku); } };
};
})();
