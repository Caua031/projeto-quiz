-- 05-dml-consultas.sql — Tech Trivia: 180 perguntas originais de Certo ou Errado.
-- 30 por categoria: 10 fáceis, 10 médias e 10 difíceis (classificação pedagógica sugerida).
-- Códigos reservados desta carga: tt-es/mw/ph/pd/rw/rd-001 a 030.
-- Mantém as primeiras 60 e adiciona 120; códigos 001–010 não mudam de dificuldade ou gabarito.
-- Execute no banco tech_trivia, depois de 04-ddl.sql (ou em banco existente compatível).
-- Exemplo: psql -U postgres -d tech_trivia -v ON_ERROR_STOP=1 -f 05-dml-consultas.sql
-- Pode executar novamente: não sobrescreve perguntas, alternativas ou fontes existentes.
-- IDs artificiais são gerados pelo banco; vínculos são localizados pelos nomes, não por IDs fixos.
-- Não altera contas, sessões, tentativas nem pontuações. Fontes consultadas em 22/10/2026.

SET client_encoding = 'UTF8';
BEGIN;
SELECT pg_advisory_xact_lock(738201);

INSERT INTO dificuldade(descricao) VALUES ('Fácil'), ('Médio'), ('Difícil')
ON CONFLICT (descricao) DO NOTHING;
INSERT INTO idioma(descricao) VALUES ('Português'), ('Inglês')
ON CONFLICT (descricao) DO NOTHING;

INSERT INTO categoria(nome) VALUES
  ('engenharia social'),
  ('malware'),
  ('phishing'),
  ('proteção de dados'),
  ('ransomware'),
  ('redes')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO publicador(nome) VALUES
  ('ACSC'),
  ('CERT.br'),
  ('NIC.br'),
  ('FBI'),
  ('FTC'),
  ('Microsoft'),
  ('NCSC'),
  ('Mozilla'),
  ('Google'),
  ('Cloudflare'),
  ('Cisco')
ON CONFLICT (nome) DO NOTHING;

CREATE TEMP TABLE tt_carga_fontes (
  chave text PRIMARY KEY, titulo text NOT NULL, url text NOT NULL,
  publicador text NOT NULL, idioma text NOT NULL
) ON COMMIT DROP;
INSERT INTO tt_carga_fontes(chave,titulo,url,publicador,idioma) VALUES
  ('social', 'Detecting socially engineered messages', 'https://www.cyber.gov.au/publication/detecting-socially-engineered-messages', 'ACSC', 'Inglês'),
  ('banco', 'Banco via Internet — Cartilha de Segurança para Internet', 'https://cartilha.cert.br/fasciculos/banco-via-internet/fasciculo-banco-via-internet.pdf', 'CERT.br', 'Português'),
  ('malware', 'Códigos Maliciosos — Cartilha de Segurança para Internet', 'https://cartilha.cert.br/fasciculos/codigos-maliciosos/fasciculo-codigos-maliciosos.pdf', 'CERT.br', 'Português'),
  ('atualizar', 'Mantenha os programas atualizados — Cidadão na Rede', 'https://cidadaonarede.nic.br/pt/videos/mantenha-os-programas-atualizados', 'NIC.br', 'Português'),
  ('apps', 'Cuidado com aplicativos falsos — Cidadão na Rede', 'https://cidadaonarede.nic.br/pt/videos/cuidado-com-aplicativos-falsos', 'NIC.br', 'Português'),
  ('permissoes', 'Permissões de aplicativos — Cidadão na Rede', 'https://cidadaonarede.nic.br/pt/videos/permissoes-de-aplicativos', 'NIC.br', 'Português'),
  ('phishing', 'Spoofing and Phishing', 'https://www.fbi.gov/how-we-can-help-you/common-frauds-and-scams/spoofing-and-phishing', 'FBI', 'Inglês'),
  ('fraudes', 'Golpes: Evite Fraudes — Cartilha de Segurança para Internet', 'https://cartilha.cert.br/fasciculos/golpes-evite-fraudes/fasciculo-golpes-evite-fraudes.pdf', 'CERT.br', 'Português'),
  ('dados', 'Proteção de Dados — Cartilha de Segurança para Internet', 'https://cartilha.cert.br/fasciculos/protecao-de-dados/fasciculo-protecao-de-dados.pdf', 'CERT.br', 'Português'),
  ('privacidade', 'Privacidade — Cartilha de Segurança para Internet', 'https://cartilha.cert.br/fasciculos/privacidade/fasciculo-privacidade.pdf', 'CERT.br', 'Português'),
  ('ransomware', 'Ransomware — Cartilha de Segurança para Internet', 'https://cartilha.cert.br/ransomware/', 'CERT.br', 'Português'),
  ('backup', 'Backup — Cartilha de Segurança para Internet', 'https://cartilha.cert.br/fasciculos/backup/fasciculo-backup.pdf', 'CERT.br', 'Português'),
  ('redes', 'Redes — Cartilha de Segurança para Internet', 'https://cartilha.cert.br/fasciculos/redes/fasciculo-redes-alta.pdf', 'CERT.br', 'Português'),
  ('remoto', 'Trabalho Remoto — Cartilha de Segurança para Internet', 'https://cartilha.cert.br/fasciculos/trabalho-remoto/fasciculo-trabalho-remoto.pdf', 'CERT.br', 'Português'),
  ('tarefas', 'Task scams create the illusion of making money', 'https://consumer.ftc.gov/consumer-alerts/2024/11/task-scams-create-illusion-making-money', 'FTC', 'Inglês'),
  ('suporte', 'How To Spot, Avoid, and Report Tech Support Scams', 'https://consumer.ftc.gov/articles/how-spot-avoid-and-report-tech-support-scams', 'FTC', 'Inglês'),
  ('romance', 'What To Know About Romance Scams', 'https://consumer.ftc.gov/articles/what-know-about-romance-scams', 'FTC', 'Inglês'),
  ('bec', 'Business Email Compromise', 'https://www.fbi.gov/how-we-can-help-you/common-frauds-and-scams/business-email-compromise', 'FBI', 'Inglês'),
  ('malware-ftc', 'Malware: How To Protect Against, Detect, and Remove It', 'https://consumer.ftc.gov/articles/malware-how-protect-against-detect-and-remove-it', 'FTC', 'Inglês'),
  ('macros', 'Macros from the internet are blocked by default in Office', 'https://learn.microsoft.com/en-us/microsoft-365-apps/security/internet-macros-blocked', 'Microsoft', 'Inglês'),
  ('pua', 'Protect your PC from potentially unwanted applications', 'https://support.microsoft.com/en-us/security/protect-your-pc-from-potentially-unwanted-applications', 'Microsoft', 'Inglês'),
  ('offline', 'Microsoft Defender Offline scan in Windows', 'https://learn.microsoft.com/en-us/defender-endpoint/microsoft-defender-offline', 'Microsoft', 'Inglês'),
  ('phishing-ftc', 'How To Recognize and Avoid Phishing Scams', 'https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams', 'FTC', 'Inglês'),
  ('sms-ftc', 'How to Recognize and Report Spam Text Messages', 'https://consumer.ftc.gov/articles/how-recognize-and-report-spam-text-messages', 'FTC', 'Inglês'),
  ('phishing-ms', 'How to protect against phishing attacks', 'https://learn.microsoft.com/en-us/defender-endpoint/malware/phishing', 'Microsoft', 'Inglês'),
  ('phishing-ncsc', 'Phishing attacks: defending your organisation', 'https://www.ncsc.gov.uk/guidance/phishing', 'NCSC', 'Inglês'),
  ('cookies', 'Cookies — Information that websites store on your computer', 'https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer', 'Mozilla', 'Inglês'),
  ('privado', 'Private Browsing — Use Firefox without saving history', 'https://support.mozilla.org/en-US/kb/private-browsing-use-firefox-without-history', 'Mozilla', 'Inglês'),
  ('drive', 'Share and manage access to files and folders in Google Drive', 'https://support.google.com/drive/answer/7166529?hl=en', 'Google', 'Inglês'),
  ('descarte', 'How To Remove Your Personal Information Before You Get Rid of Your Computer', 'https://consumer.ftc.gov/articles/how-remove-your-personal-information-you-get-rid-your-computer', 'FTC', 'Inglês'),
  ('rw-entender', 'Ransomware: Como Acontece', 'https://cert.br/docs/ransomware/entender/', 'CERT.br', 'Português'),
  ('rw-proteger', 'Ransomware: Como se Proteger', 'https://cert.br/docs/ransomware/proteger/', 'CERT.br', 'Português'),
  ('rw-detectar', 'Ransomware: Como Detectar', 'https://cert.br/docs/ransomware/detectar/', 'CERT.br', 'Português'),
  ('rw-responder', 'Ransomware: Como Responder', 'https://cert.br/docs/ransomware/responder/', 'CERT.br', 'Português'),
  ('dns', 'What is DNS? — Cloudflare Learning Paths', 'https://developers.cloudflare.com/learning-paths/cybersafe/concepts/what-is-dns/', 'Cloudflare', 'Inglês'),
  ('https', 'What is HTTPS?', 'https://www.cloudflare.com/learning/ssl/what-is-https/', 'Cloudflare', 'Inglês'),
  ('firewall-ms', 'Firewall and network protection in the Windows Security app', 'https://support.microsoft.com/en-us/windows/security/windows-security/firewall-and-network-protection-in-the-windows-security-app', 'Microsoft', 'Inglês'),
  ('switch', 'What Is Network Switching?', 'https://www.cisco.com/site/us/en/learn/topics/networking/what-is-network-switching.html', 'Cisco', 'Inglês');

