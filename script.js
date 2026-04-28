// ==========================================
// --- ESTADO DE PROGRESSÃO E INIMIGOS ---
// ==========================================
let currentStage = 0;
let gold = 0; 

const enemiesList = [
    { name: "Globin", hp: 45, maxHp: 45, color: "#27ae60", img: "globin.png" },
    { name: "Golem", hp: 90, maxHp: 90, color: "#e67e22", img: "golem.png" },
    { name: "Cavaleiro Sombrio", hp: 200, maxHp: 200, color: "#2c3e50", img: "cavaleiro.png" },
    { name: "Cientista", hp: 270, maxHp: 270, color: "#9b59b6", img: "cientista.png" },
    { name: "Dragão do Prazo Final", hp: 300, maxHp: 300, color: "#c0392b", img: "dragao.png" }
];

// Lista de sugestões temáticas
const habitSuggestions = [
    "Treinar 30min na Academia",
    "Estudar JavaScript por 1 Hora",
    "Beber 2L de Água",
    "Comer uma Fruta no Lanche",
    "Meditar por 10 Minutos",
    "Ler 5 Páginas de um Livro",
    "Organizar a Mesa de Trabalho",
    "Praticar Alongamento",
    "Revisar Matéria do ENEM",
    "Caminhada de 20 Minutos"
];

function toggleSuggestions() {
    const box = document.getElementById('suggestionBox');
    box.classList.toggle('hidden');
    
    // Limpa a box e adiciona as sugestões como botões
    box.innerHTML = ''; 
    habitSuggestions.forEach(sugestao => {
        const btn = document.createElement('button');
        btn.innerText = sugestao;
        btn.className = 'suggestion-item-btn';
        btn.onclick = () => {
            document.getElementById('habitInput').value = sugestao;
            box.classList.add('hidden'); // Fecha o menu após escolher
        };
        box.appendChild(btn);
    });
}

// --- CALENDÁRIO E HISTÓRICO ---
const weekDays = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
let currentDayIndex = 0;
let habitHistoryData = [0, 0, 0, 0, 0, 0, 0];
let habitChart;

// --- SISTEMA DE RESERVA DE ENERGIA ---
let energyBank = 0;
const AUTO_PULL_AMOUNT = 3; 
let inBattle = false;

// --- ESTADO DO JOGADOR E INIMIGO ---
let player = { 
    hp: 100, shield: 0, energy: 0, name: "Herói", 
    dmgBuff: 0, gender: "Masculino", burnTurns: 0, 
    tookDamageThisTurn: false, weaknessTurns: 0
};
let overloadedNextTurn = false;
let lastPlayedCard = null;

let enemy = { ...enemiesList[0], nextAction: null, bleedTurns: 0, stunned: false, enemyShield: 0, hasSummoned: false };

// --- SISTEMA DE LACAIO E ALVOS ---
let minion = null;
let currentTarget = "enemy"; 

let selectedIcon = "🏃";
let currentHand = [];
let drawPile = []; 
let pendingRewardCard = null;
let lastEnemyActionType = null; 

// --- SISTEMA DE PARRY ---
let skillCheckActive = false;
let skillCheckAngle = 0;
let targetZone = { start: 0, end: 0 };
let skillCheckAnim;

// --- SISTEMA DE MINIGAME (CIENTISTA) ---
let minigameTimer;
let minigameTimeLeft = 100;
let minigameAnswer = "";

// --- CARTAS ---
let availableRewards = [
    { name: "Foco", type: "energy", cost: 0, power: 2, img: "foco.png", colorClass: "card-raio" },
    { name: "Determinação", type: "retaliation", cost: 0, power: 20, img: "determinação.png", colorClass: "card-raio" },
    { name: "Reciclar Mão", type: "recycle", cost: 0, power: 0, img: "reciclar.png", colorClass: "card-defesa" },
    { name: "Tempo Parado", type: "time_stop", cost: 0, power: 0, img: "tempo.png", colorClass: "card-magia" },
    { name: "Boss Killer", type: "execute", cost: 2, power: 40, img: "bosskiller.png", colorClass: "card-espada" },
    { name: "Ataque Sombrio", type: "dark_atk", cost: 2, power: 50, selfDamage: 10, img: "ataquesombrio.png", colorClass: "card-ataque" },
    { name: "Lâmina Sombria", type: "atk", effect: "bleed", cost: 2, power: 20, img: "laminasombria.png", colorClass: "card-espada" },
    { name: "Veredito do Arcanjo", type: "magia", cost: 3, power: 60, img: "veredito.png", colorClass: "card-magia" },
    { name: "Preciso", type: "pierce", cost: 2, power: 15, img: "preciso.png", colorClass: "card-espada" },
    { name: "Bola de Fogo", type: "magia", cost: 2, power: 35, img: "boladefogo.png", colorClass: "card-magia" },
    { name: "Loop", type: "loop", cost: 0, power: 0, img: "loop.png", colorClass: "card-magia" },
    { name: "Sobrecarga", type: "sobrecarga", cost: 0, power: 0, img: "sobrecarga.png", colorClass: "card-raio" },
    { name: "Ataque Calculado", type: "ataque_calculado", cost: 1, power: 8, img: "ataquecalculado.png", colorClass: "card-ataque" }
];

