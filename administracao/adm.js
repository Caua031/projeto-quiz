const botoes = document.querySelectorAll(".btn-menu");
const secoes = document.querySelectorAll(".secao");

function abrirSecao(nome) {
    botoes.forEach((b) => b.classList.toggle("active", b.dataset.secao === nome));
    secoes.forEach((s) => s.classList.toggle("ativa", s.id === `secao-${nome}`));
}

botoes.forEach((b) => {
    b.addEventListener("click", () => abrirSecao(b.dataset.secao));
});

abrirSecao("dashboard"); // seção inicial

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

carregarDashboard();
