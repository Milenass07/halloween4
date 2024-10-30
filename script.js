const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const storyScreen = document.getElementById('story-screen');
const levelSelectScreen = document.getElementById('level-select-screen');
const storyText = document.getElementById('story-text');
const continueText = document.getElementById('continue-text');
const playButton = document.getElementById('play-button');
const newGameButton = document.getElementById('new-game-button');
const shopButton = document.getElementById('shop-button');
const levelButtons = document.querySelectorAll('.level-button');

function ajustarCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', ajustarCanvas);
ajustarCanvas();

function detectarDispositivo() {
    const isMobile = /iPhone|iPad|Android|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent);
    if (isMobile) {
        document.getElementById('mobile-controls').style.display = 'flex';
    }
}
detectarDispositivo();

// Carregar as músicas
const musicaInicio = document.getElementById('audio');
const trilhaSonora = document.getElementById('musicas3');
const killSound = new Audio('kill-sound.mp3'); 
killSound.volume = 0.1; 

// Carregar a imagem de fundo
const backgroundImage = new Image();
backgroundImage.src = 'fundo1.png'; // Caminho da imagem de fundo

// Carregar a imagem do portão
const gateImage = new Image();
gateImage.src = 'portao.png'; // Caminho da imagem do portão

// Definir o tamanho do canvas (área visível do jogo)
canvas.width = 800;
canvas.height = 600;

// Tamanho do mapa
const mapWidth = 1400;
const mapHeight = 900;

// Tamanho do personagem
const playerWidth = 110; // Tamanho do personagem
const playerHeight = 140;

// Tamanho do portão
const gateWidth = 1400;
const gateHeight = 900;

// Posição do portão no centro superior do mapa
const gateX = (mapWidth - gateWidth) / 2;
const gateY = 0;

// Câmera
let cameraX = 0;
let cameraY = 0;

// Carregar as imagens do personagem
const playerImageParado = new Image();
playerImageParado.src = 'vampiro.png';

const playerImageAndando1 = new Image();
playerImageAndando1.src = 'vampiro.png';

const playerImageAndando2 = new Image();
playerImageAndando2.src = 'vampiro2.png';

let currentPlayerImage = playerImageParado;

// Carregar as imagens das vítimas e das vítimas mortas
const victimImage1 = new Image();
victimImage1.src = 'vitima1.png';

const victimImage2 = new Image();
victimImage2.src = 'vitima2.png';

const victimDeadImage1 = new Image();
victimDeadImage1.src = 'vitimamorta1.png'; // Imagem da vítima morta 1

const victimDeadImage2 = new Image();
victimDeadImage2.src = 'vitimamorta2.png'; // Imagem da vítima morta 2

const victims = [
    { x: Math.random() * (mapWidth - 90), y: Math.random() * (mapHeight - 120), width: 90, height: 120, image: victimImage1, isDead: false, deadImage: victimDeadImage1 },
    { x: Math.random() * (mapWidth - 90), y: Math.random() * (mapHeight - 120), width: 90, height: 120, image: victimImage2, isDead: false, deadImage: victimDeadImage2 }
];

// Carregar as novas imagens das vítimas e das vítimas mortas para o nível 2
const victimImage3 = new Image();
victimImage3.src = 'vitima2.png';

const victimImage4 = new Image();
victimImage4.src = 'vitima2.png';

const victimImage5 = new Image();
victimImage5.src = 'vitima2.png';

const victimDeadImage3 = new Image();
victimDeadImage3.src = 'vitimamorta3.png'; // Imagem da vítima morta 3

const victimDeadImage4 = new Image();
victimDeadImage4.src = 'vitimamorta4.png'; // Imagem da vítima morta 4

const victimDeadImage5 = new Image();
victimDeadImage5.src = 'vitimamorta5.png'; // Imagem da vítima morta 5

// Posicionar o jogador no centro inferior do mapa
let playerX = (mapWidth - playerWidth) / 2;
let playerY = mapHeight - playerHeight; // Centralizado horizontalmente e na parte inferior verticalmente
let playerSpeed = 2;
let isMoving = false;
let animationFrame = 0;
let animationInterval;
let keys = {};

