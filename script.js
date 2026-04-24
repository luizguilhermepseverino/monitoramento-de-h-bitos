// --- ESTADO DE PROGRESSÃO E INIMIGOS ---
let currentStage = 0;
const enemiesList = [
    { name: "Globin", hp: 50, maxHp: 50, color: "#27ae60", img: "globin.png" },
    { name: "Golem", hp: 75, maxHp: 75, color: "#e67e22", img: "golem.png" },
    { name: "Dragão do Prazo Final", hp: 140, maxHp: 140, color: "#c0392b", img: "dragao.png" }
];

// --- CALENDÁRIO E HISTÓRICO ---
const weekDays = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"];
let currentDayIndex = 0;
let habitHistoryData = [0, 0, 0, 0, 0, 0, 0];
let habitChart;

// --- ESTADO DO JOGADOR E INIMIGO ---
let player = { hp: 100, shield: 0, energy: 0, name: "Herói", dmgBuff: 0, gender: "Masculino" };
let enemy = { ...enemiesList[0], nextAction: null, bleedTurns: 0, stunned: false, enemyShield: 0 };
let selectedIcon = "🏃";
let currentHand = [];
let drawPile = []; 

// --- BARALHO MESTRE (Composição Fixa) ---
// Definimos exatamente quantas cópias de cada carta existem no deck
const masterDeck = [
    ...Array(4).fill({ name: "Golpe", type: "atk", cost: 1, power: 15, img: "golpe.png", colorClass: "card-ataque" }),
    ...Array(3).fill({ name: "Escudo", type: "def", cost: 1, power: 20, img: "escudo.png", colorClass: "card-defesa" }),
    ...Array(3).fill({ name: "Lâmina Sombria", type: "atk", effect: "bleed", cost: 1, power: 20, img: "laminasombria.png", colorClass: "card-espada" }),
    ...Array(2).fill({ name: "Preciso", type: "pierce", cost: 2, power: 15, img: "preciso.png", colorClass: "card-espada" }),
    ...Array(2).fill({ name: "Bola de Fogo", type: "magia", cost: 2, power: 35, img: "boladefogo.png", colorClass: "card-magia" }),
    ...Array(2).fill({ name: "Meditar", type: "heal", cost: 2, power: 25, img: "meditar.png", colorClass: "card-magia" }),
    ...Array(2).fill({ name: "Atordoar", type: "stun", cost: 3, power: 0, img: "atordoar.png", colorClass: "card-magia" }),
    ...Array(2).fill({ name: "Foco", type: "energy", cost: 0, power: 2, img: "foco.png", colorClass: "card-raio" }),
    { name: "Veredito do Arcanjo", type: "magia", cost: 3, power: 60, img: "veredito.png", colorClass: "card-magia" }
];

// --- INICIALIZAÇÃO E LOGIN ---
document.addEventListener('DOMContentLoaded', () => {
    setupEmojiSelection(); 
    initChart();
});

