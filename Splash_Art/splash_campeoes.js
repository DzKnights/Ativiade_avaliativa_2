document.addEventListener("DOMContentLoaded", () => {

    const splash = document.getElementById("splash-img");
    const input = document.getElementById("input-campeao");
    const btn = document.getElementById("btn-enviar");
    const contador = document.getElementById("contador-tentativas");

     // Efeitos sonoros
    const audioHover = document.getElementById("audio-hover");
    const audioClick = document.getElementById("audio-click");
    
    // Variáveis de controle de estado interno
    let tentativasRealizadas = [];
    let creditosDicas = 0; 

    // ==========================================================================
    // 1. CONTROLADOR DE DESBLOQUEIO DE REPRODUÇÃO DE ÁUDIO
    // ==========================================================================
    if (btnIniciarJogo) {
        btnIniciarJogo.addEventListener("click", () => {
            if (audioHover && audioClick) {
                // Triggers simulados para obter autorização de áudio do browser
                audioHover.play().then(() => { audioHover.pause(); audioHover.currentTime = 0; }).catch(() => {});
                audioClick.play().then(() => { audioClick.pause(); audioClick.currentTime = 0; }).catch(() => {});
            }
            if (popupInicio) popupInicio.style.display = "none";
        });
    }

    // Mapeia listeners dinamicamente para aplicar efeitos de áudio em elementos interativos
    const mapearSonsBotoes = () => {
        const todosBotoes = document.querySelectorAll("button, .menu, .dica-card.disponivel");

        todosBotoes.forEach(botao => {
            botao.removeEventListener("mouseenter", tocarHover);
            botao.removeEventListener("click", tocarClick);

            botao.addEventListener("mouseenter", tocarHover);
            botao.addEventListener("click", tocarClick);
        });
    };

    function tocarHover() {
        if (audioHover) {
            audioHover.currentTime = 0;
            audioHover.play().catch(() => {});
        }
    }

    function tocarClick() {
        if (audioClick) {
            audioClick.currentTime = 0;
            audioClick.play().catch(() => {});
        }
    }

    // Execução primária para componentes estáticos da tela
    mapearSonsBotoes();

    // ==========================================================================
    // 2. SISTEMA DE REFRESH E NAVEGAÇÃO ENTRE PÁGINAS (BOTÕES DO POP-UP)
    // ==========================================================================
    document.querySelectorAll(".btn-modo-menu").forEach(botao => {
        botao.addEventListener('mouseenter', () => {
            if (audioHover) { audioHover.currentTime = 0; audioHover.play().catch(() => {}); }
        });

        botao.addEventListener('click', () => {
            if (audioClick) { audioClick.currentTime = 0; audioClick.play().catch(() => {}); }
            const paginaDestino = CONFIG_BOTOES_POPUP[botao.id];
            if (paginaDestino) {
                setTimeout(() => { window.location.href = paginaDestino; }, 400);
            }
        });
    });

    // CONFIGURAÇÃO DOS LINKS DE REDIRECIONAMENTO DOS MODOS
    const CONFIG_BOTOES_POPUP = {
        "btn-falas": "../falas/falas.html",
        "btn-champions": "../champions/champions.html"
    };

    document.querySelectorAll(".menu").forEach(botao => {
        botao.addEventListener("click", () => {
            const destino = configmenu[botao.id];
            if (destino) window.location.href = destino;
        });
    });

    if (btnReiniciar) {
        btnReiniciar.addEventListener("click", () => {
            window.location.reload();
        });
    }


    // ==========================================================================
    // 4. MECÂNICA DE AUTOCOMPLETE E TRATAMENTO DE TEXTO (STRING)
    // ==========================================================================
    const normalizarTexto = (texto) => {
    if (!texto) return "";
        return texto.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    };

    if (inputCampeao && listaSugestoes) {
        inputCampeao.addEventListener("input", () => {
            const valorDigitado = normalizarTexto(inputCampeao.value);
            listaSugestoes.innerHTML = "";

            if (valorDigitado === "") {
                listaSugestoes.style.display = "none";
                return;
            }

            const filtrados = LISTA_CAMPEOES.filter(c => 
                normalizarTexto(c.nome).includes(valorDigitado) && 
                !tentativasRealizadas.includes(c.nome)
            );

            if (filtrados.length > 0) {
                filtrados.forEach(campeao => {
                    const item = document.createElement("div");
                    item.className = "sugestao-item";
                    item.innerHTML = `<img src="${campeao.imagem}" alt="${campeao.nome}"> <span>${campeao.nome}</span>`;
                    
                    item.addEventListener("click", () => {
                        inputCampeao.value = campeao.nome;
                        listaSugestoes.innerHTML = "";
                        listaSugestoes.style.display = "none";
                        processarTentativa(campeao);
                    });
                    
                    listaSugestoes.appendChild(item);
                });
                listaSugestoes.style.display = "block";
            } else {
                listaSugestoes.style.display = "none";
            }
        });

        document.addEventListener("click", (e) => {
            if (e.target !== inputCampeao) {
                listaSugestoes.style.display = "none";
            }
        });

        inputCampeao.addEventListener("keydown", (e) => {
            if (e.key === "Enter") { executarEnvio(); }
        });
    }

    if (btnEnviar) {
        btnEnviar.addEventListener("click", executarEnvio);
    }

    function executarEnvio() {
        const nomeDigitado = normalizarTexto(inputCampeao.value);
        const campeaoEncontrado = LISTA_CAMPEOES.find(c => normalizarTexto(c.nome) === nomeDigitado);

        if (campeaoEncontrado) {
            if (!tentativasRealizadas.includes(campeaoEncontrado.nome)) {
                processarTentativa(campeaoEncontrado);
            } else {
                alert("Você já tentou esse campeão!");
                inputCampeao.value = "";
            }
        } else if (inputCampeao.value.trim() !== "") {
            alert("Campeão não encontrado.");
        }
    }
    
    // Verifica se a lista carregou
    if (!LISTA_SPLASH || LISTA_SPLASH.length === 0) {
        alert("Erro: LISTA_SPLASH não foi carregada.");
        return;
    }

    // Configuração dos botões do menu superior (Voltar / Próximo)
    const configmenu = {
        "voltar": "../index.html",
        "prox": "../champions/champions.hmtl"
    };
    
    // Escolhe uma splash aleatória
    const splashAtual =
        LISTA_SPLASH[Math.floor(Math.random() * LISTA_SPLASH.length)];

    console.log("Splash escolhida:", splashAtual);

    // Carrega imagem
    splash.src = splashAtual.imagem;

    // Zoom inicial
    splash.className = "zoom-1";

    // Ponto aleatório da splash
    const posX = Math.floor(Math.random() * 100);
    const posY = Math.floor(Math.random() * 100);

    splash.style.objectPosition = `${posX}% ${posY}%`;

    let tentativas = 0;

    function verificarResposta() {

        const resposta =
            input.value.trim().toLowerCase();

        if (resposta === "") return;

        tentativas++;

        contador.textContent =
            `Tentativas: ${tentativas}`;

        if (
            resposta ===
            splashAtual.campeao.toLowerCase()
        ) {

            splash.className = "revelado";

            setTimeout(() => {
                alert(
                    `Parabéns!\n\nCampeão: ${splashAtual.campeao}\nSkin: ${splashAtual.skin}`
                );
            }, 300);

            return;
        }

        switch (tentativas) {

            case 1:
                splash.className = "zoom-2";
                break;

            case 2:
                splash.className = "zoom-3";
                break;

            case 3:
                splash.className = "zoom-4";
                break;

            default:

                splash.className = "revelado";

                setTimeout(() => {
                    alert(
                        `Fim de jogo!\n\nEra ${splashAtual.campeao}\nSkin: ${splashAtual.skin}`
                    );
                }, 300);

                btn.disabled = true;
                input.disabled = true;
        }

        input.value = "";
    }

    btn.addEventListener("click", verificarResposta);

    input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            verificarResposta();
        }
    });

});
