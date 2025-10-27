let data;
fetch("data/blocks.json")
  .then((res) => res.json())
  .then((json) => { data = json; loadBlock(); });
let currentBlock = 0;
function loadBlock() {
  const block = data[currentBlock];
  document.getElementById("concept-title").innerText = "Concept: " + block.concept;
  document.getElementById("syllogism").innerHTML = block.syllogism.join("<br>");
  document.getElementById("clue").innerText = "Clue (Tantrayukti): " + block.tantrayukti;
  const choicesDiv = document.getElementById("choices");
  choicesDiv.innerHTML = "";
  block.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => selectAnswer(opt);
    choicesDiv.appendChild(btn);
  });
}
function selectAnswer(selected) {
  const block = data[currentBlock];
  const feedback = document.getElementById("feedback");
  if (selected === block.correct) {
    feedback.innerText = "✅ Correct! You applied " + block.tantrayukti + " perfectly.";
  } else {
    feedback.innerText = "❌ Not quite. Think how " + block.tantrayukti + " operates here.";
  }
  currentBlock = (currentBlock + 1) % data.length;
  setTimeout(() => { feedback.innerText = ""; loadBlock(); }, 2500);
}