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
    // 1. EXTRAÇÃO DE CAMPEÕES ÚNICOS DA LISTA_SPLASH para a Barra de Pesquisa
    // ==========================================================================
    if (typeof LISTA_SPLASH === 'undefined' || !LISTA_SPLASH || LISTA_SPLASH.length === 0) {
        alert("Erro: O arquivo lista_splash.js não foi carregado corretamente.");
        return;
    }

    const LISTA_CAMPEOES_BARRA = [];
    const campeoesAdicionados = new Set();

    LISTA_SPLASH.forEach(item => {
        if (!campeoesAdicionados.has(item.campeao)) {
            campeoesAdicionados.add(item.campeao);

            // Transforma "Kai'Sa" em "kaisa", "Master Yi" em "masteryi" para achar o ícone
            const nomeArquivo = item.campeao.toLowerCase().replace(/['\s]/g, "");

            LISTA_CAMPEOES_BARRA.push({
                nome: item.campeao,
                imagem: `../icone_champions/${nomeArquivo}.jpg` // Caminho para as fotos redondas
            });
        }
    });

    // ==========================================================================
    // 2. SISTEMA DE ÁUDIO E MAPEAMENTO DE SONS
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

    // Mapeamento inicial dos botões na tela
    mapearSonsBotoes();

    // ==========================================================================
    // 3. NAVEGAÇÃO DOS BOTÕES SUPERIORES (VOLTAR / PRÓXIMO)
    // ==========================================================================
    const configmenu = {
        "voltar": "../index.html",
        "prox": "../champions/champions.html"
    };

    document.querySelectorAll(".menu").forEach(botao => {
        botao.addEventListener("click", () => {
            const destino = configmenu[botao.id];
            if (destino) window.location.href = destino;
        });
    });

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
    // 4. INICIALIZAÇÃO DA SPLASH ART ALEATÓRIA DO JOGO
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
    // 5. AUTOCOMPLETE (BARRA DE PESQUISA)
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

            // Filtra usando a nossa lista criada unicamente a partir do seu LISTA_SPLASH
            const filtrados = LISTA_CAMPEOES_BARRA.filter(c => 
                normalizarTexto(c.nome).includes(valorDigitado) && 
                !tentativasRealizadas.includes(c.nome)
            );

            if (filtrados.length > 0) {
                filtrados.forEach(campeao => {
                    const item = document.createElement("div");
                    item.className = "sugestao-item";
                    
                    item.innerHTML = `<img src="${campeao.imagem}" alt="${campeao.nome}" onerror="this.src='../default/logo.jpg';" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;"> <span>${campeao.nome}</span>`;
                    
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

        // Fecha a caixinha se clicar fora do input
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

        const campeaoEncontrado = LISTA_CAMPEOES_BARRA.find(c => normalizarTexto(c.nome) === nomeDigitado);

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
    // 6. SISTEMA DE VALIDAÇÃO (VITÓRIA / ZOOMS DE ERRO + LISTA VISUAL)
    // ==========================================================================
    function verificarResposta(nomeCampeao) {
        tentativas++;
        tentativasRealizadas.push(nomeCampeao);
        if (contador) contador.textContent = `Tentativas: ${tentativas}`;
        
        inputCampeao.value = "";
        const palpite = normalizarTexto(nomeCampeao);
        const alvoCorreto = normalizarTexto(splashAtual.campeao);

        // Busca os dados completos do campeão palpitado (imagem e nome original)
        const campeaoPalpitado = LISTA_CAMPEOES_BARRA.find(c => normalizarTexto(c.nome) === palpite);

        if (palpite === alvoCorreto) {
            // ACERTOU!
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

        // ERROU! -> Adiciona o card vermelho na lista dinamicamente
        if (campeaoPalpitado) {
            const listaErradas = document.getElementById("lista-tentativas-erradas");
            const tituloTentativas = document.querySelector(".titulo-tentativas");
            
            if (listaErradas) {
                // Ativa a exibição do título "SUAS TENTATIVAS" se for o primeiro erro
                if (tituloTentativas) tituloTentativas.style.display = "block";

                // Cria o card container vermelho do erro
                const cardErro = document.createElement("div");
                cardErro.className = "card-tentativa-erro";

                // Monta a estrutura igual à imagem (imagem centralizada + texto em caixa alta embaixo)
                cardErro.innerHTML = `
                    <img src="${campeaoPalpitado.imagem}" alt="${campeaoPalpitado.nome}" onerror="this.src='../default/logo.jpg';">
                    <span>${campeaoPalpitado.nome.toUpperCase()}</span>
                `;

                // Adiciona sempre no topo da pilha de erros
                listaErradas.insertBefore(cardErro, listaErradas.firstChild);
            }
        }

        // Aplica zoom de afastamento
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
