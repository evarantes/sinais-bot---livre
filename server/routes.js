const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('./db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'arcade-secret-key-change-in-production';

function auth(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: 'Token necessário' });
    try {
        const token = header.replace('Bearer ', '');
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido' });
    }
}

// ==================== AUTH ====================

router.post('/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username e senha obrigatórios' });
    if (username.length < 3 || username.length > 30) return res.status(400).json({ error: 'Username deve ter 3-30 caracteres' });
    if (password.length < 4) return res.status(400).json({ error: 'Senha deve ter pelo menos 4 caracteres' });

    try {
        const hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, password_hash, credits) VALUES ($1, $2, 0) RETURNING id, username, credits',
            [username.toLowerCase().trim(), hash]
        );
        const user = result.rows[0];
        await pool.query(
            'INSERT INTO user_stats (user_id) VALUES ($1)',
            [user.id]
        );
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: { id: user.id, username: user.username, credits: 0 } });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ error: 'Username já existe' });
        res.status(500).json({ error: 'Erro ao registrar' });
    }
});

router.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username e senha obrigatórios' });

    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username.toLowerCase().trim()]);
        if (!result.rows.length) return res.status(401).json({ error: 'Usuário ou senha incorretos' });
        const user = result.rows[0];
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'Usuário ou senha incorretos' });
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: { id: user.id, username: user.username, credits: user.credits } });
    } catch {
        res.status(500).json({ error: 'Erro ao logar' });
    }
});

router.get('/auth/me', auth, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username, credits FROM users WHERE id = $1', [req.user.id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json({ user: result.rows[0] });
    } catch {
        res.status(500).json({ error: 'Erro' });
    }
});

// ==================== PROFILE ====================

router.get('/profile', auth, async (req, res) => {
    try {
        const uid = req.user.id;
        const [userR, statsR, unlocksR, scoresR, tasksR] = await Promise.all([
            pool.query('SELECT id, username, credits FROM users WHERE id = $1', [uid]),
            pool.query('SELECT * FROM user_stats WHERE user_id = $1', [uid]),
            pool.query('SELECT game_id FROM game_unlocks WHERE user_id = $1', [uid]),
            pool.query('SELECT game_id, score FROM high_scores WHERE user_id = $1', [uid]),
            pool.query('SELECT task_id FROM task_completions WHERE user_id = $1', [uid]),
        ]);
        const user = userR.rows[0];
        const stats = statsR.rows[0] || { games_played: 0, total_score: 0, games_played_list: [] };
        res.json({
            user: { id: user.id, username: user.username, credits: user.credits },
            stats: {
                gamesPlayed: stats.games_played,
                totalScore: stats.total_score,
                gamesPlayedList: stats.games_played_list || [],
                uniqueGames: (stats.games_played_list || []).length,
                unlockedCount: unlocksR.rows.length,
            },
            unlockedGames: unlocksR.rows.map(r => r.game_id),
            highScores: Object.fromEntries(scoresR.rows.map(r => [r.game_id, r.score])),
            completedTasks: tasksR.rows.map(r => r.task_id),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao carregar perfil' });
    }
});

// ==================== CRÉDITOS ====================

router.post('/credits/buy', auth, async (req, res) => {
    const { amount } = req.body;
    if (![10, 25, 50, 100].includes(amount)) return res.status(400).json({ error: 'Valor inválido' });
    try {
        const result = await pool.query(
            'UPDATE users SET credits = credits + $1 WHERE id = $2 RETURNING credits',
            [amount, req.user.id]
        );
        res.json({ credits: result.rows[0].credits });
    } catch {
        res.status(500).json({ error: 'Erro ao comprar créditos' });
    }
});

// ==================== JOGOS ====================

router.post('/games/unlock', auth, async (req, res) => {
    const { gameId, cost } = req.body;
    if (!gameId || !cost) return res.status(400).json({ error: 'Dados inválidos' });
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const userR = await client.query('SELECT credits FROM users WHERE id = $1 FOR UPDATE', [req.user.id]);
        if (userR.rows[0].credits < cost) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Créditos insuficientes' });
        }
        await client.query('UPDATE users SET credits = credits - $1 WHERE id = $2', [cost, req.user.id]);
        await client.query(
            'INSERT INTO game_unlocks (user_id, game_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [req.user.id, gameId]
        );
        await client.query('COMMIT');
        const result = await client.query('SELECT credits FROM users WHERE id = $1', [req.user.id]);
        const unlocksR = await client.query('SELECT game_id FROM game_unlocks WHERE user_id = $1', [req.user.id]);
        res.json({
            credits: result.rows[0].credits,
            unlockedGames: unlocksR.rows.map(r => r.game_id),
        });
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') return res.json({ credits: (await pool.query('SELECT credits FROM users WHERE id=$1',[req.user.id])).rows[0].credits });
        res.status(500).json({ error: 'Erro ao desbloquear' });
    } finally {
        client.release();
    }
});