const masterDeck = [
    { name: "Golpe", type: "atk", cost: 1, power: 15, img: "golpe.png", colorClass: "card-ataque" },
    { name: "Golpe", type: "atk", cost: 1, power: 15, img: "golpe.png", colorClass: "card-ataque" },
    { name: "Golpe", type: "atk", cost: 1, power: 15, img: "golpe.png", colorClass: "card-ataque" },
    { name: "Golpe", type: "atk", cost: 1, power: 15, img: "golpe.png", colorClass: "card-ataque" },
    { name: "Golpe", type: "atk", cost: 1, power: 15, img: "golpe.png", colorClass: "card-ataque" },
    { name: "Golpe", type: "atk", cost: 1, power: 15, img: "golpe.png", colorClass: "card-ataque" },
    { name: "Escudo", type: "def", cost: 1, power: 20, img: "escudo.png", colorClass: "card-defesa" },
    { name: "Escudo", type: "def", cost: 1, power: 20, img: "escudo.png", colorClass: "card-defesa" },
    { name: "Escudo", type: "def", cost: 1, power: 20, img: "escudo.png", colorClass: "card-defesa" },
    { name: "Escudo", type: "def", cost: 1, power: 20, img: "escudo.png", colorClass: "card-defesa" },
    { name: "Escudo", type: "def", cost: 1, power: 20, img: "escudo.png", colorClass: "card-defesa" },
    { name: "Escudo", type: "def", cost: 1, power: 20, img: "escudo.png", colorClass: "card-defesa" }
];

const DOM = {
    playerHp: null, playerHpText: null, enemyHp: null, enemyHpText: null,
    energyStat: null, energyBank: null, shieldPlayer: null, shieldEnemy: null,
    battleLog: null, playerHand: null, intentText: null, enemySprite: null,
    playerSprite: null, loginScreen: null, mainApp: null
};

document.addEventListener('DOMContentLoaded', () => {
    Object.keys(DOM).forEach(key => {
        const id = key.replace(/[A-Z]/g, m => m.toLowerCase() === 'hp' ? 'Hp' : m);
        DOM[key] = document.getElementById(key === 'energyBank' ? 'energyBankDisplay' : key === 'shieldPlayer' ? 'shieldDisplay' : key === 'shieldEnemy' ? 'shieldDisplayEnemy' : key);
    });
    setupEmojiSelection(); 
    initChart();
    document.addEventListener('mousedown', handleParryClick);
});

// --- LÓGICA DA LOJA ---
function buyItem(type, cost) {
    if (gold >= cost) {
        gold -= cost;
        if (type === 'hp') {
            player.hp = Math.min(100, player.hp + 50);
            log("❤️ Você bebeu uma poção! +50 HP.");
        } else if (type === 'energy') {
            energyBank += 3;
            log("⚡ Energia reserva expandida! +3⚡.");
        }
        updateUI();
    } else {
        log("❌ Moedas insuficientes!");
    }
}

function login() {
    console.log("Botão clicado!"); // Isso vai aparecer no F12 se o botão estiver funcionando

    const email = document.getElementById('userEmail').value.trim();
    const name = document.getElementById('userName').value.trim();
    const pass = document.getElementById('userPass').value.trim();
    const gender = document.getElementById('userGender').value;

    if (email.toLowerCase().endsWith("@gmail.com") && pass && name && gender) {
        
        // Verificação de segurança: se o objeto player não existir, nós criamos agora
        if (typeof player === 'undefined') {
            player = { hp: 100, energy: 0, shield: 0 };
        }

        player.name = name;
        player.gender = gender;

        // Atualiza os textos e imagens
        document.getElementById('playerNameDisplay').innerText = name; 
        document.getElementById('playerSprite').src = (gender === "Feminino") ? "heroi_mulher.png" : "heroi_homem.png";
        
        // Só tenta mudar o inimigo se o objeto enemy existir
        if (typeof enemy !== 'undefined') {
            document.getElementById('enemySprite').src = enemy.img;
        }

        // Muda a tela
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');

        // Verifica se a função updateUI existe antes de chamar
        if (typeof updateUI === 'function') {
            updateUI();
        }
        
    } else {
        alert("Preencha todos os campos corretamente! O e-mail deve ser @gmail.com");
    }
}

function addBetaEnergy() {
    energyBank += 100;
    log("MODO BETA: +100⚡ adicionados!");
    updateUI();
}

function startBattle() {
    if (inBattle) return; 
    inBattle = true;
    overloadedNextTurn = false;
    lastPlayedCard = null;
    log("A batalha começou!");
    const btnStart = document.getElementById('btnStartBattle');
    if(btnStart) btnStart.classList.add('hidden');
    shuffleDeck();
    drawHand(); 
    prepareEnemyAction();
    if (player.energy === 0) refillEnergyFromBank();
    updateUI();
}

function refillEnergyFromBank() {
    player.energy = 0; 
    let pullLimit = overloadedNextTurn ? 2 : AUTO_PULL_AMOUNT;
    let amountToTake = Math.min(energyBank, pullLimit);
    energyBank -= amountToTake;
    player.energy = amountToTake; 
    
    if (overloadedNextTurn) {
        log(`Sobrecarga! Energia limitada a ${amountToTake}⚡ neste turno.`);
        overloadedNextTurn = false;
    } else if (amountToTake > 0) {
        log(`Energia carregada: +${amountToTake}⚡.`);
    } else {
        log(`Reserva vazia! Complete hábitos.`);
    }
    updateUI();
}

function completeHabit(btn, pts) {
    energyBank += parseInt(pts); 
    
    showEnergyGain(pts); 

    habitHistoryData[currentDayIndex]++;
    const li = btn.parentElement;
    btn.remove(); 
    li.style.opacity = "0.6";
    document.getElementById('doneHabitList').appendChild(li);
    log(`Hábito concluído! +${pts}⚡.`);
    updateUI();
}

// --- SISTEMA DE PARRY E MINIGAMES ---
function startSkillCheck() {
    skillCheckActive = true;
    skillCheckAngle = 0;
    let start = 180 + Math.random() * 80;
    targetZone = { start: start, end: start + 45 };
    document.getElementById('parryOverlay').classList.remove('hidden');
    animateSkillCheck();
}

function animateSkillCheck() {
    if (!skillCheckActive) return;
    skillCheckAngle += 5;
    const needle = document.getElementById('skillNeedle');
    const zone = document.getElementById('skillZone');
    if(needle) needle.style.transform = `rotate(${skillCheckAngle}deg)`;
    if(zone) zone.style.transform = `rotate(${targetZone.start}deg)`;
    if (skillCheckAngle > 360) failParry();
    else skillCheckAnim = requestAnimationFrame(animateSkillCheck);
}

