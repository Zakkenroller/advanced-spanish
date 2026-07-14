/* ============================================================
   Konjuga — Spanish trainer
   Views: home · lesson · practice (topic quiz / drill / placement) · results
   ============================================================ */

const STORE_KEY = 'konjuga-state-v1';
const LEGACY_STORE_KEY = 'adelante-state-v1'; // pre-rebrand; migrated on load

const state = load() || {
  level: null,          // null until chosen or placed
  xp: 0,
  streak: 0,            // best answer streak
  stats: {},            // `${level}:${topic}` -> { attempts, correct, recent: [] }
  placed: false,
  settings: { vosotros: true }, // vosotros/vosotras drilled & shown by default
};

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY))
        || JSON.parse(localStorage.getItem(LEGACY_STORE_KEY));
  } catch { return null; }
}
function save() {
  state._updatedAt = Date.now(); // lets cloud sync pick a winner across devices
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    localStorage.removeItem(LEGACY_STORE_KEY); // migration complete
  } catch {}
  if (typeof syncQueuePush === 'function') syncQueuePush();
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

/* ---------- vosotros toggle ----------
   The vosotros/vosotras "you all" form is used in Spain but not in Latin
   American Spanish. Learners who skip it can turn it off: it then disappears
   from conjugation tables, ending references, flashcards, and the drill. */
function settings() {
  if (!state.settings) state.settings = { vosotros: true };
  return state.settings;
}
function usesVosotros() {
  return settings().vosotros !== false;
}
// Person indices (into PERSONS / ending arrays) currently in play.
function activePersonIndices() {
  return usesVosotros() ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 5];
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

/* ---------- conjugation engine ----------
   A layered generator that turns an infinitive (plus a few declarative flags)
   into any form. Precedence, highest first:
     1. explicit `forms[tense]`  — the truly irregular paradigms
     2. vowel stem-change (`sc`) — pienso, puedo, pido …
     3. orthographic spelling fix — busqué, llegué, sigo …
     4. regular endings
   Verb-record flags (all optional): `forms` (explicit per-tense arrays),
   `stem` (irregular future/conditional stem, e.g. 'tendr'), `sc` (stem-vowel
   change 'e>ie' | 'o>ue' | 'e>i' | 'u>ue' | 'i>ie'), `zc` (-cer/-cir → -zc yo /
   subj: conozco), `acc` ('í'|'ú' — accented i/u in stressed present: envío). */

const VOWELS = 'aeiouáéíóúü';
const isVowelChar = (c) => !!c && VOWELS.includes(c);

function verbType(inf) {
  if (inf.endsWith('ar')) return 'ar';
  if (inf.endsWith('er')) return 'er';
  return 'ir'; // covers -ir and accented -ír (oír, reír)
}

// -uir verbs (construir, huir) insert/swap a y; -guir/-quir do not.
function isUir(inf) {
  return inf.endsWith('uir') && !inf.endsWith('guir') && !inf.endsWith('quir');
}

// 'e>ie' -> { from:'e', primary:'ie', secondary:'i' }. The secondary vowel is
// what -ir stem-changers use in the preterite/gerund/subjunctive-nosotros.
function diphthong(sc) {
  const [from, primary] = sc.split('>');
  const secondary = { ie: 'i', ue: 'u', i: 'i' }[primary] || primary;
  return { from, primary, secondary };
}

// Replace the LAST occurrence of `from` in the stem (the stressed vowel).
function swapLast(stem, from, to) {
  const i = stem.lastIndexOf(from);
  return i < 0 ? stem : stem.slice(0, i) + to + stem.slice(i + 1);
}

// The pure regular form — no stem/spelling changes. Kept deliberately dumb:
// callers use it to test whether a verb behaves regularly in a given slot.
function conjugateRegular(inf, tense, person) {
  const type = inf.slice(-2); // ar/er/ir
  const stem = inf.slice(0, -2);
  if (tense === 'future' || tense === 'conditional') {
    return inf + REGULAR_ENDINGS[tense].all[person];
  }
  return stem + REGULAR_ENDINGS[tense][type][person];
}

// Apply the vowel stem-change for the slot, if the verb declares one.
function stemChanged(stem, verb, tense, person) {
  if (!verb.sc) return stem;
  const { from, primary, secondary } = diphthong(verb.sc);
  const stressed = person === 0 || person === 1 || person === 2 || person === 5;
  const isIr = verbType(verb.inf) === 'ir';
  let to = null;
  if (tense === 'present') {
    if (stressed) to = primary;
  } else if (tense === 'presentSubj') {
    if (stressed) to = primary;
    else if (isIr) to = secondary; // pidamos, durmamos
  } else if (tense === 'preterite') {
    if (isIr && (person === 2 || person === 5)) to = secondary; // pidió, durmieron
  } else if (tense === 'imperfectSubj') {
    if (isIr) to = secondary; // built on the preterite stem: pidiera
  }
  return to ? swapLast(stem, from, to) : stem;
}

// Orthographic guard: fix a stem's final consonant for the ending that follows,
// so the sound is preserved (busqué, llegué, empiece, protejo, sigo, venzo).
function orthoStem(stem, ending, inf) {
  const c0 = ending[0];
  const frontE = c0 === 'e' || c0 === 'é';
  const backOA = c0 === 'o' || c0 === 'ó' || c0 === 'a' || c0 === 'á';
  if (frontE) {
    if (inf.endsWith('guar') && stem.endsWith('gu')) return stem.slice(0, -2) + 'gü';
    if (inf.endsWith('car') && stem.endsWith('c')) return stem.slice(0, -1) + 'qu';
    if (inf.endsWith('gar') && stem.endsWith('g')) return stem.slice(0, -1) + 'gu';
    if (inf.endsWith('zar') && stem.endsWith('z')) return stem.slice(0, -1) + 'c';
  } else if (backOA) {
    if (inf.endsWith('guir') && stem.endsWith('gu')) return stem.slice(0, -2) + 'g';
    if ((inf.endsWith('ger') || inf.endsWith('gir')) && stem.endsWith('g')) {
      return stem.slice(0, -1) + 'j';
    }
    // consonant + cer/cir → c→z (vencer→venzo); vowel+cer uses the `zc` flag
    if ((inf.endsWith('cer') || inf.endsWith('cir')) && stem.endsWith('c')
        && !isVowelChar(stem[stem.length - 2])) {
      return stem.slice(0, -1) + 'z';
    }
  }
  return stem;
}

