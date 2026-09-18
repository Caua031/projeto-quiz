const quiz = [
    {
        question: "Qual foi um dos primeiros programas autorreplicantes conhecidos na história da computação?",
        perguntas: [
            { id: 1, text: "Creeper", correct: true },
            { id: 2, text: "ILOVEYOU", correct: false },
            { id: 3, text: "WannaCry", correct: false },
            { id: 4, text: "Stuxnet", correct: false },
        ],  
    },
    {
        question: "Qual é uma das principais causas de falhas de segurança da informação?",
        perguntas: [
            { id: 1, text: "Uso de sistemas operacionais modernos", correct: false },
            { id: 2, text: "Engenharia social e falha humana", correct: true },
            { id: 3, text: "Uso de criptografia forte", correct: false },
            { id: 4, text: "Configuração correta de firewalls", correct: false },
        ],  
    },    
    {
        question: "Qual hacker ficou conhecido por ter sido um dos cibercriminosos mais procurados pelo FBI?",
        perguntas: [
            { id: 1, text: "Linus Torvalds", correct: false },
            { id: 2, text: "Kevin Mitnick", correct: true },
            { id: 3, text: "Edward Snowden", correct: false },
            { id: 4, text: "Tim Berners-Lee", correct: false },
        ],  
    },
    {
        question: "Quais estão entre as senhas mais utilizadas em levantamentos de senhas vazadas?",
        perguntas: [
            { id: 1, text: "Senha@2026!", correct: false },
            { id: 2, text: "123456 e password", correct: true },
            { id: 3, text: "xPtO#992", correct: false },
            { id: 4, text: "MinhaSenhaDificil12", correct: false },
        ],  
    },
    {
        question: "O que significa o termo 'phishing'?",
        perguntas: [
            { id: 1, text: "Um tipo de firewall de nova geração", correct: false },
            { id: 2, text: "Técnica de engenharia social para roubar dados confidenciais", correct: true },
            { id: 3, text: "Uma técnica de criptografia assimétrica", correct: false },
            { id: 4, text: "O ato de limpar o cache do navegador", correct: false },
        ],  
    },
    {
        question: "Qual foi um dos maiores ataques de ransomware em escala global?",
        perguntas: [
            { id: 1, text: "Stuxnet", correct: false },
            { id: 2, text: "WannaCry", correct: true },
            { id: 3, text: "Creeper", correct: false },
            { id: 4, text: "Morris Worm", correct: false },
        ],  
    },
    {
        question: "Como o malware Stuxnet (2010) se diferenciou de grande parte dos malwares tradicionais?",
        perguntas: [
            { id: 1, text: "Ele apenas exibia mensagens na tela", correct: false },
            { id: 2, text: "Alvo específico em sistemas industriais físicos (centrifugadoras nucleares)", correct: true },
            { id: 3, text: "Ele infectava apenas dispositivos móveis Android", correct: false },
            { id: 4, text: "Foi criado para minerar criptomoedas", correct: false },
        ],  
    },
    {
        question: "Qual é a principal função de um sistema configurado como Honeypot em uma estratégia de segurança da informação?",
        perguntas: [
            { id: 1, text: "Bloquear totalmente o tráfego da rede", correct: false },
            { id: 2, text: "Atrair e detectar atacantes em um ambiente controlado", correct: true },
            { id: 3, text: "Armazenar senhas de forma criptografada", correct: false },
            { id: 4, text: "Realizar o backup automático dos servidores", correct: false },
        ],  
    },
    {
        question: "Qual é a principal característica da Arquitetura Zero Trust (ZTA)?",
        perguntas: [
            { id: 1, text: "Confiar automaticamente em qualquer dispositivo interno", correct: false },
            { id: 2, text: "Nunca confiar, sempre verificar a identidade e o acesso", correct: true },
            { id: 3, text: "Eliminar a necessidade de senhas no sistema", correct: false },
            { id: 4, text: "Permitir acesso total a administradores sem autenticação", correct: false },
        ],  
    },     
    {
        question: "O que é malware?",
        perguntas: [
            { id: 1, text: "Um hardware danificado", correct: false },
            { id: 2, text: "Qualquer software intencionalmente desenvolvido para causar danos", correct: true },
            { id: 3, text: "Um programa de proteção contra vírus", correct: false },
            { id: 4, text: "Uma ferramenta de otimização de sistema", correct: false },
        ],  
    },     
    {
        question: "O que é ransomware?",
        perguntas: [
            { id: 1, text: "Um antivírus pago", correct: false },
            { id: 2, text: "Malware que criptografa dados e exige resgate", correct: true },
            { id: 3, text: "Um ataque que derruba servidores web por sobrecarga", correct: false },
            { id: 4, text: "Um cabo de rede de alta segurança", correct: false },
        ],  
    },
];

