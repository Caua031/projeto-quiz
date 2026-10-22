// script.js — tela do quiz.
// As perguntas e a correção vêm da API (Express + PostgreSQL); nada de pergunta fica fixo aqui.
// Filtros opcionais pela URL (a tela de categorias monta isso): index.html?categoria=1&dificuldade=2

const PERGUNTAS_POR_RODADA = 10;
const numeroImagens = ["um-amarelo.png", "dois-amarelo.png", "tres-amarelo.png", "quatro-amarelo.png"];

const parametros = new URLSearchParams(window.location.search);
const filtroCategoria = parametros.get("categoria");
const filtroDificuldade = parametros.get("dificuldade");

const questionElement = document.getElementById("question");
const answerButtons = document.querySelector(".answer-btn");
const nextButton = document.getElementById("next-btn");
const feedbackContainer = document.querySelector(".container");
const feedbackTitle = document.querySelector(".container h1");
const feedbackSubtitle = document.querySelector(".container h2");
const feedbackExplicacao = document.getElementById("explicacao");
const feedbackFonte = document.getElementById("fonte");
const headerTitle = document.querySelector(".quiz h1");
const scoreElement = document.querySelector(".pontos");
const progressContainer = document.getElementById("progress");
const botaoRaking = document.getElementById("raking-jogador");
const botaoCategorias = document.getElementById("voltar-categorias");

// === CARREGAR PERFIL DO JOGADOR NO QUIZ ===
function carregarPerfilJogador() {
    const dadosSalvos = localStorage.getItem('jogadorAtual');
    if (dadosSalvos) {
        const jogador = JSON.parse(dadosSalvos);
        const fotoPerfilQuiz = document.querySelector('.perfil img');
        const nomePerfilQuiz = document.querySelector('.perfil h1');
        if (fotoPerfilQuiz) fotoPerfilQuiz.src = jogador.foto;
        if (nomePerfilQuiz) nomePerfilQuiz.innerText = jogador.nome;
    }
}
carregarPerfilJogador();
// ======================================================

let codigosRodada = [];   // códigos (fact-001, ...) sorteados para esta rodada
let currentQuestionIndex = 0;
let perguntaAtual = null; // pergunta já carregada, com as alternativas (a API NÃO manda o gabarito)
let score = 0;
let ocupado = false;      // evita clique duplo enquanto espera o servidor

// Embaralha sem repetir perguntas dentro da rodada.
function embaralhar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}
function montarFiltros() {
    const consulta = new URLSearchParams();
    if (/^\d+$/.test(filtroCategoria || '')) consulta.set('categoria', filtroCategoria);
    if (/^\d+$/.test(filtroDificuldade || '')) consulta.set('dificuldade', filtroDificuldade);
    const texto = consulta.toString();
    return texto ? '?' + texto : '';
}
// Tela de aviso: sem perguntas para o filtro, ou erro ao falar com o servidor
function mostrarAviso(texto) {
    resetState();
    progressContainer.innerHTML = "";
    headerTitle.textContent = "tech trivia";
    questionElement.textContent = texto;
    nextButton.style.display = "none";
    botaoRaking.style.display = "none";
    botaoCategorias.style.display = "inline-block";
}

async function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    ocupado = true;
    nextButton.innerHTML = "Próximo";
    nextButton.style.display = "none";
    botaoRaking.style.display = "none";
    botaoCategorias.style.display = "none";
    scoreElement.textContent = "pontos: 0";
    resetState();
    questionElement.textContent = "Carregando perguntas...";

    try {
        const lista = await api('/perguntas' + montarFiltros());
        codigosRodada = embaralhar(lista.map(p => p.codigo)).slice(0, PERGUNTAS_POR_RODADA);
    } catch (erro) {
        ocupado = false;
        return mostrarAviso(erro.message);
    }

    if (codigosRodada.length === 0) {
        ocupado = false;
        return mostrarAviso("Ainda não há perguntas para essa combinação de categoria e dificuldade.");
    }

    // Cria as barrinhas de progresso com base no tamanho real da rodada
    createProgressBars();
    await showQuestion();
}

function createProgressBars() {
    progressContainer.innerHTML = ""; // Limpa as barras antigas
    for (let i = 0; i < codigosRodada.length; i++) {
        const barra = document.createElement("div");
        barra.classList.add("barra");
        progressContainer.appendChild(barra);
    }
}

function updateHeaderAndProgress() {
    headerTitle.textContent = `pergunta ${currentQuestionIndex + 1}/${codigosRodada.length}`;
    scoreElement.textContent = `pontos: ${score * 1000}`;

    // Captura as barras que foram geradas dinamicamente
    const barraProgressos = document.querySelectorAll("#progress .barra");
    barraProgressos.forEach((barra, index) => {
        if (index <= currentQuestionIndex) {
            barra.classList.add("active");
        } else {
            barra.classList.remove("active");
        }
    });
}

