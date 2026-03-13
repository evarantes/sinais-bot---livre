(function(){
window.Games.frogger = function(container, cb) {
    const W=420, H=480, SZ=40, COLS=W/SZ;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    const ROWS=12;
    let frog, score, dead, raf, level;
    const lanes=[];
    function init(){
        frog={x:5,y:11}; score=0; dead=false; level=1; cb.onScore(0);
        lanes.length=0;
        for(let r=0;r<ROWS;r++){
            if(r===0) lanes.push({type:'goal'});
            else if(r>=1&&r<=4) lanes.push({type:'water',items:genLane(r,true),speed:(0.5+Math.random()*0.5)*(r%2?1:-1),itemW:3});
            else if(r===5||r===11) lanes.push({type:'safe'});
            else lanes.push({type:'road',items:genLane(r,false),speed:(1+Math.random())*(r%2?1:-1),itemW:2});
        }
    }
    function genLane(r,isWater){
        const items=[];
        const count=2+Math.floor(Math.random()*3);
        for(let i=0;i<count;i++) items.push({x:Math.random()*COLS*SZ});
        return items;
    }
    function update(){
        if(dead) return;
        lanes.forEach((lane,r)=>{
            if(!lane.items) return;
            lane.items.forEach(item=>{
                item.x+=lane.speed;
                if(item.x>W+60) item.x=-80;
                if(item.x<-80) item.x=W+60;
            });
        });
        const lane=lanes[frog.y];
        if(lane.type==='road'){
            const fx=frog.x*SZ;
            lane.items.forEach(item=>{
                if(fx+SZ>item.x&&fx<item.x+lane.itemW*SZ){ dead=true; cb.onGameOver(score); }
            });
        }
        if(lane.type==='water'){
            let onLog=false;
            lane.items.forEach(item=>{
                const fx=frog.x*SZ;
                if(fx+SZ>item.x+5&&fx<item.x+lane.itemW*SZ-5){ onLog=true; frog.x+=lane.speed/SZ; }
            });
            if(!onLog){ dead=true; cb.onGameOver(score); }
        }
        if(frog.x<0||frog.x>=COLS){ dead=true; cb.onGameOver(score); }
        if(frog.y===0){ score+=100*level; level++; cb.onScore(score); frog={x:5,y:11}; }
    }
    function draw(){
        ctx.fillStyle='#0a0a2e'; ctx.fillRect(0,0,W,H);
        lanes.forEach((lane,r)=>{
            const y=r*SZ;
            if(lane.type==='goal'){ ctx.fillStyle='#004400'; ctx.fillRect(0,y,W,SZ); ctx.fillStyle='#00ff88'; ctx.font='12px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('META',W/2,y+26); ctx.textAlign='start'; }
            else if(lane.type==='safe'){ ctx.fillStyle='#1a3a1e'; ctx.fillRect(0,y,W,SZ); }
            else if(lane.type==='water'){ ctx.fillStyle='#001155'; ctx.fillRect(0,y,W,SZ); ctx.fillStyle='#553300'; lane.items.forEach(item=>ctx.fillRect(item.x,y+4,lane.itemW*SZ,SZ-8)); }
            else if(lane.type==='road'){ ctx.fillStyle='#222'; ctx.fillRect(0,y,W,SZ); ctx.fillStyle='#cc0000'; lane.items.forEach(item=>ctx.fillRect(item.x,y+6,lane.itemW*SZ,SZ-12)); }
        });
        ctx.fillStyle='#00ff88'; ctx.font='28px serif'; ctx.fillText('🐸',frog.x*SZ+4,frog.y*SZ+32);
        if(dead){ ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#ff00aa'; ctx.font='18px "Press Start 2P"'; ctx.textAlign='center'; ctx.fillText('GAME OVER',W/2,H/2); ctx.fillStyle='#aaa'; ctx.font='12px Inter'; ctx.fillText('R para reiniciar',W/2,H/2+30); ctx.textAlign='start'; }
    }
    function kd(e){
        if(dead){ if(e.key==='r'||e.key==='R') init(); return; }
        if(e.key==='ArrowUp'&&frog.y>0) frog.y--;
        else if(e.key==='ArrowDown'&&frog.y<ROWS-1) frog.y++;
        else if(e.key==='ArrowLeft'&&frog.x>0) frog.x--;
        else if(e.key==='ArrowRight'&&frog.x<COLS-1) frog.x++;
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    }
    document.addEventListener('keydown',kd);
    init();
    function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }
    loop();
    return { destroy(){ cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); } };
};
})();
