const btnAbrir = document.getElementById('abrir-galeria');
const btnFechar = document.getElementById('fechar-galeria');
const janelaAvatares = document.getElementById('janela-avatares');
const fotoAtual = document.getElementById('foto-atual');
const opcoesAvatar = document.querySelectorAll('.opcao-avatar');
const formRegistro = document.getElementById('form-registro');
const botaoContinuar = document.getElementById('proximo-btn');
btnAbrir.addEventListener('click', () => { janelaAvatares.style.display = 'flex'; });
btnFechar.addEventListener('click', () => { janelaAvatares.style.display = 'none'; });
opcoesAvatar.forEach(opcao => {
    opcao.addEventListener('click', function() {
        fotoAtual.src = this.src;
        janelaAvatares.style.display = 'none';
    });
});
formRegistro.addEventListener('submit', function(evento) {
    evento.preventDefault();
    if (fotoAtual.src.includes('perfil.png')) {
        alert('É necessário usar uma foto de perfil');
        return;
    }
    const inputNome = document.getElementById('nome-jogador') || document.querySelector('#form-registro input[type="text"]');
    const dadosJogador = { nome: inputNome ? inputNome.value : 'Jogador Anonimo', foto: fotoAtual.src };
    localStorage.setItem('jogadorAtual', JSON.stringify(dadosJogador));
    botaoContinuar.innerText = 'Carregando...';
    botaoContinuar.style.opacity = '0.7';
    botaoContinuar.style.cursor = 'not-allowed';
    setTimeout(() => { window.location.href = '../categorias/categoria.html'; }, 2000);
});
