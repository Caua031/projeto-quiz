// categoria.js — lista as categorias que vêm da API (RA01) e leva o jogador ao quiz.
// O banco só guarda o nome da categoria; os textos de apresentação ficam aqui, por nome.

const DESCRICOES = {
    "phishing": "Phishing é um golpe virtual onde criminosos usam mensagens falsas (e-mails, SMS, WhatsApp) se passando por marcas confiáveis. O objetivo é enganar você para roubar dados pessoais, senhas ou dinheiro.",
    "malware": "Malware é qualquer software ou programa malicioso criado para infectar, danificar ou invadir computadores e celulares, com o objetivo de roubar dados ou espionar o usuário.",
    "engenharia social": "Engenharia social é a técnica de manipulação psicológica usada por golpistas para ganhar a sua confiança, fazendo com que você entregue informações confidenciais de forma voluntária.",
    "redes": "Redes são as estruturas que conectam dispositivos para trocar dados. Na segurança, foca em proteger o tráfego de internet, wi-fi e conexões contra interceptações de hackers.",
    "protecao de dados": "Proteção de dados envolve práticas, leis e ferramentas para garantir que suas informações pessoais fiquem seguras, privadas e longe do alcance de empresas ou pessoas não autorizadas.",
    "ransomware": "Ransomware é um tipo de malware que sequestra e bloqueia os arquivos do seu aparelho criptografando-os, exigindo um pagamento de resgate para devolver o acesso.",
};
const DESCRICAO_PADRAO = "Teste seus conhecimentos sobre este tema.";

const listaElemento = document.getElementById("listaCategorias");
const statusElemento = document.getElementById("statusCategorias");
const campoBusca = document.getElementById("campoBusca");
const botoesDificuldade = document.querySelectorAll(".btn-dificuldade");

let categorias = [];
let dificuldadeEscolhida = null; // null = qualquer dificuldade

// minúsculas e sem acento, para comparar nomes e filtrar a busca
function normalizar(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function criarCartao(categoria) {
    const item = document.createElement("li");
    item.className = "categoria-item";

    const titulo = document.createElement("h1");
    titulo.textContent = categoria.nome;

    const descricao = document.createElement("p");
    descricao.textContent = DESCRICOES[normalizar(categoria.nome)] || DESCRICAO_PADRAO;

    const total = document.createElement("small");
    total.className = "categoria-total";
    total.textContent = categoria.total_perguntas === 1 ? "1 pergunta" : `${categoria.total_perguntas} perguntas`;

    const entrar = document.createElement("button");
    entrar.type = "button";
    entrar.className = "btn-entrar";
    entrar.textContent = "ENTRAR";

    if (categoria.total_perguntas === 0) {
        entrar.disabled = true; // não dá para jogar uma categoria vazia
        entrar.title = "Esta categoria ainda não tem perguntas";
    } else {
        entrar.addEventListener("click", () => entrarNaCategoria(categoria));
    }

    item.append(titulo, descricao, total, entrar);
    return item;
}

function entrarNaCategoria(categoria) {
    const destino = new URLSearchParams({ categoria: categoria.id_categoria });
    if (dificuldadeEscolhida) destino.set("dificuldade", dificuldadeEscolhida);
    window.location.href = `../index.html?${destino}`;
}

function desenharLista() {
    const termo = normalizar(campoBusca.value);
    const visiveis = categorias.filter((c) => normalizar(c.nome).includes(termo));

    listaElemento.replaceChildren(...visiveis.map(criarCartao));

    if (visiveis.length > 0) {
        statusElemento.textContent = "";
    } else if (categorias.length === 0) {
        statusElemento.textContent = "Nenhuma categoria cadastrada ainda.";
    } else {
        statusElemento.textContent = "Nenhuma categoria encontrada para essa busca.";
    }
}

// Clicar numa dificuldade seleciona; clicar de novo desmarca (volta a valer qualquer dificuldade)
botoesDificuldade.forEach((botao) => {
    botao.addEventListener("click", () => {
        const jaSelecionado = botao.classList.contains("selecionada");
        botoesDificuldade.forEach((b) => b.classList.remove("selecionada"));
        dificuldadeEscolhida = null;

        if (!jaSelecionado) {
            botao.classList.add("selecionada");
            dificuldadeEscolhida = botao.dataset.dificuldade;
        }
    });
});

campoBusca.addEventListener("input", desenharLista);

async function carregarCategorias() {
    try {
        const usuario = await exigirConta();
        if (!usuario) return;
        mostrarConta(usuario);
        categorias = await api("/categorias");
        desenharLista();
    } catch (erro) {
        statusElemento.textContent = erro.message;
    }
}

carregarCategorias();
