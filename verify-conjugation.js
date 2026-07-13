/* ============================================================
   Konjuga — conjugation engine checker (dev tool, NOT shipped)
   ------------------------------------------------------------
   The Verb Book generates thousands of forms from a small engine
   (app.js) + declarative verb data (data.js). This asserts the
   generated output against a hand-written golden fixture that
   covers every conjugation pattern the engine claims to handle.

     node verify-conjugation.js      # exits non-zero on any mismatch

   No dependencies: it loads data.js + app.js in a stubbed sandbox
   (the browser globals they touch at load time are faked) and calls
   the real conjugate/participle/gerund/verbParadigm functions.
   ============================================================ */

'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// --- load data.js + app.js into one sandboxed scope ---------------------
const read = (f) => fs.readFileSync(path.join(__dirname, f), 'utf8');
const sandbox = {
  console,
  // Minimal browser stubs so top-level code in app.js doesn't throw at load.
  document: { addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] },
  window: {},
  navigator: { userAgent: 'node' },
  location: { reload() {} },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const exportLine = `;globalThis.__ENGINE = {
  conjugateAny, participle, gerund, verbParadigm, VERB_LIST, PARADIGM_GROUPS, PERSONS
};`;
vm.runInContext(read('data.js') + '\n' + read('app.js') + exportLine, sandbox, {
  filename: 'konjuga-bundle.js',
});
const { conjugateAny, participle, gerund, verbParadigm, VERB_LIST } = sandbox.__ENGINE;
const verbByInf = (inf) => VERB_LIST.find((v) => v.inf === inf);

