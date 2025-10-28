// script.js — main puzzle behavior
let puzzles = [];
let currentIndex = 0;
let score = Number(localStorage.getItem('tq_score') || 0);

const nyayaParts = ['pratijna','hetu','udaharana','upanaya','nigamana'];

document.getElementById('score').innerText = score;
document.getElementById('contributeBtn').addEventListener('click', () => {
  window.open('contributor.html', '_blank', 'width=900,height=800');
});
document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});
document.getElementById('nextBtn').addEventListener('click', nextPuzzle);
document.getElementById('prevBtn').addEventListener('click', prevPuzzle);
document.getElementById('exportContribBtn').addEventListener('click', exportLocalContribs);

async function loadBase() {
  try {
    const res = await fetch('data/blocks.json');
    const base = await res.json();
    // load local contributions from localStorage and append
    const local = JSON.parse(localStorage.getItem('tq_contrib_blocks') || '[]');
    puzzles = base.concat(local);
    renderCurrent();
  } catch (err) {
    console.error("Failed to load blocks.json", err);
    puzzles = JSON.parse(localStorage.getItem('tq_contrib_blocks') || '[]');
    renderCurrent();
  }
}

function renderCurrent() {
  if (!puzzles.length) {
    document.getElementById('conceptTitle').innerText = 'No puzzles found';
    return;
  }
  const p = puzzles[currentIndex];
  document.getElementById('conceptTitle').innerText = p.concept || p.tantrayukti || 'Untitled';
  // place texts; if a part matches missing, hide it
  nyayaParts.forEach(part => {
    const el = document.getElementById(part + 'Text');
    const text = p[part] || ''; // JSON schema supports these keys
    if (p.missingPart === part) {
      el.innerText = ''; // hide missing text until correct identification + answer
      el.dataset.hidden = 'true';
    } else {
      el.innerText = text;
      el.dataset.hidden = 'false';
    }
  });

  // clue
  document.getElementById('tantrayuktiClue').innerText = p.tantrayukti || p.tantrayuktiClue || '';
  document.getElementById('clueExplanation').innerText = p.clueExplanation || '';

  // reset UI
  document.getElementById('missingSelect').value = '';
  document.getElementById('resultMessage').innerText = '';
  populateOptions(p);
}

function populateOptions(p) {
  const container = document.getElementById('optionsContainer');
  container.innerHTML = '';
  p.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.innerText = opt;
    btn.dataset.idx = idx+1;
    btn.onclick = () => onOptionClick(opt, idx+1);
    btn.disabled = true; // initially disabled until correct part identified
    container.appendChild(btn);
  });

  // enable only after selecting missing part; wire the select listener
  const select = document.getElementById('missingSelect');
  select.onchange = () => {
    const selected = select.value;
    if (!selected) {
      disableOptions();
      return;
    }
    // if correct missing part selected, enable options
    const correctPart = puzzles[currentIndex].missingPart;
    if (selected === correctPart) {
      enableOptions();
      setMessage("Correct missing part identified — now choose the right statement.");
    } else {
      disableOptions();
      setMessage("That's not the missing part. Use the Tantrayukti clue to help.");
    }
  };
}

function enableOptions() {
  const buttons = document.querySelectorAll('#optionsContainer button');
  buttons.forEach(b => b.disabled = false);
}
function disableOptions() {
  const buttons = document.querySelectorAll('#optionsContainer button');
  buttons.forEach(b => b.disabled = true);
}

function onOptionClick(optionText, optionIdx) {
  const p = puzzles[currentIndex];
  // require the missingSelect to be correct
  const selectedPart = document.getElementById('missingSelect').value;
  if (!selectedPart) {
    setMessage("First identify which Nyāya part is missing.");
    return;
  }
  if (selectedPart !== p.missingPart) {
    setMessage("You must first correctly identify the missing part.");
    return;
  }
  // check correctness
  const correctIdx = Number(p.correctOptionIndex || p.correctIndex || p.correctOption) || 1;
  if (optionIdx === correctIdx) {
    // reveal the missing text into the appropriate element
    const targetEl = document.getElementById(p.missingPart + 'Text');
    const missingText = p[p.missingPart] || p.answer || p.correctText || '';
    targetEl.innerText = missingText;
    targetEl.dataset.hidden = 'false';
    setMessage("✅ Correct! The missing part has been revealed.");
    score += 10;
    localStorage.setItem('tq_score', score);
    document.getElementById('score').innerText = score;
    // briefly disable options and allow next
    disableOptions();
  } else {
    setMessage("❌ Not correct. Try again or re-check the Tantrayukti clue.");
  }
}

function setMessage(msg) {
  document.getElementById('resultMessage').innerText = msg;
}

function nextPuzzle() {
  currentIndex = (currentIndex + 1) % puzzles.length;
  renderCurrent();
}
function prevPuzzle() {
  currentIndex = (currentIndex - 1 + puzzles.length) % puzzles.length;
  renderCurrent();
}

// export local contributions created from this browser
function exportLocalContribs() {
  const local = JSON.parse(localStorage.getItem('tq_contrib_blocks') || '[]');
  if (!local.length) {
    alert("You have no local contributions saved in this browser.");
    return;
  }
  const blob = new Blob([JSON.stringify(local, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'tantraquest_local_contributions.json';
  a.click();
  URL.revokeObjectURL(url);
}

// initialize
loadBase();
