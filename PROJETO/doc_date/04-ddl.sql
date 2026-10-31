-- 04-ddl.sql — Tech Trivia (modelo físico)
-- Equipe: Cauã, Raphael, Henrick, Murilo
-- PostgreSQL: SGBD relacional que garante integridade por PK, FK, UNIQUE e CHECK
--             e executa o script em transação (RNF01 e RNF02).
-- Contrato com Aplicativos para Web: os nomes de tabelas e colunas abaixo
--             são os acordados; qualquer mudança deve ser registrada no
--             repositório e comunicada.
--
-- Banco vazio (rodar do zero):
--   psql -U postgres -c "CREATE DATABASE tech_trivia;"
--   psql -U postgres -d tech_trivia -v ON_ERROR_STOP=1 -f 04-ddl.sql
--
-- Para banco vazio: não execute novamente sobre um banco já preenchido.
-- Para atualizar um banco existente, use: npm.cmd run migrar (pasta Servidor).

-- O banco tech_trivia deve ser criado antes: CREATE DATABASE fica fora desta transação.
-- Inclui o domínio fixo (dificuldade e idioma), sem contas ou senhas padrão.

-- Categorias, publicadores, fontes, perguntas e alternativas ficam no passo 8.
-- Este arquivo define a estrutura, não exporta os registros do banco em uso.
-- As configurações de rodada ficam em Servidor/configuracoes.json, fora do banco.

-- Nomes de chaves: id_<tabela> nas chaves artificiais. Exceções justificadas
-- (identificador natural): pergunta.codigo (fact-001, RD08 do .docx) e fonte.url.
-- Chave estrangeira para chave artificial tem o mesmo nome da PK referenciada
-- (ex.: pergunta.id_categoria). Para chave natural: fonte_url, pergunta_codigo.

SET client_encoding = 'UTF8';

BEGIN;


-- Categoria temática da pergunta. Nome único.
CREATE TABLE categoria (
    id_categoria INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome         VARCHAR(60) NOT NULL,
    CONSTRAINT categoria_nome_uq UNIQUE (nome)
);

-- Nível de dificuldade da pergunta . Domínio fixo de 3 valores.
CREATE TABLE dificuldade (
    id_dificuldade INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    descricao      VARCHAR(20) NOT NULL,
    CONSTRAINT dificuldade_descricao_uq UNIQUE (descricao),
    CONSTRAINT dificuldade_descricao_ck
        CHECK (descricao IN ('Fácil', 'Médio', 'Difícil'))
);

-- Idioma em que a fonte foi publicada (conjunto controlado).
CREATE TABLE idioma (
    id_idioma INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    descricao VARCHAR(60) NOT NULL,
    CONSTRAINT idioma_descricao_uq UNIQUE (descricao)
);

-- Organização que publica a fonte. Nome único.
CREATE TABLE publicador (
    id_publicador INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome          VARCHAR(150) NOT NULL,
    CONSTRAINT publicador_nome_uq UNIQUE (nome)
);

-- Palavra-chave cadastrada uma única vez .
CREATE TABLE palavra_chave (
    id_palavra_chave INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    termo            VARCHAR(80) NOT NULL,
    CONSTRAINT palavra_chave_termo_uq UNIQUE (termo)
);

-- Jogador identificado por um nome.
-- O nome NÃO é único: cada cadastro cria um jogador novo.
CREATE TABLE jogador (
    id_jogador INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome       VARCHAR(80) NOT NULL
);

-- Referência bibliográfica. A URL é a chave primária natural,
-- logo não se repete. Cada fonte tem um publicador e um idioma.
CREATE TABLE fonte (
    url           VARCHAR(2048) PRIMARY KEY,
    titulo        VARCHAR(250)  NOT NULL,
    id_publicador INTEGER       NOT NULL,
    id_idioma     INTEGER       NOT NULL,
    CONSTRAINT fonte_publicador_fk FOREIGN KEY (id_publicador)
        REFERENCES publicador (id_publicador),
    CONSTRAINT fonte_idioma_fk FOREIGN KEY (id_idioma)
        REFERENCES idioma (id_idioma)
);

