window.Games = {};

const GAME_CATALOG = [
    { id:'snake', name:'Jogo da Cobrinha', emoji:'🐍', cost:0, controls:'Setas para mover' },
    { id:'tictactoe', name:'Jogo da Velha', emoji:'❌', cost:0, controls:'Clique para jogar' },
    { id:'pong', name:'Pong', emoji:'🏓', cost:0, controls:'↑↓ para mover' },
    { id:'memory', name:'Jogo da Memória', emoji:'🧠', cost:0, controls:'Clique nas cartas' },
    { id:'tetris', name:'Tetris', emoji:'🧱', cost:0, controls:'← → ↓ mover, ↑ rotacionar' },
    { id:'breakout', name:'Breakout', emoji:'🧱', cost:10, controls:'← → mover raquete' },
    { id:'minesweeper', name:'Campo Minado', emoji:'💣', cost:10, controls:'Clique: revelar | Direito: bandeira' },
    { id:'game2048', name:'2048', emoji:'🔢', cost:10, controls:'Setas para deslizar' },
    { id:'hangman', name:'Forca', emoji:'📝', cost:10, controls:'Teclado para letras' },
    { id:'simon', name:'Simon', emoji:'🎵', cost:10, controls:'Clique nas cores' },
    { id:'whackamole', name:'Whack-a-Mole', emoji:'🔨', cost:10, controls:'Clique nas toupeiras' },
    { id:'slidingpuzzle', name:'Puzzle Deslizante', emoji:'🧩', cost:10, controls:'Clique para mover peças' },
    { id:'blackjack', name:'Blackjack', emoji:'🃏', cost:10, controls:'Clique Pedir/Parar' },
    { id:'wordsearch', name:'Caça Palavras', emoji:'🔍', cost:10, controls:'Clique e arraste' },
    { id:'maze', name:'Labirinto', emoji:'🌀', cost:10, controls:'Setas para mover' },
    { id:'spaceinvaders', name:'Space Invaders', emoji:'👾', cost:20, controls:'← → mover, Espaço atirar' },
    { id:'flappybird', name:'Flappy Bird', emoji:'🐦', cost:20, controls:'Espaço ou clique para pular' },
    { id:'connectfour', name:'Conecte 4', emoji:'🔴', cost:20, controls:'Clique na coluna' },
    { id:'sudoku', name:'Sudoku', emoji:'🔢', cost:20, controls:'Clique e digite número' },
    { id:'checkers', name:'Damas', emoji:'♟️', cost:20, controls:'Clique para mover peças' },
    { id:'dinorun', name:'Dino Run', emoji:'🦖', cost:20, controls:'Espaço pular, ↓ abaixar' },
    { id:'bubbleshooter', name:'Bubble Shooter', emoji:'🫧', cost:20, controls:'Mova mouse e clique para atirar' },
    { id:'match3', name:'Match 3', emoji:'💎', cost:20, controls:'Clique e arraste para trocar' },
    { id:'fruitninja', name:'Corta Frutas', emoji:'🍉', cost:20, controls:'Mova o mouse para cortar' },
    { id:'solitaire', name:'Paciência', emoji:'🃏', cost:20, controls:'Clique e arraste cartas' },
    { id:'pacman', name:'Pac-Man', emoji:'👻', cost:30, controls:'Setas para mover' },
    { id:'asteroids', name:'Asteroids', emoji:'🚀', cost:30, controls:'← → girar, ↑ acelerar, Espaço atirar' },
    { id:'frogger', name:'Frogger', emoji:'🐸', cost:30, controls:'Setas para mover' },
    { id:'arkanoid', name:'Arkanoid', emoji:'🏗️', cost:30, controls:'← → mover, Espaço lançar' },
    { id:'galaga', name:'Galaga', emoji:'🛸', cost:30, controls:'← → mover, Espaço atirar' },
    { id:'towerdefense', name:'Tower Defense', emoji:'🏰', cost:30, controls:'Clique para posicionar torres' },
    { id:'racing', name:'Corrida', emoji:'🏎️', cost:30, controls:'← → desviar, ↑ acelerar' },
    { id:'platformer', name:'Plataforma', emoji:'🏃', cost:30, controls:'← → mover, Espaço pular' },
    { id:'pinball', name:'Pinball', emoji:'📌', cost:30, controls:'← → flippers, Espaço lançar' },
    { id:'sokoban', name:'Sokoban', emoji:'📦', cost:30, controls:'Setas para mover/empurrar' },
];

