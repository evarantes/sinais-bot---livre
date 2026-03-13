(function(){
window.Games.platformer = function(container, cb) {
    const W=500, H=400;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    let player={x:50,y:300,vx:0,vy:0,w:20,h:24,onGround:false}, camera=0;
    let platforms=[], coins=[], score=0, dead=false, raf, keys={};
    function genLevel(){
        platforms=[{x:0,y:360,w:200,h:40}];
        coins=[];
        let px=180;
        for(let i=0;i<50;i++){
            const gap=60+Math.random()*80, pw=60+Math.random()*100, py=200+Math.random()*140;
            px+=gap;
            platforms.push({x:px,y:py,w:pw,h:16});
            coins.push({x:px+pw/2,y:py-25,collected:false});
        }
        platforms.push({x:px+150,y:200,w:120,h:40,goal:true});
    }
    genLevel();
    function update(){
        if(dead) return;
        if(keys['ArrowLeft']||keys['a']) player.vx=-3.5;
        else if(keys['ArrowRight']||keys['d']) player.vx=3.5;
        else player.vx*=0.85;
        if((keys[' ']||keys['ArrowUp'])&&player.onGround){ player.vy=-10; player.onGround=false; }
        player.vy+=0.5;
        player.x+=player.vx; player.y+=player.vy;
        player.onGround=false;
        platforms.forEach(p=>{
            if(player.x+player.w>p.x&&player.x<p.x+p.w&&player.y+player.h>p.y&&player.y+player.h<p.y+p.h+10&&player.vy>=0){
                player.y=p.y-player.h; player.vy=0; player.onGround=true;
                if(p.goal){ score+=200; cb.onScore(score); cb.onGameOver(score); dead=true; }
            }
        });
        if(player.y>H+100){ dead=true; cb.onGameOver(score); }
        coins.forEach(c=>{
            if(!c.collected&&Math.abs(player.x+player.w/2-c.x)<20&&Math.abs(player.y+player.h/2-c.y)<20){ c.collected=true; score+=25; cb.onScore(score); }
        });
        camera=player.x-150;
    }
    function draw(){
        ctx.fillStyle='#0a0a2e'; ctx.fillRect(0,0,W,H);
        ctx.save(); ctx.translate(-camera,0);
        platforms.forEach(p=>{ ctx.fillStyle=p.goal?'#00ff88':'#2a2a5a'; ctx.fillRect(p.x,p.y,p.w,p.h); if(p.goal){ ctx.fillStyle='#fff'; ctx.font='12px "Press Start 2P"'; ctx.fillText('🏁',p.x+p.w/2-10,p.y-5); } });
        coins.forEach(c=>{ if(c.collected) return; ctx.fillStyle='#ffcc00'; ctx.beginPath(); ctx.arc(c.x,c.y,8,0,Math.PI*2); ctx.fill(); });
        ctx.fillStyle='#00f0ff'; ctx.fillRect(player.x,player.y,player.w,player.h);
        ctx.fillStyle='#fff'; ctx.fillRect(player.x+5,player.y+4,4,4); ctx.fillRect(player.x+12,player.y+4,4,4);
        ctx.restore();
        if(dead){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H); ctx.fillStyle=score>=200?'#00ff88':'#ff00aa'; ctx.font='18px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText(score>=200?'VITÓRIA!':'GAME OVER',W/2,H/2); ctx.fillStyle='#aaa'; ctx.font='11px Inter'; ctx.fillText('R para reiniciar',W/2,H/2+30); ctx.textAlign='start'; }
    }
    function kd(e){ keys[e.key]=true; if((e.key==='r'||e.key==='R')&&dead){ player={x:50,y:300,vx:0,vy:0,w:20,h:24,onGround:false}; camera=0; score=0; dead=false; genLevel(); cb.onScore(0); } if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault(); }
    function ku(e){ keys[e.key]=false; }
    document.addEventListener('keydown',kd); document.addEventListener('keyup',ku);
    function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); document.removeEventListener('keyup',ku); } };
};
})();
