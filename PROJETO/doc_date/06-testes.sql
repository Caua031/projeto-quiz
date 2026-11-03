-- 06-testes.sql — Passo 9: testes das regras de negócio (Tech Trivia)
-- Rode depois da carga: 04-ddl.sql, 05-dml-consultas.sql e, por fim, este arquivo.
--   psql -U postgres -d tech_trivia -f 06-testes.sql
-- Sem ON_ERROR_STOP, de propósito: cada bloco abaixo DEVE falhar e o script segue para o próximo.
--
-- Como funciona:
--   * tudo roda numa transação que termina em ROLLBACK: o banco fica exatamente como estava;
--   * cada teste usa SAVEPOINT; o erro esperado é desfeito com ROLLBACK TO e o teste seguinte começa limpo;
--   * os dados de apoio (um jogador com conta, um quiz e uma sessão) são criados no início e descartados no fim.
--
-- Resultado: abaixo de cada teste está a mensagem esperada do PostgreSQL (servidor em português do Brasil).
-- Ao executar, confira que o nome da restrição é o mesmo e cole a mensagem completa que o seu psql mostrar.
-- Os testes de "Exclusões" e de "Cascatas" no final também são conferências do que o banco faz sozinho.
-- A última seção traz as consultas de acesso e ranking (RA08 a RA10), que usam os mesmos dados de apoio.

SET client_encoding = 'UTF8';
\set ON_ERROR_STOP off

BEGIN;

-- Dados de apoio (devem funcionar: INSERT 0 1 em cada linha).
INSERT INTO jogador (nome) VALUES ('Jogador de teste 06'), ('Jogador sem conta 06');
CREATE TEMP TABLE ids06 AS
SELECT MIN(id_jogador) AS id_jogador, MAX(id_jogador) AS id_jogador2
FROM jogador WHERE nome IN ('Jogador de teste 06', 'Jogador sem conta 06');
ALTER TABLE ids06 ADD COLUMN id_quiz INTEGER, ADD COLUMN id_conta INTEGER;
INSERT INTO quiz (id_jogador) SELECT id_jogador FROM ids06;
UPDATE ids06 SET id_quiz = (SELECT MAX(id_quiz) FROM quiz WHERE id_jogador = ids06.id_jogador);
INSERT INTO quiz_pergunta (id_quiz, pergunta_codigo) SELECT id_quiz, 'tt-es-001' FROM ids06;
INSERT INTO conta (id_jogador, login, senha_hash) SELECT id_jogador, 'login_teste_06', 'resumo-de-teste' FROM ids06;
UPDATE ids06 SET id_conta = (SELECT id_conta FROM conta WHERE login = 'login_teste_06');
INSERT INTO sessao_login (token_hash, id_conta, expira_em) SELECT repeat('a', 64), id_conta, NOW() + INTERVAL '7 days' FROM ids06;


-- CATEGORIA, PUBLICADOR, IDIOMA E DIFICULDADE

-- Teste 01. Regra: Não existem duas categorias com o mesmo nome (RNF03).
SAVEPOINT s06;
INSERT INTO categoria (nome) VALUES ('phishing');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  duplicar valor da chave viola a restrição de unicidade "categoria_nome_uq".

-- Teste 02. Regra: Categoria sem nome não entra (RNF02).
SAVEPOINT s06;
INSERT INTO categoria (nome) VALUES (NULL);
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  o valor nulo na coluna "nome" da relação "categoria" viola a restrição de não-nulo.

-- Teste 03. Regra: Não existem dois publicadores com o mesmo nome (RNF03).
SAVEPOINT s06;
INSERT INTO publicador (nome) VALUES ('CERT.br');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  duplicar valor da chave viola a restrição de unicidade "publicador_nome_uq".

-- Teste 04. Regra: Não existem dois idiomas com a mesma descrição.
SAVEPOINT s06;
INSERT INTO idioma (descricao) VALUES ('Português');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  duplicar valor da chave viola a restrição de unicidade "idioma_descricao_uq".

