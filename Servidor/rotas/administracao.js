const router = require('express').Router();
const pool = require('../db');
const config = require('../configuracoes');
const { rota, falha, texto, inteiro, transacao, proximoId } = require('../operacoes');
const auth = require('../autenticacao');

router.get('/referencias', rota(async (req, res) => {
  const consultas = await Promise.all([
    pool.query('SELECT * FROM categoria ORDER BY nome'),
    pool.query('SELECT * FROM dificuldade ORDER BY id_dificuldade'),
    pool.query('SELECT * FROM fonte ORDER BY titulo'),
    pool.query('SELECT * FROM publicador ORDER BY nome'),
    pool.query('SELECT * FROM idioma ORDER BY descricao'),
  ]);
  res.json(Object.fromEntries(['categorias', 'dificuldades', 'fontes', 'publicadores', 'idiomas'].map((chave, i) => [chave, consultas[i].rows])));
}));

router.get('/configuracoes', rota(async (req, res) => res.json(await config.ler())));
router.put('/configuracoes', rota(async (req, res) => res.json(await config.salvar(req.body || {}))));

router.get('/perguntas', rota(async (req, res) => {
  const { rows } = await pool.query(`SELECT p.*, c.nome AS categoria, d.descricao AS dificuldade,
    (SELECT COALESCE(json_agg(a ORDER BY a.letra), '[]'::json) FROM
      (SELECT letra, texto, correta FROM alternativa WHERE pergunta_codigo = p.codigo) a) AS alternativas,
    (SELECT COALESCE(string_agg(pk.termo, ', ' ORDER BY pk.termo), '') FROM pergunta_palavra_chave pp
      JOIN palavra_chave pk USING (id_palavra_chave) WHERE pp.pergunta_codigo = p.codigo) AS palavras
    FROM pergunta p JOIN categoria c USING (id_categoria) JOIN dificuldade d USING (id_dificuldade)
    ORDER BY p.codigo`);
  res.json(rows);
}));

