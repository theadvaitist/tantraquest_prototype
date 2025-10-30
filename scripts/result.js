// result.js — Results page logic
window.addEventListener('DOMContentLoaded', () => {
  const score = Number(localStorage.getItem('tq_score') || 0);
  // Check if we stored number of questions (for flexibility), fallback to 8
  const puzzleCount = Number(localStorage.getItem('tq_puzzle_count') || 8);
  const maxScore = puzzleCount * 10;
  const percent = Math.round((score / maxScore) * 100);

  document.getElementById('scoreSummary').innerHTML =
    `<div class="text-4xl font-extrabold mb-2">${percent}%</div>
     <div class="text-lg font-medium mb-2">You scored <span class="text-terracotta-600 dark:text-terracotta-300">${score}</span> / ${maxScore} points</div>`;

  let encourage = '';
  if (percent >= 90) encourage = "🌟 Excellent!";
  else if (percent >= 70) encourage = "🎉 Well Done!";
  else if (percent >= 50) encourage = "👏 Good Attempt!";
  else encourage = "Keep practicing!";
  document.getElementById('encourageMsg').textContent = encourage;

  document.getElementById('restartBtn').addEventListener('click', () => {
    localStorage.setItem('tq_score', 0);
    // Optionally can clear more progress here
    window.location.href = '../index.html';
  });
});