async function showQuestion() {
    resetState();
    updateHeaderAndProgress();
    ocupado = true;
    questionElement.textContent = "Carregando pergunta...";

    try {
        // RA03: enunciado + alternativas (sem o gabarito)
        perguntaAtual = await api(`/perguntas/${encodeURIComponent(codigosRodada[currentQuestionIndex])}`);
    } catch (erro) {
        ocupado = false;
        return mostrarAviso(erro.message);
    }

    questionElement.textContent = `${currentQuestionIndex + 1}. ${perguntaAtual.enunciado}`;

    perguntaAtual.alternativas.forEach((alternativa, index) => {
        const button = document.createElement("button");
        button.classList.add("btn");
        button.dataset.letra = alternativa.letra;

        const img = document.createElement("img");
        img.src = `imagens/${numeroImagens[index % numeroImagens.length]}`;
        img.alt = `Numero ${index + 1}`;

        const span = document.createElement("span");
        span.textContent = alternativa.texto;

        button.appendChild(img);
        button.appendChild(span);
        answerButtons.appendChild(button);

        button.addEventListener("click", selectAnswer);
    });

    ocupado = false;
}

function resetState() {
    nextButton.style.display = "none";
    feedbackContainer.style.display = "none";
    feedbackContainer.classList.remove("mostrar", "correct", "incorrect"); // Remove a classe de animação
    feedbackExplicacao.textContent = "";
    feedbackFonte.textContent = "";
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

// RA05: explicação + fonte (título com link, publicador e idioma)
function mostrarExplicacao(resultado) {
    feedbackExplicacao.textContent = resultado.explicacao;

    const { titulo, url, publicador, idioma } = resultado.fonte;
    feedbackFonte.textContent = "Fonte: ";
    if (/^https?:\/\//i.test(url)) {
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = titulo;
        feedbackFonte.appendChild(link);
    } else {
        feedbackFonte.append(titulo);
    }
    feedbackFonte.append(` — ${publicador} (${idioma})`);
}

// RA04: quem diz se acertou é o servidor; o gabarito nunca vai para o navegador antes da resposta
async function selectAnswer(e) {
    if (ocupado) return;
    const selectedBtn = e.target.closest(".btn");
    const botoes = Array.from(answerButtons.children);

    ocupado = true;
    botoes.forEach((b) => (b.disabled = true));

    let resultado;
    try {
        resultado = await api(`/perguntas/${encodeURIComponent(perguntaAtual.codigo)}/resposta`, {
            method: "POST",
            body: JSON.stringify({ letra: selectedBtn.dataset.letra }),
        });
    } catch (erro) {
        // deixa o jogador tentar de novo
        botoes.forEach((b) => (b.disabled = false));
        ocupado = false;
        alert(erro.message);
        return;
    }

    if (resultado.acertou) {
        selectedBtn.classList.add("correct");
        feedbackContainer.classList.add("correct");
        score++;

        feedbackTitle.textContent = "PARABÉNS!";
        feedbackSubtitle.textContent = "AAAAAAAAAAAAAAAAAAAH! QUE ACERTO";
    } else {
        selectedBtn.classList.add("incorrect");
        feedbackContainer.classList.add("incorrect");

        feedbackTitle.textContent = "QUE PENA!";
        feedbackSubtitle.textContent = "VOCÊ ERROU ESSA QUESTÃO";
    }

    // Destaca a alternativa correta
    botoes.forEach((button) => {
        if (button.dataset.letra === resultado.alternativa_correta.letra) {
            button.classList.add("correct");
        }
    });

    mostrarExplicacao(resultado);

    // Ativa a exibição suave adicionando as classes de animação do CSS
    feedbackContainer.style.display = "block";
    setTimeout(() => {
        feedbackContainer.classList.add("mostrar");
    }, 10);

    scoreElement.textContent = `pontos: ${score * 1000}`;
    nextButton.style.display = "inline-block";
    ocupado = false;
}

function showScore() {
    resetState();
    feedbackContainer.classList.add(score >= codigosRodada.length / 2 ? 'correct' : 'incorrect');
    questionElement.textContent = 'Quiz Concluído!';
    feedbackTitle.textContent = 'FIM DE JOGO!';
    feedbackSubtitle.textContent = 'Você acertou ' + score + ' de ' + codigosRodada.length + ' perguntas (' + score * 1000 + ' pontos)!';
    feedbackContainer.style.display = 'block';
    setTimeout(() => { feedbackContainer.classList.add('mostrar'); }, 10);
    nextButton.innerHTML = 'Jogar Novamente';
    nextButton.style.display = 'inline-block';
    botaoRaking.innerHTML = 'Raking Global';
    botaoRaking.style.display = 'inline-block';
    botaoCategorias.style.display = 'inline-block';
}

function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < codigosRodada.length) {
        showQuestion();
    } else {
        showScore();
    }
}

nextButton.addEventListener('click', () => {
    if (currentQuestionIndex < codigosRodada.length) handleNextButton();
    else startQuiz();
});

botaoRaking.addEventListener("click", function(evento){
    evento.preventDefault();

    botaoRaking.innerText = "Proximo...";
    botaoRaking.style.opacity = "0.7";
    botaoRaking.style.cursor = "not-allowed";

    setTimeout(() => {
        window.location.href = "./raking/raking.html";
    }, 2000);
});

botaoCategorias.addEventListener("click", () => {
    window.location.href = "./categorias/categoria.html";
});


startQuiz();
