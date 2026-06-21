document.addEventListener("DOMContentLoaded", () => {
    
    // Verificação de segurança da lista de campeões
    if (typeof LISTA_CAMPEOES === "undefined" || LISTA_CAMPEOES.length === 0) {
        console.error("Erro: A LISTA_CAMPEOES não foi carregada corretamente pelo arquivo lista_falas.js");
        return;
    }

    // Sorteia o alvo do modo
    const campeaoSecreto = LISTA_CAMPEOES[Math.floor(Math.random() * LISTA_CAMPEOES.length)];
    console.log("Alvo secreto das Falas:", campeaoSecreto.nome);

    // Mapeamento de elementos do DOM
    const inputCampeao = document.getElementById("input-campeao");
    const btnEnviar = document.getElementById("btn-enviar");
    const listaSugestoes = document.getElementById("lista-sugestoes");
    const tabelaCorpo = document.getElementById("resultado-linhas");
    const txtContador = document.getElementById("contador-tentativas");
    
    const txtFalaCitacao = document.getElementById("fala-texto");
    const btnOuvirFala = document.getElementById("btn-ouvir-fala");
    const audioFalaCampeao = document.getElementById("audio-fala-campeao");
    
    const audioHover = document.getElementById("audio-hover");
    const audioClick = document.getElementById("audio-click");

    const popupInicio = document.getElementById("popup-inicio");
    const btnIniciarJogo = document.getElementById("btn-iniciar-jogo");

    const popupVitoria = document.getElementById("popup-vitoria");
    const imgPopupVitoria = document.getElementById("popup-vitoria-img");
    const txtVitoriaCampeao = document.getElementById("popup-vitoria-nome-campeao");
    const txtVitoriaTentativas = document.getElementById("popup-vitoria-tentativas");
    const btnReiniciar = document.getElementById("popup-reiniciar");

    const CONFIG_BOTOES_POPUP = {
        "btn-champions": "../champions/champions.html",
        "btn-falas": "falas.html",
        "btn-splash-campeoes": "../splash_campeoes/splash_campeoes.html"
    };

    let tentativasRealizadas = [];

    // Injeta os dados iniciais de citação e áudio
    if (campeaoSecreto) {
        if (txtFalaCitacao) txtFalaCitacao.textContent = campeaoSecreto.frase || `"Vou rasgar o seu world ao meio!"`;
        if (audioFalaCampeao) audioFalaCampeao.src = campeaoSecreto.audio || `../default/sons_falas/${campeaoSecreto.nome.toLowerCase()}.mp3`;
    }

    // Áudio bloqueado até 3 tentativas
    if (btnOuvirFala) {
        btnOuvirFala.disabled = true;
        btnOuvirFala.innerHTML = `
            <span class="icone-play">🔒</span>
            ÁUDIO LIBERADO APÓS 3 TENTATIVAS
        `;
    }

    if (btnOuvirFala && audioFalaCampeao) {
        btnOuvirFala.addEventListener("click", () => {

            if (tentativasRealizadas.length < 3) {
                alert(`O áudio será liberado após ${3 - tentativasRealizadas.length} tentativa(s).`);
                return;
            }

            audioFalaCampeao.currentTime = 0;
            audioFalaCampeao.play().catch(err =>
                console.log("Erro ao reproduzir fala:", err)
            );
        });
    }

    // ==========================================================================
    // CONTROLE CORRIGIDO DO POP-UP INICIAL (BLINDADO)
    // ==========================================================================
    if (btnIniciarJogo) {
    btnIniciarJogo.addEventListener("click", () => {

        if (audioHover && audioClick) {
            audioHover.play()
                .then(() => {
                    audioHover.pause();
                    audioHover.currentTime = 0;
                })
                .catch(() => {});

            audioClick.play()
                .then(() => {
                    audioClick.pause();
                    audioClick.currentTime = 0;
                })
                .catch(() => {});
        }

        if (popupInicio) {
            popupInicio.style.display = "none";
        }

    });
}

    // ==========================================================================
    // ECOSSISTEMA DE AUDIO E EVENTOS GENÉRICOS
    // ==========================================================================
    const mapearSonsBotoes = () => {
        document.querySelectorAll("button, .menu, .sugestao-item, .btn-modo-menu, .btn-fala-audio").forEach(botao => {
            botao.removeEventListener("mouseenter", tocarHover);
            botao.removeEventListener("click", tocarClick);
            botao.addEventListener("mouseenter", tocarHover);
            botao.addEventListener("click", tocarClick);
        });
    };

    function tocarHover() { if (audioHover) { audioHover.currentTime = 0; audioHover.play().catch(() => {}); } }
    function tocarClick() { if (audioClick) { audioClick.currentTime = 0; audioClick.play().catch(() => {}); } }

    mapearSonsBotoes();

    document.querySelectorAll(".popup-container-modos .btn-modo-menu").forEach(botao => {
        botao.addEventListener('click', () => {
            const paginaDestino = CONFIG_BOTOES_POPUP[botao.id];
            if (paginaDestino) {
                setTimeout(() => { window.location.href = paginaDestino; }, 300);
            }
        });
    });

    const configMenuSuperior = {
        "voltar": "../index.html",
        "prox": "../splashArt/splash_campeoes.html"
    };

    document.querySelectorAll(".menu").forEach(botao => {
        botao.addEventListener("click", () => {
            const destino = configMenuSuperior[botao.id];
            if (destino) window.location.href = destino;
        });
    });

    if (btnReiniciar) {
        btnReiniciar.addEventListener("click", () => { window.location.reload(); });
    }

    // ==========================================================================
    // SISTEMA DE BUSCA E AUTOCOMPLETE
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
                mapearSonsBotoes();
            } else {
                listaSugestoes.style.display = "none";
            }
        });

        document.addEventListener("click", (e) => {
            if (e.target !== inputCampeao) listaSugestoes.style.display = "none";
        });

        inputCampeao.addEventListener("keydown", (e) => {
            if (e.key === "Enter") verificarEnvioPorBotao();
        });
    }

    if (btnEnviar) btnEnviar.addEventListener("click", verificarEnvioPorBotao);

    function verificarEnvioPorBotao() {
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

    // ==========================================================================
    // LOGICA DE PROCESSAMENTO DE TENTATIVAS E FIM DE JOGO
    // ==========================================================================
    function processarTentativa(campeaoTentado) {
        tentativasRealizadas.push(campeaoTentado.nome);
        inputCampeao.value = "";
        if (listaSugestoes) listaSugestoes.style.display = "none";

        const totalTentativas = tentativasRealizadas.length;
        if (txtContador) txtContador.textContent = `Tentativas: ${totalTentativas}`;
            // Libera o áudio após 3 tentativas
            if (totalTentativas >= 3 && btnOuvirFala.disabled) {
                btnOuvirFala.disabled = false;
                btnOuvirFala.innerHTML = `
                    <span class="icone-play">🔊</span>
                    OUVIR ÁUDIO DA FALA
                `;
            }

        const novaLinha = document.createElement("tr");
        const tdNome = document.createElement("td");
        
        tdNome.innerHTML = `<img src="${campeaoTentado.imagem}" alt="Avatar"> <span>${campeaoTentado.nome}</span>`;
        tdNome.className = (campeaoTentado.nome === campeaoSecreto.nome) ? "correto" : "invertido incorreto";
        
        novaLinha.appendChild(tdNome);

        if (tabelaCorpo) {
            tabelaCorpo.insertBefore(novaLinha, tabelaCorpo.firstChild);
        }



        mapearSonsBotoes();

        if (campeaoTentado.nome === campeaoSecreto.nome) {
            setTimeout(() => {
                if (inputCampeao) inputCampeao.disabled = true;
                if (btnEnviar) btnEnviar.disabled = true;

                if (audioFalaCampeao) {
                    audioFalaCampeao.currentTime = 0;
                    audioFalaCampeao.play().catch(() => {});
                }

                if (imgPopupVitoria) imgPopupVitoria.src = campeaoSecreto.imagem;
                if (txtVitoriaCampeao) txtVitoriaCampeao.textContent = campeaoSecreto.nome;
                if (txtVitoriaTentativas) {
                    txtVitoriaTentativas.innerHTML = `Tentativas: <strong>${tentativasRealizadas.length}</strong>`;
                }

                if (popupVitoria) popupVitoria.style.display = "flex";
                mapearSonsBotoes();
            }, 600);
        }
    }
});
