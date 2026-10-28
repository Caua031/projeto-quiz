// rotas/categorias.js — Etapa 5.1: RA01
const express = require('express');
const pool = require('../db');

const router = express.Router();

// RA01: categorias em ordem alfabética, com a quantidade de perguntas
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.id_categoria, c.nome, COUNT(p.codigo)::int AS total_perguntas
         FROM categoria c
         LEFT JOIN pergunta p ON p.id_categoria = c.id_categoria
        GROUP BY c.id_categoria, c.nome
        ORDER BY c.nome`
    );
    res.json(rows);
  } catch (erro) {
    console.error('Erro em GET /api/categorias:', erro.message);
    res.status(500).json({ erro: 'Não foi possível listar as categorias.' });
  }
});

module.exports = router;
 