-- Teste 05. Regra: A dificuldade só pode ser Fácil, Médio ou Difícil (RD03).
SAVEPOINT s06;
INSERT INTO dificuldade (descricao) VALUES ('Impossível');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  a nova linha da relação "dificuldade" viola a restrição de verificação "dificuldade_descricao_ck".

-- FONTE

-- Teste 06. Regra: Não existem duas fontes com a mesma URL (RD07, RNF03).
SAVEPOINT s06;
INSERT INTO fonte (titulo, url, id_publicador, id_idioma)
SELECT 'outra', url, id_publicador, id_idioma FROM fonte LIMIT 1;
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  duplicar valor da chave viola a restrição de unicidade "fonte_pkey".

-- Teste 07. Regra: Toda fonte tem um publicador que existe (RNF02).
SAVEPOINT s06;
INSERT INTO fonte (titulo, url, id_publicador, id_idioma)
VALUES ('x', 'https://exemplo.invalid/teste-06-a', 999999, (SELECT MIN(id_idioma) FROM idioma));
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  inserção ou atualização em tabela "fonte" viola restrição de chave estrangeira "fonte_publicador_fk".

-- Teste 08. Regra: Toda fonte tem um idioma que existe (RNF02).
SAVEPOINT s06;
INSERT INTO fonte (titulo, url, id_publicador, id_idioma)
VALUES ('x', 'https://exemplo.invalid/teste-06-b', (SELECT MIN(id_publicador) FROM publicador), 999999);
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  inserção ou atualização em tabela "fonte" viola restrição de chave estrangeira "fonte_idioma_fk".

-- PERGUNTA

-- Teste 09. Regra: Pergunta sem título não entra (RD01).
SAVEPOINT s06;
INSERT INTO pergunta (codigo, titulo, enunciado, explicacao, id_categoria, id_dificuldade, fonte_url)
VALUES ('tt-teste-01', NULL, 'enunciado', 'explicacao', (SELECT MIN(id_categoria) FROM categoria), (SELECT MIN(id_dificuldade) FROM dificuldade), (SELECT MIN(url) FROM fonte));
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  o valor nulo na coluna "titulo" da relação "pergunta" viola a restrição de não-nulo.

-- Teste 10. Regra: Pergunta sem enunciado não entra (RD01).
SAVEPOINT s06;
INSERT INTO pergunta (codigo, titulo, enunciado, explicacao, id_categoria, id_dificuldade, fonte_url)
VALUES ('tt-teste-02', 'titulo', NULL, 'explicacao', (SELECT MIN(id_categoria) FROM categoria), (SELECT MIN(id_dificuldade) FROM dificuldade), (SELECT MIN(url) FROM fonte));
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  o valor nulo na coluna "enunciado" da relação "pergunta" viola a restrição de não-nulo.

-- Teste 11. Regra: Pergunta sem explicação não entra (RD01).
SAVEPOINT s06;
INSERT INTO pergunta (codigo, titulo, enunciado, explicacao, id_categoria, id_dificuldade, fonte_url)
VALUES ('tt-teste-03', 'titulo', 'enunciado', NULL, (SELECT MIN(id_categoria) FROM categoria), (SELECT MIN(id_dificuldade) FROM dificuldade), (SELECT MIN(url) FROM fonte));
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  o valor nulo na coluna "explicacao" da relação "pergunta" viola a restrição de não-nulo.

-- Teste 12. Regra: Não existem duas perguntas com o mesmo código (RD01, RNF03).
SAVEPOINT s06;
INSERT INTO pergunta (codigo, titulo, enunciado, explicacao, id_categoria, id_dificuldade, fonte_url)
VALUES ('tt-es-001', 'titulo', 'enunciado', 'explicacao', (SELECT MIN(id_categoria) FROM categoria), (SELECT MIN(id_dificuldade) FROM dificuldade), (SELECT MIN(url) FROM fonte));
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  duplicar valor da chave viola a restrição de unicidade "pergunta_pkey".

