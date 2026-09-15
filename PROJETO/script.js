const quiz = [
    {
        question: "Ele recebe o sinal de internet de um modem e distribui essa conexão para celulares, computadorese outros aparelhos, seja por cabos de rede ou por sinal Wi-Fi.",
        perguntas: [
            { id: 1, text: "teste 1", correct:false},
            { id: 2, text: "teste 2", correct:true},
            { id: 3, text: "teste 3", correct:false},
            { id: 4, text: "teste 4", correct:false},
        ],  
    },
    {
        question: "Pergunta 2",
        perguntas: [
            { id: 1, text: "teste 1", correct:false},
            { id: 2, text: "teste 2", correct:true},
            { id: 3, text: "teste 3", correct:false},
            { id: 4, text: "teste 4", correct:false},
        ],  
    },    
    {
        question: "Pergunta 3",
        perguntas: [
            { id: 1, text: "teste 1", correct:false},
            { id: 2, text: "teste 2", correct:true},
            { id: 3, text: "teste 3", correct:false},
            { id: 4, text: "teste 4", correct:false},
        ],  
    },
    {
        question: "Pergunta 4",
        perguntas: [
            { id: 1, text: "teste 1", correct:false},
            { id: 2, text: "teste 2", correct:true},
            { id: 3, text: "teste 3", correct:false},
            { id: 4, text: "teste 4", correct:false},
        ],  
    },
    {
        question: "Pergunta 5",
        perguntas: [
            { id: 1, text: "teste 1", correct:false},
            { id: 2, text: "teste 2", correct:true},
            { id: 3, text: "teste 3", correct:false},
            { id: 4, text: "teste 4", correct:false},
        ],  
    },            
]

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-btn");
const nextButton = document.getElementById("next-btn");

let currentQuestionIndex = 0;
let score = 0;

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextButton.innerHTML = "Próxima";
    showQuestion();
}

function showQuestion() {
    let currentQuestion = quiz[currentQuestionIndex];
    let questionNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questionNo + "." + currentQuestion.question;
}

startQuiz();

