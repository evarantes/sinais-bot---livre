const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://arcade:arcade@localhost:5432/arcade',
});

async function initDB() {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'init.sql'), 'utf8');
    await pool.query(sql);
    console.log('Banco de dados inicializado');
}

module.exports = { pool, initDB };
