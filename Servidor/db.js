require('dotenv').config();
const { Pool } = require('pg');

const obrigatorias = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const faltando = obrigatorias.filter((nome) => !process.env[nome]);
if (faltando.length > 0) {
  console.error('Variáveis ausentes no .env: ' + faltando.join(', '));
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;