function perguntaValida(corpo = {}) {
  const dados = {
    codigo: texto(corpo.codigo, 'Código', 20), titulo: texto(corpo.titulo, 'Título', 150),
    enunciado: texto(corpo.enunciado, 'Enunciado'), explicacao: texto(corpo.explicacao, 'Explicação'),
    id_categoria: inteiro(corpo.id_categoria, 'Categoria'), id_dificuldade: inteiro(corpo.id_dificuldade, 'Dificuldade'),
    fonte_url: texto(corpo.fonte_url, 'URL da fonte', 2048),
  };
  if (!/^https?:\/\//i.test(dados.fonte_url)) falha(400, 'A fonte deve ser uma URL HTTP ou HTTPS.');
  if (!Array.isArray(corpo.alternativas) || corpo.alternativas.length < 2 || corpo.alternativas.length > 4) falha(400, 'Cadastre entre duas e quatro alternativas.');
  dados.alternativas = corpo.alternativas.map((a, i) => ({ letra: 'ABCD'[i], texto: texto(a.texto, `Alternativa ${i + 1}`), correta: a.correta === true }));
  if (dados.alternativas.filter(a => a.correta).length !== 1) falha(400, 'Selecione exatamente uma alternativa correta.');
  if (corpo.palavras !== undefined && typeof corpo.palavras !== 'string') falha(400, 'Palavras-chave devem ser um texto separado por vírgulas.');
  dados.palavras = [...new Set((corpo.palavras || '').split(',').map(p => p.trim()).filter(Boolean))];
  if (dados.palavras.length > 20 || dados.palavras.some(p => p.length > 80)) falha(400, 'Use até 20 palavras-chave, com até 80 caracteres cada.');
  return dados;
}

async function gravarPergunta(req, res, editar) {
  const p = perguntaValida(req.body);
  if (editar && req.params.codigo !== p.codigo) falha(400, 'O código da pergunta não pode ser alterado.');
  await transacao(async c => {
    if (editar) {
      const atual = await c.query('SELECT codigo FROM pergunta WHERE codigo=$1 FOR UPDATE', [p.codigo]);
      if (!atual.rowCount) falha(404, 'Pergunta não encontrada.');
    }
    const fonte = await c.query('SELECT url FROM fonte WHERE url=$1', [p.fonte_url]);
    if (!fonte.rowCount) {
      await c.query('INSERT INTO fonte(url,titulo,id_publicador,id_idioma) VALUES($1,$2,$3,$4)', [p.fonte_url,
        texto(req.body.fonte_titulo, 'Título da fonte', 250), inteiro(req.body.id_publicador, 'Publicador'), inteiro(req.body.id_idioma, 'Idioma')]);
    }
    const valores = [p.codigo, p.titulo, p.enunciado, p.explicacao, p.id_categoria, p.id_dificuldade, p.fonte_url];
    if (editar) {
      await c.query('UPDATE pergunta SET titulo=$2,enunciado=$3,explicacao=$4,id_categoria=$5,id_dificuldade=$6,fonte_url=$7 WHERE codigo=$1', valores);
      await c.query('DELETE FROM alternativa WHERE pergunta_codigo=$1', [p.codigo]);
      await c.query('DELETE FROM pergunta_palavra_chave WHERE pergunta_codigo=$1', [p.codigo]);
    } else {
      await c.query('INSERT INTO pergunta(codigo,titulo,enunciado,explicacao,id_categoria,id_dificuldade,fonte_url) VALUES($1,$2,$3,$4,$5,$6,$7)', valores);
    }
    for (const a of p.alternativas) {
      await c.query('INSERT INTO alternativa(id_alternativa,pergunta_codigo,letra,texto,correta) OVERRIDING SYSTEM VALUE VALUES($1,$2,$3,$4,$5)', [await proximoId(c, 'alternativa', 'id_alternativa'), p.codigo, a.letra, a.texto, a.correta]);
    }
    for (const termo of p.palavras) {
      let chave = await c.query('SELECT id_palavra_chave FROM palavra_chave WHERE termo=$1', [termo]);
      if (!chave.rowCount) chave = await c.query('INSERT INTO palavra_chave(id_palavra_chave,termo) OVERRIDING SYSTEM VALUE VALUES($1,$2) RETURNING id_palavra_chave', [await proximoId(c, 'palavra_chave', 'id_palavra_chave'), termo]);
      await c.query('INSERT INTO pergunta_palavra_chave(pergunta_codigo,id_palavra_chave) VALUES($1,$2)', [p.codigo, chave.rows[0].id_palavra_chave]);
    }
  });
  res.status(editar ? 200 : 201).json({ codigo: p.codigo });
}
router.post('/perguntas', rota((req, res) => gravarPergunta(req, res, false)));
router.put('/perguntas/:codigo', rota((req, res) => gravarPergunta(req, res, true)));
router.delete('/perguntas/:codigo', rota(async (req, res) => {
  await transacao(async c => {
    if ((await c.query('SELECT 1 FROM quiz_pergunta WHERE pergunta_codigo=$1 LIMIT 1', [req.params.codigo])).rowCount) falha(409, 'Esta pergunta faz parte de uma tentativa e deve ser preservada no histórico.');
    await c.query('DELETE FROM pergunta_palavra_chave WHERE pergunta_codigo=$1', [req.params.codigo]);
    await c.query('DELETE FROM alternativa WHERE pergunta_codigo=$1', [req.params.codigo]);
    if (!(await c.query('DELETE FROM pergunta WHERE codigo=$1', [req.params.codigo])).rowCount) falha(404, 'Pergunta não encontrada.');
  });
  res.json({ ok: true });
}));

router.post('/categorias', rota(async (req, res) => {
  const nome = texto(req.body?.nome, 'Nome', 60);
  const registro = await transacao(async c => (await c.query('INSERT INTO categoria(id_categoria,nome) OVERRIDING SYSTEM VALUE VALUES($1,$2) RETURNING *', [await proximoId(c, 'categoria', 'id_categoria'), nome])).rows[0]);
  res.status(201).json(registro);
}));
router.put('/categorias/:id', rota(async (req, res) => {
  const r = await pool.query('UPDATE categoria SET nome=$1 WHERE id_categoria=$2 RETURNING *', [texto(req.body?.nome, 'Nome', 60), inteiro(req.params.id, 'Categoria')]);
  if (!r.rowCount) falha(404, 'Categoria não encontrada.');
  res.json(r.rows[0]);
}));
router.delete('/categorias/:id', rota(async (req, res) => {
  const id = inteiro(req.params.id, 'Categoria');
  await transacao(async c => {
    if ((await c.query('SELECT 1 FROM pergunta WHERE id_categoria=$1 LIMIT 1', [id])).rowCount) falha(409, 'Transfira ou exclua as perguntas desta categoria antes de excluí-la.');
    if (!(await c.query('DELETE FROM categoria WHERE id_categoria=$1', [id])).rowCount) falha(404, 'Categoria não encontrada.');
  });
  res.json({ ok: true });
}));

router.get('/usuarios', rota(async (req, res) => {
  res.json((await pool.query(`SELECT j.id_jogador,j.nome,COUNT(DISTINCT q.id_quiz)::int AS tentativas,
    COALESCE(SUM(p.pontos),0)::int AS pontos,c.login,c.administrador FROM jogador j LEFT JOIN quiz q USING(id_jogador)
    LEFT JOIN pontuacao p USING(id_quiz) LEFT JOIN conta c ON c.id_jogador=j.id_jogador
    GROUP BY j.id_jogador,j.nome,c.login,c.administrador ORDER BY j.nome,j.id_jogador`)).rows);
}));
router.post('/usuarios', rota(async (req, res) => res.status(201).json(await auth.cadastrar(req.body))));
router.put('/usuarios/:id', rota(async (req, res) => {
  const id = inteiro(req.params.id, 'Jogador');
  const nome = texto(req.body?.nome, 'Nome', 80);
  const atual = (await pool.query('SELECT login FROM conta WHERE id_jogador=$1', [id])).rows[0];
  if (!atual && req.body?.login) {
    await auth.cadastrar(req.body, id);
  } else if (atual && req.body?.login && auth.loginValido(req.body.login) !== atual.login) {
    falha(400, 'O nome de usuário de uma conta existente não pode ser alterado aqui.');
  }
  const senhaHash = atual && req.body?.senha ? await auth.hashSenha(req.body.senha) : null;
  await transacao(async c => {
    if (!(await c.query('UPDATE jogador SET nome=$1 WHERE id_jogador=$2', [nome, id])).rowCount) falha(404, 'Jogador não encontrado.');
    if (senhaHash) {
      await c.query('UPDATE conta SET senha_hash=$1 WHERE id_jogador=$2', [senhaHash, id]);
      await c.query('DELETE FROM sessao_login WHERE id_conta=(SELECT id_conta FROM conta WHERE id_jogador=$1)', [id]);
    }
  });
  res.json({ ok: true });
}));
router.delete('/usuarios/:id', rota(async (req, res) => {
  const id = inteiro(req.params.id, 'Jogador');
  if (id === req.usuario.id_jogador) falha(409, 'Você não pode excluir sua própria conta enquanto está usando a administração.');
  await transacao(async c => {
    if ((await c.query('SELECT 1 FROM quiz WHERE id_jogador=$1 LIMIT 1', [id])).rowCount) falha(409, 'Este jogador possui tentativas registradas e deve ser preservado no histórico.');
    if (!(await c.query('DELETE FROM jogador WHERE id_jogador=$1', [id])).rowCount) falha(404, 'Jogador não encontrado.');
  });
  res.json({ ok: true });
}));

module.exports = router;