INSERT INTO fonte(url,titulo,id_publicador,id_idioma)
SELECT cf.url,cf.titulo,pu.id_publicador,i.id_idioma
FROM tt_carga_fontes cf
JOIN publicador pu ON pu.nome=cf.publicador
JOIN idioma i ON i.descricao=cf.idioma
ON CONFLICT (url) DO NOTHING;

CREATE TEMP TABLE tt_carga_perguntas (
  codigo text PRIMARY KEY, categoria text NOT NULL, dificuldade text NOT NULL,
  titulo text NOT NULL, enunciado text NOT NULL, explicacao text NOT NULL,
  certo boolean NOT NULL, fonte text NOT NULL, palavras text[] NOT NULL
) ON COMMIT DROP;
INSERT INTO tt_carga_perguntas(codigo,categoria,dificuldade,titulo,enunciado,explicacao,certo,fonte,palavras) VALUES
  ('tt-es-001', 'engenharia social', 'Fácil', 'Manipulação da confiança', 'A engenharia social pode manipular pessoas para obter informações ou provocar ações inseguras.', 'O alvo pode ser a decisão da pessoa, sem depender de uma falha técnica no computador.', TRUE, 'social', ARRAY['manipulação', 'confiança']::text[]),
  ('tt-es-002', 'engenharia social', 'Fácil', 'Aparência de autoridade', 'Uma mensagem assinada por um suposto diretor é prova suficiente de que a ordem é legítima.', 'Golpistas podem imitar cargos de autoridade para convencer funcionários a obedecer sem verificar.', FALSE, 'social', ARRAY['autoridade', 'verificação']::text[]),
  ('tt-es-003', 'engenharia social', 'Fácil', 'Pressão por urgência', 'Pedidos urgentes e inesperados merecem confirmação por um canal confiável antes de serem atendidos.', 'A pressa pode dificultar a avaliação; uma confirmação independente ajuda a identificar pedidos falsos.', TRUE, 'social', ARRAY['urgência', 'verificação']::text[]),
  ('tt-es-004', 'engenharia social', 'Fácil', 'Canais de abordagem', 'Mensagens de engenharia social só podem chegar por e-mail.', 'Também podem chegar por SMS, aplicativos de conversa e mensagens em redes sociais.', FALSE, 'social', ARRAY['mensagens', 'golpe']::text[]),
  ('tt-es-005', 'engenharia social', 'Médio', 'Contato aparentemente conhecido', 'Reconhecer o nome de um colega em uma mensagem elimina a necessidade de conferir um pedido incomum.', 'A identidade aparente pode ser falsificada; pedidos fora do habitual devem ser verificados.', FALSE, 'social', ARRAY['identidade', 'confiança']::text[]),
  ('tt-es-006', 'engenharia social', 'Médio', 'Senha pedida por telefone', 'Quem liga dizendo ser do banco deve receber sua senha para confirmar sua identidade.', 'Encerre pedidos suspeitos de senha e procure a instituição pelos canais oficiais.', FALSE, 'banco', ARRAY['senha', 'telefone']::text[]),
  ('tt-es-007', 'engenharia social', 'Médio', 'Confirmação pelo canal oficial', 'Ao receber uma ligação suspeita, buscar o contato oficial do banco ajuda a verificar o pedido.', 'A consulta independente evita confiar apenas no canal escolhido pela pessoa que ligou.', TRUE, 'banco', ARRAY['telefone', 'verificação']::text[]),
  ('tt-es-008', 'engenharia social', 'Difícil', 'Dados usados como prova', 'Uma pessoa que sabe seus dados bancários está automaticamente autorizada a pedir seu token.', 'Conhecer informações não comprova autorização; tokens e códigos não devem ser entregues a contatos inesperados.', FALSE, 'banco', ARRAY['token', 'identidade']::text[]),
  ('tt-es-009', 'engenharia social', 'Difícil', 'Exposição financeira', 'Publicar informações financeiras pode facilitar abordagens fraudulentas contra você.', 'Dados expostos podem ser aproveitados por golpistas para tornar uma história mais convincente.', TRUE, 'banco', ARRAY['exposição', 'golpe']::text[]),
  ('tt-es-010', 'engenharia social', 'Difícil', 'Aplicativo indicado por estranho', 'Um aplicativo falso indicado por um contato pode permitir acesso remoto indevido ao aparelho.', 'Confira o aplicativo e seu desenvolvedor nos canais oficiais antes de instalar.', TRUE, 'banco', ARRAY['aplicativo falso', 'acesso remoto']::text[]),
  ('tt-es-011', 'engenharia social', 'Fácil', 'Depósito para trabalhar', 'Uma oferta que exige depósito para liberar comissões pode ser um golpe de tarefas.', 'Não pague para receber rendimentos prometidos por uma plataforma desconhecida.', TRUE, 'tarefas', ARRAY['golpe de tarefas', 'pagamento']::text[]),
  ('tt-es-012', 'engenharia social', 'Fácil', 'Saldo sem saque', 'Um saldo mostrado em um aplicativo desconhecido comprova que o dinheiro já pertence ao trabalhador.', 'A plataforma pode exibir valores fictícios para induzir novos depósitos.', FALSE, 'tarefas', ARRAY['saldo falso', 'trabalho']::text[]),
  ('tt-es-013', 'engenharia social', 'Fácil', 'Convite para curtir vídeos', 'Convites inesperados para ganhar muito dinheiro curtindo vídeos merecem desconfiança.', 'Tarefas simples e promessas de comissão são usadas como isca.', TRUE, 'tarefas', ARRAY['trabalho', 'mensagem']::text[]),
  ('tt-es-014', 'engenharia social', 'Fácil', 'Criptomoeda para receber salário', 'Enviar criptomoedas para desbloquear um suposto salário é uma exigência normal de emprego.', 'Cobrar para liberar ganhos é um sinal de fraude.', FALSE, 'tarefas', ARRAY['criptomoeda', 'emprego falso']::text[]),
  ('tt-es-015', 'engenharia social', 'Fácil', 'Pequeno pagamento inicial', 'Um pequeno pagamento inicial garante que uma oferta de tarefas nunca será fraudulenta.', 'Golpistas podem pagar inicialmente para conquistar confiança antes de pedir valores maiores.', FALSE, 'tarefas', ARRAY['confiança', 'comissão']::text[]),
  ('tt-es-016', 'engenharia social', 'Fácil', 'Alerta com telefone', 'Um aviso na tela mandando ligar para um suporte não comprova que o computador está infectado.', 'Alertas falsos podem assustar a vítima e levá-la a telefonar para golpistas.', TRUE, 'suporte', ARRAY['suporte falso', 'pop-up']::text[]),
  ('tt-es-017', 'engenharia social', 'Médio', 'Ligação de suporte não solicitada', 'Uma ligação inesperada de suposto suporte autoriza conceder controle remoto do computador.', 'Confirme o atendimento por um canal oficial antes de permitir acesso.', FALSE, 'suporte', ARRAY['acesso remoto', 'suporte falso']::text[]),
  ('tt-es-018', 'engenharia social', 'Médio', 'Número no aviso de vírus', 'O telefone exibido em um pop-up de vírus deve ser verificado por uma fonte independente.', 'O próprio aviso pode ter sido criado para direcionar a um atendimento falso.', TRUE, 'suporte', ARRAY['verificação', 'pop-up']::text[]),
  ('tt-es-019', 'engenharia social', 'Médio', 'Logotipo em alerta', 'O logotipo de uma empresa conhecida torna verdadeiro qualquer alerta de suporte.', 'Marcas podem ser copiadas para aumentar a credibilidade de mensagens fraudulentas.', FALSE, 'suporte', ARRAY['logotipo', 'suporte falso']::text[]),
  ('tt-es-020', 'engenharia social', 'Médio', 'Pagamento com vale-presente', 'Um suposto suporte que exige vale-presente para resolver um problema merece suspeita.', 'Esse meio de pagamento aparece em golpes de suporte técnico.', TRUE, 'suporte', ARRAY['vale-presente', 'fraude']::text[]),
  ('tt-es-021', 'engenharia social', 'Médio', 'Emergência de namoro virtual', 'Um pedido de dinheiro por um namoro virtual pode explorar uma emergência inventada.', 'Histórias urgentes podem ser usadas depois de construir um vínculo de confiança.', TRUE, 'romance', ARRAY['golpe afetivo', 'emergência']::text[]),
  ('tt-es-022', 'engenharia social', 'Médio', 'Fotografia como garantia', 'Uma fotografia atraente no perfil garante a identidade de um contato amoroso.', 'Imagens e perfis falsos podem sustentar uma identidade inventada.', FALSE, 'romance', ARRAY['perfil falso', 'fotografia']::text[]),
  ('tt-es-023', 'engenharia social', 'Médio', 'Dinheiro para passagem', 'Prometer uma visita e pedir dinheiro para a passagem pode fazer parte de um golpe afetivo.', 'Despesas de viagem são uma das histórias usadas para obter dinheiro.', TRUE, 'romance', ARRAY['passagem', 'golpe afetivo']::text[]),
  ('tt-es-024', 'engenharia social', 'Difícil', 'Relacionamento e investimento', 'Uma indicação de investimento por um namoro exclusivamente virtual dispensa avaliação independente.', 'Golpes afetivos também podem conduzir a investimentos fraudulentos.', FALSE, 'romance', ARRAY['investimento', 'golpe afetivo']::text[]),
  ('tt-es-025', 'engenharia social', 'Difícil', 'Pesquisa da foto do perfil', 'Encontrar a foto de um contato associada a identidades diferentes é um sinal de alerta.', 'A pesquisa reversa da imagem pode revelar reutilização de fotos.', TRUE, 'romance', ARRAY['pesquisa reversa', 'identidade']::text[]),
  ('tt-es-026', 'engenharia social', 'Difícil', 'Troca de conta do fornecedor', 'Uma mudança de conta bancária em uma cobrança deve ser confirmada por contato previamente conhecido.', 'Uma mensagem adulterada pode redirecionar um pagamento legítimo ao fraudador.', TRUE, 'bec', ARRAY['fornecedor', 'pagamento']::text[]),
  ('tt-es-027', 'engenharia social', 'Difícil', 'Conversa corporativa invadida', 'Um pedido dentro de uma conversa antiga de e-mail está protegido contra fraudes de pagamento.', 'Uma conta comprometida pode permitir ao atacante participar de conversas reais.', FALSE, 'bec', ARRAY['e-mail corporativo', 'conta invadida']::text[]),
  ('tt-es-028', 'engenharia social', 'Difícil', 'Aprovação financeira apressada', 'A ordem urgente de um suposto executivo deve dispensar os procedimentos de conferência de pagamento.', 'Imitar um executivo é uma técnica usada em fraudes de e-mail corporativo.', FALSE, 'bec', ARRAY['executivo', 'conferência']::text[]),
  ('tt-es-029', 'engenharia social', 'Difícil', 'Telefone alterado na cobrança', 'Confirmar uma cobrança apenas pelo novo telefone informado no mesmo e-mail pode manter o contato com o golpista.', 'Busque um contato confiável obtido independentemente da mensagem suspeita.', TRUE, 'bec', ARRAY['cobrança', 'canal independente']::text[]),
  ('tt-es-030', 'engenharia social', 'Difícil', 'Fraude de e-mail sem vírus', 'Fraudes de e-mail corporativo exigem necessariamente instalar um vírus no computador da vítima.', 'A falsificação de identidade e a manipulação de pagamentos podem ser suficientes.', FALSE, 'bec', ARRAY['bec', 'engenharia social']::text[]),
  ('tt-mw-001', 'malware', 'Fácil', 'Conceito de malware', 'Malware é um termo que abrange diferentes tipos de programas maliciosos.', 'Vírus, trojans e spyware são exemplos; malware não é sinônimo exclusivo de vírus.', TRUE, 'malware', ARRAY['malware', 'vírus']::text[]),
  ('tt-mw-002', 'malware', 'Fácil', 'Propagação de worms', 'Um worm sempre depende de ser anexado manualmente a outro programa para se espalhar.', 'Worms podem se propagar automaticamente entre dispositivos pela rede, explorando vulnerabilidades.', FALSE, 'malware', ARRAY['worm', 'vulnerabilidade']::text[]),
  ('tt-mw-003', 'malware', 'Fácil', 'Espionagem por spyware', 'Um spyware pode coletar informações do usuário sem sua autorização.', 'Esse tipo de código malicioso pode monitorar atividades e capturar informações pessoais.', TRUE, 'malware', ARRAY['spyware', 'espionagem']::text[]),
  ('tt-mw-004', 'malware', 'Fácil', 'Limites do antivírus', 'Ter um antivírus instalado garante proteção contra qualquer código malicioso.', 'Antimalware ajuda na proteção, mas precisa de atualizações e não elimina todos os riscos.', FALSE, 'malware', ARRAY['antivírus', 'prevenção']::text[]),
  ('tt-mw-005', 'malware', 'Médio', 'Disfarce do trojan', 'Um trojan pode parecer um programa útil enquanto executa ações maliciosas.', 'O disfarce induz a instalação; o comportamento real pode comprometer dados ou o dispositivo.', TRUE, 'malware', ARRAY['trojan', 'programa falso']::text[]),
  ('tt-mw-006', 'malware', 'Médio', 'Correções de segurança', 'Atualizar programas pode corrigir falhas exploradas para instalar malware.', 'Correções reduzem a exposição a vulnerabilidades conhecidas dos programas.', TRUE, 'atualizar', ARRAY['atualização', 'vulnerabilidade']::text[]),
  ('tt-mw-007', 'malware', 'Médio', 'Finalidade das atualizações', 'Atualizações de programas servem apenas para mudar a aparência da interface.', 'Elas também corrigem problemas de funcionamento e falhas de segurança.', FALSE, 'atualizar', ARRAY['atualização', 'segurança']::text[]),
  ('tt-mw-008', 'malware', 'Difícil', 'Nome de aplicativo', 'Um aplicativo com o nome de um serviço famoso é necessariamente o aplicativo verdadeiro.', 'Aplicativos falsos podem imitar serviços conhecidos; confira a origem e o desenvolvedor.', FALSE, 'apps', ARRAY['aplicativo falso', 'verificação']::text[]),
  ('tt-mw-009', 'malware', 'Difícil', 'Origem da instalação', 'Conferir a origem e o desenvolvedor ajuda a reduzir o risco de instalar aplicativos falsos.', 'A aparência e o nome, sozinhos, não demonstram a legitimidade de um aplicativo.', TRUE, 'apps', ARRAY['instalação', 'desenvolvedor']::text[]),
  ('tt-mw-010', 'malware', 'Difícil', 'Permissões incompatíveis', 'Uma permissão sem relação com a função de um aplicativo merece ser questionada antes de ser concedida.', 'Autorize somente acessos coerentes com a finalidade do aplicativo, reduzindo exposição desnecessária.', TRUE, 'permissoes', ARRAY['permissão', 'aplicativo']::text[]),
  ('tt-mw-011', 'malware', 'Fácil', 'Celular também é alvo', 'Celulares e tablets também podem ser alvos de programas maliciosos.', 'Malware não se limita a computadores de mesa.', TRUE, 'malware-ftc', ARRAY['celular', 'malware']::text[]),
  ('tt-mw-012', 'malware', 'Fácil', 'Lentidão como diagnóstico', 'Um computador lento comprova sozinho que existe uma infecção por malware.', 'Lentidão pode ser um sinal, mas exige investigação e pode ter outras causas.', FALSE, 'malware-ftc', ARRAY['lentidão', 'diagnóstico']::text[]),
  ('tt-mw-013', 'malware', 'Fácil', 'Pacote de programas grátis', 'Baixar programas gratuitos de origem desconhecida pode expor o aparelho a software indesejado.', 'Downloads sem origem confiável podem incluir conteúdo malicioso.', TRUE, 'malware-ftc', ARRAY['download', 'origem']::text[]),
  ('tt-mw-014', 'malware', 'Fácil', 'Ferramenta anunciada em pop-up', 'O melhor lugar para obter uma ferramenta de segurança é qualquer pop-up que ofereça uma limpeza.', 'Anúncios enganosos podem distribuir programas nocivos.', FALSE, 'malware-ftc', ARRAY['limpeza falsa', 'download']::text[]),
  ('tt-mw-015', 'malware', 'Fácil', 'Investigação de infecção', 'Diante de sinais de infecção, uma verificação com ferramenta confiável pode ajudar na investigação.', 'Examine o dispositivo e siga as ações indicadas pela ferramenta.', TRUE, 'malware-ftc', ARRAY['verificação', 'infecção']::text[]),
  ('tt-mw-016', 'malware', 'Fácil', 'Código em macro', 'Uma macro de um documento pode executar código no computador.', 'Macros automatizam tarefas e também podem ser usadas de forma maliciosa.', TRUE, 'macros', ARRAY['macro', 'documento']::text[]),
  ('tt-mw-017', 'malware', 'Médio', 'Macro não é só aparência', 'Habilitar macros em um anexo altera apenas a aparência do texto, sem executar instruções.', 'Uma macro pode executar ações além da exibição do documento.', FALSE, 'macros', ARRAY['macro', 'anexo']::text[]),
  ('tt-mw-018', 'malware', 'Médio', 'Pedido para habilitar conteúdo', 'Um anexo inesperado que exige habilitar macros merece confirmação antes de qualquer liberação.', 'A solicitação pode tentar contornar uma proteção contra código malicioso.', TRUE, 'macros', ARRAY['habilitar conteúdo', 'proteção']::text[]),
  ('tt-mw-019', 'malware', 'Médio', 'Bloqueio de macro e licença', 'O bloqueio de macros em um arquivo da Internet prova que a licença do Office está inválida.', 'Esse bloqueio pode ser uma medida de segurança relacionada à origem do arquivo.', FALSE, 'macros', ARRAY['office', 'bloqueio']::text[]),
  ('tt-mw-020', 'malware', 'Médio', 'Local confiável', 'Colocar um arquivo em um local configurado como confiável pode influenciar a execução de macros.', 'Exceções de confiança devem ser administradas com cuidado.', TRUE, 'macros', ARRAY['local confiável', 'política']::text[]),
  ('tt-mw-021', 'malware', 'Médio', 'Publicidade indesejada', 'Aplicativos potencialmente indesejados podem mostrar anúncios inesperados e reduzir o desempenho.', 'Essa categoria de software pode causar transtornos mesmo sem ser classificada como vírus.', TRUE, 'pua', ARRAY['pua', 'anúncio']::text[]),
  ('tt-mw-022', 'malware', 'Médio', 'PUA e vírus', 'Toda detecção de aplicativo potencialmente indesejado significa necessariamente um vírus tradicional.', 'A categoria inclui comportamentos indesejados que não são equivalentes a vírus.', FALSE, 'pua', ARRAY['pua', 'classificação']::text[]),
  ('tt-mw-023', 'malware', 'Médio', 'Bloquear aplicativos', 'Uma proteção contra aplicativos indesejados pode verificar software já baixado ou instalado.', 'O bloqueio não precisa se limitar ao momento do download.', TRUE, 'pua', ARRAY['proteção', 'instalação']::text[]),
  ('tt-mw-024', 'malware', 'Difícil', 'Bloqueio e remoção', 'Uma notificação de bloqueio de PUA garante que o aplicativo já foi removido automaticamente.', 'Pode ser necessário escolher uma ação e confirmar sua execução.', FALSE, 'pua', ARRAY['pua', 'remoção']::text[]),
  ('tt-mw-025', 'malware', 'Difícil', 'Etapas de proteção de PUA', 'Bloquear downloads e bloquear aplicativos podem ser opções distintas da proteção contra PUA.', 'As opções atuam em momentos diferentes e possuem condições próprias.', TRUE, 'pua', ARRAY['download', 'proteção']::text[]),
  ('tt-mw-026', 'malware', 'Difícil', 'Verificação fora do Windows normal', 'Uma verificação offline pode executar fora do ambiente normal do Windows para examinar malware persistente.', 'Isso ajuda a analisar ameaças que tentam se ocultar no sistema em execução.', TRUE, 'offline', ARRAY['offline', 'persistência']::text[]),
  ('tt-mw-027', 'malware', 'Difícil', 'Rootkit e ambiente de análise', 'Examinar um sistema a partir de um ambiente confiável pode ajudar na detecção de certos rootkits.', 'A análise externa reduz a dependência do ambiente possivelmente comprometido.', TRUE, 'offline', ARRAY['rootkit', 'ambiente confiável']::text[]),
  ('tt-mw-028', 'malware', 'Difícil', 'Arquivos abertos antes da verificação', 'É desnecessário salvar os documentos antes de iniciar uma verificação que reiniciará o computador.', 'Salve o trabalho e feche os programas antes da reinicialização.', FALSE, 'offline', ARRAY['reinicialização', 'documento']::text[]),
  ('tt-mw-029', 'malware', 'Difícil', 'Reiniciar é limpar', 'A reinicialização exigida por uma verificação offline substitui a análise antimalware.', 'Reiniciar permite carregar o ambiente de análise; não é, por si só, a verificação.', FALSE, 'offline', ARRAY['verificação', 'reinicialização']::text[]),
  ('tt-mw-030', 'malware', 'Difícil', 'Ambiente de recuperação', 'O funcionamento de uma verificação offline pode depender da disponibilidade do ambiente de recuperação.', 'No Defender Offline, o Windows Recovery Environment precisa estar habilitado.', TRUE, 'offline', ARRAY['recuperação', 'winre']::text[]),
  ('tt-ph-001', 'phishing', 'Fácil', 'Coleta por página falsa', 'Uma mensagem pode levar a uma página falsa para capturar a senha de uma conta.', 'A página pode imitar um serviço conhecido para induzir o preenchimento de credenciais.', TRUE, 'phishing', ARRAY['phishing', 'senha']::text[]),
  ('tt-ph-002', 'phishing', 'Fácil', 'Erros de escrita', 'Toda mensagem de phishing apresenta erros de português facilmente perceptíveis.', 'Mensagens fraudulentas podem ser convincentes; boa escrita não comprova autenticidade.', FALSE, 'phishing', ARRAY['mensagem falsa', 'verificação']::text[]),
  ('tt-ph-003', 'phishing', 'Fácil', 'Phishing por SMS', 'Smishing é uma modalidade de fraude de phishing realizada por mensagens SMS.', 'O canal muda, mas o objetivo continua sendo induzir a vítima a fornecer informações ou agir.', TRUE, 'phishing', ARRAY['smishing', 'sms']::text[]),
  ('tt-ph-004', 'phishing', 'Fácil', 'Nome do remetente', 'O nome exibido no remetente comprova quem realmente enviou um e-mail.', 'Nomes e endereços podem ser imitados para dar aparência legítima à mensagem.', FALSE, 'phishing', ARRAY['remetente', 'spoofing']::text[]),
  ('tt-ph-005', 'phishing', 'Médio', 'Endereço parecido', 'Um endereço com uma pequena alteração no nome pode ser usado para imitar um site legítimo.', 'Observe o endereço completo; uma aparência semelhante pode esconder um destino diferente.', TRUE, 'phishing', ARRAY['domínio', 'url']::text[]),
  ('tt-ph-006', 'phishing', 'Médio', 'Análise do endereço', 'Conferir o endereço de um link antes de acessá-lo ajuda a identificar páginas fraudulentas.', 'Avalie o destino e procure o serviço oficial quando houver dúvida sobre o link.', TRUE, 'fraudes', ARRAY['link', 'url']::text[]),
  ('tt-ph-007', 'phishing', 'Médio', 'Código de autenticação', 'É seguro passar um código de verificação para um contato que promete proteger sua conta.', 'Códigos podem permitir acesso à conta; não os entregue a terceiros que entram em contato.', FALSE, 'fraudes', ARRAY['código de verificação', 'conta']::text[]),
  ('tt-ph-008', 'phishing', 'Difícil', 'Confirmação de identidade', 'Um contato que afirma representar uma empresa deve ser considerado verdadeiro sem conferência.', 'Verifique a identidade usando canais oficiais antes de fornecer dados ou realizar operações.', FALSE, 'fraudes', ARRAY['identidade', 'canal oficial']::text[]),
  ('tt-ph-009', 'phishing', 'Difícil', 'Conta de recuperação', 'Proteger o e-mail usado para recuperar senhas ajuda a proteger as contas vinculadas a ele.', 'Uma conta de recuperação comprometida pode facilitar o acesso indevido a outros serviços.', TRUE, 'fraudes', ARRAY['recuperação de senha', 'e-mail']::text[]),
  ('tt-ph-010', 'phishing', 'Difícil', 'Conta invadida', 'Uma conta invadida só oferece risco ao titular, sem afetar seus contatos.', 'Golpistas podem usar a conta para se passar pela vítima e enganar outras pessoas.', FALSE, 'fraudes', ARRAY['conta invadida', 'golpe']::text[]),
  ('tt-ph-011', 'phishing', 'Fácil', 'Entrega inesperada', 'Uma mensagem de entrega pode ser usada como isca mesmo quando você não fez nenhuma compra.', 'Golpistas usam situações comuns para provocar cliques e pedidos de dados.', TRUE, 'phishing-ftc', ARRAY['entrega falsa', 'mensagem']::text[]),
  ('tt-ph-012', 'phishing', 'Fácil', 'Banco desconhecido', 'Uma cobrança de um banco onde você nunca teve conta deve ser atendida imediatamente pelo link recebido.', 'A ausência de relação com a instituição é motivo para desconfiar.', FALSE, 'phishing-ftc', ARRAY['cobrança falsa', 'banco']::text[]),
  ('tt-ph-013', 'phishing', 'Fácil', 'Anexo de cobrança', 'Um anexo apresentado como cobrança pode conter uma ameaça em vez de uma fatura.', 'Mensagens fraudulentas também usam anexos para comprometer o dispositivo.', TRUE, 'phishing-ftc', ARRAY['anexo', 'fatura']::text[]),
  ('tt-ph-014', 'phishing', 'Fácil', 'Resposta com credenciais', 'Responder a um e-mail com sua senha é uma forma segura de confirmar um cadastro.', 'Uma solicitação de credenciais por mensagem pode ser uma tentativa de fraude.', FALSE, 'phishing-ftc', ARRAY['credencial', 'cadastro']::text[]),
  ('tt-ph-015', 'phishing', 'Fácil', 'Confirmação fora da mensagem', 'Se houver dúvida sobre uma mensagem, consultar o aplicativo oficial ajuda a verificar o assunto.', 'Abra o serviço de forma independente do link recebido.', TRUE, 'phishing-ftc', ARRAY['aplicativo oficial', 'verificação']::text[]),
  ('tt-ph-016', 'phishing', 'Fácil', 'Prêmio por mensagem', 'Um SMS anunciando prêmio exige desconfiança, principalmente quando pede dados ou pagamento.', 'A promessa pode servir de pretexto para obter informações da vítima.', TRUE, 'sms-ftc', ARRAY['prêmio falso', 'sms']::text[]),
  ('tt-ph-017', 'phishing', 'Médio', 'Responder a spam desconhecido', 'Responder a qualquer SMS suspeito é sempre a melhor forma de impedir novas mensagens.', 'Evite interagir com remetentes desconhecidos; utilize as opções de bloqueio e denúncia.', FALSE, 'sms-ftc', ARRAY['spam', 'bloqueio']::text[]),
  ('tt-ph-018', 'phishing', 'Médio', 'Reagendamento de entrega', 'Uma taxa de reagendamento enviada por SMS deve ser conferida no canal oficial da transportadora.', 'A cobrança pode ser apenas um pretexto para capturar dados.', TRUE, 'sms-ftc', ARRAY['transportadora', 'taxa falsa']::text[]),
  ('tt-ph-019', 'phishing', 'Médio', 'Ferramentas contra spam', 'Filtros e recursos de denúncia do celular podem ajudar a lidar com mensagens indesejadas.', 'Use os mecanismos oferecidos pelo aparelho e pelo serviço de mensagens.', TRUE, 'sms-ftc', ARRAY['filtro', 'denúncia']::text[]),
  ('tt-ph-020', 'phishing', 'Médio', 'Coleta em pesquisa de SMS', 'Uma pesquisa recebida por SMS é automaticamente segura para informar dados bancários.', 'Uma pesquisa aparente pode tentar recolher informações sensíveis.', FALSE, 'sms-ftc', ARRAY['pesquisa falsa', 'dados bancários']::text[]),
  ('tt-ph-021', 'phishing', 'Médio', 'Texto do link e destino', 'O endereço escrito no texto de um e-mail pode ser diferente do destino real do link.', 'Verifique o destino efetivo, em vez de confiar somente na legenda.', TRUE, 'phishing-ms', ARRAY['link', 'destino']::text[]),
  ('tt-ph-022', 'phishing', 'Médio', 'Segurança reduzida por mensagem', 'Pedir para desativar proteções antes de abrir um anexo pode ser um sinal de phishing.', 'A orientação pode facilitar a execução de conteúdo malicioso.', TRUE, 'phishing-ms', ARRAY['anexo', 'proteção']::text[]),
  ('tt-ph-023', 'phishing', 'Médio', 'Assinatura incompatível', 'Uma assinatura empresarial dispensa conferir se o endereço de envio corresponde à empresa.', 'A divergência entre assinatura e remetente pode indicar falsificação.', FALSE, 'phishing-ms', ARRAY['assinatura', 'remetente']::text[]),
  ('tt-ph-024', 'phishing', 'Difícil', 'Credenciais fora do destino esperado', 'Se um link de login aponta para um serviço sem relação com o remetente, deve ser tratado com cautela.', 'A diferença de destino pode revelar uma tentativa de recolher credenciais.', TRUE, 'phishing-ms', ARRAY['login', 'domínio']::text[]),
  ('tt-ph-025', 'phishing', 'Difícil', 'Avisar a equipe responsável', 'Após identificar phishing em uma conta de trabalho, basta apagar a mensagem sem avisar ninguém.', 'Notifique a equipe responsável para apoiar a resposta e proteger outros usuários.', FALSE, 'phishing-ms', ARRAY['notificação', 'trabalho']::text[]),
  ('tt-ph-026', 'phishing', 'Difícil', 'Defesa em camadas', 'Treinamento deve ser a única barreira de uma empresa contra phishing.', 'Filtros, controle de acesso e resposta complementam a conscientização.', FALSE, 'phishing-ncsc', ARRAY['defesa em camadas', 'conscientização']::text[]),
  ('tt-ph-027', 'phishing', 'Difícil', 'Mensagem não filtrada', 'Uma mensagem que passou pelo filtro de e-mail ainda pode ser fraudulenta.', 'Nenhuma camada de filtragem identifica necessariamente todas as tentativas.', TRUE, 'phishing-ncsc', ARRAY['filtro de e-mail', 'risco residual']::text[]),
  ('tt-ph-028', 'phishing', 'Difícil', 'Canal simples de reporte', 'Facilitar o relato de mensagens suspeitas pode ajudar a detectar campanhas de phishing.', 'Os relatos permitem identificar ataques e ajustar as proteções.', TRUE, 'phishing-ncsc', ARRAY['reporte', 'campanha']::text[]),
  ('tt-ph-029', 'phishing', 'Difícil', 'Resultado de simulação', 'Uma simulação de phishing sem cliques prova que a organização está imune a ataques futuros.', 'Um exercício isolado não demonstra ausência de risco em outros cenários.', FALSE, 'phishing-ncsc', ARRAY['simulação', 'avaliação']::text[]),
  ('tt-ph-030', 'phishing', 'Difícil', 'Conta após roubo de senha', 'Depois do roubo de uma senha, medidas de controle de acesso ainda podem limitar o impacto do ataque.', 'A defesa também deve reduzir danos quando uma etapa anterior falha.', TRUE, 'phishing-ncsc', ARRAY['controle de acesso', 'contenção']::text[]),
  ('tt-pd-001', 'proteção de dados', 'Fácil', 'Dados em cadastros', 'Em um cadastro, limitar os dados fornecidos ao necessário reduz a exposição de informações pessoais.', 'Evite fornecer informações opcionais sem avaliar a necessidade de compartilhá-las.', TRUE, 'dados', ARRAY['dados pessoais', 'exposição']::text[]),
  ('tt-pd-002', 'proteção de dados', 'Fácil', 'Permissões sem avaliação', 'Para proteger os dados, o melhor é aceitar todas as permissões solicitadas por um aplicativo.', 'Permissões excessivas ampliam o acesso a informações; avalie quais são necessárias.', FALSE, 'dados', ARRAY['permissão', 'privacidade']::text[]),
  ('tt-pd-003', 'proteção de dados', 'Fácil', 'Perfil conhecido', 'Um perfil com foto e nome de um conhecido garante que os dados pedidos por ele estarão protegidos.', 'Perfis falsos podem imitar conhecidos; confirme a identidade antes de compartilhar informações.', FALSE, 'dados', ARRAY['perfil falso', 'identidade']::text[]),
  ('tt-pd-004', 'proteção de dados', 'Fácil', 'Acesso pelo canal oficial', 'Conferir o canal oficial antes de informar dados ajuda a evitar sua entrega a páginas falsas.', 'Acesse o endereço conhecido do serviço em vez de confiar automaticamente em links recebidos.', TRUE, 'dados', ARRAY['dados pessoais', 'canal oficial']::text[]),
  ('tt-pd-005', 'proteção de dados', 'Médio', 'Coleta por cookies', 'Limitar cookies desnecessários pode reduzir a coleta de informações sobre a navegação.', 'Avalie as opções de privacidade e os cookies que autoriza em cada serviço.', TRUE, 'dados', ARRAY['cookies', 'rastreamento']::text[]),
  ('tt-pd-006', 'proteção de dados', 'Médio', 'Apagamento de publicação', 'Apagar uma publicação garante que nenhuma pessoa tenha guardado uma cópia dela.', 'O conteúdo pode ter sido copiado ou compartilhado antes da exclusão.', FALSE, 'privacidade', ARRAY['publicação', 'compartilhamento']::text[]),
  ('tt-pd-007', 'proteção de dados', 'Médio', 'Configuração padrão', 'Revisar as configurações de privacidade ajuda a adequar o compartilhamento de informações às suas escolhas.', 'As opções iniciais de um serviço podem permitir mais exposição do que você deseja.', TRUE, 'privacidade', ARRAY['configuração', 'privacidade']::text[]),
  ('tt-pd-008', 'proteção de dados', 'Difícil', 'Importância da privacidade', 'Quem não tem nada a esconder pode ignorar os riscos da coleta excessiva de dados.', 'A coleta e a exposição podem facilitar manipulação e outros abusos, mesmo sem conteúdo secreto.', FALSE, 'privacidade', ARRAY['coleta de dados', 'exposição']::text[]),
  ('tt-pd-009', 'proteção de dados', 'Difícil', 'Finalidade da permissão', 'O acesso de um aplicativo à câmera ou localização deve ser compatível com sua finalidade.', 'Permissões sem justificativa podem comprometer a privacidade e devem ser avaliadas.', TRUE, 'privacidade', ARRAY['localização', 'permissão']::text[]),
  ('tt-pd-010', 'proteção de dados', 'Difícil', 'Privacidade alheia', 'Publicar informações de outras pessoas dispensa qualquer cuidado porque os dados não são seus.', 'O compartilhamento pode expor terceiros; respeite também a privacidade de outras pessoas.', FALSE, 'privacidade', ARRAY['privacidade', 'terceiros']::text[]),
  ('tt-pd-011', 'proteção de dados', 'Fácil', 'Preferência de idioma', 'Um cookie pode guardar a preferência de idioma de um site.', 'Cookies podem manter configurações para visitas posteriores.', TRUE, 'cookies', ARRAY['cookie', 'preferência']::text[]),
  ('tt-pd-012', 'proteção de dados', 'Fácil', 'Cookie não é necessariamente vírus', 'Todo cookie armazenado pelo navegador é um vírus instalado no computador.', 'Cookies são informações usadas por sites e também possuem finalidades legítimas.', FALSE, 'cookies', ARRAY['cookie', 'navegador']::text[]),
  ('tt-pd-013', 'proteção de dados', 'Fácil', 'Estado de login', 'Cookies podem ajudar um site a reconhecer que o usuário já entrou na conta.', 'O navegador devolve informações ao site para manter o estado do acesso.', TRUE, 'cookies', ARRAY['cookie', 'login']::text[]),
  ('tt-pd-014', 'proteção de dados', 'Fácil', 'Leitura livre de arquivos', 'Um cookie permite que qualquer site leia livremente todos os arquivos do computador.', 'Armazenar cookies não concede esse acesso geral aos arquivos locais.', FALSE, 'cookies', ARRAY['cookie', 'arquivo local']::text[]),
  ('tt-pd-015', 'proteção de dados', 'Fácil', 'Gerenciar cookies', 'O navegador oferece configurações para gerenciar o armazenamento de cookies.', 'É possível revisar as opções de privacidade e os dados mantidos pelos sites.', TRUE, 'cookies', ARRAY['navegador', 'configuração']::text[]),
  ('tt-pd-016', 'proteção de dados', 'Fácil', 'Anonimato na janela privada', 'Usar uma janela privada torna a pessoa invisível para todos os sites e para o provedor.', 'O modo privado limita registros locais, mas não garante anonimato na Internet.', FALSE, 'privado', ARRAY['navegação privada', 'anonimato']::text[]),
  ('tt-pd-017', 'proteção de dados', 'Médio', 'Arquivo baixado em janela privada', 'Arquivos baixados em uma janela privada podem continuar no computador após o fechamento.', 'O encerramento da navegação não apaga automaticamente os arquivos salvos.', TRUE, 'privado', ARRAY['download', 'navegação privada']::text[]),
  ('tt-pd-018', 'proteção de dados', 'Médio', 'Favorito em janela privada', 'Um favorito criado durante a navegação privada precisa desaparecer ao fechar a janela.', 'Favoritos salvos podem permanecer disponíveis após a sessão privada.', FALSE, 'privado', ARRAY['favorito', 'navegação privada']::text[]),
  ('tt-pd-019', 'proteção de dados', 'Médio', 'Espionagem local e modo privado', 'A navegação privada impede qualquer spyware instalado no computador de registrar atividades.', 'O modo privado não substitui a proteção do próprio dispositivo.', FALSE, 'privado', ARRAY['spyware', 'navegação privada']::text[]),
  ('tt-pd-020', 'proteção de dados', 'Médio', 'Visibilidade do provedor', 'O provedor de Internet ainda pode observar informações de conexão durante a navegação privada.', 'Evitar histórico local não elimina a visibilidade dos participantes da conexão.', TRUE, 'privado', ARRAY['provedor', 'privacidade']::text[]),
  ('tt-pd-021', 'proteção de dados', 'Médio', 'Papel de leitor', 'No Google Drive, conceder acesso de leitor não equivale a permitir editar o conteúdo.', 'Leitor e editor têm permissões distintas.', TRUE, 'drive', ARRAY['compartilhamento', 'leitor']::text[]),
  ('tt-pd-022', 'proteção de dados', 'Médio', 'Link encaminhado', 'Um arquivo disponível para qualquer pessoa com o link pode ser acessado por quem receber esse link encaminhado.', 'Esse compartilhamento é mais amplo que liberar apenas pessoas específicas.', TRUE, 'drive', ARRAY['link compartilhado', 'acesso']::text[]),
  ('tt-pd-023', 'proteção de dados', 'Médio', 'Acesso restrito', 'Marcar um arquivo como restrito significa liberá-lo automaticamente para toda a Internet.', 'O acesso restrito depende das permissões concedidas.', FALSE, 'drive', ARRAY['acesso restrito', 'permissão']::text[]),
  ('tt-pd-024', 'proteção de dados', 'Difícil', 'Permissão herdada da pasta', 'Ao revisar o acesso a um arquivo no Drive, é importante considerar as permissões da pasta em que ele está.', 'Permissões herdadas podem ampliar o acesso ao conteúdo.', TRUE, 'drive', ARRAY['herança', 'compartilhamento']::text[]),
  ('tt-pd-025', 'proteção de dados', 'Difícil', 'Editor e menor privilégio', 'Quem só precisa ler um arquivo deve receber acesso de editor para aumentar a proteção dos dados.', 'Conceda o acesso necessário, evitando poderes de alteração sem necessidade.', FALSE, 'drive', ARRAY['editor', 'menor privilégio']::text[]),
  ('tt-pd-026', 'proteção de dados', 'Difícil', 'Backup antes do descarte', 'Antes de apagar os dados de um computador que será doado, é prudente copiar o que precisa ser preservado.', 'O apagamento deve ocorrer depois de assegurar as informações importantes.', TRUE, 'descarte', ARRAY['descarte', 'backup']::text[]),
  ('tt-pd-027', 'proteção de dados', 'Difícil', 'Doação com dados', 'Doar um computador dispensa apagar os dados porque o próximo dono não conhece sua senha.', 'Remova as informações pessoais antes de transferir o equipamento.', FALSE, 'descarte', ARRAY['doação', 'dados pessoais']::text[]),
  ('tt-pd-028', 'proteção de dados', 'Difícil', 'Restaurar antes da venda', 'Os recursos de apagamento e restauração do sistema podem ajudar a preparar um computador para transferência.', 'Siga o procedimento adequado do fabricante para remover o conteúdo do armazenamento.', TRUE, 'descarte', ARRAY['restauração', 'venda']::text[]),
  ('tt-pd-029', 'proteção de dados', 'Difícil', 'Arquivos preservados e apagamento', 'Concluir uma cópia de segurança substitui o apagamento dos dados do computador que será vendido.', 'Fazer backup e remover os dados do equipamento são etapas diferentes.', FALSE, 'descarte', ARRAY['backup', 'apagamento']::text[]),
  ('tt-pd-030', 'proteção de dados', 'Difícil', 'Informações fora dos documentos', 'Somente documentos de trabalho precisam ser considerados ao remover dados de um computador antigo.', 'Mensagens, fotografias e informações financeiras também podem conter dados pessoais.', FALSE, 'descarte', ARRAY['descarte', 'informações pessoais']::text[]),
  ('tt-rw-001', 'ransomware', 'Fácil', 'Resgate por arquivos', 'Um ransomware pode tornar arquivos inacessíveis e exigir pagamento para restabelecer o acesso.', 'A criptografia dos arquivos é uma forma frequente de impedir seu uso e exigir resgate.', TRUE, 'ransomware', ARRAY['ransomware', 'criptografia']::text[]),
  ('tt-rw-002', 'ransomware', 'Fácil', 'Garantia do pagamento', 'Pagar o resgate garante a recuperação dos arquivos bloqueados por ransomware.', 'O pagamento não assegura que os criminosos forneçam um meio de recuperação funcional.', FALSE, 'ransomware', ARRAY['resgate', 'recuperação']::text[]),
  ('tt-rw-003', 'ransomware', 'Fácil', 'Meios de infecção', 'Ransomware só pode infectar um dispositivo por anexos de e-mail.', 'Links maliciosos e vulnerabilidades sem correção também podem levar à infecção.', FALSE, 'ransomware', ARRAY['infecção', 'vulnerabilidade']::text[]),
  ('tt-rw-004', 'ransomware', 'Fácil', 'Prevenção por atualização', 'Manter programas atualizados pode reduzir o risco de ransomware que explora falhas conhecidas.', 'Aplicar correções fecha caminhos de infecção baseados em vulnerabilidades já corrigidas.', TRUE, 'ransomware', ARRAY['atualização', 'prevenção']::text[]),
  ('tt-rw-005', 'ransomware', 'Médio', 'Alcance na rede', 'Um ransomware nunca consegue atingir outros dispositivos conectados ao equipamento infectado.', 'Ele pode procurar outros dispositivos e arquivos acessíveis pela rede para ampliar o dano.', FALSE, 'ransomware', ARRAY['rede', 'propagação']::text[]),
  ('tt-rw-006', 'ransomware', 'Médio', 'Mídia de backup', 'Desconectar a mídia após o backup ajuda a evitar que ela fique continuamente exposta ao computador.', 'Conecte-a periodicamente para copiar dados e mantenha-a protegida quando não estiver em uso.', TRUE, 'backup', ARRAY['backup', 'mídia externa']::text[]),
  ('tt-rw-007', 'ransomware', 'Médio', 'Cópias em locais distintos', 'Manter cópias de segurança em locais diferentes reduz a dependência de uma única cópia.', 'Se uma cópia falhar ou ficar indisponível, outra pode permitir a recuperação.', TRUE, 'backup', ARRAY['backup', 'redundância']::text[]),
  ('tt-rw-008', 'ransomware', 'Difícil', 'Backup desatualizado', 'Uma cópia antiga permite recuperar automaticamente todas as mudanças feitas depois de sua criação.', 'Só é possível restaurar o que foi copiado; a frequência precisa acompanhar a atualização dos dados.', FALSE, 'backup', ARRAY['backup', 'atualização']::text[]),
  ('tt-rw-009', 'ransomware', 'Difícil', 'Teste de restauração', 'Testar a recuperação dos arquivos ajuda a verificar se o backup está utilizável.', 'A existência de uma cópia não basta; é necessário conseguir restaurar os dados.', TRUE, 'backup', ARRAY['restauração', 'teste']::text[]),
  ('tt-rw-010', 'ransomware', 'Difícil', 'Conta de backup em nuvem', 'Uma conta de backup em nuvem dispensa verificação em duas etapas porque já tem senha.', 'Uma camada adicional de autenticação ajuda a proteger o acesso às cópias armazenadas.', FALSE, 'backup', ARRAY['nuvem', 'autenticação']::text[]),
  ('tt-rw-011', 'ransomware', 'Fácil', 'Extorsão por divulgação', 'Um ataque de ransomware pode envolver ameaça de divulgar dados roubados.', 'A extorsão pode combinar bloqueio de sistemas com vazamento de informações.', TRUE, 'rw-entender', ARRAY['extorsão', 'vazamento']::text[]),
  ('tt-rw-012', 'ransomware', 'Fácil', 'Backup e confidencialidade', 'Ter backup impede automaticamente que criminosos divulguem dados já roubados.', 'Uma cópia auxilia a recuperação, mas não desfaz a exposição das informações.', FALSE, 'rw-entender', ARRAY['backup', 'confidencialidade']::text[]),
  ('tt-rw-013', 'ransomware', 'Fácil', 'Ataque em várias fases', 'Um ataque de ransomware pode começar antes do momento em que os arquivos são bloqueados.', 'A invasão pode incluir acesso inicial e movimentação pela rede.', TRUE, 'rw-entender', ARRAY['acesso inicial', 'fases']::text[]),
  ('tt-rw-014', 'ransomware', 'Fácil', 'Credencial comprometida', 'Uma senha roubada de acesso remoto pode servir como porta de entrada para um ataque de ransomware.', 'Credenciais comprometidas são um dos possíveis vetores de invasão.', TRUE, 'rw-entender', ARRAY['credencial', 'acesso remoto']::text[]),
  ('tt-rw-015', 'ransomware', 'Fácil', 'Organização dos criminosos', 'Todo ataque de ransomware é necessariamente executado por uma única pessoa sem colaboração.', 'Grupos podem dividir desenvolvimento, acesso e execução do ataque.', FALSE, 'rw-entender', ARRAY['grupo criminoso', 'raas']::text[]),
  ('tt-rw-016', 'ransomware', 'Fácil', 'Permissão de administrador', 'Dar privilégios de administrador a todos os funcionários reduz o impacto de ransomware.', 'Privilégios excessivos ampliam o alcance de uma conta comprometida.', FALSE, 'rw-proteger', ARRAY['administrador', 'privilégio']::text[]),
  ('tt-rw-017', 'ransomware', 'Médio', 'Serviço exposto sem necessidade', 'Desativar acessos remotos desnecessários ajuda a reduzir caminhos possíveis para uma invasão.', 'Reduzir a superfície exposta diminui oportunidades de ataque.', TRUE, 'rw-proteger', ARRAY['superfície de ataque', 'acesso remoto']::text[]),
  ('tt-rw-018', 'ransomware', 'Médio', 'Separação de redes', 'Segmentar a rede pode dificultar a movimentação de um invasor entre diferentes áreas.', 'A separação ajuda a limitar a propagação após um comprometimento.', TRUE, 'rw-proteger', ARRAY['segmentação', 'movimentação lateral']::text[]),
  ('tt-rw-019', 'ransomware', 'Médio', 'Ferramenta única', 'Comprar uma única ferramenta elimina a necessidade de outras medidas contra ransomware.', 'Controles complementares ajudam quando uma das barreiras falha.', FALSE, 'rw-proteger', ARRAY['defesa em camadas', 'ferramenta']::text[]),
  ('tt-rw-020', 'ransomware', 'Médio', 'Acesso de ex-funcionário', 'Manter indefinidamente acessos de pessoas desligadas não interfere na proteção contra ransomware.', 'Contas sem necessidade de uso devem ser revisadas e desativadas.', FALSE, 'rw-proteger', ARRAY['identidade', 'revisão de acesso']::text[]),
  ('tt-rw-021', 'ransomware', 'Médio', 'Detecção antecipada', 'Observar atividades suspeitas antes da criptografia pode permitir interromper um ataque.', 'Existem sinais de comprometimento nas diferentes fases da invasão.', TRUE, 'rw-detectar', ARRAY['detecção', 'criptografia']::text[]),
  ('tt-rw-022', 'ransomware', 'Médio', 'Utilidade dos logs', 'Registros de acesso e atividade podem ajudar a investigar ações associadas a ransomware.', 'Logs permitem correlacionar eventos e identificar comportamentos suspeitos.', TRUE, 'rw-detectar', ARRAY['logs', 'investigação']::text[]),
  ('tt-rw-023', 'ransomware', 'Médio', 'Aviso de um funcionário', 'Relatos de funcionários sobre comportamentos estranhos devem ser ignorados se o antivírus não alertou.', 'Notificações de usuários podem complementar as ferramentas de detecção.', FALSE, 'rw-detectar', ARRAY['notificação', 'detecção']::text[]),
  ('tt-rw-024', 'ransomware', 'Difícil', 'Integridade dos registros', 'Proteger logs contra exclusão e alteração ajuda a preservar informações úteis para detectar ransomware.', 'Um atacante pode tentar apagar vestígios de suas atividades.', TRUE, 'rw-detectar', ARRAY['integridade', 'logs']::text[]),
  ('tt-rw-025', 'ransomware', 'Difícil', 'Tráfego de saída', 'Monitorar apenas conexões recebidas é suficiente para detectar toda comunicação de um atacante.', 'Conexões de saída também podem revelar comando, controle e envio indevido de dados.', FALSE, 'rw-detectar', ARRAY['tráfego de saída', 'exfiltração']::text[]),
  ('tt-rw-026', 'ransomware', 'Difícil', 'Responsáveis pela resposta', 'Um plano de resposta deve definir contatos e responsabilidades antes de ocorrer um incidente.', 'Decidir tudo durante o ataque pode atrasar a contenção.', TRUE, 'rw-responder', ARRAY['plano de resposta', 'responsabilidade']::text[]),
  ('tt-rw-027', 'ransomware', 'Difícil', 'Reconectar após restaurar', 'Restaurar arquivos autoriza reconectar imediatamente um sistema sem eliminar os acessos usados pelo invasor.', 'A causa da invasão e os acessos indevidos também precisam ser tratados.', FALSE, 'rw-responder', ARRAY['restauração', 'causa raiz']::text[]),
  ('tt-rw-028', 'ransomware', 'Difícil', 'Isolamento de sistemas', 'Isolar equipamentos comprometidos pode fazer parte da contenção de um ataque de ransomware.', 'A ação busca limitar o avanço enquanto a resposta é coordenada.', TRUE, 'rw-responder', ARRAY['isolamento', 'contenção']::text[]),
  ('tt-rw-029', 'ransomware', 'Difícil', 'Revisão de credenciais', 'Remover o arquivo do ransomware torna desnecessário revisar senhas e acessos comprometidos.', 'Credenciais e outros mecanismos de acesso podem permitir uma nova invasão.', FALSE, 'rw-responder', ARRAY['credencial', 'reincidência']::text[]),
  ('tt-rw-030', 'ransomware', 'Difícil', 'Registro das ações tomadas', 'Documentar as ações de resposta ajuda a investigar o incidente e melhorar o ambiente.', 'O histórico apoia a análise e as lições aprendidas.', TRUE, 'rw-responder', ARRAY['documentação', 'resposta']::text[]),
  ('tt-rd-001', 'redes', 'Fácil', 'Senha de administração', 'Trocar a senha padrão de administração do roteador ajuda a dificultar alterações indevidas.', 'Credenciais padrão podem ser conhecidas; use uma senha forte para administrar o equipamento.', TRUE, 'redes', ARRAY['roteador', 'senha']::text[]),
  ('tt-rd-002', 'redes', 'Fácil', 'WEP como proteção', 'WEP deve ser preferido a WPA3 por ser o padrão mais seguro para uma rede Wi-Fi.', 'WEP é uma opção antiga e insegura; use mecanismos atuais compatíveis com seus dispositivos.', FALSE, 'redes', ARRAY['wi-fi', 'criptografia']::text[]),
  ('tt-rd-003', 'redes', 'Fácil', 'Proteção do tráfego', 'A criptografia da rede Wi-Fi ajuda a proteger os dados transmitidos entre o dispositivo e o roteador.', 'A proteção dificulta a leitura do tráfego por quem não está autorizado a acessar a rede.', TRUE, 'redes', ARRAY['wi-fi', 'tráfego']::text[]),
  ('tt-rd-004', 'redes', 'Fácil', 'Atualização do roteador', 'Um roteador não precisa receber atualizações de segurança porque não é um computador de uso pessoal.', 'O firmware também pode conter falhas; manter as correções é parte da proteção da rede.', FALSE, 'redes', ARRAY['firmware', 'atualização']::text[]),
  ('tt-rd-005', 'redes', 'Médio', 'Firewall da rede', 'Manter o firewall do roteador ativo ajuda a bloquear conexões de entrada não autorizadas.', 'O firewall aplica regras de acesso para reduzir ataques vindos da Internet.', TRUE, 'redes', ARRAY['firewall', 'conexão']::text[]),
  ('tt-rd-006', 'redes', 'Médio', 'Proteções complementares', 'Uma senha forte de Wi-Fi elimina a necessidade das proteções exigidas para acessar sistemas corporativos.', 'A rede local e o acesso corporativo têm riscos distintos; siga também as medidas definidas pela empresa.', FALSE, 'remoto', ARRAY['wi-fi', 'trabalho remoto']::text[]),
  ('tt-rd-007', 'redes', 'Médio', 'Firewall do computador', 'Mesmo no trabalho remoto, manter o firewall pessoal ativo ajuda na proteção do computador.', 'Essa ferramenta complementa outras medidas contra conexões e ataques indevidos.', TRUE, 'remoto', ARRAY['firewall', 'computador']::text[]),
  ('tt-rd-008', 'redes', 'Difícil', 'VPN corporativa', 'Usar a VPN indicada pela empresa pode proteger a comunicação remota com seus sistemas internos.', 'A conexão segura ajuda a proteger credenciais e informações enquanto trafegam pela rede.', TRUE, 'remoto', ARRAY['vpn', 'criptografia']::text[]),
  ('tt-rd-009', 'redes', 'Difícil', 'Transferência de dados internos', 'É adequado enviar dados internos por qualquer serviço pessoal de nuvem, mesmo sem autorização da empresa.', 'Use os mecanismos aprovados para evitar exposição indevida de informações corporativas.', FALSE, 'remoto', ARRAY['nuvem', 'dados corporativos']::text[]),
  ('tt-rd-010', 'redes', 'Difícil', 'Autenticação da VPN', 'Uma VPN protegida por senha forte dispensa a verificação em duas etapas quando ela está disponível.', 'A senha pode ser obtida por diferentes ataques; outra etapa reduz a dependência de um único fator.', FALSE, 'remoto', ARRAY['vpn', 'autenticação']::text[]),
  ('tt-rd-011', 'redes', 'Fácil', 'Nome e endereço', 'O DNS pode traduzir o nome de um site para um endereço IP.', 'Isso ajuda o navegador a localizar o servidor correspondente.', TRUE, 'dns', ARRAY['dns', 'endereço ip']::text[]),
  ('tt-rd-012', 'redes', 'Fácil', 'Função do DNS', 'A função principal do DNS é criar a senha da rede Wi-Fi.', 'DNS resolve nomes; a senha de Wi-Fi é uma configuração distinta.', FALSE, 'dns', ARRAY['dns', 'wi-fi']::text[]),
  ('tt-rd-013', 'redes', 'Fácil', 'Resolvedor de nomes', 'Um resolvedor DNS participa da busca pelo endereço associado a um nome.', 'Ele consulta as informações necessárias para responder à resolução.', TRUE, 'dns', ARRAY['resolvedor', 'nome']::text[]),
  ('tt-rd-014', 'redes', 'Fácil', 'DNS e criptografia de página', 'Resolver um nome por DNS torna automaticamente criptografada toda a navegação HTTP.', 'Encontrar um endereço não substitui a proteção da conexão com o site.', FALSE, 'dns', ARRAY['dns', 'http']::text[]),
  ('tt-rd-015', 'redes', 'Fácil', 'Resolvedor configurável', 'O resolvedor DNS utilizado pode depender da configuração do roteador, sistema ou navegador.', 'A resolução não precisa usar sempre o mesmo serviço.', TRUE, 'dns', ARRAY['configuração', 'resolvedor']::text[]),
  ('tt-rd-016', 'redes', 'Fácil', 'HTTPS e transporte', 'HTTPS utiliza criptografia para proteger a comunicação entre navegador e site.', 'A proteção é aplicada aos dados durante a transmissão.', TRUE, 'https', ARRAY['https', 'criptografia']::text[]),
  ('tt-rd-017', 'redes', 'Médio', 'HTTP sem TLS', 'HTTP sem TLS oferece a mesma proteção criptográfica de HTTPS.', 'HTTPS adiciona a proteção de transporte baseada em TLS.', FALSE, 'https', ARRAY['http', 'tls']::text[]),
  ('tt-rd-018', 'redes', 'Médio', 'Dados em trânsito', 'Proteger uma transmissão com HTTPS não substitui proteger os dados depois que chegam ao servidor.', 'A segurança do transporte e a segurança do armazenamento são aspectos diferentes.', TRUE, 'https', ARRAY['trânsito', 'armazenamento']::text[]),
  ('tt-rd-019', 'redes', 'Médio', 'TLS na conexão', 'O protocolo TLS é usado por HTTPS para estabelecer uma comunicação protegida.', 'Ele fornece mecanismos criptográficos para o transporte das informações.', TRUE, 'https', ARRAY['tls', 'https']::text[]),
  ('tt-rd-020', 'redes', 'Médio', 'Leitura do tráfego HTTP', 'Uma conexão HTTP sem criptografia permite tratar senhas transmitidas como se estivessem protegidas por TLS.', 'Sem essa proteção, observadores da comunicação podem ter acesso ao conteúdo transmitido.', FALSE, 'https', ARRAY['senha', 'tráfego']::text[]),
  ('tt-rd-021', 'redes', 'Médio', 'Rede pública no Windows', 'Marcar uma rede desconhecida como pública no Windows é adequado para aplicar um perfil menos confiável.', 'Perfis de rede ajudam a controlar a exposição do computador a outros dispositivos.', TRUE, 'firewall-ms', ARRAY['rede pública', 'perfil']::text[]),
  ('tt-rd-022', 'redes', 'Médio', 'Conexão de aplicativo', 'Uma regra de firewall pode permitir a comunicação de um aplicativo específico.', 'As regras podem restringir ou permitir conexões por critérios definidos.', TRUE, 'firewall-ms', ARRAY['regra', 'aplicativo']::text[]),
  ('tt-rd-023', 'redes', 'Médio', 'Desligar por conveniência', 'Se um aplicativo não conecta, desativar permanentemente todo o firewall é sempre a solução mais segura.', 'Investigue a regra necessária sem remover indiscriminadamente a proteção.', FALSE, 'firewall-ms', ARRAY['firewall', 'diagnóstico']::text[]),
  ('tt-rd-024', 'redes', 'Difícil', 'Exceção e exposição', 'Permitir apenas a conexão necessária de um aplicativo tende a expor menos serviços que desligar todo o firewall.', 'Uma exceção delimitada mantém as demais restrições em funcionamento.', TRUE, 'firewall-ms', ARRAY['exceção', 'exposição']::text[]),
  ('tt-rd-025', 'redes', 'Difícil', 'Critérios da regra', 'Regras de firewall podem considerar portas, endereços IP e o caminho de programas.', 'Esses critérios permitem controlar quais comunicações são autorizadas.', TRUE, 'firewall-ms', ARRAY['porta', 'regra']::text[]),
  ('tt-rd-026', 'redes', 'Difícil', 'Switch de camada dois', 'Um switch de camada dois pode encaminhar quadros na rede local usando endereços MAC.', 'Ele aprende associações que ajudam a escolher a porta de destino.', TRUE, 'switch', ARRAY['switch', 'mac']::text[]),
  ('tt-rd-027', 'redes', 'Difícil', 'Encaminhamento e hub', 'Um switch precisa enviar todos os quadros de destino conhecido a todas as portas, como um hub.', 'Uma tabela de endereços permite encaminhar tráfego conhecido à porta correspondente.', FALSE, 'switch', ARRAY['switch', 'hub']::text[]),
  ('tt-rd-028', 'redes', 'Difícil', 'Roteamento entre redes', 'Um roteador pode encaminhar pacotes entre redes diferentes com base em endereços IP.', 'Essa função difere da comutação local tradicional baseada em MAC.', TRUE, 'switch', ARRAY['roteador', 'endereço ip']::text[]),
  ('tt-rd-029', 'redes', 'Difícil', 'MAC e IP', 'Em uma rede tradicional, endereços MAC e IP são conceitos idênticos usados na mesma função.', 'Comutação de camada dois e roteamento utilizam informações de endereçamento diferentes.', FALSE, 'switch', ARRAY['mac', 'camada de rede']::text[]),
  ('tt-rd-030', 'redes', 'Difícil', 'Switch com roteamento', 'Existem switches avançados capazes de oferecer também funções de roteamento.', 'Os recursos dependem do equipamento; nem todo switch se limita à camada dois.', TRUE, 'switch', ARRAY['switch multicamada', 'roteamento']::text[]);