function handleParryClick(e) {
    if (!skillCheckActive || e.target.id === 'minigameInput') return;
    if (skillCheckAngle >= targetZone.start && skillCheckAngle <= targetZone.end) successParry();
    else failParry();
}

function successParry() {
    skillCheckActive = false;
    cancelAnimationFrame(skillCheckAnim);
    document.getElementById('parryOverlay').classList.add('hidden');
    let intendedDmg = enemy.nextAction.val;
    let finalDmg = Math.floor(intendedDmg / 2);
    applyDamageToPlayer(finalDmg); 
    log(`✨ PARRY SUCESSO! Dano reduzido para ${finalDmg}.`);
    executeMinionActionAndFinish(); 
}

function failParry() {
    skillCheckActive = false;
    cancelAnimationFrame(skillCheckAnim);
    document.getElementById('parryOverlay').classList.add('hidden');
    let intendedDmg = enemy.nextAction.val;
    applyDamageToPlayer(intendedDmg);
    log(`❌ FALHA NO PARRY! Recebeu ${intendedDmg} de dano.`);
    executeMinionActionAndFinish();
}

function applyDamageToPlayer(dmg) {
    let finalDmg = Math.max(0, dmg - player.shield);
    if (finalDmg > 0) {
        player.hp -= finalDmg;
        player.tookDamageThisTurn = true; 
        shakeElement(document.getElementById('playerSprite'));
    }
}

function startMinigame(type) {
    const overlay = document.getElementById('minigameOverlay');
    const input = document.getElementById('minigameInput');
    const prompt = document.getElementById('minigamePrompt');
    const title = document.getElementById('minigameTitle');
    
    overlay.classList.remove('hidden');
    input.value = "";
    input.focus();
    minigameTimeLeft = 100;

    // Bloqueia o colar (Paste)
    input.onpaste = (e) => {
        e.preventDefault();
        log("🚫 Sem trapaças! O Cientista exige digitação manual.");
        return false;
    };

    // Bloqueia o arrastar e soltar texto (Drop)
    input.ondrop = (e) => {
        e.preventDefault();
        return false;
    };

    // Bloqueia o menu de contexto (botão direito do mouse) para evitar o "Colar" por lá
    input.oncontextmenu = (e) => {
        e.preventDefault();
        return false;
    };

    if (type === "math") {
        let a = Math.floor(Math.random() * 15) + 5;
        let b = Math.floor(Math.random() * 15) + 5;
        title.innerText = "Cálculo Rápido!";
        prompt.innerText = `Quanto é ${a} + ${b}?`;
        minigameAnswer = (a + b).toString();
    } else if (type === "typing") {
        const frases = ["Cada segundo é fundamental para a sobrevivência", "Erros sucessivos quebram sua concentração", "O inimigo avança enquanto você falha", "Três tigres tristes lutam no tempo", "Dominar o tempo exige foco absoluto"];
        let frase = frases[Math.floor(Math.random() * frases.length)];
        title.innerText = "Transcrição Genética!";
        prompt.innerText = frase;
        minigameAnswer = frase;
    }

    // Define a verificação da resposta
    input.oninput = () => {
        if (input.value.toLowerCase().trim() === minigameAnswer.toLowerCase()) {
            winMinigame();
        }
    };

    // O CRONÔMETRO PRECISA FICAR AQUI DENTRO!
    clearInterval(minigameTimer);
    minigameTimer = setInterval(() => {
        // Ajustei a velocidade para o modo escrita ser um desafio justo
        minigameTimeLeft -= (type === "math" ? 1 : 0.42);
        
        const timerBar = document.getElementById('minigameTimerBar');
        if (timerBar) {
            timerBar.style.width = minigameTimeLeft + "%";
        }

        if (minigameTimeLeft <= 0) {
            loseMinigame();
        }
    }, 50);
} // Esta é a única chave que deve fechar a função principal

function winMinigame() {
    clearInterval(minigameTimer);
    document.getElementById('minigameOverlay').classList.add('hidden');

    let mitigatedDmg = Math.floor(enemy.nextAction.val / 2);
    applyDamageToPlayer(mitigatedDmg);

    // 100% de certeza: define 2 turnos de fraqueza
    player.weaknessTurns = 2; 

    log(`🔬 Você conteve a explosão, mas o gás tóxico te deixou FRACO!`);
    executeMinionActionAndFinish();
}

function loseMinigame() {
    clearInterval(minigameTimer);
    document.getElementById('minigameOverlay').classList.add('hidden');
    
    applyDamageToPlayer(50);

    // 100% de certeza: define 2 turnos de fraqueza
    player.weaknessTurns = 2; 

    log("💥 ERRO CIENTÍFICO! Você sofreu dano crítico e está FRACO!");
    executeMinionActionAndFinish();
}

// --- COMBATE ---
function shuffleDeck() {
    drawPile = masterDeck.map(card => ({ ...card, id: Math.random().toString(36).substr(2, 9) }));
    for (let i = drawPile.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [drawPile[i], drawPile[j]] = [drawPile[j], drawPile[i]];
    }
}

function drawHand() {
    // Cartas iniciais que PODEM repetir na mão
    const basicCards = ["Golpe", "Escudo"];

    while (currentHand.length < 6) {
        if (drawPile.length === 0) shuffleDeck();
        
        // Olhamos a primeira carta do baralho sem tirar ela ainda
        const nextCard = drawPile[0]; 

        // Verificamos se já existe uma carta com esse mesmo nome na mão
        const alreadyInHand = currentHand.some(c => c.name === nextCard.name);

        // Se for uma carta especial (Loot) e já estiver na mão, mandamos para o fim da fila
        if (!basicCards.includes(nextCard.name) && alreadyInHand) {
            // Move a carta para o final do deck para tentar pegar outra
            drawPile.push(drawPile.shift()); 
            
            // Proteção: se o deck inteiro for de cartas repetidas, paramos para não travar o loop
            const allRepeated = drawPile.every(c => currentHand.some(h => h.name === c.name));
            if (allRepeated) break;
            
            continue; 
        }

        // Se passar nas regras, puxa a carta para a mão
        currentHand.push(drawPile.shift());
    }
}


