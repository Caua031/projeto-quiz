-- patch-5-4.sql — ajusta os dados de teste JÁ carregados (apoio, NÃO é entrega)
--   psql -U postgres -d tech_trivia -v ON_ERROR_STOP=1 -f patch-5-4.sql
-- Resultado: fonte-2 e fonte-4 ficam com 1 pergunta cada; fonte-1 e fonte-3 com 2.
SET client_encoding = 'UTF8';

BEGIN;
INSERT INTO fonte (url, titulo, id_publicador, id_idioma)
VALUES ('https://exemplo.com/fonte-4', 'Fonte provisória 4', 1, 1);
UPDATE pergunta SET fonte_url = 'https://exemplo.com/fonte-4' WHERE codigo = 'fact-006';
COMMIT;