const numeroImagens = ["um-amarelo.png", "dois-amarelo.png", "tres-amarelo.png", "quatro-amarelo.png"];

const questionElement = document.getElementById("question");
const answerButtons = document.querySelector(".answer-btn");
const nextButton = document.getElementById("next-btn");
const feedbackContainer = document.querySelector(".container");
const feedbackTitle = document.querySelector(".container h1");
const feedbackSubtitle = document.querySelector(".container h2");
const headerTitle = document.querySelector(".perfil h1");
const scoreElement = document.querySelector(".pontos");
const progressContainer = document.getElementById("progress");

let currentQuestionIndex = 0;
let score = 0;

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Próximo";
    nextButton.style.display = "none";
    
    // Cria as barrinhas de progresso com base no tamanho real do array 'quiz'
    createProgressBars();
    showQuestion();
}

function createProgressBars() {
    progressContainer.innerHTML = ""; // Limpa as barras antigas
    for (let i = 0; i < quiz.length; i++) {
        const barra = document.createElement("div");
        barra.classList.add("barra");
        progressContainer.appendChild(barra);
    }
}

function updateHeaderAndProgress() {
    headerTitle.innerHTML = `pergunta ${currentQuestionIndex + 1}/${quiz.length}`;
    scoreElement.innerHTML = `pontos: ${score * 1000}`;

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

function showQuestion() {
    resetState();
    updateHeaderAndProgress();

    let currentQuestion = quiz[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

    currentQuestion.perguntas.forEach((resposta, index) => {
        const button = document.createElement("button");
        button.classList.add("btn");

        const img = document.createElement("img");
        img.src = `imagens/${numeroImagens[index]}`;
        img.alt = `Numero ${index + 1}`;

        const span = document.createElement("span");
        span.innerHTML = resposta.text;

        button.appendChild(img);
        button.appendChild(span);
        answerButtons.appendChild(button);

        if (resposta.correct) {
            button.dataset.correct = resposta.correct;
        }
        
        button.addEventListener("click", selectAnswer);
    });
}

function resetState() {
    nextButton.style.display = "none";
    feedbackContainer.style.display = "none";
    feedbackContainer.classList.remove("mostrar"); // Remove a classe de animação
    while (answerButtons.firstChild) {
        answerButtons.removeChild(answerButtons.firstChild);
    }
}

function selectAnswer(e) {
    const selectedBtn = e.target.closest('.btn');
    const isCorrect = selectedBtn.dataset.correct === "true";

    if (isCorrect) {
        selectedBtn.classList.add("correct");
        score++;
        
        feedbackTitle.innerHTML = "PARABÉNS!";
        feedbackSubtitle.innerHTML = "AAAAAAAAAAAAAAAAAAAH! QUE ACERTO";
        feedbackContainer.classList.add("correct");

    } else {
        selectedBtn.classList.add("incorrect");
        
        feedbackTitle.innerHTML = "QUE PENA!";
        feedbackSubtitle.innerHTML = "VOCÊ ERROU ESSA QUESTÃO";
        feedbackContainer.classList.add("incorrect"); // fundo vermelho em teste
    }

    // Ativa a exibição suave adicionando as classes de animação do CSS
    feedbackContainer.style.display = "block";
    setTimeout(() => {
        feedbackContainer.classList.add("mostrar");
    }, 10);

    Array.from(answerButtons.children).forEach(button => {
        if (button.dataset.correct === "true") {
            button.classList.add("correct");
        }
        button.disabled = true;
    });

    scoreElement.innerHTML = `pontos: ${score * 1000}`;
    nextButton.style.display = "inline-block";
}

function showScore() {
    resetState();
    questionElement.innerHTML = "Quiz Concluído!";
    
    feedbackTitle.innerHTML = "FIM DE JOGO!";
    feedbackSubtitle.innerHTML = `Você acertou ${score} de ${quiz.length} perguntas (${score * 1000} pontos)!`;
    
    feedbackContainer.style.display = "block";
    setTimeout(() => {
        feedbackContainer.classList.add("mostrar");
    }, 10);
    
    nextButton.innerHTML = "Jogar Novamente";
    nextButton.style.display = "inline-block";
}

function handleNextButton() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quiz.length) {
        showQuestion();
    } else {
        showScore();
    }
}

nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < quiz.length) {
        handleNextButton();
    } else {
        startQuiz();
    }
});

startQuiz();
