# Tech Trivia

Na pasta `Servidor`, configure o `.env` usando `.env.example` como referência.
O PostgreSQL deve estar iniciado e o banco deve conter as tabelas do projeto.

Para criar um banco novo, o arquivo `PROJETO/doc_date/04-ddl.sql` contém o
esquema completo atual: 15 tabelas, incluindo contas, senhas em hash e acessos
autenticados, além dos idiomas e dificuldades iniciais. Crie `tech_trivia`
antes de executar esse arquivo. Os dados de perguntas, fontes e publicadores
ficam nos scripts de dados; o DDL não é um dump dos registros em uso.
Em banco existente, use somente a migração aditiva (`npm.cmd run migrar`),
sem reaplicar o DDL completo.

```powershell
npm.cmd install
npm.cmd start
```

- Login, cadastro e jogo: http://localhost:3000/cadastro/cadastro.html
- Administração: http://localhost:3000/administracao/adm.html
- Ranking: http://localhost:3000/raking/raking.html

Após alterar o código do servidor, pare com Ctrl+C e execute `npm.cmd start`
novamente. Atualize o navegador com Ctrl+F5.

O painel permite cadastrar, editar, buscar e excluir perguntas e categorias,
além de cadastrar e renomear jogadores. Perguntas aceitam de duas a quatro
alternativas, exatamente uma correta, fonte e palavras-chave. Selecione uma
fonte existente ou informe os dados de uma nova fonte, usando publicadores e
idiomas já cadastrados no banco.

O cadastro cria uma conta com nome de usuário único (3 a 40 caracteres) e senha
(8 a 128 caracteres). A senha é armazenada como hash scrypt com salt aleatório;
o navegador recebe um cookie HttpOnly, válido por sete dias. Sair revoga o
acesso no servidor. O nome de usuário é comparado sem diferenciar maiúsculas e
minúsculas. O avatar fica na conta e reaparece ao fazer login em outro navegador.
Cada rodada registra
uma tentativa; ao concluir, o servidor confere as respostas e grava os pontos.
Reenviar a conclusão da mesma rodada não duplica a pontuação. O ranking soma os
pontos das partidas concluídas e desempata pelo nome e pelo ID do jogador.

Categorias com perguntas, jogadores com tentativas e perguntas vinculadas a
tentativas não podem ser excluídos pelo painel, para preservar seus vínculos.
O jogo exige login, e o dono da partida é determinado no servidor. O painel e
todas as rotas `/api/admin` exigem uma conta administradora. Cadastros públicos
sempre criam jogadores comuns, mesmo que enviem campos de privilégio.

## Primeiro acesso como administrador

1. Reinicie o servidor. As tabelas `conta` e `sessao_login` são criadas
   automaticamente pela migração aditiva `migracoes/001-login.sql`.
2. Na tela inicial, escolha **Criar conta** e cadastre seu nome de usuário e senha.
3. Em outro terminal, dentro de `Servidor`, execute:

   ```powershell
   node contas.js promover seu_usuario
   ```

4. Atualize o site. O link **Administração** aparecerá na barra da conta.

Não existe senha padrão nem promoção automática do primeiro visitante. Se
preferir aplicar a migração separadamente, execute `npm.cmd run migrar`.
Use o site pelo endereço do servidor; front-end separado precisa de sua origem
configurada em `FRONT_ORIGIN`. Para hospedagem pública, sirva o site com HTTPS
e configure `COOKIE_SECURE=true` se o TLS terminar no proxy.

## Jogadores antigos e senhas

Os perfis e pontos antigos são preservados. Eles aparecem como **Sem login**
em **Usuários**. Um administrador pode editar cada perfil e informar login e
senha para criar acesso mantendo o mesmo ID e histórico. O cadastro público
sempre cria um jogador novo; não permite assumir um perfil existente só por
conhecer seu nome. Não execute o DDL inicial novamente no banco existente.

Em **Usuários**, o administrador pode criar contas, editar o nome de exibição
ou definir uma nova senha. Deixe a senha vazia para mantê-la ao editar uma
conta. Trocar a senha revoga os logins anteriores dessa conta. Nomes de usuário
já vinculados não são alterados por esse formulário. Não há recuperação por
e-mail nesta versão. A promoção administrativa é feita pelo terminal acima.