-- Teste 13. Regra: Toda pergunta pertence a uma categoria que existe (RD02).
SAVEPOINT s06;
INSERT INTO pergunta (codigo, titulo, enunciado, explicacao, id_categoria, id_dificuldade, fonte_url)
VALUES ('tt-teste-04', 'titulo', 'enunciado', 'explicacao', 999999, (SELECT MIN(id_dificuldade) FROM dificuldade), (SELECT MIN(url) FROM fonte));
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  inserção ou atualização em tabela "pergunta" viola restrição de chave estrangeira "pergunta_categoria_fk".

-- Teste 14. Regra: Toda pergunta tem um nível de dificuldade que existe (RD03).
SAVEPOINT s06;
INSERT INTO pergunta (codigo, titulo, enunciado, explicacao, id_categoria, id_dificuldade, fonte_url)
VALUES ('tt-teste-05', 'titulo', 'enunciado', 'explicacao', (SELECT MIN(id_categoria) FROM categoria), 999999, (SELECT MIN(url) FROM fonte));
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  inserção ou atualização em tabela "pergunta" viola restrição de chave estrangeira "pergunta_dificuldade_fk".

-- Teste 15. Regra: Toda pergunta cita uma fonte que existe (RD06).
SAVEPOINT s06;
INSERT INTO pergunta (codigo, titulo, enunciado, explicacao, id_categoria, id_dificuldade, fonte_url)
VALUES ('tt-teste-06', 'titulo', 'enunciado', 'explicacao', (SELECT MIN(id_categoria) FROM categoria), (SELECT MIN(id_dificuldade) FROM dificuldade), 'https://nao-existe.invalid');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  inserção ou atualização em tabela "pergunta" viola restrição de chave estrangeira "pergunta_fonte_fk".

-- ALTERNATIVA

-- Teste 16. Regra: Toda alternativa pertence a uma pergunta que existe (RD04).
SAVEPOINT s06;
INSERT INTO alternativa (pergunta_codigo, letra, texto, correta)
VALUES ('tt-xx-999', 'A', 'x', FALSE);
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  inserção ou atualização em tabela "alternativa" viola restrição de chave estrangeira "alternativa_pergunta_fk".

-- Teste 17. Regra: A mesma letra não se repete na mesma pergunta (RD04).
SAVEPOINT s06;
INSERT INTO alternativa (pergunta_codigo, letra, texto, correta)
VALUES ('tt-es-001', 'A', 'outra', FALSE);
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  duplicar valor da chave viola a restrição de unicidade "alternativa_pergunta_letra_uq".

-- Teste 18. Regra: Uma pergunta não pode ter duas alternativas corretas (RD05). A tt-es-001 já tem a A como correta.
SAVEPOINT s06;
INSERT INTO alternativa (pergunta_codigo, letra, texto, correta)
VALUES ('tt-es-001', 'C', 'Talvez', TRUE);
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  duplicar valor da chave viola a restrição de unicidade "alternativa_uma_correta_uq".

-- Teste 19. Regra: A alternativa tem de dizer se é correta ou não (RD05).
SAVEPOINT s06;
INSERT INTO alternativa (pergunta_codigo, letra, texto, correta)
VALUES ('tt-es-001', 'D', 'x', NULL);
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  o valor nulo na coluna "correta" da relação "alternativa" viola a restrição de não-nulo.

-- PALAVRA-CHAVE

-- Teste 20. Regra: Não existem duas palavras-chave iguais (RD09, RNF03).
SAVEPOINT s06;
INSERT INTO palavra_chave (termo)
SELECT termo FROM palavra_chave LIMIT 1;
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  duplicar valor da chave viola a restrição de unicidade "palavra_chave_termo_uq".