// Lista de frases da história
const historia = [
    "Em uma cidade esquecida pelo tempo, vivia um vampiro solitario chamado Adrian...",
    "Sua imortalidade, uma vez vista como um presente, tornou-se uma maldiçao apos a morte de sua esposa humana, Isabel...",
    "Isabel foi o grande amor de sua vida, mas como todos os mortais, envelheceu e morreu...",
    "Deixando Adrian sozinho por séculos.",
    "Desesperado para tê-la de volta, Adrian passou anos estudando artes obscuras e rituais antigos...",
    "Ele descobriu que poderia trazer Isabel de volta, mas o preço era alto:",
    "Ele precisava reunir 20 almas puras para realizar o ritual de ressurreiçao.",
    "E assim começa sua jornada.."
];

let fraseAtual = 0;

// Variável para a contagem de almas
let almas = 0;
let mensagemLegenda = '';
let showGateMessage = false;

function startGame() {
    startScreen.style.display = 'none';
    levelSelectScreen.style.display = 'flex';
    playBackgroundMusic(); // Toca a música inicial
}

function mostrarProximaFrase() {
    if (fraseAtual < historia.length) {
        storyText.textContent = historia[fraseAtual];
        continueText.style.display = 'block';
    } else {
        iniciarJogo();
    }
}

function avancarHistoria() {
    fraseAtual++;
    mostrarProximaFrase();
}

// Adicionando o evento de clique e toque para dispositivos móveis e desktop
function adicionarEventoDeAvanco() {
    continueText.addEventListener('click', avancarHistoria);
    continueText.addEventListener('touchstart', avancarHistoria, { passive: true });

    // Também mantemos o evento da tecla 'Espaço' para desktop
    window.addEventListener('keydown', event => {
        if (event.key === ' ') {
            avancarHistoria();
        }
    });
}

// Chamando a função para adicionar os eventos ao carregar a página
adicionarEventoDeAvanco();



function iniciarJogo() {
    storyScreen.style.display = 'none';
    canvas.style.display = 'block';
    stopBackgroundMusic(); // Para a música inicial após a história
    startGameMusic(); // Começa a música de fundo do jogo
    updateCamera(); // Atualizar a câmera para que o jogador comece visível
    requestAnimationFrame(gameLoop);
}

function verificarOrientacao() {
    const orientationWarning = document.getElementById('orientation-warning');

    // Verifica se o dispositivo está no modo retrato (vertical)
    if (window.innerHeight > window.innerWidth) {
        orientationWarning.style.display = 'flex'; // Exibe a mensagem
    } else {
        orientationWarning.style.display = 'none'; // Esconde a mensagem
    }
}