// -uir: y appears before endings that start o/e/a, and i→y between vowels.
function uirAssemble(stem, ending) {
  const c0 = ending[0];
  if (c0 === 'i' && isVowelChar(ending[1])) return stem + 'y' + ending.slice(1); // ió, ieron, iera
  if ('oeaóéá'.includes(c0)) return stem + 'y' + ending; // construyo, construya, construyáis
  return stem + ending; // construí, construimos, construís, construía
}

function conjugate(verb, tense, person) {
  if (verb.forms && verb.forms[tense]) return verb.forms[tense][person];
  if (tense === 'future' || tense === 'conditional') {
    return (verb.stem || verb.inf) + REGULAR_ENDINGS[tense].all[person];
  }
  // imperfect takes no stem/spelling change — always regular
  if (tense === 'imperfect') return conjugateRegular(verb.inf, tense, person);

  const inf = verb.inf;
  const ending = REGULAR_ENDINGS[tense][verbType(inf)][person];
  let stem = stemChanged(inf.slice(0, -2), verb, tense, person);
  // accented i/u in stressed present (envío, continúo)
  if (verb.acc && (tense === 'present' || tense === 'presentSubj')
      && (person === 0 || person === 1 || person === 2 || person === 5)) {
    stem = swapLast(stem, verb.acc === 'í' ? 'i' : 'u', verb.acc);
  }
  if (isUir(inf)) return uirAssemble(stem, ending);
  stem = orthoStem(stem, ending, inf);
  // -cer/-cir inceptive: yo + all present-subjunctive gain -zc- (conozco).
  // Runs after orthoStem so the c→z guard doesn't touch the new -zc-.
  if (verb.zc && stem.endsWith('c')
      && ((tense === 'present' && person === 0) || tense === 'presentSubj')) {
    stem = stem.slice(0, -1) + 'zc';
  }
  return stem + ending;
}

/* Participle & gerund — regular by default, with small override maps in
   data.js for the handful that break the pattern (hecho, dicho, yendo…). */

function participle(verb) {
  if (IRREGULAR_PARTICIPLES[verb.inf]) return IRREGULAR_PARTICIPLES[verb.inf];
  const stem = verb.inf.slice(0, -2);
  if (verbType(verb.inf) === 'ar') return stem + 'ado';
  return (/[aeo]$/.test(stem) ? stem + 'ído' : stem + 'ido'); // leído, caído
}

function gerund(verb) {
  if (IRREGULAR_GERUNDS[verb.inf]) return IRREGULAR_GERUNDS[verb.inf];
  const inf = verb.inf;
  let stem = inf.slice(0, -2);
  if (verbType(inf) === 'ar') return stem + 'ando';
  if (isUir(inf)) return stem + 'yendo'; // construyendo
  if (/[aeoáéó]$/.test(stem)) return stem + 'yendo'; // leyendo, cayendo, trayendo
  if (verbType(inf) === 'ir' && verb.sc) {
    const { from, secondary } = diphthong(verb.sc);
    stem = swapLast(stem, from, secondary); // pidiendo, durmiendo
  }
  return stem + 'iendo';
}

// Compound tenses = the right form of haber + the participle (he hablado…).
function conjugateCompound(verb, tense, person) {
  return HABER_AUX[tense][person] + ' ' + participle(verb);
}

// One entry point for any tense, simple or compound.
function conjugateAny(verb, tense, person) {
  return HABER_AUX[tense]
    ? conjugateCompound(verb, tense, person)
    : conjugate(verb, tense, person);
}

// The full paradigm for the Verb Book: non-finite forms + every tense × person.
function verbParadigm(verb) {
  const out = {
    infinitive: verb.inf,
    participle: participle(verb),
    gerund: gerund(verb),
    tenses: {},
  };
  PARADIGM_GROUPS.forEach((g) => g.tenses.forEach((t) => {
    out.tenses[t] = PERSONS.map((_, i) => conjugateAny(verb, t, i));
  }));
  return out;
}