function setTarget(target) {
    if (!minion && target === 'minion') return;
    currentTarget = target;
    updateUI();
    log(`🎯 Mirando no ${target === 'enemy' ? enemy.name : minion.name}!`);
}
function playCard(index) {
    if (!inBattle || skillCheckActive || !document.getElementById('minigameOverlay').classList.contains('hidden')) return;
    const cardIndex = index;
    const card = currentHand[cardIndex];

    if (!card) return;

    if (player.energy >= card.cost) {
        player.energy -= card.cost;
        let finalPower = (card.power || 0) + player.dmgBuff;
        let targetEnt = (currentTarget === 'minion' && minion && minion.hp > 0) ? minion : enemy;

        switch(card.type) {
            case "retaliation":
                let baseDmg = player.tookDamageThisTurn ? (card.power * 2) : card.power;
                let totalRetalDmg = calculatePlayerDamage(baseDmg); // <-- MUDOU AQUI
                let hpDmg = Math.max(0, totalRetalDmg - (targetEnt.enemyShield || 0));
                targetEnt.enemyShield = Math.max(0, (targetEnt.enemyShield || 0) - totalRetalDmg);
                targetEnt.hp -= hpDmg;
                shakeElement(document.getElementById('enemySprite'));
                log(`Determinação! Causou ${totalRetalDmg} de dano${player.tookDamageThisTurn ? " (RETALIAÇÃO!)" : ""}.`);
                player.dmgBuff = 0;
                break;

                return totalDmg;
                let hpDmg = Math.max(0, totalRetalDmg - (targetEnt.enemyShield || 0));
                targetEnt.enemyShield = Math.max(0, (targetEnt.enemyShield || 0) - totalRetalDmg);
                targetEnt.hp -= hpDmg;
                shakeElement(document.getElementById('enemySprite'));
                log(`Determinação! Causou ${totalRetalDmg} de dano${player.tookDamageThisTurn ? " (RETALIAÇÃO!)" : ""}.`);
                player.dmgBuff = 0;
                break;

            case "atk": 
            case "pierce": 
            case "magia":
                let finalPower = calculatePlayerDamage(card.power || 0); // <-- MUDOU AQUI
                let damageToHp = Math.max(0, finalPower - (targetEnt.enemyShield || 0));
                targetEnt.enemyShield = Math.max(0, (targetEnt.enemyShield || 0) - finalPower);
                targetEnt.hp -= damageToHp;
                shakeElement(document.getElementById('enemySprite'));
                log(`Usou ${card.name} em ${targetEnt.name}! Causou ${finalPower} de impacto.`);
                if (card.effect === "bleed") { targetEnt.bleedTurns = 3; log("Sangramento!"); }
                player.dmgBuff = 0;
                break;

            case "def": 
                player.shield += card.power; 
                log(`Defesa +${card.power}`);
                break;

            case "buff":
                player.dmgBuff += card.power;
                log(`Concentração! Próximo ataque terá +${card.power} de dano.`);
                break;

            case "heal": 
                player.hp = Math.min(100, player.hp + card.power); 
                log(`Curou ${card.power} HP`);
                break;

            case "energy": 
                player.energy += card.power; 
                log(`Foco! +${card.power}⚡.`);
                for(let i=0; i<2; i++) {
                    if (drawPile.length === 0) shuffleDeck();
                    currentHand.push(drawPile.shift());
                }
                break;

            case "recycle":
                currentHand = []; drawHand();
                log("Mão reciclada!");
                break;

            case "time_stop":
                enemy.stunned = true; 
                if(minion) minion.stunned = true;
                player.energy += 1;
                log("O tempo parou!");
                break;

            case "execute":
                let damageDealt = calculatePlayerDamage(card.power); // <-- MUDOU AQUI
                targetEnt.hp -= damageDealt;
                log(`Boss Killer causou ${damageDealt} de dano!`);
                if (targetEnt.hp > 0 && targetEnt.hp < 60) {
                    targetEnt.hp = 0;
                    log(`🎯 LIMIAR ATINGIDO! O inimigo tinha menos de 60 HP e foi executado!`);
                } else if (targetEnt.hp <= 0) {
                    log(`O golpe foi fatal!`);
                } else {
                    log(`O alvo resistiu à execução.`);
                }
                player.dmgBuff = 0; 
                shakeElement(document.getElementById('enemySprite'));
                break;

            case "dark_atk":
                let darkDmg = calculatePlayerDamage(card.power); // <-- MUDOU AQUI
                targetEnt.hp -= darkDmg;
                applyDamageToPlayer(card.selfDamage);
                log(`Ataque Sombrio no ${targetEnt.name}!`);
                player.dmgBuff = 0;
                break;

            case "loop":
                if (lastPlayedCard) {
                    let copiedCard = { ...lastPlayedCard, id: Math.random().toString(36).substr(2, 9) };
                    currentHand.push(copiedCard);
                    log(`Loop! Retornou ${copiedCard.name} para a sua mão.`);
                } else {
                    log("Loop falhou: Nenhuma carta foi jogada ainda.");
                }
                break;

            case "sobrecarga":
                player.energy += 3;
                overloadedNextTurn = true;
                log("Sobrecarga! +3⚡ agora. Mas você terá limite de energia no próximo turno.");
                break;

            case "ataque_calculado":
                let cardsInHand = currentHand.length - 1; 
                let baseCalcDamage = card.power + (card.power * cardsInHand);
                let calcDamage = calculatePlayerDamage(baseCalcDamage); // <-- MUDOU AQUI
                let hpDamageCalc = Math.max(0, calcDamage - (targetEnt.enemyShield || 0));
                targetEnt.enemyShield = Math.max(0, (targetEnt.enemyShield || 0) - calcDamage);
                targetEnt.hp -= hpDamageCalc;
                shakeElement(document.getElementById('enemySprite'));
                log(`Ataque Calculado (${cardsInHand} cartas)! Causou ${calcDamage} de dano em ${targetEnt.name}.`);
                player.dmgBuff = 0;
                break;
        }

        if (card.type !== "loop") {
            lastPlayedCard = card;
        }

        currentHand.splice(cardIndex, 1);
        updateUI();
        
        if (minion && minion.hp <= 0) {
            log("O Cavaleiro Sombrio foi destruído!");
            minion = null;
            currentTarget = "enemy";
            updateUI();
        }
        checkGameOver();
    } else {
        log("Sem energia!");
    }
}

