/* ============================================================
   ¡Adelante! — Spanish trainer
   Views: home · lesson · practice (topic quiz / drill / placement) · results
   ============================================================ */

const STORE_KEY = 'adelante-state-v1';

const state = load() || {
  level: null,          // null until chosen or placed
  xp: 0,
  streak: 0,            // best answer streak
  stats: {},            // `${level}:${topic}` -> { attempts, correct, recent: [] }
  placed: false,
};

function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)); } catch { return null; }
}
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {}
}

/* ---------- helpers ---------- */

const $ = (sel) => document.querySelector(sel);

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}

function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function levelById(id) { return LEVELS.find((l) => l.id === id); }
function topicById(id) { return TOPICS.find((t) => t.id === id); }

function statKey(level, topic) { return `${level}:${topic}`; }
function getStats(level, topic) {
  const k = statKey(level, topic);
  if (!state.stats[k]) state.stats[k] = { attempts: 0, correct: 0, recent: [] };
  return state.stats[k];
}

function recordAnswer(level, topic, ok) {
  const s = getStats(level, topic);
  s.attempts++;
  if (ok) s.correct++;
  s.recent.push(ok ? 1 : 0);
  if (s.recent.length > 10) s.recent.shift();
  if (ok) {
    state.xp += 10;
    state.streak++;
  } else {
    state.streak = 0;
  }
  save();
}

function recentAccuracy(level, topic) {
  const s = getStats(level, topic);
  if (s.recent.length === 0) return null;
  return s.recent.reduce((a, b) => a + b, 0) / s.recent.length;
}

/* ---------- conjugation drill generator ---------- */

function conjugateRegular(inf, tense, person) {
  const type = inf.slice(-2); // ar/er/ir
  const stem = inf.slice(0, -2);
  if (tense === 'future' || tense === 'conditional') {
    return inf + REGULAR_ENDINGS[tense].all[person];
  }
  return stem + REGULAR_ENDINGS[tense][type][person];
}

function conjugate(verb, tense, person) {
  if (verb.forms) {
    if (verb.forms[tense]) return verb.forms[tense][person];
    if (tense === 'future' || tense === 'conditional') {
      const stem = verb.stem || verb.inf;
      return stem + REGULAR_ENDINGS[tense].all[person];
    }
    // imperfect for stem-changers like tener/hacer/poder/estar is regular
    return conjugateRegular(verb.inf, tense, person);
  }
  return conjugateRegular(verb.inf, tense, person);
}

function makeDrillQuestion(levelId) {
  const tenses = LEVEL_TENSES[levelId];
  const tense = tenses[Math.floor(Math.random() * tenses.length)];
  // A1 sticks to regular verbs + ser/estar; higher levels mix in irregulars
  const pool = levelId === 'a1'
    ? REGULAR_VERBS.concat(IRREGULAR_VERBS.slice(0, 2))
    : REGULAR_VERBS.concat(IRREGULAR_VERBS);
  const verb = pool[Math.floor(Math.random() * pool.length)];
  const person = Math.floor(Math.random() * 6);
  const answer = conjugate(verb, tense, person);
  const info = TENSE_INFO[tense];
  return {
    t: 'type',
    q: `${PERSONS[person].label} ___ — <b>${verb.inf}</b> (${verb.en}), ${info.name} (${info.en})`,
    a: [answer],
    exp: `${PERSONS[person].label} + ${verb.inf} in the ${info.en}: ${answer}.`,
  };
}

