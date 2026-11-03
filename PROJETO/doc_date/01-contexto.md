# Passos 1 a 3 — Contexto, minimundo e requisitos

**Marco:** M1  

---

## 1. Introdução e contexto

O Tech Trivia é um quiz de afirmações sobre Tecnologia da Informação. O jogador lê uma frase sobre determinado assunto e indica se ela está certa ou errada, recebendo em seguida uma explicação fundamentada em uma fonte publicada. O banco de dados deve permitir o cadastro flexível de alternativas, possibilitando a inclusão de mais opções de resposta futuramente.

O objetivo deste banco de dados é armazenar perguntas, categorias, alternativas, explicações e fontes de forma consistente, além de atender às consultas que a aplicação web precisa realizar para exibir o quiz, sortear perguntas e verificar respostas.

### 1.1 Escopo

A tabela a seguir apresenta as responsabilidades do banco de dados e o que está fora do seu escopo.

| O banco faz | O banco não faz |
|---|---|
| Armazena perguntas, categorias, alternativas e explicações. | Cria questões automaticamente. |
| Armazena fontes, publicadores e idiomas. | Oferece uma interface gráfica. |
| Garante que os dados relacionados estejam consistentes e evita duplicações indevidas. | Armazena o conteúdo completo de livros e artigos. |
| Armazena nome de usuário, pontuação e ranking. | Realiza, por si só, o ensino ou a explicação dos conteúdos. |
| Permite pesquisas por palavras-chave. | Envia notificações aos jogadores. |
| Permite sortear questões e consultar gabaritos. | Corrige ou produz automaticamente o conteúdo das fontes. |
| Armazena contas de acesso (nome de usuário e resumo da senha) e as sessões de login. | Guarda senhas em texto legível. |

### 1.2 Usuários

Os usuários do sistema e suas respectivas atividades são:

| Usuário | O que faz |
|---|---|
| Jogador | Cria uma conta, entra no sistema, joga rodadas, lê as perguntas, escolhe uma alternativa (Certo ou Errado), consulta a explicação e a fonte e aparece no ranking. |
| Administrador (responsável pelo cadastro de perguntas) | Cadastra, altera e exclui questões, alternativas, categorias, níveis de dificuldade, referências e palavras-chave; gerencia contas de jogadores e define os parâmetros de cada rodada. |

---

## 2. Minimundo

O Tech Trivia é um sistema de quiz voltado à aprendizagem de cibersegurança e à exploração de conhecimentos e curiosidades da área de Tecnologia da Informação. Seu objetivo é auxiliar os estudantes na compreensão de conceitos relacionados à segurança digital, estimulando o aprendizado de maneira interativa. As questões são apresentadas em formato de afirmações, que o jogador deve avaliar como certas ou erradas. Cada questão possui alternativas identificadas por letras e acompanhadas de seus respectivos textos. O modelo deve permitir a inclusão de mais de duas alternativas futuramente, mantendo a regra de que exatamente uma alternativa seja a correta. Cada questão possui um código único, título, enunciado e explicação, todos obrigatórios, além de estar vinculada a uma categoria e a um nível de dificuldade. As alternativas são identificadas por letras e possuem um texto próprio, sendo que exatamente uma delas deve ser a correta. Após responder, o jogador pode consultar a explicação da questão e a respectiva fonte bibliográfica, permitindo compreender o conteúdo apresentado e conhecer a referência utilizada para fundamentar a resposta.
Cada questão está associada a uma única referência bibliográfica, identificada por uma URL que não pode se repetir no cadastro de fontes, embora uma mesma referência possa ser utilizada em diferentes questões. As fontes possuem informações sobre título, publicador e idioma, permitindo organizar e identificar os materiais consultados. Para facilitar a localização dos conteúdos, as questões podem possuir palavras-chave, que são cadastradas uma única vez e podem ser compartilhadas entre várias questões. O sistema também permite organizar quizzes compostos por uma ou mais perguntas, possibilitando que uma mesma questão seja utilizada em diferentes quizzes. Cada jogador é identificado por um nome e pode realizar diferentes tentativas, acumulando pontuações que serão utilizadas para compor o ranking. Ao finalizar uma tentativa, sua pontuação fica registrada para consulta e classificação. Além disso, o responsável pelo cadastro pode registrar, consultar, alterar e excluir questões e suas informações relacionadas, como alternativas, categorias, níveis de dificuldade, referências bibliográficas e palavras-chave. Dessa forma, o banco de dados mantém as informações organizadas e consistentes, possibilitando o sorteio de questões, a consulta por categoria e dificuldade, a pesquisa por palavras-chave e a verificação das respostas e pontuações.

