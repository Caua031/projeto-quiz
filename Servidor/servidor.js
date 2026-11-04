const express = require('express');
const path = require('path');
const fs = require('fs');
const pool = require('./db');
const auth = require('./autenticacao');

const app = express();
const PORTA = Number(process.env.PORT || 3000);

// Pasta do front-end. Por padrão fica ao lado da pasta Servidor (../PROJETO);
// dá para trocar com FRONT_DIR no .env (caminho absoluto, ou relativo a esta pasta).
// (o db.js já carregou o .env quando chegamos aqui)
const PASTA_FRONT = path.resolve(__dirname, process.env.FRONT_DIR || '../PROJETO');

app.use(express.json());

// Cookies de login só aceitam requisições do site e de origens explicitamente configuradas.
app.use('/api', (req, res, next) => {
  const origem = req.headers.origin;
  const permitidas = (process.env.FRONT_ORIGIN || '').split(',').map(o => o.trim()).filter(Boolean);
  if (origem) {
    let mesmaOrigem = false;
    try { mesmaOrigem = new URL(origem).origin === `${req.protocol}://${req.get('host')}`; } catch { /* origem inválida */ }
    if (!mesmaOrigem && !permitidas.includes(origem)) return res.status(403).json({ erro: 'Abra o site pelo endereço do servidor para fazer login.' });
    res.set({ 'Access-Control-Allow-Origin': origem, 'Access-Control-Allow-Credentials': 'true' });
    res.vary('Origin');
  }
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers['sec-fetch-site'] === 'cross-site' && !permitidas.includes(origem)) {
    return res.status(403).json({ erro: 'Origem da requisição não permitida.' });
  }
  res.set({ 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use('/api', auth.identificarUsuario);
app.use('/api/auth', require('./rotas/auth'));

app.get('/api/saude', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/saude-banco', async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT current_database() AS banco,
              (SELECT count(*)::int FROM dificuldade) AS dificuldades`
    );
    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro na consulta:', erro.message);
    res.status(500).json({ erro: 'Não foi possível consultar o banco.' });
  }
});




app.use('/api/categorias', require('./rotas/categorias')); //configuração da rota de categorias

app.use('/api/perguntas', require('./rotas/perguntas')); //configuração da rota de perguntas

app.use('/api/publicadores', require('./rotas/publicadores')); //configuração da rota de publicadores

app.use('/api/fontes', require('./rotas/fontes'));
app.use('/api/admin', auth.exigirAdmin, require('./rotas/administracao'));
app.use('/api', require('./rotas/jogadores'));

// Rota inexistente dentro de /api: responde JSON (e não a página HTML padrão)
app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// ---- Front-end (pasta PROJETO) ----
// Servindo o front por aqui, página e API ficam na mesma origem (http://localhost:3000).
// doc_date é material de entrega da disciplina, não faz parte do site.
app.use('/doc_date', (req, res) => res.status(404).end());
app.get('/', (req, res) => res.redirect('/cadastro/cadastro.html'));
app.use(express.static(PASTA_FRONT));

// Tratamento de erros: JSON inválido no corpo e falhas inesperadas
app.use((erro, req, res, next) => {
  if (erro.type === 'entity.parse.failed' || (erro instanceof SyntaxError && erro.status === 400)) {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  console.error('Erro inesperado:', erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});


if (require.main === module) require('./migrar')().then(() => app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
  if (fs.existsSync(PASTA_FRONT)) {
    console.log(`Front-end servido de ${PASTA_FRONT} -> abra http://localhost:${PORTA}`);
  } else {
    console.warn(`Aviso: pasta do front-end não encontrada em ${PASTA_FRONT}. Ajuste FRONT_DIR no .env.`);
  }
})).catch(async erro => {
  console.error('Não foi possível iniciar o servidor:', erro.message);
  process.exitCode = 1;
  await pool.end();
});

module.exports = app;