function endTurn() {
    if (!inBattle || skillCheckActive || !document.getElementById('minigameOverlay').classList.contains('hidden')) return; 
    
    // 1. Limpeza de escudos e aplicação de status negativos (Sangramento/Queimadura)
    enemy.enemyShield = 0;
    if (minion) minion.enemyShield = 0;
    if (enemy.bleedTurns > 0) { enemy.hp -= 10; enemy.bleedTurns--; }
    if (minion && minion.bleedTurns > 0) { minion.hp -= 10; minion.bleedTurns--; }
    if (player.burnTurns > 0) { player.hp -= 8; player.burnTurns--; }
    updateUI();
    // <-- ADICIONADO: Reduz o contador de fraqueza
    if (player.weaknessTurns > 0) { player.weaknessTurns--; } 
    // ...

    // 2. Inicia o processamento do Boss
    setTimeout(() => {
        if (enemy.hp <= 0) { checkGameOver(); return; }
        
        // A) Regra do Dragão (Convocar)
        if (enemy.nextAction.type === "summon_knight") {
            enemy.hasSummoned = true;
            log(`🐉 O Dragão convocou o Cavaleiro Sombrio!`);
            minion = { name: "Lacaio Cavaleiro", hp: 170, maxHp: 170, img: "cavaleiro.png", nextAction: null, bleedTurns: 0, stunned: false, enemyShield: 0 };
            prepareMinionAction();
            updateUI();
            executeMinionActionAndFinish();
            return;
        }

        // B) Minigame: Cavaleiro (Ataque Pesado)
        if (enemy.name.includes("Cavaleiro") && enemy.nextAction.type === "dmg_heavy") {
            log("⚠️ DEFESA DE IMPACTO!");
            startSkillCheck();
            return; 
        } 

        // C) Minigame: Cientista
        if (enemy.name.includes("Cientista") && (enemy.nextAction.type.startsWith("sci_") || enemy.nextAction.type === "dmg")) {
            log("🔬 REAÇÃO QUÍMICA!");
            startMinigame(enemy.nextAction.type === "sci_math" ? "math" : "typing");
            return;
        }

        // D) Ações comuns e Dreno (Só executa se não estiver atordoado)
        if (!enemy.stunned) {
            switch(enemy.nextAction.type) {
                case "dmg":
                    applyDamageToPlayer(enemy.nextAction.val);
                    log(`${enemy.name} atacou!`);
                    break;
                case "shield":
                    enemy.enemyShield += enemy.nextAction.val;
                    log(`${enemy.name} defendeu!`);
                    break;
            case "knight_drain":
                if (player.shield > 0) {
                // 🛡️ ROUBA APENAS ESCUDO
                let stolenShield = player.shield;

                enemy.enemyShield += stolenShield;
                player.shield = 0;

                log(`🛡️ O Cavaleiro drenou ${stolenShield} de escudo!`);
                } else {
                // ❤️ SEM ESCUDO → CAUSA DANO NA VIDA
                applyDamageToPlayer(enemy.nextAction.val);
                log(`🍷 DRENO! ${enemy.name} drenou sua vida!`);
                }

                // Cura sempre acontece
                enemy.hp = Math.min(enemy.maxHp, enemy.hp + 20); 
                log(`+20 HP para o Cavaleiro.`);

            updateUI(); 
            break;
                case "dragon_fire":
                    applyDamageToPlayer(enemy.nextAction.val);
                    enemy.enemyShield += 30;
                    log(`${enemy.name} soprou fogo!`);
                    break;
                case "dragon_rest":
                    enemy.hp = Math.min(enemy.maxHp, enemy.hp + 50);
                    log(`${enemy.name} descansou.`);
                    updateUI();
                    break;
            }
        }
        
        // 3. Finaliza a ação do Boss e passa para o Lacaio/Fim do turno
        executeMinionActionAndFinish();
        
    }, 600);
}

function executeMinionActionAndFinish() {
    if (minion && minion.hp > 0 && !minion.stunned) {
        setTimeout(() => {
            switch(minion.nextAction.type) {
                case "dmg":
                    applyDamageToPlayer(minion.nextAction.val);
                    log(`${minion.name} atacou!`);
                    break;
                case "shield_boss":
                    enemy.enemyShield += minion.nextAction.val;
                    log(`${minion.name} protegeu o Dragão!`);
                    break;
            }
            finishEnemyTurn();
        }, 500);
    } else {
        finishEnemyTurn();
    }
}

