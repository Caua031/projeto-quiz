# Passos 1 a 3 — Contexto, minimundo e requisitos

Marco M1. Copiem para `entregas/01-contexto.md`.

## 1. Introdução e contexto

Em um parágrafo: 
O Tech Trivia é um quiz de afirmações com o tema de Tecnologia da Informação: o jogador lê uma frase sobre um assunto e marca se ela é Certo ou Errado, recebendo em seguida uma explicação apoiada numa fonte publicada. O objetivo deste banco é armazenar as perguntas, suas categorias, alternativas, explicações e fontes de forma consistente, e responder às consultas que o aplicativo de Web precisa fazer para exibir o quiz, sortear perguntas e checar respostas

Escopo. Listem só o que o banco faz e o que fica de fora.

| O banco faz | 
| Guarda perguntas, categorias, alternativas, explicações, fontes, publicadores e idiomas 
| Garante que categoria, publicador e URL não se repitam por engano dentro de uma pergunta
| Guarda as questões, alternativas e o gabarito do quiz.
| Armazena nome de usuário, pontuação e ranking
| Permitir pesquisas por palavras-chave.
| Sortear questões e consultar os gabaritos.


| O banco não faz |
| Criar questões automaticamente.
| Oferecer uma interface gráfica.
| Armazenar o conteúdo completo de livros e artigos.
| | |

Usuários. Quem usa o sistema e o que cada um faz com os dados. Não criem tabela de usuário se nenhum requisito pedir cadastro, senha ou sessão.

| Usuário || O que faz |
| Jogador | Jogador, Lê a pergunta, escolhe Certo ou Errado, e vê a explicação com a fonte |
| Quem cadastra perguntas | Cadastra, altera e exclui questões, alternativas, categorias, níveis de dificuldade, referências e palavras-chave.|

## 2. Minimundo

Um ou dois parágrafos, na voz de quem encomenda o sistema. É deste texto que saem as entidades e as regras. Cubram pergunta, categoria, fonte, publicador, idioma e alternativas, inclusive a possibilidade de mais de duas alternativas no futuro.

> Somos um grupo e queremos desenvolver um sistema de quiz sobre cibersegurança para ajudar estudantes a aprender sobre segurança digital.

Cada questão possui um código único, um título, um enunciado e uma explicação sobre a resposta correta. Cada questão pertence a uma categoria, Segurança de Redes, Phishing, Malware ou Proteção de Dados, e possui um nível de dificuldade: fácil, médio ou difícil


## 3. Requisitos e regras de negócio

Cada RD01–RD11 e cada RA01–RA07 entra numa linha. Não deixem código de fora.

| Código | Texto do requisito | Tipo |
| RD01 | Toda questão possui um código único, título, enunciado e explicação, todos obrigatórios | regra de negócio |
| RD02 | Toda questão pertence a exatamente uma categoria | regra de negócio |
| RD03 | Toda questão possui exatamente um nível de dificuldade | regra de negócio |
| RD04 | Toda questão possui alternativas identificadas por letras, cada uma com seu texto | regra de negócio |
| RD05 | Exatamente uma alternativa de cada questão é a correta | regra de negócio |
| RD06 | Cada questão possui uma única referência bibliográfica | regra de negócio |
| RD07 | Uma referência pode ser utilizada por várias questões e sua URL não pode se repetir | regra de negócio |
| RD08 | Cada questão pode possuir zero ou mais palavras-chave | regra de negócio |
| RD09 | Uma mesma palavra-chave pode ser utilizada em várias questões e deve ser cadastrada uma única vez | regra de negócio |

| RF01 | O sistema deve permitir cadastrar questões | funcional |
| RF02 | O sistema deve permitir consultar questões por categoria | funcional |
| RF03 | O sistema deve permitir filtrar questões por nível de dificuldade | funcional |
| RF04 | O sistema deve sortear questões para os quizzes | funcional |
| RF05 | O sistema deve permitir consultar as alternativas e os gabaritos | funcional |
| RF06 | O sistema deve permitir pesquisar questões por palavras-chave | funcional |
| RF07 | O sistema deve permitir alterar e excluir questões | funcional |

| RNF01 | O banco de dados deve utilizar PostgreSQL | não funcional |
| RNF02 | O banco deve garantir a integridade dos dados | não funcional |
| RNF03 | O banco deve evitar registros duplicados nas informações que exigem unicidade | não funcional |

| funcional / não funcional / regra de negócio |

Não funcional inclui, no mínimo, o SGBD e a integridade (o que não pode duplicar nem ficar nulo).
