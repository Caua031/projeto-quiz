const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

// ===== AJUSTES =====
const CELULA = 100;            // espaço entre ícones (menor = mais cheio)
const OPACIDADE = 0.3;         // brilho geral dos ícones
const TAMANHO = [20, 52];      // tamanho mínimo e máximo (px)
const VELOCIDADE = [10, 34];   // px por segundo
const CORES = [
    "174, 223, 242",           // azul claro (#AEDFF2)
    "143, 185, 214",           // azul médio (#8fb9d6)
    "239, 228, 210",           // bege (#EFE4D2)
    "94, 234, 212",            // verde-água de destaque
];
// ===================

const reduzMovimento = false; // use matchMedia aqui se for publicar
const rand = (min, max) => Math.random() * (max - min) + min;

const ICONES = [
    // cadeado
    { path: new Path2D("M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-3.1 0H9.1V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 2.7 1.39 2.7 3.1v2z") },
    // escudo
    { path: new Path2D("M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z") },
    // chave
    { path: new Path2D("M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z") },
    // cadeado aberto
    { path: new Path2D("M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z") },
    // olho
    { path: new Path2D("M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z") },
    // bug
    { path: new Path2D("M20 8h-2.81a5.985 5.985 0 0 0-1.82-1.96L17 4.41 15.59 3l-2.17 2.17a5.9 5.9 0 0 0-2.84 0L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z") },
    // nuvem
    { path: new Path2D("M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z") },
    // wifi
    { path: new Path2D("M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 0 0-6 0zm-4-4l2 2a7.074 7.074 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z") },
    { texto: "</>" }, { texto: "01" }, { texto: "?" }, { texto: "{ }" },
    { texto: ">_" },  { texto: "##" }, { texto: "***" }, { texto: "0xFF" },
    { texto: "SQL" }, { texto: "!" },
];

let largura, altura, dpr, cicloY;
let itens = [];

function criarItem(x, y) {
    const prof = Math.random(); // 0 = longe, 1 = perto
    return {
        icone: ICONES[Math.floor(Math.random() * ICONES.length)],
        cor: CORES[Math.floor(Math.random() * CORES.length)],
        x, y,
        tam: TAMANHO[0] + (TAMANHO[1] - TAMANHO[0]) * prof,
        vel: VELOCIDADE[0] + (VELOCIDADE[1] - VELOCIDADE[0]) * prof,
        alpha: 0.45 + 0.55 * prof,
        rot: rand(-0.6, 0.6),
        giro: rand(-0.15, 0.15),
        fase: rand(0, Math.PI * 2),
    };
}

// Só um pouco mais discreto no centro (onde fica o quiz)
function visibilidade(x, y) {
    const dx = (x - largura / 2) / (largura / 2);
    const dy = (y - altura / 2) / (altura / 2);
    return 0.55 + 0.45 * Math.min(1, Math.hypot(dx, dy));
}

function desenhar(it) {
    ctx.save();
    ctx.translate(it.x, it.y);
    ctx.rotate(it.rot);
    ctx.globalAlpha = OPACIDADE * it.alpha * visibilidade(it.x, it.y);
    ctx.strokeStyle = `rgb(${it.cor})`;
    ctx.fillStyle = `rgb(${it.cor})`;

    if (it.icone.path) {
        const s = it.tam / 24;
        ctx.scale(s, s);
        ctx.translate(-12, -12);
        ctx.lineWidth = 1.3 / s;
        ctx.lineJoin = "round";
        ctx.stroke(it.icone.path);
    } else {
        ctx.font = `bold ${it.tam * 0.7}px monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(it.icone.texto, 0, 0);
    }
    ctx.restore();
}

function quadro(dt) {
    ctx.clearRect(0, 0, largura, altura);
    for (const it of itens) {
        if (!reduzMovimento) {
            it.y -= it.vel * dt;
            it.rot += it.giro * dt;
            it.fase += dt;
            it.x += Math.sin(it.fase) * 4 * dt;
        }
        if (it.y < -CELULA) it.y += cicloY; // volta para baixo, mantendo a densidade
        desenhar(it);
    }
}

function redimensionar() {
    dpr = window.devicePixelRatio || 1;
    largura = window.innerWidth;
    altura = window.innerHeight;
    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // grade com deslocamento aleatório: preenche a tela por igual
    const cols = Math.ceil(largura / CELULA) + 1;
    const rows = Math.ceil(altura / CELULA) + 2;
    cicloY = rows * CELULA;
    itens = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            itens.push(criarItem(
                c * CELULA + rand(-CELULA * 0.35, CELULA * 0.35),
                r * CELULA + rand(-CELULA * 0.35, CELULA * 0.35)
            ));
        }
    }
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
requestAnimationFrame(loop);