-- Pergunta. O código (ex.: 'fact-001') é a chave primária.
-- Toda FK é NOT NULL porque os mínimos do modelo conceitual são 1.
CREATE TABLE pergunta (
    codigo         VARCHAR(20)   PRIMARY KEY,
    titulo         VARCHAR(150)  NOT NULL,
    enunciado      TEXT          NOT NULL,
    explicacao     TEXT          NOT NULL,
    id_categoria   INTEGER       NOT NULL,
    id_dificuldade INTEGER       NOT NULL,
    fonte_url      VARCHAR(2048) NOT NULL,
    CONSTRAINT pergunta_categoria_fk FOREIGN KEY (id_categoria)
        REFERENCES categoria (id_categoria),
    CONSTRAINT pergunta_dificuldade_fk FOREIGN KEY (id_dificuldade)
        REFERENCES dificuldade (id_dificuldade),
    CONSTRAINT pergunta_fonte_fk FOREIGN KEY (fonte_url)
        REFERENCES fonte (url)
);

-- Alternativa de uma pergunta. A letra identifica a alternativa
-- dentro da pergunta. A coluna "correta" marca a alternativa certa.
-- ON DELETE CASCADE: alternativa não existe sem a pergunta; ao excluir a
CREATE TABLE alternativa (
    id_alternativa  INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pergunta_codigo VARCHAR(20) NOT NULL,
    letra           VARCHAR(5)  NOT NULL,
    texto           TEXT        NOT NULL,
    correta         BOOLEAN     NOT NULL,
    CONSTRAINT alternativa_pergunta_fk FOREIGN KEY (pergunta_codigo)
        REFERENCES pergunta (codigo) ON DELETE CASCADE,
    CONSTRAINT alternativa_pergunta_letra_uq UNIQUE (pergunta_codigo, letra)
);

-- No máximo UMA alternativa correta por pergunta.
-- Índice único PARCIAL: só considera as linhas em que correta = TRUE.
-- Limite do banco: "pelo menos uma correta" e "mínimo de 2 alternativas"
-- não são garantidos aqui; a API valida isso numa transação ao cadastrar ou
-- editar a pergunta.
CREATE UNIQUE INDEX alternativa_uma_correta_uq
    ON alternativa (pergunta_codigo) WHERE correta;

-- Associação N:N entre pergunta e palavra-chave.
-- ON DELETE CASCADE nos dois lados: a linha é só um vínculo; excluir uma
-- pergunta ou uma palavra-chave remove o vínculo, nunca a outra entidade.
CREATE TABLE pergunta_palavra_chave (
    pergunta_codigo  VARCHAR(20) NOT NULL,
    id_palavra_chave INTEGER     NOT NULL,
    PRIMARY KEY (pergunta_codigo, id_palavra_chave),
    CONSTRAINT pergunta_palavra_chave_pergunta_fk FOREIGN KEY (pergunta_codigo)
        REFERENCES pergunta (codigo) ON DELETE CASCADE,
    CONSTRAINT pergunta_palavra_chave_palavra_fk FOREIGN KEY (id_palavra_chave)
        REFERENCES palavra_chave (id_palavra_chave) ON DELETE CASCADE
);

-- Quiz = uma tentativa de um jogador. Um jogador pode ter várias.
-- Sem CASCADE: um jogador que já jogou não pode ser excluído por engano.
CREATE TABLE quiz (
    id_quiz    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_jogador INTEGER NOT NULL,
    CONSTRAINT quiz_jogador_fk FOREIGN KEY (id_jogador)
        REFERENCES jogador (id_jogador)
);

