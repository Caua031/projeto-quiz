const fs = require('node:fs/promises');
const path = require('node:path');
const pool = require('./db');
const { transacao } = require('./operacoes');

async function migrar() {
  const sql = await fs.readFile(path.join(__dirname, 'migracoes/001-login.sql'), 'utf8');
  await transacao(c => c.query(sql));
}

if (require.main === module) {
  migrar().then(() => console.log('Estrutura de login pronta. Jogadores e pontuações preservados.'))
    .catch(e => { console.error('Não foi possível preparar o login:', e.message); process.exitCode = 1; })
    .finally(() => pool.end());
}
module.exports = migrar;
