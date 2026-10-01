# 🎮 Quiz dos Guri

## 🔐 Sobre o projeto

O **Quiz dos Guri** é um banco de questões de múltipla escolha sobre **Cibersegurança**, desenvolvido para estudantes do ensino médio e da área de tecnologia.

O sistema armazena questões, alternativas, respostas corretas, categorias, níveis de dificuldade e referências bibliográficas. Também permite sortear e corrigir questões por meio de consultas SQL, além de registrar pontuações e gerar rankings.

## 🎯 Escopo do projeto

### ✅ O que o sistema faz

- Armazena questões, alternativas e gabaritos.
- Registra referências bibliográficas, incluindo editora e URL.
- Sorteia questões para a realização dos quizzes.
- Corrige respostas por meio de consultas SQL.
- Cadastra os nomes dos participantes.
- Armazena pontuações e organiza rankings.
- Permite consultar questões por categoria, dificuldade e palavras-chave.

### ❌ O que o sistema não faz

- Não armazena o conteúdo integral de livros, apenas seus dados bibliográficos e links de referência.
- Não gera questões automaticamente. Todas as questões devem ser elaboradas e cadastradas manualmente.
- Não possui interface gráfica própria. O banco de dados é utilizado por uma aplicação externa.

## 👥 Público-alvo

- Estudantes do ensino médio.
- Estudantes e profissionais da área de tecnologia.
- Pessoas interessadas em aprender e testar seus conhecimentos em cibersegurança.

## 📋 Regras de negócio

### 1. Requisitos de dados (RD)

| Código | Descrição |
|---|---|
| RD01 | Toda questão deve possuir um código único, título, enunciado e explicação, sendo todos obrigatórios. |
| RD02 | Toda questão deve pertencer a exatamente uma categoria. |
| RD03 | Toda questão deve possuir exatamente um nível de dificuldade. |
| RD04 | Toda questão deve possuir alternativas identificadas por letras, cada uma com seu respectivo texto. |
| RD05 | Exatamente uma alternativa de cada questão deve ser correta. |
| RD06 | Cada questão deve possuir uma única referência bibliográfica. |
| RD07 | Uma referência bibliográfica pode ser utilizada por várias questões, mas sua URL deve ser única. |
| RD08 | Cada questão pode possuir zero ou mais palavras-chave. |
| RD09 | Uma mesma palavra-chave pode ser utilizada em várias questões e deve ser cadastrada uma única vez. |

### 2. Requisitos funcionais (RF)

| Código | Descrição |
|---|---|
| RF01 | O sistema deve permitir cadastrar questões. |
| RF02 | O sistema deve permitir consultar questões por categoria. |
| RF03 | O sistema deve permitir filtrar questões por nível de dificuldade. |
| RF04 | O sistema deve sortear questões para os quizzes. |
| RF05 | O sistema deve permitir consultar as alternativas e os gabaritos. |
| RF06 | O sistema deve permitir pesquisar questões por palavras-chave. |
| RF07 | O sistema deve permitir alterar e excluir questões. |

### 3. Requisitos não funcionais (RNF)

| Código | Descrição |
|---|---|
| RNF01 | O banco de dados deve utilizar PostgreSQL. |
| RNF02 | O banco de dados deve garantir a integridade dos dados. |
| RNF03 | O banco de dados deve evitar registros duplicados nas informações que exigem unicidade. |

## 🛠️ Tecnologias utilizadas

- **PostgreSQL** — Sistema de gerenciamento de banco de dados relacional.
- **SQL** — Linguagem utilizada para criação, consulta e manipulação dos dados.

## 📚 Estrutura do projeto

O banco de dados é organizado para armazenar e relacionar as seguintes informações:

- **Questões:** enunciados, títulos e explicações.
- **Alternativas:** opções de resposta e identificação do gabarito.
- **Categorias:** classificação dos assuntos abordados.
- **Dificuldades:** níveis de complexidade das questões.
- **Referências bibliográficas:** fontes utilizadas na elaboração das questões.
- **Palavras-chave:** termos que facilitam a pesquisa.
- **Participantes:** identificação dos jogadores.
- **Pontuações:** resultados obtidos nos quizzes.
- **Ranking:** classificação dos participantes conforme suas pontuações.

## 🚀 Objetivo

O objetivo do **Quiz dos Guri** é oferecer uma estrutura de banco de dados organizada e confiável para apoiar o aprendizado de cibersegurança, permitindo a criação de quizzes, a avaliação de conhecimentos e o acompanhamento do desempenho dos participantes.

---

**Projeto acadêmico — Quiz dos Guri**  
*Aprender cibersegurança também pode ser um desafio!* 🔐
