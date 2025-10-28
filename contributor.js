// contributor.js
const TANTRAYUKTIS = [
  "Athikranthavekshana","Atidesha","Adhikarana","Anagatavekshana","Anumat","Apadesha","Apavarga","Arthaapatti",
  "Uttarpaksha","Uddesha","Uddhaara","Upadesha","Upamaana","Uuhaya","Ekaanta","Drishtaanta",
  "Nidarshana","Niyoga","Nirnaya","Nirdesha","Nirvachana","Nekanta","Padartha","Purvapaksha",
  "Pratyutsaara","Pradesha","Prayojana","Prasanga","Yoga","VaakyasheSha","Vikalpa","Vidhana",
  "Viparya","Vyaakhyaana","Sanshaya","Samuchchaya","Sambhava","Swasangyaa","Hetvartha"
];

// populate tantrayukti select
const tanSelect = document.getElementById('tantrayuktiSelect');
TANTRAYUKTIS.forEach(t => {
  const opt = document.createElement('option'); opt.value = t; opt.innerText = t;
  tanSelect.appendChild(opt);
});

const form = document.getElementById('contribForm');
const myContribsDiv = document.getElementById('myContribs');
const downloadBtn = document.getElementById('downloadBtn');
const closeBtn = document.getElementById('closeBtn');

closeBtn.onclick = () => window.close();

// load existing local contributions
function loadMyContribs() {
  const arr = JSON.parse(localStorage.getItem('tq_contrib_blocks') || '[]');
  const myIds = JSON.parse(localStorage.getItem('tq_my_ids') || '[]'); // ids created from this browser
  // show only those created on this browser (myIds)
  const mine = arr.filter(item => myIds.includes(item._id));
  myContribsDiv.innerHTML = '';
  if (!mine.length) {
    myContribsDiv.innerHTML = '<div class="muted">No contributions saved locally from this browser.</div>';
    return;
  }
  mine.forEach(item => {
    const el = document.createElement('div'); el.className = 'contribution-item';
    const left = document.createElement('div');
    left.innerHTML = `<strong>${item.concept || item.tantrayukti || 'Untitled'}</strong><br/><small>${item.missingPart}</small>`;
    const right = document.createElement('div');
    const editBtn = document.createElement('button'); editBtn.innerText = 'Edit';
    const delBtn = document.createElement('button'); delBtn.innerText = 'Delete';
    editBtn.onclick = () => fillFormForEdit(item._id);
    delBtn.onclick = () => deleteContribution(item._id);
    right.appendChild(editBtn); right.appendChild(delBtn);
    el.appendChild(left); el.appendChild(right);
    myContribsDiv.appendChild(el);
  });
}

function saveLocalContribution(obj, editingId=null) {
  const all = JSON.parse(localStorage.getItem('tq_contrib_blocks') || '[]');
  if (editingId) {
    // replace existing
    const idx = all.findIndex(it => it._id === editingId);
    if (idx !== -1) all[idx] = obj;
    else all.push(obj);
  } else {
    all.push(obj);
    // track id as belonging to this browser
    const myIds = JSON.parse(localStorage.getItem('tq_my_ids') || '[]');
    myIds.push(obj._id);
    localStorage.setItem('tq_my_ids', JSON.stringify(myIds));
  }
  localStorage.setItem('tq_contrib_blocks', JSON.stringify(all));
  document.getElementById('formMsg').innerText = 'Saved locally. It will appear in the main game for this browser.';
  loadMyContribs();
  // notify opener so it can reload puzzles
  if (window.opener && !window.opener.closed) {
    try { window.opener.location.reload(); } catch(e) {}
  }
}

function deleteContribution(id) {
  if (!confirm('Delete this contribution?')) return;
  let all = JSON.parse(localStorage.getItem('tq_contrib_blocks') || '[]');
  all = all.filter(it => it._id !== id);
  localStorage.setItem('tq_contrib_blocks', JSON.stringify(all));
  // also remove from my_ids
  let myIds = JSON.parse(localStorage.getItem('tq_my_ids') || '[]');
  myIds = myIds.filter(i => i !== id);
  localStorage.setItem('tq_my_ids', JSON.stringify(myIds));
  loadMyContribs();
  document.getElementById('formMsg').innerText = 'Deleted.';
  if (window.opener && !window.opener.closed) {
    try { window.opener.location.reload(); } catch(e) {}
  }
}

