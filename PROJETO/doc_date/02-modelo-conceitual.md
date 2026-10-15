# Passo 4 — Modelo conceitual

Marco M1. A entrega deste passo é o modelo conceitual: o desenho em `entregas/02-conceitual.pdf` (ou `.png`) e as tabelas abaixo.

É um DER na notação de Chen, no brModelo ou no Visual Paradigm Online. Entidades, atributos, relacionamentos e cardinalidades. Ainda não aparecem tabela, chave estrangeira nem tipo de coluna: isso é o modelo lógico, no passo 5.

## Entidades

| Entidade | Atributos | Identificador |
| CATEGORIA | código, nome | código |
| PERGUNTA | código, título, enunciado, explicação | código |
| ALTERNATIVA | letra, texto, correta (sim/não) | letra, identificada no contexto de uma pergunta |
| FONTE | URL, título | URL |
| PUBLICADOR | identificador, nome | identificador |
| IDIOMA | código, descrição | código |
| JOGADOR | identificador, nome | identificador |
| QUIZ | identificador | identificador |
| PONTUAÇÃO | identificador, pontos | identificador |
| | | |

## Relacionamentos

Uma frase por linha, ligada a um requisito. Cardinalidade dos dois lados, mínimo e máximo.

| Relacionamento | Cardinalidade | Justificativa | Requisito |
| CATEGORIA — possui — PERGUNTA | CATEGORIA (0,N); PERGUNTA (1,1) | Uma categoria pode agrupar nenhuma ou várias perguntas; cada pergunta pertence a exatamente uma categoria. | --- |
| PERGUNTA — possui — ALTERNATIVA | PERGUNTA (1,N); ALTERNATIVA (1,1) | Uma pergunta possui alternativas; cada alternativa pertence a uma única pergunta. O mínimo de duas alternativas é compatível com as opções Certo/Errado e permite mais opções futuramente. | --- |
| PERGUNTA — utiliza — FONTE | PERGUNTA (1,1); FONTE (0,N) | Cada pergunta possui uma única referência; uma fonte pode ser usada por várias perguntas | --- |
| PUBLICADOR — publica — FONTE | PUBLICADOR (0,N); FONTE (1,1) | Um publicador pode publicar várias fontes; cada fonte está associada a um publicador. | --- |
| IDIOMA — identifica — FONTE | IDIOMA (0,N); FONTE (1,1) | Um idioma pode estar associado a várias fontes; cada fonte possui um idioma registrado. | --- |
| PERGUNTA — possui — PALAVRA-CHAVE | PERGUNTA (0,N); PALAVRA-CHAVE (0,N) | Uma pergunta pode não ter palavras-chave ou ter várias; uma palavra-chave pode estar associada a várias perguntas e é cadastrada uma única vez. | --- |
| JOGADOR — registra — PONTUAÇÃO | JOGADOR (0,N); PONTUAÇÃO (1,1) | Um jogador pode acumular várias pontuações; cada registro de pontuação pertence a um jogador. | --- |
| QUIZ — contém — PERGUNTA | QUIZ (1,N); PERGUNTA (0,N) | Um quiz apresenta uma ou várias perguntas; uma pergunta pode participar de vários quizzes. | --- |
| QUIZ — gera — PONTUAÇÃO | QUIZ (0,N); PONTUAÇÃO (1,1) | Um quiz pode gerar várias pontuações; cada pontuação está associada a uma realização de quiz. | --- |

| | | | RD__ |

O diagrama e esta tabela descrevem o mesmo modelo. Toda entidade do desenho está na tabela.
<img width="2200" height="1700" alt="DER" src="https://github.com/user-attachments/assets/a5bdfa8d-0115-4c94-b780-4936a3787e28" />