-- Teste 21. Regra: A mesma palavra-chave não se repete na mesma pergunta.
SAVEPOINT s06;
INSERT INTO pergunta_palavra_chave (pergunta_codigo, id_palavra_chave)
SELECT pergunta_codigo, id_palavra_chave FROM pergunta_palavra_chave LIMIT 1;
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  duplicar valor da chave viola a restrição de unicidade "pergunta_palavra_chave_pkey".

-- Teste 22. Regra: O vínculo só aceita palavra-chave que existe.
SAVEPOINT s06;
INSERT INTO pergunta_palavra_chave (pergunta_codigo, id_palavra_chave)
VALUES ('tt-es-001', 999999);
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  inserção ou atualização em tabela "pergunta_palavra_chave" viola restrição de chave estrangeira "pergunta_palavra_chave_palavra_fk".

-- JOGADOR, QUIZ E PONTUAÇÃO

-- Teste 23. Regra: Toda tentativa (quiz) pertence a um jogador que existe (RF09).
SAVEPOINT s06;
INSERT INTO quiz (id_jogador) VALUES (999999);
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  inserção ou atualização em tabela "quiz" viola restrição de chave estrangeira "quiz_jogador_fk".

-- Teste 24. Regra: A mesma pergunta não se repete no mesmo quiz (RF08).
SAVEPOINT s06;
INSERT INTO quiz_pergunta (id_quiz, pergunta_codigo)
VALUES ((SELECT id_quiz FROM ids06), 'tt-es-001');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  duplicar valor da chave viola a restrição de unicidade "quiz_pergunta_pkey".

-- Teste 25. Regra: O quiz só aceita pergunta que existe (RF08).
SAVEPOINT s06;
INSERT INTO quiz_pergunta (id_quiz, pergunta_codigo)
VALUES ((SELECT id_quiz FROM ids06), 'tt-xx-999');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  inserção ou atualização em tabela "quiz_pergunta" viola restrição de chave estrangeira "quiz_pergunta_pergunta_fk".

-- Teste 26. Regra: A pergunta só entra em quiz que existe (RF08).
SAVEPOINT s06;
INSERT INTO quiz_pergunta (id_quiz, pergunta_codigo)
VALUES (999999, 'tt-es-001');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  inserção ou atualização em tabela "quiz_pergunta" viola restrição de chave estrangeira "quiz_pergunta_quiz_fk".

-- Teste 27. Regra: A pontuação não pode ser negativa (RD10).
SAVEPOINT s06;
INSERT INTO pontuacao (pontos, id_quiz) VALUES (-1, (SELECT id_quiz FROM ids06));
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  a nova linha da relação "pontuacao" viola a restrição de verificação "pontuacao_pontos_ck".

-- Teste 28. Regra: A pontuação tem de ter valor (RNF02).
SAVEPOINT s06;
INSERT INTO pontuacao (pontos, id_quiz) VALUES (NULL, (SELECT id_quiz FROM ids06));
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  o valor nulo na coluna "pontos" da relação "pontuacao" viola a restrição de não-nulo.

-- Teste 29. Regra: Toda pontuação pertence a um quiz que existe (RF09).
SAVEPOINT s06;
INSERT INTO pontuacao (pontos, id_quiz) VALUES (10, 999999);
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  inserção ou atualização em tabela "pontuacao" viola restrição de chave estrangeira "pontuacao_quiz_fk".

-- CONTA E SESSÃO DE LOGIN (RD12 a RD16)

-- Teste 30. Regra: O login é gravado em minúsculas (RD13).
SAVEPOINT s06;
INSERT INTO conta (id_jogador, login, senha_hash)
VALUES ((SELECT id_jogador2 FROM ids06), 'Login_Maiusculo', 'x');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  a nova linha da relação "conta" viola a restrição de verificação "conta_login_check".

