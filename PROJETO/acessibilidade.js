// Acessibilidade: aba lateral para desligar as animações de fundo.
// Incluir no <head> de cada página, ANTES dos scripts de fundo (fundoicones.js, background.js...).
//
// Os scripts de fundo usam:
//   Acessibilidade.animacoes()        -> true se as animações estão ligadas
//   Acessibilidade.aoMudar(function)  -> chama a função sempre que a pessoa liga/desliga
(function () {
    'use strict';

    const CHAVE = 'tt_animacoes_fundo'; // "on" ou "off"
    const sistemaPedeMenos = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const ouvintes = [];

    function lerPreferencia() {
        try {
            const valor = localStorage.getItem(CHAVE);
            if (valor === 'on') return true;
            if (valor === 'off') return false;
        } catch (e) { /* armazenamento indisponível: usa o padrão */ }
        // Sem escolha salva: respeita a configuração do sistema ("reduzir movimento").
        return !sistemaPedeMenos;
    }

    let ligado = lerPreferencia();
    document.documentElement.classList.toggle('sem-animacao', !ligado);

    function definir(valor, salvar) {
        if (valor === ligado) return;
        ligado = valor;
        document.documentElement.classList.toggle('sem-animacao', !ligado);
        if (salvar) {
            try { localStorage.setItem(CHAVE, ligado ? 'on' : 'off'); } catch (e) { /* ignora */ }
        }
        ouvintes.forEach(fn => { try { fn(ligado); } catch (e) { console.error(e); } });
    }

    window.Acessibilidade = {
        animacoes: () => ligado,
        aoMudar: fn => { if (typeof fn === 'function') ouvintes.push(fn); },
    };

    // Mantém várias abas abertas em sincronia.
    window.addEventListener('storage', e => {
        if (e.key === CHAVE) definir(lerPreferencia(), false);
    });

    const CSS = `
/* Sem animações: também desliga as animações e transições de CSS */
html.sem-animacao *, html.sem-animacao *::before, html.sem-animacao *::after {
  animation: none !important;
  transition: none !important;
  scroll-behavior: auto !important;
}

/* Contêiner fixo (os !important vencem regras como "body > * { position: relative }") */
#a11y-raiz {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 0 !important;
  z-index: 2147483000 !important;
  margin: 0 !important;
  padding: 0 !important;
  font-family: Arial, sans-serif;
}
#a11y-raiz *, #a11y-raiz *::before, #a11y-raiz *::after { box-sizing: border-box; }

.a11y-aba {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 7px;
  cursor: pointer;
  color: #e1f4ff;
  background: rgba(18, 38, 50, 0.92);
  border: 1px solid rgba(174, 223, 242, 0.4);
  border-right: 0;
  border-radius: 14px 0 0 14px;
  box-shadow: 0 0 14px rgba(40, 158, 255, 0.2);
  font: 12px/1 var(--fonte-principal, Georgia, serif);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.a11y-aba:hover, .a11y-aba[aria-expanded="true"] { background: rgba(28, 62, 82, 0.96); color: #fff; }
.a11y-aba svg { width: 22px; height: 22px; flex: none; }
.a11y-aba .a11y-texto { writing-mode: vertical-rl; }

.a11y-painel {
  position: absolute;
  right: 52px;
  top: 50%;
  transform: translateY(-50%);
  width: min(310px, calc(100vw - 72px));
  padding: 18px;
  color: #fff;
  background: rgba(18, 38, 50, 0.96);
  border: 1px solid rgba(174, 223, 242, 0.4);
  border-radius: 20px;
  box-shadow: 0 0 24px rgba(0, 0, 0, 0.5), 0 0 18px rgba(40, 158, 255, 0.18);
  font-size: 14px;
  line-height: 1.45;
  text-align: left;
  text-transform: none;
  letter-spacing: normal;
}
.a11y-painel[hidden] { display: none; }
.a11y-painel h2 {
  margin: 0 0 14px;
  font: 400 20px var(--font-secundaria, cursive);
  color: #fff;
}
.a11y-linha { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
.a11y-rotulo { font-weight: bold; }
.a11y-ajuda { margin: 10px 0 0; color: #cfe3ee; font-size: 13px; }
.a11y-status { margin: 10px 0 0; color: #5eead4; font-size: 13px; min-height: 1.4em; }
.a11y-fechar {
  margin-top: 14px;
  padding: 6px 18px;
  cursor: pointer;
  color: #fff;
  background: transparent;
  border: 1px solid rgba(174, 223, 242, 0.5);
  border-radius: 20px;
  font: inherit;
}
.a11y-fechar:hover { background: rgba(40, 158, 255, 0.18); }

.a11y-chave {
  position: relative;
  flex: none;
  width: 48px;
  height: 26px;
  cursor: pointer;
  background: #55646e;
  border: 2px solid rgba(255, 255, 255, 0.7);
  border-radius: 13px;
}
.a11y-chave::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: #fff;
  border-radius: 50%;
}
.a11y-chave[aria-checked="true"] { background: #1f8f7e; }
.a11y-chave[aria-checked="true"]::after { left: 24px; }

#a11y-raiz :focus-visible { outline: 3px solid #8ad0ff; outline-offset: 3px; }
`;

    function montar() {
        const estilo = document.createElement('style');
        estilo.textContent = CSS;
        document.head.append(estilo);

        const raiz = document.createElement('div');
        raiz.id = 'a11y-raiz';

        const aba = document.createElement('button');
        aba.type = 'button';
        aba.className = 'a11y-aba';
        aba.setAttribute('aria-expanded', 'false');
        aba.setAttribute('aria-controls', 'a11y-painel');
        aba.innerHTML =
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">' +
            '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="7.2" r="1.4" fill="currentColor" stroke="none"/>' +
            '<path d="M7 10.2h10M12 10.2v4.2M12 14.4l-2.6 4M12 14.4l2.6 4"/></svg>' +
            '<span class="a11y-texto">Acessibilidade</span>';

        const painel = document.createElement('section');
        painel.id = 'a11y-painel';
        painel.className = 'a11y-painel';
        painel.hidden = true;
        painel.setAttribute('aria-label', 'Opções de acessibilidade');
        painel.innerHTML =
            '<h2>Acessibilidade</h2>' +
            '<div class="a11y-linha">' +
            '<span class="a11y-rotulo" id="a11y-rotulo">Animações de fundo</span>' +
            '<button type="button" class="a11y-chave" id="a11y-chave" role="switch" aria-labelledby="a11y-rotulo" aria-describedby="a11y-ajuda"></button>' +
            '</div>' +
            '<p class="a11y-ajuda" id="a11y-ajuda">Desligue para parar o movimento dos ícones e das partículas ao fundo. ' +
            'Útil para quem sente tontura ou desconforto com movimento.</p>' +
            '<p class="a11y-status" id="a11y-status" role="status" aria-live="polite"></p>' +
            '<button type="button" class="a11y-fechar">Fechar</button>';

        raiz.append(painel, aba);
        document.body.append(raiz);

        const chave = painel.querySelector('#a11y-chave');
        const status = painel.querySelector('#a11y-status');
        const fechar = painel.querySelector('.a11y-fechar');
        let mensagem = false; // só mostra o status depois de uma ação da pessoa

        function atualizar() {
            chave.setAttribute('aria-checked', String(ligado));
            if (!mensagem) {
                status.textContent = (sistemaPedeMenos && !guardada())
                    ? 'Seu dispositivo pede menos movimento, então as animações começaram desligadas.'
                    : '';
                return;
            }
            status.textContent = ligado ? 'Animações ligadas.' : 'Animações desligadas.';
        }
        function guardada() {
            try { return localStorage.getItem(CHAVE) !== null; } catch (e) { return false; }
        }

        function abrir(aberto) {
            painel.hidden = !aberto;
            aba.setAttribute('aria-expanded', String(aberto));
            if (aberto) chave.focus(); else aba.focus();
        }

        aba.addEventListener('click', () => abrir(painel.hidden));
        fechar.addEventListener('click', () => abrir(false));
        document.addEventListener('keydown', e => { if (e.key === 'Escape' && !painel.hidden) abrir(false); });
        chave.addEventListener('click', () => { mensagem = true; definir(!ligado, true); atualizar(); });
        ouvintes.push(atualizar);

        atualizar();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
    else montar();
})();
