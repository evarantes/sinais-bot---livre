(function(){
window.Games.hangman = function(container, cb) {
    const WORDS=['JAVASCRIPT','PYTHON','COMPUTADOR','TECLADO','MONITOR','INTERNET','PROGRAMA','SISTEMA','MEMORIA','ARQUIVO',
        'ESTRELA','PLANETA','OCEANO','FLORESTA','MONTANHA','CAVERNA','VULCAO','DESERTO','NUVEM','RAIO'];
    let word, guessed, wrong, maxWrong=6, score=0, done;
    const wrap=document.createElement('div'); wrap.style.cssText='display:flex;flex-direction:column;align-items:center;gap:16px;';
    const canvas=document.createElement('canvas'); canvas.width=200; canvas.height=200;
    const wordDiv=document.createElement('div'); wordDiv.style.cssText='font-size:28px;letter-spacing:8px;font-family:"Press Start 2P";color:#00f0ff;';
    const info=document.createElement('div'); info.style.cssText='font-size:14px;color:#8888aa;';
    const kbDiv=document.createElement('div'); kbDiv.style.cssText='display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:400px;';
    const restartBtn=document.createElement('button'); restartBtn.className='btn btn-secondary'; restartBtn.textContent='Nova Palavra'; restartBtn.onclick=init;
    wrap.append(canvas,wordDiv,info,kbDiv,restartBtn); container.appendChild(wrap);
    const ctx=canvas.getContext('2d');

    function init(){
        word=WORDS[Math.floor(Math.random()*WORDS.length)];
        guessed=new Set(); wrong=0; done=false; render();
    }
    function drawHangman(){
        ctx.clearRect(0,0,200,200);
        ctx.strokeStyle='#8888aa'; ctx.lineWidth=2;
        ctx.beginPath(); ctx.moveTo(40,180); ctx.lineTo(160,180); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(60,180); ctx.lineTo(60,20); ctx.lineTo(130,20); ctx.lineTo(130,40); ctx.stroke();
        ctx.strokeStyle='#ff0055'; ctx.lineWidth=3;
        if(wrong>=1){ ctx.beginPath(); ctx.arc(130,55,15,0,Math.PI*2); ctx.stroke(); }
        if(wrong>=2){ ctx.beginPath(); ctx.moveTo(130,70); ctx.lineTo(130,120); ctx.stroke(); }
        if(wrong>=3){ ctx.beginPath(); ctx.moveTo(130,85); ctx.lineTo(105,105); ctx.stroke(); }
        if(wrong>=4){ ctx.beginPath(); ctx.moveTo(130,85); ctx.lineTo(155,105); ctx.stroke(); }
        if(wrong>=5){ ctx.beginPath(); ctx.moveTo(130,120); ctx.lineTo(110,150); ctx.stroke(); }
        if(wrong>=6){ ctx.beginPath(); ctx.moveTo(130,120); ctx.lineTo(150,150); ctx.stroke(); }
    }
    function render(){
        drawHangman();
        wordDiv.textContent=word.split('').map(l=>guessed.has(l)?l:'_').join(' ');
        info.textContent=done?(wrong>=maxWrong?`A palavra era: ${word}`:'🎉 Parabéns!'):`Erros: ${wrong}/${maxWrong}`;
        kbDiv.innerHTML='';
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(l=>{
            const btn=document.createElement('button');
            btn.textContent=l; btn.style.cssText='width:36px;height:36px;border:1px solid #2a2a5a;background:#1a1a3e;color:#e8e8f0;border-radius:6px;cursor:pointer;font-weight:bold;';
            if(guessed.has(l)){ btn.style.opacity='0.3'; btn.style.cursor='default'; btn.style.background=word.includes(l)?'#00ff88':'#ff0055'; }
            btn.onclick=()=>guess(l);
            kbDiv.appendChild(btn);
        });
    }
    function guess(l){
        if(done||guessed.has(l)) return;
        guessed.add(l);
        if(!word.includes(l)) wrong++;
        if(wrong>=maxWrong){ done=true; cb.onGameOver(score); }
        else if(word.split('').every(c=>guessed.has(c))){ done=true; score+=50+((maxWrong-wrong)*10); cb.onScore(score); cb.onGameOver(score); }
        render();
    }
    function kd(e){
        const l=e.key.toUpperCase();
        if(l.length===1&&l>='A'&&l<='Z') guess(l);
    }
    document.addEventListener('keydown',kd);
    init();
    return { destroy(){ document.removeEventListener('keydown',kd); } };
};
})();
