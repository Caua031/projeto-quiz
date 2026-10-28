const pool = require('./db');

function falha(status, mensagem) {
  const erro = new Error(mensagem);
  erro.status = status;
  throw erro;
}

function texto(valor, nome, limite = 10000) {
  if (typeof valor !== 'string' || !valor.trim() || valor.trim().length > limite) {
    falha(400, `${nome} deve ter entre 1 e ${limite} caracteres.`);
  }
  return valor.trim();
}

function inteiro(valor, nome) {
  if (!/^\d+$/.test(String(valor)) || !Number.isSafeInteger(Number(valor)) || Number(valor) < 1) {
    falha(400, `${nome} deve ser um número inteiro positivo.`);
  }
  return Number(valor);
}

// Serializa as gravações da aplicação, inclusive nos bancos de desenvolvimento
// que usam IDs manuais em vez de colunas identity/serial.
async function transacao(acao) {
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');
    await cliente.query('SELECT pg_advisory_xact_lock(738201)');
    const resultado = await acao(cliente);
    await cliente.query('COMMIT');
    return resultado;
  } catch (erro) {
    await cliente.query('ROLLBACK');
    throw erro;
  } finally {
    cliente.release();
  }
}

// Apenas nomes internos constantes são passados a esta função.
async function proximoId(cliente, tabela, coluna) {
  const sequencia = (await cliente.query('SELECT pg_get_serial_sequence($1,$2) AS nome', [tabela, coluna])).rows[0].nome;
  if (sequencia) {
    const { rows } = await cliente.query(`SELECT setval($1::regclass,
      GREATEST(nextval($1::regclass), (SELECT COALESCE(MAX(${coluna}), 0) + 1 FROM ${tabela})))::int AS id`, [sequencia]);
    return rows[0].id;
  }
  const { rows } = await cliente.query(`SELECT COALESCE(MAX(${coluna}), 0) + 1 AS id FROM ${tabela}`);
  return rows[0].id;
}

function rota(acao) {
  return async (req, res) => {
    try { await acao(req, res); }
    catch (erro) {
      if (erro.status) return res.status(erro.status).json({ erro: erro.message });
      if (erro.code === '23505') return res.status(409).json({ erro: 'Este registro já existe.' });
      if (erro.code === '23503') return res.status(409).json({ erro: 'O registro está em uso ou uma referência não existe. Atualize a página e confira os vínculos.' });
      if (['22001', '23514', '23502'].includes(erro.code)) return res.status(400).json({ erro: 'Os dados não atendem às restrições do banco. Confira os campos.' });
      console.error(`${req.method} ${req.originalUrl}:`, erro.message);
      res.status(500).json({ erro: 'Não foi possível concluir a operação no banco.' });
    }
  };
}

module.exports = { falha, texto, inteiro, transacao, proximoId, rota };