-- Teste 31. Regra: Não existem dois logins iguais (RD13, RNF03).
SAVEPOINT s06;
INSERT INTO conta (id_jogador, login, senha_hash)
VALUES ((SELECT id_jogador2 FROM ids06), 'login_teste_06', 'x');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  duplicar valor da chave viola a restrição de unicidade "conta_login_key".

-- Teste 32. Regra: Um jogador tem no máximo uma conta (RD12).
SAVEPOINT s06;
INSERT INTO conta (id_jogador, login, senha_hash)
VALUES ((SELECT id_jogador FROM ids06), 'outro_login_06', 'x');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  duplicar valor da chave viola a restrição de unicidade "conta_id_jogador_key".

-- Teste 33. Regra: Toda conta pertence a um jogador que existe (RD12).
SAVEPOINT s06;
INSERT INTO conta (id_jogador, login, senha_hash)
VALUES (999999, 'login_sem_jogador', 'x');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  inserção ou atualização em tabela "conta" viola restrição de chave estrangeira "conta_id_jogador_fkey".

-- Teste 34. Regra: A conta tem de ter senha (RNF04).
SAVEPOINT s06;
INSERT INTO conta (id_jogador, login, senha_hash)
VALUES ((SELECT id_jogador2 FROM ids06), 'login_sem_senha', NULL);
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  o valor nulo na coluna "senha_hash" da relação "conta" viola a restrição de não-nulo.

-- Teste 35. Regra: Não existem duas sessões com o mesmo token (RD15).
SAVEPOINT s06;
INSERT INTO sessao_login (token_hash, id_conta, expira_em)
VALUES (repeat('a', 64), (SELECT id_conta FROM ids06), NOW() + INTERVAL '7 days');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  duplicar valor da chave viola a restrição de unicidade "sessao_login_pkey".

-- Teste 36. Regra: Toda sessão pertence a uma conta que existe (RD15).
SAVEPOINT s06;
INSERT INTO sessao_login (token_hash, id_conta, expira_em)
VALUES (repeat('c', 64), 999999, NOW() + INTERVAL '7 days');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  inserção ou atualização em tabela "sessao_login" viola restrição de chave estrangeira "sessao_login_id_conta_fkey".

-- Teste 37. Regra: O token guardado tem exatamente até 64 caracteres (SHA-256 em hexadecimal).
SAVEPOINT s06;
INSERT INTO sessao_login (token_hash, id_conta, expira_em)
VALUES (repeat('b', 65), (SELECT id_conta FROM ids06), NOW() + INTERVAL '7 days');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  valor muito longo para tipo character(64).

-- EXCLUSÕES RECUSADAS PELO BANCO (RNF02)

-- Teste 38. Regra: Não se exclui categoria que possui perguntas.
SAVEPOINT s06;
DELETE FROM categoria WHERE nome = 'phishing';
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  atualização ou exclusão em tabela "categoria" viola restrição de chave estrangeira "pergunta_categoria_fk" em "pergunta".

-- Teste 39. Regra: Não se exclui publicador que possui fontes.
SAVEPOINT s06;
DELETE FROM publicador WHERE nome = 'CERT.br';
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  atualização ou exclusão em tabela "publicador" viola restrição de chave estrangeira "fonte_publicador_fk" em "fonte".

-- Teste 40. Regra: Não se exclui jogador que possui tentativas (RD18).
SAVEPOINT s06;
DELETE FROM jogador WHERE id_jogador = (SELECT id_jogador FROM ids06);
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  atualização ou exclusão em tabela "jogador" viola restrição de chave estrangeira "quiz_jogador_fk" em "quiz".

-- CONTA E SESSÃO — COMPLEMENTOS (RD13, RD15, RD19)

-- Teste 41. Regra: O login não pode ter espaços nas pontas (RD13).
SAVEPOINT s06;
INSERT INTO conta (id_jogador, login, senha_hash)
VALUES ((SELECT id_jogador2 FROM ids06), ' login_espacos ', 'x');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  a nova linha da relação "conta" viola a restrição de verificação "conta_login_check".

