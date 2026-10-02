const botaoVoltar = document.getElementById('btn-voltar');


botaoVoltar.addEventListener("click", function(evento){
    evento.preventDefault();

    botaoVoltar.innerText = "Voltando...";
    botaoVoltar.style.opacity = "0.7";
    botaoVoltar.style.cursor = "not_allowed";

    setTimeout(() => {
        window.location.href = "../index.html";
    }, 2000);
});