let habits = [];
let energy = 0;
let streak = 0;

function addHabit() {
  const name = document.getElementById("habitName").value;
  const goal = parseFloat(document.getElementById("habitGoal").value);

  if (!name || !goal) return alert("Preencha os campos!");

  habits.push({
    name: name,
    goal: goal,
    done: 0
  });

  document.getElementById("habitName").value = "";
  document.getElementById("habitGoal").value = "";

  renderHabits();
}

function renderHabits() {
  const list = document.getElementById("habitList");
  list.innerHTML = "";

  habits.forEach((habit, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      ${habit.name} (${habit.done}/${habit.goal})
      <button onclick="completeHabit(${index})">+1</button>
    `;

    list.appendChild(li);
  });
}

function completeHabit(index) {
  let habit = habits[index];

  if (habit.done < habit.goal) {
    habit.done += 1;

    let gain = (1 * (habit.done / habit.goal));
    energy += gain;

    updateStatus();
    renderHabits();
  }
}

function updateStatus() {
  document.getElementById("energy").innerText = energy.toFixed(1);

  let allDone = habits.every(h => h.done >= h.goal);

  if (allDone && habits.length > 0) {
    streak += 1;
  }

  document.getElementById("streak").innerText = streak;
}