-- Teste 42. Regra: A conta tem de ter avatar; o padrão só vale quando a coluna é omitida (RD19).
SAVEPOINT s06;
INSERT INTO conta (id_jogador, login, senha_hash, foto)
VALUES ((SELECT id_jogador2 FROM ids06), 'login_sem_foto', 'x', NULL);
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  o valor nulo na coluna "foto" da relação "conta" viola a restrição de não-nulo.

-- Teste 43. Regra: A conta tem de dizer se é administradora (RD16).
SAVEPOINT s06;
INSERT INTO conta (id_jogador, login, senha_hash, administrador)
VALUES ((SELECT id_jogador2 FROM ids06), 'login_sem_perfil', 'x', NULL);
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  o valor nulo na coluna "administrador" da relação "conta" viola a restrição de não-nulo.

-- Teste 44. Regra: Toda sessão tem prazo de validade (RD15).
SAVEPOINT s06;
INSERT INTO sessao_login (token_hash, id_conta, expira_em)
VALUES (repeat('d', 64), (SELECT id_conta FROM ids06), NULL);
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  o valor nulo na coluna "expira_em" da relação "sessao_login" viola a restrição de não-nulo.

-- Teste 45. Regra: Toda sessão pertence a uma conta (RD15).
SAVEPOINT s06;
INSERT INTO sessao_login (token_hash, id_conta, expira_em)
VALUES (repeat('e', 64), NULL, NOW() + INTERVAL '7 days');
ROLLBACK TO s06;
-- Resultado esperado: ERRO:  o valor nulo na coluna "id_conta" da relação "sessao_login" viola a restrição de não-nulo.

-- CASCATAS (devem FUNCIONAR; mostram o que o banco faz sozinho)

-- Teste 46. Excluir a conta remove as sessões dela (RD15).
-- Resultado esperado: DELETE 1 e, em seguida, sessoes_restantes = 0.
SAVEPOINT s06;
DELETE FROM conta WHERE id_conta = (SELECT id_conta FROM ids06);
SELECT count(*)::int AS sessoes_restantes FROM sessao_login WHERE token_hash = repeat('a', 64);
ROLLBACK TO s06;

-- Teste 47. Excluir um jogador que não possui tentativas remove a conta e as sessões dele (RD12, RD15).
-- Resultado esperado: DELETE 1; contas_restantes = 0; sessoes_restantes = 0.
SAVEPOINT s06;
INSERT INTO jogador (nome) VALUES ('Jogador cascata 06');
INSERT INTO conta (id_jogador, login, senha_hash) SELECT id_jogador, 'login_cascata_06', 'x' FROM jogador WHERE nome = 'Jogador cascata 06';
INSERT INTO sessao_login (token_hash, id_conta, expira_em)
SELECT repeat('f', 64), id_conta, NOW() + INTERVAL '7 days' FROM conta WHERE login = 'login_cascata_06';
DELETE FROM jogador WHERE nome = 'Jogador cascata 06';
SELECT (SELECT count(*)::int FROM conta WHERE login = 'login_cascata_06') AS contas_restantes,
       (SELECT count(*)::int FROM sessao_login WHERE token_hash = repeat('f', 64)) AS sessoes_restantes;
ROLLBACK TO s06;

-- Teste 48. Excluir uma pergunta remove suas alternativas e vínculos, mas não o quiz.
-- O banco permite; quem recusa excluir pergunta já usada em tentativa é a API (RD18).
-- Resultado esperado: DELETE 1; alternativas_restantes = 0; vinculos_de_quiz = 0; quizzes_preservados = 1.
SAVEPOINT s06;
DELETE FROM pergunta WHERE codigo = 'tt-es-001';
SELECT (SELECT count(*)::int FROM alternativa WHERE pergunta_codigo = 'tt-es-001') AS alternativas_restantes,
       (SELECT count(*)::int FROM quiz_pergunta WHERE pergunta_codigo = 'tt-es-001') AS vinculos_de_quiz,
       (SELECT count(*)::int FROM quiz WHERE id_quiz = (SELECT id_quiz FROM ids06)) AS quizzes_preservados;
