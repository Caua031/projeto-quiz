// api.js — ponte entre o front-end e o servidor (Express, porta 3000).
// Incluir ANTES do script de cada página que usa a API.
//
// Se a página foi aberta pelo próprio servidor (http://localhost:3000), a API fica na mesma origem
// e o caminho é só "/api". Se foi aberta de outro jeito (Live Server, arquivo direto...), aponta
// para http://localhost:3000/api — o servidor já libera CORS para isso.

const mesmaOrigem =
    window.location.protocol.startsWith("http") &&
    (window.location.port === "3000" || window.location.port === "");

const API_BASE = mesmaOrigem ? "/api" : "http://localhost:3000/api";

// api("/categorias")                                  -> GET
// api("/perguntas/fact-001/resposta", { method: "POST", body: JSON.stringify({ letra: "A" }) })
// Devolve o JSON da resposta. Em erro, lança Error com a mensagem em português do servidor.
async function api(caminho, opcoes = {}) {
    const cabecalhos = { ...opcoes.headers };
    if (opcoes.body) cabecalhos["Content-Type"] = "application/json";

    let resposta;
    try {
        resposta = await fetch(API_BASE + caminho, { ...opcoes, credentials: "include", headers: cabecalhos });
    } catch (erro) {
        throw new Error("Não foi possível falar com o servidor. Ele está rodando? (npm start na pasta Servidor)");
    }

    let corpo = null;
    try {
        corpo = await resposta.json();
    } catch (erro) {
        // resposta sem JSON: cai na mensagem genérica abaixo
    }

    if (!resposta.ok) {
        const falha = new Error((corpo && corpo.erro) || `Erro ${resposta.status} ao falar com o servidor.`);
        falha.status = resposta.status;
        throw falha;
    }
    return corpo;
}

const SITE_BASE = new URL('.', document.currentScript.src);
function urlDoSite(caminho) { return new URL(caminho, SITE_BASE).href; }

async function exigirConta(administrador = false) {
    try {
        const usuario = await api('/auth/eu');
        if (administrador && !usuario.administrador) {
            window.location.replace(urlDoSite('categorias/categoria.html?aviso=administrador'));
            return null;
        }
        return usuario;
    } catch (erro) {
        if (erro.status === 401) {
            const destino = administrador ? '?destino=administracao' : '';
            window.location.replace(urlDoSite('cadastro/cadastro.html' + destino));
            return null;
        }
        throw erro;
    }
}

async function sairDaConta() {
    await api('/auth/sair', { method: 'POST' });
    localStorage.removeItem('jogadorAtual');
    window.location.replace(urlDoSite('cadastro/cadastro.html'));
}

function mostrarConta(usuario, alvo = document.body) {
    const barra = document.createElement('nav'); barra.className = 'conta-barra';
    barra.setAttribute('aria-label', 'Sua conta');
    const nome = document.createElement('span'); nome.textContent = usuario.nome;
    const ranking = document.createElement('a'); ranking.href = urlDoSite('raking/raking.html'); ranking.textContent = 'Ranking';
    barra.append(nome, ranking);
    if (usuario.administrador) {
        const adm = document.createElement('a'); adm.href = urlDoSite('administracao/adm.html'); adm.textContent = 'Administração'; barra.append(adm);
    }
    const sair = document.createElement('button'); sair.type = 'button'; sair.textContent = 'Sair';
    sair.addEventListener('click', async () => {
        sair.disabled = true;
        try { await sairDaConta(); } catch (e) { sair.disabled = false; alert(e.message); }
    });
    barra.append(sair); alvo.prepend(barra);
}
