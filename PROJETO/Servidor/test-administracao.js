// Integração HTTP com PostgreSQL: usa esquema temporário e configurações separadas.
// Executar dentro de Servidor: node test-administracao.js
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');
const pool = require('./db');
const schema = `quiz_teste_${process.pid}_${Date.now()}`;
const arquivoConfig = path.join(__dirname, `${schema}.json`);
process.env.CONFIG_PATH = arquivoConfig;
const controle = new Pool({ ...pool.options, password: pool.options.password, connectionTimeoutMillis: 5000 });
pool.options.options = `-c search_path=${schema}`;
let servidor;
let criado = false;
let verificacoes = 0;

async function main() {
  await controle.query(`CREATE SCHEMA ${schema}`);
  criado = true;
  const ddl = await fs.readFile(path.join(__dirname, '../PROJETO/doc_date/04-ddl.sql'), 'utf8');
  await pool.query(ddl);
  const estrutura = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema=current_schema() AND table_type='BASE TABLE'");
  assert.equal(estrutura.rowCount, 15, 'O DDL completo deve criar sozinho as 15 tabelas');
  assert.ok(estrutura.rows.some(t => t.table_name === 'conta'));
  assert.ok(estrutura.rows.some(t => t.table_name === 'sessao_login'));
  await require('./migrar')();
  await require('./migrar')(); // Reiniciar o servidor deve ser seguro.
  await pool.query("INSERT INTO publicador(nome) VALUES('Publicador de teste')");
  servidor = require('./servidor').listen(0, '127.0.0.1');
  await new Promise(resolve => servidor.once('listening', resolve));
  const base = `http://127.0.0.1:${servidor.address().port}/api`;
  for (const caminho of ['/administracao/adm.html', '/administracao/adm.js', '/cadastro/cadastro.html', '/raking/raking.html', '/raking/raking.js', '/script.js']) {
    assert.equal((await fetch(base.replace(/\/api$/, '') + caminho)).status, 200, caminho);
    verificacoes++;
  }
  let cookie = '';
  let ultimoCookie = '';
  async function request(url, method = 'GET', dados, status = 200, credencial = cookie) {
    const r = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json', ...(credencial ? { Cookie: credencial } : {}) }, ...(dados === undefined ? {} : { body: JSON.stringify(dados) }) });
    ultimoCookie = r.headers.get('set-cookie') || '';
    const corpo = await r.json();
    assert.equal(r.status, status, `${method} ${url}: ${JSON.stringify(corpo)}`);
    verificacoes++;
    return corpo;
  }

  await request('/auth/eu', 'GET', undefined, 401);
  await request('/admin/configuracoes', 'GET', undefined, 401);
  await request('/jogos', 'POST', {}, 401);
  const admin = await request('/auth/cadastro', 'POST', { login: 'rootadmin', senha: 'Senha de teste 123!' }, 201);
  assert.match(ultimoCookie, /HttpOnly/i);
  assert.match(ultimoCookie, /SameSite=Lax/i);
  cookie = ultimoCookie.split(';')[0];
  assert.equal(admin.administrador, false);
  assert.equal('senha_hash' in admin, false);
  await request('/admin/configuracoes', 'GET', undefined, 403);
  await pool.query('UPDATE conta SET administrador=TRUE WHERE id_jogador=$1', [admin.id_jogador]);
  assert.equal((await request('/auth/eu')).administrador, true);
  const cruzada = await fetch(base + '/auth/sair', { method: 'POST', headers: { Cookie: cookie, Origin: 'https://outro-site.example' } });
  assert.equal(cruzada.status, 403); verificacoes++;

  await request('/admin/configuracoes');
  await request('/admin/configuracoes', 'PUT', { perguntas_por_rodada: 2, pontos_por_acerto: 250 });
  await request('/admin/configuracoes', 'PUT', { perguntas_por_rodada: 0, pontos_por_acerto: 250 }, 400);
  assert.equal((await request('/configuracoes')).pontos_por_acerto, 250);
  const categoria = await request('/admin/categorias', 'POST', { nome: 'Segurança' }, 201);
  await request('/admin/categorias', 'POST', { nome: ' ' }, 400);
  await request('/admin/categorias', 'POST', { nome: 'Segurança' }, 409);
  await request(`/admin/categorias/${categoria.id_categoria}`, 'PUT', { nome: 'Redes' });
  const concorrentes = await Promise.all([1, 2, 3, 4].map(i => request('/admin/categorias', 'POST', { nome: `Categoria ${i}` }, 201)));
  assert.equal(new Set(concorrentes.map(c => c.id_categoria)).size, 4);
  await request(`/admin/categorias/${concorrentes[0].id_categoria}`, 'DELETE');
  const pergunta = { codigo: 'teste-001', titulo: 'Teste', enunciado: 'Uma afirmação.', explicacao: 'Uma explicação.',
    id_categoria: categoria.id_categoria, id_dificuldade: 1, fonte_url: 'https://example.com/teste', fonte_titulo: 'Referência',
    id_publicador: 1, id_idioma: 1, palavras: 'redes, segurança, redes',
    alternativas: [{ texto: 'Certo', correta: true }, { texto: 'Errado', correta: false }] };
  await request('/admin/perguntas', 'POST', { ...pergunta, alternativas: pergunta.alternativas.map(a => ({ ...a, correta: true })) }, 400);
  await request('/admin/perguntas', 'POST', { ...pergunta, codigo: 'x'.repeat(21) }, 400);
  await request('/admin/perguntas', 'POST', { ...pergunta, id_categoria: 9999 }, 409);
  assert.equal((await pool.query('SELECT * FROM fonte')).rowCount, 0, 'Fonte não deve permanecer após rollback');
  await request('/admin/perguntas', 'POST', pergunta, 201);
  await request('/admin/perguntas', 'POST', pergunta, 409);
  let perguntas = await request('/admin/perguntas');
  assert.equal(perguntas[0].alternativas.length, 2);
  assert.equal((await pool.query('SELECT * FROM pergunta_palavra_chave')).rowCount, 2);
  await request('/admin/perguntas/teste-001', 'PUT', { ...pergunta, titulo: 'Título editado', palavras: 'redes' });
  assert.equal((await request('/admin/perguntas'))[0].titulo, 'Título editado');
  assert.equal((await pool.query('SELECT * FROM pergunta_palavra_chave')).rowCount, 1);
  await request('/admin/perguntas', 'POST', { ...pergunta, codigo: 'teste-002' }, 201);
  await request(`/admin/categorias/${categoria.id_categoria}`, 'DELETE', undefined, 409);
  const publicas = await request('/perguntas/teste-001');
  assert.equal('correta' in publicas.alternativas[0], false, 'API pública não deve revelar gabarito antes da resposta');
  assert.equal((await request('/perguntas/teste-001/resposta', 'POST', { letra: 'A' })).acertou, true);
  await request('/publicadores/mais-citados');
  await request('/fontes/repetidas');
  assert.equal((await request('/admin/referencias')).fontes.length, 1);

  await request('/jogadores', 'POST', { nome: 'Sem senha' }, 410);
  const jogador = await request('/auth/cadastro', 'POST', { nome: 'Jogador 1', login: 'jogador1', senha: 'Minha senha 123!', administrador: true, foto: '/imagens/01.jpg' }, 201, '');
  const cookieJogador = ultimoCookie.split(';')[0];
  assert.equal(jogador.administrador, false, 'Cadastro público não concede privilégios');
  const hash = (await pool.query('SELECT senha_hash FROM conta WHERE id_jogador=$1', [jogador.id_jogador])).rows[0].senha_hash;
  assert.match(hash, /^scrypt\$/); assert.ok(!hash.includes('Minha senha 123!'));
  await request('/admin/usuarios', 'GET', undefined, 403, cookieJogador);
  await request('/auth/cadastro', 'POST', { login: 'JOGADOR1', senha: 'Outra senha 123!' }, 409, '');
  await request('/auth/cadastro', 'POST', { login: 'senha-curta', senha: '123' }, 400, '');
  await request('/auth/login', 'POST', { login: 'jogador1', senha: 'senha incorreta' }, 401, '');
  await request('/auth/login', 'POST', { login: 'inexistente', senha: 'senha incorreta' }, 401, '');
  const removivel = await request('/admin/usuarios', 'POST', { nome: 'Jogador 2', login: 'jogador2', senha: 'Outra senha 123!' }, 201);
  await request('/auth/login', 'POST', { login: 'JOGADOR2', senha: 'Outra senha 123!' }, 200, '');
  const cookieOutro = ultimoCookie.split(';')[0];
  await request(`/admin/usuarios/${removivel.id_jogador}`, 'PUT', { nome: 'Renomeado' });
  const jogo = await request('/jogos', 'POST', { id_jogador: removivel.id_jogador, categoria: categoria.id_categoria }, 201, cookieJogador);
  assert.equal((await pool.query('SELECT id_jogador FROM quiz WHERE id_quiz=$1', [jogo.id_quiz])).rows[0].id_jogador, jogador.id_jogador, 'ID enviado pelo navegador não escolhe o dono da partida');
  assert.equal(jogo.codigos.length, 2);
  await request(`/jogos/${jogo.id_quiz}/finalizar`, 'POST', { respostas: jogo.codigos.map(codigo => ({ codigo, letra: 'A' })) }, 404, cookieOutro);
  await request(`/jogos/${jogo.id_quiz}/finalizar`, 'POST', { respostas: [{ codigo: jogo.codigos[0], letra: 'A' }] }, 400, cookieJogador);
  await request(`/jogos/${jogo.id_quiz}/finalizar`, 'POST', { respostas: jogo.codigos.map(codigo => ({ codigo, letra: 'Z' })) }, 400, cookieJogador);
  const respostas = jogo.codigos.map((codigo, i) => ({ codigo, letra: i ? 'B' : 'A' }));
  const [resultado, repetido] = await Promise.all([1, 2].map(() => request(`/jogos/${jogo.id_quiz}/finalizar`, 'POST', { respostas, pontos: 999999 }, 200, cookieJogador)));
  assert.equal(resultado.pontos, 250);
  assert.equal(repetido.pontos, 250);
  assert.equal((await pool.query('SELECT * FROM pontuacao')).rowCount, 1, 'Reenvio não duplica pontos');
  const jogo2 = await request('/jogos', 'POST', {}, 201, cookieJogador);
  await request(`/jogos/${jogo2.id_quiz}/finalizar`, 'POST', { respostas: jogo2.codigos.map(codigo => ({ codigo, letra: 'A' })) }, 200, cookieJogador);
  const ranking = await request('/ranking');
  assert.equal(ranking[0].pontos, 750);
  assert.equal(ranking[0].partidas, 2);
  await request(`/admin/usuarios/${jogador.id_jogador}`, 'DELETE', undefined, 409);
  assert.equal((await request('/admin/usuarios')).find(j => j.id_jogador === jogador.id_jogador).pontos, 750);
  await request('/auth/sair', 'POST', undefined, 200, cookieJogador);
  await request('/auth/eu', 'GET', undefined, 401, cookieJogador);
  await request('/auth/login', 'POST', { login: 'jogador1', senha: 'Minha senha 123!' }, 200, '');
  const novoCookie = ultimoCookie.split(';')[0];
  assert.equal((await request('/auth/eu', 'GET', undefined, 200, novoCookie)).id_jogador, jogador.id_jogador);
  await request(`/admin/usuarios/${jogador.id_jogador}`, 'PUT', { nome: 'Jogador 1', senha: 'Nova senha 456!' });
  await request('/auth/eu', 'GET', undefined, 401, novoCookie);
  await request('/auth/login', 'POST', { login: 'jogador1', senha: 'Minha senha 123!' }, 401, '');
  await request('/auth/login', 'POST', { login: 'jogador1', senha: 'Nova senha 456!' }, 200, '');
  await pool.query('UPDATE sessao_login SET expira_em=NOW()-interval \'1 minute\' WHERE id_conta=(SELECT id_conta FROM conta WHERE id_jogador=$1)', [jogador.id_jogador]);
  await request('/auth/eu', 'GET', undefined, 401, ultimoCookie.split(';')[0]);
  await request(`/admin/usuarios/${removivel.id_jogador}`, 'DELETE');
  await request('/auth/eu', 'GET', undefined, 401, cookieOutro);
  const antigo = (await pool.query("INSERT INTO jogador(nome) VALUES('Perfil antigo') RETURNING id_jogador")).rows[0];
  await request(`/admin/usuarios/${antigo.id_jogador}`, 'PUT', { nome: 'Perfil antigo', login: 'antigo', senha: 'Senha perfil antigo!' });
  assert.equal((await request('/auth/login', 'POST', { login: 'antigo', senha: 'Senha perfil antigo!' }, 200, '')).id_jogador, antigo.id_jogador);
  await request('/admin/perguntas/teste-001', 'DELETE', undefined, 409);
  await request('/admin/perguntas', 'POST', { ...pergunta, codigo: 'descartar' }, 201);
  await request('/admin/perguntas/descartar', 'DELETE');
  await request('/admin/perguntas/inexistente', 'DELETE', undefined, 404);
  let bloqueou = false;
  for (let i = 0; i < 31; i++) {
    const tentativa = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    verificacoes++;
    assert.ok([401, 429].includes(tentativa.status));
    if (tentativa.status === 429) {
      assert.ok(Number(tentativa.headers.get('Retry-After')) > 0);
      bloqueou = true; break;
    }
  }
  assert.equal(bloqueou, true, 'Tentativas repetidas devem ser limitadas');
  console.log(`OK: ${verificacoes} requisições HTTP, login, senhas, permissões, logout, contas antigas, CRUD, ranking e configurações.`);
}

main().catch(erro => { console.error(erro); process.exitCode = 1; }).finally(async () => {
  if (servidor) await new Promise(resolve => servidor.close(resolve));
  await pool.end();
  if (criado && /^quiz_teste_\d+_\d+$/.test(schema)) await controle.query(`DROP SCHEMA ${schema} CASCADE`);
  await controle.end();
  await fs.unlink(arquivoConfig).catch(e => { if (e.code !== 'ENOENT') throw e; });
});