// --- golden fixture ------------------------------------------------------
// Person order: yo, tú, él/ella, nosotros, vosotros, ellos/ellas.
// Each verb lists only the tenses that exercise its pattern (plus part/ger).
const FIXTURE = {
  // regular models
  hablar: {
    present: ['hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan'],
    preterite: ['hablé', 'hablaste', 'habló', 'hablamos', 'hablasteis', 'hablaron'],
    imperfect: ['hablaba', 'hablabas', 'hablaba', 'hablábamos', 'hablabais', 'hablaban'],
    future: ['hablaré', 'hablarás', 'hablará', 'hablaremos', 'hablaréis', 'hablarán'],
    conditional: ['hablaría', 'hablarías', 'hablaría', 'hablaríamos', 'hablaríais', 'hablarían'],
    presentSubj: ['hable', 'hables', 'hable', 'hablemos', 'habléis', 'hablen'],
    imperfectSubj: ['hablara', 'hablaras', 'hablara', 'habláramos', 'hablarais', 'hablaran'],
    perfect: ['he hablado', 'has hablado', 'ha hablado', 'hemos hablado', 'habéis hablado', 'han hablado'],
    participle: 'hablado', gerund: 'hablando',
  },
  comer: {
    present: ['como', 'comes', 'come', 'comemos', 'coméis', 'comen'],
    preterite: ['comí', 'comiste', 'comió', 'comimos', 'comisteis', 'comieron'],
    imperfect: ['comía', 'comías', 'comía', 'comíamos', 'comíais', 'comían'],
    future: ['comeré', 'comerás', 'comerá', 'comeremos', 'comeréis', 'comerán'],
    presentSubj: ['coma', 'comas', 'coma', 'comamos', 'comáis', 'coman'],
    imperfectSubj: ['comiera', 'comieras', 'comiera', 'comiéramos', 'comierais', 'comieran'],
    participle: 'comido', gerund: 'comiendo',
  },
  vivir: {
    present: ['vivo', 'vives', 'vive', 'vivimos', 'vivís', 'viven'],
    preterite: ['viví', 'viviste', 'vivió', 'vivimos', 'vivisteis', 'vivieron'],
    imperfect: ['vivía', 'vivías', 'vivía', 'vivíamos', 'vivíais', 'vivían'],
    presentSubj: ['viva', 'vivas', 'viva', 'vivamos', 'viváis', 'vivan'],
    participle: 'vivido', gerund: 'viviendo',
  },
  // stem change -ar
  pensar: {
    present: ['pienso', 'piensas', 'piensa', 'pensamos', 'pensáis', 'piensan'],
    preterite: ['pensé', 'pensaste', 'pensó', 'pensamos', 'pensasteis', 'pensaron'],
    presentSubj: ['piense', 'pienses', 'piense', 'pensemos', 'penséis', 'piensen'],
    gerund: 'pensando',
  },
  contar: {
    present: ['cuento', 'cuentas', 'cuenta', 'contamos', 'contáis', 'cuentan'],
    presentSubj: ['cuente', 'cuentes', 'cuente', 'contemos', 'contéis', 'cuenten'],
    gerund: 'contando',
  },
  jugar: {
    present: ['juego', 'juegas', 'juega', 'jugamos', 'jugáis', 'juegan'],
    preterite: ['jugué', 'jugaste', 'jugó', 'jugamos', 'jugasteis', 'jugaron'],
    presentSubj: ['juegue', 'juegues', 'juegue', 'juguemos', 'juguéis', 'jueguen'],
  },
  // stem change -ir (propagation to preterite/gerund/subjunctive)
  pedir: {
    present: ['pido', 'pides', 'pide', 'pedimos', 'pedís', 'piden'],
    preterite: ['pedí', 'pediste', 'pidió', 'pedimos', 'pedisteis', 'pidieron'],
    presentSubj: ['pida', 'pidas', 'pida', 'pidamos', 'pidáis', 'pidan'],
    imperfectSubj: ['pidiera', 'pidieras', 'pidiera', 'pidiéramos', 'pidierais', 'pidieran'],
    participle: 'pedido', gerund: 'pidiendo',
  },
  dormir: {
    present: ['duermo', 'duermes', 'duerme', 'dormimos', 'dormís', 'duermen'],
    preterite: ['dormí', 'dormiste', 'durmió', 'dormimos', 'dormisteis', 'durmieron'],
    presentSubj: ['duerma', 'duermas', 'duerma', 'durmamos', 'durmáis', 'duerman'],
    imperfectSubj: ['durmiera', 'durmieras', 'durmiera', 'durmiéramos', 'durmierais', 'durmieran'],
    participle: 'dormido', gerund: 'durmiendo',
  },
  sentir: {
    present: ['siento', 'sientes', 'siente', 'sentimos', 'sentís', 'sienten'],
    preterite: ['sentí', 'sentiste', 'sintió', 'sentimos', 'sentisteis', 'sintieron'],
    presentSubj: ['sienta', 'sientas', 'sienta', 'sintamos', 'sintáis', 'sientan'],
    imperfectSubj: ['sintiera', 'sintieras', 'sintiera', 'sintiéramos', 'sintierais', 'sintieran'],
    gerund: 'sintiendo',
  },
  // orthographic
  buscar: {
    preterite: ['busqué', 'buscaste', 'buscó', 'buscamos', 'buscasteis', 'buscaron'],
    presentSubj: ['busque', 'busques', 'busque', 'busquemos', 'busquéis', 'busquen'],
  },
  llegar: {
    preterite: ['llegué', 'llegaste', 'llegó', 'llegamos', 'llegasteis', 'llegaron'],
    presentSubj: ['llegue', 'llegues', 'llegue', 'lleguemos', 'lleguéis', 'lleguen'],
  },
  empezar: {
    present: ['empiezo', 'empiezas', 'empieza', 'empezamos', 'empezáis', 'empiezan'],
    preterite: ['empecé', 'empezaste', 'empezó', 'empezamos', 'empezasteis', 'empezaron'],
    presentSubj: ['empiece', 'empieces', 'empiece', 'empecemos', 'empecéis', 'empiecen'],
  },
  averiguar: {
    preterite: ['averigüé', 'averiguaste', 'averiguó', 'averiguamos', 'averiguasteis', 'averiguaron'],
    presentSubj: ['averigüe', 'averigües', 'averigüe', 'averigüemos', 'averigüéis', 'averigüen'],
  },
  elegir: {
    present: ['elijo', 'eliges', 'elige', 'elegimos', 'elegís', 'eligen'],
    preterite: ['elegí', 'elegiste', 'eligió', 'elegimos', 'elegisteis', 'eligieron'],
    presentSubj: ['elija', 'elijas', 'elija', 'elijamos', 'elijáis', 'elijan'],
    gerund: 'eligiendo',
  },
  seguir: {
    present: ['sigo', 'sigues', 'sigue', 'seguimos', 'seguís', 'siguen'],
    preterite: ['seguí', 'seguiste', 'siguió', 'seguimos', 'seguisteis', 'siguieron'],
    presentSubj: ['siga', 'sigas', 'siga', 'sigamos', 'sigáis', 'sigan'],
    gerund: 'siguiendo',
  },
  vencer: {
    present: ['venzo', 'vences', 'vence', 'vencemos', 'vencéis', 'vencen'],
    presentSubj: ['venza', 'venzas', 'venza', 'venzamos', 'venzáis', 'venzan'],
  },
  conocer: {
    present: ['conozco', 'conoces', 'conoce', 'conocemos', 'conocéis', 'conocen'],
    preterite: ['conocí', 'conociste', 'conoció', 'conocimos', 'conocisteis', 'conocieron'],
    presentSubj: ['conozca', 'conozcas', 'conozca', 'conozcamos', 'conozcáis', 'conozcan'],
  },
  // -uir and -eer (y between vowels)
  construir: {
    present: ['construyo', 'construyes', 'construye', 'construimos', 'construís', 'construyen'],
    preterite: ['construí', 'construiste', 'construyó', 'construimos', 'construisteis', 'construyeron'],
    imperfect: ['construía', 'construías', 'construía', 'construíamos', 'construíais', 'construían'],
    presentSubj: ['construya', 'construyas', 'construya', 'construyamos', 'construyáis', 'construyan'],
    imperfectSubj: ['construyera', 'construyeras', 'construyera', 'construyéramos', 'construyerais', 'construyeran'],
    participle: 'construido', gerund: 'construyendo',
  },
  leer: {
    present: ['leo', 'lees', 'lee', 'leemos', 'leéis', 'leen'],
    preterite: ['leí', 'leíste', 'leyó', 'leímos', 'leísteis', 'leyeron'],
    imperfect: ['leía', 'leías', 'leía', 'leíamos', 'leíais', 'leían'],
    participle: 'leído', gerund: 'leyendo',
  },
  // accented i/u
  enviar: {
    present: ['envío', 'envías', 'envía', 'enviamos', 'enviáis', 'envían'],
    presentSubj: ['envíe', 'envíes', 'envíe', 'enviemos', 'enviéis', 'envíen'],
  },
  continuar: {
    present: ['continúo', 'continúas', 'continúa', 'continuamos', 'continuáis', 'continúan'],
    presentSubj: ['continúe', 'continúes', 'continúe', 'continuemos', 'continuéis', 'continúen'],
  },
  // irregular participles / gerunds
  volver: { present: ['vuelvo', 'vuelves', 'vuelve', 'volvemos', 'volvéis', 'vuelven'], participle: 'vuelto', gerund: 'volviendo' },
  escribir: { participle: 'escrito', gerund: 'escribiendo' },
  // fully irregular
  ser: {
    present: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
    preterite: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
    imperfect: ['era', 'eras', 'era', 'éramos', 'erais', 'eran'],
    future: ['seré', 'serás', 'será', 'seremos', 'seréis', 'serán'],
    presentSubj: ['sea', 'seas', 'sea', 'seamos', 'seáis', 'sean'],
    imperfectSubj: ['fuera', 'fueras', 'fuera', 'fuéramos', 'fuerais', 'fueran'],
    participle: 'sido', gerund: 'siendo',
  },
  ir: {
    present: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
    preterite: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
    imperfect: ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
    perfect: ['he ido', 'has ido', 'ha ido', 'hemos ido', 'habéis ido', 'han ido'],
    participle: 'ido', gerund: 'yendo',
  },
  tener: {
    present: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
    preterite: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron'],
    future: ['tendré', 'tendrás', 'tendrá', 'tendremos', 'tendréis', 'tendrán'],
    presentSubj: ['tenga', 'tengas', 'tenga', 'tengamos', 'tengáis', 'tengan'],
    gerund: 'teniendo',
  },
  hacer: {
    present: ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'],
    preterite: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron'],
    future: ['haré', 'harás', 'hará', 'haremos', 'haréis', 'harán'],
    participle: 'hecho', gerund: 'haciendo',
  },
  decir: {
    present: ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'],
    preterite: ['dije', 'dijiste', 'dijo', 'dijimos', 'dijisteis', 'dijeron'],
    perfect: ['he dicho', 'has dicho', 'ha dicho', 'hemos dicho', 'habéis dicho', 'han dicho'],
    participle: 'dicho', gerund: 'diciendo',
  },
  haber: {
    present: ['he', 'has', 'ha', 'hemos', 'habéis', 'han'],
    preterite: ['hube', 'hubiste', 'hubo', 'hubimos', 'hubisteis', 'hubieron'],
    presentSubj: ['haya', 'hayas', 'haya', 'hayamos', 'hayáis', 'hayan'],
  },
  dar: {
    present: ['doy', 'das', 'da', 'damos', 'dais', 'dan'],
    preterite: ['di', 'diste', 'dio', 'dimos', 'disteis', 'dieron'],
    presentSubj: ['dé', 'des', 'dé', 'demos', 'deis', 'den'],
  },
  ver: {
    present: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
    imperfect: ['veía', 'veías', 'veía', 'veíamos', 'veíais', 'veían'],
    preterite: ['vi', 'viste', 'vio', 'vimos', 'visteis', 'vieron'],
    perfect: ['he visto', 'has visto', 'ha visto', 'hemos visto', 'habéis visto', 'han visto'],
    participle: 'visto', gerund: 'viendo',
  },
  conducir: {
    present: ['conduzco', 'conduces', 'conduce', 'conducimos', 'conducís', 'conducen'],
    preterite: ['conduje', 'condujiste', 'condujo', 'condujimos', 'condujisteis', 'condujeron'],
  },
  caer: {
    present: ['caigo', 'caes', 'cae', 'caemos', 'caéis', 'caen'],
    preterite: ['caí', 'caíste', 'cayó', 'caímos', 'caísteis', 'cayeron'],
    participle: 'caído', gerund: 'cayendo',
  },
};

