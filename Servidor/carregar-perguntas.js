const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('./db');

async function carregar() {
  const sql = await fs.readFile(path.join(__dirname, '../PROJETO/doc_date/05-dml-consultas.sql'), 'utf8');
  const cliente = await pool.connect();
  try {
    const resultados = await cliente.query(sql);
    const carga = (Array.isArray(resultados) ? resultados : [resultados]).find(r => r.rows?.[0]?.perguntas_inseridas_agora !== undefined);
    console.log(`Perguntas inseridas nesta execução: ${carga?.rows[0].perguntas_inseridas_agora ?? 'consulte o resumo abaixo'}.`);
    const { rows } = await cliente.query(`SELECT c.nome AS categoria,
      count(*) FILTER (WHERE d.descricao='Fácil')::int AS faceis,
      count(*) FILTER (WHERE d.descricao='Médio')::int AS medias,
      count(*) FILTER (WHERE d.descricao='Difícil')::int AS dificeis,
      count(*)::int AS total
      FROM pergunta p JOIN categoria c USING(id_categoria) JOIN dificuldade d USING(id_dificuldade)
      WHERE p.codigo ~ '^tt-(es|mw|ph|pd|rw|rd)-[0-9]{3}$'
      GROUP BY c.nome ORDER BY c.nome`);
    console.table(rows);
  } catch (erro) {
    await cliente.query('ROLLBACK');
    throw erro;
  } finally { cliente.release(); }
}

if (require.main === module) carregar().catch(e => { console.error('Não foi possível carregar as perguntas:', e.message); process.exitCode = 1; }).finally(() => pool.end());
module.exports = carregar;