const TASKS = [
    { id:'first_game', name:'Primeira Partida', desc:'Jogue qualquer jogo pela primeira vez', reward:5, icon:'🎮', target:1, stat:'gamesPlayed' },
    { id:'explorer', name:'Explorador', desc:'Jogue 3 jogos diferentes', reward:10, icon:'🗺️', target:3, stat:'uniqueGames' },
    { id:'snake_master', name:'Mestre da Cobrinha', desc:'Faça 50+ pontos no Snake', reward:10, icon:'🐍', target:50, stat:'snake_best' },
    { id:'ttt_winner', name:'Vencedor da Velha', desc:'Vença 3 partidas do Jogo da Velha', reward:10, icon:'❌', target:3, stat:'tictactoe_wins' },
    { id:'memory_fast', name:'Memória de Elefante', desc:'Complete a Memória em menos de 60s', reward:15, icon:'🧠', target:1, stat:'memory_fast' },
    { id:'tetris_lines', name:'Tetris Mania', desc:'Limpe 10 linhas no Tetris', reward:15, icon:'🧱', target:10, stat:'tetris_lines' },
    { id:'pong_pro', name:'Pong Pro', desc:'Faça 7 pontos no Pong', reward:10, icon:'🏓', target:7, stat:'pong_best' },
    { id:'marathon', name:'Maratonista', desc:'Jogue 10 partidas no total', reward:20, icon:'🏃', target:10, stat:'gamesPlayed' },
    { id:'high_scorer', name:'Pontuação Alta', desc:'Acumule 500 pontos no total', reward:25, icon:'⭐', target:500, stat:'totalScore' },
    { id:'collector', name:'Colecionador', desc:'Desbloqueie 5 jogos pagos', reward:30, icon:'🔓', target:5, stat:'unlockedCount' },
    { id:'dedicated', name:'Jogador Dedicado', desc:'Jogue 25 partidas no total', reward:30, icon:'💪', target:25, stat:'gamesPlayed' },
    { id:'master', name:'Mestre dos Jogos', desc:'Jogue 15 jogos diferentes', reward:40, icon:'👑', target:15, stat:'uniqueGames' },
    { id:'legend', name:'Lenda', desc:'Acumule 2000 pontos no total', reward:50, icon:'🏆', target:2000, stat:'totalScore' },
    { id:'completist', name:'Completista', desc:'Desbloqueie todos os 30 jogos pagos', reward:100, icon:'🌟', target:30, stat:'unlockedCount' },
];

