document.addEventListener("DOMContentLoaded", () => {

    const splash = document.getElementById("splash-img");
    const input = document.getElementById("input-campeao");
    const btn = document.getElementById("btn-enviar");
    const contador = document.getElementById("contador-tentativas");

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