ROLLBACK TO s06;

-- CONSULTAS DE ACESSO E RANKING (RA08 a RA10)

-- O 04-ddl.sql não cria contas padrão; por isso estas consultas usam os dados de apoio do início
-- (conta login_teste_06, sessão e uma tentativa) e acrescentam duas pontuações, tudo descartado no ROLLBACK.
-- Resultado esperado: calculado a partir desses dados. O ranking (RA10) considera todos os jogadores do banco;
-- em banco recém-carregado, só aparece o jogador de teste. A senha (senha_hash) nunca é exibida.
SAVEPOINT ra;
INSERT INTO pontuacao (pontos, id_quiz) SELECT 3000, id_quiz FROM ids06;
INSERT INTO quiz (id_jogador) SELECT id_jogador FROM ids06;
INSERT INTO pontuacao (pontos, id_quiz) SELECT 1000, MAX(id_quiz) FROM quiz WHERE id_jogador = (SELECT id_jogador FROM ids06);

-- RA08: localizar a conta e o jogador pelo nome de usuário (a API usa isto para conferir a senha).
-- API equivalente: POST /api/auth/login
SELECT c.login, j.nome, c.foto, c.administrador
FROM conta c JOIN jogador j USING (id_jogador)
WHERE c.login = 'login_teste_06';
-- Resultado esperado:
--      login      |         nome        |         foto        | administrador
-- ----------------+---------------------+---------------------+---------------
--  login_teste_06 | Jogador de teste 06 |        imagens      | f
-- (1 linha)

-- RA09: identificar quem está autenticado pelo token da sessão, se ela não expirou.
-- API equivalente: GET /api/auth/eu (e todas as rotas protegidas)
SELECT c.login, j.nome, c.administrador
FROM sessao_login s JOIN conta c USING (id_conta) JOIN jogador j USING (id_jogador)
WHERE s.token_hash = repeat('a', 64) AND s.expira_em > NOW();
-- Resultado esperado (sessão válida):
--      login      |         nome        | administrador
-- ----------------+---------------------+---------------
--  login_teste_06 | Jogador de teste 06 | f
-- (1 linha)

-- RA09, com a sessão vencida: a mesma consulta não identifica ninguém.
UPDATE sessao_login SET expira_em = NOW() - INTERVAL '1 minute' WHERE token_hash = repeat('a', 64);
SELECT c.login, j.nome, c.administrador
FROM sessao_login s JOIN conta c USING (id_conta) JOIN jogador j USING (id_jogador)
WHERE s.token_hash = repeat('a', 64) AND s.expira_em > NOW();
-- Resultado esperado (sessão vencida):
--  login | nome | administrador
-- -------+------+---------------
-- (0 linhas)

-- RA10: ranking, da maior soma de pontos para a menor (desempate por nome e depois por identificador).
-- API equivalente: GET /api/ranking (a API também devolve id_jogador, omitido aqui porque muda a cada execução)
SELECT j.nome, SUM(p.pontos)::int AS pontos, COUNT(p.id_pontuacao)::int AS partidas
FROM jogador j JOIN quiz q USING (id_jogador) JOIN pontuacao p USING (id_quiz)
GROUP BY j.id_jogador, j.nome
ORDER BY pontos DESC, j.nome, j.id_jogador;
-- Resultado esperado (em banco recém-carregado):
--          nome        | pontos | partidas
-- ---------------------+--------+----------
--  Jogador de teste 06 |   4000 |        2
-- (1 linha)
ROLLBACK TO ra;

-- Fim: descarta os dados de apoio. O banco volta ao estado anterior.
ROLLBACK;
