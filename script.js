// --- ESTADO DE PROGRESSÃO E INIMIGOS ---
let currentStage = 0;
const enemiesList = [
    { name: "👾 Procrastinação Nível 1", hp: 50, maxHp: 50, color: "#27ae60" },
    { name: "👹 Bloqueio Criativo", hp: 75, maxHp: 75, color: "#e67e22" },
    { name: "🐉 Dragão do Prazo Final", hp: 200, maxHp: 200, color: "#c0392b" }
];

// --- CALENDÁRIO E HISTÓRICO ---
const weekDays = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
let currentDayIndex = 0;
let habitHistoryData = [0, 0, 0, 0, 0, 0, 0]; // Dados para o gráfico
let habitChart;

// --- ESTADO DO JOGADOR ---
let player = { hp: 100, shield: 0, energy: 0, name: "Herói", dmgBuff: 0 };
let enemy = { ...enemiesList[0], nextAction: null, bleedTurns: 0, stunned: false };
let selectedIcon = "🏃";
let currentHand = [];

// BARALHO MESTRE (inalterado)
const masterDeck = [
    { name: "Golpe", type: "atk", cost: 1, power: 15, icon: "⚔️", desc: "Dano básico.", colorClass: "card-ataque" },
    { name: "Escudo", type: "def", cost: 1, power: 20, icon: "🛡️", desc: "Ganha +20 de defesa.", colorClass: "card-defesa" },
    { name: "Meditar", type: "heal", cost: 2, power: 25, icon: "✨", effect: "heal", desc: "Recupera 25 de HP.", colorClass: "card-magia" },
    { name: "Lâmina Sangue", type: "espada", cost: 2, power: 10, icon: "🩸", effect: "bleed", desc: "Causa sangramento.", colorClass: "card-sangue" },
    { name: "Raio Arcano", type: "magia", cost: 2, power: 30, icon: "⚡", desc: "Dano mágico alto.", colorClass: "card-raio" },
    { name: "Foco", type: "buff", cost: 1, power: 10, icon: "🧠", desc: "+10 de dano.", colorClass: "card-raio" },
    { name: "Energia", type: "energy", cost: 0, power: 2, icon: "🔋", desc: "Ganha +2 de Energia.", colorClass: "card-raio" },
    { name: "Rajada", type: "multiAtk", cost: 2, power: 8, icon: "🌪️", desc: "Ataca 3 vezes.", colorClass: "card-ataque" },
    { name: "Preciso", type: "pierce", cost: 2, power: 15, icon: "🎯", desc: "Ignora escudo.", colorClass: "card-espada" },
    { name: "Atordoar", type: "stun", cost: 3, power: 0, icon: "🌀", desc: "Pula turno inimigo.", colorClass: "card-magia" }
];

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    setupIconSelector();
    initChart();
});

function setupIconSelector() {
    document.querySelectorAll('.icon-opt').forEach(opt => {
        opt.addEventListener('click', function() {
            document.querySelectorAll('.icon-opt').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            selectedIcon = this.getAttribute('data-icon');
        });
    });
}

