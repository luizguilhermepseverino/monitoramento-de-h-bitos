// --- ESTADO DE PROGRESSÃO E INIMIGOS ---
let currentStage = 0;
const enemiesList = [
    { name: "👾 Globin", hp: 30, maxHp: 30, color: "#27ae60" },
    { name: "👹 Golem", hp: 65, maxHp: 65, color: "#e67e22" },
    { name: "🐉 Dragão do Prazo Final", hp: 100, maxHp: 100, color: "#c0392b" }
];

// --- CALENDÁRIO E HISTÓRICO ---
const weekDays = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
let currentDayIndex = 0;
let habitHistoryData = [0, 0, 0, 0, 0, 0, 0];
let habitChart;

// --- ESTADO DO JOGADOR ---
let player = { hp: 100, shield: 0, energy: 0, name: "Herói", dmgBuff: 0 };
let enemy = { ...enemiesList[0], nextAction: null, bleedTurns: 0, stunned: false };
let selectedIcon = "🏃";
let currentHand = [];
let drawPile = []; 

// BARALHO MESTRE
const masterDeck = [
    { name: "Golpe", type: "atk", cost: 1, power: 15, img: "golpe.png", colorClass: "card-ataque" },
    { name: "Preciso", type: "pierce", cost: 2, power: 15, img: "preciso.png", colorClass: "card-espada" },
    { name: "Atordoar", type: "stun", cost: 3, power: 0, img: "atordoar.png", colorClass: "card-magia" },
    { name: "Foco", type: "energy", cost: 0, power: 2, img: "foco.png", colorClass: "card-raio" },
    { name: "Lâmina Sombria", type: "atk", effect: "bleed", cost: 1, power: 20, img: "laminasombria.png", colorClass: "card-espada" },
    { name: "Bola de Fogo", type: "magia", cost: 2, power: 35, img: "boladefogo.png", colorClass: "card-magia" },
    { name: "Veredito do Arcanjo", type: "magia", cost: 3, power: 60, img: "veredito.png", colorClass: "card-magia" },
    { name: "Escudo", type: "def", cost: 1, power: 20, icon: "🛡️", colorClass: "card-defesa" },
    { name: "Meditar", type: "heal", cost: 2, power: 25, img: "meditar.png", colorClass: "card-magia" }
];

// --- INICIALIZAÇÃO E LOGIN ---
document.addEventListener('DOMContentLoaded', () => {
    setupIconSelector();
    initChart();
});

function login() {
    const email = document.getElementById('userEmail').value;
    const name = document.getElementById('userName').value;
    const pass = document.getElementById('userPass').value;

    if (email.toLowerCase().endsWith("@gmail.com") && pass && name) {
        player.name = name;
        document.getElementById('playerNameDisplay').innerText = name; 
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        updateDrawPile();
        for(let i=0; i<4; i++) drawHand(); 
        
        prepareEnemyAction();
        updateUI();
    } else {
        alert("Preencha todos os campos!");
    }
}

// --- SISTEMA DE FILA E MÃO ---
function updateDrawPile() {
    while (drawPile.length < 8) { // Aumentado para garantir cartas suficientes para o próximo turno
        const randomIndex = Math.floor(Math.random() * masterDeck.length);
        drawPile.push({ ...masterDeck[randomIndex], id: Math.random().toString(36).substr(2, 9) });
    }
    renderUpcoming();
}

function renderUpcoming() {
    const container = document.getElementById('upcomingCards');
    if (!container) return;
    container.innerHTML = "";
    drawPile.slice(0, 4).forEach((card, index) => {
        const div = document.createElement('div');
        div.className = `preview-card-slot card-${card.type} next-${index + 1} ${card.colorClass}`;
        div.innerHTML = card.img ? `<img src="${card.img}" class="preview-img" style="width:100%; height:100%; object-fit:cover; border-radius:4px;">` : `<span>${card.icon}</span>`;
        container.appendChild(div);
    });
}

function drawHand() {
    if (drawPile.length > 0) {
        currentHand.push(drawPile.shift());
        updateDrawPile();
    }
}