Para jogar, a pessoa cria uma conta com um nome de usuário único e uma senha, e escolhe um avatar; a senha nunca é guardada em texto legível. Cada conta pertence a um único jogador, e um jogador pode existir sem conta (perfis anteriores à criação de contas, que mantêm suas pontuações). Depois de entrar, a conta permanece autenticada por uma sessão com prazo de validade, que termina quando a pessoa sai, quando o prazo vence ou quando a senha é trocada. Algumas contas têm perfil de administrador, que corresponde ao responsável pelo cadastro de perguntas; esse perfil não pode ser obtido pelo cadastro público de contas. Cada rodada de jogo registra as perguntas sorteadas para o jogador e, ao final, a pontuação, que o sistema calcula a partir das respostas (número de acertos multiplicado pelos pontos por acerto). O administrador define quantas perguntas tem cada rodada e quantos pontos vale cada acerto. Categorias com perguntas, jogadores com tentativas registradas e perguntas que já fizeram parte de uma tentativa não podem ser excluídos, para preservar o histórico. O avatar da conta é escolhido entre as imagens disponíveis. Só quem está autenticado inicia e finaliza tentativas, e cada tentativa pertence ao jogador da sessão. Um jogador anterior às contas pode receber uma conta pela administração, que também redefine senhas. Para proteger as contas, o sistema limita as tentativas de cadastro e de login por endereço e não revela se um nome de usuário existe.

---

## 3. Requisitos e regras de negócio

Esta seção reúne as regras de negócio, os requisitos funcionais e os requisitos não funcionais do sistema.

### 3.1 Regras de negócio

| Código | Texto do requisito | Tipo |
|---|---|---|
| RD01 | Toda questão possui um código único, título, enunciado e explicação, todos obrigatórios. | Regra de negócio |
| RD02 | Toda questão pertence a exatamente uma categoria. | Regra de negócio |
| RD03 | Toda questão possui exatamente um nível de dificuldade. | Regra de negócio |
| RD04 | Toda questão possui alternativas identificadas por letras, cada uma com seu texto. | Regra de negócio |
| RD05 | Exatamente uma alternativa de cada questão é a correta. | Regra de negócio |
| RD06 | Cada questão possui uma única referência bibliográfica. | Regra de negócio |
| RD07 | Uma referência pode ser utilizada por várias questões e sua URL não pode se repetir. | Regra de negócio |
| RD08 | Cada questão pode possuir zero ou mais palavras-chave. | Regra de negócio |
| RD09 | Uma mesma palavra-chave pode ser utilizada em várias questões e deve ser cadastrada uma única vez. | Regra de negócio |
| RD10 | Cada jogador possui um nome de identificação e pode acumular pontuações. | Regra de negócio |
| RD11 | O ranking deve ser organizado com base nas pontuações registradas dos jogadores. | Regra de negócio |
| RD12 | Cada conta pertence a exatamente um jogador, e um jogador possui no máximo uma conta. | Regra de negócio |
| RD13 | O nome de usuário de uma conta é único, escrito em minúsculas, com 3 a 40 letras, números, pontos, traços ou sublinhados. | Regra de negócio |
| RD14 | A senha tem de 8 a 128 caracteres. | Regra de negócio |
| RD15 | Toda sessão de login pertence a exatamente uma conta, vale por 7 dias e deixa de valer ao sair, ao expirar ou quando a senha da conta é trocada. | Regra de negócio |
| RD16 | Toda conta é criada sem privilégio de administrador; esse privilégio só é concedido por quem tem acesso ao servidor. | Regra de negócio |
| RD17 | A pontuação de uma tentativa é calculada pelo sistema (acertos multiplicados pelos pontos por acerto) e registrada uma vez, ao finalizar a tentativa. | Regra de negócio |
| RD18 | Não podem ser excluídos: categoria que possui perguntas, jogador que possui tentativas e pergunta que já fez parte de uma tentativa. | Regra de negócio |
| RD19 | O avatar da conta é um dos quatro avatares disponíveis ou o perfil padrão; sem escolha, vale o perfil padrão. | Regra de negócio |
| RD20 | O cadastro público cria o jogador e a conta numa única operação e já deixa a pessoa autenticada; o nome de exibição pode se repetir, o nome de usuário não; sem nome de exibição, usa-se o nome de usuário. | Regra de negócio |
| RD21 | Um jogador anterior às contas pode receber uma conta pela administração, sem perder suas pontuações. | Regra de negócio |
| RD22 | Ao entrar, a sessão anterior daquele navegador é encerrada e as sessões vencidas são removidas. | Regra de negócio |
| RD23 | O nome de usuário de uma conta existente não pode ser alterado, e o administrador não pode excluir a própria conta enquanto usa a administração. | Regra de negócio |
| RD24 | Toda tentativa (quiz) é criada para o jogador da sessão autenticada, e só esse jogador pode finalizá-la. | Regra de negócio |

