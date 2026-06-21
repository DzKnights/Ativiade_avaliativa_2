// ==========================================================================
    // 6. SISTEMA DE VALIDAÇÃO (VITÓRIA / ZOOMS DE ERRO / HISTÓRICO VISUAL)
    // ==========================================================================
    function verificarResposta(nomeCampeao) {
        tentativas++;
        tentativasRealizadas.push(nomeCampeao);
        if (contador) contador.textContent = `Tentativas: ${tentativas}`;
        
        inputCampeao.value = "";
        const palpite = normalizarTexto(nomeCampeao);
        const alvoCorreto = normalizarTexto(splashAtual.campeao);

        // Busca os dados do campeão que o usuário digitou para conseguir a foto do card
        const campeaoChutado = LISTA_CAMPEOES_BARRA.find(c => normalizarTexto(c.nome) === palpite);
        const urlIcone = campeaoChutado ? campeaoChutado.imagem : '../default/logo.jpg';

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

        // ERROU! -> 1. Cria o card visual vermelho idêntico à imagem enviada
        const historicoContainer = document.getElementById("historico-tentativas");
        if (historicoContainer) {
            const cardErro = document.createElement("div");
            
            // Estilização direta simulando perfeitamente o padrão da imagem
            cardErro.style.backgroundColor = "#c63625";
            cardErro.style.border = "2px solid #1a1a1a";
            cardErro.style.borderRadius = "8px";
            cardErro.style.padding = "12px";
            cardErro.style.display = "flex";
            cardErro.style.flexDirection = "column";
            cardErro.style.alignItems = "center";
            cardErro.style.justifyContent = "center";
            cardErro.style.gap = "8px";
            cardErro.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
            cardErro.style.animation = "fadeIn 0.3s ease-out";

            cardErro.innerHTML = `
                <img src="${urlIcone}" onerror="this.src='../default/logo.jpg';" style="width: 50px; height: 50px; border-radius: 6px; border: 2px solid #1a1a1a; object-fit: cover;">
                <span style="color: #ffffff; font-weight: bold; text-transform: uppercase; font-size: 14px; letter-spacing: 1px;">${nomeCampeao}</span>
            `;

            // Insere no topo da lista (o erro mais recente fica em primeiro)
            historicoContainer.insertBefore(cardErro, historicoContainer.firstChild);
        }

        // ERROU! -> 2. Aplica zoom de afastamento na Splash Art original
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
