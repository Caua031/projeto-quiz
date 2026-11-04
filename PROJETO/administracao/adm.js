const botoes = document.querySelectorAll(".btn-menu");
const secoes = document.querySelectorAll(".secao");

function abrirSecao(nome) {
    botoes.forEach((b) => b.classList.toggle("active", b.dataset.secao === nome));
    secoes.forEach((s) => s.classList.toggle("ativa", s.id === `secao-${nome}`));
    if (typeof carregadores !== "undefined" && carregadores[nome]) carregadores[nome]();
}

botoes.forEach((b) => {
    b.addEventListener("click", () => abrirSecao(b.dataset.secao));
});

// A seção inicial é aberta depois de configurar os carregadores.

// ---- Dashboard: consultas da API (RA01 categorias, RA06 publicadores, RA07 fontes repetidas) ----
function criarTabela(titulo, colunas, linhas) {
    const bloco = document.createElement("div");
    bloco.className = "dash-bloco";

    const h3 = document.createElement("h3");
    h3.textContent = titulo;

    const tabela = document.createElement("table");
    tabela.className = "dash-tabela";

    const cabecalho = tabela.createTHead().insertRow();
    colunas.forEach((nome) => {
        const th = document.createElement("th");
        th.textContent = nome;
        cabecalho.appendChild(th);
    });

    const corpo = tabela.createTBody();
    if (linhas.length === 0) {
        const td = corpo.insertRow().insertCell();
        td.colSpan = colunas.length;
        td.className = "dash-vazio";
        td.textContent = "Nada por aqui ainda.";
    }
    linhas.forEach((valores) => {
        const tr = corpo.insertRow();
        valores.forEach((valor) => {
            tr.insertCell().textContent = valor;
        });
    });

    bloco.append(h3, tabela);
    return bloco;
}

async function carregarDashboard() {
    const alvo = document.getElementById("dashboard-conteudo");
    alvo.textContent = "Carregando...";

    try {
        const [categorias, publicadores, fontes] = await Promise.all([
            api("/categorias"),
            api("/publicadores/mais-citados"),
            api("/fontes/repetidas"),
        ]);

        alvo.replaceChildren(
            criarTabela("Categorias", ["Categoria", "Perguntas"],
                categorias.map((c) => [c.nome, c.total_perguntas])),
            criarTabela("Publicadores mais citados", ["Publicador", "Perguntas"],
                publicadores.map((p) => [p.publicador, p.total_perguntas])),
            criarTabela("Fontes citadas por mais de uma pergunta", ["Fonte", "URL", "Perguntas"],
                fontes.map((f) => [f.titulo, f.url, f.total_perguntas]))
        );
    } catch (erro) {
        alvo.textContent = erro.message;
    }
}

function elemento(tag, texto, classe) {
    const el = document.createElement(tag);
    if (texto !== undefined) el.textContent = texto;
    if (classe) el.className = classe;
    return el;
}

function botao(texto, acao, classe = "adm-botao") {
    const b = elemento("button", texto, classe);
    b.type = "button";
    b.addEventListener("click", acao);
    return b;
}

function preparar(nome, titulo) {
    const secao = document.getElementById(`secao-${nome}`);
    const mensagem = elemento("p", "Carregando...", "adm-status");
    mensagem.setAttribute("role", "status");
    const conteudo = elemento("div");
    secao.replaceChildren(elemento("h2", titulo), mensagem, conteudo);
    return { mensagem, conteudo };
}

function avisar(alvo, texto, erro = false) {
    alvo.textContent = texto;
    alvo.classList.toggle("erro", erro);
}

async function enviar(caminho, method, dados) {
    return api(caminho, { method, ...(dados === undefined ? {} : { body: JSON.stringify(dados) }) });
}

