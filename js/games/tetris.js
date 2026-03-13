(function(){
window.Games.tetris = function(container, cb) {
    const COLS=10, ROWS=20, SZ=24, W=COLS*SZ, H=ROWS*SZ;
    const canvas=document.createElement('canvas'); canvas.width=W+120; canvas.height=H; container.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    const SHAPES=[
        [[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[1,0,0],[1,1,1]],
        [[0,0,1],[1,1,1]], [[1,1,0],[0,1,1]], [[0,1,1],[1,1,0]]
    ];
    const COLORS=['#00f0ff','#ffcc00','#aa44ff','#ff6600','#0066ff','#00ff88','#ff0055'];
    let grid=Array.from({length:ROWS},()=>Array(COLS).fill(0));
    let piece, px, py, pid, score=0, lines=0, level=1, dead=false, timer, nextId;

    function newPiece(){
        pid=nextId!==undefined?nextId:Math.floor(Math.random()*SHAPES.length);
        nextId=Math.floor(Math.random()*SHAPES.length);
        piece=SHAPES[pid].map(r=>[...r]);
        px=Math.floor(COLS/2)-Math.floor(piece[0].length/2); py=0;
        if(collides(px,py,piece)){ dead=true; App.addStat('tetris_lines',lines); cb.onGameOver(score); }
    }
    function collides(tx,ty,tp){
        for(let r=0;r<tp.length;r++) for(let c=0;c<tp[r].length;c++)
            if(tp[r][c]&&(tx+c<0||tx+c>=COLS||ty+r>=ROWS||(ty+r>=0&&grid[ty+r][tx+c]))) return true;
        return false;
    }
    function lock(){
        for(let r=0;r<piece.length;r++) for(let c=0;c<piece[r].length;c++)
            if(piece[r][c]&&py+r>=0) grid[py+r][px+c]=pid+1;
        let cleared=0;
        for(let r=ROWS-1;r>=0;r--){
            if(grid[r].every(v=>v)){ grid.splice(r,1); grid.unshift(Array(COLS).fill(0)); cleared++; r++; }
        }
        if(cleared){ lines+=cleared; score+=[0,100,300,500,800][cleared]*level; level=Math.floor(lines/10)+1; cb.onScore(score); }
        newPiece();
    }
    function rotate(){
        const rot=piece[0].map((_,c)=>piece.map(r=>r[c]).reverse());
        if(!collides(px,py,rot)) piece=rot;
    }
    function drop(){ if(!collides(px,py+1,piece)) py++; else lock(); }
    function draw(){
        ctx.fillStyle='#0a0a1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.strokeStyle='#1a1a3e';
        for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
            ctx.strokeRect(c*SZ,r*SZ,SZ,SZ);
            if(grid[r][c]){ ctx.fillStyle=COLORS[grid[r][c]-1]; ctx.fillRect(c*SZ+1,r*SZ+1,SZ-2,SZ-2); }
        }
        if(piece&&!dead) for(let r=0;r<piece.length;r++) for(let c=0;c<piece[r].length;c++)
            if(piece[r][c]){ ctx.fillStyle=COLORS[pid]; ctx.fillRect((px+c)*SZ+1,(py+r)*SZ+1,SZ-2,SZ-2); }
        ctx.fillStyle='#8888aa'; ctx.font='11px "Press Start 2P"';
        const ox=W+10;
        ctx.fillText('PRÓXIMO',ox,20);
        if(nextId!==undefined){
            const ns=SHAPES[nextId];
            for(let r=0;r<ns.length;r++) for(let c=0;c<ns[r].length;c++)
                if(ns[r][c]){ ctx.fillStyle=COLORS[nextId]; ctx.fillRect(ox+c*SZ,30+r*SZ,SZ-2,SZ-2); }
        }
        ctx.fillStyle='#8888aa'; ctx.font='10px "Press Start 2P"';
        ctx.fillText('Nível:'+level,ox,110); ctx.fillText('Linhas:'+lines,ox,130);
        if(dead){
            ctx.fillStyle='rgba(0,0,0,0.8)'; ctx.fillRect(0,0,W,H);
            ctx.fillStyle='#ff00aa'; ctx.font='bold 18px "Press Start 2P"'; ctx.textAlign='center';
            ctx.fillText('GAME OVER',W/2,H/2-10);
            ctx.fillStyle='#ffcc00'; ctx.font='12px "Press Start 2P"';
            ctx.fillText(score+' pts',W/2,H/2+20);
            ctx.fillStyle='#aaa'; ctx.font='11px Inter';
            ctx.fillText('R para reiniciar',W/2,H/2+45);
            ctx.textAlign='start';
        }
    }
    function kd(e){
        if(dead){ if(e.key==='r'||e.key==='R') restart(); return; }
        if(e.key==='ArrowLeft'&&!collides(px-1,py,piece)) px--;
        else if(e.key==='ArrowRight'&&!collides(px+1,py,piece)) px++;
        else if(e.key==='ArrowDown') drop();
        else if(e.key==='ArrowUp') rotate();
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
        draw();
    }
    function restart(){
        grid=Array.from({length:ROWS},()=>Array(COLS).fill(0));
        score=0; lines=0; level=1; dead=false; cb.onScore(0); newPiece();
    }
    document.addEventListener('keydown',kd);
    newPiece(); draw();
    timer=setInterval(()=>{ if(!dead){ drop(); draw(); } }, 500);
    return { destroy(){ clearInterval(timer); document.removeEventListener('keydown',kd); } };
};
})();
