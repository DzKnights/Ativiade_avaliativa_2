document.addEventListener("DOMContentLoaded", () => {
    
    // Seleciona um campeão aleatório da base global cadastrada no arquivo lista_camp.js
    const campeaoSecreto = LISTA_CAMPEOES[Math.floor(Math.random() * LISTA_CAMPEOES.length)];
    // Exibe no console para fins de homologação e testes de desenvolvimento
    console.log("Alvo secreto:", campeaoSecreto.nome);

    // Mapeamento dos elementos do DOM
    const inputCampeao = document.getElementById("input-campeao");
    const btnEnviar = document.getElementById("btn-enviar");
    const listaSugestoes = document.getElementById("lista-sugestoes");
    const tabelaCorpo = document.getElementById("resultado-linhas");
    
    // Efeitos sonoros
    const audioHover = document.getElementById("audio-hover");
    const audioClick = document.getElementById("audio-click");

    // Componentes de controle do painel de dicas e inicialização
    const popupInicio = document.getElementById("popup-inicio");
    const btnIniciarJogo = document.getElementById("btn-iniciar-jogo");
    const txtContador = document.getElementById("contador-tentativas");
    const cardsDicas = document.querySelectorAll(".dica-card");

    // Elementos do Popup de Vitória
    const popupVitoria = document.getElementById("popup-vitoria");
    const imgPopupVitoria = document.getElementById("popup-vitoria-img");
    const txtVitoriaCampeao = document.getElementById("popup-vitoria-nome-campeao");
    const txtVitoriaTentativas = document.getElementById("popup-vitoria-tentativas");
    const btnReiniciar = document.getElementById("popup-reiniciar");

    // CONFIGURAÇÃO DOS LINKS DE REDIRECIONAMENTO DOS MODOS
    const CONFIG_BOTOES_POPUP = {
        "btn-champions": "champions.html",
        "btn-falas": "../falas/falas.html",
        "btn-splash-campeoes": "../splash_campeoes/splash_campeoes.html"
    };

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

    // Configuração dos botões do menu superior (Voltar / Próximo)
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

    if (btnReiniciar) {
        btnReiniciar.addEventListener("click", () => {
            window.location.reload();
        });
    }

    // ==========================================================================
    // 3. ENGENHARIA DE INTERAÇÃO DOS CARDS DE DICAS INTERATIVAS
    // ==========================================================================
    const atualizarStatusDicas = () => {
        cardsDicas.forEach(card => {
            if (card.classList.contains("revelado")) return;

            if (creditosDicas > 0) {
                card.classList.add("disponivel");
            } else {
                card.classList.remove("disponivel");
            }
        });
        mapearSonsBotoes();
    };

    cardsDicas.forEach(card => {
        card.addEventListener("click", () => {
            if (!card.classList.contains("disponivel") || card.classList.contains("revelado")) return;

            creditosDicas--;
            
            const propriedade = card.getAttribute("data-prop");
            let valorCerto = campeaoSecreto[propriedade];
            
            if (propriedade === "classe" && !valorCerto) {
                valorCerto = campeaoSecreto["especie"];
            }

            card.classList.remove("disponivel");
            card.classList.add("revelado");
            card.querySelector(".valor").textContent = valorCerto;

            atualizarStatusDicas();
        });
    });

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

    // ==========================================================================
    // 5. REGRA DE PROCESSAMENTO DE JOGO E VALIDAÇÃO DE ACERTOS
    // ==========================================================================
    function processarTentativa(campeaoTentado) {
        tentativasRealizadas.push(campeaoTentado.nome);
        inputCampeao.value = "";
        if (listaSugestoes) listaSugestoes.style.display = "none";

        const totalTentativas = tentativasRealizadas.length;
        if (txtContador) txtContador.textContent = `Tentativas: ${totalTentativas}`;

        if (totalTentativas > 0 && totalTentativas % 5 === 0) {
            creditosDicas++;
            atualizarStatusDicas();
        }

        const novaLinha = document.createElement("tr");

        // Nome / Card do campeão
        const tdNome = document.createElement("td");
        tdNome.innerHTML = `<img src="${campeaoTentado.imagem}"><br>${campeaoTentado.nome}`;
        tdNome.className = campeaoTentado.nome === campeaoSecreto.nome ? "correto" : "incorreto";
        novaLinha.appendChild(tdNome);

        // Helper interno de comparação parcial
        const verificarParcial = (propTentada, propSecreta) => {
            if (propTentada === propSecreta) return "correto";
            const tPartes = String(propTentada).toLowerCase().split(",").map(p => p.trim());
            const sPartes = String(propSecreta).toLowerCase().split(",").map(p => p.trim());
            const todosAcertaram = tPartes.length === sPartes.length && tPartes.every(p => sPartes.includes(p));
            if (todosAcertaram) return "correto";
            return tPartes.some(p => sPartes.includes(p)) ? "parcial" : "incorreto";
        };

        // Gênero
        const tdGenero = document.createElement("td");
        tdGenero.textContent = campeaoTentado.genero;
        tdGenero.className = verificarParcial(campeaoTentado.genero, campeaoSecreto.genero);
        novaLinha.appendChild(tdGenero);

        // Posição
        const tdPosicao = document.createElement("td");
        tdPosicao.textContent = campeaoTentado.posicao;
        tdPosicao.className = verificarParcial(campeaoTentado.posicao, campeaoSecreto.posicao);
        novaLinha.appendChild(tdPosicao);

        // Classe
        const tdClasse = document.createElement("td");
        tdClasse.textContent = campeaoTentado.especie || campeaoTentado.classe;
        tdClasse.className = verificarParcial(campeaoTentado.especie || campeaoTentado.classe, campeaoSecreto.especie || campeaoSecreto.classe);
        novaLinha.appendChild(tdClasse);

        // Recurso
        const tdRecurso = document.createElement("td");
        tdRecurso.textContent = campeaoTentado.recurso;
        tdRecurso.className = verificarParcial(campeaoTentado.recurso, campeaoSecreto.recurso);
        novaLinha.appendChild(tdRecurso);

        // Alcance
        const tdAlcance = document.createElement("td");
        tdAlcance.textContent = campeaoTentado.alcance;
        tdAlcance.className = verificarParcial(campeaoTentado.alcance, campeaoSecreto.alcance);
        novaLinha.appendChild(tdAlcance);

        // Região
        const tdRegiao = document.createElement("td");
        tdRegiao.textContent = campeaoTentado.regiao;
        tdRegiao.className = verificarParcial(campeaoTentado.regiao, campeaoSecreto.regiao);
        novaLinha.appendChild(tdRegiao);

        // Ano de Lançamento
        const tdAno = document.createElement("td");
        const anoTentado = parseInt(campeaoTentado.ano, 10);
        const anoSecreto = parseInt(campeaoSecreto.ano, 10);

        if (anoTentado === anoSecreto) {
            tdAno.textContent = campeaoTentado.ano;
            tdAno.className = "correto";
        } else {
            const seta = anoTentado < anoSecreto ? "▲" : "▼";
            tdAno.innerHTML = `${campeaoTentado.ano} <span class="seta-ano">${seta}</span>`;
            tdAno.className = "incorreto";
        }
        novaLinha.appendChild(tdAno);

        // Adiciona a linha no topo do corpo da tabela
        if (tabelaCorpo) {
            tabelaCorpo.insertBefore(novaLinha, tabelaCorpo.firstChild);
        }

        mapearSonsBotoes();

        // Verificação de Vitória
        if (campeaoTentado.nome === campeaoSecreto.nome) {
            setTimeout(() => {
                if (inputCampeao) inputCampeao.disabled = true;
                if (btnEnviar) btnEnviar.disabled = true;

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