function tabelaGerenciavel(colunas, linhas) {
    const rolagem = elemento("div", undefined, "adm-rolagem");
    const tabela = elemento("table", undefined, "dash-tabela adm-tabela");
    const cabeca = tabela.createTHead().insertRow();
    colunas.forEach(c => cabeca.append(elemento("th", c)));
    const corpo = tabela.createTBody();
    if (!linhas.length) {
        const celula = corpo.insertRow().insertCell();
        celula.colSpan = colunas.length;
        celula.textContent = "Nenhum registro encontrado.";
    }
    for (const linha of linhas) {
        const tr = corpo.insertRow();
        for (const valor of linha) {
            const td = tr.insertCell();
            if (valor instanceof Node) td.append(valor);
            else td.textContent = valor;
        }
    }
    rolagem.append(tabela);
    return rolagem;
}

function selecionar(select, lista, id, nome, selecionado) {
    select.replaceChildren(new Option("Selecione...", ""), ...lista.map(item => new Option(item[nome], item[id])));
    select.value = selecionado == null ? "" : String(selecionado);
}

async function carregarPerguntas() {
    const { mensagem, conteudo } = preparar("perguntas", "Perguntas");
    try {
        let [perguntas, referencias] = await Promise.all([api("/admin/perguntas"), api("/admin/referencias")]);
        let editando = null;
        const form = elemento("form", undefined, "adm-form");
        form.innerHTML = `
            <h3 id="titulo-editor">Nova pergunta</h3>
            <div class="adm-campos">
              <label>Código<input name="codigo" required maxlength="20" placeholder="Ex.: fact-007"></label>
              <label>Título<input name="titulo" required maxlength="150"></label>
              <label>Categoria<select name="id_categoria" required></select></label>
              <label>Dificuldade<select name="id_dificuldade" required></select></label>
            </div>
            <label>Enunciado<textarea name="enunciado" required maxlength="10000"></textarea></label>
            <label>Explicação<textarea name="explicacao" required maxlength="10000"></textarea></label>
            <label>Fonte existente<select name="fonte_existente"></select></label>
            <div class="adm-campos">
              <label>URL da fonte<input name="fonte_url" type="url" required maxlength="2048" placeholder="https://..."></label>
              <label>Título da nova fonte<input name="fonte_titulo" maxlength="250"></label>
              <label>Publicador da nova fonte<select name="id_publicador"></select></label>
              <label>Idioma da nova fonte<select name="id_idioma"></select></label>
            </div>
            <p class="adm-ajuda">Para reutilizar uma fonte, selecione-a na lista. Para uma nova, preencha URL, título, publicador e idioma.</p>
            <fieldset><legend>Alternativas — marque a correta</legend><div id="alternativas-editor"></div></fieldset>
            <label>Palavras-chave, separadas por vírgula<input name="palavras" placeholder="segurança, senha"></label>
            <div class="adm-acoes"><button type="submit" class="adm-botao">Salvar pergunta</button><button type="button" class="adm-botao secundario" id="cancelar-pergunta">Limpar / cancelar</button></div>`;
        const campo = nome => form.elements.namedItem(nome);
        const alternativas = form.querySelector("#alternativas-editor");
        for (let i = 0; i < 4; i++) {
            const linha = elemento("label", undefined, "adm-alternativa");
            const radio = document.createElement("input");
            radio.type = "radio"; radio.name = "correta"; radio.value = i; radio.required = true;
            radio.setAttribute("aria-label", `Alternativa ${'ABCD'[i]} correta`);
            const input = document.createElement("input");
            input.name = `alternativa_${i}`; input.maxLength = 10000;
            input.required = i < 2; input.placeholder = i < 2 ? "Texto obrigatório" : "Opcional";
            linha.append(radio, elemento("span", 'ABCD'[i]), input);
            alternativas.append(linha);
        }
        function atualizarReferencias() {
            selecionar(campo("id_categoria"), referencias.categorias, "id_categoria", "nome");
            selecionar(campo("id_dificuldade"), referencias.dificuldades, "id_dificuldade", "descricao");
            selecionar(campo("fonte_existente"), referencias.fontes, "url", "titulo");
            selecionar(campo("id_publicador"), referencias.publicadores, "id_publicador", "nome");
            selecionar(campo("id_idioma"), referencias.idiomas, "id_idioma", "descricao");
        }
        atualizarReferencias();
        campo("fonte_existente").addEventListener("change", () => {
            campo("fonte_url").value = campo("fonte_existente").value;
        });
        function limpar() {
            form.reset(); editando = null; campo("codigo").readOnly = false;
            form.querySelector("h3").textContent = "Nova pergunta";
        }
        form.querySelector("#cancelar-pergunta").addEventListener("click", limpar);
        const busca = document.createElement("input");
        busca.type = "search"; busca.placeholder = "Buscar por código, título ou categoria";
        busca.setAttribute("aria-label", "Buscar perguntas"); busca.className = "adm-busca";
        const lista = elemento("div");
        function desenhar() {
            const termo = busca.value.toLocaleLowerCase("pt-BR");
            lista.replaceChildren(tabelaGerenciavel(["Código", "Título", "Categoria", "Dificuldade", "Ações"], perguntas.filter(p => `${p.codigo} ${p.titulo} ${p.categoria}`.toLocaleLowerCase("pt-BR").includes(termo)).map(p => {
                const acoes = elemento("div", undefined, "adm-acoes");
                acoes.append(botao("Editar", () => {
                    limpar(); editando = p.codigo;
                    for (const nome of ["codigo", "titulo", "enunciado", "explicacao", "id_categoria", "id_dificuldade", "fonte_url", "palavras"]) campo(nome).value = p[nome];
                    campo("fonte_existente").value = p.fonte_url;
                    p.alternativas.forEach((a, i) => {
                        campo(`alternativa_${i}`).value = a.texto;
                        if (a.correta) form.querySelector(`input[name="correta"][value="${i}"]`).checked = true;
                    });
                    campo("codigo").readOnly = true;
                    form.querySelector("h3").textContent = `Editar ${p.codigo}`;
                    form.scrollIntoView({ behavior: "smooth", block: "start" });
                }), botao("Excluir", async event => {
                    if (!confirm(`Excluir a pergunta ${p.codigo}?`)) return;
                    event.currentTarget.disabled = true;
                    try {
                        await enviar(`/admin/perguntas/${encodeURIComponent(p.codigo)}`, "DELETE");
                        perguntas = perguntas.filter(item => item.codigo !== p.codigo);
                        if (editando === p.codigo) limpar();
                        desenhar(); avisar(mensagem, "Pergunta excluída.");
                    } catch (e) { avisar(mensagem, e.message, true); event.target.disabled = false; }
                }, "adm-botao perigo"));
                return [p.codigo, p.titulo, p.categoria, p.dificuldade, acoes];
            })));
        }
        busca.addEventListener("input", desenhar);
        form.addEventListener("submit", async event => {
            event.preventDefault();
            const dados = Object.fromEntries(new FormData(form));
            const preenchidas = [0, 1, 2, 3].filter(i => campo(`alternativa_${i}`).value.trim());
            dados.alternativas = preenchidas.map(i => ({ texto: campo(`alternativa_${i}`).value, correta: dados.correta === String(i) }));
            if (!dados.alternativas.some(a => a.correta)) return avisar(mensagem, "Preencha o texto da alternativa marcada como correta.", true);
            const salvar = form.querySelector('[type="submit"]'); salvar.disabled = true;
            try {
                await enviar(`/admin/perguntas${editando ? '/' + encodeURIComponent(editando) : ''}`, editando ? "PUT" : "POST", dados);
                [perguntas, referencias] = await Promise.all([api("/admin/perguntas"), api("/admin/referencias")]);
                atualizarReferencias(); limpar(); desenhar(); avisar(mensagem, "Pergunta salva.");
            } catch (e) { avisar(mensagem, e.message, true); }
            finally { salvar.disabled = false; }
        });
        conteudo.append(form, busca, lista); desenhar(); avisar(mensagem, "");
    } catch (e) { avisar(mensagem, e.message, true); }
}