const App = {
    credits: 0,
    unlockedGames: [],
    stats: { gamesPlayed:0, totalScore:0, uniqueGames:0, unlockedCount:0, gamesPlayedList:[] },
    highScores: {},
    completedTasks: [],
    currentGame: null,
    currentGameInstance: null,
    currentScore: 0,
    loadedScripts: {},

    init() {
        this.load();
        this.renderLobby();
        this.renderTasks();
        this.updateCreditsUI();
        this.setupNav();
        this.setupFilters();
    },

    setupNav() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.navigate(btn.dataset.view));
        });
    },

    setupFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderLobby(btn.dataset.filter);
            });
        });
    },

    navigate(view) {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.nav-btn[data-view="${view}"]`).classList.add('active');
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        document.getElementById(`${view}-view`).classList.add('active');
        if (view === 'profile') this.renderProfile();
        if (view === 'tasks') this.renderTasks();
    },

    renderLobby(filter = 'all') {
        const grid = document.getElementById('games-grid');
        grid.innerHTML = '';
        let games = GAME_CATALOG;
        if (filter === 'free') games = games.filter(g => g.cost === 0);
        else if (filter === 'unlocked') games = games.filter(g => g.cost === 0 || this.unlockedGames.includes(g.id));
        else if (filter === 'locked') games = games.filter(g => g.cost > 0 && !this.unlockedGames.includes(g.id));

        games.forEach(g => {
            const isFree = g.cost === 0;
            const isUnlocked = isFree || this.unlockedGames.includes(g.id);
            const card = document.createElement('div');
            card.className = `game-card ${isUnlocked ? '' : 'locked'}`;
            card.innerHTML = `
                ${!isUnlocked ? '<span class="lock-icon">🔒</span>' : ''}
                <span class="game-emoji">${g.emoji}</span>
                <div class="game-name">${g.name}</div>
                <span class="game-badge ${isFree ? 'badge-free' : isUnlocked ? 'badge-unlocked' : 'badge-locked'}">
                    ${isFree ? 'GRÁTIS' : isUnlocked ? 'DESBLOQUEADO' : `🪙 ${g.cost} créditos`}
                </span>`;
            card.addEventListener('click', () => {
                if (isUnlocked) this.playGame(g.id);
                else this.showUnlockModal(g);
            });
            grid.appendChild(card);
        });
    },

    renderTasks() {
        const list = document.getElementById('tasks-list');
        list.innerHTML = '';
        TASKS.forEach(t => {
            const done = this.completedTasks.includes(t.id);
            const current = this.getTaskProgress(t);
            const pct = Math.min(100, (current / t.target) * 100);
            const card = document.createElement('div');
            card.className = `task-card ${done ? 'completed' : ''}`;
            card.innerHTML = `
                <span class="task-icon">${t.icon}</span>
                <div class="task-info">
                    <div class="task-name">${t.name}</div>
                    <div class="task-desc">${t.desc}</div>
                    <div class="task-progress-bar"><div class="task-progress-fill" style="width:${pct}%"></div></div>
                    <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">${done ? '✅ Completa!' : `${current}/${t.target}`}</div>
                </div>
                <div class="task-reward">${done ? '✅' : `🪙 ${t.reward}`}</div>`;
            list.appendChild(card);
        });
    },

    renderProfile() {
        document.getElementById('stat-played').textContent = this.stats.gamesPlayed;
        document.getElementById('stat-score').textContent = this.stats.totalScore;
        document.getElementById('stat-unlocked').textContent = this.unlockedGames.length;
        document.getElementById('stat-tasks').textContent = this.completedTasks.length;
        const hsList = document.getElementById('highscores-list');
        hsList.innerHTML = '';
        const entries = Object.entries(this.highScores).filter(([,v]) => v > 0);
        if (entries.length === 0) {
            hsList.innerHTML = '<p style="color:var(--text-secondary)">Nenhum recorde ainda. Jogue para registrar!</p>';
            return;
        }
        entries.sort((a, b) => b[1] - a[1]);
        entries.forEach(([gid, score]) => {
            const g = GAME_CATALOG.find(x => x.id === gid);
            if (!g) return;
            const row = document.createElement('div');
            row.className = 'hs-row';
            row.innerHTML = `<span class="hs-name">${g.emoji} ${g.name}</span><span class="hs-score">${score}</span>`;
            hsList.appendChild(row);
        });
    },

    getTaskProgress(task) {
        const s = this.stats;
        if (task.stat === 'uniqueGames') return new Set(s.gamesPlayedList).size;
        if (task.stat === 'unlockedCount') return this.unlockedGames.length;
        return s[task.stat] || 0;
    },

    updateCreditsUI() {
        document.getElementById('credit-count').textContent = this.credits;
    },

    showUnlockModal(game) {
        const canAfford = this.credits >= game.cost;
        this.showModal(
            `🔒 ${game.name}`,
            canAfford ? `Desbloquear por 🪙 ${game.cost} créditos?`
                      : `Você precisa de 🪙 ${game.cost} créditos. Você tem ${this.credits}.`,
            canAfford ? [
                { text: 'Cancelar', class: 'btn btn-secondary', action: () => this.hideModal() },
                { text: 'Desbloquear', class: 'btn btn-unlock', action: () => { this.unlockGame(game); this.hideModal(); } },
            ] : [
                { text: 'Fechar', class: 'btn btn-secondary', action: () => this.hideModal() },
                { text: 'Ir à Loja', class: 'btn btn-buy', action: () => { this.hideModal(); this.navigate('store'); } },
            ]
        );
    },

    showModal(title, msg, actions) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = msg;
        const actDiv = document.getElementById('modal-actions');
        actDiv.innerHTML = '';
        actions.forEach(a => {
            const btn = document.createElement('button');
            btn.className = a.class;
            btn.textContent = a.text;
            btn.onclick = a.action;
            actDiv.appendChild(btn);
        });
        document.getElementById('modal-overlay').classList.remove('hidden');
    },

    hideModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    },

    showToast(msg) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.classList.remove('hidden');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => t.classList.add('hidden'), 3000);
    },

    buyCredits(amount) {
        this.credits += amount;
        this.updateCreditsUI();
        this.save();
        this.showToast(`+${amount} créditos adicionados!`);
    },

    unlockGame(game) {
        if (this.credits < game.cost) return;
        this.credits -= game.cost;
        this.unlockedGames.push(game.id);
        this.stats.unlockedCount = this.unlockedGames.length;
        this.updateCreditsUI();
        this.checkTasks();
        this.save();
        this.renderLobby();
        this.showToast(`🔓 ${game.name} desbloqueado!`);
    },

    async playGame(gameId) {
        const game = GAME_CATALOG.find(g => g.id === gameId);
        if (!game) return;
        await this.loadGameScript(gameId);
        if (!window.Games[gameId]) { this.showToast('Erro ao carregar jogo'); return; }

        this.currentGame = game;
        this.currentScore = 0;
        document.getElementById('game-title').textContent = game.emoji + ' ' + game.name;
        document.getElementById('game-score').textContent = '0';
        document.getElementById('game-controls').textContent = game.controls;
        document.getElementById('game-container').innerHTML = '';
        document.getElementById('game-overlay').classList.remove('hidden');

        const container = document.getElementById('game-container');
        this.currentGameInstance = window.Games[gameId](container, {
            onScore: (s) => {
                this.currentScore = s;
                document.getElementById('game-score').textContent = s;
            },
            onGameOver: (finalScore) => {
                this.recordGameEnd(gameId, finalScore);
            }
        });
    },

    loadGameScript(gameId) {
        if (this.loadedScripts[gameId]) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = `js/games/${gameId}.js`;
            s.onload = () => { this.loadedScripts[gameId] = true; resolve(); };
            s.onerror = () => reject(new Error('Failed to load game'));
            document.head.appendChild(s);
        });
    },

    exitGame() {
        if (this.currentGameInstance && this.currentGameInstance.destroy) {
            this.currentGameInstance.destroy();
        }
        this.currentGameInstance = null;
        document.getElementById('game-overlay').classList.add('hidden');
        document.getElementById('game-container').innerHTML = '';
        if (this.currentGame && this.currentScore > 0) {
            this.recordGameEnd(this.currentGame.id, this.currentScore);
        }
        this.currentGame = null;
    },

    recordGameEnd(gameId, score) {
        this.stats.gamesPlayed++;
        this.stats.totalScore += score;
        if (!this.stats.gamesPlayedList.includes(gameId)) {
            this.stats.gamesPlayedList.push(gameId);
        }
        this.stats.uniqueGames = new Set(this.stats.gamesPlayedList).size;
        if (!this.highScores[gameId] || score > this.highScores[gameId]) {
            this.highScores[gameId] = score;
        }
        const statKey = gameId + '_best';
        if (!this.stats[statKey] || score > this.stats[statKey]) {
            this.stats[statKey] = score;
        }
        this.checkTasks();
        this.save();
    },

    addStat(key, val) {
        this.stats[key] = (this.stats[key] || 0) + val;
        this.checkTasks();
        this.save();
    },

    checkTasks() {
        TASKS.forEach(t => {
            if (this.completedTasks.includes(t.id)) return;
            const progress = this.getTaskProgress(t);
            if (progress >= t.target) {
                this.completedTasks.push(t.id);
                this.credits += t.reward;
                this.updateCreditsUI();
                this.showToast(`🎉 Tarefa "${t.name}" completa! +${t.reward} créditos`);
            }
        });
        this.save();
    },

    resetProgress() {
        this.showModal('⚠️ Resetar Progresso', 'Tem certeza? Todo progresso, créditos e jogos desbloqueados serão perdidos.', [
            { text: 'Cancelar', class: 'btn btn-secondary', action: () => this.hideModal() },
            { text: 'Resetar', class: 'btn btn-danger', action: () => {
                localStorage.removeItem('arcade_save');
                this.credits = 0; this.unlockedGames = []; this.stats = { gamesPlayed:0, totalScore:0, uniqueGames:0, unlockedCount:0, gamesPlayedList:[] };
                this.highScores = {}; this.completedTasks = [];
                this.updateCreditsUI(); this.renderLobby(); this.renderTasks(); this.renderProfile();
                this.hideModal(); this.showToast('Progresso resetado');
            }}
        ]);
    },

    save() {
        localStorage.setItem('arcade_save', JSON.stringify({
            credits: this.credits,
            unlockedGames: this.unlockedGames,
            stats: this.stats,
            highScores: this.highScores,
            completedTasks: this.completedTasks,
        }));
    },

    load() {
        try {
            const d = JSON.parse(localStorage.getItem('arcade_save'));
            if (d) {
                this.credits = d.credits || 0;
                this.unlockedGames = d.unlockedGames || [];
                this.stats = { ...this.stats, ...d.stats };
                this.highScores = d.highScores || {};
                this.completedTasks = d.completedTasks || [];
            }
        } catch(e) {}
    },
};

document.addEventListener('DOMContentLoaded', () => App.init());
