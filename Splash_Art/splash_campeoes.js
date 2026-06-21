document.addEventListener("DOMContentLoaded", () => {

    // ==========================================================================
    // MAPEAMENTO DOS ELEMENTOS DO DOM
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
    // GERADOR DINÂMICO DE CAMPEÕES (Mapeia para a pasta correta de ícones)
    // ==========================================================================
    if (typeof LISTA_SPLASH === 'undefined' || !LISTA_SPLASH || LISTA_SPLASH.length === 0) {
        alert("Erro: LISTA_SPLASH não foi carregada corretamente.");
        return;
    }

    const LISTA_CAMPEOES = [];
    const campeoesAdicionados = new Set();

    LISTA_SPLASH.forEach(item => {
        if (!campeoesAdicionados.has(item.campeao)) {
            campeoesAdicionados.add(item.campeao);

            // Padroniza o nome para o arquivo (Remove aspas simples, espaços e joga tudo para minúsculo)
            // Exemplo: "Kai'Sa" vira "kaisa", "Master Yi" vira "masteryi"
            const nomeArquivo = item.campeao.toLowerCase().replace(/['\s]/g, "");

            LISTA_CAMPEOES.push({
                nome: item.campeao,
                imagem: `../icone_champions/${nomeArquivo}.jpg` // Caminho corrigido apontando para os ícones
            });
        }
    });

    // ==========================================================================
    // SISTEMA DE ÁUDIO E HOVER
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
    // NAVEGAÇÃO DOS BOTÕES (VOLTAR, PRÓXIMO E POP-UP)
    // ==========================================================================
    const CONFIG_BOTOES = {
        "voltar": "../index.html",
        "prox": "../champions/champions.html",
        "btn-champions": "../champions/champions.html",
        "btn-falas": "../falas/falas.html",
        "btn-splash-campeoes": "./splash_campeoes.html"
    };

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
    // INICIALIZAÇÃO DA SPLASH ART ALEATÓRIA
    // ==========================================================================
    const splashAtual = LISTA_SPLASH[Math.floor(Math.random() * LISTA_SPLASH.length)];
    console.log("Splash escolhida para adivinhar:", splashAtual);

    if (splash) {
        splash.src = splashAtual.imagem;
        splash.className = "zoom-1";
        const posX = Math.floor(Math.random() * 100);
        const posY = Math.floor(Math.random() * 100);
        splash.style.objectPosition = `${posX}% ${posY}%`;
    }

    // ==========================================================================
    // AUTOCOMPLETE E MECÂNICA DE ADIVINHAÇÃO
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
                    item.innerHTML = `<img src="${campeao.imagem}" alt="${campeao.nome}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;"> <span>${campeao.nome}</span>`;
                    
                    item.addEventListener("click", () => {
                        inputCampeao.value = campeao.nome;
                        listaSugestoes.innerHTML = "";
                        listaSugestoes.style.display = "none";
                        verificarResposta(campeao.nome);
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
            alert("Campeão inválido ou não encontrado. Selecione uma opção válida da lista!");
        }
    }

    // ==========================================================================
    // SISTEMA DE VERIFICAÇÃO E REVELAÇÃO (VITÓRIA / DERROTA)
    // ==========================================================================
    function verificarResposta(nomeCampeao) {
        tentativas++;
        tentativasRealizadas.push(nomeCampeao);
        contador.textContent = `Tentativas: ${tentativas}`;
        
        const palpite = normalizarTexto(nomeCampeao);
        const alvoCorreto = normalizarTexto(splashAtual.campeao);

        if (palpite === alvoCorreto) {
            splash.className = "revelado";
            
            if (popupVitoria) {
                popupVitoriaImg.src = splashAtual.imagem;
                popupVitoriaNome.textContent = `${splashAtual.campeao} - ${splashAtual.skin}`;
                
                const elementoStrong = popupVitoriaTentativas.querySelector("strong");
                if (elementoStrong) {
                    elementoStrong.textContent = parseInt(tentativas);
                } else {
                    popupVitoriaTentativas.innerHTML = `Tentativas: <strong>${tentativas}</strong>`;
                }
                
                setTimeout(() => {
                    popupVitoria.style.display = "flex";
                }, 400);
            }
            
            btnEnviar.disabled = true;
            inputCampeao.disabled = true;
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
                    alert(`Fim de jogo!\n\nO campeão correto era: ${splashAtual.campeao}\nSkin: ${splashAtual.skin}`);
                    window.location.reload();
                }, 500);

                btnEnviar.disabled = true;
                inputCampeao.disabled = true;
        }

        inputCampeao.value = "";
    }
});
