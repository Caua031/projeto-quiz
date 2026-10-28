// Empacota somente as telas e seus recursos. Banco, servidor e documentos
// não fazem parte dos arquivos públicos desta publicação estática.
const fs = require('node:fs');
const path = require('node:path');
const raiz = __dirname;
const saida = path.resolve(raiz, 'public');
const marcador = path.join(saida, '.quiz-static-output');

if (path.dirname(saida) !== path.resolve(raiz) || path.basename(saida) !== 'public') {
  throw new Error('Diretório de saída inválido.');
}
if (fs.existsSync(saida)) {
  if (!fs.existsSync(marcador)) throw new Error('A pasta public já existe e não foi criada por este script. Preserve seus arquivos antes de continuar.');
  fs.rmSync(saida, { recursive: true, force: true });
}
fs.mkdirSync(saida);
fs.writeFileSync(marcador, 'Saída gerada por build-vercel.cjs\n');

const arquivos = ['index.html', 'style.css', 'script.js', 'api.js', 'conta.css', 'background.js', 'fundoicones.js'];
const pastas = ['cadastro', 'categorias', 'administracao', 'raking', 'imagens'];
for (const nome of [...arquivos, ...pastas]) {
  const origem = path.join(raiz, nome);
  if (fs.existsSync(origem)) fs.cpSync(origem, path.join(saida, nome), {
    recursive: true,
    filter: arquivo => !path.basename(arquivo).startsWith('.') && path.basename(arquivo) !== 'node_modules',
  });
}
if (!fs.existsSync(path.join(saida, 'cadastro/cadastro.html'))) throw new Error('Página de cadastro ausente.');
console.log('Site preparado em public. Entrada: /cadastro/cadastro.html');
