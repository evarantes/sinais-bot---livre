(function(){
window.Games.pong = function(container, cb) {
    const W=480, H=360, PW=10, PH=70;
    const canvas=document.createElement('canvas'); canvas.width=W; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    let pY=H/2-PH/2, cY=H/2-PH/2, bx=W/2, by=H/2, bvx=4, bvy=3, pScore=0, cScore=0, keys={}, raf;
    function update(){
        if(keys['ArrowUp']) pY=Math.max(0,pY-5);
        if(keys['ArrowDown']) pY=Math.min(H-PH,pY+5);
        let target=by-PH/2+(Math.random()-0.5)*30;
        cY+=(target-cY)*0.06;
        cY=Math.max(0,Math.min(H-PH,cY));
        bx+=bvx; by+=bvy;
        if(by<=0||by>=H) bvy*=-1;
        if(bx<=PW+15&&by>=pY&&by<=pY+PH){ bvx=Math.abs(bvx)*1.05; bvy+=(by-(pY+PH/2))*0.1; }
        if(bx>=W-PW-15&&by>=cY&&by<=cY+PH){ bvx=-Math.abs(bvx)*1.05; bvy+=(by-(cY+PH/2))*0.1; }
        if(bx<0){ cScore++; reset(); }
        if(bx>W){ pScore++; cb.onScore(pScore); reset(); }
        if(cScore>=7||pScore>=7){ cb.onGameOver(pScore); }
    }
    function reset(){ bx=W/2; by=H/2; bvx=(Math.random()>0.5?4:-4); bvy=(Math.random()-0.5)*4; }
    function draw(){
        ctx.fillStyle='#0a0a2e'; ctx.fillRect(0,0,W,H);
        ctx.setLineDash([8,8]); ctx.strokeStyle='#2a2a5a'; ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle='#00f0ff'; ctx.fillRect(10,pY,PW,PH);
        ctx.fillStyle='#ff00aa'; ctx.fillRect(W-10-PW,cY,PW,PH);
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(bx,by,6,0,Math.PI*2); ctx.fill();
        ctx.font='bold 32px "Press Start 2P"'; ctx.textAlign='center';
        ctx.fillStyle='#00f0ff'; ctx.fillText(pScore,W/4,50);
        ctx.fillStyle='#ff00aa'; ctx.fillText(cScore,3*W/4,50);
    }
    function loop(){ update(); draw(); raf=requestAnimationFrame(loop); }
    function kd(e){ keys[e.key]=true; if(['ArrowUp','ArrowDown'].includes(e.key)) e.preventDefault(); }
    function ku(e){ keys[e.key]=false; }
    document.addEventListener('keydown',kd); document.addEventListener('keyup',ku);
    loop();
    return { destroy(){ cancelAnimationFrame(raf); document.removeEventListener('keydown',kd); document.removeEventListener('keyup',ku); } };
};
})();
