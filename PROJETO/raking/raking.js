document.getElementById('btn-voltar').addEventListener('click', () => {
    window.location.href = '../categorias/categoria.html';
});

function el(tag, texto, classe) {
    const item = document.createElement(tag);
    if (texto !== undefined) item.textContent = texto;
    if (classe) item.className = classe;
    return item;
}

function avatar() {
    const img = document.createElement('img');
    img.src = '../imagens/perfil.png'; img.alt = 'Avatar do jogador';
    return img;
}

async function carregarRanking() {
    const podio = document.querySelector('.class-jogadores');
    const lista = document.querySelector('.list-raking');
    const status = document.getElementById('ranking-status');
    podio.replaceChildren(); lista.replaceChildren();
    status.textContent = 'Carregando ranking...';
    try {
        const jogadores = await api('/ranking');
        const primeiros = jogadores.slice(0, 3).map((j, i) => ({ ...j, posicao: i + 1 }));
        if (primeiros.length > 1) [primeiros[0], primeiros[1]] = [primeiros[1], primeiros[0]];
        for (const jogador of primeiros) {
            const item = el('li', undefined, 'list-jogador');
            const barra = el('div', undefined, `barra-ranking barra-${jogador.posicao === 1 ? 2 : jogador.posicao === 2 ? 1 : 3}`);
            barra.append(el('h2', jogador.posicao), el('h3', `${jogador.pontos.toLocaleString('pt-BR')} PTS`));
            item.append(avatar(), el('h1', jogador.nome), barra);
            podio.append(item);
        }
        jogadores.slice(3).forEach((j, i) => {
            const item = el('li', undefined, 'raking');
            item.append(el('h1', i + 4), avatar(), el('h2', j.nome), el('h3', `${j.pontos.toLocaleString('pt-BR')} PTS`));
            lista.append(item);
        });
        status.textContent = jogadores.length ? 'Pontos acumulados nas partidas concluídas.' : 'Nenhuma partida concluída ainda. Jogue uma rodada para aparecer aqui!';
        podio.hidden = !jogadores.length;
    } catch (erro) { status.textContent = erro.message; }
}

carregarRanking();
