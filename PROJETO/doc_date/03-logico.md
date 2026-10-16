# Passos 5 e 6 — Modelo lógico, normalização e dicionário

Marco M2

O desenho parte do modelo conceitual e mostra tabelas, colunas, chave primária e chaves estrangeiras. Não é outro DER. Pode ser feito no brModelo (modelo lógico) ou no Visual Paradigm Online. Se a normalização achar violação, corrijam o desenho e o texto.

## 5. Modelo lógico

| Relacionamento no DER | Cardinalidade | Vira | Onde fica a FK ou a tabela associativa |
| --- | --- | --- | --- |
| CATEGORIA possui PERGUNTA | 1:N | FK no lado N | `PERGUNTA.categoria_codigo` referencia `CATEGORIA.cod`. |
| DIFICULDADE contém PERGUNTA | 1:N | FK no lado N | `PERGUNTA.dificuldade_codigo` referencia `dificuldade.cod`. |
| PERGUNTA possui ALTERNATIVA | 2:N | FK no lado 4 | `ALTERNATIVA.pergunta_codigo` referencia `PERGUNTA.codigo`. |
| PERGUNTA utiliza FONTE | N;1 | FK no lado N | `PERGUNTA.fonte_url` referencia `fonte.url`; cada pergunta possui uma referência e uma fonte pode ser usada por várias perguntas. |
| PUBLICADOR publica FONTE | 1:N | FK no lado N | `FONTE.publicador_id` referencia `PUBLICADOR.id`. |
| IDIOMA identifica FONTE | 1:N | FK no lado N | `FONTE.idioma_codigo` referencia `IDIOMA.cod`. |
| PERGUNTA possui PALAVRA-CHAVE | N:N | tabela associativa | `PERGUNTA` contém `palavra-chave.id`|
| JOGADOR registra PONTUAÇÃO | 1:N | relacionamento derivado para evitar redundância | A pontuação do jogador é obtida por `PONTUACAO.quiz_id` → `QUIZ.id` e `QUIZ.jogador_id` → `JOGADOR.id`; não se repete `jogador_id`. |
| QUIZ contém PERGUNTA | N:N | tabela associativa | `QUIZ_PERGUNTA` contém `quiz_id` e `pergunta_cod` como FKs e chave primária composta, permitindo reutilizar perguntas em quizzes diferentes. |
| QUIZ gera PONTUAÇÃO | 1:N | FK no lado N | `PONTUACAO.quiz_identificador` referencia `QUIZ.identificador`; não é `UNIQUE`, pois o modelo conceitual admite várias pontuações por quiz. |
| JOGADOR realiza QUIZ | 1:N | FK no lado N | `QUIZ.jogador_id` referencia `JOGADOR.id`. |


### Normalização

Dependências no formato `determinante → dependente`, com o requisito que sustenta.

| ID | Dependência | Requisito |
| --- | --- | --- |
| DF1 | `PERGUNTA.codigo → titulo, enunciado, explicacao, categoria_codigo, dificuldade_codigo, fonte_url` | RD01, RD02, RD03, RD06 |
| DF2 | `(ALTERNATIVA.pergunta_codigo, ALTERNATIVA.letra) → texto, correta` | RD04, RD05 |
| DF3 | `FONTE.url → titulo, publicador_id, idioma_codigo` | RD06, RD07 |
| DF4 | `CATEGORIA.codigo → nome` | RD02 |
| DF5 | `DIFICULDADE.codigo → descricao` | RD03 |
| DF6 | `PUBLICADOR.id → nome` | Armazenamento de publicadores no contexto do projeto |
| DF7 | `IDIOMA.codigo → descricao` | Armazenamento de idiomas no contexto do projeto |
| DF8 | `PALAVRA_CHAVE.id → termo` | RD08, RD09 |
| DF9 | `JOGADOR.id → nome` | RD10 |
| DF10 | `QUIZ.identificador → jogador_id` | RD10, RD11 |
| DF11 | `PONTUACAO.id → pontos, quiz_identificador` | RD10, RD11 |
| DF12 | `(PERGUNTA_PALAVRA_CHAVE.pergunta_codigo, PERGUNTA_PALAVRA_CHAVE.palavra_chave_id) → associação` | RD08, RD09 |
| DF13 | `(QUIZ_PERGUNTA.quiz_identificador, QUIZ_PERGUNTA.pergunta_codigo) → associação` | RF04 |

| Forma | Por que o esquema atende | Tabela em que isso aparece |
| --- | --- | --- |
| 1FN | Cada coluna guarda um valor atômico por registro. Alternativas e palavras-chave são armazenadas em registros próprios, e não como listas em uma única coluna. | Todas; especialmente `ALTERNATIVA`, `PERGUNTA_PALAVRA_CHAVE` e `QUIZ_PERGUNTA`. |
| 2FN | Nas tabelas com chave simples, os atributos dependem da chave inteira. Nas tabelas associativas, a chave é composta e não existem atributos não-chave que dependam apenas de uma parte dela. | Todas; especialmente `PERGUNTA_PALAVRA_CHAVE` e `QUIZ_PERGUNTA`. |
| 3FN | Categoria, dificuldade, publicador, idioma e palavra-chave ficam em tabelas próprias. A ligação entre jogador e pontuação é obtida por `QUIZ`, evitando repetir `jogador_id` em `PONTUACAO` e mantendo os dados do jogador em um único lugar. | `CATEGORIA`, `DIFICULDADE`, `PUBLICADOR`, `IDIOMA`, `PALAVRA_CHAVE`, `PERGUNTA`, `FONTE`, `QUIZ` e `PONTUACAO`. |

