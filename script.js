let puzzles = [];
let currentPuzzle = 0;
let score = 0;

async function loadPuzzles() {
  const res = await fetch("data/blocks.json");
  puzzles = await res.json();
  showPuzzle();
}

function showPuzzle() {
  const p = puzzles[currentPuzzle];
  document.getElementById("tantrayukti").innerText = "Tantrayukti: " + p.tantrayukti;
  document.getElementById("question").innerText = p.question;

  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = "";
  document.getElementById("missing-part").classList.add("hidden");

  p.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => checkAnswer(opt, p.answer);
    optionsContainer.appendChild(btn);
  });
}

function checkAnswer(selected, correct) {
  if (selected === correct) {
    score += 10;
    document.getElementById("score").innerText = `Score: ${score}`;
    document.getElementById("revealed-text").innerText = correct;
    document.getElementById("missing-part").classList.remove("hidden");
  } else {
    alert("Try again! Hint: Recall the Tantrayukti principle.");
  }
}

document.getElementById("next-btn").addEventListener("click", () => {
  currentPuzzle = (currentPuzzle + 1) % puzzles.length;
  showPuzzle();
});

document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

document.getElementById("saveBlock").addEventListener("click", () => {
  const newBlock = {
    tantrayukti: document.getElementById("newTantrayukti").value,
    question: document.getElementById("newQuestion").value,
    missingPart: document.getElementById("newMissingPart").value,
    answer: document.getElementById("newAnswer").value,
    options: [document.getElementById("newAnswer").value, "Wrong Option 1", "Wrong Option 2"]
  };

  let storedBlocks = JSON.parse(localStorage.getItem("contributions")) || [];
  storedBlocks.push(newBlock);
  localStorage.setItem("contributions", JSON.stringify(storedBlocks));

  document.getElementById("saveStatus").innerText = "✅ Block saved locally! Submit to maintainer for approval.";
});

loadPuzzles();
