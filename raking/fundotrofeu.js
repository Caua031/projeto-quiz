const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");

// ===== AJUSTES =====
const DENSIDADE = 22000;       // px² de tela por item (menor = mais itens)
const MIN_ITENS = 30;
const MAX_ITENS = 90;
const OPACIDADE = 0.55;        // brilho geral
const TAMANHO = [20, 52];      // tamanho dos ícones (px)
const VELOCIDADE = [40, 110];  // queda em px por segundo
const PROPORCAO_CONFETE = 0.35; // 0 = só ícones, 1 = só confete
// ===================

const reduzMovimento = false; // use matchMedia aqui se for publicar
const rand = (min, max) => Math.random() * (max - min) + min;
const sorteia = (lista) => lista[Math.floor(Math.random() * lista.length)];

// Ícones (viewBox 24x24)
const FORMAS = [
    // troféu
    new Path2D("M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"),
    // estrela
    new Path2D("M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"),
    // medalha (fita + disco)
    new Path2D("M7 2h4l1.5 7-3.5 2z M17 2h-4l-1.5 7 3.5 2z M12 9a6 6 0 1 0 0 12a6 6 0 1 0 0-12z"),
    // coroa
    new Path2D("M3 7l4.5 4L12 4l4.5 7L21 7l-2 10H5z M5 19h14v2H5z"),
];

const CORES_ICONE = [
    "255, 193, 7",    // ouro
    "255, 193, 7",    // ouro (aparece mais vezes)
    "158, 173, 189",  // prata
    "205, 127, 80",   // bronze
];
const CORES_CONFETE = [
    "255, 99, 132", "54, 162, 235", "255, 206, 86",
    "75, 192, 192", "153, 102, 255", "255, 159, 64",
];

let largura, altura, dpr;
let itens = [];

function criarItem(inicio = false) {
    const confete = Math.random() < PROPORCAO_CONFETE;
    const prof = Math.random(); // 0 = longe, 1 = perto
    return {
        confete,
        forma: sorteia(FORMAS),
        cor: confete ? sorteia(CORES_CONFETE) : sorteia(CORES_ICONE),
        x: rand(0, largura),
        y: inicio ? rand(0, altura) : rand(-80, -20),
        tam: confete ? rand(6, 12) : TAMANHO[0] + (TAMANHO[1] - TAMANHO[0]) * prof,
        vel: VELOCIDADE[0] + (VELOCIDADE[1] - VELOCIDADE[0]) * (confete ? rand(0.2, 0.8) : prof),
        alpha: confete ? rand(0.6, 1) : 0.5 + 0.5 * prof,
        rot: rand(0, Math.PI * 2),
        giro: rand(-1.2, 1.2),   // rad/s (rodopia caindo)
        fase: rand(0, Math.PI * 2),
        balanco: rand(8, 24),    // amplitude do balanço lateral
    };
}

function desenhar(it) {
    ctx.save();
    ctx.translate(it.x + Math.sin(it.fase) * it.balanco, it.y);
    ctx.rotate(it.rot);
    ctx.globalAlpha = OPACIDADE * it.alpha;
    ctx.fillStyle = `rgb(${it.cor})`;

    if (it.confete) {
        ctx.fillRect(-it.tam / 2, -it.tam / 4, it.tam, it.tam / 2);
    } else {
        const s = it.tam / 24;
        ctx.scale(s, s);
        ctx.translate(-12, -12);
        ctx.fill(it.forma);
        ctx.lineWidth = 1 / s;
        ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
        ctx.stroke(it.forma);
    }
    ctx.restore();
}

function quadro(dt) {
    ctx.clearRect(0, 0, largura, altura);
    for (let i = 0; i < itens.length; i++) {
        const it = itens[i];
        if (!reduzMovimento) {
            it.y += it.vel * dt;
            it.rot += it.giro * dt;
            it.fase += dt * 1.5;
        }
        if (it.y > altura + 60) itens[i] = criarItem();
        else desenhar(it);
    }
}

function redimensionar() {
    dpr = window.devicePixelRatio || 1;
    largura = window.innerWidth;
    altura = window.innerHeight;
    canvas.width = largura * dpr;
    canvas.height = altura * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const qtd = Math.min(MAX_ITENS, Math.max(MIN_ITENS, Math.round((largura * altura) / DENSIDADE)));
    itens = Array.from({ length: qtd }, () => criarItem(true));
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