async function carregarCadastros(tipo) {
    const categoria = tipo === "categorias";
    const { mensagem, conteudo } = preparar(tipo, categoria ? "Categorias" : "Usuários");
    const rotaLista = categoria ? "/categorias" : "/admin/usuarios";
    const chave = categoria ? "id_categoria" : "id_jogador";
    try {
        let registros = await api(rotaLista);
        let editando = null;
        const form = elemento("form", undefined, "adm-form");
        const label = elemento("label", categoria ? "Nome da categoria" : "Nome do jogador");
        const input = document.createElement("input"); input.required = true; input.maxLength = categoria ? 60 : 80;
        label.append(input);
        const loginLabel = elemento("label", "Nome de usuário para login");
        const loginInput = document.createElement("input"); loginInput.maxLength = 40; loginInput.minLength = 3; loginInput.autocomplete = "off";
        loginLabel.append(loginInput);
        const senhaLabel = elemento("label", "Senha (deixe vazia para manter a atual ao editar)");
        const senhaInput = document.createElement("input"); senhaInput.type = "password"; senhaInput.minLength = 8; senhaInput.maxLength = 128; senhaInput.autocomplete = "new-password";
        senhaLabel.append(senhaInput);
        if (!categoria) { loginInput.required = true; senhaInput.required = true; }
        const salvar = elemento("button", "Cadastrar", "adm-botao"); salvar.type = "submit";
        const cancelar = botao("Cancelar edição", limpar, "adm-botao secundario");
        const acoes = elemento("div", undefined, "adm-acoes"); acoes.append(salvar, cancelar);
        form.append(label);
        if (!categoria) form.append(loginLabel, senhaLabel, elemento("p", "Para criar acesso de um jogador antigo, edite o registro e informe um nome de usuário e uma senha. Nome de exibição e pontuação serão preservados.", "adm-ajuda"));
        form.append(acoes);
        const lista = elemento("div");
        const busca = document.createElement("input"); busca.type = "search"; busca.placeholder = "Buscar por nome"; busca.className = "adm-busca"; busca.setAttribute("aria-label", "Buscar por nome");
        function limpar() {
            editando = null; input.value = ""; salvar.textContent = "Cadastrar";
            loginInput.value = ""; loginInput.readOnly = false; senhaInput.value = "";
            senhaInput.required = !categoria;
        }
        function desenhar() {
            const colunas = categoria ? ["Nome", "Perguntas", "Ações"] : ["Nome", "Login", "Perfil", "Tentativas", "Pontos acumulados", "Ações"];
            lista.replaceChildren(tabelaGerenciavel(colunas, registros.filter(r => r.nome.toLocaleLowerCase("pt-BR").includes(busca.value.toLocaleLowerCase("pt-BR"))).map(r => {
                const botoes = elemento("div", undefined, "adm-acoes");
                botoes.append(botao("Editar", () => {
                    editando = r[chave]; input.value = r.nome; salvar.textContent = "Salvar alteração";
                    loginInput.value = r.login || ""; loginInput.readOnly = !!r.login;
                    senhaInput.value = ""; senhaInput.required = !categoria && !r.login;
                    input.focus();
                }), botao("Excluir", async () => {
                    if (!confirm(`Excluir ${r.nome}?`)) return;
                    try {
                        await enviar(`/admin/${tipo}/${r[chave]}`, "DELETE");
                        registros = await api(rotaLista); if (editando === r[chave]) limpar();
                        desenhar(); avisar(mensagem, "Registro excluído.");
                    } catch (e) { avisar(mensagem, e.message, true); }
                }, "adm-botao perigo"));
                return categoria ? [r.nome, r.total_perguntas, botoes] : [r.nome, r.login || "Sem login", r.administrador ? "Administrador" : "Jogador", r.tentativas, r.pontos, botoes];
            })));
        }
        form.addEventListener("submit", async event => {
            event.preventDefault(); salvar.disabled = true;
            try {
                const dados = { nome: input.value };
                if (!categoria) { dados.login = loginInput.value; if (senhaInput.value) dados.senha = senhaInput.value; }
                await enviar(editando ? `/admin/${tipo}/${editando}` : categoria ? "/admin/categorias" : "/admin/usuarios", editando ? "PUT" : "POST", dados);
                registros = await api(rotaLista); limpar(); desenhar(); avisar(mensagem, "Registro salvo.");
            } catch (e) { avisar(mensagem, e.message, true); }
            finally { salvar.disabled = false; }
        });
        busca.addEventListener("input", desenhar);
        conteudo.append(form, busca, lista); desenhar(); avisar(mensagem, "");
    } catch (e) { avisar(mensagem, e.message, true); }
}