function finishEnemyTurn() {
    enemy.stunned = false;
    if(minion) minion.stunned = false;
    player.shield = 0; 
    player.tookDamageThisTurn = false;
    currentHand = [];
    refillEnergyFromBank(); 
    drawHand();
    prepareEnemyAction();
    updateUI();
    checkGameOver();
}
function getCardDescription(card) {
    switch(card.type) {
        case "atk": 
        case "pierce": return `Causa ${card.power} de dano ao inimigo.`;
        case "def": return `Ganha ${card.power} de escudo.`;
        case "magia": return `Dano Mágico: ${card.power}.`;
        case "energy": return `Ganha ${card.power} de energia e compra 2 cartas.`;
        case "execute": return `Dano: ${card.power}. Executa instantaneamente se o HP for menor que 60.`;
        case "dark_atk": return `Causa ${card.power} de dano, mas você sofre dano de volta.`;
        case "retaliation": return `Dano: ${card.power}. O dano é DOBRADO se você sofreu dano neste turno.`;
        case "time_stop": return `Atordoa os inimigos por 1 turno e ganha +1⚡.`;
        case "loop": return `Retorna a última carta jogada para a sua mão.`;
        case "sobrecarga": return `Ganha +3⚡ agora, mas limita a energia no próximo turno.`;
        case "ataque_calculado": return `Dano base: ${card.power}. Aumenta com base nas cartas na sua mão.`;
        case "recycle": return `Descarta sua mão atual e compra cartas novas.`;
        default: return `Um efeito misterioso...`;
    }
}
// --- INTERFACE ---
function updateUI() {
    // =========================
    // --- REFERÊNCIAS BASE ---
    // =========================
    const handDiv = document.getElementById('playerHand');
    const enemyName = document.getElementById('enemyNameDisplay');
    const intentText = document.getElementById('intentText');

    const activeEnemy = (currentTarget === 'minion' && minion) ? minion : enemy;

    // =========================
    // --- INIMIGO ---
    // =========================
    if (enemyName) enemyName.innerText = activeEnemy.name;

    if (DOM.enemySprite) DOM.enemySprite.src = activeEnemy.img || "dragao.png";

    if (DOM.enemyHp) {
        const hpPct = (activeEnemy.hp / activeEnemy.maxHp) * 100;
        DOM.enemyHp.style.width = Math.max(0, hpPct) + "%";
    }

    if (DOM.enemyHpText) {
        DOM.enemyHpText.innerText = `${Math.max(0, Math.floor(activeEnemy.hp))} / ${activeEnemy.maxHp}`;
    }

    if (DOM.shieldEnemy) {
        DOM.shieldEnemy.innerText = `🛡️ ${activeEnemy.enemyShield || 0}`;
    }

    // =========================
    // --- PLAYER ---
    // =========================
    if (DOM.playerHp) DOM.playerHp.style.width = Math.max(0, player.hp) + "%";
    if (DOM.playerHpText) DOM.playerHpText.innerText = `${Math.max(0, Math.floor(player.hp))} / 100`;
    if (DOM.energyStat) DOM.energyStat.innerText = player.energy;
    if (DOM.shieldPlayer) DOM.shieldPlayer.innerText = `🛡️ ${player.shield}`;
    if (DOM.energyBank) DOM.energyBank.innerText = `Reserva: ${energyBank}⚡`;
    if (player.weaknessTurns > 0) { 
    player.weaknessTurns--; 
}

    // =========================
    // --- OURO ---
    // =========================
    const goldUI = document.getElementById('goldValue');
    const goldBtn = document.getElementById('btnGoldDisplay');

    if (goldUI) goldUI.innerText = gold;
    if (goldBtn) goldBtn.innerText = gold;

    // =========================
    // --- INTENÇÃO DO INIMIGO ---
    // =========================
    let combinedIntent = enemy.nextAction
        ? `Boss: ${enemy.nextAction.text}`
        : "Aguardando...";

    if (minion && minion.hp > 0 && minion.nextAction) {
        combinedIntent += ` | Lacaio: ${minion.nextAction.text}`;
    }

    if (intentText) intentText.innerText = combinedIntent;

    // =========================
    // --- SELETOR DE ALVO ---
    // =========================
    let targetUI = document.getElementById('targetSelectorContainer');

    if (minion && minion.hp > 0) {
        if (!targetUI) {
            targetUI = document.createElement('div');
            targetUI.id = 'targetSelectorContainer';
            targetUI.style.margin = '10px auto';

            handDiv.parentNode.insertBefore(targetUI, handDiv);
        }

        targetUI.style.display = 'block';

        targetUI.innerHTML = `
            <div style="display:flex; gap:15px; align-items:center; justify-content:center; background:#222; padding:8px 15px; border-radius:8px; border:1px solid #444;">
                <button onclick="setTarget('enemy')" 
                    style="background:${currentTarget === 'enemy' ? '#c0392b' : '#333'}; color:white; padding:8px 12px; border:none; border-radius:5px; cursor:pointer;">
                    🎯 Boss
                </button>

                <div style="text-align:center;">
                    <strong style="color:white;">${minion.name}</strong><br>
                    <small style="color:#ff7675;">HP: ${Math.max(0, Math.floor(minion.hp))} / ${minion.maxHp}</small>
                </div>

                <button onclick="setTarget('minion')" 
                    style="background:${currentTarget === 'minion' ? '#2c3e50' : '#333'}; color:white; padding:8px 12px; border:none; border-radius:5px; cursor:pointer;">
                    🎯 Lacaio
                </button>
            </div>
        `;
    } else if (targetUI) {
        targetUI.style.display = 'none';
    }

    // =========================
    // --- CARTAS NA MÃO ---
    // =========================
    if (handDiv) {
        handDiv.innerHTML = '';

currentHand.forEach((card, index) => {
    const cardEl = document.createElement('div');
    cardEl.className = `card ${card.colorClass}`;

    // 🔥 VERIFICA ENERGIA
    if (player.energy < card.cost) {
        cardEl.classList.add('disabled');
    } else {
        cardEl.onclick = () => playCard(index);
    }

            cardEl.innerHTML = `
    <div class="card-cost">${card.cost}</div>
    <img src="${card.img}" alt="${card.name}">
    
    <div class="card-name">${card.name}</div>

    <!-- 🔥 TOOLTIP -->
    <div class="card-tooltip">
        <b>${card.name}</b><br>
        ${getCardDescription(card)}
    </div>
`;

            handDiv.appendChild(cardEl);
        });
    }
}
   // Substitua o loop currentHand.forEach inteiro dentro de updateUI() por este:
