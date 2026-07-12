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

/* ---------- review queue (spaced repetition of missed questions) ----------
   Leitner-lite: a miss lands in box 0 (due immediately). Answering it
   correctly in review promotes it: box 1 → due in 1 day, box 2 → due in
   3 days, box 3 → mastered (removed). A miss in review resets to box 0. */

const REVIEW_MAX = 100;
const DAY_MS = 24 * 60 * 60 * 1000;

function reviewQueue() {
  if (!state.review) state.review = [];
  return state.review;
}

function reviewDue() {
  return reviewQueue().filter((r) => r.due <= Date.now());
}

function addToReview(levelId, topicId, q) {
  const queue = reviewQueue();
  const existing = queue.find((r) => r.q.q === q.q);
  if (existing) {
    existing.box = 0;
    existing.due = Date.now();
  } else {
    const { _topic, _level, ...clean } = q;
    queue.push({ level: levelId, topic: topicId, box: 0, due: Date.now(), q: clean });
    if (queue.length > REVIEW_MAX) queue.shift();
  }
  save();
}

function updateReviewEntry(q, ok) {
  const queue = reviewQueue();
  const entry = queue.find((r) => r.q.q === q.q);
  if (!entry) return;
  if (ok) {
    entry.box++;
    if (entry.box >= 3) {
      state.review = queue.filter((r) => r !== entry); // mastered
    } else {
      entry.due = Date.now() + (entry.box === 1 ? 1 : 3) * DAY_MS;
    }
  } else {
    entry.box = 0;
    entry.due = Date.now();
  }
  save();
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

/* Weak-forms tracking: verb×tense combos you miss get drilled more often.
   Weights rise on a miss (max 5) and fall on a hit; at 0 the combo returns
   to the normal random rotation. */

function drillWeights() {
  if (!state.drillWeak) state.drillWeak = {};
  return state.drillWeak;
}

function updateDrillWeak(key, ok) {
  const w = drillWeights();
  if (ok) {
    if (w[key]) {
      w[key]--;
      if (w[key] <= 0) delete w[key];
    }
  } else {
    w[key] = Math.min(5, (w[key] || 0) + 1);
  }
  save();
}

function weightedPick(keys, weights) {
  const total = keys.reduce((sum, k) => sum + weights[k], 0);
  let r = Math.random() * total;
  for (const k of keys) {
    r -= weights[k];
    if (r <= 0) return k;
  }
  return keys[keys.length - 1];
}

function makeDrillQuestion(levelId) {
  const tenses = LEVEL_TENSES[levelId];
  // A1 sticks to regular verbs + ser/estar; higher levels mix in irregulars
  const pool = levelId === 'a1'
    ? REGULAR_VERBS.concat(IRREGULAR_VERBS.slice(0, 2))
    : REGULAR_VERBS.concat(IRREGULAR_VERBS);

  // ~40% of questions revisit a weak verb×tense combo, weighted by miss count
  let verb, tense;
  const w = drillWeights();
  const weakKeys = Object.keys(w).filter((k) => {
    const [inf, t] = k.split('|');
    return tenses.includes(t) && pool.some((v) => v.inf === inf);
  });
  if (weakKeys.length > 0 && Math.random() < 0.4) {
    const [inf, t] = weightedPick(weakKeys, w).split('|');
    verb = pool.find((v) => v.inf === inf);
    tense = t;
  } else {
    tense = tenses[Math.floor(Math.random() * tenses.length)];
    verb = pool[Math.floor(Math.random() * pool.length)];
  }

  const person = Math.floor(Math.random() * 6);
  const answer = conjugate(verb, tense, person);
  const info = TENSE_INFO[tense];
  const frame = pick(DRILL_FRAMES[tense]);
  const comp = pick(VERB_COMPS[verb.inf]);
  const subject = pick(PERSON_DISPLAY[person]);
  return {
    t: 'type',
    q: `${frame.pre} ${subject} ___ ${comp}${frame.post}<br>
      <small class="drill-hint"><b>${verb.inf}</b> (${verb.en}) — ${info.name} (${info.en})</small>`,
    a: [answer],
    exp: `${frame.pre} ${subject} ${answer} ${comp}${frame.post} — ${verb.inf} in the ${info.en}.`,
    _drill: `${verb.inf}|${tense}`,
  };
}

function makeDrillSet(levelId, n) {
  return makeGenSet(levelId, 'tenses', n);
}

/* ---------- pronoun & gender question generators ---------- */

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Build an MC question: answer + 3 distractors from pool, shuffled
function mcFrom(pool, answer, total = 4) {
  const others = sample(pool.filter((x) => x !== answer), total - 1);
  const c = shuffle([answer, ...others]);
  return { c, a: c.indexOf(answer) };
}

function pluralizeNoun(w) {
  if (w.endsWith('z')) return w.slice(0, -1) + 'ces';
  if (w.endsWith('ón')) return w.slice(0, -2) + 'ones';
  if (/[aeiouáéíóú]$/.test(w)) return w + 's';
  return w + 'es';
}

function genGenderQuestion(levelId) {
  if (levelId === 'c1') {
    const pair = pick(GEN_PAIRS);
    const useM = Math.random() < 0.5;
    const meaning = useM ? pair.m : pair.f;
    const exp = `el ${pair.w} = ${pair.m}; la ${pair.w} = ${pair.f}.`;
    if (Math.random() < 0.5) {
      return { t: 'mc', q: `___ ${pair.w} (${meaning})`, c: ['el', 'la'], a: useM ? 0 : 1, exp };
    }
    return { t: 'mc', q: `___ ${pair.w} (${meaning} — “a/an”)`, c: ['un', 'una'], a: useM ? 0 : 1, exp };
  }

  const noun = pick(GEN_NOUNS[levelId]);
  const fem = noun.g === 'f';
  const why = noun.why ? ` — ${noun.why}` : '';
  const kind = pick(['article', 'un', 'plural', 'adj']);

  if (kind === 'article') {
    const answer = noun.ela ? 'el' : (fem ? 'la' : 'el');
    const exp = noun.ela
      ? `${noun.w} (${noun.en}) starts with a stressed a-/ha- → el ${noun.w}, but it stays feminine.`
      : `${noun.w} (${noun.en}) is ${fem ? 'feminine' : 'masculine'}${why}: ${answer} ${noun.w}.`;
    return { t: 'mc', q: `___ ${noun.w}`, c: ['el', 'la', 'los', 'las'], a: answer === 'el' ? 0 : 1, exp };
  }
  if (kind === 'un') {
    const answer = noun.ela ? 'un' : (fem ? 'una' : 'un');
    const exp = noun.ela
      ? `${noun.w} (${noun.en}): un also replaces una before stressed a-/ha- — un ${noun.w} (still feminine).`
      : `${noun.w} (${noun.en}) is ${fem ? 'feminine' : 'masculine'}${why}: ${answer} ${noun.w}.`;
    return { t: 'mc', q: `___ ${noun.w} (a/an)`, c: ['un', 'una', 'unos', 'unas'], a: answer === 'un' ? 0 : 1, exp };
  }
  if (kind === 'plural') {
    const pl = pluralizeNoun(noun.w);
    const exp = noun.ela
      ? `The el is singular-only; the plural is regular feminine: las ${pl}.`
      : `${noun.w} (${noun.en}) is ${fem ? 'feminine' : 'masculine'}${why}: ${fem ? 'las' : 'los'} ${pl}.`;
    return { t: 'mc', q: `___ ${pl} (the — plural)`, c: ['los', 'las', 'el', 'la'], a: fem ? 1 : 0, exp };
  }
  // adjective agreement, singular
  const adj = pick(GEN_ADJECTIVES);
  const art = noun.ela ? 'el' : (fem ? 'la' : 'el');
  const answer = adj.base + (fem ? 'a' : 'o');
  const c = [adj.base + 'o', adj.base + 'a', adj.base + 'os', adj.base + 'as'];
  const exp = noun.ela
    ? `${noun.w} is feminine even though it takes el → ${answer}.`
    : `${noun.w} (${noun.en}) is ${fem ? 'feminine' : 'masculine'}${why} → ${answer}.`;
  return { t: 'mc', q: `${art} ${noun.w} ___ (${adj.en})`, c, a: fem ? 1 : 0, exp };
}

function genPronounQuestion(levelId) {
  const r = Math.random();

  if (levelId === 'a1') {
    if (r < 0.4) {
      const g = pick(['m', 'f']);
      const name = pick(GEN_NAMES[g]);
      const answer = g === 'm' ? 'él' : 'ella';
      const { c, a } = mcFrom(['él', 'ella', 'ellos', 'ellas'], answer, 4);
      return { t: 'mc', q: `${name} = ___`, c, a,
        exp: `${name} is one ${g === 'm' ? 'man' : 'woman'} (spoken about) → ${answer}.` };
    }
    if (r < 0.8) {
      const g1 = pick(['m', 'f']); const g2 = pick(['m', 'f']);
      const n1 = pick(GEN_NAMES[g1]);
      let n2 = pick(GEN_NAMES[g2]);
      while (n2 === n1) n2 = pick(GEN_NAMES[g2]);
      const allF = g1 === 'f' && g2 === 'f';
      const answer = allF ? 'ellas' : 'ellos';
      const { c, a } = mcFrom(['él', 'ella', 'ellos', 'ellas'], answer, 4);
      return { t: 'mc', q: `${n1} y ${n2} = ___`, c, a,
        exp: allF ? 'An all-female group (spoken about) → ellas.'
                  : 'A group with at least one man (spoken about) → ellos.' };
    }
    const name = pick(GEN_NAMES.m);
    const { c, a } = mcFrom(['nosotros', 'vosotros', 'ellos', 'ustedes'], 'nosotros', 4);
    return { t: 'mc', q: `${name} y yo = ___`, c, a,
      exp: 'Any group that includes “yo” → nosotros.' };
  }

  if (levelId === 'a2') {
    if (r < 0.5) {
      // direct-object replacement
      const noun = pick(GEN_NOUNS.a1.concat(GEN_NOUNS.a2));
      const fem = noun.g === 'f';
      const plural = Math.random() < 0.4;
      const w = plural ? pluralizeNoun(noun.w) : noun.w;
      const art = plural ? (fem ? 'las' : 'los') : (fem ? 'la' : 'el');
      const v = pick(GEN_TRANSITIVES);
      const answer = plural ? (fem ? 'Las' : 'Los') : (fem ? 'La' : 'Lo');
      const c = ['Lo', 'La', 'Los', 'Las'];
      return { t: 'mc', q: `“${v} ${art} ${w}.” → “___ ${v.toLowerCase()}.”`, c, a: c.indexOf(answer),
        exp: `${art} ${w} = ${fem ? 'feminine' : 'masculine'} ${plural ? 'plural' : 'singular'} → ${answer.toLowerCase()}.` };
    }
    // reflexive pronoun by person
    const person = Math.floor(Math.random() * 6);
    const verb = pick(GEN_REFLEXIVES);
    const form = conjugateRegular(verb.inf, 'present', person);
    const answer = REFLEXIVE_PRONOUNS[person];
    const { c, a } = mcFrom(['me', 'te', 'se', 'nos', 'os'], answer, 4);
    return { t: 'mc', q: `${PERSONS[person].label} ___ ${form}. (${verb.inf}se — ${verb.en})`, c, a,
      exp: `Reflexive with ${PERSONS[person].label} → ${answer}: ${answer} ${form}.` };
  }

  if (levelId === 'b1') {
    if (r < 0.5) {
      // gustar-type verbs
      const per = pick(GEN_GUSTAR.persons);
      const v = pick(GEN_GUSTAR.verbs);
      const plural = Math.random() < 0.5;
      const item = plural ? pick(GEN_GUSTAR.itemsPl) : pick(GEN_GUSTAR.itemsSg);
      const vf = plural ? v.pl : v.sg;
      const { c, a } = mcFrom(['me', 'te', 'le', 'nos', 'os', 'les'], per.pr, 4);
      return { t: 'mc', q: `${per.p} ___ ${vf} ${item}.`, c, a,
        exp: `${v.inf} works like gustar — indirect object pronoun: ${per.p.toLowerCase()} ${per.pr} ${vf}.` };
    }
    // double object: le/les + lo/la/los/las → se lo/la/los/las
    // (inanimate nouns only — “Mando el perro a María” reads strangely)
    const noun = pick(GEN_NOUNS.a1.filter((n) => n.w !== 'gato' && n.w !== 'perro'));
    const fem = noun.g === 'f';
    const plural = Math.random() < 0.4;
    const w = plural ? pluralizeNoun(noun.w) : noun.w;
    const art = plural ? (fem ? 'las' : 'los') : (fem ? 'la' : 'el');
    const give = pick(GEN_GIVE_VERBS);
    const rec = pick(GEN_RECIPIENTS);
    const doP = plural ? (fem ? 'las' : 'los') : (fem ? 'la' : 'lo');
    const cap = give.charAt(0).toUpperCase() + give.slice(1);
    const c = ['Se lo', 'Se la', 'Se los', 'Se las'];
    return { t: 'mc', q: `“${cap} ${art} ${w} a ${rec}.” → “___ ${give}.”`, c, a: c.indexOf(`Se ${doP}`),
      exp: `le/les + ${doP} is forbidden → se ${doP}: Se ${doP} ${give}.` };
  }

  if (levelId === 'b2') {
    if (r < 0.34) {
      // passive se: verb agrees with the noun
      const v = pick(GEN_SE_PASSIVE.verbs);
      const plural = Math.random() < 0.5;
      const item = plural ? pick(GEN_SE_PASSIVE.itemsPl) : pick(GEN_SE_PASSIVE.itemsSg);
      return { t: 'mc', q: `Aquí se ___ ${item}. (${v.inf})`, c: [v.sg, v.pl], a: plural ? 1 : 0,
        exp: `Passive se agrees with the noun: ${item} is ${plural ? 'plural' : 'singular'} → se ${plural ? v.pl : v.sg}.` };
    }
    if (r < 0.67) {
      // cuyo agreement
      const owner = pick(GEN_CUYO.owners);
      const pos = pick(GEN_CUYO.possessions);
      const c = ['cuyo', 'cuya', 'cuyos', 'cuyas'];
      return { t: 'mc', q: `Es ${owner} ___ ${pos.w} conocemos bien.`, c, a: c.indexOf(pos.form),
        exp: `cuyo agrees with the thing possessed (${pos.w}) → ${pos.form}.` };
    }
  }

  // b2 fallthrough + c1: accidental se / dative of interest
  const v = pick(GEN_ACCIDENTAL.verbs);
  const plural = Math.random() < 0.5;
  const item = plural ? pick(GEN_ACCIDENTAL.itemsPl) : pick(GEN_ACCIDENTAL.itemsSg);
  const vf = plural ? v.pl : v.sg;
  if (levelId === 'c1' && r < 0.5 && !v.inf.includes(' ')) {
    // typed variant: supply the verb form
    return { t: 'type', q: `Se me ___ ${item}. (${v.inf} — accidental se)`, a: [vf],
      exp: `The verb agrees with ${item} (${plural ? 'plural' : 'singular'}): se me ${vf} ${item}.` };
  }
  const dat = pick(GEN_ACCIDENTAL.datives);
  const { c, a } = mcFrom(['me', 'te', 'le', 'nos', 'os', 'les'], dat.pr, 4);
  return { t: 'mc', q: `Se ___ ${vf} ${item}. (${dat.p})`, c, a,
    exp: `The affected person (${dat.p}) appears as a dative: se ${dat.pr} ${vf} ${item}.` };
}

function genQuestion(levelId, topicId) {
  if (topicId === 'tenses') return makeDrillQuestion(levelId);
  if (topicId === 'pronouns') return genPronounQuestion(levelId);
  return genGenderQuestion(levelId);
}

// n unique generated questions, also avoiding any prompt text in `avoid`
function makeGenSet(levelId, topicId, n, avoid = []) {
  const out = [];
  const seen = new Set(avoid);
  let guard = 0;
  while (out.length < n && guard++ < 300) {
    const q = genQuestion(levelId, topicId);
    if (seen.has(q.q)) continue;
    seen.add(q.q);
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

// Draw n bank questions, never repeating one until the whole pool has been
// seen (tracked per level:topic in localStorage).
function cycleSample(bank, key, n) {
  if (!state.seen) state.seen = {};
  const seenArr = state.seen[key] || [];
  const seen = new Set(seenArr);
  const fresh = bank.map((_, i) => i).filter((i) => !seen.has(i));
  let idxs;
  if (fresh.length >= n) {
    idxs = sample(fresh, n);
    state.seen[key] = seenArr.concat(idxs);
  } else {
    // pool exhausted: serve the last fresh ones, top up from old, restart cycle
    idxs = fresh.concat(sample(seenArr, n - fresh.length));
    state.seen[key] = idxs.slice();
  }
  save();
  return idxs.map((i) => bank[i]);
}

function bankSample(levelId, topicId, n) {
  return cycleSample(EXERCISES[levelId][topicId], statKey(levelId, topicId), n);
}

let session = null; // { mode, level, topic, questions, index, correct, answers, revealed }

function startSession(mode, levelId, topicId) {
  let questions;
  if (mode === 'placement') {
    questions = makePlacementSet();
  } else if (mode === 'drill') {
    questions = makeDrillSet(levelId, 10);
  } else if (mode === 'mixed') {
    // interleaved practice: 2 bank + 2 generated per topic, shuffled together
    questions = [];
    for (const t of TOPICS) {
      const fromBank = bankSample(levelId, t.id, 2).map((q) => ({ ...q, _topic: t.id }));
      const generated = makeGenSet(levelId, t.id, 2, fromBank.map((q) => q.q))
        .map((q) => ({ ...q, _topic: t.id }));
      questions.push(...fromBank, ...generated);
    }
    questions = shuffle(questions);
  } else if (mode === 'review') {
    questions = sample(reviewDue(), 10)
      .map((r) => ({ ...r.q, _level: r.level, _topic: r.topic }));
    if (questions.length === 0) { renderHome(); return; }
  } else if (mode === 'detective') {
    questions = cycleSample(DETECTIVE[levelId], `${levelId}:detective`, 8);
  } else if (mode === 'story') {
    questions = cycleSample(CLOZE_STORIES[levelId], `${levelId}:story`, 1)
      .map((st) => ({ ...st, t: 'cloze' }));
  } else if (mode === 'workout') {
    // Tense-focused interleave: interpretation + curated bank + generated drills
    questions = shuffle(
      cycleSample(DETECTIVE[levelId], `${levelId}:detective`, 3)
        .concat(bankSample(levelId, 'tenses', 3))
        .concat(makeDrillSet(levelId, 4)));
  } else {
    // 6 curated bank questions (cycled, no repeats) + 4 freshly generated
    const fromBank = bankSample(levelId, topicId, 6);
    const generated = makeGenSet(levelId, topicId, 4, fromBank.map((q) => q.q));
    questions = shuffle(fromBank.concat(generated));
  }
  session = {
    mode, level: levelId, topic: topicId,
    questions, index: 0, correct: 0, answers: [], revealed: false,
    unitsTotal: 0, unitsCorrect: 0, // cloze counts blanks, not stories
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
        <p class="topic-level-desc">Unlimited sentence-based questions across every tense unlocked
          at ${esc(lvl.cefr)}: ${LEVEL_TENSES[state.level].map((t) => TENSE_INFO[t].en).join(', ')}.
          Adapts to hit the verb–tense combos you miss.</p>
        <div class="card-actions">
          <button class="btn primary" data-drill="1">⚡ Start drill</button>
        </div>
      </div>` + (() => {
      const due = reviewDue().length;
      const total = reviewQueue().length;
      const reviewTxt = total === 0
        ? 'Miss a question anywhere and it lands here — it comes back after 1 and 3 days until you master it.'
        : due === 0
          ? `All caught up! ${total} question${total === 1 ? '' : 's'} scheduled for later.`
          : `<b>${due} question${due === 1 ? '' : 's'} due</b> (${total} in the queue). Reviewing just before you forget is where learning sticks.`;
      return `
      <div class="card topic-card drill-card">
        <div class="topic-head"><span class="topic-icon">🔀</span><h3>Mixed Practice</h3></div>
        <p class="topic-level-desc">Tenses, pronouns, and gender interleaved in one session —
          harder than practicing one topic at a time, and better for retention.</p>
        <div class="card-actions">
          <button class="btn primary" data-mixed="1">🔀 Start mixed session</button>
        </div>
      </div>
      <div class="card topic-card drill-card">
        <div class="topic-head"><span class="topic-icon">⏰</span><h3>Review Queue</h3></div>
        <p class="topic-level-desc">${reviewTxt}</p>
        <div class="card-actions">
          ${due > 0 ? '<button class="btn primary" data-review="1">⏰ Review now</button>' : ''}
        </div>
      </div>`;
    })();

    cards.querySelectorAll('[data-lesson]').forEach((b) =>
      b.addEventListener('click', () => renderLesson(state.level, b.dataset.lesson)));
    cards.querySelectorAll('[data-practice]').forEach((b) =>
      b.addEventListener('click', () => startSession('quiz', state.level, b.dataset.practice)));
    const drillBtn = cards.querySelector('[data-drill]');
    if (drillBtn) drillBtn.addEventListener('click', () => startSession('drill', state.level, null));
    const mixedBtn = cards.querySelector('[data-mixed]');
    if (mixedBtn) mixedBtn.addEventListener('click', () => startSession('mixed', state.level, null));
    const reviewBtn = cards.querySelector('[data-review]');
    if (reviewBtn) reviewBtn.addEventListener('click', () => startSession('review', state.level, null));
  }

  renderLab();
  show('#view-home');
}

function renderLab() {
  const lab = $('#lab-cards');
  const labSection = $('#lab-section');
  if (!state.level) {
    labSection.classList.add('hidden');
    return;
  }
  labSection.classList.remove('hidden');
  lab.innerHTML = `
    <div class="card topic-card">
      <div class="topic-head"><span class="topic-icon">🧰</span><h3>Tense Toolkit</h3></div>
      <p class="topic-level-desc">The timeline, photo-vs-video, trigger words, and every mnemonic:
        SIMBA, CHEATED, DOCTOR/PLACE, WEIRDO…</p>
      <div class="card-actions"><button class="btn ghost" id="toolkit-btn">📖 Open toolkit</button></div>
    </div>
    <div class="card topic-card">
      <div class="topic-head"><span class="topic-icon">🕵️</span><h3>Tense Detective</h3></div>
      <p class="topic-level-desc">Don't conjugate — <i>interpret</i>. Decode who, when, and
        whether it's done from the verb form alone.</p>
      <div class="card-actions"><button class="btn primary" id="detective-btn">🔎 Investigate</button></div>
    </div>
    <div class="card topic-card">
      <div class="topic-head"><span class="topic-icon">📚</span><h3>Story Mode</h3></div>
      <p class="topic-level-desc">Conjugate inside a real narrative — tenses live in stories,
        not in isolated sentences.</p>
      <div class="card-actions"><button class="btn primary" id="story-btn">📜 Read &amp; fill</button></div>
    </div>
    <div class="card topic-card">
      <div class="topic-head"><span class="topic-icon">💪</span><h3>Tense Workout</h3></div>
      <p class="topic-level-desc">Interleaved set: detective questions, curated exercises, and
        drills shuffled together — mixed practice beats blocked practice.</p>
      <div class="card-actions"><button class="btn primary" id="workout-btn">🏋️ Mix it up</button></div>
    </div>`;

  $('#toolkit-btn').addEventListener('click', renderToolkit);
  $('#detective-btn').addEventListener('click', () => startSession('detective', state.level, null));
  $('#story-btn').addEventListener('click', () => startSession('story', state.level, null));
  $('#workout-btn').addEventListener('click', () => startSession('workout', state.level, null));
}

function renderToolkit() {
  $('#toolkit-body').innerHTML = TOOLKIT_HTML;
  show('#view-toolkit');
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
  else if (s.mode === 'mixed') title = `🔀 Mixed practice — ${levelById(s.level).cefr}`;
  else if (s.mode === 'review') title = '⏰ Review queue';
  else if (s.mode === 'detective') title = `🕵️ Tense Detective — ${levelById(s.level).cefr}`;
  else if (s.mode === 'story') title = `📚 Story Mode — ${levelById(s.level).cefr}`;
  else if (s.mode === 'workout') title = `💪 Tense Workout — ${levelById(s.level).cefr}`;
  else title = `${topicById(s.topic).icon} ${topicById(s.topic).name} — ${levelById(s.level).cefr}`;
  $('#practice-title').textContent = title;
  $('#practice-progress').textContent = `${s.index + 1} / ${total}`;
  $('#practice-bar').style.width = `${(s.index / total) * 100}%`;

  const box = $('#question-box');
  if (q.t === 'cloze') {
    renderCloze(q, box);
    $('#next-btn').classList.add('hidden');
    show('#view-practice');
    return;
  }
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
  s.unitsTotal++;
  if (ok) s.unitsCorrect++;

  if (s.mode !== 'placement') {
    // Tense-lab modes count toward the tenses topic; mixed/review questions
    // carry their own topic (and, in review, their own level)
    const labMode = ['drill', 'detective', 'workout'].includes(s.mode);
    const topic = q._topic || (labMode ? 'tenses' : s.topic);
    if (q._drill) updateDrillWeak(q._drill, ok);
    const level = q._level || s.level;
    recordAnswer(level, topic, ok);
    if (s.mode === 'review') {
      updateReviewEntry(q, ok);
    } else if (!ok) {
      addToReview(level, topic, q);
    }
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

/* ---------- cloze (story mode) ---------- */

function renderCloze(q, box) {
  const html = esc(q.text).replace(/\{(\d+)\}/g, (_, n) => {
    const b = q.blanks[parseInt(n, 10) - 1];
    return `<span class="cloze-blank"><input type="text" data-b="${parseInt(n, 10) - 1}"
      autocomplete="off" autocapitalize="off" spellcheck="false"
      aria-label="Blank ${n}"><small class="cloze-hint">(${esc(b.hint)})</small></span>`;
  });
  box.innerHTML = `
    <h3 class="cloze-title">${esc(q.title)}</h3>
    <p class="cloze-note">${esc(q.note)}</p>
    <p class="cloze-text">${html}</p>
    <div class="accent-row">
      ${ACCENT_CHARS.map((ch) => `<button class="accent-btn" data-ch="${ch}">${ch}</button>`).join('')}
    </div>
    <button class="btn primary" id="cloze-submit">Check the story</button>
    <div id="feedback"></div>`;

  let lastInput = box.querySelector('.cloze-blank input');
  box.querySelectorAll('.cloze-blank input').forEach((inp) => {
    inp.addEventListener('focus', () => { lastInput = inp; });
  });
  box.querySelectorAll('.accent-btn').forEach((b) => {
    b.addEventListener('click', () => {
      if (lastInput && !lastInput.disabled) {
        lastInput.value += b.dataset.ch;
        lastInput.focus();
      }
    });
  });
  $('#cloze-submit').addEventListener('click', () => answerCloze(q, box));
}

function answerCloze(q, box) {
  const s = session;
  if (s.revealed) return;
  s.revealed = true;

  const inputs = Array.from(box.querySelectorAll('.cloze-blank input'));
  const misses = [];
  let okCount = 0;
  inputs.forEach((inp) => {
    const i = parseInt(inp.dataset.b, 10);
    const b = q.blanks[i];
    const raw = inp.value.trim().toLowerCase();
    const answers = b.a.map((a) => a.toLowerCase());
    const ok = answers.includes(raw);
    const accentMiss = !ok && answers.some((a) => stripAccents(a) === stripAccents(raw));
    inp.disabled = true;
    inp.classList.add(ok ? 'cloze-ok' : accentMiss ? 'cloze-almost' : 'cloze-bad');
    if (ok) okCount++;
    else misses.push({ n: i + 1, b });

    s.unitsTotal++;
    if (ok) s.unitsCorrect++;
    recordAnswer(s.level, 'tenses', ok);
    if (!ok) {
      // Each missed blank becomes a standalone type question in the queue
      addToReview(s.level, 'tenses', {
        t: 'type',
        q: `${q.title}: «…${clozeContext(q.text, i + 1)}…» (${b.hint})`,
        a: b.a, exp: b.exp,
      });
    }
  });
  renderHeader();

  $('#cloze-submit').disabled = true;
  const fb = box.querySelector('#feedback');
  let msg = okCount === inputs.length
    ? `<div class="fb ok">✅ <b>¡Historia perfecta!</b> Every blank correct.</div>`
    : `<div class="fb ${okCount >= inputs.length / 2 ? 'almost' : 'bad'}">
        You got <b>${okCount}/${inputs.length}</b>.</div>`;
  if (misses.length) {
    msg += `<ul class="cloze-misses">${misses.map(({ n, b }) =>
      `<li><b>${n}.</b> ${esc(b.a[0])} — ${esc(b.exp)}</li>`).join('')}</ul>`;
  }
  fb.innerHTML = msg;

  const nextBtn = $('#next-btn');
  nextBtn.textContent = s.index + 1 < s.questions.length ? 'Next →' : 'See results';
  nextBtn.classList.remove('hidden');
  nextBtn.focus();
}

function clozeContext(text, n) {
  // A few words around blank {n}, for review-queue prompts
  const idx = text.indexOf(`{${n}}`);
  const start = Math.max(0, idx - 30);
  const end = Math.min(text.length, idx + 30);
  return text.slice(start, end).replace(/\{(\d+)\}/g, '___').trim();
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
  // Cloze sessions count individual blanks; everything else counts questions
  const total = s.unitsTotal || s.questions.length;
  const good = s.unitsTotal ? s.unitsCorrect : s.correct;
  const pct = Math.round((good / total) * 100);
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
    sub = `You got ${good} of ${total}.`;

    const missed = total - good;
    if (s.mode === 'review') {
      const due = reviewDue().length;
      sub += due > 0
        ? ` <b>${due}</b> still due — one more round?`
        : ' Queue cleared for now. Correct answers come back in 1–3 days; answer each one right twice more and it graduates.';
    } else if (missed > 0) {
      sub += ` The ${missed} you missed ${missed === 1 ? 'is' : 'are'} in your
        <b>review queue</b> — hitting them again is how they stick.`;
    }

    // Adaptive suggestion based on recent rolling accuracy
    // (single-topic modes only — mixed/review span topics and levels)
    const topic = ['drill', 'detective', 'story', 'workout'].includes(s.mode)
      ? 'tenses' : s.topic;
    const acc = topic ? recentAccuracy(s.level, topic) : null;
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
  } else if (s.mode === 'review' && reviewDue().length === 0) {
    againBtn.textContent = '🏠 Home';
    againBtn.onclick = () => renderHome();
  } else {
    againBtn.textContent = s.mode === 'review' ? '⏰ Review again'
      : s.mode === 'story' ? '📖 Retry the story' : '🔁 Practice again';
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