### 3.2 Requisitos funcionais

| Código | Texto do requisito | Tipo |
|---|---|---|
| RF01 | O sistema deve permitir cadastrar questões. | Funcional |
| RF02 | O sistema deve permitir consultar questões por categoria. | Funcional |
| RF03 | O sistema deve permitir filtrar questões por nível de dificuldade. | Funcional |
| RF04 | O sistema deve sortear questões para os quizzes. | Funcional |
| RF05 | O sistema deve permitir consultar as alternativas e os gabaritos. | Funcional |
| RF06 | O sistema deve permitir pesquisar questões por palavras-chave. | Funcional |
| RF07 | O sistema deve permitir alterar e excluir questões. | Funcional |
| RF08 | O sistema deve permitir organizar quizzes com uma ou mais questões, possibilitando a reutilização de questões em diferentes quizzes.| Funcional |
| RF09 | O sistema deve permitir registrar as tentativas realizadas pelos jogadores e suas respectivas pontuações | Funcional |
| RF10 | O sistema deve permitir consultar o ranking dos jogadores com base nas pontuações registradas. | Funcional |
| RF11 | O sistema deve permitir criar uma conta com nome de usuário, senha e avatar. | Funcional |
| RF12 | O sistema deve permitir entrar, identificar quem está autenticado e sair. | Funcional |
| RF13 | O sistema deve restringir a administração (perguntas, categorias, contas e parâmetros de rodada) a contas de administrador. | Funcional |
| RF14 | O sistema deve permitir ao administrador listar, criar, alterar e excluir jogadores e contas, respeitando a RD18. | Funcional |
| RF15 | O sistema deve permitir ao administrador definir quantas perguntas tem cada rodada e quantos pontos vale cada acerto (parâmetros mantidos fora do banco). | Funcional |
| RF16 | O sistema deve exigir conta autenticada para iniciar e finalizar tentativas de quiz. | Funcional |
| RF17 | O sistema deve permitir ao administrador criar uma conta para um jogador que ainda não possui uma e redefinir a senha de uma conta, o que encerra as sessões dela. | Funcional |

### 3.3 Requisitos não funcionais

| Código | Texto do requisito | Tipo |
|---|---|---|
| RNF01 | O banco de dados deve utilizar PostgreSQL. | Não funcional |
| RNF02 | O banco de dados deve garantir a integridade dos dados, impedindo valores nulos nos campos obrigatórios e referências a registros inexistentes. | Não funcional |
| RNF03 | O banco de dados deve impedir duplicidades nos códigos de questões, nas URLs das referências bibliográficas, nos nomes de categorias e de publicadores, nos nomes de usuário e nos registros únicos de palavras-chave. | Não funcional |
| RNF04 | Senhas são guardadas somente como resumo irreversível com sal (scrypt) e sessões somente pelo resumo (SHA-256) de um token aleatório; o token em si vive em cookie HttpOnly. | Não funcional |
| RNF05 | O front-end nunca acessa o banco: a comunicação segue navegador (`fetch`) → API HTTP em Node.js → PostgreSQL. | Não funcional |
| RNF06 | O sistema deve limitar a 30 as solicitações de cadastro e de login por endereço a cada 15 minutos e a 2 os cálculos de senha simultâneos, respondendo que há excesso de solicitações. | Não funcional |
| RNF07 | A falha de login deve usar a mesma mensagem para usuário inexistente e senha errada, sem revelar se o usuário existe. | Não funcional |
| RNF08 | O cookie de sessão deve ser HttpOnly e SameSite=Lax, e Secure em conexão HTTPS. | Não funcional |

### 3.5 Classificação dos requisitos

- **Funcional:** descreve uma ação ou serviço que o sistema deve oferecer.
- **Não funcional:** define uma característica, restrição ou condição de qualidade do sistema, como o SGBD utilizado e a integridade dos dados.
- **Regra de negócio:** estabelece uma condição ou regra que os dados e as operações do sistema devem respeitar.

---
