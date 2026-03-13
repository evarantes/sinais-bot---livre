(function(){
window.Games.snake = function(container, cb) {
    const W=400, H=400, SZ=20, COLS=W/SZ, ROWS=H/SZ;
    const canvas = document.createElement('canvas');
    canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let snake=[{x:10,y:10}], dir={x:1,y:0}, food, score=0, dead=false, timer;
    function spawnFood(){ food={x:Math.floor(Math.random()*COLS),y:Math.floor(Math.random()*ROWS)}; }
    spawnFood();
    function update(){
        if(dead) return;
        const head={x:snake[0].x+dir.x, y:snake[0].y+dir.y};
        if(head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||snake.some(s=>s.x===head.x&&s.y===head.y)){
            dead=true; cb.onGameOver(score); return;
        }
        snake.unshift(head);
        if(head.x===food.x&&head.y===food.y){ score+=10; cb.onScore(score); spawnFood(); }
        else snake.pop();
    }
    function draw(){
        ctx.fillStyle='#0a0a2e'; ctx.fillRect(0,0,W,H);
        ctx.fillStyle='#00ff88';
        snake.forEach((s,i)=>{ ctx.globalAlpha=i===0?1:0.7; ctx.fillRect(s.x*SZ+1,s.y*SZ+1,SZ-2,SZ-2); });
        ctx.globalAlpha=1;
        ctx.fillStyle='#ff4444'; ctx.beginPath(); ctx.arc(food.x*SZ+SZ/2,food.y*SZ+SZ/2,SZ/2-2,0,Math.PI*2); ctx.fill();
        if(dead){
            ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H);
            ctx.fillStyle='#ff00aa'; ctx.font='bold 24px "Press Start 2P"'; ctx.textAlign='center';
            ctx.fillText('GAME OVER',W/2,H/2-20);
            ctx.fillStyle='#ffcc00'; ctx.font='16px "Press Start 2P"';
            ctx.fillText('Pontos: '+score,W/2,H/2+20);
            ctx.fillStyle='#aaa'; ctx.font='12px Inter';
            ctx.fillText('Pressione R para reiniciar',W/2,H/2+50);
        }
    }
    function keydown(e){
        if(e.key==='ArrowUp'&&dir.y!==1) dir={x:0,y:-1};
        else if(e.key==='ArrowDown'&&dir.y!==-1) dir={x:0,y:1};
        else if(e.key==='ArrowLeft'&&dir.x!==1) dir={x:-1,y:0};
        else if(e.key==='ArrowRight'&&dir.x!==-1) dir={x:1,y:0};
        else if(e.key==='r'||e.key==='R'){ snake=[{x:10,y:10}]; dir={x:1,y:0}; score=0; dead=false; spawnFood(); cb.onScore(0); }
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    }
    document.addEventListener('keydown', keydown);
    timer = setInterval(()=>{ update(); draw(); }, 120);
    draw();
    return { destroy(){ clearInterval(timer); document.removeEventListener('keydown', keydown); } };
};
})();