// --- run -----------------------------------------------------------------
let checks = 0;
let fails = 0;
const fail = (msg) => { fails++; console.error('  ✗ ' + msg); };

Object.keys(FIXTURE).forEach((inf) => {
  const verb = verbByInf(inf);
  if (!verb) { fail(`${inf}: not found in VERB_LIST`); return; }
  const spec = FIXTURE[inf];
  Object.keys(spec).forEach((key) => {
    if (key === 'participle') {
      checks++;
      const got = participle(verb);
      if (got !== spec.participle) fail(`${inf} participle: expected "${spec.participle}", got "${got}"`);
    } else if (key === 'gerund') {
      checks++;
      const got = gerund(verb);
      if (got !== spec.gerund) fail(`${inf} gerund: expected "${spec.gerund}", got "${got}"`);
    } else {
      spec[key].forEach((expected, person) => {
        checks++;
        const got = conjugateAny(verb, key, person);
        if (got !== expected) fail(`${inf} ${key}[${person}]: expected "${expected}", got "${got}"`);
      });
    }
  });
});

// Sanity: the whole book generates without throwing or producing empties.
let generated = 0;
VERB_LIST.forEach((v) => {
  const p = verbParadigm(v);
  Object.keys(p.tenses).forEach((t) => p.tenses[t].forEach((form) => {
    generated++;
    if (!form || /undefined|NaN/.test(form)) fail(`${v.inf} ${t}: produced "${form}"`);
  }));
});

console.log(`\nVERB_LIST: ${VERB_LIST.length} verbs · ${generated} forms generated`);
console.log(`Fixture: ${checks} assertions, ${fails} failure(s)`);
if (fails) { console.error('\nFAILED'); process.exit(1); }
console.log('All green ✓');