// --- GRÁFICO (Chart.js) ---
function initChart() {
    const ctx = document.getElementById('habitChart').getContext('2d');
    habitChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: weekDays,
            datasets: [{
                label: 'Hábitos Concluídos',
                data: habitHistoryData,
                backgroundColor: '#3498db',
                borderColor: '#2980b9',
                borderWidth: 1
            }]
        },
        options: {
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

function updateChart() {
    habitChart.data.datasets[0].data = habitHistoryData;
    habitChart.update();
}

// --- SISTEMA DE DIAS E ABAS ---
function nextDay() {
    currentDayIndex = (currentDayIndex + 1) % 7;
    document.getElementById('currentDayDisplay').innerText = `📅 ${weekDays[currentDayIndex]}`;
    
    // Limpar lista de concluídos visualmente para o novo dia
    document.getElementById('doneHabitList').innerHTML = "";
    
    log(`Início de um novo dia: ${weekDays[currentDayIndex]}!`);
    alert(`O tempo passou! Agora é ${weekDays[currentDayIndex]}.`);
}

function switchTab(tabName) {
    const pendingTab = document.getElementById('tab-pending');
    const historyTab = document.getElementById('tab-history');
    const buttons = document.querySelectorAll('.tab-btn');

    if (tabName === 'pending') {
        pendingTab.classList.remove('hidden');
        historyTab.classList.add('hidden');
        buttons[0].classList.add('active');
        buttons[1].classList.remove('active');
    } else {
        pendingTab.classList.add('hidden');
        historyTab.classList.remove('hidden');
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
        updateChart(); // Atualiza gráfico ao abrir a aba
    }
}

// --- LOGIN ---
function login() {
    const email = document.getElementById('userEmail').value;
    const pass = document.getElementById('userPass').value;

    if (email.toLowerCase().endsWith("@gmail.com") && pass) {
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        drawHand();
        prepareEnemyAction();
        updateUI();
    } else {
        alert("Acesso negado! Use @gmail.com");
    }
}

// --- GESTÃO DE HÁBITOS ---
function addHabit() {
    const input = document.getElementById('habitInput');
    const diff = document.getElementById('habitDifficulty').value;
    if (!input.value.trim()) return;

    const li = document.createElement('li');
    li.className = 'habit-item';
    li.innerHTML = `
        <div class="habit-info">
            <span class="habit-main">${selectedIcon} ${input.value}</span>
            <small class="habit-meta">Ganho: ${diff}⚡</small>
        </div>
        <button onclick="completeHabit(this, ${diff})" class="btn-main">Concluir</button>
    `;
    document.getElementById('habitList').appendChild(li);
    input.value = ""; 
}

function completeHabit(btn, pts) {
    player.energy += parseInt(pts);
    
    // Atualiza Histórico/Gráfico
    habitHistoryData[currentDayIndex]++;
    
    // Move para lista de concluídos (Aba Histórico)
    const li = btn.parentElement;
    btn.remove(); 
    li.style.opacity = "0.6";
    document.getElementById('doneHabitList').appendChild(li);
    
    log(`Concluído! +${pts} de Energia.`);
    updateUI();
}

// --- MECÂNICAS DE COMBATE ---
function drawHand() {
    let shuffled = [...masterDeck].sort(() => 0.5 - Math.random());
    currentHand = shuffled.slice(0, 4).map(card => ({
        ...card,
        id: Math.random().toString(36).substr(2, 9)
    }));
}

function prepareEnemyAction() {
    const actions = [
        { text: "Atacar (25 dano)", type: "dmg", val: 25 },
        { text: "Drenar (Energia -2)", type: "drain", val: 2 },
        { text: "Golpe Pesado (40 dano)", type: "dmg", val: 40 }
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
        let finalPower = (card.power || 0) + player.dmgBuff;
        
        switch(card.type) {
            case "atk":
            case "espada":
            case "magia":
                enemy.hp -= finalPower;
                log(`Usou ${card.name}! ${finalPower} de dano.`);
                player.dmgBuff = 0;
                if (card.effect === "bleed") enemy.bleedTurns = 2;
                break;
            case "multiAtk":
                for(let i=0; i<3; i++) { enemy.hp -= (card.power + player.dmgBuff); }
                player.dmgBuff = 0;
                log(`Rajada! 3 ataques rápidos.`);
                break;
            case "def":
                player.shield += card.power;
                break;
            case "heal":
                player.hp = Math.min(100, player.hp + card.power);
                break;
            case "energy":
                player.energy += card.power;
                break;
            case "buff":
                player.dmgBuff += card.power;
                break;
            case "stun":
                if (Math.random() <= 0.4) enemy.stunned = true;
                break;
        }

        currentHand.splice(cardIndex, 1);
        updateUI();
        checkGameOver();
    } else {
        log("Sem energia!");
    }
}

function endTurn() {
    if (enemy.bleedTurns > 0) {
        enemy.hp -= 10;
        enemy.bleedTurns--;
    }

    setTimeout(() => {
        if (enemy.hp <= 0) return;
        if (!enemy.stunned) {
            if (enemy.nextAction.type === "dmg") {
                let dmg = Math.max(0, enemy.nextAction.val - player.shield);
                player.hp -= dmg;
            } else if (enemy.nextAction.type === "drain") {
                player.energy = Math.max(0, player.energy - 2);
            }
        }
        enemy.stunned = false;
        player.shield = 0; 
        drawHand();
        prepareEnemyAction();
        updateUI();
        checkGameOver();
    }, 600);
}

// --- INTERFACE (HP VISÍVEL E GRÁFICOS) ---
function updateUI() {
    document.getElementById('energyStat').innerText = player.energy;
    document.getElementById('shieldDisplay').innerText = `🛡️ ${player.shield}`;

    // Atualização de HP
    document.getElementById('playerHp').style.width = player.hp + "%";
    document.getElementById('playerHpText').innerText = `${player.hp} / 100`;

    const eHpPercent = (Math.max(0, enemy.hp) / enemy.maxHp) * 100;
    document.getElementById('enemyHp').style.width = eHpPercent + "%";
    document.getElementById('enemyHpText').innerText = `${Math.max(0, enemy.hp)} / ${enemy.maxHp}`;
    document.querySelector('.entity.enemy span').innerText = enemy.name;
    
    // Renderizar Mão
    const handDiv = document.getElementById('playerHand');
    handDiv.innerHTML = "";
    currentHand.forEach(card => {
        const div = document.createElement('div');
        div.className = `card ${card.colorClass} ${player.energy < card.cost ? 'disabled' : ''}`;
        div.innerHTML = `
            <div class="card-icon">${card.icon}</div>
            <strong>${card.name}</strong>
            <p class="card-desc">${card.desc}</p>
            <small>${card.cost}⚡</small>
        `;
        div.onclick = () => playCard(card.id);
        handDiv.appendChild(div);
    });
}

function log(msg) {
    document.getElementById('battleLog').innerText = msg;
}

function checkGameOver() {
    if (enemy.hp <= 0) {
        alert("Vitória! Inimigo derrotado.");
        player.hp = Math.min(100, player.hp + 40);
        currentStage++;
        startNextStage();
    } else if (player.hp <= 0) {
        alert("Você foi derrotado!");
        location.reload();
    }
}

function startNextStage() {
    if (currentStage >= enemiesList.length) currentStage = 0;
    const next = enemiesList[currentStage];
    enemy = { ...next, nextAction: null, bleedTurns: 0, stunned: false };
    prepareEnemyAction();
    updateUI();
}