function generateId() {
  return 'c_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
}

function getFormData(editingId=null) {
  const name = document.getElementById('contribName').value.trim();
  const email = document.getElementById('contribEmail').value.trim();
  const concept = document.getElementById('concept').value.trim();
  const context = document.getElementById('context').value.trim();
  const pratijna = document.getElementById('pratijna').value.trim();
  const hetu = document.getElementById('hetu').value.trim();
  const udaharana = document.getElementById('udaharana').value.trim();
  const upanaya = document.getElementById('upanaya').value.trim();
  const nigamana = document.getElementById('nigamana').value.trim();
  const missingPart = document.getElementById('missingPart').value;
  const tan = document.getElementById('tantrayuktiSelect').value;
  const clueExp = document.getElementById('clueExp').value;
  const opt1 = document.getElementById('opt1').value.trim();
  const opt2 = document.getElementById('opt2').value.trim();
  const opt3 = document.getElementById('opt3').value.trim();
  const opt4 = document.getElementById('opt4').value.trim();
  const correctIdx = Number(document.getElementById('correctIdx').value);
  const opts = [opt1, opt2, opt3];
  if (opt4) opts.push(opt4);

  if (!name || !email || !concept || !missingPart || !tan || !opt1 || !opt2 || !opt3 || !correctIdx) {
    return { error: 'Please fill mandatory fields (name, email, concept, missing part, options and correct index).' };
  }

  const obj = {
    _id: editingId || generateId(),
    contributorName: name,
    contributorEmail: email,
    concept, context,
    pratijna, hetu, udaharana, upanaya, nigamana,
    missingPart, tantrayukti: tan, clueExplanation: clueExp,
    options: opts,
    correctOptionIndex: correctIdx,
    createdAt: new Date().toISOString()
  };
  return { obj };
}

form.onsubmit = (e) => {
  e.preventDefault();
  const editingId = form.dataset.editing || null;
  const res = getFormData(editingId);
  if (res.error) {
    document.getElementById('formMsg').innerText = res.error;
    return;
  }
  saveLocalContribution(res.obj, editingId);
  form.reset();
  form.dataset.editing = '';
};

document.getElementById('clearBtn').onclick = () => {
  form.reset();
  form.dataset.editing = '';
  document.getElementById('formMsg').innerText = '';
};

// download contributions (all local blocks)
downloadBtn.onclick = () => {
  const all = JSON.parse(localStorage.getItem('tq_contrib_blocks') || '[]');
  const blob = new Blob([JSON.stringify(all, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'tantraquest_contributions.json'; a.click();
  URL.revokeObjectURL(url);
};

// fill form for edit by id
function fillFormForEdit(id) {
  const all = JSON.parse(localStorage.getItem('tq_contrib_blocks') || '[]');
  const it = all.find(x=>x._id===id);
  if (!it) return alert('Contribution not found.');
  document.getElementById('contribName').value = it.contributorName || '';
  document.getElementById('contribEmail').value = it.contributorEmail || '';
  document.getElementById('concept').value = it.concept || '';
  document.getElementById('context').value = it.context || '';
  document.getElementById('pratijna').value = it.pratijna || '';
  document.getElementById('hetu').value = it.hetu || '';
  document.getElementById('udaharana').value = it.udaharana || '';
  document.getElementById('upanaya').value = it.upanaya || '';
  document.getElementById('nigamana').value = it.nigamana || '';
  document.getElementById('missingPart').value = it.missingPart || '';
  document.getElementById('tantrayuktiSelect').value = it.tantrayukti || '';
  document.getElementById('clueExp').value = it.clueExplanation || '';
  document.getElementById('opt1').value = it.options[0] || '';
  document.getElementById('opt2').value = it.options[1] || '';
  document.getElementById('opt3').value = it.options[2] || '';
  document.getElementById('opt4').value = it.options[3] || '';
  document.getElementById('correctIdx').value = it.correctOptionIndex || 1;
  form.dataset.editing = id;
  window.scrollTo(0,0);
}

window.onload = () => {
  // populate tantrayuktiSelect (already done above)
  // load my contributions made from this browser
  loadMyContribs();
};