// --- MECÂNICAS DE COMBATE ATUALIZADAS ---
function playCard(uniqueId) {
    const cardIndex = currentHand.findIndex(c => c.id === uniqueId);
    if (cardIndex === -1) return;
    const card = currentHand[cardIndex];

    if (player.energy >= card.cost) {
        player.energy -= card.cost;
        let finalPower = (card.power || 0) + player.dmgBuff;
        
        switch(card.type) {
            case "atk": case "pierce": case "magia":
                enemy.hp -= finalPower;
                log(`Usou ${card.name}! ${finalPower} de dano.`);
                if (card.effect === "bleed") {
                    enemy.bleedTurns = 3;
                    log("O inimigo começou a sangrar!");
                }
                player.dmgBuff = 0;
                break;
            case "def": 
                player.shield += card.power; 
                log(`Defesa +${card.power}`);
                break;
            case "heal": 
                player.hp = Math.min(100, player.hp + card.power); 
                break;
            case "energy": 
                player.energy += card.power; 
                break;
            case "stun": 
                if (Math.random() <= 0.4) {
                    enemy.stunned = true;
                    log("Inimigo Atordoado!");
                }
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
    // Lógica de Sangramento
    if (enemy.bleedTurns > 0) { 
        enemy.hp -= 10; 
        enemy.bleedTurns--; 
        log("O inimigo perdeu 10 HP pelo sangramento...");
    }
    
    setTimeout(() => {
        if (enemy.hp <= 0) { checkGameOver(); return; }
        
        if (!enemy.stunned) {
            if (enemy.nextAction.type === "dmg") {
                let dmg = Math.max(0, enemy.nextAction.val - player.shield);
                player.hp -= dmg;
                log(`Inimigo causou ${dmg} de dano!`);
            } else if (enemy.nextAction.type === "drain") {
                player.energy = Math.max(0, player.energy - 2);
                log(`Energia drenada!`);
            }
        } else {
            log("Inimigo atordoado!");
        }
        
        enemy.stunned = false;
        player.shield = 0; 
        
        // COMPRA AUTOMÁTICA DE 4 CARTAS (Preenche a mão até 4)
        while (currentHand.length < 4) {
            drawHand();
        }

        prepareEnemyAction();
        updateUI();
        checkGameOver();
    }, 600);
}

// --- INTERFACE ---
function updateUI() {
    const enemyDisplay = document.getElementById('enemyNameDisplay');
    if(enemyDisplay) enemyDisplay.innerText = enemy.name;

    document.getElementById('playerHp').style.width = (player.hp / 100) * 100 + "%";
    document.getElementById('playerHpText').innerText = `${player.hp} / 100`;
    document.getElementById('enemyHp').style.width = Math.max(0, (enemy.hp / enemy.maxHp) * 100) + "%";
    document.getElementById('enemyHpText').innerText = `${Math.max(0, enemy.hp)} / ${enemy.maxHp}`;
    document.getElementById('energyStat').innerText = player.energy;
    document.getElementById('shieldDisplay').innerText = `🛡️ ${player.shield}`;
    
    const handDiv = document.getElementById('playerHand');
    handDiv.innerHTML = "";
    
    currentHand.forEach(card => {
        const div = document.createElement('div');
        div.className = `card ${card.colorClass} ${player.energy < card.cost ? 'disabled' : ''}`;
        div.style.padding = "0"; 
        div.style.overflow = "hidden";

        if (card.img) {
            div.innerHTML = `<img src="${card.img}" style="width:100%; height:100%; object-fit:cover;">`;
        } else {
            div.innerHTML = `<div class="card-icon" style="margin-top:10px">${card.icon}</div><strong style="font-size:0.8rem">${card.name}</strong>`;
        }

        div.onclick = () => playCard(card.id);
        handDiv.appendChild(div);
    });
    renderUpcoming();
}

// --- FUNÇÕES DE APOIO ---
function setupIconSelector() {
    const opts = document.querySelectorAll('.icon-opt');
    opts.forEach(opt => {
        opt.onclick = () => {
            opts.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedIcon = opt.dataset.icon;
        };
    });
}

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
    habitHistoryData[currentDayIndex]++;
    const li = btn.parentElement;
    btn.remove(); 
    li.style.opacity = "0.6";
    document.getElementById('doneHabitList').appendChild(li);
    log(`Concluído! +${pts} de Energia.`);
    updateUI();
}

function prepareEnemyAction() {
    const actions = [
        { text: "Atacar (15 dano)", type: "dmg", val: 15 },
        { text: "Drenar (Energia -2)", type: "drain", val: 2 },
        { text: "Golpe Pesado (30 dano)", type: "dmg", val: 30 }
    ];
    enemy.nextAction = actions[Math.floor(Math.random() * actions.length)];
    document.getElementById('intentText').innerText = enemy.nextAction.text;
}

function log(msg) { document.getElementById('battleLog').innerText = msg; }

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
        options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
}

function updateChart() {
    habitChart.data.datasets[0].data = habitHistoryData;
    habitChart.update();
}

function nextDay() {
    currentDayIndex = (currentDayIndex + 1) % 7;
    document.getElementById('currentDayDisplay').innerText = `📅 ${weekDays[currentDayIndex]}`;
    document.getElementById('doneHabitList').innerHTML = "";
    updateChart();
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
        updateChart();
    }
}

function toggleSuggestions() {
    const box = document.getElementById('suggestionBox');
    if(box.innerHTML === "") {
        [ { text: "Beber 2L de água", icon: "💧", diff: 1 }, { text: "Ler 10 páginas", icon: "📚", diff: 2 } ].forEach(sug => {
            const btn = document.createElement('button');
            btn.className = "btn-main";
            btn.style.margin = "5px";
            btn.innerHTML = `${sug.icon} ${sug.text}`;
            btn.onclick = () => { document.getElementById('habitInput').value = sug.text; selectedIcon = sug.icon; box.classList.add('hidden'); };
            box.appendChild(btn);
        });
    }
    box.classList.toggle('hidden');
}