// === FUNÇÃO PARA ADICIONAR HÁBITOS ===



// Essa função serve para preparar os cliques nos emojis do menu
function setupEmojiSelection() {
    const emojis = document.querySelectorAll('.emoji-item');
    emojis.forEach(emoji => {
        emoji.onclick = () => {
            // Remove a seleção dos outros e coloca neste
            emojis.forEach(e => e.classList.remove('selected'));
            emoji.classList.add('selected');
            // Atualiza a variável global que o addHabit usa
            selectedIcon = emoji.dataset.icon;
        };
    });
}

function prepareEnemyAction() {
    let actions;
    if (enemy.name.includes("Dragão")) {
        if (!enemy.hasSummoned) {
            enemy.nextAction = { text: "Convocar Lacaio 📯", type: "summon_knight", val: 0 };
            return;
        }
        actions = [
            { text: "Sopro 🔥 (30+🛡️30)", type: "dragon_fire", val: 30 },
            { text: "Descanso (+50 HP)", type: "dragon_rest", val: 50 },
            { text: "Mordida (45 dano)", type: "dmg", val: 45 }
        ];
    } else if (enemy.name.includes("Cientista")) {
        // Removido: Campo de Força (shield)
        actions = [
            { text: "Cálculo Letal 📐 (60 dano)", type: "sci_math", val: 60 },
            { text: "Hipótese Escrita 📝 (70 dano)", type: "sci_type", val: 70 },
            { text: "Lança-Chamas (40 dano)", type: "dmg", val: 50 }
        ];
    } else if (enemy.name.includes("Cavaleiro")) {
        // Removido: Muralha (shield)
        actions = [
            { text: "Dreno (25 + Cura 25)", type: "knight_drain", val: 35 },
            { text: "Esmagar 30 de dano(PARRY!)", type: "dmg_heavy", val: 30 }
        ];
    } else {
        actions = [
            { text: "Ataque (30 dano)", type: "dmg", val: 30 },
            { text: "Barreira (25🛡️)", type: "shield", val: 25 }
        ];
    }
    enemy.nextAction = actions[Math.floor(Math.random() * actions.length)];
    prepareMinionAction();
    updateUI();
}

function prepareMinionAction() {
    if (!minion) return;
    let mActions = [
        { text: "Ataque (15 dano)", type: "dmg", val: 15 },
        { text: "Proteção (15🛡️ Boss)", type: "shield_boss", val: 15 }
    ];
    minion.nextAction = mActions[Math.floor(Math.random() * mActions.length)];
}

function checkGameOver() {
    if (enemy.hp <= 0) {
        inBattle = false;
        const reward = Math.floor(Math.random() * 11) + 15; 
        gold += reward;
        log(`Vitória! Você coletou 💰 ${reward} moedas.`);
        
        minion = null;
        currentTarget = "enemy";
        currentHand = [];
        overloadedNextTurn = false;
        lastPlayedCard = null;
        updateUI();
        showRewardChoice();
    } else if (player.hp <= 0) {
        alert("GAME OVER!"); location.reload();
    }
}
function showRewardChoice() {
    if (availableRewards.length < 2) {
        nextStageSetup();
        return;
    }

    let idx1 = Math.floor(Math.random() * availableRewards.length);
    let idx2;
    do { idx2 = Math.floor(Math.random() * availableRewards.length); } while (idx1 === idx2);

    const card1 = availableRewards[idx1];
    const card2 = availableRewards[idx2];

    const screen = document.getElementById('rewardScreen');
    const container = document.getElementById('rewardCardDisplay');

    screen.classList.remove('hidden');

    container.innerHTML = `
        <h3 style="color: white; margin-bottom: 20px;">Escolha sua Recompensa:</h3>

        <div style="display: flex; gap: 30px; justify-content: center; align-items: center;">

            <div onclick="claimSpecificReward(${idx1})" style="cursor:pointer; text-align:center;">
                <div class="card ${card1.colorClass}">
                    <div class="card-cost">${card1.cost}</div>
                    <img src="${card1.img}">

                    <!-- TOOLTIP -->
                    <div class="card-tooltip">
                        <b>${card1.name}</b><br>
                        ${getCardDescription(card1)}
                    </div>
                </div>
                <p style="color:white; font-weight:bold; margin-top:10px;">${card1.name}</p>
            </div>

            <div onclick="claimSpecificReward(${idx2})" style="cursor:pointer; text-align:center;">
                <div class="card ${card2.colorClass}">
                    <div class="card-cost">${card2.cost}</div>
                    <img src="${card2.img}">

                    <!-- TOOLTIP -->
                    <div class="card-tooltip">
                        <b>${card2.name}</b><br>
                        ${getCardDescription(card2)}
                    </div>
                </div>
                <p style="color:white; font-weight:bold; margin-top:10px;">${card2.name}</p>
            </div>

        </div>
    `;
}

function claimSpecificReward(index) {
    const selected = availableRewards.splice(index, 1)[0];
    masterDeck.push(selected);
    log(`Você aprendeu: ${selected.name}!`);
    document.getElementById('rewardScreen').classList.add('hidden');
    currentStage++;
    if (currentStage >= enemiesList.length) {
        alert("JORNADA CONCLUÍDA!"); location.reload();
    } else {
        nextStageSetup();
    }
}

