// rotas/perguntas.js 
// pergunta + alternativas 
const express = require('express');
const pool = require('../db');

const router = express.Router();

// Parte comum do SELECT: pergunta + nome da categoria + descrição da dificuldade.
const BASE_PERGUNTA = `
  SELECT p.codigo, p.titulo, p.enunciado,
         c.nome AS categoria, d.descricao AS dificuldade
    FROM pergunta p
    JOIN categoria c   ON c.id_categoria   = p.id_categoria
    JOIN dificuldade d ON d.id_dificuldade = p.id_dificuldade`;

// Converte um filtro da URL em número inteiro. Ausente = sem filtro (null).
function lerInteiro(texto) {
  if (texto === undefined) return { ok: true, valor: null };
  if (!/^\d+$/.test(texto)) return { ok: false };
  return { ok: true, valor: Number(texto) };
}

// Busca as alternativas (letra e texto) de uma pergunta, sem o gabarito.
async function buscarAlternativas(codigo) {
  const { rows } = await pool.query(
    'SELECT letra, texto FROM alternativa WHERE pergunta_codigo = $1 ORDER BY letra',
    [codigo]
  );
  return rows;
}

router.get('/', async (req, res) => {
  const categoria = lerInteiro(req.query.categoria);
  const dificuldade = lerInteiro(req.query.dificuldade);
  if (!categoria.ok || !dificuldade.ok) {
    return res
      .status(400)
      .json({ erro: 'Os filtros categoria e dificuldade devem ser números inteiros.' });
  }

  let palavra = null;
  if (req.query.palavra !== undefined) {
    if (typeof req.query.palavra !== 'string' || req.query.palavra.trim() === '') {
      return res.status(400).json({ erro: 'O filtro palavra deve ser um texto não vazio.' });
    }
    palavra = req.query.palavra.trim();
  }

  try {
    const { rows } = await pool.query(
      BASE_PERGUNTA +
        `
      WHERE ($1::int IS NULL OR p.id_categoria   = $1)
        AND ($2::int IS NULL OR p.id_dificuldade = $2)
        AND ($3::text IS NULL OR EXISTS (
              SELECT 1
                FROM pergunta_palavra_chave ppk
                JOIN palavra_chave pk ON pk.id_palavra_chave = ppk.id_palavra_chave
               WHERE ppk.pergunta_codigo = p.codigo
                 AND lower(pk.termo) = lower($3::text)))
      ORDER BY p.codigo`,
      [categoria.valor, dificuldade.valor, palavra]
    );
    res.json(rows);
  } catch (erro) {
    console.error('Erro em GET /api/perguntas:', erro.message);
    res.status(500).json({ erro: 'Não foi possível listar as perguntas.' });
  }
});

router.get('/sorteio', async (req, res) => {
  const categoria = lerInteiro(req.query.categoria);
  const dificuldade = lerInteiro(req.query.dificuldade);
  if (!categoria.ok || !dificuldade.ok) {
    return res
      .status(400)
      .json({ erro: 'Os filtros categoria e dificuldade devem ser números inteiros.' });
  }

  try {
    const { rows } = await pool.query(
      BASE_PERGUNTA +
        `
      WHERE ($1::int IS NULL OR p.id_categoria   = $1)
        AND ($2::int IS NULL OR p.id_dificuldade = $2)
      ORDER BY random()
      LIMIT 1`,
      [categoria.valor, dificuldade.valor]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ erro: 'Nenhuma pergunta encontrada para os filtros informados.' });
    }

    const pergunta = rows[0];
    pergunta.alternativas = await buscarAlternativas(pergunta.codigo);
    res.json(pergunta);
  } catch (erro) {
    console.error('Erro em GET /api/perguntas/sorteio:', erro.message);
    res.status(500).json({ erro: 'Não foi possível sortear a pergunta.' });
  }
});

router.get('/:codigo', async (req, res) => {
  try {
    const { rows } = await pool.query(BASE_PERGUNTA + ' WHERE p.codigo = $1', [
      req.params.codigo,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Pergunta não encontrada.' });
    }

    const pergunta = rows[0];
    pergunta.alternativas = await buscarAlternativas(pergunta.codigo);
    res.json(pergunta);
  } catch (erro) {
    console.error('Erro em GET /api/perguntas/:codigo:', erro.message);
    res.status(500).json({ erro: 'Não foi possível buscar a pergunta.' });
  }
});

router.post('/:codigo/resposta', async (req, res) => {
  const letra = req.body?.letra;
  if (typeof letra !== 'string' || letra.length === 0) {
    return res.status(400).json({ erro: 'Informe a letra da alternativa escolhida.' });
  }

  try {
    const dados = await pool.query(
      `SELECT p.explicacao, f.titulo AS fonte_titulo, f.url AS fonte_url,
              pu.nome AS publicador, i.descricao AS idioma
         FROM pergunta p
         JOIN fonte f       ON f.url = p.fonte_url
         JOIN publicador pu ON pu.id_publicador = f.id_publicador
         JOIN idioma i      ON i.id_idioma = f.id_idioma
        WHERE p.codigo = $1`,
      [req.params.codigo]
    );
    if (dados.rows.length === 0) {
      return res.status(404).json({ erro: 'Pergunta não encontrada.' });
    }

    const alternativas = await pool.query(
      'SELECT letra, texto, correta FROM alternativa WHERE pergunta_codigo = $1 ORDER BY letra',
      [req.params.codigo]
    );
    const escolhida = alternativas.rows.find((a) => a.letra === letra);
    if (!escolhida) {
      return res.status(400).json({ erro: 'Alternativa inexistente para esta pergunta.' });
    }
    const correta = alternativas.rows.find((a) => a.correta);
    if (!correta) {
      console.error('Pergunta sem alternativa correta:', req.params.codigo);
      return res.status(500).json({ erro: 'Pergunta cadastrada sem alternativa correta.' });
    }

    const d = dados.rows[0];
    res.json({
      acertou: escolhida.correta,
      alternativa_correta: { letra: correta.letra, texto: correta.texto },
      explicacao: d.explicacao,
      fonte: { titulo: d.fonte_titulo, url: d.fonte_url, publicador: d.publicador, idioma: d.idioma },
    });
  } catch (erro) {
    console.error('Erro em POST /api/perguntas/:codigo/resposta:', erro.message);
    res.status(500).json({ erro: 'Não foi possível registrar a resposta.' });
  }
});

module.exports = router;
