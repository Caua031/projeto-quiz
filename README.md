# Tech Trivia

Quiz de afirmações sobre Tecnologia da Informação, com foco em cibersegurança. O jogador lê uma frase, indica se ela está **certa** ou **errada** e recebe uma explicação baseada em uma fonte publicada. As pontuações alimentam um ranking.

O projeto tem três partes: o **front-end** (HTML, CSS e JavaScript puro), o **servidor** (Node.js + Express) e o **banco de dados** (PostgreSQL, hospedado no Supabase).

## Funcionalidades

**Jogador**
- Cadastro e login com nome de usuário único e senha (hash `scrypt` com salt; a senha nunca é guardada em texto legível)
- Escolha de avatar
- Rodadas com perguntas sorteadas por categoria e dificuldade
- Explicação e fonte bibliográfica após cada resposta
- Ranking com a soma dos pontos das partidas concluídas

**Administrador**
- Cadastro, edição, busca e exclusão de perguntas e categorias
- Gerenciamento de contas de jogadores (cadastro, renomear, redefinir senha)
- Configuração da rodada: perguntas por rodada e pontos por acerto

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | HTML, CSS, JavaScript |
| Back-end | Node.js, Express 5 |
| Banco de dados | PostgreSQL (Supabase), driver `pg` |
| Hospedagem | Render |

## Estrutura do repositório

```
.
├── PROJETO/                 # Front-end e documentação
│   ├── index.html
│   ├── api.js               # Ponte entre o front-end e a API
│   ├── cadastro/            # Login e cadastro
│   ├── categorias/          # Escolha de categoria e jogo
│   ├── raking/              # Ranking
│   ├── administracao/       # Painel administrativo
│   ├── imagens/
│   └── doc_date/            # Documentação do banco (modelo, DDL, consultas)
└── Servidor/                # API Express
    ├── servidor.js
    ├── db.js                # Conexão com o PostgreSQL
    ├── autenticacao.js      # Contas, sessões e cookies
    ├── migrar.js            # Migração aditiva (tabelas de login)
    ├── contas.js            # Promover contas a administrador
    ├── rotas/               # Rotas da API
    └── migracoes/
```

## Como rodar localmente

### Pré-requisitos

- Node.js 18 ou superior
- Um banco PostgreSQL com o esquema do projeto (veja [Banco de dados](#banco-de-dados))

### Passos

1. Clone o repositório e instale as dependências:

   ```bash
   git clone <url-do-repositorio>
   cd Servidor
   npm install
   ```

2. Crie o arquivo `Servidor/.env` com os dados do banco:

   ```env
   DB_HOST=seu-host
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=seu-usuario
   DB_PASSWORD=sua-senha
   ```

3. Inicie o servidor:

   ```bash
   npm start
   ```

4. Abra o site pelo endereço do servidor: <http://localhost:3000>

> O servidor serve o front-end da pasta `PROJETO` e a API na mesma origem. Abra o site por `http://localhost:3000`, e não pelo Live Server ou direto pelo arquivo, senão o login será bloqueado.

Páginas principais:

- Login e cadastro: `/cadastro/cadastro.html`
- Administração: `/administracao/adm.html`
- Ranking: `/raking/raking.html`

### Scripts

Dentro da pasta `Servidor`:

| Comando | O que faz |
|---|---|
| `npm start` | Inicia o servidor |
| `npm run dev` | Inicia com reinício automático ao salvar |
| `npm run migrar` | Aplica a migração aditiva (tabelas `conta` e `sessao_login`) |
| `npm run carregar-perguntas` | Carrega as perguntas de `PROJETO/doc_date/05-dml-consultas.sql` |
| `npm test` | Testes da administração |
| `npm run test:perguntas` | Testes das perguntas |

## Banco de dados

O esquema completo está em [`PROJETO/doc_date/04-ddl.sql`](PROJETO/doc_date/04-ddl.sql): 15 tabelas, incluindo contas, senhas em hash e sessões de login, além dos idiomas e das dificuldades iniciais.

- **Banco novo:** execute o `04-ddl.sql` e depois carregue as perguntas com `npm run carregar-perguntas`.
- **Banco existente:** use só a migração aditiva (`npm run migrar`), sem reaplicar o DDL completo. O servidor também executa essa migração ao iniciar.

A documentação completa (contexto, modelo conceitual e lógico, consultas e testes) fica em [`PROJETO/doc_date`](PROJETO/doc_date).

## Primeiro acesso como administrador

Contas criadas pelo site nunca são administradoras. Para promover a sua:

1. Crie a conta pela tela de cadastro.
2. Promova-a de uma das formas abaixo.

**Pelo script** (dentro de `Servidor`, com o `.env` apontando para o banco):

```bash
node contas.js promover seu_usuario
```

**Direto no banco** (por exemplo, no SQL Editor do Supabase):

```sql
UPDATE conta SET administrador = TRUE WHERE login = 'seu_usuario';
```

O nome de usuário é gravado em minúsculas. Depois de promover, atualize o site: o link **Administração** aparece na barra da conta.

## Deploy no Render

O servidor também entrega o front-end, então um único Web Service no Render hospeda o site e a API.

| Configuração | Valor |
|---|---|
| Root Directory | `Servidor` |
| Build Command | `npm install` |
| Start Command | `npm start` |

Variáveis de ambiente:

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Sim | Conexão com o PostgreSQL (Supabase) |
| `COOKIE_SECURE` | Recomendada | `true` para o cookie de login sair com a flag `Secure` |
| `FRONT_ORIGIN` | Não | Origens extras permitidas na API, separadas por vírgula. Só é necessária se o front for servido em outro endereço |
| `FRONT_DIR` | Não | Pasta do front-end (padrão `../PROJETO`) |
| `CONFIG_PATH` | Não | Caminho do arquivo de configurações da rodada |

> O arquivo de configurações da rodada (`configuracoes.json`) é gravado no disco do servidor. No Render, o disco é apagado a cada novo deploy, e os valores voltam ao padrão (10 perguntas por rodada, 1000 pontos por acerto), a menos que você use um disco persistente.

## API

Todas as rotas ficam sob `/api`.

| Rota | Descrição |
|---|---|
| `POST /auth/cadastro`, `POST /auth/login`, `POST /auth/sair`, `GET /auth/eu` | Autenticação |
| `GET /categorias` | Lista de categorias |
| `GET /perguntas`, `GET /perguntas/sorteio`, `GET /perguntas/:codigo` | Consulta e sorteio de perguntas |
| `POST /perguntas/:codigo/resposta` | Verifica uma resposta |
| `POST /jogos`, `POST /jogos/:id/finalizar` | Inicia e conclui uma rodada (exige login) |
| `GET /ranking` | Ranking de jogadores |
| `GET /saude`, `GET /saude-banco` | Verificação do servidor e do banco |
| `/admin/*` | Perguntas, categorias, usuários e configurações (exige conta administradora) |

## Segurança

- Senhas com `scrypt` e salt aleatório
- Cookie de sessão `HttpOnly`, `SameSite=Lax`, válido por 7 dias; sair revoga a sessão no servidor
- Limite de tentativas de cadastro e login por endereço
- O cadastro público nunca cria administradores
- A API só aceita requisições da mesma origem ou de origens listadas em `FRONT_ORIGIN`
- Nunca envie o arquivo `.env` ao GitHub: adicione `.env` ao `.gitignore`

## Licença

Projeto acadêmico. Defina a licença antes de abrir o repositório para uso externo.