-- Guarda somente os códigos novos: uma segunda execução não modifica edições manuais.
CREATE TEMP TABLE tt_carga_novas ON COMMIT DROP AS
WITH inseridas AS (
  INSERT INTO pergunta(codigo,titulo,enunciado,explicacao,id_categoria,id_dificuldade,fonte_url)
  SELECT cp.codigo,cp.titulo,cp.enunciado,cp.explicacao,c.id_categoria,d.id_dificuldade,cf.url
  FROM tt_carga_perguntas cp JOIN categoria c ON c.nome=cp.categoria
  JOIN dificuldade d ON d.descricao=cp.dificuldade
  JOIN tt_carga_fontes cf ON cf.chave=cp.fonte
  ON CONFLICT (codigo) DO NOTHING
  RETURNING codigo
) SELECT codigo FROM inseridas;

-- A = Certo; B = Errado. Exatamente uma alternativa correta por pergunta nova.
INSERT INTO alternativa(pergunta_codigo,letra,texto,correta)
SELECT cp.codigo,a.letra,a.texto,CASE WHEN a.letra='A' THEN cp.certo ELSE NOT cp.certo END
FROM tt_carga_perguntas cp JOIN tt_carga_novas n USING(codigo)
CROSS JOIN (VALUES ('A','Certo'),('B','Errado')) AS a(letra,texto);

