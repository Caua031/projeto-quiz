# Passos 1 a 3 — Contexto, minimundo e requisitos

**Marco:** M1  

---

## 1. Introdução e contexto

O **Tech Trivia** é um quiz de afirmações com o tema de Tecnologia da Informação. O jogador lê uma frase sobre determinado assunto e marca se ela é **Certo** ou **Errado**, recebendo em seguida uma explicação apoiada em uma fonte publicada.

O objetivo deste banco de dados é armazenar perguntas, categorias, alternativas, explicações e fontes de forma consistente, além de atender às consultas que a aplicação web precisa realizar para exibir o quiz, sortear perguntas e verificar respostas.

### 1.1 Escopo

A tabela a seguir apresenta as responsabilidades do banco de dados e o que está fora do seu escopo.

| O banco faz | O banco não faz |
|---|---|
| Armazena perguntas, categorias, alternativas e explicações. | Cria questões automaticamente. |
| Armazena fontes, publicadores e idiomas. | Oferece uma interface gráfica. |
| Garante que os dados relacionados estejam consistentes e evita duplicações indevidas. | Armazena o conteúdo completo de livros e artigos. |
| Armazena nome de usuário, pontuação e ranking. | Realiza, por si só, o ensino ou a explicação dos conteúdos. |
| Permite pesquisas por palavras-chave. | |
| Permite sortear questões e consultar gabaritos. | |

### 1.2 Usuários

Os usuários do sistema e suas respectivas atividades são:

| Usuário | O que faz |
|---|---|
| Jogador | Lê as perguntas, escolhe uma alternativa (Certo ou Errado) e consulta a explicação e a fonte. |
| Responsável pelo cadastro de perguntas | Cadastra, altera e exclui questões, alternativas, categorias, níveis de dificuldade, referências e palavras-chave. |

> **Observação:** uma tabela de usuários com dados de autenticação só será necessária se os requisitos incluírem cadastro, senha ou sessão. Os dados de nome e pontuação usados no ranking devem ser definidos conforme as regras do projeto.

---

## 2. Minimundo

Somos um grupo e queremos desenvolver um sistema de quiz sobre cibersegurança para ajudar estudantes a aprender sobre segurança digital. O sistema apresentará afirmações relacionadas a temas como Segurança de Redes, Phishing, Malware e Proteção de Dados. O jogador deverá indicar se cada afirmação está certa ou errada e, após responder, poderá consultar uma explicação e a fonte utilizada.

Cada questão possui um código único, um título, um enunciado e uma explicação sobre a resposta correta. Ela pertence a uma categoria e possui um nível de dificuldade — fácil, médio ou difícil. Cada questão também possui alternativas, sendo exatamente uma delas a correta, e está associada a uma referência bibliográfica. Uma referência pode ser utilizada por várias questões, mas sua URL deve ser única. As questões podem ter palavras-chave para facilitar as pesquisas. O sistema também armazena informações de jogadores e suas pontuações para montar o ranking. Embora inicialmente o quiz utilize as opções Certo e Errado, a estrutura deve permitir que uma questão tenha mais de duas alternativas no futuro.

---

## 3. Requisitos e regras de negócio

Esta seção reúne as regras de negócio, os requisitos funcionais e os requisitos não funcionais do sistema.

### 3.1 Regras de negócio

| Código | Texto do requisito | Tipo |
|---|---|---|
| RD01 | Toda questão possui um código único, título, enunciado e explicação, todos obrigatórios. | Regra de negócio |
| RD02 | Toda questão pertence a exatamente uma categoria. | Regra de negócio |
| RD03 | Toda questão possui exatamente um nível de dificuldade. | Regra de negócio |
| RD04 | Toda questão possui alternativas identificadas por letras, cada uma com seu texto. | Regra de negócio |
| RD05 | Exatamente uma alternativa de cada questão é a correta. | Regra de negócio |
| RD06 | Cada questão possui uma única referência bibliográfica. | Regra de negócio |
| RD07 | Uma referência pode ser utilizada por várias questões e sua URL não pode se repetir. | Regra de negócio |
| RD08 | Cada questão pode possuir zero ou mais palavras-chave. | Regra de negócio |
| RD09 | Uma mesma palavra-chave pode ser utilizada em várias questões e deve ser cadastrada uma única vez. | Regra de negócio |
| RD10 | Cada jogador possui um nome de identificação e pode acumular pontuações. | Regra de negócio |
| RD11 | O ranking deve ser organizado com base nas pontuações registradas dos jogadores. | Regra de negócio |

### 3.2 Requisitos funcionais

| Código | Texto do requisito | Tipo |
|---|---|---|
| RF01 | O sistema deve permitir cadastrar questões. | Funcional |
| RF02 | O sistema deve permitir consultar questões por categoria. | Funcional |
| RF03 | O sistema deve permitir filtrar questões por nível de dificuldade. | Funcional |
| RF04 | O sistema deve sortear questões para os quizzes. | Funcional |
| RF05 | O sistema deve permitir consultar as alternativas e os gabaritos. | Funcional |
| RF06 | O sistema deve permitir pesquisar questões por palavras-chave. | Funcional |
| RF07 | O sistema deve permitir alterar e excluir questões. | Funcional |

### 3.3 Requisitos não funcionais

| Código | Texto do requisito | Tipo |
|---|---|---|
| RNF01 | O banco de dados deve utilizar PostgreSQL. | Não funcional |
| RNF02 | O banco de dados deve garantir a integridade dos dados. | Não funcional |
| RNF03 | O banco de dados deve evitar registros duplicados nas informações que exigem unicidade. | Não funcional |

### 3.4 Classificação dos requisitos

- **Funcional:** descreve uma ação ou serviço que o sistema deve oferecer.
- **Não funcional:** define uma característica, restrição ou condição de qualidade do sistema, como o SGBD utilizado e a integridade dos dados.
- **Regra de negócio:** estabelece uma condição ou regra que os dados e as operações do sistema devem respeitar.

---
