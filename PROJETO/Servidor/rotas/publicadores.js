// rotas/publicadores.js 
const express = require('express');
const pool = require('../db');

const router = express.Router();


router.get('/mais-citados', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pu.id_publicador, pu.nome AS publicador, COUNT(p.codigo)::int AS total_perguntas
         FROM publicador pu
         JOIN fonte f    ON f.id_publicador = pu.id_publicador
         JOIN pergunta p ON p.fonte_url     = f.url
        GROUP BY pu.id_publicador, pu.nome
        ORDER BY total_perguntas DESC, pu.nome`
    );
    res.json(rows);
  } catch (erro) {
    console.error('Erro em GET /api/publicadores/mais-citados:', erro.message);
    res.status(500).json({ erro: 'Não foi possível listar os publicadores.' });
  }
});

module.exports = router;
