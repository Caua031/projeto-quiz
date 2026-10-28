const router = require('express').Router();
const pool = require('../db');
const config = require('../configuracoes');
const { rota, falha, inteiro, transacao, proximoId } = require('../operacoes');
const auth = require('../autenticacao');

// O cadastro público de jogadores agora cria uma conta com senha.
router.post('/jogadores', (req, res) => res.status(410).json({ erro: 'Crie sua conta na tela de cadastro, informando nome de usuário e senha.' }));

router.get('/ranking', rota(async (req, res) => {
  res.json((await pool.query(`SELECT j.id_jogador,j.nome,SUM(p.pontos)::int AS pontos,
    COUNT(p.id_pontuacao)::int AS partidas FROM jogador j JOIN quiz q USING(id_jogador)
    JOIN pontuacao p USING(id_quiz) GROUP BY j.id_jogador,j.nome
    ORDER BY pontos DESC,j.nome,j.id_jogador`)).rows);
}));

router.get('/configuracoes', rota(async (req, res) => res.json(await config.ler())));

router.post('/jogos', auth.exigirLogin, rota(async (req, res) => {
  const id = req.usuario.id_jogador;
  const categoria = req.body?.categoria == null ? null : inteiro(req.body.categoria, 'Categoria');
  const dificuldade = req.body?.dificuldade == null ? null : inteiro(req.body.dificuldade, 'Dificuldade');
  const configuracao = await config.ler();
  const jogo = await transacao(async c => {
    if (!(await c.query('SELECT 1 FROM jogador WHERE id_jogador=$1', [id])).rowCount) falha(404, 'Jogador não encontrado. Faça seu cadastro novamente.');
    const { rows } = await c.query(`SELECT codigo FROM pergunta WHERE ($1::int IS NULL OR id_categoria=$1)
      AND ($2::int IS NULL OR id_dificuldade=$2) ORDER BY random() LIMIT $3`, [categoria, dificuldade, configuracao.perguntas_por_rodada]);
    if (!rows.length) falha(404, 'Ainda não há perguntas para essa combinação de categoria e dificuldade.');
    const id_quiz = await proximoId(c, 'quiz', 'id_quiz');
    await c.query('INSERT INTO quiz(id_quiz,id_jogador) OVERRIDING SYSTEM VALUE VALUES($1,$2)', [id_quiz, id]);
    for (const p of rows) await c.query('INSERT INTO quiz_pergunta(id_quiz,pergunta_codigo) VALUES($1,$2)', [id_quiz, p.codigo]);
    return { id_quiz, codigos: rows.map(p => p.codigo), ...configuracao };
  });
  res.status(201).json(jogo);
}));

router.post('/jogos/:id/finalizar', auth.exigirLogin, rota(async (req, res) => {
  const id = inteiro(req.params.id, 'Quiz');
  const respostas = req.body?.respostas;
  if (!Array.isArray(respostas) || !respostas.length || respostas.length > 50 || respostas.some(r => !r || typeof r.codigo !== 'string' || typeof r.letra !== 'string')) falha(400, 'Envie as respostas da rodada.');
  if (new Set(respostas.map(r => r.codigo)).size !== respostas.length) falha(400, 'Há perguntas repetidas nas respostas.');
  const configuracao = await config.ler();
  const resultado = await transacao(async c => {
    if (!(await c.query('SELECT 1 FROM quiz WHERE id_quiz=$1 AND id_jogador=$2 FOR UPDATE', [id, req.usuario.id_jogador])).rowCount) falha(404, 'Quiz não encontrado para sua conta.');
    const salvo = await c.query('SELECT pontos FROM pontuacao WHERE id_quiz=$1', [id]);
    if (salvo.rowCount) return { pontos: salvo.rows[0].pontos, salvo: true };
    const perguntas = (await c.query('SELECT pergunta_codigo FROM quiz_pergunta WHERE id_quiz=$1', [id])).rows;
    if (perguntas.length !== respostas.length || perguntas.some(p => !respostas.some(r => r.codigo === p.pergunta_codigo))) falha(400, 'Responda todas as perguntas da rodada antes de finalizar.');
    let acertos = 0;
    for (const r of respostas) {
      const a = await c.query('SELECT correta FROM alternativa WHERE pergunta_codigo=$1 AND letra=$2', [r.codigo, r.letra]);
      if (!a.rowCount) falha(400, 'Uma alternativa informada não existe.');
      if (a.rows[0].correta) acertos++;
    }
    const pontos = acertos * configuracao.pontos_por_acerto;
    await c.query('INSERT INTO pontuacao(id_pontuacao,pontos,id_quiz) OVERRIDING SYSTEM VALUE VALUES($1,$2,$3)', [await proximoId(c, 'pontuacao', 'id_pontuacao'), pontos, id]);
    return { pontos, acertos, total: perguntas.length, salvo: true };
  });
  res.json(resultado);
}));

module.exports = router;
