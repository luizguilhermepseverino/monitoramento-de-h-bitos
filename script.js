// --- CONFIGURAÇÕES INICIAIS E ESTADO ---
let player = { hp: 100, shield: 0, energy: 0, name: "Herói" };
let enemy = { hp: 150, maxHp: 150, nextAction: null, bleedTurns: 0 };
let selectedIcon = "🏃";
let currentHand = [];

// BARALHO MESTRE (2 de cada, total 10 cartas)
const masterDeck = [
    { name: "Golpe", type: "atk", cost: 1, power: 15, icon: "⚔️", colorClass: "card-ataque" },
    { name: "Golpe", type: "atk", cost: 1, power: 15, icon: "⚔️", colorClass: "card-ataque" },
    { name: "Escudo", type: "def", cost: 1, power: 20, icon: "🛡️", colorClass: "card-defesa" },
    { name: "Escudo", type: "def", cost: 1, power: 20, icon: "🛡️", colorClass: "card-defesa" },
    { name: "Meditar", type: "magia", cost: 2, power: 25, icon: "✨", effect: "heal", colorClass: "card-magia" },
    { name: "Meditar", type: "magia", cost: 2, power: 25, icon: "✨", effect: "heal", colorClass: "card-magia" },
    { name: "Lâmina Sangue", cost: 2, type: "espada", power: 10, icon: "🩸", effect: "bleed", colorClass: "card-sangue" },
    { name: "Lâmina Sangue", cost: 2, type: "espada", power: 10, icon: "🩸", effect: "bleed", colorClass: "card-sangue" },
    { name: "Raio Arcano", cost: 2, type: "magia", power: 30, icon: "⚡", colorClass: "card-raio" },
    { name: "Raio Arcano", cost: 2, type: "magia", power: 30, icon: "⚡", colorClass: "card-raio" }
];

// --- INICIALIZAÇÃO E LOGIN ---
document.addEventListener('DOMContentLoaded', () => {
    // Configura os cliques nos ícones do criador de hábitos
    document.querySelectorAll('.icon-opt').forEach(opt => {
        opt.addEventListener('click', function() {
            document.querySelectorAll('.icon-opt').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            selectedIcon = this.getAttribute('data-icon');
        });
    });

    // Listeners para os botões de frequência
    const freqDaily = document.getElementById('freqDaily');
    const freqWeekly = document.getElementById('freqWeekly');
    if(freqDaily) freqDaily.addEventListener('change', () => toggleDays(false));
    if(freqWeekly) freqWeekly.addEventListener('change', () => toggleDays(true));
});

function login() {
    const email = document.getElementById('userEmail').value;
    const pass = document.getElementById('userPass').value;
    if (email && pass) {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        drawHand();
        prepareEnemyAction();
        updateUI();
    } else {
        alert("Por favor, preencha E-mail e Senha!");
    }
}

// --- GESTÃO DE HÁBITOS ---
function toggleDays(show) {
    const selector = document.getElementById('daysSelector');
    if(selector) selector.classList.toggle('hidden', !show);
}

function addHabit() {
    const input = document.getElementById('habitInput');
    const diff = document.getElementById('habitDifficulty').value;
    const isWeekly = document.getElementById('freqWeekly').checked;
    
    if (!input.value.trim()) return;

    let dayTags = "";
    if (isWeekly) {
        const checkedDays = Array.from(document.querySelectorAll('.day-check:checked')).map(cb => cb.value);
        dayTags = checkedDays.length > 0 ? ` [${checkedDays.join(', ')}]` : " [Sem dias]";
    } else {
        dayTags = " [Diário]";
    }

    const li = document.createElement('li');
    li.className = 'habit-item';
    const diffLabel = diff == "1" ? "Fácil" : diff == "2" ? "Médio" : "Difícil";

    li.innerHTML = `
        <div class="habit-info">
            <span class="habit-main">${selectedIcon} ${input.value}</span>
            <small class="habit-meta">${diffLabel} | ${dayTags}</small>
        </div>
        <button onclick="completeHabit(this, ${diff})" class="btn-main">Concluir</button>
    `;
    
    document.getElementById('habitList').appendChild(li);
    input.value = ""; // Limpa o campo
}

function completeHabit(btn, pts) {
    player.energy += parseInt(pts);
    btn.disabled = true;
    btn.innerText = "✅";
    log(`Hábito concluído! +${pts} de Energia.`);
    updateUI();
}

