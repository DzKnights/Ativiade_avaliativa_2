document.addEventListener("DOMContentLoaded", () => {
    // =========================================================
    // CONFIGURAÇÕES DE SONS (CORRIGIDO: Voltando uma pasta com ../)
    // =========================================================
    const CAMINHO_SOM_HOVER = "../default/hover.mp3"; 
    const CAMINHO_SOM_CLICK = "../default/click.mp3";
    const VOLUME_SOM = 0.5; 

    // =========================================================
    // CONFIGURAÇÕES DE DESTINOS (CORRIGIDO: Descomentado)
    // =========================================================
    const CONFIG_BOTOES = {
        "btn-champions": "../champions/champions.html",
        "btn-falas": "../falas/falas.html",
        "btn-habilidade": "../habilidade/habilidade.html",
        "btn-emoji": "../emoji/emoji.html",
        "btn-splash-campeoes": "../Splash_Art/splash_campeoes.html",
        "btn-splash-itens": "../splash_itens.html"
    };

    // =========================================================
    // LÓGICA DO SCRIPT
    // =========================================================
    const somHover = document.getElementById('audio-hover');
    const somClick = document.getElementById('audio-click');
    
    if (somHover && somClick) {
        somHover.src = CAMINHO_SOM_HOVER;
        somClick.src = CAMINHO_SOM_CLICK;
        somHover.volume = VOLUME_SOM;
        somClick.volume = VOLUME_SOM;
    }

    // LÓGICA DO POP-UP DE INICIALIZAÇÃO
    const popup = document.getElementById('popup-inicio');
    const btnIniciar = document.getElementById('btn-iniciar-jogo');

    if (popup && btnIniciar) {
        btnIniciar.addEventListener('click', () => {
            if (somHover) somHover.load();
            if (somClick) somClick.load();
            popup.classList.add('escondido');
        });
    }

    // CONFIGURAÇÃO DOS BOTÕES DO MENU
    const botoes = document.querySelectorAll('.caixa-texto button');

    botoes.forEach(botao => {
        // Evento Hover
        botao.addEventListener('mouseenter', () => {
            if (somHover && somHover.readyState >= 2) { 
                somHover.currentTime = 0; 
                somHover.play().catch(() => {}); 
            }
        });

        // Evento de clique
        botao.addEventListener('click', () => {
            if (somClick && somClick.readyState >= 2) {
                somClick.currentTime = 0;
                somClick.play().catch(() => {});
            }

            const paginaDestino = CONFIG_BOTOES[botao.id];

            if (paginaDestino) {
                setTimeout(() => {
                    window.location.href = paginaDestino;
                }, 400);
            }
        });
    });
});