/* ---------- conjugation drill generator ---------- */

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

  const persons = activePersonIndices();
  const person = persons[Math.floor(Math.random() * persons.length)];
  const answer = conjugate(verb, tense, person);
  const info = TENSE_INFO[tense];
  const frame = pick(DRILL_FRAMES[tense]);
  const comp = pick(VERB_COMPS[verb.inf]);
  const subject = pick(PERSON_DISPLAY[person]);
  return {
    t: 'type',
    q: `${frame.pre} ${subject} ___ ${comp}${frame.post}<br>
      <small class="drill-hint"><button type="button" class="verb-link" data-verb="${verb.inf}">${verb.inf}</button> (${verb.en}) — ${info.name} (${info.en})</small>`,
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
    const person = pick(activePersonIndices());
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
  const subject = encodeURIComponent('Konjuga question flag: ' + flag.reason);
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

/*
 * "Amigos" avatar set: hand-drawn inline SVG characters — full-colour shapes
 * with an ink outline on a soft pastel disc. Self-contained by design: no
 * uploads, no external assets (see ROADMAP's avatar/moderation policy).
 * state.profile.avatar stores the stable `id`; `emoji` is kept for plain-text
 * shares and for migrating profiles saved before the SVG set existed.
 *
 * Shape kinds: c(ircle), e(llipse, optional rot), rect, poly, path,
 * line (ink stroke, e.g. smiles/whiskers), bline (body-colour stroke).
 * Fill roles: body (c1), body2 (c2), accent (acc), detail (det), face (ink).
 */

const AVATAR_INK = '#33281f';

const AVATARS = [
  { id: 'sol', label: 'Sol', emoji: '🙂', bg: '#dcebfa', p: { c1: '#f5c04a' }, shapes: [
    { k: 'bline', d: 'M32 7 L32 13 M32 51 L32 57 M7 32 L13 32 M51 32 L57 32 M14.3 14.3 L18.6 18.6 M45.4 45.4 L49.7 49.7 M49.7 14.3 L45.4 18.6 M18.6 45.4 L14.3 49.7', w: 4 },
    { k: 'c', x: 32, y: 32, rad: 15, r: 'body' },
    { k: 'c', x: 26.5, y: 29.5, rad: 2.2, r: 'face' }, { k: 'c', x: 37.5, y: 29.5, rad: 2.2, r: 'face' },
    { k: 'line', d: 'M27 36 Q32 39.5 37 36', w: 2.5 },
  ] },
  { id: 'limon', label: 'Limón', emoji: '😎', bg: '#f3e8fb', p: { c1: '#e0d14f', det: '#5aa35a' }, shapes: [
    { k: 'rect', x: 30.5, y: 18, w: 3, h: 9, rx: 1.5, r: 'detail' },
    { k: 'e', x: 38, y: 20, rx: 5, ry: 2.8, rot: 25, r: 'detail' },
    { k: 'c', x: 14, y: 38, rad: 3.5, r: 'body' }, { k: 'c', x: 50, y: 38, rad: 3.5, r: 'body' },
    { k: 'e', x: 32, y: 38, rx: 17, ry: 12.5, r: 'body' },
    { k: 'c', x: 26, y: 36, rad: 2.2, r: 'face' }, { k: 'c', x: 38, y: 36, rad: 2.2, r: 'face' },
    { k: 'line', d: 'M27 42 Q32 45 37 42', w: 2.5 },
  ] },
  { id: 'lapiz', label: 'Lápiz', emoji: '🤓', bg: '#e6f3d8', p: { c1: '#f2a33c', acc: '#f6e3c2', det: '#f08fb1' }, shapes: [
    { k: 'rect', x: 25, y: 8, w: 14, h: 8, rx: 2.5, r: 'detail' },
    { k: 'rect', x: 25, y: 14, w: 14, h: 30, rx: 2, r: 'body' },
    { k: 'poly', pts: '25,44 39,44 32,56', r: 'accent' },
    { k: 'poly', pts: '29.5,51.5 34.5,51.5 32,56', r: 'face' },
    { k: 'c', x: 28.5, y: 26, rad: 2, r: 'face' }, { k: 'c', x: 35.5, y: 26, rad: 2, r: 'face' },
    { k: 'line', d: 'M29 31 Q32 33.5 35 31', w: 2 },
  ] },
  { id: 'buho', label: 'Búho', emoji: '🦉', bg: '#e6f3d8', p: { c1: '#9a7355', acc: '#f2e2c8', det: '#f2b53c' }, shapes: [
    { k: 'poly', pts: '18,10 27,18 14,21', r: 'body' }, { k: 'poly', pts: '46,10 37,18 50,21', r: 'body' },
    { k: 'e', x: 32, y: 36, rx: 19, ry: 21, r: 'body' },
    { k: 'e', x: 32, y: 46, rx: 11, ry: 9, r: 'accent' },
    { k: 'c', x: 24, y: 28, rad: 7, r: 'accent' }, { k: 'c', x: 40, y: 28, rad: 7, r: 'accent' },
    { k: 'c', x: 24, y: 28, rad: 3, r: 'face' }, { k: 'c', x: 40, y: 28, rad: 3, r: 'face' },
    { k: 'poly', pts: '28,35 36,35 32,42', r: 'detail' },
  ] },
  { id: 'rana', label: 'Rana', emoji: '🐸', bg: '#fff3c9', p: { c1: '#6cbf5a', acc: '#ffffff' }, shapes: [
    { k: 'c', x: 21, y: 22, rad: 8, r: 'body' }, { k: 'c', x: 43, y: 22, rad: 8, r: 'body' },
    { k: 'e', x: 32, y: 38, rx: 20, ry: 16, r: 'body' },
    { k: 'c', x: 21, y: 22, rad: 4.5, r: 'accent' }, { k: 'c', x: 43, y: 22, rad: 4.5, r: 'accent' },
    { k: 'c', x: 21, y: 22, rad: 2.2, r: 'face' }, { k: 'c', x: 43, y: 22, rad: 2.2, r: 'face' },
    { k: 'line', d: 'M24 42 Q32 48 40 42', w: 2.5 },
  ] },
  { id: 'zorro', label: 'Zorro', emoji: '🦊', bg: '#dcebfa', p: { c1: '#ec8f3f', acc: '#ffedd9' }, shapes: [
    { k: 'poly', pts: '16,8 28,20 12,24', r: 'body' }, { k: 'poly', pts: '48,8 36,20 52,24', r: 'body' },
    { k: 'c', x: 32, y: 34, rad: 19, r: 'body' },
    { k: 'e', x: 32, y: 42, rx: 9, ry: 7, r: 'accent' },
    { k: 'c', x: 24, y: 31, rad: 2.6, r: 'face' }, { k: 'c', x: 40, y: 31, rad: 2.6, r: 'face' },
    { k: 'c', x: 32, y: 40, rad: 2.8, r: 'face' },
  ] },
  { id: 'tortuga', label: 'Tortuga', emoji: '🐢', bg: '#dcebfa', p: { c1: '#5aa35a', c2: '#8fd08f', acc: '#cfe8b0' }, shapes: [
    { k: 'c', x: 32, y: 17, rad: 8, r: 'body2' },
    { k: 'e', x: 14, y: 46, rx: 5, ry: 4, r: 'body2' }, { k: 'e', x: 50, y: 46, rx: 5, ry: 4, r: 'body2' },
    { k: 'c', x: 32, y: 38, rad: 17, r: 'body' },
    { k: 'c', x: 32, y: 38, rad: 9, r: 'accent' },
    { k: 'c', x: 29, y: 15, rad: 1.8, r: 'face' }, { k: 'c', x: 35, y: 15, rad: 1.8, r: 'face' },
  ] },
  { id: 'loro', label: 'Loro', emoji: '🦜', bg: '#dff0f5', p: { c1: '#e05a4a', c2: '#4aa869', acc: '#f6d34e', det: '#e8a33c' }, shapes: [
    { k: 'poly', pts: '26,54 36,54 31,63', r: 'detail' },
    { k: 'e', x: 31, y: 44, rx: 12, ry: 14, r: 'body2' },
    { k: 'c', x: 30, y: 24, rad: 13, r: 'body' },
    { k: 'e', x: 24, y: 44, rx: 6, ry: 11, r: 'accent' },
    { k: 'poly', pts: '41,17 53,24 42,32', r: 'detail' },
    { k: 'c', x: 33, y: 22, rad: 4.5, r: 'accent' },
    { k: 'c', x: 33, y: 22, rad: 2.2, r: 'face' },
  ] },
  { id: 'perro', label: 'Perro', emoji: '🐕', bg: '#ffe8cf', p: { c1: '#c99a6a', c2: '#a97e4f', acc: '#f2e2c8' }, shapes: [
    { k: 'e', x: 14, y: 32, rx: 6, ry: 11, rot: 12, r: 'body2' },
    { k: 'e', x: 50, y: 32, rx: 6, ry: 11, rot: -12, r: 'body2' },
    { k: 'c', x: 32, y: 36, rad: 19, r: 'body' },
    { k: 'e', x: 32, y: 43, rx: 9.5, ry: 7.5, r: 'accent' },
    { k: 'c', x: 24, y: 31, rad: 2.6, r: 'face' }, { k: 'c', x: 40, y: 31, rad: 2.6, r: 'face' },
    { k: 'e', x: 32, y: 40.5, rx: 3.4, ry: 2.6, r: 'face' },
  ] },
  { id: 'gato', label: 'Gato', emoji: '🐱', bg: '#f3e8fb', p: { c1: '#aab2bd', acc: '#f6d9e3' }, shapes: [
    { k: 'poly', pts: '16,10 28,18 14,26', r: 'body' }, { k: 'poly', pts: '48,10 36,18 50,26', r: 'body' },
    { k: 'c', x: 32, y: 36, rad: 19, r: 'body' },
    { k: 'c', x: 24, y: 33, rad: 2.6, r: 'face' }, { k: 'c', x: 40, y: 33, rad: 2.6, r: 'face' },
    { k: 'poly', pts: '29,40 35,40 32,44', r: 'face' },
    { k: 'line', d: 'M11 36 L21 38 M11 43 L21 42', w: 2 },
    { k: 'line', d: 'M53 36 L43 38 M53 43 L43 42', w: 2 },
  ] },
  { id: 'cactus', label: 'Cactus', emoji: '🌵', bg: '#ffe8cf', p: { c1: '#58a95e', acc: '#f08fb1' }, shapes: [
    { k: 'c', x: 32, y: 12, rad: 4.5, r: 'accent' },
    { k: 'rect', x: 11, y: 20, w: 9, h: 16, rx: 4.5, r: 'body' },
    { k: 'rect', x: 15, y: 29, w: 13, h: 8, rx: 4, r: 'body' },
    { k: 'rect', x: 44, y: 16, w: 9, h: 18, rx: 4.5, r: 'body' },
    { k: 'rect', x: 36, y: 27, w: 13, h: 8, rx: 4, r: 'body' },
    { k: 'rect', x: 25, y: 13, w: 14, h: 38, rx: 7, r: 'body' },
    { k: 'c', x: 28, y: 31, rad: 2.2, r: 'face' }, { k: 'c', x: 36, y: 31, rad: 2.2, r: 'face' },
    { k: 'line', d: 'M28 37 Q32 40 36 37', w: 2.5 },
  ] },
  { id: 'taco', label: 'Taco', emoji: '🌮', bg: '#e6f3d8', p: { c1: '#f2c14e', acc: '#7cc35e', det: '#e05a4a' }, shapes: [
    { k: 'c', x: 16, y: 30, rad: 5, r: 'accent' }, { k: 'c', x: 24, y: 26, rad: 5.5, r: 'detail' },
    { k: 'c', x: 32, y: 24, rad: 6, r: 'accent' }, { k: 'c', x: 40, y: 26, rad: 5.5, r: 'detail' },
    { k: 'c', x: 48, y: 30, rad: 5, r: 'accent' },
    { k: 'path', d: 'M10 30 A22 22 0 0 0 54 30 Z', r: 'body' },
    { k: 'c', x: 26, y: 39, rad: 2.2, r: 'face' }, { k: 'c', x: 38, y: 39, rad: 2.2, r: 'face' },
    { k: 'line', d: 'M27 44 Q32 47 37 44', w: 2.5 },
  ] },
  { id: 'chile', label: 'Chile', emoji: '🌶️', bg: '#fff3c9', p: { c1: '#d8402f', det: '#5aa35a' }, shapes: [
    { k: 'rect', x: 30.5, y: 15, w: 3, h: 8, rx: 1.5, r: 'detail' },
    { k: 'e', x: 37, y: 20, rx: 4.5, ry: 2.5, rot: 25, r: 'detail' },
    { k: 'e', x: 32, y: 39, rx: 10, ry: 17, r: 'body' },
    { k: 'c', x: 28, y: 34, rad: 2.2, r: 'face' }, { k: 'c', x: 36, y: 34, rad: 2.2, r: 'face' },
    { k: 'line', d: 'M28 41 Q32 44 36 41', w: 2.5 },
  ] },
  { id: 'uvas', label: 'Uvas', emoji: '🍇', bg: '#fff3c9', p: { c1: '#9d6bc3', det: '#5aa35a' }, shapes: [
    { k: 'rect', x: 30.5, y: 10, w: 3, h: 9, rx: 1.5, r: 'detail' },
    { k: 'e', x: 38, y: 14, rx: 5.5, ry: 3, rot: 25, r: 'detail' },
    { k: 'c', x: 24, y: 25, rad: 7, r: 'body' }, { k: 'c', x: 40, y: 25, rad: 7, r: 'body' },
    { k: 'c', x: 18, y: 34, rad: 7, r: 'body' }, { k: 'c', x: 46, y: 34, rad: 7, r: 'body' },
    { k: 'c', x: 24, y: 43, rad: 7, r: 'body' }, { k: 'c', x: 40, y: 43, rad: 7, r: 'body' },
    { k: 'c', x: 32, y: 51, rad: 7, r: 'body' },
    { k: 'c', x: 32, y: 32, rad: 7.5, r: 'body' },
    { k: 'c', x: 29, y: 31, rad: 1.9, r: 'face' }, { k: 'c', x: 35, y: 31, rad: 1.9, r: 'face' },
    { k: 'line', d: 'M29.5 35.5 Q32 37.5 34.5 35.5', w: 1.8 },
  ] },
  { id: 'naranja', label: 'Naranja', emoji: '🍊', bg: '#dcebfa', p: { c1: '#f2953c', det: '#5aa35a' }, shapes: [
    { k: 'rect', x: 30.5, y: 12, w: 3, h: 8, rx: 1.5, r: 'detail' },
    { k: 'e', x: 39, y: 16, rx: 5.5, ry: 3, rot: 30, r: 'detail' },
    { k: 'c', x: 32, y: 37, rad: 17.5, r: 'body' },
    { k: 'c', x: 26, y: 34, rad: 2.4, r: 'face' }, { k: 'c', x: 38, y: 34, rad: 2.4, r: 'face' },
    { k: 'line', d: 'M27 41 Q32 44.5 37 41', w: 2.5 },
  ] },
  { id: 'cafe', label: 'Café', emoji: '☕', bg: '#dcebfa', p: { c1: '#d96a4a', acc: '#f2e2c8' }, shapes: [
    { k: 'line', d: 'M26 20 Q23.5 16 26 11', w: 2.5 }, { k: 'line', d: 'M36 20 Q33.5 16 36 11', w: 2.5 },
    { k: 'bline', d: 'M44 30 A6 6 0 1 1 44 40', w: 4 },
    { k: 'e', x: 31, y: 49, rx: 17, ry: 4, r: 'accent' },
    { k: 'rect', x: 18, y: 25, w: 26, h: 21, rx: 6, r: 'body' },
    { k: 'c', x: 27, y: 33, rad: 2.2, r: 'face' }, { k: 'c', x: 37, y: 33, rad: 2.2, r: 'face' },
    { k: 'line', d: 'M27.5 38.5 Q32 41.5 36.5 38.5', w: 2.5 },
  ] },
  { id: 'guitarra', label: 'Guitarra', emoji: '🎸', bg: '#dff0f5', p: { c1: '#c98d4f', acc: '#f2e2c8', det: '#7a5232' }, shapes: [
    { k: 'rect', x: 28, y: 2, w: 8, h: 7, rx: 2, r: 'detail' },
    { k: 'rect', x: 29.5, y: 5, w: 5, h: 22, rx: 2, r: 'detail' },
    { k: 'c', x: 32, y: 31, rad: 10, r: 'body' },
    { k: 'c', x: 32, y: 45, rad: 14, r: 'body' },
    { k: 'c', x: 32, y: 38, rad: 5, r: 'face' },
    { k: 'rect', x: 27, y: 50, w: 10, h: 3.5, rx: 1.75, r: 'detail' },
  ] },
  { id: 'balon', label: 'Balón', emoji: '⚽', bg: '#e6f3d8', p: { c1: '#f6f2e8' }, shapes: [
    { k: 'c', x: 32, y: 34, rad: 18, r: 'body' },
    { k: 'line', d: 'M32 24 L32 16.2 M40 30 L48.8 26.5 M37 39.5 L42.5 48 M27 39.5 L21.5 48 M24 30 L15.2 26.5', w: 2 },
    { k: 'poly', pts: '32,24 40,30 37,39.5 27,39.5 24,30', r: 'face' },
  ] },
  { id: 'surf', label: 'Surf', emoji: '🏄', bg: '#fbe0e0', p: { c1: '#5ec8d8', acc: '#f6f2e8' }, shapes: [
    { k: 'e', x: 32, y: 32, rx: 11, ry: 26, r: 'body' },
    { k: 'rect', x: 30, y: 8, w: 4, h: 48, rx: 2, r: 'accent' },
    { k: 'c', x: 26.5, y: 22, rad: 2.2, r: 'face' }, { k: 'c', x: 37.5, y: 22, rad: 2.2, r: 'face' },
    { k: 'line', d: 'M28 28 Q32 31 36 28', w: 2.5 },
  ] },
  { id: 'avion', label: 'Avión', emoji: '✈️', bg: '#fff3c9', p: { c1: '#e8ecf2', c2: '#c5ccd8' }, shapes: [
    { k: 'poly', pts: '8,45 55,16 33,43', r: 'body' },
    { k: 'poly', pts: '33,43 55,16 37,53', r: 'body2' },
  ] },
  { id: 'paleta', label: 'Paleta', emoji: '🎨', bg: '#fbe0e0', p: { c1: '#d8b078', c2: '#4aa869', acc: '#f6d34e', det: '#e05a4a' }, shapes: [
    { k: 'c', x: 32, y: 36, rad: 19, r: 'body' },
    { k: 'c', x: 41, y: 46, rad: 5.5, r: 'face' },
    { k: 'c', x: 21, y: 32, rad: 3.8, r: 'detail' },
    { k: 'c', x: 27, y: 24, rad: 3.8, r: 'accent' },
    { k: 'c', x: 37, y: 23, rad: 3.8, r: 'body2' },
    { k: 'c', x: 45, y: 29, rad: 3.8, f: '#4a7fb5' },
  ] },
  { id: 'libro', label: 'Libro', emoji: '📚', bg: '#ffe8cf', p: { c1: '#4a7fb5', c2: '#3a6690', det: '#e05a4a' }, shapes: [
    { k: 'rect', x: 19, y: 13, w: 27, h: 38, rx: 3, r: 'body' },
    { k: 'rect', x: 19, y: 13, w: 7, h: 38, rx: 3, r: 'body2' },
    { k: 'poly', pts: '38,13 44,13 44,24 41,20 38,24', r: 'detail' },
    { k: 'c', x: 32, y: 32, rad: 2.2, r: 'face' }, { k: 'c', x: 40, y: 32, rad: 2.2, r: 'face' },
    { k: 'line', d: 'M32.5 38 Q36 41 39.5 38', w: 2.5 },
  ] },
  { id: 'ola', label: 'Ola', emoji: '🌊', bg: '#fff3c9', p: { c1: '#4fa8d8', acc: '#f6f2e8' }, shapes: [
    { k: 'path', d: 'M7 50 Q7 27 30 22.5 Q53 18 55 50 Z', r: 'body' },
    { k: 'c', x: 14, y: 37, rad: 5, r: 'accent' },
    { k: 'c', x: 21.5, y: 29, rad: 5.5, r: 'accent' },
    { k: 'c', x: 31, y: 23.5, rad: 5, r: 'accent' },
    { k: 'c', x: 37, y: 37, rad: 2.2, r: 'face' }, { k: 'c', x: 45, y: 37, rad: 2.2, r: 'face' },
    { k: 'line', d: 'M38 42.5 Q41.5 45 45 42.5', w: 2.5 },
  ] },
  { id: 'estrella', label: 'Estrella', emoji: '⭐', bg: '#f3e8fb', p: { c1: '#f5c842' }, shapes: [
    { k: 'poly', pts: '32,13 37.3,26.7 52,27.5 40.6,36.8 44.3,51 32,43 19.7,51 23.4,36.8 12,27.5 26.7,26.7', r: 'body' },
    { k: 'c', x: 27.5, y: 30, rad: 2.2, r: 'face' }, { k: 'c', x: 36.5, y: 30, rad: 2.2, r: 'face' },
    { k: 'line', d: 'M28 35.5 Q32 38.5 36 35.5', w: 2.5 },
  ] },
];

const AVATAR_BY_ID = Object.fromEntries(AVATARS.map((a) => [a.id, a]));
const AVATAR_BY_EMOJI = Object.fromEntries(AVATARS.map((a) => [a.emoji, a]));

// Accepts an avatar id, a legacy emoji (pre-SVG profiles), or garbage.
function getAvatar(value) {
  return AVATAR_BY_ID[value] || AVATAR_BY_EMOJI[value] || AVATAR_BY_ID.sol;
}

function avatarFill(role, p) {
  if (role === 'body') return p.c1;
  if (role === 'body2') return p.c2 || p.c1;
  if (role === 'accent') return p.acc || '#fff7ea';
  if (role === 'detail') return p.det || p.c2 || p.c1;
  return AVATAR_INK; // face
}

function avatarSVG(a) {
  const parts = a.shapes.map((s) => {
    if (s.k === 'line' || s.k === 'bline') {
      const col = s.k === 'line' ? AVATAR_INK : a.p.c1;
      return `<path d="${s.d}" fill="none" stroke="${col}" stroke-width="${s.w}"
        stroke-linecap="round" stroke-linejoin="round"/>`;
    }
    const fill = s.f || avatarFill(s.r, a.p); // s.f = explicit one-off colour
    const outline = s.r === 'face' ? '' :
      ` stroke="${AVATAR_INK}" stroke-width="2" stroke-linejoin="round"`;
    if (s.k === 'c') return `<circle cx="${s.x}" cy="${s.y}" r="${s.rad}" fill="${fill}"${outline}/>`;
    if (s.k === 'e') {
      const rot = s.rot ? ` transform="rotate(${s.rot} ${s.x} ${s.y})"` : '';
      return `<ellipse cx="${s.x}" cy="${s.y}" rx="${s.rx}" ry="${s.ry}" fill="${fill}"${outline}${rot}/>`;
    }
    if (s.k === 'rect') return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.rx}" fill="${fill}"${outline}/>`;
    if (s.k === 'poly') return `<polygon points="${s.pts}" fill="${fill}"${outline}/>`;
    return `<path d="${s.d}" fill="${fill}"${outline}/>`;
  });
  return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${parts.join('')}</svg>`;
}

function profile() {
  if (!state.profile) state.profile = { name: '', avatar: 'sol' };
  // Migrate legacy emoji values (and anything unknown) to a stable id.
  state.profile.avatar = getAvatar(state.profile.avatar).id;
  return state.profile;
}

function openProfileModal() {
  const p = profile();
  $('#profile-name').value = p.name;
  const grid = $('#avatar-grid');
  grid.innerHTML = AVATARS.map((a) => `
    <button type="button" class="avatar-choice ${a.id === p.avatar ? 'selected' : ''}"
       data-a="${a.id}" style="background:${a.bg}" title="${a.label}"
       aria-label="${a.label}">${avatarSVG(a)}</button>`).join('');
  grid.querySelectorAll('.avatar-choice').forEach((b) => {
    b.addEventListener('click', () => {
      grid.querySelectorAll('.avatar-choice').forEach((x) => x.classList.remove('selected'));
      b.classList.add('selected');
      
      b.classList.remove('clicked');
      void b.offsetWidth; // trigger reflow
      b.classList.add('clicked');
    });
    b.addEventListener('animationend', () => {
      b.classList.remove('clicked');
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
  const emoji = getAvatar(p.avatar).emoji; // shares are plain text — use the emoji twin
  const who = p.name ? `${emoji} ${p.name}` : emoji;
  const where = /^https?:$/.test(location.protocol) ? ` ${location.origin}${location.pathname}` : '';
  const text = `${who} — ${headline}` +
    `${lvl ? ` (level ${lvl.cefr})` : ''} on Konjuga, the Spanish grammar trainer.${where}`;
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
  const av = getAvatar(p.avatar);
  btn.style.background = av.bg;
  btn.innerHTML = avatarSVG(av);
  btn.title = p.name ? `${p.name} — edit profile` : 'Set up your profile';
  btn.setAttribute('aria-label', btn.title);
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
  const vTog = $('#vosotros-toggle');
  if (vTog) vTog.checked = usesVosotros();
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
    </div>
    <div class="card topic-card">
      <div class="topic-head"><span class="topic-icon">📚</span><h3>Verb Book</h3></div>
      <p class="topic-level-desc">Look up any of <b>${VERB_LIST.length} verbs</b> and see it fully
        conjugated — every tense, plus participle and gerund. Just like the old verb-tense books.</p>
      <div class="card-actions"><button class="btn primary" id="verbbook-btn">📖 Browse verbs</button></div>
    </div>
    <div class="card topic-card">
      <div class="topic-head"><span class="topic-icon">🃏</span><h3>Ending Flashcards</h3></div>
      <p class="topic-level-desc">Flip through all <b>${FLASHCARD_TENSES.length} tenses</b>: the verb
        endings on one side, what each tense means and when to use it on the other. Quiz yourself,
        then check.</p>
      <div class="card-actions"><button class="btn primary" id="flashcards-btn">🃏 Study endings</button></div>
    </div>`;

  $('#toolkit-btn').addEventListener('click', renderToolkit);
  $('#detective-btn').addEventListener('click', () => startSession('detective', state.level, null));
  $('#story-btn').addEventListener('click', () => startSession('story', state.level, null));
  $('#workout-btn').addEventListener('click', () => startSession('workout', state.level, null));
  $('#verbbook-btn').addEventListener('click', renderVerbBook);
  $('#flashcards-btn').addEventListener('click', renderFlashcards);
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
  const idxs = activePersonIndices();
  if (e.all) {
    return `<table class="endings-table">
      ${idxs.map((i) =>
        `<tr><td>${PERSONS[i].label}</td><td>infinitive + <b>-${e.all[i]}</b></td></tr>`).join('')}
    </table>`;
  }
  return `<table class="endings-table">
    <tr><th></th><th>-ar</th><th>-er</th><th>-ir</th></tr>
    ${idxs.map((i) =>
      `<tr><td>${PERSONS[i].label}</td><td>-${e.ar[i]}</td><td>-${e.er[i]}</td><td>-${e.ir[i]}</td></tr>`).join('')}
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

/* ---------- verb book: full conjugation tables ----------
   Mirrors the tense modal: a data-attribute + delegated click opens a popup,
   here showing a verb's whole paradigm generated by the engine above. */

// Spanish + English name for any tense (simple names live in TENSE_INFO;
// compound ones only in TENSE_REFERENCE).
function tenseLabel(t) {
  if (TENSE_INFO[t]) return { es: TENSE_INFO[t].name, en: TENSE_INFO[t].en };
  const r = TENSE_REFERENCE[t];
  return { es: r.names[0], en: r.names[r.names.length - 1] };
}

// One mood-group table: persons down the side, tenses across the top.
function conjTableHTML(group, para) {
  const heads = group.tenses.map((t) => {
    const n = tenseLabel(t);
    return `<th>${esc(n.es)}<br><small>${esc(n.en)}</small></th>`;
  }).join('');
  const rows = activePersonIndices().map((i) => {
    const cells = group.tenses.map((t) => `<td>${esc(para.tenses[t][i])}</td>`).join('');
    return `<tr><th class="person">${esc(PERSONS[i].label)}</th>${cells}</tr>`;
  }).join('');
  return `<div class="conj-scroll"><table class="conj-table">
    <tr><th></th>${heads}</tr>${rows}</table></div>`;
}

function openVerbModal(inf) {
  const verb = allVerbs().find((v) => v.inf === inf);
  if (!verb) return;
  const para = verbParadigm(verb);
  const tag = verb.forms ? 'irregular'
    : verb.sc ? `stem-changing (${verb.sc.replace('>', '→')})`
      : 'regular';
  $('#verb-modal-body').innerHTML = `
    <h3>📚 ${esc(verb.inf)} <small class="verb-en">— ${esc(verb.en)}</small></h3>
    <p class="verb-tag">${esc(tag)}</p>
    <table class="conj-table nonfinite">
      <tr><th>infinitive</th><td>${esc(para.infinitive)}</td></tr>
      <tr><th>participle</th><td>${esc(para.participle)}</td></tr>
      <tr><th>gerund</th><td>${esc(para.gerund)}</td></tr>
    </table>
    ${PARADIGM_GROUPS.map((g) =>
      `<h4 class="conj-group">${esc(g.label)}</h4>${conjTableHTML(g, para)}`).join('')}`;
  $('#verb-modal').classList.remove('hidden');
}

function renderVerbBook() {
  const list = $('#verb-list');
  const search = $('#verb-search');
  const draw = (filter) => {
    const q = (filter || '').trim().toLowerCase();
    const verbs = allVerbs().filter((v) =>
      !q || v.inf.toLowerCase().includes(q) || v.en.toLowerCase().includes(q));
    list.innerHTML = verbs.length
      ? verbs.map((v) => `
        <button type="button" class="verb-chip" data-verb="${esc(v.inf)}">
          <span class="chip-inf">${esc(v.inf)}</span>
          <span class="chip-en">${esc(v.en)}</span>
        </button>`).join('')
      : `<p class="hint">No verbs match “${esc(q)}”.</p>`;
  };
  search.value = '';
  search.oninput = () => draw(search.value);
  draw('');
  show('#view-verbs');
}

/* ---------- ending flashcards ----------
   A study deck built from the same TENSE_REFERENCE source as the tense popup:
   the front names a tense, the back reveals its endings (or compound formula)
   plus what it is and when to use it. Ending tables honour the vosotros toggle. */

// Simple tenses first (in learning order), then the compound tenses.
const FLASHCARD_TENSES = [
  'present', 'preterite', 'imperfect', 'future', 'conditional',
  'presentSubj', 'imperfectSubj',
  'perfect', 'pluperfect', 'futurePerfect', 'conditionalPerfect',
];

let flashState = null; // { order: [tenseKey], index, flipped }

function flashcardFrontHTML(ref) {
  const es = ref.names[0];
  const en = ref.names[ref.names.length - 1];
  return `<div class="fc-face fc-front">
    <span class="fc-kicker">tense</span>
    <h3 class="fc-title">${esc(es)}</h3>
    ${en !== es ? `<p class="fc-sub">${esc(en)}</p>` : ''}
    <p class="fc-prompt">Do you know how it's formed and when to use it?</p>
    <p class="fc-tap">Tap to reveal →</p>
  </div>`;
}

function flashcardBackHTML(ref) {
  const es = ref.names[0];
  const en = ref.names[ref.names.length - 1];
  const build = ref.endings
    ? `<p class="endings-title"><b>Endings${REGULAR_ENDINGS[ref.endings].all
        ? ' (added to the whole infinitive)' : ''}:</b></p>${endingsTableHTML(ref.endings)}`
    : `<p><b>How it's built:</b> ${esc(ref.formula)}.</p>`;
  return `<div class="fc-face fc-back">
    <h3 class="fc-title">${esc(es)}${en !== es
      ? ` <small class="tense-en">(${esc(en)})</small>` : ''}</h3>
    <p><b>What it is:</b> ${esc(ref.what)}</p>
    <p><b>When to use it:</b> ${esc(ref.when)}</p>
    ${build}
    <p class="tense-irreg">⚠️ ${esc(ref.irregular)}</p>
  </div>`;
}