function toggleHabitMenu() {
    const menu = document.getElementById('habitMenu');
    menu.classList.toggle('hidden');
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

function login() {
    const email = document.getElementById('userEmail').value;
    const name = document.getElementById('userName').value;
    const pass = document.getElementById('userPass').value;
    const gender = document.getElementById('userGender').value; 

    if (email.toLowerCase().endsWith("@gmail.com") && pass && name && gender) {
        player.name = name;
        player.gender = gender;
        document.getElementById('playerNameDisplay').innerText = name; 
        const playerImg = document.getElementById('playerSprite');
        playerImg.src = (gender === "Feminino") ? "heroi_mulher.png" : "heroi_homem.png";
        document.getElementById('enemySprite').src = enemy.img;
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        // Prepara o baralho inicial
        shuffleDeck();
        drawHand(); 
        
        prepareEnemyAction();
        updateUI();
    } else {
        alert("Preencha todos os campos corretamente!");
    }
}

// --- SISTEMA DE BARALHO (Lógica de Embaralhar) ---
function shuffleDeck() {
    // Cria uma nova pilha de compra baseada no deck mestre
    drawPile = masterDeck.map(card => ({ 
        ...card, 
        id: Math.random().toString(36).substr(2, 9) 
    }));

    // Algoritmo Fisher-Yates para embaralhar de verdade
    for (let i = drawPile.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [drawPile[i], drawPile[j]] = [drawPile[j], drawPile[i]];
    }
    log("Baralho reembaralhado!");
}

function drawHand() {
    // Compra cartas até ter 6 na mão ou o deck acabar
    while (currentHand.length < 6) {
        if (drawPile.length === 0) {
            shuffleDeck(); // Reembaralha se as cartas acabarem
        }
        currentHand.push(drawPile.shift());
    }
}

// --- MECÂNICAS DE COMBATE ---
function playCard(uniqueId) {
    const cardIndex = currentHand.findIndex(c => c.id === uniqueId);
    if (cardIndex === -1) return;
    const card = currentHand[cardIndex];

    if (player.energy >= card.cost) {
        player.energy -= card.cost;
        let finalPower = (card.power || 0) + player.dmgBuff;
        
        switch(card.type) {
            case "atk": case "pierce": case "magia":
                let damageToHp = Math.max(0, finalPower - (enemy.enemyShield || 0));
                enemy.enemyShield = Math.max(0, (enemy.enemyShield || 0) - finalPower);
                enemy.hp -= damageToHp;
                log(`Usou ${card.name}! ${finalPower} de impacto.`);
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
    enemy.enemyShield = 0;

    if (enemy.bleedTurns > 0) { 
        enemy.hp -= 10; 
        enemy.bleedTurns--; 
        log("O inimigo perdeu 10 HP pelo sangramento...");
    }
    
    setTimeout(() => {
        if (enemy.hp <= 0) { checkGameOver(); return; }
        
        if (!enemy.stunned) {
            let multiplier = (enemy.name.includes("Dragão")) ? 1.5 : 1.0;
            if (enemy.nextAction.type === "dmg") {
                let baseDmg = enemy.nextAction.val * multiplier;
                let finalDmg = Math.max(0, baseDmg - player.shield);
                player.hp -= finalDmg;
                log(`${enemy.name} causou ${finalDmg} de dano!`);
            } else if (enemy.nextAction.type === "shield") {
                enemy.enemyShield = enemy.nextAction.val * multiplier;
                log(`${enemy.name} ativou escudo!`);
            }
        } else {
            log("Inimigo atordoado!");
        }
        
        enemy.stunned = false;
        player.shield = 0; 
        
        // Compra novas cartas para o próximo turno
        drawHand();

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
        const canAfford = player.energy >= card.cost;
        div.className = `card ${card.colorClass} ${!canAfford ? 'disabled' : ''}`;
        
        div.innerHTML = `
            <div class="card-cost">${card.cost}</div>
            ${card.img ? `<img src="${card.img}" style="width:100%; height:100%; object-fit:cover;">` : `<strong>${card.name}</strong>`}
        `;

        if(canAfford) {
            div.onclick = () => playCard(card.id);
        }
        handDiv.appendChild(div);
    });
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
        <button onclick="completeHabit(this, ${diff})" class="btn-main" style="width:auto; padding: 5px 15px;">Concluir</button>
    `;
    document.getElementById('habitList').appendChild(li);
    input.value = ""; 
    toggleHabitMenu(); 
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

function toggleSuggestions() {
    const box = document.getElementById('suggestionBox');
    if(box.innerHTML === "") {
        const sugestoes = [
            { text: "Beber 2L de água", icon: "💧", diff: 3 },
            { text: "Ler 10 páginas", icon: "📚", diff: 4 },
            { text: "Correr 5km", icon: "🏃", diff: 5 },
            { text: "Treino de força", icon: "💪", diff: 5 },
            { text: "Dormir 8h", icon: "😴", diff: 3 }
        ];
        sugestoes.forEach(sug => {
            const btn = document.createElement('button');
            btn.className = "btn-main";
            btn.style.margin = "5px";
            btn.innerHTML = `${sug.icon} ${sug.text}`;
            btn.onclick = () => { 
                document.getElementById('habitInput').value = sug.text; 
                selectedIcon = sug.icon; 
                box.classList.add('hidden'); 
            };
            box.appendChild(btn);
        });
    }
    box.classList.toggle('hidden');
}

// --- FUNÇÕES DE APOIO ---
function prepareEnemyAction() {
    const actions = [
        { text: "Atacar (35 dano)", type: "dmg", val: 35 },
        { text: "Magia Obscura (50 dano)", type: "dmg", val: 50 },
        { text: "Escudo de Almas (35 escudo)", type: "shield", val: 35 }
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
    enemy = { ...next, nextAction: null, bleedTurns: 0, stunned: false, enemyShield: 0 };
    document.getElementById('enemySprite').src = next.img;
    prepareEnemyAction();
    updateUI();
}

function initChart() {
    const canvas = document.getElementById('habitChart');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
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
    if(habitChart) {
        habitChart.data.datasets[0].data = habitHistoryData;
        habitChart.update();
    }
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