function makeDrillSet(levelId, n) {
  const out = [];
  const seen = new Set();
  let guard = 0;
  while (out.length < n && guard++ < 200) {
    const q = makeDrillQuestion(levelId);
    const key = q.q;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}

/* ---------- placement test ---------- */

function makePlacementSet() {
  const qs = [];
  for (const lvl of LEVELS) {
    for (const topic of TOPICS) {
      const [ex] = sample(EXERCISES[lvl.id][topic.id], 1);
      qs.push({ ...ex, _level: lvl.id });
    }
  }
  return qs; // 15 questions, 3 per level, ascending
}

function placementResult(answers) {
  // answers: [{level, ok}]
  const byLevel = {};
  for (const a of answers) {
    byLevel[a.level] = byLevel[a.level] || { ok: 0, total: 0 };
    byLevel[a.level].total++;
    if (a.ok) byLevel[a.level].ok++;
  }
  let placed = LEVELS[0].id;
  for (const lvl of LEVELS) {
    const r = byLevel[lvl.id];
    if (r && r.ok / r.total >= 0.5) placed = lvl.id;
    else break;
  }
  return placed;
}

/* ---------- session state ---------- */

let session = null; // { mode, level, topic, questions, index, correct, answers, revealed }

function startSession(mode, levelId, topicId) {
  let questions;
  if (mode === 'placement') {
    questions = makePlacementSet();
  } else if (mode === 'drill') {
    questions = makeDrillSet(levelId, 10);
  } else {
    questions = sample(EXERCISES[levelId][topicId], 8);
  }
  session = {
    mode, level: levelId, topic: topicId,
    questions, index: 0, correct: 0, answers: [], revealed: false,
  };
  renderPractice();
}

/* ---------- rendering ---------- */

function show(viewId) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  $(viewId).classList.add('active');
  window.scrollTo(0, 0);
}

function renderHeader() {
  $('#xp').textContent = state.xp;
  $('#streak').textContent = state.streak;
  const lvl = state.level ? levelById(state.level) : null;
  $('#current-level').textContent = lvl ? `${lvl.cefr} · ${lvl.name}` : 'No level set';
}

function renderHome() {
  renderHeader();

  // Level picker
  const picker = $('#level-picker');
  picker.innerHTML = LEVELS.map((l) => `
    <button class="level-chip ${state.level === l.id ? 'selected' : ''}" data-level="${l.id}"
            title="${esc(l.desc)}">
      <span class="chip-cefr">${l.cefr}</span>
      <span class="chip-name">${l.name}</span>
      <span class="chip-duo">${l.duo}</span>
    </button>`).join('');
  picker.querySelectorAll('.level-chip').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.level = btn.dataset.level;
      state.placed = true;
      save();
      renderHome();
    });
  });

  // Topic cards
  const cards = $('#topic-cards');
  if (!state.level) {
    cards.innerHTML = `<p class="hint">Pick your level above — or take the placement quiz —
      and the lessons and exercises will match it.</p>`;
  } else {
    const lvl = levelById(state.level);
    cards.innerHTML = TOPICS.map((t) => {
      const acc = recentAccuracy(state.level, t.id);
      const s = getStats(state.level, t.id);
      const accTxt = acc === null ? 'Not practiced yet'
        : `Recent accuracy: ${Math.round(acc * 100)}% (${s.correct}/${s.attempts} all time)`;
      const pct = acc === null ? 0 : Math.round(acc * 100);
      return `
      <div class="card topic-card">
        <div class="topic-head"><span class="topic-icon">${t.icon}</span>
          <h3>${t.name}</h3></div>
        <p class="topic-level-desc">${esc(lvl.cefr)}: ${esc(TOPIC_LEVEL_DESC[state.level][t.id])}</p>
        <div class="progress-track" role="img" aria-label="${esc(accTxt)}">
          <div class="progress-fill" style="width:${pct}%"></div>
        </div>
        <p class="acc-text">${accTxt}</p>
        <div class="card-actions">
          <button class="btn ghost" data-lesson="${t.id}">📖 Lesson</button>
          <button class="btn primary" data-practice="${t.id}">✏️ Practice</button>
        </div>
      </div>`;
    }).join('') + `
      <div class="card topic-card drill-card">
        <div class="topic-head"><span class="topic-icon">🔥</span><h3>Conjugation Drill</h3></div>
        <p class="topic-level-desc">Unlimited generated questions across every tense unlocked at
          ${esc(lvl.cefr)}: ${LEVEL_TENSES[state.level].map((t) => TENSE_INFO[t].en).join(', ')}.</p>
        <div class="card-actions">
          <button class="btn primary" data-drill="1">⚡ Start drill</button>
        </div>
      </div>`;

    cards.querySelectorAll('[data-lesson]').forEach((b) =>
      b.addEventListener('click', () => renderLesson(state.level, b.dataset.lesson)));
    cards.querySelectorAll('[data-practice]').forEach((b) =>
      b.addEventListener('click', () => startSession('quiz', state.level, b.dataset.practice)));
    const drillBtn = cards.querySelector('[data-drill]');
    if (drillBtn) drillBtn.addEventListener('click', () => startSession('drill', state.level, null));
  }

  show('#view-home');
}

