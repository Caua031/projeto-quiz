# Passos 1 a 3 — Contexto, minimundo e requisitos

**Marco:** M1  

---

## 1. Introdução e contexto

O Tech Trivia é um quiz de afirmações sobre Tecnologia da Informação. O jogador lê uma frase sobre determinado assunto e indica se ela está certa ou errada, recebendo em seguida uma explicação fundamentada em uma fonte publicada. O banco de dados deve permitir o cadastro flexível de alternativas, possibilitando a inclusão de mais opções de resposta futuramente.

O objetivo deste banco de dados é armazenar perguntas, categorias, alternativas, explicações e fontes de forma consistente, além de atender às consultas que a aplicação web precisa realizar para exibir o quiz, sortear perguntas e verificar respostas.

### 1.1 Escopo

A tabela a seguir apresenta as responsabilidades do banco de dados e o que está fora do seu escopo.

| O banco faz | O banco não faz |
|---|---|
| Armazena perguntas, categorias, alternativas e explicações. | Cria questões automaticamente. |
| Armazena fontes, publicadores e idiomas. | Oferece uma interface gráfica. |
| Garante que os dados relacionados estejam consistentes e evita duplicações indevidas. | Armazena o conteúdo completo de livros e artigos. |
| Armazena nome de usuário, pontuação e ranking. | Realiza, por si só, o ensino ou a explicação dos conteúdos. |
| Permite pesquisas por palavras-chave. | Envia notificações aos jogadores. |
| Permite sortear questões e consultar gabaritos. | Corrige ou produz automaticamente o conteúdo das fontes. |

### 1.2 Usuários

Os usuários do sistema e suas respectivas atividades são:

| Usuário | O que faz |
|---|---|
| Jogador | Lê as perguntas, escolhe uma alternativa (Certo ou Errado) e consulta a explicação e a fonte. |
| Responsável pelo cadastro de perguntas | Cadastra, altera e exclui questões, alternativas, categorias, níveis de dificuldade, referências e palavras-chave. |

> **Observação:** uma tabela de usuários com dados de autenticação só será necessária se os requisitos incluírem cadastro, senha ou sessão. Os dados de nome e pontuação usados no ranking devem ser definidos conforme as regras do projeto.

---

## 2. Minimundo

O Tech Trivia é um sistema de quiz voltado à aprendizagem de cibersegurança e à exploração de conhecimentos e curiosidades da área de Tecnologia da Informação. Seu objetivo é auxiliar os estudantes na compreensão de conceitos relacionados à segurança digital, estimulando o aprendizado de maneira interativa. As questões são apresentadas em formato de afirmações, que o jogador deve avaliar como certas ou erradas. Cada questão possui alternativas identificadas por letras e acompanhadas de seus respectivos textos. O modelo deve permitir a inclusão de mais de duas alternativas futuramente, mantendo a regra de que exatamente uma alternativa seja a correta.  . Cada questão possui um código único, título, enunciado e explicação, todos obrigatórios, além de estar vinculada a uma categoria e a um nível de dificuldade. As alternativas são identificadas por letras e possuem um texto próprio, sendo que exatamente uma delas deve ser a correta. Após responder, o jogador pode consultar a explicação da questão e a respectiva fonte bibliográfica, permitindo compreender o conteúdo apresentado e conhecer a referência utilizada para fundamentar a resposta.
Cada questão está associada a uma única referência bibliográfica, identificada por uma URL que não pode se repetir no cadastro de fontes, embora uma mesma referência possa ser utilizada em diferentes questões. As fontes possuem informações sobre título, publicador e idioma, permitindo organizar e identificar os materiais consultados. Para facilitar a localização dos conteúdos, as questões podem possuir palavras-chave, que são cadastradas uma única vez e podem ser compartilhadas entre várias questões. O sistema também permite organizar quizzes compostos por uma ou mais perguntas, possibilitando que uma mesma questão seja utilizada em diferentes quizzes. Cada jogador é identificado por um nome e pode realizar diferentes tentativas, acumulando pontuações que serão utilizadas para compor o ranking. Ao finalizar uma tentativa, sua pontuação fica registrada para consulta e classificação. Além disso, o responsável pelo cadastro pode registrar, consultar, alterar e excluir questões e suas informações relacionadas, como alternativas, categorias, níveis de dificuldade, referências bibliográficas e palavras-chave. Dessa forma, o banco de dados mantém as informações organizadas e consistentes, possibilitando o sorteio de questões, a consulta por categoria e dificuldade, a pesquisa por palavras-chave e a verificação das respostas e pontuações.

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
| RF08 | O sistema deve permitir organizar quizzes com uma ou mais questões, possibilitando a reutilização de questões em diferentes quizzes.| Funcional |
| RF09 | O sistema deve permitir registrar as tentativas realizadas pelos jogadores e suas respectivas pontuações | Funcional |
| RF10 | O sistema deve permitir consultar o ranking dos jogadores com base nas pontuações registradas. | Funcional |

### 3.3 Requisitos não funcionais

| Código | Texto do requisito | Tipo |
|---|---|---|
| RNF01 | O banco de dados deve utilizar PostgreSQL. | Não funcional |
| RNF02 | O banco de dados deve garantir a integridade dos dados, impedindo valores nulos nos campos obrigatórios e referências a registros inexistentes. | Não funcional |
| RNF03 | O banco de dados deve impedir duplicidades nos códigos de questões, nas URLs das referências bibliográficas e nos registros únicos de palavras-chave. | Não funcional |

### 3.4 Classificação dos requisitos

- **Funcional:** descreve uma ação ou serviço que o sistema deve oferecer.
- **Não funcional:** define uma característica, restrição ou condição de qualidade do sistema, como o SGBD utilizado e a integridade dos dados.
- **Regra de negócio:** estabelece uma condição ou regra que os dados e as operações do sistema devem respeitar.

---
