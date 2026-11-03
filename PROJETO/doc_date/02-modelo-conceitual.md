
Marco M1. A entrega deste passo é o modelo conceitual: o desenho em `entregas/02-conceitual.pdf` (ou `.png`) e as tabelas abaixo.

É um DER na notação de Chen, no brModelo ou no Visual Paradigm Online. Entidades, atributos, relacionamentos e cardinalidades. Ainda não aparecem tabela, chave estrangeira nem tipo de coluna: isso é o modelo lógico, no passo 5.

## Entidades

| Entidade | Atributos | Identificador |
| --- | --- | --- |
| CATEGORIA | código, nome | código |
| PERGUNTA | código, título, enunciado, explicação | código |
| ALTERNATIVA | id, letra, texto, correta (sim/não) | id |
| FONTE | URL, título | URL |
| PUBLICADOR | id, nome | id |
| IDIOMA | código, descrição | código |
| JOGADOR | id, nome | id |
| QUIZ | identificador | identificador |
| PONTUAÇÃO | id, pontos | id |
| DIFICULDADE | código, descrição (fácil, médio ou difícil) | código |
| PALAVRA-CHAVE | id, termo (único) | id |
| CONTA | id, login (único), senha (guardada só como resumo irreversível), avatar, administrador (sim/não) | id |
| SESSÃO | token (guardado só como resumo), expiração | token |


## Relacionamentos

Uma frase por linha, ligada a um requisito. Cardinalidade dos dois lados, mínimo e máximo.

| Relacionamento | Cardinalidade | Justificativa | Requisito |
| --- | --- | --- | --- |
| CATEGORIA — possui — PERGUNTA | CATEGORIA (0,N); PERGUNTA (1,1) | Uma categoria pode agrupar várias ou nenhuma perguntas; cada pergunta pertence a exatamente uma categoria. | RD02 |
| PERGUNTA — possui — ALTERNATIVA | PERGUNTA (2,N); ALTERNATIVA (1,1) | Uma pergunta possui alternativas; cada alternativa pertence a uma única pergunta. O mínimo de 2 alternativas é compatível com as opções Certo/Errado e permite mais opções futuramente. | RD04 e RD05 |
| PERGUNTA — utiliza — FONTE | PERGUNTA (1,1); FONTE (0,N) | Cada pergunta possui uma única referência; uma fonte pode ser usada por várias perguntas. | RD06 e RD07 |
| PUBLICADOR — publica — FONTE | PUBLICADOR (0,N); FONTE (1,1) | Um publicador pode publicar várias fontes; cada fonte está associada a um publicador. | --- |
| IDIOMA — identifica — FONTE | IDIOMA (0,N); FONTE (1,1) | Um idioma pode estar associado a várias ou nenhuma fonte; cada fonte possui um idioma registrado. | --- |
| JOGADOR — registra — PONTUAÇÃO | JOGADOR (0,N); PONTUAÇÃO (1,1) | Um jogador pode acumular várias pontuações; cada registro de pontuação pertence a um jogador. No modelo lógico essa ligação é obtida por QUIZ, sem repetir o jogador na pontuação. | RD10 |
| QUIZ — contém — PERGUNTA | QUIZ (1,N); PERGUNTA (0,N) | O sistema deve permitir organizar quizzes com uma ou mais perguntas, possibilitando que uma mesma pergunta seja utilizada em diferentes quizzes. | RF08 |
| QUIZ — gera — PONTUAÇÃO | QUIZ (0,N); PONTUAÇÃO (1,1) | Um quiz pode gerar várias pontuações; cada pontuação está associada a uma realização de quiz. | --- |
| DIFICULDADE — contém — PERGUNTA | DIFICULDADE (0,N); PERGUNTA (1,1) | Um nível pode classificar várias perguntas, enquanto cada pergunta pertence a exatamente um nível. | RD03 |
| PERGUNTA — possui — PALAVRA-CHAVE | PERGUNTA (0,N); PALAVRA-CHAVE (0,N) | Uma pergunta pode possuir nenhuma ou várias palavras-chave, e uma palavra-chave pode estar associada a nenhuma ou várias perguntas. | RD08 e RD09 |
| JOGADOR — realiza — QUIZ | JOGADOR (0,N); QUIZ (1,1) | Um jogador pode realizar várias tentativas (quizzes) ou nenhuma; cada tentativa é realizada por exatamente um jogador, o da sessão autenticada. | RF09, RF16 e RD24 |
| JOGADOR — possui — CONTA | JOGADOR (0,1); CONTA (1,1) | Um jogador possui no máximo uma conta (perfis antigos podem não ter); cada conta pertence a exatamente um jogador. O cadastro público cria os dois juntos, e perfis antigos podem receber conta pela administração. | RD12, RD20 e RD21 |
| CONTA — mantém — SESSÃO | CONTA (0,N); SESSÃO (1,1) | Uma conta pode manter várias sessões de login ao mesmo tempo ou nenhuma; cada sessão pertence a exatamente uma conta; ao entrar, a sessão anterior do navegador é encerrada. | RD15 e RD22 |

O diagrama e esta tabela descrevem o mesmo modelo. Toda entidade do desenho está na tabela.

MER ->


DER ->