function renderLesson(levelId, topicId) {
  const lvl = levelById(levelId);
  const topic = topicById(topicId);
  $('#lesson-title').textContent = `${topic.icon} ${topic.name} — ${lvl.cefr} ${lvl.name}`;
  $('#lesson-body').innerHTML = LESSONS[levelId][topicId];
  $('#lesson-practice-btn').onclick = () => startSession('quiz', levelId, topicId);
  show('#view-lesson');
}

const ACCENT_CHARS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü'];

function renderPractice() {
  const s = session;
  const q = s.questions[s.index];
  const total = s.questions.length;

  let title;
  if (s.mode === 'placement') title = '🧭 Placement quiz';
  else if (s.mode === 'drill') title = `🔥 Conjugation drill — ${levelById(s.level).cefr}`;
  else title = `${topicById(s.topic).icon} ${topicById(s.topic).name} — ${levelById(s.level).cefr}`;
  $('#practice-title').textContent = title;
  $('#practice-progress').textContent = `${s.index + 1} / ${total}`;
  $('#practice-bar').style.width = `${(s.index / total) * 100}%`;

  const box = $('#question-box');
  if (q.t === 'mc') {
    box.innerHTML = `
      <p class="question">${q.q}</p>
      <div class="choices">
        ${q.c.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}
      </div>
      <div id="feedback"></div>`;
    box.querySelectorAll('.choice').forEach((btn) => {
      btn.addEventListener('click', () => answerMC(parseInt(btn.dataset.i, 10)));
    });
  } else {
    box.innerHTML = `
      <p class="question">${q.q}</p>
      <div class="type-row">
        <input id="type-input" type="text" autocomplete="off" autocapitalize="off"
               spellcheck="false" placeholder="Type your answer…" aria-label="Your answer">
        <button class="btn primary" id="type-submit">Check</button>
      </div>
      <div class="accent-row">
        ${ACCENT_CHARS.map((ch) => `<button class="accent-btn" data-ch="${ch}">${ch}</button>`).join('')}
      </div>
      <div id="feedback"></div>`;
    const input = $('#type-input');
    input.focus();
    box.querySelectorAll('.accent-btn').forEach((b) => {
      b.addEventListener('click', () => {
        input.value += b.dataset.ch;
        input.focus();
      });
    });
    $('#type-submit').addEventListener('click', answerType);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') answerType();
    });
  }

  $('#next-btn').classList.add('hidden');
  show('#view-practice');
}

function answerMC(i) {
  const s = session;
  if (s.revealed) return;
  const q = s.questions[s.index];
  const ok = i === q.a;
  document.querySelectorAll('.choice').forEach((btn, j) => {
    btn.disabled = true;
    if (j === q.a) btn.classList.add('correct');
    if (j === i && !ok) btn.classList.add('wrong');
  });
  finishAnswer(ok, q, null);
}

function answerType() {
  const s = session;
  if (s.revealed) return;
  const q = s.questions[s.index];
  const raw = $('#type-input').value.trim().toLowerCase();
  if (!raw) return;
  const answers = q.a.map((a) => a.toLowerCase());
  const ok = answers.includes(raw);
  const accentMiss = !ok && answers.some((a) => stripAccents(a) === stripAccents(raw));
  $('#type-input').disabled = true;
  $('#type-submit').disabled = true;
  finishAnswer(ok, q, accentMiss);
}

function finishAnswer(ok, q, accentMiss) {
  const s = session;
  s.revealed = true;
  s.answers.push({ level: q._level || s.level, ok });
  if (ok) s.correct++;

  if (s.mode !== 'placement') {
    // Drill results count toward the tenses topic
    recordAnswer(s.level, s.mode === 'drill' ? 'tenses' : s.topic, ok);
    renderHeader();
  }

  const fb = $('#feedback');
  const answerTxt = q.t === 'mc' ? q.c[q.a] : q.a[0];
  let msg;
  if (ok) {
    msg = `<div class="fb ok">✅ <b>¡Correcto!</b> ${esc(q.exp || '')}</div>`;
  } else if (accentMiss) {
    msg = `<div class="fb almost">🟡 <b>So close — check the accents.</b>
      The answer is <b>${esc(answerTxt)}</b>. ${esc(q.exp || '')}</div>`;
  } else {
    msg = `<div class="fb bad">❌ The answer is <b>${esc(answerTxt)}</b>. ${esc(q.exp || '')}</div>`;
  }
  fb.innerHTML = msg;

  const nextBtn = $('#next-btn');
  nextBtn.textContent = s.index + 1 < s.questions.length ? 'Next →' : 'See results';
  nextBtn.classList.remove('hidden');
  nextBtn.focus();
}

