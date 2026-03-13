const express = require('express');
const path = require('path');
const { initDB } = require('./db');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(express.static(path.join(__dirname, '..')));

app.use('/api', routes);

app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    } else {
        next();
    }
});

async function start() {
    try {
        await initDB();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Servidor rodando em http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Erro ao iniciar:', err.message);
        console.log('Tentando novamente em 3s...');
        setTimeout(start, 3000);
    }
}

start();