function drawFlashcard() {
  const ref = TENSE_REFERENCE[flashState.order[flashState.index]];
  const el = $('#flashcard');
  el.classList.toggle('flipped', flashState.flipped);
  el.innerHTML = flashState.flipped ? flashcardBackHTML(ref) : flashcardFrontHTML(ref);
  $('#fc-counter').textContent = `${flashState.index + 1} / ${flashState.order.length}`;
}

function flashStep(delta) {
  const n = flashState.order.length;
  flashState.index = (flashState.index + delta + n) % n;
  flashState.flipped = false;
  drawFlashcard();
}

function renderFlashcards() {
  flashState = { order: FLASHCARD_TENSES.slice(), index: 0, flipped: false };
  drawFlashcard();
  show('#view-flashcards');
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
  return VERB_LIST;
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
    ${activePersonIndices().map((i) => `${PERSONS[i].label} <b>-${endings[i]}</b>`).join(' · ')}`;
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
  // Tense-name and verb links appear anywhere inside the question card (prompt,
  // drill hints, cloze hints, feedback), so delegate from the container
  $('#question-box').addEventListener('click', (e) => {
    const tense = e.target.closest('.tense-link');
    if (tense) { openTenseModal(tense.dataset.tense); return; }
    const verb = e.target.closest('.verb-link');
    if (verb) openVerbModal(verb.dataset.verb);
  });
  $('#tense-close').addEventListener('click', () => $('#tense-modal').classList.add('hidden'));
  $('#tense-modal').addEventListener('click', (e) => {
    if (e.target === $('#tense-modal')) $('#tense-modal').classList.add('hidden');
  });
  // Verb Book: chips (redrawn on search) delegate from the list container
  $('#verb-list').addEventListener('click', (e) => {
    const chip = e.target.closest('.verb-chip');
    if (chip) openVerbModal(chip.dataset.verb);
  });
  $('#verb-close').addEventListener('click', () => $('#verb-modal').classList.add('hidden'));
  $('#verb-modal').addEventListener('click', (e) => {
    if (e.target === $('#verb-modal')) $('#verb-modal').classList.add('hidden');
  });
  $('#share-btn').addEventListener('click', shareResults);
  // Ending flashcards: flip on tap, step through the deck, or reshuffle
  $('#flashcard').addEventListener('click', () => {
    flashState.flipped = !flashState.flipped;
    drawFlashcard();
  });
  $('#fc-prev').addEventListener('click', () => flashStep(-1));
  $('#fc-next').addEventListener('click', () => flashStep(1));
  $('#fc-flip').addEventListener('click', () => {
    flashState.flipped = !flashState.flipped;
    drawFlashcard();
  });
  $('#fc-shuffle').addEventListener('click', () => {
    flashState.order = shuffle(flashState.order);
    flashState.index = 0;
    flashState.flipped = false;
    drawFlashcard();
  });
  // Vosotros toggle: drop or restore the Spain-only "you all" form everywhere
  $('#vosotros-toggle').addEventListener('change', (e) => {
    settings().vosotros = e.target.checked;
    save();
  });
  document.querySelectorAll('.home-link').forEach((b) =>
    b.addEventListener('click', renderHome));
  $('#reset-btn').addEventListener('click', async () => {
    if (confirm('Reset all progress (XP, streak, level, stats)?')) {
      // Clear the cloud copy too, or sign-in would just restore everything
      if (typeof syncReset === 'function') await syncReset();
      localStorage.removeItem(STORE_KEY);
      localStorage.removeItem(LEGACY_STORE_KEY);
      location.reload();
    }
  });
  renderHome();
});
