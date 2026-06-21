document.addEventListener("DOMContentLoaded", () => {

    // ==========================================================================
    // MAPEAMENTO DOS ELEMENTOS DO DOM (Baseado exatamente no seu HTML)
    // ==========================================================================
    const splash = document.getElementById("splash-img");
    const inputCampeao = document.getElementById("input-campeao");
    const btnEnviar = document.getElementById("btn-enviar");
    const contador = document.getElementById("contador-tentativas");
    const listaSugestoes = document.getElementById("lista-sugestoes");
    
    // Pop-up de Vitória
    const popupVitoria = document.getElementById("popup-vitoria");
    const popupVitoriaImg = document.getElementById("popup-vitoria-img");
    const popupVitoriaNome = document.getElementById("popup-vitoria-nome-campeao");
    const popupVitoriaTentativas = document.getElementById("popup-vitoria-tentativas");
    const btnReiniciar = document.getElementById("popup-reiniciar");

    // Efeitos sonoros
    const audioHover = document.getElementById("audio-hover");
    const audioClick = document.getElementById("audio-click");
    
    // Variáveis de controle de estado interno
    let tentativasRealizadas = [];
    let tentativas = 0;

    // ==========================================================================
    // VALIDAÇÃO DOS ARQUIVOS DE DADOS EXTERNOS
    // ==========================================================================
    if (typeof LISTA_SPLASH === 'undefined' || LISTA_SPLASH.length === 0) {
        alert("Erro: lista_splash.js não foi carregado corretamente.");
        return;
    }
    if (typeof LISTA_CAMPEOES === 'undefined' || LISTA_CAMPEOES.length === 0) {
        alert("Erro: lista_camp.js não foi carregado corretamente.");
        return;
    }

    // ==========================================================================
    // SISTEMA DE ÁUDIO E MAPEAMENTO DE SONS
    // ==========================================================================
    const mapearSonsBotoes = () => {
        const todosBotoes = document.querySelectorAll("button, .menu, .btn-modo-menu, .sugestao-item");
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

    // Execução inicial para os componentes estáticos do HTML
    mapearSonsBotoes();

    // ==========================================================================
    // NAVEGAÇÃO DOS BOTÕES SUPERIORES (VOLTAR / PRÓXIMO)
    // ==========================================================================
    const configmenu = {
        "voltar": "../index.html",
        "prox": "../falas/falas.html"
    };

    document.querySelectorAll(".menu").forEach(botao => {
        botao.addEventListener("click", () => {
            const destino = configmenu[botao.id];
            if (destino) window.location.href = destino;
        });
    });

    // Configuração dos botões de redirecionamento internos do Pop-up de Vitória
    const CONFIG_BOTOES_POPUP = {
        "btn-champions": "../champions/champions.html",
        "btn-falas": "../falas/falas.html",
        "btn-splash-campeoes": "./splash_campeoes.html"
    };

    document.querySelectorAll(".btn-modo-menu").forEach(botao => {
        botao.addEventListener("click", () => {
            const destino = CONFIG_BOTOES_POPUP[botao.id];
            if (destino) window.location.href = destino;
        });
    });

    if (btnReiniciar) {
        btnReiniciar.addEventListener("click", () => {
            window.location.reload();
        });
    }

    // ==========================================================================
    // INICIALIZAÇÃO DA SPLASH ART ALEATÓRIA
    // ==========================================================================
    const splashAtual = LISTA_SPLASH[Math.floor(Math.random() * LISTA_SPLASH.length)];
    console.log("Splash secreta escolhida:", splashAtual.campeao, "-", splashAtual.skin);

    if (splash) {
        splash.src = splashAtual.imagem;
        splash.className = "zoom-1";
        const posX = Math.floor(Math.random() * 100);
        const posY = Math.floor(Math.random() * 100);
        splash.style.objectPosition = `${posX}% ${posY}%`;
    }

    // ==========================================================================
    // AUTOCOMPLETE (BARRA DE PESQUISA)
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

            // Filtra os campeões vindos do seu lista_camp.js original
            const filtrados = LISTA_CAMPEOES.filter(c => 
                normalizarTexto(c.nome).includes(valorDigitado) && 
                !tentativasRealizadas.includes(c.nome)
            );

            if (filtrados.length > 0) {
                filtrados.forEach(campeao => {
                    const item = document.createElement("div");
                    item.className = "sugestao-item";
                    
                    // Cria dinamicamente o ícone minúsculo com base no nome
                    const nomeParaIcone = campeao.nome.toLowerCase().replace(/['\s]/g, "");
                    const caminhoIcone = `../icone_champions/${nomeParaIcone}.jpg`;

                    item.innerHTML = `<img src="${caminhoIcone}" alt="${campeao.nome}" onerror="this.src='default/logo.jpg';" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;"> <span>${campeao.nome}</span>`;
                    
                    item.addEventListener("click", () => {
                        inputCampeao.value = campeao.nome;
                        listaSugestoes.innerHTML = "";
                        listaSugestoes.style.display = "none";
                        verificarResposta(campeao.nome);
                    });
                    
                    listaSugestoes.appendChild(item);
                });
                listaSugestoes.style.display = "block";
                mapearSonsBotoes(); // Aplica som de hover nos itens da lista
            } else {
                listaSugestoes.style.display = "none";
            }
        });

        // Fecha a caixinha se clicar fora
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
        if (nomeDigitado === "") return;

        const campeaoEncontrado = LISTA_CAMPEOES.find(c => normalizarTexto(c.nome) === nomeDigitado);

        if (campeaoEncontrado) {
            if (!tentativasRealizadas.includes(campeaoEncontrado.nome)) {
                verificarResposta(campeaoEncontrado.nome);
            } else {
                alert("Você já tentou esse campeão!");
                inputCampeao.value = "";
            }
        } else {
            alert("Campeão não encontrado ou inválido.");
        }
    }

    // ==========================================================================
    // SISTEMA DE VALIDAÇÃO (VITÓRIA / ZOOMS DE ERRO)
    // ==========================================================================
    function verificarResposta(nomeCampeao) {
        tentativas++;
        tentativasRealizadas.push(nomeCampeao);
        if (contador) contador.textContent = `Tentativas: ${tentativas}`;
        
        inputCampeao.value = "";
        const palpite = normalizarTexto(nomeCampeao);
        const alvoCorreto = normalizarTexto(splashAtual.campeao);

        if (palpite === alvoCorreto) {
            // VITÓRIA!
            if (splash) splash.className = "revelado";
            
            if (popupVitoria) {
                if (popupVitoriaImg) popupVitoriaImg.src = splashAtual.imagem;
                if (popupVitoriaNome) popupVitoriaNome.textContent = `${splashAtual.campeao} - ${splashAtual.skin}`;
                if (popupVitoriaTentativas) {
                    popupVitoriaTentativas.innerHTML = `Tentativas: <strong>${tentativas}</strong>`;
                }
                
                setTimeout(() => {
                    popupVitoria.style.display = "flex";
                }, 400);
            }
            
            if (btnEnviar) btnEnviar.disabled = true;
            if (inputCampeao) inputCampeao.disabled = true;
            return;
        }

        // ERROU! (Aplica zoom de afastamento baseado nas tentativas)
        if (splash) {
            switch (tentativas) {
                case 1: splash.className = "zoom-2"; break;
                case 2: splash.className = "zoom-3"; break;
                case 3: splash.className = "zoom-4"; break;
                default:
                    splash.className = "revelado";
                    setTimeout(() => {
                        alert(`Fim de jogo!\nO campeão correto era: ${splashAtual.campeao}\nSkin: ${splashAtual.skin}`);
                        window.location.reload();
                    }, 500);

                    if (btnEnviar) btnEnviar.disabled = true;
                    if (inputCampeao) inputCampeao.disabled = true;
            }
        }
    }
});
