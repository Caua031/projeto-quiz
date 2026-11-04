const fs = require('fs/promises');
const path = require('path');
const { falha } = require('./operacoes');
const arquivo = process.env.CONFIG_PATH || path.join(__dirname, 'configuracoes.json');
const padrao = { perguntas_por_rodada: 10, pontos_por_acerto: 1000 };

function validar(dados) {
  for (const [chave, maximo] of [['perguntas_por_rodada', 50], ['pontos_por_acerto', 10000]]) {
    if (!Number.isInteger(dados[chave]) || dados[chave] < 1 || dados[chave] > maximo) {
      falha(400, `${chave === 'perguntas_por_rodada' ? 'Perguntas por rodada' : 'Pontos por acerto'} deve ficar entre 1 e ${maximo}.`);
    }
  }
  return { perguntas_por_rodada: dados.perguntas_por_rodada, pontos_por_acerto: dados.pontos_por_acerto };
}

async function ler() {
  try { return validar(JSON.parse(await fs.readFile(arquivo, 'utf8'))); }
  catch (erro) { if (erro.code === 'ENOENT') return { ...padrao }; throw erro; }
}

// Gravações encadeadas e substituição atômica evitam arquivos parciais.
let pendente = Promise.resolve();
function salvar(dados) {
  const valor = validar(dados);
  const tarefa = pendente.catch(() => {}).then(async () => {
    await fs.writeFile(arquivo + '.tmp', JSON.stringify(valor, null, 2) + '\n', 'utf8');
    await fs.rename(arquivo + '.tmp', arquivo);
    return valor;
  });
  pendente = tarefa;
  return tarefa;
}

module.exports = { ler, salvar };
