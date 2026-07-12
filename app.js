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

function recordAnswer(level, topic, ok, hinted) {
  const s = getStats(level, topic);
  s.attempts++;
  if (ok) s.correct++;
  s.recent.push(ok ? 1 : 0);
  if (s.recent.length > 10) s.recent.shift();
  if (ok) {
    state.xp += hinted ? 5 : 10; // hinted answers earn half XP but keep the streak
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
    _meta: { inf: verb.inf, tense, person },
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

/* ---------- question flags ----------
   Flags are kept in localStorage and, when the app is served from Netlify,
   also POSTed to Netlify Forms (the hidden question-flag form in index.html).
   Anywhere else (file://, other hosts) the fallback is a prefilled email. */

const FLAG_EMAIL = 'aric.bright@gmail.com'; // maintainer; change or clear as needed
const FLAG_REASONS = ['Wrong answer', 'Typo or accent error', 'Unnatural Spanish',
  'Confusing explanation', 'Other'];

function stripHtml(s) {
  return String(s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function postFlag(flag) {
  if (!/^https?:$/.test(location.protocol)) return false;
  try {
    const body = new URLSearchParams({
      'form-name': 'question-flag',
      question: flag.question, answer: flag.answer, context: flag.context,
      reason: flag.reason, comment: flag.comment, reporter: flag.reporter,
    });
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function mailtoFlag(flag) {
  const subject = encodeURIComponent('¡Adelante! question flag: ' + flag.reason);
  const body = encodeURIComponent(
    `Question: ${flag.question}\nExpected answer: ${flag.answer}\n` +
    `Where: ${flag.context}\nReason: ${flag.reason}\nComment: ${flag.comment}\n` +
    `Reported: ${flag.when}`);
  return `mailto:${FLAG_EMAIL}?subject=${subject}&body=${body}`;
}

function flagWidget(container, info) {
  const wrap = document.createElement('div');
  wrap.className = 'flag-wrap';
  wrap.innerHTML = '<button type="button" class="flag-link">🚩 Something wrong with this question?</button>';
  container.appendChild(wrap);

  wrap.querySelector('.flag-link').addEventListener('click', () => {
    wrap.innerHTML = `
      <div class="flag-form">
        <select class="flag-reason" aria-label="Reason">
          ${FLAG_REASONS.map((r) => `<option>${r}</option>`).join('')}
        </select>
        <input class="flag-comment" type="text" maxlength="200"
               placeholder="Optional details…" aria-label="Details">
        <button type="button" class="btn small primary flag-send">Send</button>
      </div>`;
    wrap.querySelector('.flag-send').addEventListener('click', async () => {
      const flag = {
        question: info.question, answer: info.answer, context: info.context,
        reason: wrap.querySelector('.flag-reason').value,
        comment: wrap.querySelector('.flag-comment').value.trim(),
        reporter: (state.profile && state.profile.name) || 'anonymous',
        when: new Date().toISOString(),
      };
      if (!state.flags) state.flags = [];
      state.flags.push(flag);
      if (state.flags.length > 200) state.flags.shift();
      save();
      wrap.innerHTML = '<p class="flag-done">Sending…</p>';
      const sent = await postFlag(flag);
      wrap.innerHTML = sent
        ? '<p class="flag-done">🚩 ¡Gracias! Your report was sent.</p>'
        : `<p class="flag-done">🚩 Saved on this device —
             <a href="${mailtoFlag(flag)}">email it to the maintainer</a> so it's seen.</p>`;
    });
  });
}

/* ---------- profile (local for now; syncs to accounts later) ---------- */

const AVATARS = ['🙂', '😎', '🤓', '🦉', '🐸', '🦊', '🐢', '🦜', '🐕', '🐱',
  '🌵', '🌮', '🌶️', '🍇', '🍊', '☕', '🎸', '⚽', '🏄', '✈️', '🎨', '📚', '🌊', '⭐'];

function profile() {
  if (!state.profile) state.profile = { name: '', avatar: '🙂' };
  return state.profile;
}

function openProfileModal() {
  const p = profile();
  $('#profile-name').value = p.name;
  const grid = $('#avatar-grid');
  grid.innerHTML = AVATARS.map((a) =>
    `<button type="button" class="avatar-choice ${a === p.avatar ? 'selected' : ''}"
       data-a="${a}">${a}</button>`).join('');
  grid.querySelectorAll('.avatar-choice').forEach((b) => {
    b.addEventListener('click', () => {
      grid.querySelectorAll('.avatar-choice').forEach((x) => x.classList.remove('selected'));
      b.classList.add('selected');
    });
  });
  $('#profile-modal').classList.remove('hidden');
  $('#profile-name').focus();
}

function saveProfile() {
  const p = profile();
  p.name = $('#profile-name').value.trim();
  const sel = $('#avatar-grid .avatar-choice.selected');
  if (sel) p.avatar = sel.dataset.a;
  save();
  $('#profile-modal').classList.add('hidden');
  renderHeader();
}

/* ---------- share results ---------- */

async function shareResults() {
  const p = profile();
  const headline = $('#results-headline').textContent;
  const lvl = state.level ? levelById(state.level) : null;
  const who = p.name ? `${p.avatar} ${p.name}` : p.avatar;
  const where = /^https?:$/.test(location.protocol) ? ` ${location.origin}${location.pathname}` : '';
  const text = `${who} — ${headline}` +
    `${lvl ? ` (level ${lvl.cefr})` : ''} on ¡Adelante!, the Spanish grammar trainer.${where}`;
  const btn = $('#share-btn');
  if (navigator.share) {
    try { await navigator.share({ text }); return; } catch { /* user cancelled */ }
  }
  try {
    await navigator.clipboard.writeText(text);
    btn.textContent = '✅ Copied!';
  } catch {
    btn.textContent = '📣 ' + text.slice(0, 40) + '…';
  }
  setTimeout(() => { btn.textContent = '📣 Share'; }, 2500);
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
  const p = profile();
  const btn = $('#profile-btn');
  btn.textContent = p.avatar;
  btn.title = p.name ? `${p.name} — edit profile` : 'Set up your profile';
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
        not in isolated sentences. <b>${CLOZE_STORIES[state.level].length} stories</b> at this
        level, and every miss gets a full explanation, an instant fix-it retype, and a spot
        in your review queue.</p>
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

/* ---------- tense reference popup ----------
   TENSE_REFERENCE (data.js) fuels two aids: tense names in question text
   become clickable and open a reference card, and the 💡 hint ladder reuses
   the same explanations and endings. */

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let _tenseNames = null; // [{ name, key }], longest name first so
                        // "imperfecto de subjuntivo" wins over "imperfecto"
function tenseNameIndex() {
  if (!_tenseNames) {
    _tenseNames = [];
    for (const [key, ref] of Object.entries(TENSE_REFERENCE)) {
      for (const name of ref.names) _tenseNames.push({ name, key });
    }
    _tenseNames.sort((a, b) => b.name.length - a.name.length);
  }
  return _tenseNames;
}

function tenseKeyFromName(name) {
  const n = stripAccents(String(name).trim().toLowerCase());
  const hit = tenseNameIndex().find((t) => stripAccents(t.name.toLowerCase()) === n);
  return hit ? hit.key : null;
}

const SPANISH_LETTER = /[a-záéíóúñü]/i;

// Wrap known tense names in the given HTML with clickable buttons.
// Skips anything inside tags; manual boundary check because \b is
// unreliable next to accented characters.
function linkifyTenses(html) {
  const alts = tenseNameIndex().map((t) => escapeRegex(t.name)).join('|');
  const re = new RegExp(`(<[^>]*>)|(${alts})`, 'gi');
  return String(html).replace(re, (m, tag, name, offset, str) => {
    if (tag) return tag;
    const before = str[offset - 1] || '';
    const after = str[offset + m.length] || '';
    if (SPANISH_LETTER.test(before) || SPANISH_LETTER.test(after)) return m;
    const key = tenseKeyFromName(name);
    if (!key) return m;
    return `<button type="button" class="tense-link" data-tense="${key}"
      title="What is the ${esc(name)}? Click for a quick reference.">${m}</button>`;
  });
}

function endingsTableHTML(endingsKey) {
  const e = REGULAR_ENDINGS[endingsKey];
  if (!e) return '';
  if (e.all) {
    return `<table class="endings-table">
      ${PERSONS.map((p, i) =>
        `<tr><td>${p.label}</td><td>infinitive + <b>-${e.all[i]}</b></td></tr>`).join('')}
    </table>`;
  }
  return `<table class="endings-table">
    <tr><th></th><th>-ar</th><th>-er</th><th>-ir</th></tr>
    ${PERSONS.map((p, i) =>
      `<tr><td>${p.label}</td><td>-${e.ar[i]}</td><td>-${e.er[i]}</td><td>-${e.ir[i]}</td></tr>`).join('')}
  </table>`;
}

function openTenseModal(key) {
  const ref = TENSE_REFERENCE[key];
  if (!ref) return;
  const en = ref.names[ref.names.length - 1];
  $('#tense-modal-body').innerHTML = `
    <h3>🕐 ${esc(ref.names[0])}${en !== ref.names[0] ? ` <small class="tense-en">(${esc(en)})</small>` : ''}</h3>
    <p><b>What it is:</b> ${esc(ref.what)}</p>
    <p><b>When to use it:</b> ${esc(ref.when)}</p>
    ${ref.endings
      ? `<p class="endings-title"><b>Regular endings${REGULAR_ENDINGS[ref.endings].all ? ' (attach to the whole infinitive)' : ''}:</b></p>
         ${endingsTableHTML(ref.endings)}`
      : `<p><b>How it's built:</b> ${esc(ref.formula)}.</p>`}
    <p class="tense-irreg">⚠️ ${esc(ref.irregular)}</p>`;
  $('#tense-modal').classList.remove('hidden');
}

/* ---------- progressive hints ----------
   Stuck ≠ guess: the 💡 button climbs a ladder — concept nudge → the exact
   ending (or 50/50 on multiple choice) → reveal-and-retype. Any hint halves
   the XP for that question and sends it to the review queue. */

const PERSON_PATTERNS = [
  [0, /(?:^|[^a-záéíóúñü])yo(?![a-záéíóúñü])/i],
  [1, /(?:^|[^a-záéíóúñü])tú(?![a-záéíóúñü])/i],
  [2, /(?:^|[^a-záéíóúñü])(?:él|ella|usted)(?![a-záéíóúñü])/i],
  [3, /(?:^|[^a-záéíóúñü])nosotr[oa]s(?![a-záéíóúñü])/i],
  [4, /(?:^|[^a-záéíóúñü])vosotr[oa]s(?![a-záéíóúñü])/i],
  [5, /(?:^|[^a-záéíóúñü])(?:ellos|ellas|ustedes)(?![a-záéíóúñü])/i],
];

function detectPerson(text) {
  const found = PERSON_PATTERNS.filter(([, re]) => re.test(text)).map(([p]) => p);
  return found.length === 1 ? found[0] : null;
}

function allVerbs() {
  return REGULAR_VERBS.concat(IRREGULAR_VERBS);
}

// Figure out what a question is drilling: tense, verb, and person.
// Drill questions carry structured _meta; static exercises embed
// "(infinitive, tense)" in the prompt, so parse that; anything else
// (pronoun/gender topics, detective) returns null → generic hints.
function getHintMeta(q) {
  if (q._meta) {
    return {
      tenseKey: q._meta.tense,
      verb: allVerbs().find((v) => v.inf === q._meta.inf) || { inf: q._meta.inf },
      person: q._meta.person,
    };
  }
  const text = stripHtml(q.q);
  const m = text.match(/\(([a-záéíóúñü]+)\s*,\s*([^)]+)\)/i);
  if (!m) return null;
  const tenseKey = tenseKeyFromName(m[2]);
  if (!tenseKey || !TENSE_REFERENCE[tenseKey].endings) return null;
  const inf = m[1].toLowerCase();
  return {
    tenseKey,
    verb: allVerbs().find((v) => v.inf === inf) || { inf },
    person: detectPerson(text),
  };
}

function acceptedAnswers(q) {
  return (q.t === 'mc' ? [q.c[q.a]] : q.a).map((a) => String(a).toLowerCase());
}

function conceptHintHTML(meta) {
  const ref = TENSE_REFERENCE[meta.tenseKey];
  let h = `<b>${esc(ref.names[0])}:</b> ${esc(ref.what)} ${esc(ref.when)}`;
  if (meta.person != null) h += ` You need the <b>${PERSONS[meta.person].label}</b> form.`;
  return linkifyTenses(h);
}

function endingHintHTML(meta, q) {
  const { tenseKey, verb, person } = meta;
  const ref = TENSE_REFERENCE[tenseKey];
  const e = REGULAR_ENDINGS[tenseKey];
  const type = verb.inf.slice(-2);

  if (person != null) {
    // Trust the data over verb lists: if the regular pattern produces an
    // accepted answer, the verb behaves regularly in this slot.
    const regular = conjugateRegular(verb.inf, tenseKey, person);
    if (acceptedAnswers(q).includes(regular.toLowerCase())) {
      return `${PERSONS[person].label} + ${e.all ? 'infinitive' : `-${type} verb`}
        in the ${esc(ref.names[0])} → ${e.all
          ? `add <b>-${e.all[person]}</b> to the whole infinitive`
          : `stem + <b>-${e[type][person]}</b>`}.`;
    }
    return `⚠️ Ojo — <b>${esc(verb.inf)}</b> doesn't follow the regular pattern here.
      ${esc(ref.irregular)}`;
  }

  // Person unknown: give the whole endings row for this verb type
  const endings = e.all || e[type];
  let h = `<b>-${type} ${esc(ref.names[0])} endings${e.all ? ' (on the infinitive)' : ''}:</b>
    ${PERSONS.map((p, i) => `${p.label} <b>-${endings[i]}</b>`).join(' · ')}`;
  if (verb.forms && verb.forms[tenseKey]) {
    h += `<br>⚠️ Ojo — <b>${esc(verb.inf)}</b> is irregular in this tense. ${esc(ref.irregular)}`;
  }
  return h;
}

// Disable all but the correct choice and one random wrong one
function fiftyFifty(q) {
  const wrong = shuffle([...q.c.keys()].filter((i) => i !== q.a)).slice(0, q.c.length - 2);
  document.querySelectorAll('.choice').forEach((btn, j) => {
    if (wrong.includes(j)) {
      btn.disabled = true;
      btn.classList.add('eliminated');
    }
  });
}

// Level 3: show the answer, count it as a miss, and queue a retype so the
// form still gets produced, not just seen (reuses the cloze fix-it flow).
function revealAnswer(q) {
  const s = session;
  s.revealedByHint = true;
  const answer = q.t === 'mc' ? q.c[q.a] : q.a[0];
  if (q.t === 'mc') {
    document.querySelectorAll('.choice').forEach((btn, j) => {
      btn.disabled = true;
      if (j === q.a) btn.classList.add('correct');
    });
  } else {
    $('#type-input').disabled = true;
    $('#type-submit').disabled = true;
  }
  s.questions.push({
    t: 'type', _fix: true,
    q: `🔧 Type it to lock it in: ${q.q}`,
    a: q.t === 'mc' ? [answer] : q.a,
    exp: q.exp,
    _level: q._level, _topic: q._topic,
  });
  finishAnswer(false, q, null);
}

const HINT_LABELS = {
  concept: '💡 Hint',
  nudge: '💡 Hint',
  ending: '💡 Another hint',
  fifty: '➗ Remove two wrong answers',
  reveal: '👀 Show the answer',
};

function hintAreaHTML() {
  return `<div class="hint-area">
    <button type="button" class="btn ghost small" id="hint-btn">💡 Hint</button>
    <div id="hint-box"></div>
  </div>`;
}

function wireHintButton(q) {
  const btn = $('#hint-btn');
  if (!btn) return;
  const meta = getHintMeta(q);
  const steps = q.t === 'mc'
    ? (meta ? ['concept', 'fifty', 'reveal'] : ['fifty', 'reveal'])
    : (meta ? ['concept', 'ending', 'reveal'] : ['nudge', 'reveal']);
  btn.textContent = HINT_LABELS[steps[0]];

  btn.addEventListener('click', () => {
    const s = session;
    if (s.revealed) return;
    const step = steps[s.hintLevel];
    s.hintLevel++;

    const addHint = (html) => {
      $('#hint-box').innerHTML += `<div class="hint-item">${html}</div>`;
    };
    if (step === 'concept') {
      addHint(conceptHintHTML(meta));
    } else if (step === 'ending') {
      addHint(endingHintHTML(meta, q));
    } else if (step === 'nudge') {
      addHint(`Look for clue words in the sentence — time markers pick the tense,
        and the subject picks the ending. Click any underlined tense name for
        a refresher.`);
    } else if (step === 'fifty') {
      fiftyFifty(q);
    } else {
      revealAnswer(q);
      return;
    }
    btn.textContent = HINT_LABELS[steps[s.hintLevel]];
  });
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

  s.hintLevel = 0;
  s.revealedByHint = false;
  // No hints during placement (it measures your level) or fix-it retypes
  // (the answer was just shown)
  const canHint = s.mode !== 'placement' && !q._fix;

  const box = $('#question-box');
  if (q.t === 'cloze') {
    renderCloze(q, box);
    $('#next-btn').classList.add('hidden');
    show('#view-practice');
    return;
  }
  if (q.t === 'mc') {
    box.innerHTML = `
      <p class="question">${linkifyTenses(q.q)}</p>
      <div class="choices">
        ${q.c.map((c, i) => `<button class="choice" data-i="${i}">${esc(c)}</button>`).join('')}
      </div>
      ${canHint ? hintAreaHTML() : ''}
      <div id="feedback"></div>`;
    box.querySelectorAll('.choice').forEach((btn) => {
      btn.addEventListener('click', () => answerMC(parseInt(btn.dataset.i, 10)));
    });
    if (canHint) wireHintButton(q);
  } else {
    box.innerHTML = `
      <p class="question">${linkifyTenses(q.q)}</p>
      <div class="type-row">
        <input id="type-input" type="text" autocomplete="off" autocapitalize="off"
               spellcheck="false" placeholder="Type your answer…" aria-label="Your answer">
        <button class="btn primary" id="type-submit">Check</button>
      </div>
      <div class="accent-row">
        ${ACCENT_CHARS.map((ch) => `<button class="accent-btn" data-ch="${ch}">${ch}</button>`).join('')}
      </div>
      ${canHint ? hintAreaHTML() : ''}
      <div id="feedback"></div>`;
    if (canHint) wireHintButton(q);
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
  const hinted = (s.hintLevel || 0) > 0;
  const hintBtn = $('#hint-btn');
  if (hintBtn) hintBtn.classList.add('hidden');

  if (q._fix) {
    // Fix-it retypes: the original miss already hit the stats and the review
    // queue, so these only track the corrective round — and a wrong retype
    // goes back in the queue until it's typed correctly.
    s.fixTotal = (s.fixTotal || 0) + 1;
    if (ok) s.fixCorrect = (s.fixCorrect || 0) + 1;
    else s.questions.push({ ...q });
    renderFeedback(ok, q, accentMiss);
    return;
  }

  s.answers.push({ level: q._level || s.level, ok });
  if (ok) s.correct++;
  s.unitsTotal++;
  if (ok) s.unitsCorrect++;

  if (s.mode !== 'placement') {
    // Tense-lab modes count toward the tenses topic; mixed/review questions
    // carry their own topic (and, in review, their own level)
    const labMode = ['drill', 'detective', 'workout'].includes(s.mode);
    const topic = q._topic || (labMode ? 'tenses' : s.topic);
    // A hinted success shouldn't ease off a weak verb×tense combo
    if (q._drill) updateDrillWeak(q._drill, ok && !hinted);
    const level = q._level || s.level;
    recordAnswer(level, topic, ok, hinted);
    if (s.mode === 'review') {
      updateReviewEntry(q, ok);
    } else if (!ok || hinted) {
      // Misses and hinted answers both resurface via the review queue
      addToReview(level, topic, q);
    }
    renderHeader();
  }

  renderFeedback(ok, q, accentMiss);
}

function renderFeedback(ok, q, accentMiss) {
  const s = session;
  const fb = $('#feedback');
  const answerTxt = q.t === 'mc' ? q.c[q.a] : q.a[0];
  const hinted = (s.hintLevel || 0) > 0;
  const expHtml = linkifyTenses(esc(q.exp || ''));
  let msg;
  if (s.revealedByHint) {
    msg = `<div class="fb almost">💡 The answer is <b>${esc(answerTxt)}</b>. ${expHtml}</div>
      <p class="cloze-fixnote">🔁 You'll type this one yourself before the results.</p>`;
  } else if (ok) {
    msg = `<div class="fb ok">✅ <b>¡Correcto!</b>${hinted
      ? ' <span class="hint-xp">(+5 XP — hint used, so it joins your review queue)</span>' : ''}
      ${expHtml}</div>`;
  } else if (accentMiss) {
    msg = `<div class="fb almost">🟡 <b>So close — check the accents.</b>
      The answer is <b>${esc(answerTxt)}</b>. ${expHtml}</div>`;
  } else {
    msg = `<div class="fb bad">❌ The answer is <b>${esc(answerTxt)}</b>. ${expHtml}</div>`;
  }
  if (q._fix && !ok) {
    msg += `<p class="cloze-fixnote">🔁 No worries — this one comes back around
      before the results.</p>`;
  }
  fb.innerHTML = msg;
  flagWidget(fb, {
    question: stripHtml(q.q),
    answer: answerTxt,
    context: `${s.mode || 'quiz'} · level ${q._level || s.level || '?'} · topic ${q._topic || s.topic || 'tenses'}`,
  });

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
      aria-label="Blank ${n}"><small class="cloze-hint">(${linkifyTenses(esc(b.hint))})</small></span>`;
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
    else misses.push({ n: i + 1, b, got: inp.value.trim(), accentMiss });

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
    msg += `<div class="cloze-review">
      <h4 class="cloze-review-head">Review your misses</h4>
      <ol class="cloze-review-list">${misses.map(({ n, b, got, accentMiss }) => `
        <li value="${n}">
          <p class="cr-context">«…${esc(clozeContext(q.text, n))}…» <span class="cr-hint">(${esc(b.hint)})</span></p>
          <p class="cr-line">${accentMiss ? '🟡' : '❌'} You wrote
            <b class="cr-got">${got ? esc(got) : '(nothing)'}</b> →
            <b class="cr-ans">${esc(b.a[0])}</b>${accentMiss ? ' — only the accent was off' : ''}</p>
          <p class="cr-exp">${esc(b.exp)}</p>
        </li>`).join('')}
      </ol>
      <p class="cloze-fixnote">🔧 Up next: retype each one correctly. They're also in
        your <b>review queue</b> for the coming days.</p>
    </div>`;

    // Immediate fix-it round: each miss becomes a typed question, repeated
    // at the end of the session until it's answered correctly.
    const fixQs = misses.map(({ n, b }) => ({
      t: 'type', _fix: true,
      q: `🔧 Fix-it — ${esc(q.title)}: «…${esc(clozeContext(q.text, n))}…»
        <span class="drill-hint">(${linkifyTenses(esc(b.hint))})</span>`,
      a: b.a, exp: b.exp,
    }));
    s.questions.splice(s.index + 1, 0, ...fixQs);
  }
  fb.innerHTML = msg;
  flagWidget(fb, {
    question: `Story «${q.title}» (${s.level})`,
    answer: q.blanks.map((b, i) => `${i + 1}. ${b.a[0]}`).join('; '),
    context: `story · level ${s.level}`,
  });

  const nextBtn = $('#next-btn');
  nextBtn.textContent = misses.length ? '🔧 Fix your mistakes →'
    : s.index + 1 < s.questions.length ? 'Next →' : 'See results';
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
    if (s.fixTotal) {
      sub += ` 🔧 Fix-it round: <b>${s.fixCorrect}/${missed}</b> ${missed === 1 ? 'miss' : 'misses'}
        retyped correctly${s.fixTotal > s.fixCorrect ? ` in ${s.fixTotal} tries` : ' on the first try'}.`;
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
  $('#profile-btn').addEventListener('click', openProfileModal);
  $('#profile-save').addEventListener('click', saveProfile);
  $('#profile-close').addEventListener('click', () => $('#profile-modal').classList.add('hidden'));
  $('#profile-modal').addEventListener('click', (e) => {
    if (e.target === $('#profile-modal')) $('#profile-modal').classList.add('hidden');
  });
  // Tense-name links appear anywhere inside the question card (prompt,
  // drill hints, cloze hints, feedback), so delegate from the container
  $('#question-box').addEventListener('click', (e) => {
    const link = e.target.closest('.tense-link');
    if (link) openTenseModal(link.dataset.tense);
  });
  $('#tense-close').addEventListener('click', () => $('#tense-modal').classList.add('hidden'));
  $('#tense-modal').addEventListener('click', (e) => {
    if (e.target === $('#tense-modal')) $('#tense-modal').classList.add('hidden');
  });
  $('#share-btn').addEventListener('click', shareResults);
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