INSERT INTO palavra_chave(termo)
SELECT DISTINCT unnest(cp.palavras)
FROM tt_carga_perguntas cp JOIN tt_carga_novas n USING(codigo)
ON CONFLICT (termo) DO NOTHING;

INSERT INTO pergunta_palavra_chave(pergunta_codigo,id_palavra_chave)
SELECT DISTINCT cp.codigo,pk.id_palavra_chave
FROM tt_carga_perguntas cp JOIN tt_carga_novas n USING(codigo)
CROSS JOIN LATERAL unnest(cp.palavras) AS termo(nome)
JOIN palavra_chave pk ON pk.termo=termo.nome
ON CONFLICT (pergunta_codigo,id_palavra_chave) DO NOTHING;

SELECT count(*)::int AS perguntas_inseridas_agora FROM tt_carga_novas;
COMMIT;

-- Conferência da carga (somente os códigos reservados acima).
SELECT c.nome AS categoria,d.descricao AS dificuldade,count(*)::int AS perguntas
FROM pergunta p JOIN categoria c USING(id_categoria) JOIN dificuldade d USING(id_dificuldade)
WHERE p.codigo ~ '^tt-(es|mw|ph|pd|rw|rd)-[0-9]{3}$'
GROUP BY c.nome,d.descricao ORDER BY c.nome,d.descricao;

