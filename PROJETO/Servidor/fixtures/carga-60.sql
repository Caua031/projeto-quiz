-- 05-dml-consultas.sql — Tech Trivia: 60 perguntas originais de Certo ou Errado.
-- 10 por categoria: 4 fáceis, 3 médias e 3 difíceis (classificação pedagógica sugerida).
-- Códigos reservados desta carga: tt-es/mw/ph/pd/rw/rd-001 a 010.
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
  ('FBI')
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
  ('remoto', 'Trabalho Remoto — Cartilha de Segurança para Internet', 'https://cartilha.cert.br/fasciculos/trabalho-remoto/fasciculo-trabalho-remoto.pdf', 'CERT.br', 'Português');

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
  ('tt-rd-001', 'redes', 'Fácil', 'Senha de administração', 'Trocar a senha padrão de administração do roteador ajuda a dificultar alterações indevidas.', 'Credenciais padrão podem ser conhecidas; use uma senha forte para administrar o equipamento.', TRUE, 'redes', ARRAY['roteador', 'senha']::text[]),
  ('tt-rd-002', 'redes', 'Fácil', 'WEP como proteção', 'WEP deve ser preferido a WPA3 por ser o padrão mais seguro para uma rede Wi-Fi.', 'WEP é uma opção antiga e insegura; use mecanismos atuais compatíveis com seus dispositivos.', FALSE, 'redes', ARRAY['wi-fi', 'criptografia']::text[]),
  ('tt-rd-003', 'redes', 'Fácil', 'Proteção do tráfego', 'A criptografia da rede Wi-Fi ajuda a proteger os dados transmitidos entre o dispositivo e o roteador.', 'A proteção dificulta a leitura do tráfego por quem não está autorizado a acessar a rede.', TRUE, 'redes', ARRAY['wi-fi', 'tráfego']::text[]),
  ('tt-rd-004', 'redes', 'Fácil', 'Atualização do roteador', 'Um roteador não precisa receber atualizações de segurança porque não é um computador de uso pessoal.', 'O firmware também pode conter falhas; manter as correções é parte da proteção da rede.', FALSE, 'redes', ARRAY['firmware', 'atualização']::text[]),
  ('tt-rd-005', 'redes', 'Médio', 'Firewall da rede', 'Manter o firewall do roteador ativo ajuda a bloquear conexões de entrada não autorizadas.', 'O firewall aplica regras de acesso para reduzir ataques vindos da Internet.', TRUE, 'redes', ARRAY['firewall', 'conexão']::text[]),
  ('tt-rd-006', 'redes', 'Médio', 'Proteções complementares', 'Uma senha forte de Wi-Fi elimina a necessidade das proteções exigidas para acessar sistemas corporativos.', 'A rede local e o acesso corporativo têm riscos distintos; siga também as medidas definidas pela empresa.', FALSE, 'remoto', ARRAY['wi-fi', 'trabalho remoto']::text[]),
  ('tt-rd-007', 'redes', 'Médio', 'Firewall do computador', 'Mesmo no trabalho remoto, manter o firewall pessoal ativo ajuda na proteção do computador.', 'Essa ferramenta complementa outras medidas contra conexões e ataques indevidos.', TRUE, 'remoto', ARRAY['firewall', 'computador']::text[]),
  ('tt-rd-008', 'redes', 'Difícil', 'VPN corporativa', 'Usar a VPN indicada pela empresa pode proteger a comunicação remota com seus sistemas internos.', 'A conexão segura ajuda a proteger credenciais e informações enquanto trafegam pela rede.', TRUE, 'remoto', ARRAY['vpn', 'criptografia']::text[]),
  ('tt-rd-009', 'redes', 'Difícil', 'Transferência de dados internos', 'É adequado enviar dados internos por qualquer serviço pessoal de nuvem, mesmo sem autorização da empresa.', 'Use os mecanismos aprovados para evitar exposição indevida de informações corporativas.', FALSE, 'remoto', ARRAY['nuvem', 'dados corporativos']::text[]),
  ('tt-rd-010', 'redes', 'Difícil', 'Autenticação da VPN', 'Uma VPN protegida por senha forte dispensa a verificação em duas etapas quando ela está disponível.', 'A senha pode ser obtida por diferentes ataques; outra etapa reduz a dependência de um único fator.', FALSE, 'remoto', ARRAY['vpn', 'autenticação']::text[]);

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
