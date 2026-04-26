// ==========================================
// --- ESTADO DE PROGRESSÃO E INIMIGOS ---
// ==========================================
let currentStage = 0;
let gold = 0; 

const enemiesList = [
    { name: "Globin", hp: 45, maxHp: 45, color: "#27ae60", img: "globin.png" },
    { name: "Golem", hp: 90, maxHp: 90, color: "#e67e22", img: "golem.png" },
    { name: "Cavaleiro Sombrio", hp: 225, maxHp: 225, color: "#2c3e50", img: "cavaleiro.png" },
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
const AUTO_PULL_AMOUNT = 4; 
let inBattle = false;

// --- ESTADO DO JOGADOR E INIMIGO ---
let player = { 
    hp: 100, shield: 0, energy: 0, name: "Herói", 
    dmgBuff: 0, gender: "Masculino", burnTurns: 0, 
    tookDamageThisTurn: false 
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
    { name: "Ataque Sombrio", type: "dark_atk", cost: 2, power: 80, selfDamage: 20, img: "ataquesombrio.png", colorClass: "card-ataque" },
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
    const email = document.getElementById('userEmail').value;
    const name = document.getElementById('userName').value;
    const pass = document.getElementById('userPass').value;
    const gender = document.getElementById('userGender').value; 
    if (email.toLowerCase().endsWith("@gmail.com") && pass && name && gender) {
        player.name = name;
        player.gender = gender;
        document.getElementById('playerNameDisplay').innerText = name; 
        document.getElementById('playerSprite').src = (gender === "Feminino") ? "heroi_mulher.png" : "heroi_homem.png";
        document.getElementById('enemySprite').src = enemy.img;
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        updateUI();
    } else {
        alert("Preencha todos os campos corretamente!");
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
    let pullLimit = overloadedNextTurn ? 3 : AUTO_PULL_AMOUNT;
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
        minigameTimeLeft -= (type === "math" ? 0.75 : 0.33); 
        
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

    // Agora pegamos o dano da intenção do Boss e dividimos por 2
    let mitigatedDmg = Math.floor(enemy.nextAction.val / 2);
    
    // Aplicamos o dano reduzido ao jogador
    applyDamageToPlayer(mitigatedDmg);

    log(`🔬 Reação contida! Você mitigou o impacto, mas recebeu ${mitigatedDmg} de dano.`);
    executeMinionActionAndFinish();
}

function loseMinigame() {
    clearInterval(minigameTimer);
    document.getElementById('minigameOverlay').classList.add('hidden');
    applyDamageToPlayer(50);
    log("💥 ERRO CIENTÍFICO! 50 de dano crítico recebido!");
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

function playCard(uniqueId) {
    if (!inBattle || skillCheckActive || !document.getElementById('minigameOverlay').classList.contains('hidden')) return; 
    const cardIndex = currentHand.findIndex(c => c.id === uniqueId);
    if (cardIndex === -1) return;
    const card = currentHand[cardIndex];

    if (player.energy >= card.cost) {
        player.energy -= card.cost;
        let finalPower = (card.power || 0) + player.dmgBuff;
        let targetEnt = (currentTarget === 'minion' && minion && minion.hp > 0) ? minion : enemy;

        switch(card.type) {
            case "retaliation":
                let baseDmg = player.tookDamageThisTurn ? (card.power * 2) : card.power;
                let totalRetalDmg = baseDmg + player.dmgBuff;
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
            // 1. Aplica o dano base de 40 (mais qualquer buff de dano que o jogador tenha)
                let damageDealt = card.power + player.dmgBuff;
                targetEnt.hp -= damageDealt;
                log(`Boss Killer causou ${damageDealt} de dano!`);

                 // 2. Verifica se a vida restante é menor que 60 para executar
                 if (targetEnt.hp > 0 && targetEnt.hp < 60) {
                    targetEnt.hp = 0;
                    log(`🎯 LIMIAR ATINGIDO! O inimigo tinha menos de 60 HP e foi executado!`);
                } else if (targetEnt.hp <= 0) {
                    log(`O golpe foi fatal!`);
                } else {
                    log(`O alvo resistiu à execução.`);
                }

    player.dmgBuff = 0; // Consome o buff de dano após o ataque
    shakeElement(document.getElementById('enemySprite'));
    break;

            case "dark_atk":
                let darkDmg = (card.power + player.dmgBuff);
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
             // Dano base (8) + (8 * cartas restantes) + buffs
                let calcDamage = card.power + (card.power * cardsInHand) + player.dmgBuff;;
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
                    // 1. Aplica o dano (O escudo do player protege o HP aqui)
                    applyDamageToPlayer(enemy.nextAction.val);
                    
                    // 2. O Cavaleiro rouba o que sobrou do seu escudo para ele
                    if (player.shield > 0) {
                        log(`🛡️ O Cavaleiro drenou sua defesa! (+${player.shield} para ele)`);
                        enemy.enemyShield += player.shield;
                        player.shield = 0; 
                    }
                    
                    // 3. O Cavaleiro se cura em 40 (Garantindo que não passe do HP máximo)
                    enemy.hp = Math.min(enemy.maxHp, enemy.hp + 40); 
                    
                    log(`🍷 DRENO! ${enemy.name} causou dano e recuperou 40 de vida!`);
                    
                    updateUI(); 
                    break;
                    
                    // 3. Cura o Cavaleiro (Independente do escudo)
                    enemy.hp = Math.min(enemy.maxHp, enemy.hp + 40); 
                    log(`🍷 DRENO! O Cavaleiro recuperou 40 de vida!`);
                    
                    updateUI(); 
                    break;
                    applyDamageToPlayer(enemy.nextAction.val);
                    enemy.hp = Math.min(enemy.maxHp, enemy.hp + 40); 
                    log(`🍷 DRENO! O Cavaleiro causou dano e recuperou 40 de vida!`);
                    updateUI(); 
                    break;
                case "dragon_fire":
                    applyDamageToPlayer(enemy.nextAction.val);
                    player.burnTurns = 3; 
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

// --- INTERFACE ---
function updateUI() {
    const activeEnemy = (currentTarget === 'minion' && minion) ? minion : enemy;

    if(document.getElementById('enemyNameDisplay')) document.getElementById('enemyNameDisplay').innerText = activeEnemy.name;
    if(DOM.enemySprite) DOM.enemySprite.src = activeEnemy.img || "dragao.png";

    if(DOM.enemyHp) {
        const hpPct = (activeEnemy.hp / activeEnemy.maxHp) * 100;
        DOM.enemyHp.style.width = Math.max(0, hpPct) + "%";
    }
    if(DOM.enemyHpText) DOM.enemyHpText.innerText = `${Math.max(0, Math.floor(activeEnemy.hp))} / ${activeEnemy.maxHp}`;
    if(DOM.shieldEnemy) DOM.shieldEnemy.innerText = `🛡️ ${activeEnemy.enemyShield || 0}`;

    if(DOM.playerHp) DOM.playerHp.style.width = Math.max(0, player.hp) + "%";
    if(DOM.playerHpText) DOM.playerHpText.innerText = `${Math.max(0, Math.floor(player.hp))} / 100`;
    if(DOM.energyStat) DOM.energyStat.innerText = player.energy;
    if(DOM.shieldPlayer) DOM.shieldPlayer.innerText = `🛡️ ${player.shield}`;
    if(DOM.energyBank) DOM.energyBank.innerText = `Reserva: ${energyBank}⚡`;

    if(document.getElementById('goldValue')) document.getElementById('goldValue').innerText = gold;
    if(document.getElementById('btnGoldDisplay')) document.getElementById('btnGoldDisplay').innerText = gold;

    let combinedIntent = (enemy.nextAction) ? `Boss: ${enemy.nextAction.text}` : "Aguardando...";
    if (minion && minion.hp > 0 && minion.nextAction) combinedIntent += ` | Lacaio: ${minion.nextAction.text}`;
    if (document.getElementById('intentText')) document.getElementById('intentText').innerText = combinedIntent;

    let targetUI = document.getElementById('targetSelectorContainer');
    if (minion && minion.hp > 0) {
        if (!targetUI) {
            targetUI = document.createElement('div');
            targetUI.id = 'targetSelectorContainer';
            targetUI.style.margin = '10px auto';
            const handDiv = document.getElementById('playerHand');
            handDiv.parentNode.insertBefore(targetUI, handDiv);
        }
        targetUI.style.display = 'block';
        targetUI.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; gap: 15px; background: #222; padding: 8px 15px; border-radius: 8px; border: 1px solid #444; width: fit-content; margin: 0 auto;">
                <button onclick="setTarget('enemy')" style="padding: 8px 12px; background: ${currentTarget === 'enemy' ? '#c0392b' : '#333'}; color: white; border-radius: 5px; cursor: pointer; border: none; font-weight: bold;">🎯 Focar Boss</button>
                <div style="text-align: center; min-width: 180px;">
                    <h4 style="margin: 0; color: #fff; font-size: 0.95em;">${minion.name}</h4>
                    <p style="margin: 3px 0 0 0; font-size: 0.8em; color: #ff7675;">❤️ HP: ${Math.max(0, Math.floor(minion.hp))} / ${minion.maxHp}</p>
                </div>
                <button onclick="setTarget('minion')" style="padding: 8px 12px; background: ${currentTarget === 'minion' ? '#2c3e50' : '#333'}; color: white; border-radius: 5px; cursor: pointer; border: none; font-weight: bold;">🎯 Focar Lacaio</button>
            </div>
        `;
    } else if (targetUI) targetUI.style.display = 'none';

    const handDiv = document.getElementById('playerHand');
    if(handDiv) {
        handDiv.innerHTML = "";
        currentHand.forEach(card => {
            const div = document.createElement('div');
            const canAfford = player.energy >= card.cost;
            div.className = `card ${card.colorClass} ${!canAfford ? 'disabled' : ''}`;
            div.innerHTML = `<div class="card-cost">${card.cost}</div><img src="${card.img}">`;
            if(canAfford) div.onclick = () => playCard(card.id);
            handDiv.appendChild(div);
        });
    }
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
            { text: "Descanso (+75 HP)", type: "dragon_rest", val: 75 },
            { text: "Mordida (45 dano)", type: "dmg", val: 45 }
        ];
    } else if (enemy.name.includes("Cientista")) {
        // Removido: Campo de Força (shield)
        actions = [
            { text: "Cálculo Letal 📐", type: "sci_math", val: 50 },
            { text: "Hipótese Escrita 📝", type: "sci_type", val: 50 },
            { text: "Lança-Chamas (40 dano)", type: "dmg", val: 40 }
        ];
    } else if (enemy.name.includes("Cavaleiro")) {
        // Removido: Muralha (shield)
        actions = [
            { text: "Dreno (35 + Cura 40)", type: "knight_drain", val: 35 },
            { text: "Esmagar (PARRY!)", type: "dmg_heavy", val: 35 }
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
                <div class="card ${card1.colorClass}"><div class="card-cost">${card1.cost}</div><img src="${card1.img}"></div>
                <p style="color:white; font-weight:bold; margin-top:10px;">${card1.name}</p>
            </div>
            <div onclick="claimSpecificReward(${idx2})" style="cursor:pointer; text-align:center;">
                <div class="card ${card2.colorClass}"><div class="card-cost">${card2.cost}</div><img src="${card2.img}"></div>
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
    player.energy = 4;
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
function addHabit() {
    const input = document.getElementById('habitInput');
    const difficulty = document.getElementById('habitDifficulty').value;
    const text = input.value.trim();
    
    if (text) {
        const list = document.getElementById('pendingHabitList');
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${selectedIcon} ${text} (${difficulty}⚡)</span>
            <button onclick="completeHabit(this, ${difficulty})">✔</button>
        `;
        list.appendChild(li);
        input.value = "";
        toggleHabitMenu();
        log(`Novo hábito adicionado: ${text}`);
    } else {
        alert("Digite uma descrição para o hábito!");
    }
}