async function carregarRanking() {
    const { mensagem, conteudo } = preparar("ranking", "Ranking");
    try {
        const ranking = await api("/ranking");
        conteudo.append(elemento("p", "Classificação pela soma dos pontos das partidas concluídas.", "adm-ajuda"),
            botao("Atualizar ranking", carregarRanking),
            tabelaGerenciavel(["Posição", "Jogador", "Partidas concluídas", "Pontos"], ranking.map((r, i) => [i + 1, r.nome, r.partidas, r.pontos.toLocaleString("pt-BR")])));
        avisar(mensagem, "");
    } catch (e) { avisar(mensagem, e.message, true); }
}

async function carregarConfiguracoes() {
    const { mensagem, conteudo } = preparar("configuracoes", "Configurações");
    try {
        const dados = await api("/admin/configuracoes");
        const form = elemento("form", undefined, "adm-form");
        form.innerHTML = `<label>Perguntas por rodada (1 a 50)<input name="perguntas_por_rodada" type="number" min="1" max="50" required></label>
            <label>Pontos por acerto (1 a 10.000)<input name="pontos_por_acerto" type="number" min="1" max="10000" required></label>
            <p class="adm-ajuda">O limite de perguntas vale para novas rodadas. Os pontos por acerto são aplicados ao concluir cada partida. Pontuações já registradas são preservadas.</p>
            <button class="adm-botao" type="submit">Salvar configurações</button>`;
        for (const chave of Object.keys(dados)) form.elements.namedItem(chave).value = dados[chave];
        form.addEventListener("submit", async event => {
            event.preventDefault(); const b = form.querySelector("button"); b.disabled = true;
            try {
                const valores = Object.fromEntries([...new FormData(form)].map(([k, v]) => [k, Number(v)]));
                await enviar("/admin/configuracoes", "PUT", valores);
                avisar(mensagem, "Configurações salvas.");
            } catch (e) { avisar(mensagem, e.message, true); }
            finally { b.disabled = false; }
        });
        conteudo.append(form); avisar(mensagem, "");
    } catch (e) { avisar(mensagem, e.message, true); }
}

const carregadores = { dashboard: carregarDashboard, perguntas: carregarPerguntas,
    categorias: () => carregarCadastros("categorias"), usuarios: () => carregarCadastros("usuarios"),
    ranking: carregarRanking, configuracoes: carregarConfiguracoes };

document.getElementById("btn-sair").addEventListener("click", async event => {
    const b = event.currentTarget; b.disabled = true;
    try { await sairDaConta(); } catch (e) { b.disabled = false; alert(e.message); }
});
document.querySelector(".cabecalho h1").textContent = "Administração — Tech Trivia";
exigirConta(true).then(usuario => {
    if (usuario) abrirSecao("dashboard");
}).catch(e => { document.getElementById("dashboard-conteudo").textContent = e.message; document.getElementById("secao-dashboard").classList.add("ativa"); });