function nextQuestion() {
  const s = session;
  s.index++;
  s.revealed = false;
  if (s.index < s.questions.length) {
    renderPractice();
  } else {
    renderResults();
  }
}

function renderResults() {
  const s = session;
  const pct = Math.round((s.correct / s.questions.length) * 100);
  let headline, sub = '', actions = '';

  if (s.mode === 'placement') {
    const placed = placementResult(s.answers);
    state.level = placed;
    state.placed = true;
    save();
    const lvl = levelById(placed);
    headline = `Your level: ${lvl.cefr} — ${lvl.name}`;
    sub = `That's roughly <b>${esc(lvl.duo)}</b>. You got ${s.correct}/${s.questions.length}
      across all five levels. Lessons and practice are now tuned to ${lvl.cefr} —
      you can change it any time from the home screen.`;
  } else {
    headline = pct >= 80 ? `¡Excelente! ${pct}%` : pct >= 50 ? `¡Bien hecho! ${pct}%` : `Keep going — ${pct}%`;
    sub = `You got ${s.correct} of ${s.questions.length}.`;

    // Adaptive suggestion based on recent rolling accuracy
    const topic = s.mode === 'drill' ? 'tenses' : s.topic;
    const acc = recentAccuracy(s.level, topic);
    const idx = LEVELS.findIndex((l) => l.id === s.level);
    if (acc !== null && getStats(s.level, topic).recent.length >= 8) {
      if (acc >= 0.85 && idx < LEVELS.length - 1) {
        const up = LEVELS[idx + 1];
        sub += ` You're cruising at ${Math.round(acc * 100)}% here — ready to try
          <b>${up.cefr} ${up.name}</b>?`;
        actions = `<button class="btn primary" id="level-up-btn">⬆️ Move up to ${up.cefr}</button>`;
      } else if (acc <= 0.5 && idx > 0) {
        const down = LEVELS[idx - 1];
        sub += ` This one's putting up a fight. A round at <b>${down.cefr} ${down.name}</b>
          could rebuild the foundations.`;
        actions = `<button class="btn ghost" id="level-down-btn">⬇️ Review at ${down.cefr}</button>`;
      }
    }
  }

  renderHeader();
  $('#results-headline').textContent = headline;
  $('#results-sub').innerHTML = sub;
  $('#results-adaptive').innerHTML = actions;

  const upBtn = $('#level-up-btn');
  if (upBtn) upBtn.addEventListener('click', () => {
    state.level = LEVELS[LEVELS.findIndex((l) => l.id === state.level) + 1].id;
    save(); renderHome();
  });
  const downBtn = $('#level-down-btn');
  if (downBtn) downBtn.addEventListener('click', () => {
    state.level = LEVELS[LEVELS.findIndex((l) => l.id === state.level) - 1].id;
    save(); renderHome();
  });

  const againBtn = $('#again-btn');
  if (s.mode === 'placement') {
    againBtn.textContent = '🏠 Start learning';
    againBtn.onclick = () => renderHome();
  } else {
    againBtn.textContent = '🔁 Practice again';
    againBtn.onclick = () => startSession(s.mode, state.level, s.topic);
  }

  show('#view-results');
}

/* ---------- wiring ---------- */

document.addEventListener('DOMContentLoaded', () => {
  $('#next-btn').addEventListener('click', nextQuestion);
  $('#placement-btn').addEventListener('click', () => startSession('placement', null, null));
  document.querySelectorAll('.home-link').forEach((b) =>
    b.addEventListener('click', renderHome));
  $('#reset-btn').addEventListener('click', () => {
    if (confirm('Reset all progress (XP, streak, level, stats)?')) {
      localStorage.removeItem(STORE_KEY);
      location.reload();
    }
  });
  renderHome();
});
