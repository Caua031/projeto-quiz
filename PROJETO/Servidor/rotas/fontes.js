// rotas/fontes.js
const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /api/fontes/repetidas
router.get('/repetidas', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT f.url, f.titulo, COUNT(p.codigo)::int AS total_perguntas
         FROM fonte f
         JOIN pergunta p ON p.fonte_url = f.url
        GROUP BY f.url, f.titulo
       HAVING COUNT(p.codigo) > 1
        ORDER BY total_perguntas DESC, f.url`
    );
    res.json(rows);
  } catch (erro) {
    console.error('Erro em GET /api/fontes/repetidas:', erro.message);
    res.status(500).json({ erro: 'Não foi possível listar as fontes.' });
  }
});

module.exports = router;
