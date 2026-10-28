const { randomBytes, createHash, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const pool = require('./db');
const { falha, texto, inteiro, transacao, proximoId } = require('./operacoes');
const derivar = promisify(scrypt);
const COOKIE = 'tech_trivia_login';
const DURACAO = 7 * 24 * 60 * 60 * 1000;
const OPCOES = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
const DUMMY = `scrypt$${'00'.repeat(16)}$${'00'.repeat(64)}`;
let trabalhando = 0;

function loginValido(valor) {
  const login = texto(valor, 'Nome de usuário', 40).normalize('NFC').toLowerCase();
  if (!/^[\p{L}\p{N}_.-]{3,40}$/u.test(login)) falha(400, 'O nome de usuário deve ter de 3 a 40 letras, números, pontos, traços ou sublinhados.');
  return login;
}
function senhaValida(senha) {
  if (typeof senha !== 'string' || senha.length < 8 || senha.length > 128) falha(400, 'A senha deve ter entre 8 e 128 caracteres.');
  return senha;
}
async function calcular(senha, salt) {
  if (trabalhando >= 2) falha(429, 'Muitas solicitações de acesso. Aguarde alguns segundos e tente novamente.');
  trabalhando++;
  try { return await derivar(senha, salt, 64, OPCOES); }
  finally { trabalhando--; }
}
async function hashSenha(senha) {
  senhaValida(senha);
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${(await calcular(senha, salt)).toString('hex')}`;
}
async function verificarSenha(senha, registro) {
  const [metodo, salt, hash] = (registro || DUMMY).split('$');
  if (metodo !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(hash)) return false;
  const calculado = await calcular(senha, salt);
  return timingSafeEqual(calculado, Buffer.from(hash, 'hex'));
}
function fotoValida(foto) {
  if (!foto) return '/imagens/perfil.png';
  if (!/^\/imagens\/(?:0[1-4]\.jpg|perfil\.png)$/.test(foto)) falha(400, 'Escolha um dos avatares disponíveis.');
  return foto;
}

async function cadastrar(dados = {}, idJogador = null) {
  const login = loginValido(dados.login);
  const nome = texto(dados.nome || dados.login, 'Nome', 80);
  const foto = fotoValida(dados.foto);
  const senhaHash = await hashSenha(dados.senha);
  return transacao(async c => {
    const existente = await c.query('SELECT 1 FROM conta WHERE login=$1', [login]);
    if (existente.rowCount) falha(409, 'Este nome de usuário já está em uso. Escolha outro.');
    if (idJogador !== null) {
      idJogador = inteiro(idJogador, 'Jogador');
      if (!(await c.query('SELECT 1 FROM jogador WHERE id_jogador=$1', [idJogador])).rowCount) falha(404, 'Jogador não encontrado.');
      if ((await c.query('SELECT 1 FROM conta WHERE id_jogador=$1', [idJogador])).rowCount) falha(409, 'Este jogador já possui uma conta.');
    } else {
      idJogador = await proximoId(c, 'jogador', 'id_jogador');
      await c.query('INSERT INTO jogador(id_jogador,nome) OVERRIDING SYSTEM VALUE VALUES($1,$2)', [idJogador, nome]);
    }
    await c.query('INSERT INTO conta(id_jogador,login,senha_hash,foto) VALUES($1,$2,$3,$4)', [idJogador, login, senhaHash, foto]);
    return (await c.query(`SELECT c.id_conta,c.id_jogador,c.login,c.foto,c.administrador,j.nome
      FROM conta c JOIN jogador j USING(id_jogador) WHERE c.login=$1`, [login])).rows[0];
  });
}

const digest = token => createHash('sha256').update(token).digest('hex');
function lerToken(req) {
  const valor = (req.headers.cookie || '').split(';').map(p => p.trim()).find(p => p.startsWith(COOKIE + '='));
  const token = valor?.slice(COOKIE.length + 1);
  return /^[a-f0-9]{64}$/.test(token || '') ? token : null;
}
function opcoesCookie(req) { return { httpOnly: true, sameSite: 'lax', secure: req.secure || process.env.COOKIE_SECURE === 'true', path: '/' }; }
async function encerrar(req, res) {
  const token = lerToken(req);
  if (token) await pool.query('DELETE FROM sessao_login WHERE token_hash=$1', [digest(token)]);
  res.clearCookie(COOKIE, opcoesCookie(req));
}
async function entrar(req, res, conta) {
  const token = randomBytes(32).toString('hex');
  await transacao(async c => {
    const anterior = lerToken(req);
    if (anterior) await c.query('DELETE FROM sessao_login WHERE token_hash=$1', [digest(anterior)]);
    await c.query('DELETE FROM sessao_login WHERE expira_em <= NOW()');
    await c.query('INSERT INTO sessao_login(token_hash,id_conta,expira_em) VALUES($1,$2,$3)', [digest(token), conta.id_conta, new Date(Date.now() + DURACAO)]);
  });
  res.cookie(COOKIE, token, { ...opcoesCookie(req), maxAge: DURACAO });
}
async function identificarUsuario(req, res, next) {
  try {
    const token = lerToken(req);
    req.usuario = null;
    if (token) res.set('Cache-Control', 'no-store');
    if (token) req.usuario = (await pool.query(`SELECT c.id_conta,c.id_jogador,c.login,c.foto,c.administrador,j.nome
      FROM sessao_login s JOIN conta c USING(id_conta) JOIN jogador j USING(id_jogador)
      WHERE s.token_hash=$1 AND s.expira_em > NOW()`, [digest(token)])).rows[0] || null;
    next();
  } catch (erro) { next(erro); }
}
function exigirLogin(req, res, next) {
  if (!req.usuario) return res.status(401).json({ erro: 'Entre com seu nome e senha para continuar.' });
  next();
}
function exigirAdmin(req, res, next) {
  if (!req.usuario) return res.status(401).json({ erro: 'Entre com sua conta de administrador.' });
  if (!req.usuario.administrador) return res.status(403).json({ erro: 'Esta área é exclusiva de administradores.' });
  next();
}

// Limite por endereço, incluindo tentativas bem-sucedidas e cadastro.
const tentativas = new Map();
function limitar(req, res, next) {
  const agora = Date.now();
  for (const [chave, registro] of tentativas) if (registro.ate <= agora) tentativas.delete(chave);
  const chave = req.ip;
  const registro = tentativas.get(chave) || { quantidade: 0, ate: agora + 15 * 60 * 1000 };
  if (registro.quantidade >= 30) {
    res.set('Retry-After', String(Math.ceil((registro.ate - agora) / 1000)));
    return res.status(429).json({ erro: 'Muitas tentativas de acesso. Aguarde 15 minutos e tente novamente.' });
  }
  registro.quantidade++; tentativas.set(chave, registro); next();
}

module.exports = { cadastrar, hashSenha, verificarSenha, loginValido, senhaValida, entrar, encerrar, identificarUsuario, exigirLogin, exigirAdmin, limitar };
