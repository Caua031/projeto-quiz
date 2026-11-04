# Tech Trivia

Quiz de afirmações sobre Tecnologia da Informação, com foco em **cibersegurança**. O jogador lê uma frase, decide se ela está **certa** ou **errada** e, em seguida, aprende o porquê: cada pergunta vem com uma explicação e com a fonte em que ela se baseia.

O objetivo é ajudar estudantes a entender conceitos de segurança digital de forma interativa, com pontuação, ranking e um painel de administração para manter o conteúdo.

## Funcionalidades

### Para o jogador

- **Conta própria:** cadastro e login com nome de usuário e senha, e escolha de avatar
- **Categorias e dificuldades:** o jogador escolhe o tema e o nível antes de começar, e pode buscar categorias pelo nome
- **Rodadas de perguntas:** as perguntas são sorteadas, com barra de progresso e pontuação em tempo real
- **Aprendizado depois de cada resposta:** explicação da questão e fonte bibliográfica
- **Ranking:** soma dos pontos de todas as partidas concluídas, com pódio e lista de jogadores
- **Pontuação justa:** os pontos são calculados pelo servidor, a partir das respostas, e não pelo navegador

### Para o administrador

- **Perguntas:** cadastro, edição, busca e exclusão, com de duas a quatro alternativas (exatamente uma correta), fonte e palavras-chave
- **Categorias:** criação, renomeação e exclusão
- **Usuários:** cadastro, renomeação, redefinição de senha e exclusão de jogadores
- **Configurações da rodada:** quantas perguntas tem cada rodada e quantos pontos vale cada acerto
- **Proteção do histórico:** categorias com perguntas, jogadores com partidas e perguntas já usadas em partidas não podem ser excluídos

### Acessibilidade

- **Aba lateral de acessibilidade** em todas as telas, com um interruptor para **desligar as animações de fundo** (ícones, partículas e troféus flutuantes), pensada para quem sente tontura ou desconforto com movimento
- A escolha fica salva no navegador
- Se o dispositivo já pede "reduzir movimento", as animações começam desligadas
- Painel navegável por teclado e compatível com leitores de tela

## Telas

| Tela | O que faz |
|---|---|
| Cadastro e login | Entrada na conta e criação de novos jogadores |
| Categorias | Busca, escolha de tema e de dificuldade |
| Quiz | Perguntas, respostas, explicação e pontuação |
| Ranking | Pódio e classificação geral |
| Administração | Gerenciamento de perguntas, categorias, usuários e configurações |

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Front-end | HTML, CSS e JavaScript puro, com animações em Canvas |
| Back-end | Node.js e Express 5 |
| Banco de dados | PostgreSQL (Supabase), com o driver `pg` |
| Hospedagem | Render, com o servidor entregando o front-end e a API |
| Fontes | Kyiv Type Titling e Leckerli One |

## Arquitetura

```
PROJETO/    Front-end (telas, estilos, scripts) e documentação do banco
Servidor/   API Express (rotas, autenticação, migrações)
```

O front-end conversa com o servidor por uma API REST em `/api`. O servidor aplica as regras de negócio e é o único a falar com o banco de dados.

## Banco de dados

O banco foi modelado do zero, com 15 tabelas: perguntas, categorias, dificuldades, alternativas, fontes, publicadores, idiomas, palavras-chave, jogadores, contas, sessões de login, tentativas e respostas. As regras de negócio (uma categoria e uma dificuldade por pergunta, exatamente uma alternativa correta, URL de fonte única, entre outras) são garantidas pelo próprio esquema.

A documentação completa fica em `PROJETO/doc_date`: contexto e requisitos, modelo conceitual, modelo lógico, DDL, consultas e testes.

## Segurança

- Senhas guardadas com hash `scrypt` e salt aleatório, nunca em texto legível
- Sessão por cookie `HttpOnly`, válida por 7 dias e revogada ao sair
- Limite de tentativas de cadastro e login
- Mensagens que não revelam se um nome de usuário existe
- Cadastro público nunca cria administradores, e o privilégio só é concedido por quem tem acesso ao servidor
- Todas as rotas de administração exigem uma conta administradora
- A API só aceita requisições da própria origem ou de origens autorizadas

## Qualidade

O servidor tem scripts de teste para as rotas de administração e de perguntas, que rodam contra um banco real.

Site: [projeto-quiz-kiu4.onrender.com/](https://projeto-quiz-kiu4.onrender.com/)
