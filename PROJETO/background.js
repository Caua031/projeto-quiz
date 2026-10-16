const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

// ===== AJUSTES =====
const PASSO = 48;              // tamanho da grade (maior = trilhas mais espaçadas)
const COR = "255, 255, 255";   // cor das trilhas e pulsos (R, G, B)
const OPACIDADE_TRILHA = 0.27; // deixe mais baixo para ficar mais discreto
const NUM_PULSOS = 6;          // quantos pulsos de luz ao mesmo tempo
const VELOCIDADE = [40, 80];   // px por segundo (mín, máx)
const CAUDA = 90;              // comprimento do rastro do pulso
// ===================

const DIRECOES = [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];
const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (min, max) => Math.random() * (max - min) + min;

// As trilhas são desenhadas uma vez só numa camada separada
const camada = document.createElement("canvas");
const cctx = camada.getContext("2d");

let largura, altura, dpr;
let trilhas = [];
let pulsos = [];

function criarTrilha(pontosGrade) {
    const pts = pontosGrade.map(([x, y]) => ({ x: x * PASSO, y: y * PASSO }));
    const cum = [0];
    for (let i = 1; i < pts.length; i++) {
        cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    }
    return { pts, cum, total: cum[cum.length - 1] };
}

function gerarTrilhas() {
    const cols = Math.ceil(largura / PASSO) + 1;
    const rows = Math.ceil(altura / PASSO) + 1;
    const ocupado = new Set();
    const chave = (x, y) => `${x},${y}`;
    const alvo = Math.floor((cols * rows) / 10);

    trilhas = [];
    let tentativas = 0;

    while (trilhas.length < alvo && tentativas < alvo * 20) {
        tentativas++;
        let cx = Math.floor(Math.random() * cols);
        let cy = Math.floor(Math.random() * rows);
        if (ocupado.has(chave(cx, cy))) continue;

        let dir = Math.floor(Math.random() * 8);
        const pontos = [[cx, cy]];
        const marcados = [chave(cx, cy)];
        const trechos = 3 + Math.floor(Math.random() * 6);

        for (let t = 0; t < trechos; t++) {
            const passos = 1 + Math.floor(Math.random() * 4);
            let andou = 0;

            for (let p = 0; p < passos; p++) {
                const nx = cx + DIRECOES[dir][0];
                const ny = cy + DIRECOES[dir][1];
                const k = chave(nx, ny);
                if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) break;
                if (ocupado.has(k) || marcados.includes(k)) break;
                cx = nx; cy = ny;
                marcados.push(k);
                andou++;
            }

            if (!andou) break;
            pontos.push([cx, cy]);
            dir = (dir + (Math.random() < 0.5 ? 1 : 7)) % 8; // vira 45° para um dos lados
        }

        if (pontos.length < 3) continue;
        marcados.forEach((k) => ocupado.add(k));
        trilhas.push(criarTrilha(pontos));
    }
}

function desenharCamada() {
    camada.width = largura * dpr;
    camada.height = altura * dpr;
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cctx.clearRect(0, 0, largura, altura);

    cctx.lineWidth = 1.5;
    cctx.lineJoin = "round";
    cctx.strokeStyle = `rgba(${COR}, ${OPACIDADE_TRILHA})`;

    for (const { pts } of trilhas) {
        cctx.beginPath();
        cctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) cctx.lineTo(pts[i].x, pts[i].y);
        cctx.stroke();

        // terminais quadrados no início e no fim da trilha
        for (const p of [pts[0], pts[pts.length - 1]]) {
            cctx.strokeRect(p.x - 3.5, p.y - 3.5, 7, 7);
        }
    }

    // apaga um pouco o centro para não atrapalhar a leitura
    const cx = largura / 2;
    const cy = altura / 2;
    const g = cctx.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(cx, cy));
    g.addColorStop(0, "rgba(0, 0, 0, 0.75)");
    g.addColorStop(0.7, "rgba(0, 0, 0, 0.2)");
    g.addColorStop(1, "rgba(0, 0, 0, 0)");
    cctx.globalCompositeOperation = "destination-out";
    cctx.fillStyle = g;
    cctx.fillRect(0, 0, largura, altura);
    cctx.globalCompositeOperation = "source-over";
}

// Quanto mais perto do centro, mais discreto
function visibilidade(x, y) {
    const dx = (x - largura / 2) / (largura / 2);
    const dy = (y - altura / 2) / (altura / 2);
    return 0.3 + 0.7 * Math.min(1, Math.hypot(dx, dy));
}

function pontoNaTrilha(trilha, i, d) {
    const a = trilha.pts[i];
    const b = trilha.pts[i + 1];
    const t = (d - trilha.cum[i]) / (trilha.cum[i + 1] - trilha.cum[i]);
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

// pontos da trilha entre as distâncias ini e fim (acompanha as curvas)
function trecho(trilha, ini, fim) {
    const pts = [];
    for (let i = 0; i < trilha.pts.length - 1; i++) {
        const s = trilha.cum[i];
        const e = trilha.cum[i + 1];
        if (e < ini || s > fim) continue;
        pts.push(pontoNaTrilha(trilha, i, Math.max(ini, s)));
        pts.push(pontoNaTrilha(trilha, i, Math.min(fim, e)));
    }
    return pts;
}

function criarPulso(comecoAleatorio = false) {
    const trilha = trilhas[Math.floor(Math.random() * trilhas.length)];
    return {
        trilha,
        d: comecoAleatorio ? rand(0, trilha.total) : 0,
        vel: rand(...VELOCIDADE),
    };
}

function desenharPulso(p) {
    const pts = trecho(p.trilha, Math.max(0, p.d - CAUDA), Math.min(p.d, p.trilha.total));
    if (pts.length < 2) return;

    const cabeca = pts[pts.length - 1];
    const cauda = pts[0];
    const alpha = 0.85 * visibilidade(cabeca.x, cabeca.y);

    const g = ctx.createLinearGradient(cauda.x, cauda.y, cabeca.x, cabeca.y);
    g.addColorStop(0, `rgba(${COR}, 0)`);
    g.addColorStop(1, `rgba(${COR}, ${alpha})`);

    ctx.strokeStyle = g;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = `rgba(${COR}, ${alpha})`;
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.shadowBlur = 0;
}

function quadro(dt) {
    ctx.clearRect(0, 0, largura, altura);
    ctx.drawImage(camada, 0, 0, largura, altura);

    if (reduzMovimento || !pulsos.length) return;

    for (let i = 0; i < pulsos.length; i++) {
        const p = pulsos[i];
        p.d += p.vel * dt;
        if (p.d - CAUDA > p.trilha.total) pulsos[i] = criarPulso();
        else desenharPulso(p);
    }
}

function redimensionar() {
    dpr = window.devicePixelRatio || 1;
    largura = window.innerWidth;
    altura = window.innerHeight;

    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    gerarTrilhas();
    desenharCamada();

    pulsos = trilhas.length
        ? Array.from({ length: NUM_PULSOS }, () => criarPulso(true))
        : [];

    if (reduzMovimento) quadro(0);
}

let ultimo = 0;
function loop(t) {
    const dt = Math.min((t - ultimo) / 1000, 0.1) || 0;
    ultimo = t;
    quadro(dt);
    requestAnimationFrame(loop);
}

let timer;
window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(redimensionar, 200);
});

redimensionar();
if (!reduzMovimento) requestAnimationFrame(loop);