-- Associação N:N entre quiz e pergunta: a mesma pergunta pode
-- aparecer em quizzes diferentes. A linha é só um vínculo, então
-- ON DELETE CASCADE nos dois lados (decisão fora do dicionário; mesma
-- lógica de pergunta_palavra_chave). Excluir uma pergunta remove
-- o vínculo, nunca o quiz nem a pontuação.
CREATE TABLE quiz_pergunta (
    id_quiz         INTEGER     NOT NULL,
    pergunta_codigo VARCHAR(20) NOT NULL,
    PRIMARY KEY (id_quiz, pergunta_codigo),
    CONSTRAINT quiz_pergunta_quiz_fk FOREIGN KEY (id_quiz)
        REFERENCES quiz (id_quiz) ON DELETE CASCADE,
    CONSTRAINT quiz_pergunta_pergunta_fk FOREIGN KEY (pergunta_codigo)
        REFERENCES pergunta (codigo) ON DELETE CASCADE
);

-- Pontuação registrada de um quiz.
-- id_quiz NÃO é UNIQUE: o modelo conceitual admite várias pontuações por quiz.
-- O jogador não é repetido aqui: obtém-se por pontuacao -> quiz -> jogador.
-- O ranking é uma consulta (soma de pontos por jogador), não uma tabela.
CREATE TABLE pontuacao (
    id_pontuacao INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pontos       INTEGER NOT NULL,
    id_quiz      INTEGER NOT NULL,
    CONSTRAINT pontuacao_pontos_ck CHECK (pontos >= 0),
    CONSTRAINT pontuacao_quiz_fk FOREIGN KEY (id_quiz)
        REFERENCES quiz (id_quiz)
);

-- Um perfil de jogador pode possuir zero ou uma conta: perfis antigos podem
-- receber login pelo painel sem perder seus pontos. O nome de exibição fica
-- em jogador.nome; o identificador de acesso único fica em conta.login.
-- A API normaliza o login para minúsculas e exige de 3 a 40 caracteres.
-- senha_hash guarda apenas o hash scrypt com salt, nunca a senha original.
-- foto é o caminho de um avatar permitido pela API. Cadastros públicos não
-- podem conceder privilégios; administrador começa sempre como FALSE.
-- A remoção do jogador remove a conta, mas os vínculos com quiz continuam
-- impedindo a exclusão de jogadores que já possuem tentativas registradas.
CREATE TABLE conta (
    id_conta INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_jogador INTEGER NOT NULL UNIQUE REFERENCES jogador(id_jogador) ON DELETE CASCADE,
    login VARCHAR(80) NOT NULL UNIQUE CHECK (login = lower(btrim(login))),
    senha_hash TEXT NOT NULL,
    foto VARCHAR(80) NOT NULL DEFAULT '/imagens/perfil.png',
    administrador BOOLEAN NOT NULL DEFAULT FALSE
);

-- O navegador recebe um token aleatório em cookie HttpOnly. O banco guarda
-- somente o SHA-256 desse token. A expiração é conferida a cada requisição.
-- Sair apaga o registro; mudar a senha revoga os acessos anteriores da conta.
-- A chave estrangeira remove os acessos quando a conta é excluída.
-- Mesmas definições de Servidor/migracoes/001-login.sql, usada no banco existente.
CREATE TABLE sessao_login (
    token_hash CHAR(64) PRIMARY KEY,
    id_conta INTEGER NOT NULL REFERENCES conta(id_conta) ON DELETE CASCADE,
    expira_em TIMESTAMPTZ NOT NULL
);
CREATE INDEX sessao_login_expira_idx ON sessao_login(expira_em);

-- Domínio fixo.
INSERT INTO dificuldade (descricao) VALUES ('Fácil'), ('Médio'), ('Difícil');

-- ATENÇÃO: o doc_date não lista os idiomas. Português e Inglês são suposição;
-- ajustar se a equipe usar outros.
INSERT INTO idioma (descricao) VALUES ('Português'), ('Inglês');

COMMIT;