router.post('/games/score', auth, async (req, res) => {
    const { gameId, score } = req.body;
    if (!gameId || score === undefined) return res.status(400).json({ error: 'Dados inválidos' });
    const uid = req.user.id;
    try {
        await pool.query(
            `INSERT INTO high_scores (user_id, game_id, score)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, game_id) DO UPDATE SET score = GREATEST(high_scores.score, $3), achieved_at = CURRENT_TIMESTAMP`,
            [uid, gameId, score]
        );

        await pool.query(
            `INSERT INTO user_stats (user_id, games_played, total_score, games_played_list)
             VALUES ($1, 1, $2, $3::jsonb)
             ON CONFLICT (user_id) DO UPDATE SET
                games_played = user_stats.games_played + 1,
                total_score = user_stats.total_score + $2,
                games_played_list = (
                    CASE WHEN NOT user_stats.games_played_list ? $4
                    THEN user_stats.games_played_list || $3::jsonb
                    ELSE user_stats.games_played_list END
                )`,
            [uid, score, JSON.stringify([gameId]), gameId]
        );

        const [statsR, scoresR, unlocksR, tasksR, userR] = await Promise.all([
            pool.query('SELECT * FROM user_stats WHERE user_id = $1', [uid]),
            pool.query('SELECT game_id, score FROM high_scores WHERE user_id = $1', [uid]),
            pool.query('SELECT game_id FROM game_unlocks WHERE user_id = $1', [uid]),
            pool.query('SELECT task_id FROM task_completions WHERE user_id = $1', [uid]),
            pool.query('SELECT credits FROM users WHERE id = $1', [uid]),
        ]);

        const stats = statsR.rows[0];
        const highScores = Object.fromEntries(scoresR.rows.map(r => [r.game_id, r.score]));
        const completedTasks = tasksR.rows.map(r => r.task_id);
        const unlockedCount = unlocksR.rows.length;

        const TASKS = [
            { id: 'first_game', target: 1, stat: 'gamesPlayed', reward: 5 },
            { id: 'explorer', target: 3, stat: 'uniqueGames', reward: 10 },
            { id: 'snake_master', target: 50, stat: 'snake_best', reward: 10 },
            { id: 'ttt_winner', target: 3, stat: 'tictactoe_wins', reward: 10 },
            { id: 'memory_fast', target: 1, stat: 'memory_fast', reward: 15 },
            { id: 'tetris_lines', target: 10, stat: 'tetris_lines', reward: 15 },
            { id: 'pong_pro', target: 7, stat: 'pong_best', reward: 10 },
            { id: 'marathon', target: 10, stat: 'gamesPlayed', reward: 20 },
            { id: 'high_scorer', target: 500, stat: 'totalScore', reward: 25 },
            { id: 'collector', target: 5, stat: 'unlockedCount', reward: 30 },
            { id: 'dedicated', target: 25, stat: 'gamesPlayed', reward: 30 },
            { id: 'master', target: 15, stat: 'uniqueGames', reward: 40 },
            { id: 'legend', target: 2000, stat: 'totalScore', reward: 50 },
            { id: 'completist', target: 30, stat: 'unlockedCount', reward: 100 },
        ];

        function getProgress(task) {
            if (task.stat === 'gamesPlayed') return stats.games_played;
            if (task.stat === 'totalScore') return stats.total_score;
            if (task.stat === 'uniqueGames') return (stats.games_played_list || []).length;
            if (task.stat === 'unlockedCount') return unlockedCount;
            if (task.stat.endsWith('_best')) {
                const gid = task.stat.replace('_best', '');
                return highScores[gid] || 0;
            }
            return 0;
        }

        let creditsEarned = 0;
        for (const task of TASKS) {
            if (completedTasks.includes(task.id)) continue;
            if (getProgress(task) >= task.target) {
                await pool.query(
                    'INSERT INTO task_completions (user_id, task_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [uid, task.id]
                );
                creditsEarned += task.reward;
                completedTasks.push(task.id);
            }
        }

        if (creditsEarned > 0) {
            await pool.query('UPDATE users SET credits = credits + $1 WHERE id = $2', [creditsEarned, uid]);
        }

        const finalCredits = (await pool.query('SELECT credits FROM users WHERE id = $1', [uid])).rows[0].credits;

        res.json({
            credits: finalCredits,
            stats: {
                gamesPlayed: stats.games_played,
                totalScore: stats.total_score,
                gamesPlayedList: stats.games_played_list || [],
                uniqueGames: (stats.games_played_list || []).length,
                unlockedCount,
            },
            highScores,
            completedTasks,
            creditsEarned,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao salvar pontuação' });
    }
});

// ==================== STAT ADICIONAL (para tarefas especiais) ====================

router.post('/games/stat', auth, async (req, res) => {
    const { key, value } = req.body;
    if (!key) return res.status(400).json({ error: 'Dados inválidos' });
    const uid = req.user.id;
    try {
        const gameId = key.replace('_wins', '').replace('_fast', '').replace('_lines', '');
        const fakeScore = value || 1;
        await pool.query(
            `INSERT INTO high_scores (user_id, game_id, score)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, game_id) DO UPDATE SET score = GREATEST(high_scores.score, $3)`,
            [uid, key, fakeScore]
        );
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao salvar stat' });
    }
});

router.post('/profile/reset', auth, async (req, res) => {
    const uid = req.user.id;
    try {
        await pool.query('DELETE FROM game_unlocks WHERE user_id = $1', [uid]);
        await pool.query('DELETE FROM high_scores WHERE user_id = $1', [uid]);
        await pool.query('DELETE FROM task_completions WHERE user_id = $1', [uid]);
        await pool.query('UPDATE user_stats SET games_played = 0, total_score = 0, games_played_list = \'[]\'::jsonb WHERE user_id = $1', [uid]);
        await pool.query('UPDATE users SET credits = 0 WHERE id = $1', [uid]);
        res.json({ ok: true });
    } catch {
        res.status(500).json({ error: 'Erro ao resetar' });
    }
});

router.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = router;