-- RA01: categorias em ordem alfabética, incluindo categorias sem perguntas.
SELECT c.id_categoria,c.nome,count(p.codigo)::int AS total_perguntas
FROM categoria c LEFT JOIN pergunta p USING(id_categoria)
GROUP BY c.id_categoria,c.nome ORDER BY c.nome;

-- RA02a: uma pergunta aleatória de qualquer categoria.
SELECT codigo,titulo,enunciado FROM pergunta ORDER BY random() LIMIT 1;

-- RA02b: sorteio de uma categoria; substitua o nome no WHERE para outro tema.
SELECT p.codigo,p.titulo,p.enunciado FROM pergunta p JOIN categoria c USING(id_categoria)
WHERE c.nome='engenharia social' ORDER BY random() LIMIT 1;

-- RA03: pergunta e alternativas, sem revelar o gabarito.
SELECT p.codigo,p.titulo,p.enunciado,a.letra,a.texto
FROM pergunta p JOIN alternativa a ON a.pergunta_codigo=p.codigo
WHERE p.codigo='tt-es-001' ORDER BY a.letra;

-- RA04: duas escolhas de exemplo; A acerta e B erra para tt-es-001 desta carga.
SELECT pergunta_codigo,letra,correta AS acertou FROM alternativa
WHERE pergunta_codigo='tt-es-001' AND letra IN ('A','B') ORDER BY letra;

-- RA05: explicação e referência bibliográfica.
SELECT p.codigo,p.explicacao,f.titulo AS fonte,f.url,pu.nome AS publicador,i.descricao AS idioma
FROM pergunta p JOIN fonte f ON f.url=p.fonte_url
JOIN publicador pu USING(id_publicador) JOIN idioma i USING(id_idioma)
WHERE p.codigo='tt-es-001';

-- RA06: publicadores mais citados.
SELECT pu.nome AS publicador,count(p.codigo)::int AS total_perguntas
FROM publicador pu JOIN fonte f USING(id_publicador) JOIN pergunta p ON p.fonte_url=f.url
GROUP BY pu.id_publicador,pu.nome ORDER BY total_perguntas DESC,pu.nome;

-- RA07: fontes citadas por mais de uma pergunta.
SELECT f.titulo,f.url,count(p.codigo)::int AS total_perguntas
FROM fonte f JOIN pergunta p ON p.fonte_url=f.url
GROUP BY f.url,f.titulo HAVING count(p.codigo)>1 ORDER BY total_perguntas DESC,f.titulo;
