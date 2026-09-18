// === SELEÇÃO DE ELEMENTOS ===
const btnAbrir = document.getElementById('abrir-galeria');
const btnFechar = document.getElementById('fechar-galeria');
const janelaAvatares = document.getElementById('janela-avatares');
const fotoAtual = document.getElementById('foto-atual');
const opcoesAvatar = document.querySelectorAll('.opcao-avatar');
const formRegistro = document.getElementById('form-registro');
const botaoContinuar = document.getElementById('proximo-btn');

// Abre a janela de opções
btnAbrir.addEventListener('click', () => {
    janelaAvatares.style.display = 'flex';
});

// Fecha a janela de opções
btnFechar.addEventListener('click', () => {
    janelaAvatares.style.display = 'none';
});

// Troca a foto ao clicar em uma opção da lista
opcoesAvatar.forEach(opcao => {
    opcao.addEventListener('click', function() {
        fotoAtual.src = this.src; // Substitui o caminho da foto
        janelaAvatares.style.display = 'none'; // Fecha o modal
    });
});

formRegistro.addEventListener('submit', function(evento) {
    evento.preventDefault(); // Impede a página de mudar correndo

    // Muda o estilo do botão para dar feedback visual de carregamento
    botaoContinuar.innerText = "Carregando...";
    botaoContinuar.style.opacity = "0.7";
    botaoContinuar.style.cursor = "not-allowed";

    // Aguarda 2000 milissegundos (2 segundos) antes de mudar de página
    setTimeout(() => {
        window.location.href = "../index.html";
    }, 2000); 
});