// --- MECÂNICAS DE COMBATE ---
function drawHand() {
    // Embaralha e seleciona 4, dando IDs únicos para evitar bugs de clique
    let shuffled = [...masterDeck].sort(() => 0.5 - Math.random());
    currentHand = shuffled.slice(0, 4).map(card => ({
        ...card,
        id: Math.random().toString(36).substr(2, 9)
    }));
}

function prepareEnemyAction() {
    const actions = [
        { text: "Atacar (25 de dano)", type: "dmg", val: 25 },
        { text: "Drenar (Remove 2 Energia)", type: "drain", val: 2 },
        { text: "Golpe Forte (40 de dano)", type: "dmg", val: 40 }
    ];
    enemy.nextAction = actions[Math.floor(Math.random() * actions.length)];
    document.getElementById('intentText').innerText = enemy.nextAction.text;
}

function playCard(uniqueId) {
    const cardIndex = currentHand.findIndex(c => c.id === uniqueId);
    if (cardIndex === -1) return;

    const card = currentHand[cardIndex];

    if (player.energy >= card.cost) {
        player.energy -= card.cost;
        
        // Aplicação de dano e reações
        if (card.type === "atk" || card.type === "espada" || card.type === "magia") {
            enemy.hp -= card.power;
            log(`Você usou ${card.name}! Causou ${card.power} de dano.`);
            
            // 1/3 de chance do boss se curar ao tomar dano
            if (Math.random() <= 0.33) {
                enemy.hp = Math.min(enemy.maxHp, enemy.hp + 15);
                log("⚡ Reação: O Boss se curou em 15 HP!");
            }

            if (card.effect === "bleed") enemy.bleedTurns = 2;
        } 
        
        if (card.type === "def") player.shield += card.power;
        if (card.effect === "heal") player.hp = Math.min(100, player.hp + card.power);

        currentHand.splice(cardIndex, 1);
        updateUI();
        checkGameOver();
    } else {
        log("Energia insuficiente!");
    }
}

function endTurn() {
    // Processa Sangramento
    if (enemy.bleedTurns > 0) {
        enemy.hp -= 10;
        enemy.bleedTurns--;
        log("O sangramento tirou 10 HP do inimigo.");
    }

    setTimeout(() => {
        if (enemy.hp <= 0) return;

        // Executa ação do Boss
        if (enemy.nextAction.type === "dmg") {
            let finalDmg = Math.max(0, enemy.nextAction.val - player.shield);
            player.hp -= finalDmg;
            log(`O Boss causou ${finalDmg} de dano!`);
        } else if (enemy.nextAction.type === "drain") {
            player.energy = Math.max(0, player.energy - 2);
            log("O Boss sugou 2 pontos da sua energia!");
        }

        player.shield = 0; // Reset do escudo do jogador
        drawHand();
        prepareEnemyAction();
        updateUI();
        checkGameOver();
    }, 600);
}

// --- INTERFACE E UTILITÁRIOS ---
function updateUI() {
    document.getElementById('energyStat').innerText = player.energy;
    document.getElementById('enemyHp').style.width = (enemy.hp / enemy.maxHp * 100) + "%";
    document.getElementById('playerHp').style.width = player.hp + "%";
    document.getElementById('shieldDisplay').innerText = `🛡️ ${player.shield}`;
    document.getElementById('enemyStatus').innerText = enemy.bleedTurns > 0 ? `🩸 Sangue` : "";
    
    const handDiv = document.getElementById('playerHand');
    handDiv.innerHTML = "";
    
    currentHand.forEach((card) => {
        const div = document.createElement('div');
        div.className = `card ${card.colorClass}`;
        if (player.energy < card.cost) div.classList.add('disabled');
        
        div.innerHTML = `
            <div class="card-icon">${card.icon}</div>
            <strong>${card.name}</strong>
            <small>${card.cost}⚡</small>
        `;
        div.onclick = () => playCard(card.id);
        handDiv.appendChild(div);
    });
}

function log(msg) {
    const logBox = document.getElementById('battleLog');
    logBox.innerText = msg;
}

function checkGameOver() {
    if (enemy.hp <= 0) {
        alert("VITÓRIA! Você derrotou a procrastinação!");
        location.reload();
    } else if (player.hp <= 0) {
        alert("GAME OVER! Melhore seus hábitos e tente novamente.");
        location.reload();
    }
}