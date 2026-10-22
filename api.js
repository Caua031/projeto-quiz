// api.js — ponte entre o front-end e o servidor (Express, porta 3001).
// Incluir ANTES do script de cada página que usa a API.
//
// Se a página foi aberta pelo próprio servidor (http://localhost:3001), a API fica na mesma origem
// e o caminho é só "/api". Se foi aberta de outro jeito (Live Server, arquivo direto...), aponta
// para http://localhost:3001/api — o servidor já libera CORS para isso.

const mesmaOrigem =
    window.location.protocol.startsWith("http") &&
    (window.location.port === "3001" || window.location.port === "");

const API_BASE = mesmaOrigem ? "/api" : "http://localhost:3001/api";

// api("/categorias")                                  -> GET
// api("/perguntas/fact-001/resposta", { method: "POST", body: JSON.stringify({ letra: "A" }) })
// Devolve o JSON da resposta. Em erro, lança Error com a mensagem em português do servidor.
async function api(caminho, opcoes = {}) {
    const cabecalhos = { ...opcoes.headers };
    if (opcoes.body) cabecalhos["Content-Type"] = "application/json";

    let resposta;
    try {
        resposta = await fetch(API_BASE + caminho, { ...opcoes, headers: cabecalhos });
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