## 6. Dicionário de dados

### Tabela: CATEGORIA

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| codigo | INTEGER | NOT NULL | PK | Identificador único da categoria. |
| nome | VARCHAR(60) | NOT NULL | UNIQUE | Nome da categoria temática. |

### Tabela: DIFICULDADE

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| codigo | INTEGER | NOT NULL | PK | Identificador único do nível de dificuldade. |
| descricao | VARCHAR(20) | NOT NULL | UNIQUE, CHECK (descricao IN ('Fácil', 'Médio', 'Difícil')) | Nome do nível de dificuldade da pergunta. |

### Tabela: PERGUNTA

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| codigo | INTEGER | NOT NULL | PK | Código único da pergunta. |
| titulo | VARCHAR(150) | NOT NULL | — | Título da pergunta. |
| enunciado | TEXT | NOT NULL | — | Afirmação apresentada ao jogador. |
| explicacao | TEXT | NOT NULL | — | Explicação da resposta correta. |
| categoria_codigo | INTEGER | NOT NULL | FK → CATEGORIA.codigo | Categoria à qual a pergunta pertence. |
| dificuldade_codigo | INTEGER | NOT NULL | FK → DIFICULDADE.codigo | Nível de dificuldade da pergunta. |
| fonte_url | VARCHAR(2048) | NOT NULL | FK → FONTE.url | URL da referência bibliográfica da pergunta. |

### Tabela: ALTERNATIVA

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| id | INTEGER | NOT NULL | PK | Identificador único da alternativa. |
| pergunta_codigo | INTEGER | NOT NULL | FK → PERGUNTA.codigo | Pergunta à qual a alternativa pertence. |
| letra | VARCHAR(5) | NOT NULL | UNIQUE (pergunta_codigo, letra) | Letra que identifica a alternativa dentro da pergunta. |
| texto | TEXT | NOT NULL | — | Texto da alternativa. |
| correta | BOOLEAN | NOT NULL | CHECK (correta IN (TRUE, FALSE)) | Indica se a alternativa é a correta. |

### Tabela: FONTE

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| url | VARCHAR(2048) | NOT NULL | PK | URL única da referência bibliográfica. |
| titulo | VARCHAR(250) | NOT NULL | — | Título da página ou material consultado. |
| publicador_id | INTEGER | NOT NULL | FK → PUBLICADOR.id | Publicador responsável pela fonte. |
| idioma_codigo | INTEGER | NOT NULL | FK → IDIOMA.codigo | Idioma em que a fonte está publicada. |

### Tabela: PUBLICADOR

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| id | INTEGER | NOT NULL | PK | Identificador único do publicador. |
| nome | VARCHAR(150) | NOT NULL | UNIQUE | Nome da organização ou entidade publicadora. |

### Tabela: IDIOMA

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| codigo | INTEGER | NOT NULL | PK | Identificador único do idioma. |
| descricao | VARCHAR(60) | NOT NULL | UNIQUE | Nome do idioma da fonte. |

### Tabela: PALAVRA_CHAVE

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| id | INTEGER | NOT NULL | PK | Identificador único da palavra-chave. |
| termo | VARCHAR(80) | NOT NULL | UNIQUE | Palavra ou expressão usada na pesquisa. |

### Tabela: PERGUNTA_PALAVRA_CHAVE

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| pergunta_codigo | INTEGER | NOT NULL | PK, FK → PERGUNTA.codigo | Pergunta associada à palavra-chave. |
| palavra_chave_id | INTEGER | NOT NULL | PK, FK → PALAVRA_CHAVE.id | Palavra-chave associada à pergunta. |

### Tabela: JOGADOR

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| id | INTEGER | NOT NULL | PK | Identificador único do jogador. |
| nome | VARCHAR(80) | NOT NULL | — | Nome de identificação exibido no ranking. |

### Tabela: QUIZ

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| identificador | INTEGER | NOT NULL | PK | Identificador único de uma tentativa de quiz. |
| jogador_id | INTEGER | NOT NULL | FK → JOGADOR.id | Jogador que realizou a tentativa. |

### Tabela: QUIZ_PERGUNTA

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| quiz_identificador | INTEGER | NOT NULL | PK, FK → QUIZ.identificador | Tentativa de quiz que contém a pergunta. |
| pergunta_codigo | INTEGER | NOT NULL | PK, FK → PERGUNTA.codigo | Pergunta incluída na tentativa. |

### Tabela: PONTUACAO

| Coluna | Tipo e tamanho | Nulo | Restrição | Descrição |
| --- | --- | --- | --- | --- |
| id | INTEGER | NOT NULL | PK | Identificador único do registro de pontuação. |
| pontos | INTEGER | NOT NULL | CHECK (pontos >= 0) | Quantidade de pontos obtida na pontuação registrada. |
| quiz_identificador | INTEGER | NOT NULL | FK → QUIZ.identificador | Quiz associado ao registro de pontuação. |
