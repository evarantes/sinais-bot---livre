const API = {
    token: localStorage.getItem('arcade_token'),

    async request(method, path, body) {
        const opts = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (this.token) opts.headers['Authorization'] = 'Bearer ' + this.token;
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch('/api' + path, opts);
        const data = await res.json();
        if (res.status === 401) {
            this.token = null;
            localStorage.removeItem('arcade_token');
            if (typeof App !== 'undefined') App.showAuth();
            throw new Error('Não autenticado');
        }
        if (!res.ok) throw new Error(data.error || 'Erro');
        return data;
    },

    setToken(t) {
        this.token = t;
        localStorage.setItem('arcade_token', t);
    },

    clearToken() {
        this.token = null;
        localStorage.removeItem('arcade_token');
    },

    register(username, password) {
        return this.request('POST', '/auth/register', { username, password });
    },
    login(username, password) {
        return this.request('POST', '/auth/login', { username, password });
    },
    me() {
        return this.request('GET', '/auth/me');
    },
    profile() {
        return this.request('GET', '/profile');
    },
    buyCredits(amount) {
        return this.request('POST', '/credits/buy', { amount });
    },
    unlockGame(gameId, cost) {
        return this.request('POST', '/games/unlock', { gameId, cost });
    },
    submitScore(gameId, score) {
        return this.request('POST', '/games/score', { gameId, score });
    },
    submitStat(key, value) {
        return this.request('POST', '/games/stat', { key, value });
    },
    resetProgress() {
        return this.request('POST', '/profile/reset');
    },
};
