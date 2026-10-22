const express = require('express');
const pool = require('./db');

const app = express();
const PORTA = 3000;

app.use(express.json());

app.get('/api/saude', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/saude-banco', async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT current_database() AS banco,
              (SELECT count(*)::int FROM dificuldade) AS dificuldades`
    );
    res.json(resultado.rows[0]);
  } catch (erro) {
    console.error('Erro na consulta:', erro.message);
    res.status(500).json({ erro: 'Não foi possível consultar o banco.' });
  }
});




app.use('/api/categorias', require('./rotas/categorias')); //configuração da rota de categorias

app.use('/api/perguntas', require('./rotas/perguntas')); //configuração da rota de perguntas

app.use('/api/publicadores', require('./rotas/publicadores')); //configuração da rota de publicadores

app.use('/api/fontes', require('./rotas/fontes'));

// Rota inexistente dentro de /api: responde JSON (e não a página HTML padrão)
app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// Tratamento de erros: JSON inválido no corpo e falhas inesperadas
app.use((erro, req, res, next) => {
  if (erro.type === 'entity.parse.failed' || (erro instanceof SyntaxError && erro.status === 400)) {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição.' });
  }
  console.error('Erro inesperado:', erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});


app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
