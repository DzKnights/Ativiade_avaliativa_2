document.addEventListener("DOMContentLoaded", () => {

    // Mapeamento correto dos elementos do DOM
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
    // 1. SISTEMA DE ÁUDIO E HOVER
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

    mapearSonsBotoes();

    // ==========================================================================
    // 2. NAVEGAÇÃO (VOLTAR, PRÓXIMO E POP-UP)
    // ==========================================================================
    const CONFIG_BOTOES = {
        "voltar": "../index.html",
        "prox": "../champions/champions.html", // Corrigido de .hmtl para .html
        "btn-falas": "../falas/falas.html",
        "btn-champions": "../champions/champions.html",
        "btn-splash-campeoes": "./splash_campeoes.html"
    };

    // Funcionalidade para os botões do Menu (Voltar/Próximo) e Pop-up
    document.querySelectorAll(".menu, .btn-modo-menu").forEach(botao => {
        botao.addEventListener("click", () => {
            const destino = CONFIG_BOTOES[botao.id];
            if (destino) {
                setTimeout(() => {
                    window.location.href = destino;
                }, 300);
            }
        });
    });

    if (btnReiniciar) {
        btnReiniciar.addEventListener("click", () => {
            window.location.reload();
        });
    }

    // ==========================================================================
    // 3. LOGICA DO JOGO (SPLASH ART)
    // ==========================================================================
    if (!LISTA_SPLASH || LISTA_SPLASH.length === 0) {
        alert("Erro: LISTA_SPLASH não foi carregada.");
        return;
    }
    
    if (!LISTA_CAMPEOES || LISTA_CAMPEOES.length === 0) {
        alert("Erro: LISTA_CAMPEOES não foi carregada.");
        return;
    }

    // Escolhe uma splash aleatória
    const splashAtual = LISTA_SPLASH[Math.floor(Math.random() * LISTA_SPLASH.length)];
    console.log("Splash escolhida:", splashAtual);

    // Carrega imagem e define Zoom Inicial
    if (splash) {
        splash.src = splashAtual.imagem;
        splash.className = "zoom-1";
        const posX = Math.floor(Math.random() * 100);
        const posY = Math.floor(Math.random() * 100);
        splash.style.objectPosition = `${posX}% ${posY}%`;
    }

    // ==========================================================================
    // 4. AUTOCOMPLETE E VALIDAÇÃO DA RESPOSTA
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
                        verificarResposta(campeao.nome);
                    });
                    
                    listaSugestoes.appendChild(item);
                });
                listaSugestoes.style.display = "block";
                mapearSonsBotoes(); // Atualiza sons para novos itens criados
            } else {
                listaSugestoes.style.display = "none";
            }
        });

        // Fecha a lista ao clicar fora
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
        const nomeDigitado = inputCampeao.value.trim();
        if (nomeDigitado === "") return;

        const campeaoEncontrado = LISTA_CAMPEOES.find(c => normalizarTexto(c.nome) === normalizarTexto(nomeDigitado));

        if (campeaoEncontrado) {
            if (!tentativasRealizadas.includes(campeaoEncontrado.nome)) {
                verificarResposta(campeaoEncontrado.nome);
            } else {
                alert("Você já tentou esse campeão!");
                inputCampeao.value = "";
            }
        } else {
            alert("Campeão não encontrado. Escolha uma das opções da lista!");
        }
    }

    function verificarResposta(nomeCampeao) {
        tentativas++;
        tentativasRealizadas.push(nomeCampeao);
        contador.textContent = `Tentativas: ${tentativas}`;
        
        const respostaFormatada = normalizarTexto(nomeCampeao);
        const respostaCorreta = normalizarTexto(splashAtual.campeao);

        if (respostaFormatada === respostaCorreta) {
            // Vitória!
            splash.className = "revelado";
            
            // Preenche e exibe o Pop-up de vitória estruturado no seu HTML
            if (popupVitoria) {
                popupVitoriaImg.src = splashAtual.imagem;
                popupVitoriaNome.textContent = `${splashAtual.campeao} (${splashAtual.skin})`;
                popupVitoriaTentativas.innerHTML = `Tentativas: <strong>${tentativas}</strong>`;
                
                setTimeout(() => {
                    popupVitoria.style.display = "flex";
                }, 400);
            }
            
            btnEnviar.disabled = true;
            inputCampeao.disabled = true;
            return;
        }

        // Se errar, muda o nível do zoom com base nas suas classes CSS
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
                // Derrota / Fim de jogo
                splash.className = "revelado";
                setTimeout(() => {
                    alert(`Fim de jogo!\n\nEra ${splashAtual.campeao}\nSkin: ${splashAtual.skin}`);
                    window.location.reload();
                }, 500);

                btnEnviar.disabled = true;
                inputCampeao.disabled = true;
        }

        inputCampeao.value = "";
    }
});