function nextStageSetup() {
    player.energy = 3;
    player.shield = 0;
    player.burnTurns = 0;
    player.tookDamageThisTurn = false; 
    overloadedNextTurn = false;
    lastPlayedCard = null;
    minion = null;
    currentTarget = "enemy";
    enemy = { ...enemiesList[currentStage], nextAction: null, bleedTurns: 0, stunned: false, enemyShield: 0, hasSummoned: false };
    const btnStart = document.getElementById('btnStartBattle');
    if(btnStart) btnStart.classList.remove('hidden');
    updateUI();
}

// --- UTILITÁRIOS ---
function log(msg) { if(DOM.battleLog) DOM.battleLog.innerText = msg; }
function shakeElement(el) {
    if(!el) return;
    el.classList.add('shake-anim');
    setTimeout(() => el.classList.remove('shake-anim'), 300);
}

function setupEmojiSelection() {
    const emojis = document.querySelectorAll('.emoji-item');
    emojis.forEach(emoji => {
        emoji.onclick = () => {
            emojis.forEach(e => e.classList.remove('selected'));
            emoji.classList.add('selected');
            selectedIcon = emoji.dataset.icon || emoji.textContent;
        };
    });
}

function initChart() {
    const canvas = document.getElementById('habitChart');
    if(!canvas) return;
    habitChart = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: weekDays,
            datasets: [{ label: 'Hábitos', data: habitHistoryData, backgroundColor: '#3498db' }]
        },
        options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
}

function updateChart() { if(habitChart) { habitChart.data.datasets[0].data = habitHistoryData; habitChart.update(); } }
function nextDay() {
    currentDayIndex = (currentDayIndex + 1) % 7;
    document.getElementById('currentDayDisplay').innerText = `📅 ${weekDays[currentDayIndex]}`;
    document.getElementById('doneHabitList').innerHTML = "";
    updateChart();
}

function switchTab(tabName) {
    document.getElementById('tab-pending').classList.toggle('hidden', tabName !== 'pending');
    document.getElementById('tab-history').classList.toggle('hidden', tabName !== 'history');
    if(tabName === 'history') updateChart();
}

function toggleHabitMenu() { document.getElementById('habitMenu').classList.toggle('hidden'); }

// --- ADICIONADO: FUNÇÃO DE ADICIONAR HÁBITO FINALIZADA ---


// Array global para guardar os hábitos ativos
let meusHabitos = [];

// Função robusta para adicionar hábitos (Corrige o bug de adicionar)
function renderHabitsForToday() {
    const listDOM = document.getElementById('habitList');
    if (!listDOM) return;

    listDOM.innerHTML = '';

    const hoje = new Date().getDay(); // 0=Dom, 1=Seg...

    meusHabitos.forEach(h => {
        const mostrar =
            h.tipo === "diario" ||
            (h.tipo === "semanal" && h.dias.includes(hoje));

        if (!mostrar) return;

        const li = document.createElement('li');
        li.className = 'habit-item';

        li.innerHTML = `
            <span>
            ${h.nome} (+${h.recompensa}⚡)
            ${h.tipo === "semanal" ? "📅 " + h.dias.join(",") : ""}
                🔥 ${h.streak} dias
            </span>
            <button onclick="completeHabitNew(${h.id}, this)">✔</button>
        `;

        listDOM.appendChild(li);
    });
}
function completeHabitNew(id, btn) {
    const h = meusHabitos.find(h => h.id === id);
    if (!h) return;

    const hoje = new Date().toDateString();

    if (h.lastDone === hoje) {
        log("Você já fez isso hoje!");
        return;
    }

    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);

    if (h.lastDone === ontem.toDateString()) {
        h.streak++;
    } else {
        h.streak = 1;
    }

    h.lastDone = hoje;

    let bonus = Math.floor(h.streak / 3);
    let total = h.recompensa + bonus;

    energyBank += total;

    log(`✔ ${h.nome}! +${total}⚡ (🔥${h.streak})`);

    // animação
    btn.parentElement.classList.add("habit-done");

    renderHabitsForToday();
    updateUI();
}

// Função para mostrar apenas os hábitos do dia de hoje


// --- SELEÇÃO DE EMOJIS ---
    function setupEmojiSelection() {
    const emojis = document.querySelectorAll('.emoji-item');
    emojis.forEach(emoji => {
        emoji.onclick = () => {
            emojis.forEach(e => e.classList.remove('selected'));
            emoji.classList.add('selected');
            selectedIcon = emoji.dataset.icon; // Define o ícone globalmente
        };
    });
}

function showEnergyGain(amount) {
    const el = document.createElement('div');
    el.className = "energy-gain";
    el.innerText = `+${amount}⚡`;

    document.body.appendChild(el);

    setTimeout(() => el.remove(), 1000);
}
function addHabit() {
    const input = document.getElementById('habitInput');
    const dificuldade = document.getElementById('habitDifficulty');
    const tipo = document.getElementById('habitType').value;

    const nome = input.value.trim();
    const recompensa = parseInt(dificuldade.value);

    if (!nome) {
        alert("Digite um hábito!");
        return;
    }

    const novoHabito = {
        id: Date.now(),
        nome: `${selectedIcon} ${nome}`,
        tipo: tipo,
        dias: [],
        recompensa: recompensa,
        streak: 0,
        lastDone: null
    };

    // 🔥 AQUI entra o trecho que você perguntou
    if (tipo === "semanal") {
        novoHabito.dias = getSelectedDays();

        if (novoHabito.dias.length === 0) {
            alert("Selecione pelo menos um dia!");
            return;
        }
    }

    meusHabitos.push(novoHabito);

    input.value = "";

    renderHabitsForToday();
}
function getSelectedDays() {
    const checkboxes = document.querySelectorAll('.day-checkbox:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

const tipoSelect = document.getElementById('habitType'); // cria no HTML depois
const tipo = tipoSelect ? tipoSelect.value : "diario";

function getSelectedDays() {
    const checked = document.querySelectorAll('#weekDaysSelector input:checked');
    return Array.from(checked).map(el => parseInt(el.value));
}
