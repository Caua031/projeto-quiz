// O privilégio administrativo só pode ser concedido por quem tem acesso ao servidor.
// Uso: node contas.js promover nome_de_usuario
const pool = require('./db');
const { loginValido } = require('./autenticacao');

async function main() {
  if (process.argv[2] !== 'promover' || !process.argv[3]) throw new Error('Uso: node contas.js promover nome_de_usuario');
  const login = loginValido(process.argv[3]);
  await require('./migrar')();
  const r = await pool.query('UPDATE conta SET administrador=TRUE WHERE login=$1 RETURNING login', [login]);
  if (!r.rowCount) throw new Error('Conta não encontrada. Crie sua conta pelo site antes de promovê-la.');
  console.log(`A conta ${r.rows[0].login} agora pode acessar a administração.`);
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => pool.end());