// mude isso aqui: Verificar a orientação após a história e iniciar o jogo
function iniciarJogo() {
    storyScreen.style.display = 'none';
    canvas.style.display = 'block';

    function verificarOrientacao() {
        const orientationWarning = document.getElementById('orientation-warning');
    
        // Verifica se o dispositivo está no modo retrato (vertical)
        if (window.innerHeight > window.innerWidth) {
            orientationWarning.style.display = 'flex'; // Exibe a mensagem
        } else {
            orientationWarning.style.display = 'none'; // Esconde a mensagem
        }
    }
    
    // mude isso aqui: Verificar a orientação após a história e iniciar o jogo
    function iniciarJogo() {
        storyScreen.style.display = 'none';
        canvas.style.display = 'block';
    
        // Verificar a orientação do dispositivo
        verificarOrientacao(); 
    
        // Adicionar o listener para continuar verificando quando a tela for girada
        window.addEventListener('resize', verificarOrientacao);
    
        stopBackgroundMusic(); // Para a música inicial após a história
        startGameMusic(); // Começa a música de fundo do jogo
        updateCamera(); // Atualizar a câmera para que o jogador comece visível
        requestAnimationFrame(gameLoop); // Inicia o loop do jogo
    }
    
    // Função para mostrar a próxima frase da história
    function mostrarProximaFrase() {
        if (fraseAtual < historia.length) {
            storyText.textContent = historia[fraseAtual];
            continueText.style.display = 'block';
        } else {
            iniciarJogo(); // Chama o jogo quando a história termina
        }
    }
    

function newGame() {
    playerX = (mapWidth - playerWidth) / 2; // Centralizar horizontalmente no mapa
    playerY = mapHeight - playerHeight; // Centralizar verticalmente na parte inferior do mapa
    almas = 0; // Reiniciar a contagem de almas
    repositionVictims(); // Reposicionar as vítimas
    startGame();
}

function openShop() {
    alert('Bem-vindo à Loja! (Funcionalidade a ser implementada)');
}

function drawBackground() {
    ctx.drawImage(backgroundImage, -cameraX, -cameraY, mapWidth, mapHeight);
}

function drawPlayer() {
    // Limpar o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar o fundo do mapa com base na posição da câmera
    drawBackground();

    if (currentLevel === 1) {
        // Desenhar o portão
        ctx.drawImage(gateImage, gateX - cameraX, gateY - cameraY, gateWidth, gateHeight);
    }

    // Desenhar as vítimas
    victims.forEach(victim => {
        if (victim.image) {
            ctx.drawImage(victim.isDead ? victim.deadImage : victim.image, victim.x - cameraX, victim.y - cameraY, victim.width, victim.height);
        }
    });

    // Desenhar o jogador na posição ajustada pela câmera
    ctx.drawImage(currentPlayerImage, playerX - cameraX, playerY - cameraY, playerWidth, playerHeight);

    // Desenhar a contagem de almas no canto superior esquerdo
    ctx.font = '25px Bleeding_Cowboys';
    ctx.fillStyle = 'gray';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Almas: ${almas}`, 10, 10);

    // Desenhar a mensagem de legenda
    if (mensagemLegenda) {
        ctx.font = '20px Bleeding_Cowboys';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(mensagemLegenda, canvas.width / 2, canvas.height - 30);
    }

    // Desenhar a mensagem sobre o portão, se necessário
    if (showGateMessage) {
        ctx.font = '20px Bleeding_Cowboys';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Aperte (F) para abrir', canvas.width / 2, canvas.height - 60);
    }
}


// Ajuste: Mover a lógica de movimentação para dentro do game loop e garantir que os listeners estejam corretos.
function gameLoop() {
    movePlayer(); // Atualiza a posição do jogador
    updateCamera(); // Atualiza a posição da câmera
    checkCollisions(); // Verifica as colisões
    drawPlayer(); // Desenha o jogador e o cenário
    requestAnimationFrame(gameLoop); // Chama o próximo quadro
}

function movePlayer() {
    isMoving = false;

    if (keys['w'] || keys['ArrowUp']) {
        playerY -= playerSpeed;
        isMoving = true;
    }
    if (keys['s'] || keys['ArrowDown']) {
        playerY += playerSpeed;
        isMoving = true;
    }
    if (keys['a'] || keys['ArrowLeft']) {
        playerX -= playerSpeed;
        isMoving = true;
    }
    if (keys['d'] || keys['ArrowRight']) {
        playerX += playerSpeed;
        isMoving = true;
    }

    playerX = Math.max(0, Math.min(playerX, mapWidth - playerWidth));
    playerY = Math.max(0, Math.min(playerY, mapHeight - playerHeight));

    if (isMoving) startWalkingAnimation();
    else stopWalkingAnimation();
}


window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', event => {
    keys[event.key] = false;
    if (event.key === 'e') handleVictimInteraction(); // Interação com vítimas
    if (event.key === 'f') handleGateInteraction(); // Interação com o portão
});

function keyDownHandler(event) {
    keys[event.key] = true;
    if (event.key === 'r' && currentLevel === 2) showVictimsLevel2(); // Mostra vítimas ao apertar "r"
}


function updateCamera() {
    // Centralizar a câmera em relação ao jogador
    cameraX = Math.max(0, Math.min(playerX - canvas.width / 2 + playerWidth / 2, mapWidth - canvas.width));
    cameraY = Math.max(0, Math.min(playerY - canvas.height / 2 + playerHeight / 2, mapHeight - canvas.height));
}

function startWalkingAnimation() {
    if (!animationInterval) {
        animationInterval = setInterval(() => {
            animationFrame = (animationFrame + 1) % 2;
            currentPlayerImage = animationFrame === 0 ? playerImageAndando1 : playerImageAndando2;
        }, 200);
    }
}

function stopWalkingAnimation() {
    clearInterval(animationInterval);
    animationInterval = null;
    currentPlayerImage = playerImageParado;
}

function keyDownHandler(event) {
    keys[event.key] = true;
}

function keyUpHandler(event) {
    keys[event.key] = false;
    if (event.key === 'e') {
        handleVictimInteraction();
    }
    if (event.key === 'f') {
        handleGateInteraction(); // Verifica se o jogador está interagindo com o portão
    }
}

function showLevelSelectScreen() {
    startScreen.style.display = 'none';
    levelSelectScreen.style.display = 'flex';
}

function handleLevelSelection(event) {
    const level = event.target.dataset.level;
    if (level) {
        levelSelectScreen.style.display = 'none';
        storyScreen.style.display = 'flex';
        fraseAtual = 0;
        mostrarProximaFrase();
    }
}

function playBackgroundMusic() {
    musicaInicio.play().catch(error => {
        console.error('Erro ao tentar tocar a música de fundo: ', error);
    });
}

function startGameMusic() {
    trilhaSonora.play().catch(error => {
        console.error('Erro ao tentar tocar a música do jogo: ', error);
    });
}

function stopBackgroundMusic() {
    musicaInicio.pause();
    musicaInicio.currentTime = 0;
}

function checkCollisions() {
    mensagemLegenda = '';
    showGateMessage = false; // Inicialmente não mostra a mensagem do portão

    victims.forEach(victim => {
        if (!victim.isDead && playerX < victim.x + victim.width &&
            playerX + playerWidth > victim.x &&
            playerY < victim.y + victim.height &&
            playerY + playerHeight > victim.y) {
                mensagemLegenda = 'Aperte (E) para matar';
        }
    });

    // Verificar proximidade com o portão e a posição vertical do jogador
    if (playerY < mapHeight / 2 && // Verificar se o jogador está na metade superior do mapa
        playerX < gateX + gateWidth &&
        playerX + playerWidth > gateX &&
        playerY < gateY + gateHeight &&
        playerY + playerHeight > gateY) {
            showGateMessage = true;

            // Exibir mensagem se o jogador não tiver almas suficientes
            if (almas < 2) {
                mensagemLegenda = 'Você precisa de duas almas para prosseguir';
            }
    }
}


// Ajustando a função para interação com as vítimas (E)
function handleVictimInteraction() {
    let victimFound = false;
    victims.forEach(victim => {
        if (!victim.isDead &&
            playerX < victim.x + victim.width &&
            playerX + playerWidth > victim.x &&
            playerY < victim.y + victim.height &&
            playerY + playerHeight > victim.y) {
                
            // Marca a vítima como morta e aumenta a contagem de almas
            victim.isDead = true;
            almas++;
            mensagemLegenda = ''; // Limpa a mensagem de legenda

            // Toca o som de morte
            killSound.play();
            victimFound = true;
        }
    });

    if (!victimFound) {
        mensagemLegenda = 'Nenhuma vítima próxima para matar!';
    }
}

// Ajustando a função para interação com o portão (F)
function handleGateInteraction() {
    if (showGateMessage) {
        if (almas >= 2) {  // Verifica se o jogador tem almas suficientes
            if (currentLevel === 1) {
                // Trocar para o nível 2 e mudar o fundo
                changeBackgroundToNew();
                currentLevel = 2;

                // Limpar as vítimas do nível anterior e adicionar novas
                victims.length = 0;
                repositionVictims();

                // Remover o portão
                gateImage.src = '';

                alert('Parabéns! Você avançou para a fase 2!');
            }
        } else {
            mensagemLegenda = 'Você precisa de duas almas para abrir o portão.';
        }
    }
}

// Função para desenhar mensagens sobre o portão
function drawGateMessage() {
    if (showGateMessage) {
        ctx.font = '20px Bleeding_Cowboys';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Aperte (F) para abrir o portão', canvas.width / 2, canvas.height - 60);
    }
}

// Atualização na função checkCollisions para exibir mensagens corretas
function checkCollisions() {
    mensagemLegenda = '';
    showGateMessage = false;

    // Verificar se o jogador está próximo de alguma vítima
    victims.forEach(victim => {
        if (!victim.isDead &&
            playerX < victim.x + victim.width &&
            playerX + playerWidth > victim.x &&
            playerY < victim.y + victim.height &&
            playerY + playerHeight > victim.y) {
            mensagemLegenda = 'Aperte (E) para matar';
        }
    });

    // Verificar se o jogador está perto do portão
    if (playerX < gateX + gateWidth &&
        playerX + playerWidth > gateX &&
        playerY < gateY + gateHeight &&
        playerY + playerHeight > gateY) {
        showGateMessage = true;
    }
}

// Event listeners para interação
window.addEventListener('keydown', event => {
    keys[event.key] = true;
    if (event.key === 'r') showVictimsLevel2(); // Exibe vítimas ao apertar "r"
});

window.addEventListener('keyup', event => {
    keys[event.key] = false;
    if (event.key === 'e') handleVictimInteraction(); // Interação com vítimas
    if (event.key === 'f') handleGateInteraction(); // Interação com o portão
});


function repositionVictims() {
    if (currentLevel === 1) {
        // Repor vítimas do nível 1
        while (victims.length < 2) {
            const newVictim = {
                x: Math.random() * (mapWidth - 90),
                y: Math.random() * (mapHeight - 120),
                width: 90,
                height: 120,
                image: victimImage1,
                isDead: false,
                deadImage: victimDeadImage1
            };
            victims.push(newVictim);
        }
    } else if (currentLevel === 2) {
        // Limpa as vítimas do nível anteriores para otimizar e não impactar negativamente o desempenho do jogo por acumulação na array. PROF TH =)
        victims.length = 0;

        // Adiciona vítimas para o nível 2: Faltou adicionar o .PUSH para adicionar elas. 
        victims.push(
            { x: Math.random() * (mapWidth - 90), y: Math.random() * (mapHeight - 120), width: 90, height: 120, image: victimImage3, isDead: false, deadImage: victimDeadImage3 },
            { x: Math.random() * (mapWidth - 90), y: Math.random() * (mapHeight - 120), width: 90, height: 120, image: victimImage4, isDead: false, deadImage: victimDeadImage4 },
            { x: Math.random() * (mapWidth - 90), y: Math.random() * (mapHeight - 120), width: 90, height: 120, image: victimImage5, isDead: false, deadImage: victimDeadImage5 }
        );
    }
}


function handleGateInteraction() {
    if (showGateMessage) {
        if (almas >= 2) {
            if (currentLevel === 1) {
                // Trocar o fundo do jogo quando o portão for aberto
                changeBackgroundToNew();
                currentLevel = 2; // Avançar para o nível 2
                
                // Remover o portão e as vítimas mortas
                gateImage.src = ''; // Remove a imagem do portão
                
                victims.forEach(victim => {
                    // Remover as imagens das vítimas mortas e as vítimas do nível 1
                    victim.victimImage1 = null; // Remove a imagem de vitima1
                    victim.victimImage2 = null; // Remove a imagem de vitima2
                    victim.victimMorta1 = null; // Remove a imagem de vitimamorta1
                    victim.victimMorta2 = null; // Remove a imagem de vitimamorta2
                });

                // Adicionar novas vítimas para o nível 2
                victims.push(
                    { victimImage3: 'vitima2.png' },
                    { victimImage4: 'vitima2.png' },
                    { victimImage5: 'vitima2.png' }
                );
            }
            
            // Atualizar a posição da câmera para garantir que o jogador esteja visível
            updateCamera();
        } else {
            // Se o jogador não tem almas suficientes, exibe a mensagem
            alert('Você precisa de duas almas para prosseguir');
        }
    }
}


// Carregar a nova imagem de fundo
const newBackgroundImage = new Image();
newBackgroundImage.src = 'fundo2.png'; // Caminho da nova imagem de fundo

// Função para trocar o fundo do jogo
function changeBackgroundToNew() {
    backgroundImage.src = newBackgroundImage.src; // Trocar a imagem de fundo para o novo fundo
}

let currentLevel = 1; // Começa no nível 1

function handleGateInteraction() {
    if (showGateMessage) {
        if (almas >= 2) {
            if (currentLevel === 1) {
                // Trocar o fundo do jogo quando o portão for aberto
                changeBackgroundToNew();
                currentLevel = 2; // Avançar para o nível 2
                // Remover o portão e as vítimas mortas
                gateImage.src = ''; // Remove a imagem do portão
                victims.forEach(victim => {
                    victim.image = null; // Remove a imagem das vítimas
                    victim.deadImage = null; // Remove a imagem das vítimas mortas
                });
                repositionVictims(); // Reposicionar as vítimas com as novas
            }
            // Atualizar a posição da câmera para garantir que o jogador esteja visível
            updateCamera();
        } else {
            // Se o jogador não tem almas suficientes, exibe a mensagem
            alert('Você precisa de duas almas para prosseguir');
        }
    }
}

// Função para mostrar as vítimas do nível 2 quando "t" é pressionado
function showVictimsLevel2() {
    if (currentLevel === 2) {
        victims.length = 0; // Limpa qualquer vítima existente no array
        victims.push(
            { x: Math.random() * (mapWidth - 90), y: Math.random() * (mapHeight - 120), width: 90, height: 120, image: victimImage3, isDead: true, deadImage: victimDeadImage3 },
            { x: Math.random() * (mapWidth - 90), y: Math.random() * (mapHeight - 120), width: 90, height: 120, image: victimImage4, isDead: true, deadImage: victimDeadImage4 },
            { x: Math.random() * (mapWidth - 90), y: Math.random() * (mapHeight - 120), width: 90, height: 120, image: victimImage5, isDead: true, deadImage: victimDeadImage5 }
        );
    }
}

// Atualizar o event listener para incluir a tecla "r"
function keyDownHandler(event) {
    keys[event.key] = true;
    if (event.key === 'r') {
        showVictimsLevel2(); // Mostra as vítimas ao apertar "r" no nível 2
    }
}

function keyUpHandler(event) {
    keys[event.key] = false;
    if (event.key === 'e') {
        handleVictimInteraction();
    }
    if (event.key === 'f') {
        handleGateInteraction(); // Verifica se o jogador está interagindo com o portão
    }
}

// Event listeners
playButton.addEventListener('click', startGame);
newGameButton.addEventListener('click', newGame);
shopButton.addEventListener('click', openShop);
levelButtons.forEach(button => button.addEventListener('click', handleLevelSelection));
window.addEventListener('keydown', keyDownHandler);
window.addEventListener('keyup', keyUpHandler);
window.addEventListener('keydown', avancarHistoria);

// Event listeners para botões de toque (mobile controls)
document.getElementById('up').addEventListener('touchstart', () => keys['w'] = true);
document.getElementById('up').addEventListener('touchend', () => keys['w'] = false);

document.getElementById('down').addEventListener('touchstart', () => keys['s'] = true);
document.getElementById('down').addEventListener('touchend', () => keys['s'] = false);

document.getElementById('left').addEventListener('touchstart', () => keys['a'] = true);
document.getElementById('left').addEventListener('touchend', () => keys['a'] = false);

document.getElementById('right').addEventListener('touchstart', () => keys['d'] = true);
document.getElementById('right').addEventListener('touchend', () => keys['d'] = false);

document.getElementById('action-e').addEventListener('touchstart', handleVictimInteraction);
document.getElementById('action-f').addEventListener('touchstart', handleGateInteraction);


window.addEventListener('touchmove', event => {
    event.preventDefault();
}, { passive: false });
playButton.addEventListener('click', () => {
    startGame();
    gameLoop(); // Inicia o loop do jogo ao clicar em "Jogar"
});
