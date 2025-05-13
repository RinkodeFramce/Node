require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.use(bodyParser.json());

const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});
app.post('/clients', async (req, res) => {
    const { inn, name } = req.body;
    if (!inn || !name) {
        return res.status(400).json({ error: 'Необходимы ИНН и Наименование' });
    }

    if (!/^\d{10}$|^\d{12}$/.test(inn)) {
        return res.status(400).json({ error: 'ИНН должен содержать 10 или 12 цифр' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO clients (inn, name) VALUES ($1, $2) RETURNING *',
            [inn, name]
        );
        console.log(`Добавлен клиент: ${name}, ИНН: ${inn}`);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'ИНН уже существует в базе данных' });
        }
        console.error('Ошибка сервера:', err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});