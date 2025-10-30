// script.js — main puzzle behavior
let puzzles = [];
let currentIndex = 0;
let score = Number(localStorage.getItem('tq_score') || 0);

const nyayaParts = ['pratijna','hetu','udaharana','upanaya','nigamana'];

document.getElementById('score').innerText = score;
document.getElementById('contributeBtn').addEventListener('click', () => {
  window.location.href = 'templates/contributor.html';
});
document.getElementById('nextBtn').addEventListener('click', nextPuzzle);
document.getElementById('prevBtn').addEventListener('click', prevPuzzle);
document.getElementById('exportContribBtn').addEventListener('click', exportLocalContribs);

// Dark Mode functionality
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  }
}

function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  const isDark = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

document.getElementById('themeToggle').addEventListener('click', toggleTheme);

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
  // Set question number
  document.getElementById('questionNumber').innerText = `Question ${currentIndex+1} of ${puzzles.length}`;
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
  const resultEl = document.getElementById('resultMessage');
  resultEl.innerText = '';
  resultEl.className = 'result mt-6 p-4 rounded-lg text-center font-semibold text-sm hidden';
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
    btn.className = 'w-full text-left px-5 py-4 rounded-xl border-2 border-sand-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-sand-50 dark:hover:bg-slate-600 hover:border-terracotta-400 dark:hover:border-terracotta-500 transition-all font-medium text-sand-900 dark:text-sand-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-700 disabled:hover:border-sand-300 dark:disabled:hover:border-slate-600';
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
      setMessage("✅ Correct missing part identified — now choose the right statement.", "success");
    } else {
      disableOptions();
      setMessage("❌ That's not the missing part. Use the Tantrayukti clue to help.", "error");
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
    setMessage("⚠️ First identify which Nyāya part is missing.", "warning");
    return;
  }
  if (selectedPart !== p.missingPart) {
    setMessage("⚠️ You must first correctly identify the missing part.", "warning");
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
    setMessage("✅ Excellent! The missing part has been revealed. You earned 10 points!", "success");
    score += 10;
    localStorage.setItem('tq_score', score);
    document.getElementById('score').innerText = score;
    // briefly disable options and allow next
    disableOptions();
  } else {
    setMessage("❌ Not correct. Try again or re-check the Tantrayukti clue.", "error");
  }
}

function setMessage(msg, type) {
  const el = document.getElementById('resultMessage');
  el.innerText = msg;
  el.classList.remove('hidden');
  
  // Reset classes
  el.className = 'result mt-6 p-4 rounded-lg text-center font-semibold text-sm';
  
  // Add type-specific classes
  if (type === 'success') {
    el.className += ' bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-green-800 dark:text-green-200';
  } else if (type === 'error') {
    el.className += ' bg-red-100 dark:bg-red-900/30 border-2 border-red-500 text-red-800 dark:text-red-200';
  } else if (type === 'warning') {
    el.className += ' bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-500 text-amber-800 dark:text-amber-200';
  } else {
    el.className += ' bg-sand-100 dark:bg-sand-800/30 border-2 border-sand-500 text-sand-800 dark:text-sand-200';
  }
}

function nextPuzzle() {
  // Before incrementing, store puzzle count so result.html can display accurate percent
  localStorage.setItem('tq_puzzle_count', puzzles.length);
  
  // If this is the last puzzle, go to result.html
  if (currentIndex === puzzles.length - 1) {
    window.location.href = 'templates/result.html';
    return;
  }
  currentIndex++;
  renderCurrent();
}
function prevPuzzle() {
  // Stay on the first question, don't wrap
  if (currentIndex === 0) return;
  currentIndex--;
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
initTheme();
loadBase();