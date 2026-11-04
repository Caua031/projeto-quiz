const form = document.getElementById('form-registro');
const nome = document.getElementById('nome-jogador');
const senha = document.getElementById('senha-jogador');
const confirmacao = document.getElementById('confirmar-senha');
const botao = document.getElementById('proximo-btn');
const status = document.getElementById('status-acesso');
const foto = document.getElementById('foto-atual');
const modal = document.getElementById('janela-avatares');
let modo = 'login';
let fotoEscolhida = '/imagens/perfil.png';
let ocupado = false;

function escolherModo(valor) {
    if (ocupado) return;
    modo = valor;
    const cadastro = modo === 'cadastro';
    document.querySelectorAll('.somente-cadastro').forEach(el => { el.hidden = !cadastro; });
    document.getElementById('aba-login').setAttribute('aria-pressed', String(!cadastro));
    document.getElementById('aba-cadastro').setAttribute('aria-pressed', String(cadastro));
    document.getElementById('titulo-acesso').textContent = cadastro ? 'Crie sua conta' : 'Entre na sua conta';
    botao.textContent = cadastro ? 'Criar conta' : 'Entrar';
    senha.autocomplete = cadastro ? 'new-password' : 'current-password';
    senha.minLength = cadastro ? 8 : 1;
    confirmacao.disabled = !cadastro; confirmacao.required = cadastro;
    senha.value = ''; confirmacao.value = ''; status.textContent = '';
}
document.getElementById('aba-login').addEventListener('click', () => escolherModo('login'));
document.getElementById('aba-cadastro').addEventListener('click', () => escolherModo('cadastro'));

function abrirAvatares() { if (modo === 'cadastro') { modal.style.display = 'flex'; document.getElementById('fechar-galeria').focus(); } }
document.getElementById('abrir-galeria').addEventListener('click', abrirAvatares);
document.getElementById('abrir-galeria').addEventListener('keydown', e => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); abrirAvatares(); } });
function fecharAvatares() { modal.style.display = 'none'; document.getElementById('abrir-galeria').focus(); }
document.getElementById('fechar-galeria').addEventListener('click', fecharAvatares);
document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.style.display === 'flex') fecharAvatares(); });
document.querySelectorAll('.opcao-avatar').forEach(opcao => {
    opcao.tabIndex = 0; opcao.setAttribute('role', 'button');
    function selecionar() {
        fotoEscolhida = '/imagens/' + new URL(opcao.src).pathname.split('/').pop();
        foto.src = opcao.src; fecharAvatares();
    }
    opcao.addEventListener('click', selecionar);
    opcao.addEventListener('keydown', e => { if (['Enter', ' '].includes(e.key)) { e.preventDefault(); selecionar(); } });
});

function destino(usuario) {
    const querAdministracao = new URLSearchParams(window.location.search).get('destino') === 'administracao';
    window.location.replace(urlDoSite(querAdministracao && usuario.administrador ? 'administracao/adm.html' : 'categorias/categoria.html'));
}
form.addEventListener('submit', async e => {
    e.preventDefault(); if (ocupado) return;
    if (modo === 'cadastro' && senha.value !== confirmacao.value) {
        status.textContent = 'As senhas não coincidem. Confira a confirmação.'; confirmacao.focus(); return;
    }
    ocupado = true; botao.disabled = true; status.textContent = 'Aguarde...';
    try {
        const dados = { login: nome.value.trim(), senha: senha.value };
        if (modo === 'cadastro') dados.foto = fotoEscolhida;
        const usuario = await api('/auth/' + modo, { method: 'POST', body: JSON.stringify(dados) });
        senha.value = ''; confirmacao.value = ''; localStorage.removeItem('jogadorAtual');
        destino(usuario);
    } catch (erro) { status.textContent = erro.message; }
    finally { ocupado = false; botao.disabled = false; }
});

// O servidor confirma o acesso; dados antigos no navegador não autenticam ninguém.
api('/auth/eu').then(destino).catch(erro => {
    if (erro.status !== 401) status.textContent = erro.message;
});