Referências: [armazenamento de senhas (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
e [cookies de autenticação (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).

As configurações ficam em `Servidor/configuracoes.json`, criado ao salvar no
painel. Sem esse arquivo, são usadas 10 perguntas por rodada e 1.000 pontos por
acerto. A quantidade de perguntas vale para rodadas novas; os pontos por acerto
são lidos ao concluir a rodada. Pontuações anteriores não são recalculadas.

## Verificação

```powershell
npm.cmd test
```

O teste de integração cria um esquema temporário isolado no banco configurado,
confirma que o DDL completo cria as 15 tabelas, reaplica a migração de login
para verificar compatibilidade e verifica as rotas por HTTP. O usuário do banco
precisa poder criar esquemas. Os registros existentes e as configurações reais
não são modificados; o esquema e as configurações de teste são removidos ao fim.

## Publicar as telas na Vercel

No repositório `Caua031/projeto-quiz`, o cadastro está em
`PROJETO/cadastro/cadastro.html`. Configure **Root Directory** como `PROJETO`.
O `PROJETO/vercel.json` define o framework Other, dispensa instalação de
dependências, executa `node build-vercel.cjs` e publica a saída `public`.
O acesso a `/` redireciona para `/cadastro/cadastro.html`.

Envie `PROJETO/vercel.json`, `PROJETO/build-vercel.cjs` e
`PROJETO/.gitignore` ao repositório e abra o novo deployment desse commit.
Não envie `public`: essa pasta é gerada no build. O script copia apenas
as páginas e recursos, excluindo o servidor, documentos e arquivos `.env`.
Isso publica o front-end; a API e o PostgreSQL precisam de hospedagem própria
ou de uma integração de backend configurada separadamente.

O repositório remoto observado tem `Servidor` dentro de `PROJETO`; a cópia
local desta conversa tem as duas pastas na raiz. Uma regra de ignore não
remove arquivos já rastreados: `.env` já publicado no GitHub precisa ser
removido do repositório, e credenciais que ele contenha precisam ser trocadas.

## Comparar com a versão anterior

A pasta `VERSAO_ANTERIOR`, na raiz do projeto, contém uma reconstrução do
estado anterior às alterações desta conversa, baseada nos arquivos lidos.
Ela roda separadamente na porta 3001 e mantém a versão atual na porta 3000.
Consulte `VERSAO_ANTERIOR/README.md` para iniciar a comparação e entender
as adaptações. Ela não é um backup histórico exato nem recupera dados antigos.

## Cadastrar várias perguntas por INSERT

O arquivo `PROJETO/doc_date/05-dml-consultas.sql` contém 180 perguntas de Certo
ou Errado: 30 de cada categoria (engenharia social, malware, phishing, proteção
de dados, ransomware e redes). Cada tema recebe dez perguntas fáceis, dez
médias e dez difíceis. A classificação é pedagógica e pode ser ajustada no painel.
Cada pergunta tem código, título, enunciado, explicação, duas alternativas,
gabarito, referência bibliográfica e palavras-chave.

Com o banco configurado no `.env`, execute dentro de `Servidor`:

```powershell
npm.cmd run carregar-perguntas
```

Ou abra `05-dml-consultas.sql` no Query Tool do pgAdmin, conectado ao banco
`tech_trivia`, e execute o arquivo inteiro. Os IDs são encontrados pelos nomes,
então não precisam ser iguais aos de outro computador. A carga pode ser
executada novamente: códigos já existentes e suas edições manuais são preservados.
Se você já carregou as primeiras 60, o mesmo comando acrescenta as 120 novas.
Os códigos 001–010 de cada tema mantêm conteúdo, dificuldade e gabarito;
os novos códigos vão de 011 a 030. Não é preciso apagar nenhuma pergunta.
Não é necessário executar o DDL novamente, nem reiniciar o servidor para ler
as novas perguntas. Atualize a tela de categorias e inicie uma nova rodada.

Os códigos desta carga começam com `tt-es`, `tt-mw`, `tt-ph`, `tt-pd`, `tt-rw`
e `tt-rd`. As perguntas anteriores não são removidas. As dificuldades, idiomas,
publicadores, fontes e palavras-chave necessários também são inseridos quando
ausentes; contas e pontos não são alterados.

O quiz sorteia várias perguntas da categoria e da dificuldade escolhidas,
sem repetir uma pergunta dentro da rodada. Usa a quantidade configurada no
painel ou a quantidade disponível, se houver menos perguntas. Para mais
variedade, deixe a dificuldade desmarcada. O SQL também inclui as consultas RA01–RA07.

Para testar a carga em um esquema isolado, execute `npm.cmd run test:perguntas`.
As referências de cada questão foram consultadas em 22/10/2026 e ficam na tabela
`fonte`; incluem 38 materiais do CERT.br, NIC.br, ACSC, FBI, FTC, Microsoft,
NCSC, Mozilla, Google, Cloudflare e Cisco. As afirmações e
explicações são redações próprias a partir dessas orientações.
