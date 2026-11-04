const router = require('express').Router();
const pool = require('../db');
const auth = require('../autenticacao');
const { rota, falha } = require('../operacoes');

router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
router.post('/cadastro', auth.limitar, rota(async (req, res) => {
  const usuario = await auth.cadastrar(req.body);
  await auth.entrar(req, res, usuario);
  res.status(201).json(usuario);
}));
router.post('/login', auth.limitar, rota(async (req, res) => {
  const login = typeof req.body?.login === 'string' ? req.body.login.trim().normalize('NFC').toLowerCase() : '';
  const senha = req.body?.senha;
  if (typeof senha !== 'string' || senha.length > 128 || !senha || login.length > 80) falha(401, 'Nome de usuário ou senha incorretos.');
  const conta = (await pool.query(`SELECT c.*,j.nome FROM conta c JOIN jogador j USING(id_jogador) WHERE c.login=$1`, [login])).rows[0];
  const confere = await auth.verificarSenha(senha, conta?.senha_hash);
  if (!conta || !confere) falha(401, 'Nome de usuário ou senha incorretos.');
  await auth.entrar(req, res, conta);
  const { senha_hash, ...usuario } = conta;
  res.json(usuario);
}));
router.get('/eu', auth.exigirLogin, (req, res) => res.json(req.usuario));
router.post('/sair', rota(async (req, res) => {
  await auth.encerrar(req, res);
  res.json({ ok: true });
}));

module.exports = router;
