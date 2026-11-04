-- Ampliação aditiva: mantém os jogadores e as pontuações existentes.
CREATE TABLE IF NOT EXISTS conta (
    id_conta INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_jogador INTEGER NOT NULL UNIQUE REFERENCES jogador(id_jogador) ON DELETE CASCADE,
    login VARCHAR(80) NOT NULL UNIQUE CHECK (login = lower(btrim(login))),
    senha_hash TEXT NOT NULL,
    foto VARCHAR(80) NOT NULL DEFAULT '/imagens/perfil.png',
    administrador BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS sessao_login (
    token_hash CHAR(64) PRIMARY KEY,
    id_conta INTEGER NOT NULL REFERENCES conta(id_conta) ON DELETE CASCADE,
    expira_em TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS sessao_login_expira_idx ON sessao_login(expira_em);
