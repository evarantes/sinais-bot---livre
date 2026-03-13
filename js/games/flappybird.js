(function(){
window.Games.flappybird = function(container, cb) {
    const W=300, H=500;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    let bird={y:H/2,vy:0}, pipes=[], score=0, dead=false, started=false, raf, frame=0;
    const GAP=130, PW=50, GRAVITY=0.4, JUMP=-7;

    function spawnPipe(){ const top=50+Math.random()*(H-GAP-100); pipes.push({x:W,top,bottom:top+GAP,scored:false}); }
    function update(){
        if(!started||dead) return;
        bird.vy+=GRAVITY; bird.y+=bird.vy;
        frame++;
        if(frame%90===0) spawnPipe();
        pipes.forEach(p=>{
            p.x-=2.5;
            if(!p.scored&&p.x+PW<W/4){ p.scored=true; score++; cb.onScore(score); }
        });
        pipes=pipes.filter(p=>p.x>-PW);
        if(bird.y<0||bird.y>H){ dead=true; cb.onGameOver(score); }
        pipes.forEach(p=>{
            if(W/4+15>p.x&&W/4-15<p.x+PW&&(bird.y-12<p.top||bird.y+12>p.bottom)){ dead=true; cb.onGameOver(score); }
        });
    }
    function draw(){
        ctx.fillStyle='#0a0a2e'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#00ff88';
        pipes.forEach(p=>{
            ctx.fillRect(p.x,0,PW,p.top);
            ctx.fillRect(p.x,p.bottom,PW,H-p.bottom);
        });
        ctx.fillStyle=dead?'#ff0055':'#ffcc00';
        ctx.beginPath(); ctx.arc(W/4,bird.y,12,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(W/4+5,bird.y-3,4,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(W/4+6,bird.y-3,2,0,Math.PI*2); ctx.fill();
        if(!started){ ctx.fillStyle='#00f0ff'; ctx.font='14px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('CLIQUE ou',W/2,H/2-15); ctx.fillText('ESPAÇO',W/2,H/2+15); ctx.textAlign='start'; }
        if(dead){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#ff00aa'; ctx.font='18px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('GAME OVER',W/2,H/2-10); ctx.fillStyle='#ffcc00'; ctx.font='14px "Press Start 2P"'; ctx.fillText(score+' pts',W/2,H/2+20); ctx.fillStyle='#aaa'; ctx.font='11px Inter'; ctx.fillText('R para reiniciar',W/2,H/2+45); ctx.textAlign='start'; }
    }
    function flap(){
        if(dead) return;
        if(!started){ started=true; spawnPipe(); }
        bird.vy=JUMP;
    }
    function kd(e){
        if(e.key===' '){ e.preventDefault(); flap(); }
        if((e.key==='r'||e.key==='R')&&dead){ bird={y:H/2,vy:0}; pipes=[]; score=0; dead=false; started=false; frame=0; cb.onScore(0); }
    }
    canvas.addEventListener('click',flap);
    document.addEventListener('keydown',kd);
    function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); } };
};
})();
