const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { Pool } = require('pg');
const pool = require('./db');
const controle = new Pool({ ...pool.options, password: pool.options.password, connectionTimeoutMillis: 5000 });
const schema = `quiz_carga_teste_${process.pid}_${Date.now()}`;
pool.options.options = `-c search_path=${schema}`;
let criado = false;

async function main() {
  await controle.query(`CREATE SCHEMA ${schema}`); criado = true;
  await pool.query(await fs.readFile(path.join(__dirname, '../PROJETO/doc_date/04-ddl.sql'), 'utf8'));
  // IDs diferentes dos usuais provam que a carga encontra as referências pelos nomes.
  await pool.query(`DELETE FROM dificuldade;
    DELETE FROM idioma;
    INSERT INTO dificuldade(id_dificuldade,descricao) OVERRIDING SYSTEM VALUE VALUES(11,'Fácil'),(12,'Médio'),(13,'Difícil');
    INSERT INTO idioma(id_idioma,descricao) OVERRIDING SYSTEM VALUE VALUES(21,'Português'),(22,'Inglês');
    INSERT INTO categoria(id_categoria,nome) OVERRIDING SYSTEM VALUE VALUES(42,'phishing');
    INSERT INTO publicador(id_publicador,nome) OVERRIDING SYSTEM VALUE VALUES(55,'CERT.br');
    INSERT INTO fonte(url,titulo,id_publicador,id_idioma) VALUES('https://example.com/anterior','Fonte anterior',55,21);
    INSERT INTO pergunta(codigo,titulo,enunciado,explicacao,id_categoria,id_dificuldade,fonte_url)
      VALUES('fact-001','Pergunta anterior','Afirmação anterior','Explicação anterior',42,11,'https://example.com/anterior');
    INSERT INTO alternativa(pergunta_codigo,letra,texto,correta) VALUES('fact-001','A','Certo',TRUE),('fact-001','B','Errado',FALSE);
    INSERT INTO jogador(nome) VALUES('Perfil preservado');
    INSERT INTO quiz(id_jogador) SELECT id_jogador FROM jogador WHERE nome='Perfil preservado';
    INSERT INTO quiz_pergunta(id_quiz,pergunta_codigo) SELECT id_quiz,'fact-001' FROM quiz;
    INSERT INTO pontuacao(pontos,id_quiz) SELECT 777,id_quiz FROM quiz;`);
  const sql = await fs.readFile(path.join(__dirname, '../PROJETO/doc_date/05-dml-consultas.sql'), 'utf8');
  const reserva = "p.codigo ~ '^tt-(es|mw|ph|pd|rw|rd)-[0-9]{3}$'";
  const inseridas = resultados => resultados.find(r => r.rows?.[0]?.perguntas_inseridas_agora !== undefined).rows[0].perguntas_inseridas_agora;
  const original = await fs.readFile(path.join(__dirname, 'fixtures/carga-60.sql'), 'utf8');
  assert.equal(inseridas(await pool.query(original)), 60);
  await pool.query("UPDATE pergunta SET titulo='Edição manual preservada' WHERE codigo='tt-es-001'");
  await pool.query("UPDATE fonte SET titulo='Referência editada' WHERE url='https://cartilha.cert.br/ransomware/'");
  const anteriores = async () => (await pool.query(`SELECT p.*,
    (SELECT jsonb_agg(to_jsonb(a) ORDER BY a.letra) FROM alternativa a WHERE a.pergunta_codigo=p.codigo) AS alternativas,
    (SELECT jsonb_agg(to_jsonb(pk) ORDER BY pk.id_palavra_chave) FROM pergunta_palavra_chave pk WHERE pk.pergunta_codigo=p.codigo) AS palavras
    FROM pergunta p WHERE ${reserva} AND right(p.codigo,3)::int<=10 ORDER BY p.codigo`)).rows;
  const antesDas120 = await anteriores();
  assert.equal(antesDas120.length, 60);
  assert.equal(inseridas(await pool.query(sql)), 120, 'A ampliação deve acrescentar somente 120 perguntas');
  assert.deepEqual(await anteriores(), antesDas120, 'As 60 originais e seus gabaritos, palavras e dificuldades devem ser preservados');
  const grupos = (await pool.query(`SELECT c.nome,d.descricao,count(*)::int AS total
    FROM pergunta p JOIN categoria c USING(id_categoria) JOIN dificuldade d USING(id_dificuldade)
    WHERE ${reserva} GROUP BY c.nome,d.descricao`)).rows;
  assert.equal(grupos.length, 18);
  for (const g of grupos) assert.equal(g.total, 10, `${g.nome}/${g.descricao}`);
  assert.equal((await pool.query('SELECT * FROM pergunta')).rowCount, 181);
  assert.equal((await pool.query('SELECT * FROM alternativa')).rowCount, 362);
  assert.equal((await pool.query(`SELECT lower(enunciado) FROM pergunta p WHERE ${reserva} GROUP BY lower(enunciado) HAVING count(*)>1`)).rowCount, 0);
  const invalidas = await pool.query(`SELECT p.codigo FROM pergunta p LEFT JOIN alternativa a ON a.pergunta_codigo=p.codigo
    WHERE ${reserva} GROUP BY p.codigo HAVING count(a.letra)<>2 OR count(*) FILTER(WHERE a.correta)<>1`);
  assert.equal(invalidas.rowCount, 0, 'Cada pergunta precisa de duas alternativas e uma correta');
  assert.equal((await pool.query(`SELECT p.codigo FROM pergunta p LEFT JOIN pergunta_palavra_chave pk ON pk.pergunta_codigo=p.codigo
    WHERE ${reserva} GROUP BY p.codigo HAVING count(pk.id_palavra_chave)<2`)).rowCount, 0);
  assert.equal((await pool.query(`SELECT p.codigo FROM pergunta p JOIN categoria c USING(id_categoria)
    WHERE ${reserva} AND c.nome='phishing' AND p.id_categoria<>42`)).rowCount, 0);
  const tabelaFonte = (await pool.query('SELECT url FROM fonte')).rows;
  assert.equal(tabelaFonte.length, 39); // 38 referências e a fonte anterior.
  assert.ok(tabelaFonte.every(f => f.url.startsWith('https://')));
  const contar = async () => (await pool.query(`SELECT (SELECT count(*) FROM pergunta) AS perguntas,
    (SELECT count(*) FROM alternativa) AS alternativas,(SELECT count(*) FROM categoria) AS categorias,
    (SELECT count(*) FROM fonte) AS fontes,(SELECT count(*) FROM palavra_chave) AS palavras,
    (SELECT count(*) FROM pergunta_palavra_chave) AS vinculos`)).rows[0];
  const antes = await contar();
  assert.equal(inseridas(await pool.query(sql)), 0);
  assert.deepEqual(await contar(), antes, 'Executar novamente não pode duplicar registros');
  assert.equal((await pool.query("SELECT titulo FROM pergunta WHERE codigo='tt-es-001'")).rows[0].titulo, 'Edição manual preservada');
  assert.equal((await pool.query("SELECT titulo FROM fonte WHERE url='https://cartilha.cert.br/ransomware/'")).rows[0].titulo, 'Referência editada');
  assert.equal((await pool.query("SELECT titulo FROM pergunta WHERE codigo='fact-001'")).rows[0].titulo, 'Pergunta anterior');
  assert.equal((await pool.query('SELECT pontos FROM pontuacao')).rows[0].pontos, 777);
  assert.equal((await pool.query('SELECT * FROM jogador')).rowCount, 1);
  assert.equal((await pool.query('SELECT * FROM quiz')).rowCount, 1);
  assert.equal((await pool.query('SELECT * FROM quiz_pergunta')).rowCount, 1);
  assert.equal((await pool.query('SELECT * FROM conta')).rowCount, 0);
  assert.equal((await pool.query('SELECT * FROM sessao_login')).rowCount, 0);
  // Também confirma a carga completa, sem depender da carga antiga, em banco vazio.
  const novo = schema + '_novo';
  await controle.query(`CREATE SCHEMA ${novo}`);
  const cliente = await pool.connect();
  try {
    await cliente.query(`SET search_path TO ${novo}`);
    await cliente.query(await fs.readFile(path.join(__dirname, '../PROJETO/doc_date/04-ddl.sql'), 'utf8'));
    assert.equal(inseridas(await cliente.query(sql)), 180);
    const combinacoes = (await cliente.query(`SELECT id_categoria,id_dificuldade,count(*)::int AS total
      FROM pergunta GROUP BY id_categoria,id_dificuldade`)).rows;
    assert.equal(combinacoes.length, 18);
    assert.ok(combinacoes.every(c => c.total === 10));
    assert.equal((await cliente.query('SELECT * FROM alternativa')).rowCount, 360);
  } finally {
    await cliente.query('ROLLBACK');
    await cliente.query(`SET search_path TO ${schema}`);
    cliente.release();
    if (/^quiz_carga_teste_\d+_\d+_novo$/.test(novo)) await controle.query(`DROP SCHEMA ${novo} CASCADE`);
  }
  console.log('OK: 180 perguntas, 360 alternativas, 10 por categoria/dificuldade; carga do zero, atualização de 60 para 180, gabaritos, fontes, IDs variáveis e repetição sem duplicação.');
}

main().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => {
  await pool.end();
  if (criado && /^quiz_carga_teste_\d+_\d+$/.test(schema)) await controle.query(`DROP SCHEMA ${schema} CASCADE`);
  await controle.end();
});
