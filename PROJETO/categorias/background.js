// ================================
// CONFIGURAÇÃO DO CANVAS
// ================================
const canvas = document.getElementById("background");
const ctx = canvas.getContext("2d");

let largura = 0;
let altura = 0;
let particulas = [];
let animationId = null;

const distanciaConexao = 135;
const velocidade = 1.35;
const quantidadeMaxima = 110;

// ================================
// CRIAR PARTÍCULAS
// ================================
function criarParticula() {
    return {
        x: Math.random() * largura,
        y: Math.random() * altura,
        vx: (Math.random() - 0.5) * velocidade,
        vy: (Math.random() - 0.5) * velocidade,
        tamanho: Math.random() * 2.4 + 1
    };
}

// ================================
// REDIMENSIONAR O CANVAS
// ================================
function redimensionar() {
    const proporcao = Math.min(window.devicePixelRatio || 1, 2);

    largura = window.innerWidth;
    altura = window.innerHeight;

    canvas.width = largura * proporcao;
    canvas.height = altura * proporcao;

    canvas.style.width = `${largura}px`;
    canvas.style.height = `${altura}px`;

    ctx.setTransform(proporcao, 0, 0, proporcao, 0, 0);

    const quantidade = Math.min(
        quantidadeMaxima,
        Math.max(35, Math.floor((largura * altura) / 14000))
    );

    particulas = Array.from(
        { length: quantidade },
        criarParticula
    );
}

// ================================
// ATUALIZAR MOVIMENTO
// ================================
function atualizarParticula(p) {
    p.x += p.vx;
    p.y += p.vy;

    // Reaparecer do outro lado da tela
    if (p.x < 0) p.x = largura;
    if (p.x > largura) p.x = 0;

    if (p.y < 0) p.y = altura;
    if (p.y > altura) p.y = 0;
}

// ================================
// DESENHAR PARTÍCULAS E CONEXÕES
// ================================
function desenhar() {
    ctx.clearRect(0, 0, largura, altura);

    for (let i = 0; i < particulas.length; i++) {
        const p1 = particulas[i];

        // Desenhar partícula
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, p1.tamanho, 0, Math.PI * 2);
        ctx.fillStyle = "rgb(40, 158, 255)";
        ctx.fill();

        // Conectar partículas próximas
        for (let j = i + 1; j < particulas.length; j++) {
            const p2 = particulas[j];

            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distancia = Math.sqrt(dx * dx + dy * dy);

            if (distancia < distanciaConexao) {
                const opacidade = 1 - distancia / distanciaConexao;

                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);

                ctx.strokeStyle =
                    `rgba(30, 130, 255, ${opacidade * 5.35})`;

                ctx.lineWidth = 0.7;
                ctx.stroke();
            }
        }
    }
}

// ================================
// ANIMAÇÃO CONTÍNUA
// ================================
function animar() {
    for (const particula of particulas) {
        atualizarParticula(particula);
    }

    desenhar();

    animationId = requestAnimationFrame(animar);
}

// ================================
// INICIAR ANIMAÇÃO
// ================================
function iniciarAnimacao() {
    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }

    animar();
}

// ================================
// REDIMENSIONAR A TELA
// ================================
window.addEventListener("resize", () => {
    redimensionar();
});

// ================================
// INICIALIZAÇÃO
// ================================
redimensionar();
iniciarAnimacao();

