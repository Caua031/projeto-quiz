-- dados-teste.sql — dados PROVISÓRIOS de desenvolvimento (NÃO é entrega do projeto)
-- Rodar em banco recém-criado, depois do 04-ddl.sql:
--   psql -U postgres -d tech_trivia -v ON_ERROR_STOP=1 -f dados-teste.sql
-- Tudo aqui é provisório. O conteúdo real (títulos, explicações e fontes de
-- cada pergunta) entra no passo 8 do doc_date.

SET client_encoding = 'UTF8';

BEGIN;

-- 3 categorias (a terceira fica sem perguntas, para testar a contagem zero)
INSERT INTO categoria (nome) VALUES ('phishing'), ('malware'), ('redes');

-- 2 publicadores; o A publica 3 fontes (1, 2 e 4)
INSERT INTO publicador (nome) VALUES ('Publicador provisório A'), ('Publicador provisório B');

-- 4 fontes (idiomas: 1 = Português, 2 = Inglês)
INSERT INTO fonte (url, titulo, id_publicador, id_idioma) VALUES
 ('https://exemplo.com/fonte-1', 'Fonte provisória 1', 1, 1),
 ('https://exemplo.com/fonte-2', 'Fonte provisória 2', 1, 1),
 ('https://exemplo.com/fonte-3', 'Fonte provisória 3', 2, 2),
 ('https://exemplo.com/fonte-4', 'Fonte provisória 4', 1, 1);

-- 6 perguntas. Categoria: 1 = phishing, 2 = malware. Dificuldade: 1 = Fácil, 2 = Médio, 3 = Difícil.
-- fonte-1 é citada por fact-001 e fact-002; fonte-3 por fact-004 e fact-005;
-- fonte-2 só por fact-003 e fonte-4 só por fact-006 (para testar "mais de uma pergunta").
INSERT INTO pergunta (codigo, titulo, enunciado, explicacao, id_categoria, id_dificuldade, fonte_url) VALUES
 ('fact-001', 'Pergunta provisória 1', 'Enunciado provisório 1.', 'Explicação provisória 1.', 1, 1, 'https://exemplo.com/fonte-1'),
 ('fact-002', 'Pergunta provisória 2', 'Enunciado provisório 2.', 'Explicação provisória 2.', 1, 2, 'https://exemplo.com/fonte-1'),
 ('fact-003', 'Pergunta provisória 3', 'Enunciado provisório 3.', 'Explicação provisória 3.', 1, 3, 'https://exemplo.com/fonte-2'),
 ('fact-004', 'Pergunta provisória 4', 'Enunciado provisório 4.', 'Explicação provisória 4.', 2, 1, 'https://exemplo.com/fonte-3'),
 ('fact-005', 'Pergunta provisória 5', 'Enunciado provisório 5.', 'Explicação provisória 5.', 2, 2, 'https://exemplo.com/fonte-3'),
 ('fact-006', 'Pergunta provisória 6', 'Enunciado provisório 6.', 'Explicação provisória 6.', 2, 3, 'https://exemplo.com/fonte-4');

-- 12 alternativas (A = Certo, B = Errado). A correta é A em 001, 003 e 005; B em 002, 004 e 006.
INSERT INTO alternativa (pergunta_codigo, letra, texto, correta) VALUES
 ('fact-001', 'A', 'Certo',  TRUE),  ('fact-001', 'B', 'Errado', FALSE),
 ('fact-002', 'A', 'Certo',  FALSE), ('fact-002', 'B', 'Errado', TRUE),
 ('fact-003', 'A', 'Certo',  TRUE),  ('fact-003', 'B', 'Errado', FALSE),
 ('fact-004', 'A', 'Certo',  FALSE), ('fact-004', 'B', 'Errado', TRUE),
 ('fact-005', 'A', 'Certo',  TRUE),  ('fact-005', 'B', 'Errado', FALSE),
 ('fact-006', 'A', 'Certo',  FALSE), ('fact-006', 'B', 'Errado', TRUE);

-- 3 palavras-chave e 5 vínculos
INSERT INTO palavra_chave (termo) VALUES ('golpe'), ('senha'), ('vírus');
INSERT INTO pergunta_palavra_chave (pergunta_codigo, id_palavra_chave) VALUES
 ('fact-001', 1), ('fact-001', 2), ('fact-002', 1), ('fact-004', 3), ('fact-005', 3);

COMMIT;
