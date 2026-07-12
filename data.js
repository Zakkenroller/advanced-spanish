/* ============================================================
   Content: levels, lessons, exercises, and conjugation tables
   ============================================================ */

const LEVELS = [
  {
    id: 'a1', cefr: 'A1', name: 'Beginner',
    duo: 'Duolingo Sections 1–2',
    desc: 'Present tense, subject pronouns, basic el/la rules',
  },
  {
    id: 'a2', cefr: 'A2', name: 'Elementary',
    duo: 'Duolingo Sections 2–3',
    desc: 'Preterite & imperfect, object & reflexive pronouns, gender exceptions',
  },
  {
    id: 'b1', cefr: 'B1', name: 'Intermediate',
    duo: 'Duolingo Sections 4–5',
    desc: 'Preterite vs. imperfect, future & conditional, double object pronouns, suffix rules',
  },
  {
    id: 'b2', cefr: 'B2', name: 'Upper Intermediate',
    duo: 'Duolingo Sections 6–7',
    desc: 'Subjunctive & commands, relative pronouns and “se”, el agua-type nouns',
  },
  {
    id: 'c1', cefr: 'C1', name: 'Advanced',
    duo: 'Duolingo Section 8+',
    desc: 'Compound tenses, si-clauses, leísmo & neuter lo, meaning-changing gender',
  },
];

const TOPICS = [
  { id: 'tenses',   name: 'Verb Tenses',  icon: '⏳' },
  { id: 'pronouns', name: 'Pronouns',     icon: '👥' },
  { id: 'gender',   name: 'Noun Gender',  icon: '⚖️' },
];

// One-line summary of what each topic covers at each level
const TOPIC_LEVEL_DESC = {
  a1: {
    tenses:   'Present tense of -ar/-er/-ir verbs; ser vs. estar',
    pronouns: 'Subject pronouns: yo, tú, usted… and mí/ti/conmigo',
    gender:   'el/la, un/una, plurals, and adjective agreement',
  },
  a2: {
    tenses:   'Preterite and imperfect, with the key irregulars',
    pronouns: 'Direct object pronouns (lo/la) and reflexives (me/te/se)',
    gender:   'The exceptions: el problema, la mano, el día…',
  },
  b1: {
    tenses:   'Preterite vs. imperfect; future and conditional',
    pronouns: 'Indirect objects, gustar, and “se lo” double pronouns',
    gender:   'Suffix rules: -ción, -dad, -umbre are feminine…',
  },
  b2: {
    tenses:   'Present subjunctive triggers and commands',
    pronouns: 'Relative pronouns (que, quien, cuyo) and the uses of se',
    gender:   'el agua-type nouns and flexible-gender words',
  },
  c1: {
    tenses:   'Compound tenses, si-clauses, sequence of tenses',
    pronouns: 'Leísmo, neuter lo, sí mismo, dative of interest',
    gender:   'el capital vs. la capital — meaning-changing pairs',
  },
};

/* ============================================================
   Lessons — concise reference notes shown before practice
   ============================================================ */

const LESSONS = {
  a1: {
    tenses: `
      <h3>Present tense (el presente)</h3>
      <p>Drop the infinitive ending (<b>-ar / -er / -ir</b>) and add:</p>
      <table>
        <tr><th></th><th>-ar (hablar)</th><th>-er (comer)</th><th>-ir (vivir)</th></tr>
        <tr><td>yo</td><td>habl<b>o</b></td><td>com<b>o</b></td><td>viv<b>o</b></td></tr>
        <tr><td>tú</td><td>habl<b>as</b></td><td>com<b>es</b></td><td>viv<b>es</b></td></tr>
        <tr><td>él/ella/usted</td><td>habl<b>a</b></td><td>com<b>e</b></td><td>viv<b>e</b></td></tr>
        <tr><td>nosotros/as</td><td>habl<b>amos</b></td><td>com<b>emos</b></td><td>viv<b>imos</b></td></tr>
        <tr><td>vosotros/as</td><td>habl<b>áis</b></td><td>com<b>éis</b></td><td>viv<b>ís</b></td></tr>
        <tr><td>ellos/ellas/ustedes</td><td>habl<b>an</b></td><td>com<b>en</b></td><td>viv<b>en</b></td></tr>
      </table>
      <h3>Ser vs. estar (both mean “to be”)</h3>
      <p><b>Ser</b> (soy, eres, es, somos, sois, son) — identity, profession, origin, time:
      <i>Soy médico. Es de México.</i></p>
      <p><b>Estar</b> (estoy, estás, está, estamos, estáis, están) — location, feelings, temporary states:
      <i>Estoy cansado. Madrid está en España.</i></p>`,
    pronouns: `
      <h3>Subject pronouns</h3>
      <table>
        <tr><th>Singular</th><th>Plural</th></tr>
        <tr><td><b>yo</b> — I</td><td><b>nosotros / nosotras</b> — we</td></tr>
        <tr><td><b>tú</b> — you (informal)</td><td><b>vosotros / vosotras</b> — you all (informal, Spain)</td></tr>
        <tr><td><b>usted</b> — you (formal)</td><td><b>ustedes</b> — you all (formal; everywhere in Latin America)</td></tr>
        <tr><td><b>él / ella</b> — he / she</td><td><b>ellos / ellas</b> — they</td></tr>
      </table>
      <p>Spanish usually <b>drops</b> subject pronouns because the verb ending shows the person:
      <i>Hablo español</i> = “I speak Spanish.”</p>
      <p>After prepositions, <b>yo → mí</b> and <b>tú → ti</b>: <i>para mí, para ti</i>.
      Special forms: <b>conmigo</b> (with me), <b>contigo</b> (with you).</p>`,
    gender: `
      <h3>Every noun is masculine or feminine</h3>
      <p>Basic pattern: nouns ending in <b>-o</b> are usually masculine, in <b>-a</b> usually feminine.</p>
      <table>
        <tr><th></th><th>Masculine</th><th>Feminine</th></tr>
        <tr><td>the (sing.)</td><td><b>el</b> libro</td><td><b>la</b> mesa</td></tr>
        <tr><td>the (pl.)</td><td><b>los</b> libros</td><td><b>las</b> mesas</td></tr>
        <tr><td>a / an</td><td><b>un</b> gato</td><td><b>una</b> casa</td></tr>
        <tr><td>some</td><td><b>unos</b> gatos</td><td><b>unas</b> casas</td></tr>
      </table>
      <p>Adjectives agree in gender and number: <i>el gato negr<b>o</b>, la casa negr<b>a</b>,
      los gatos negr<b>os</b>, las casas negr<b>as</b></i>.</p>
      <p>Nouns for people often change with the person: <i>el estudiante / la estudiante,
      el profesor / la profesora</i>.</p>`,
  },

  a2: {
    tenses: `
      <h3>Preterite (el pretérito) — completed past actions</h3>
      <table>
        <tr><th></th><th>-ar (hablar)</th><th>-er/-ir (comer, vivir)</th></tr>
        <tr><td>yo</td><td>habl<b>é</b></td><td>com<b>í</b> / viv<b>í</b></td></tr>
        <tr><td>tú</td><td>habl<b>aste</b></td><td>com<b>iste</b></td></tr>
        <tr><td>él/ella/usted</td><td>habl<b>ó</b></td><td>com<b>ió</b></td></tr>
        <tr><td>nosotros/as</td><td>habl<b>amos</b></td><td>com<b>imos</b></td></tr>
        <tr><td>vosotros/as</td><td>habl<b>asteis</b></td><td>com<b>isteis</b></td></tr>
        <tr><td>ellos/ustedes</td><td>habl<b>aron</b></td><td>com<b>ieron</b></td></tr>
      </table>
      <p>Key irregulars: <b>ir/ser</b> → fui, fuiste, fue, fuimos, fuisteis, fueron ·
      <b>hacer</b> → hice, hiciste, hizo… · <b>tener</b> → tuve, tuviste, tuvo…</p>
      <h3>Imperfect (el imperfecto) — ongoing/habitual past</h3>
      <p>-ar: <b>-aba, -abas, -aba, -ábamos, -abais, -aban</b> ·
      -er/-ir: <b>-ía, -ías, -ía, -íamos, -íais, -ían</b></p>
      <p>Only three irregulars: <b>ser</b> (era…), <b>ir</b> (iba…), <b>ver</b> (veía…).</p>
      <p><i>De niño jugaba mucho</i> — “As a child I used to play a lot.”</p>`,
    pronouns: `
      <h3>Direct object pronouns — replace the thing acted on</h3>
      <table>
        <tr><td><b>me</b> — me</td><td><b>nos</b> — us</td></tr>
        <tr><td><b>te</b> — you</td><td><b>os</b> — you all (Spain)</td></tr>
        <tr><td><b>lo / la</b> — him, her, it, you (formal)</td><td><b>los / las</b> — them, you all</td></tr>
      </table>
      <p>They go <b>before</b> a conjugated verb: <i>Veo el libro → <b>Lo</b> veo.</i>
      With an infinitive they can attach to the end: <i><b>Lo</b> voy a comprar</i> or
      <i>Voy a comprar<b>lo</b></i> — both are correct.</p>
      <h3>Reflexive pronouns — the action falls back on the subject</h3>
      <p><b>me, te, se, nos, os, se</b>: <i>Me levanto a las siete. Ella se ducha.
      Ellos se acuestan tarde.</i></p>
      <p><b>Nos vemos</b> — literally “we see each other” — is how you say “see you!”</p>`,
    gender: `
      <h3>Common gender exceptions to memorize</h3>
      <p>Masculine despite ending in <b>-a</b> (many are Greek loanwords in <b>-ma</b>):</p>
      <p><b>el</b> problema, <b>el</b> programa, <b>el</b> idioma, <b>el</b> sistema,
      <b>el</b> clima, <b>el</b> tema, <b>el</b> día, <b>el</b> mapa, <b>el</b> planeta</p>
      <p>Feminine despite ending in <b>-o</b>:</p>
      <p><b>la</b> mano, <b>la</b> foto (la fotografía), <b>la</b> moto (la motocicleta),
      <b>la</b> radio</p>
      <p>Adjectives still agree with the <b>real</b> gender:
      <i>el problema serio, la mano izquierda</i>.</p>`,
  },

  b1: {
    tenses: `
      <h3>Preterite vs. imperfect — the classic choice</h3>
      <table>
        <tr><th>Preterite (completed)</th><th>Imperfect (background)</th></tr>
        <tr><td>single finished event</td><td>habitual / repeated action</td></tr>
        <tr><td>a chain of events</td><td>description, weather, time, age</td></tr>
        <tr><td>interrupting action</td><td>action in progress that was interrupted</td></tr>
      </table>
      <p><i>Mientras <b>leía</b> (in progress), <b>sonó</b> el teléfono (interruption).</i></p>
      <h3>Future & conditional</h3>
      <p>Add endings to the <b>whole infinitive</b>. Future: <b>-é, -ás, -á, -emos, -éis, -án</b>.
      Conditional: <b>-ía, -ías, -ía, -íamos, -íais, -ían</b>.</p>
      <p><i>hablar → hablaré (I will speak) · hablaría (I would speak)</i></p>
      <p>Irregular stems (same for both): tener → <b>tendr-</b>, venir → <b>vendr-</b>,
      poder → <b>podr-</b>, hacer → <b>har-</b>, decir → <b>dir-</b>, saber → <b>sabr-</b>,
      querer → <b>querr-</b>, salir → <b>saldr-</b>, poner → <b>pondr-</b>.</p>
      <p><i>Me gustaría viajar</i> — “I would like to travel.”</p>`,
    pronouns: `
      <h3>Indirect object pronouns — to/for whom</h3>
      <p><b>me, te, le, nos, os, les</b>: <i>Doy el libro a María → <b>Le</b> doy el libro.</i></p>
      <p>Verbs like <b>gustar</b> always use them: <i>A mí <b>me</b> gustan los tacos.
      A ellos <b>les</b> encanta bailar.</i></p>
      <h3>Two pronouns together: indirect first, then direct</h3>
      <p><i>¿Me prestas tu coche? — Sí, <b>te lo</b> presto.</i></p>
      <p>When <b>le/les</b> would meet <b>lo/la/los/las</b>, it becomes <b>se</b>:</p>
      <p><i>Le doy el libro → <s>Le lo</s> doy → <b>Se lo</b> doy.</i></p>
      <p>Attached to a gerund or infinitive, add a written accent to keep the stress:
      <i>Está diciéndo<b>melo</b>. Quiere dár<b>selo</b>.</i></p>`,
    gender: `
      <h3>Suffixes that reliably signal gender</h3>
      <p>Always <b>feminine</b>:</p>
      <ul>
        <li><b>-ción / -sión</b>: la canción, la televisión</li>
        <li><b>-dad / -tad</b>: la ciudad, la libertad</li>
        <li><b>-umbre</b>: la costumbre, la cumbre</li>
        <li><b>-ez / -eza</b>: la vejez, la belleza</li>
      </ul>
      <p>Usually <b>masculine</b>: <b>-or</b> (el color, el amor), <b>-aje</b> (el viaje),
      <b>-én / -ón</b> when not -ción/-sión (el corazón, el andén).</p>
      <p>Watch out: <b>-e</b> and <b>-sis</b> give no single rule — la serie, el coche;
      la crisis, la tesis, but <b>el</b> análisis, <b>el</b> paréntesis.</p>`,
  },

  b2: {
    tenses: `
      <h3>Present subjunctive — wishes, doubts, emotions, influence</h3>
      <p>Start from the <b>yo</b> form, drop -o, add the “opposite” endings:
      -ar → <b>-e, -es, -e, -emos, -éis, -en</b> · -er/-ir → <b>-a, -as, -a, -amos, -áis, -an</b>.</p>
      <p>Triggers (WEIRDO): <b>W</b>ishes, <b>E</b>motions, <b>I</b>mpersonal expressions,
      <b>R</b>ecommendations, <b>D</b>oubt/denial, <b>O</b>jalá.</p>
      <p><i>Quiero que <b>vengas</b>. No creo que <b>sea</b> verdad. Ojalá <b>llueva</b>.</i></p>
      <p>But belief/certainty takes the <b>indicative</b>: <i>Creo que <b>tiene</b> razón.</i></p>
      <p><b>Cuando</b> + future meaning takes subjunctive: <i>Cuando <b>llegue</b>, te llamaré.</i></p>
      <h3>Commands (el imperativo)</h3>
      <p>Affirmative tú = 3rd person present: <i>¡Habla! ¡Come!</i>
      (irregulars: di, haz, ve, pon, sal, sé, ten, ven).</p>
      <p>Negative tú = subjunctive: <i>¡No hables! ¡No comas eso!</i>
      Usted/ustedes always use the subjunctive: <i>Hable. No coman.</i></p>`,
    pronouns: `
      <h3>Relative pronouns</h3>
      <ul>
        <li><b>que</b> — the all-purpose “that/which/who”: <i>el libro <b>que</b> leí</i></li>
        <li><b>quien(es)</b> — people, after prepositions: <i>la mujer con <b>quien</b> hablé</i></li>
        <li><b>lo que</b> — “what / the thing that”: <i><b>Lo que</b> dices es verdad</i></li>
        <li><b>cuyo/a/os/as</b> — “whose”, agrees with the thing owned:
          <i>el autor <b>cuyo</b> libro ganó</i></li>
        <li><b>el/la cual, los/las cuales</b> — formal, after long prepositions</li>
      </ul>
      <h3>The many faces of “se”</h3>
      <ul>
        <li>Replacement for le/les: <i><b>Se</b> lo dije a ella.</i></li>
        <li>Passive/impersonal: <i><b>Se</b> venden casas. <b>Se</b> habla español.</i></li>
        <li>Accidental (no-fault) se: <i><b>Se me</b> olvidaron las llaves</i> —
          “the keys got forgotten on me.”</li>
        <li>Reflexive/reciprocal: <i><b>Se</b> escriben cartas.</i></li>
      </ul>`,
    gender: `
      <h3>Feminine nouns that take “el”</h3>
      <p>Feminine nouns beginning with a <b>stressed a-/ha-</b> take <b>el/un</b> in the
      singular — purely for sound — but stay feminine:</p>
      <p><i><b>el</b> agua frí<b>a</b>, <b>el</b> águila calv<b>a</b>, <b>el</b> alma buen<b>a</b>,
      <b>el</b> hacha afilad<b>a</b>, <b>el</b> aula pequeñ<b>a</b>, <b>el</b> hambre</i></p>
      <p>The plural is regular feminine: <i><b>las</b> aguas, <b>las</b> águilas, <b>las</b> almas.</i></p>
      <p>It only happens when the first syllable is stressed: <i><b>la</b> arena, <b>la</b> amiga</i>
      (unstressed a-) keep <b>la</b>.</p>
      <h3>Nouns with flexible gender</h3>
      <p><b>el mar</b> is standard; <b>la mar</b> survives in poetry and sailors' speech.
      <b>el arte</b> (sing.) but <b>las bellas artes</b> (pl.).</p>`,
  },

  c1: {
    tenses: `
      <h3>Compound tenses — haber + past participle</h3>
      <table>
        <tr><td>Present perfect</td><td><b>he comido</b> — I have eaten</td></tr>
        <tr><td>Pluperfect</td><td><b>había comido</b> — I had eaten</td></tr>
        <tr><td>Future perfect</td><td><b>habré comido</b> — I will have eaten</td></tr>
        <tr><td>Conditional perfect</td><td><b>habría comido</b> — I would have eaten</td></tr>
      </table>
      <p>Irregular participles: visto, hecho, dicho, escrito, puesto, vuelto, roto, abierto, muerto.</p>
      <h3>Imperfect subjunctive & si-clauses</h3>
      <p>From the ellos-preterite, drop <b>-ron</b>, add <b>-ra, -ras, -ra, -´ramos, -rais, -ran</b>:
      hablaron → habla<b>ra</b>; tuvieron → tuvie<b>ra</b>; vinieron → vinie<b>ra</b>.</p>
      <ul>
        <li>Unreal present: <i>Si <b>tuviera</b> dinero, <b>viajaría</b>.</i></li>
        <li>Unreal past: <i>Si <b>hubiera estudiado</b>, <b>habría aprobado</b>.</i></li>
        <li>Sequence of tenses: <i>Me pidió que le <b>ayudara</b>.</i>
          <i>Dudaba que <b>vinieran</b>.</i></li>
        <li><b>como si</b> always + imperfect subjunctive: <i>Habla como si <b>supiera</b> todo.</i></li>
      </ul>`,
    pronouns: `
      <h3>Leísmo and the fine print</h3>
      <p>Standard grammar: <b>lo/la</b> for direct objects, <b>le</b> for indirect.
      In much of Spain, <b>le</b> for a male person as direct object (<i><b>Le</b> vi ayer</i>)
      is so common the RAE accepts it — but only masculine, singular, human.</p>
      <p>Neuter <b>lo</b> turns adjectives into nouns: <i><b>Lo</b> difícil es empezar</i> —
      “the hard part is starting.” Also <i>lo de</i> (“the business about”):
      <i>¿Supiste <b>lo de</b> Marta?</i></p>
      <h3>Advanced patterns</h3>
      <ul>
        <li><b>sí (mismo)</b> — reflexive after prepositions: <i>Habla de <b>sí</b> mismo.</i>
          With con: <b>consigo</b>.</li>
        <li>Dative of interest: <i><b>Se me</b> murió el gato</i> — the loss affects <i>me</i>.</li>
        <li><b>quienquiera que</b> + subjunctive: <i>Quienquiera que <b>sea</b>, no abras.</i></li>
        <li>Headless relatives: <b>el que / quien</b> — <i><b>Quien</b> mucho abarca, poco aprieta.</i></li>
      </ul>`,
    gender: `
      <h3>Same word, different gender, different meaning</h3>
      <table>
        <tr><th>Masculine</th><th>Feminine</th></tr>
        <tr><td><b>el capital</b> — money</td><td><b>la capital</b> — capital city</td></tr>
        <tr><td><b>el cura</b> — priest</td><td><b>la cura</b> — cure</td></tr>
        <tr><td><b>el frente</b> — front (war, weather)</td><td><b>la frente</b> — forehead</td></tr>
        <tr><td><b>el orden</b> — order (sequence)</td><td><b>la orden</b> — order (command); religious order</td></tr>
        <tr><td><b>el cometa</b> — comet</td><td><b>la cometa</b> — kite</td></tr>
        <tr><td><b>el papa</b> — pope</td><td><b>la papa</b> — potato (Lat. Am.)</td></tr>
        <tr><td><b>el corte</b> — cut</td><td><b>la corte</b> — court</td></tr>
        <tr><td><b>el pendiente</b> — earring (Spain)</td><td><b>la pendiente</b> — slope</td></tr>
        <tr><td><b>el guía</b> — guide (person, m.)</td><td><b>la guía</b> — guidebook; guide (person, f.)</td></tr>
      </table>`,
  },
};

/* ============================================================
   Exercises
   t: 'mc' (multiple choice, a = index) or 'type' (a = accepted answers)
   ============================================================ */

const EXERCISES = {
  a1: {
    tenses: [
      { t: 'mc', q: 'Yo ___ español. (hablar)', c: ['hablo', 'hablas', 'habla', 'hablan'], a: 0,
        exp: 'yo + -ar verb → -o: hablo.' },
      { t: 'type', q: 'Nosotros ___ pizza. (comer)', a: ['comemos'],
        exp: 'nosotros + -er verb → -emos: comemos.' },
      { t: 'mc', q: 'Ella ___ en Madrid. (vivir)', c: ['vivo', 'vives', 'vive', 'viven'], a: 2,
        exp: 'él/ella + -ir verb → -e: vive.' },
      { t: 'mc', q: 'Yo ___ médico.', c: ['estoy', 'soy', 'está', 'es'], a: 1,
        exp: 'Professions use ser: soy médico.' },
      { t: 'mc', q: '¿Cómo ___ tú hoy?', c: ['eres', 'es', 'estás', 'está'], a: 2,
        exp: 'Feelings and states use estar: ¿Cómo estás?' },
      { t: 'type', q: 'Ellos ___ en un banco. (trabajar)', a: ['trabajan'],
        exp: 'ellos + -ar verb → -an: trabajan.' },
      { t: 'mc', q: 'Tú ___ mucho en clase. (aprender)', c: ['aprendo', 'aprendes', 'aprende', 'aprendemos'], a: 1,
        exp: 'tú + -er verb → -es: aprendes.' },
      { t: 'mc', q: 'El libro ___ en la mesa.', c: ['es', 'son', 'está', 'estás'], a: 2,
        exp: 'Location uses estar: está en la mesa.' },
      { t: 'type', q: 'Yo ___ de Estados Unidos. (ser)', a: ['soy'],
        exp: 'Origin uses ser: soy de Estados Unidos.' },
      { t: 'mc', q: 'Vosotros ___ café. (beber)', c: ['bebéis', 'beben', 'bebemos', 'bebes'], a: 0,
        exp: 'vosotros + -er verb → -éis: bebéis.' },
      { t: 'type', q: 'Tú ___ agua. (beber)', a: ['bebes'],
        exp: 'tú + -er verb → -es: bebes.' },
      { t: 'mc', q: 'Nosotros ___ estudiantes.', c: ['somos', 'estamos', 'son', 'estáis'], a: 0,
        exp: 'Identity (being students) uses ser: somos estudiantes.' },
      { t: 'mc', q: 'Mis padres ___ en casa.', c: ['son', 'están', 'es', 'está'], a: 1,
        exp: 'Location uses estar: están en casa.' },
      { t: 'type', q: 'Ella ___ inglés y español. (hablar)', a: ['habla'],
        exp: 'él/ella + -ar verb → -a: habla.' },
      { t: 'mc', q: 'Yo ___ una carta. (escribir)', c: ['escribo', 'escribes', 'escribe', 'escriben'], a: 0,
        exp: 'yo + -ir verb → -o: escribo.' },
      { t: 'mc', q: '¿Dónde ___ tú? (vivir)', c: ['vivo', 'vives', 'vive', 'vivís'], a: 1,
        exp: 'tú + -ir verb → -es: vives.' },
      { t: 'type', q: 'Vosotros ___ mucho. (trabajar)', a: ['trabajáis'],
        exp: 'vosotros + -ar verb → -áis: trabajáis.' },
      { t: 'mc', q: 'La sopa ___ fría hoy.', c: ['es', 'está', 'son', 'eres'], a: 1,
        exp: 'A temporary state (the soup happens to be cold) uses estar: está fría.' },
      { t: 'mc', q: 'Ustedes ___ profesores.', c: ['están', 'sois', 'son', 'es'], a: 2,
        exp: 'Profession uses ser; ustedes → son.' },
      { t: 'type', q: 'Mi hermano ___ pizza los viernes. (comer)', a: ['come'],
        exp: 'él + -er verb → -e: come.' },
      { t: 'mc', q: 'Tú ___ de Colombia, ¿verdad?', c: ['estás', 'eres', 'es', 'soy'], a: 1,
        exp: 'Origin uses ser: eres de Colombia.' },
      { t: 'mc', q: 'Ana y Luis ___ cartas. (escribir)', c: ['escribe', 'escribís', 'escriben', 'escribo'], a: 2,
        exp: 'ellos + -ir verb → -en: escriben.' },
    ],
    pronouns: [
      { t: 'mc', q: 'Which pronoun means “you” (one person, informal)?', c: ['usted', 'tú', 'vosotros', 'él'], a: 1,
        exp: 'tú = informal singular you; usted = formal.' },
      { t: 'mc', q: 'María y yo = ___', c: ['ellos', 'vosotras', 'nosotras', 'ellas'], a: 2,
        exp: '“María and I” = we → nosotras (or nosotros if the group includes a man… here it depends on you!).' },
      { t: 'mc', q: 'Which pronoun would you use with your professor (formal)?', c: ['tú', 'él', 'usted', 'vos'], a: 2,
        exp: 'usted is the formal singular “you”.' },
      { t: 'mc', q: 'Juan y Pedro = ___', c: ['ellas', 'ellos', 'ustedes', 'nosotros'], a: 1,
        exp: 'Two men (spoken about) → ellos.' },
      { t: 'mc', q: 'Replace the subject: “Ana es doctora.” → “___ es doctora.”', c: ['Él', 'Ella', 'Usted', 'Ellas'], a: 1,
        exp: 'Ana is one woman → ella.' },
      { t: 'mc', q: '“Vosotros” is used mainly…', c: ['in Latin America', 'in Spain, informal plural', 'for formal situations', 'in writing only'], a: 1,
        exp: 'Spain uses vosotros for informal plural; Latin America uses ustedes for everyone.' },
      { t: 'mc', q: 'Este regalo es para ___. (me)', c: ['yo', 'mí', 'me', 'mi'], a: 1,
        exp: 'After prepositions, yo → mí (with accent; “mi” without accent means “my”).' },
      { t: 'mc', q: '¿Vienes ___? (with me)', c: ['con mí', 'con yo', 'conmigo', 'contigo'], a: 2,
        exp: 'con + mí fuses into the special form conmigo.' },
      { t: 'mc', q: 'Why does Spanish often drop subject pronouns? “Hablo español.”', c: ['It is a mistake', 'The verb ending already shows who', 'Only in questions', 'Only with tú'], a: 1,
        exp: 'The -o ending can only be “yo”, so the pronoun is unnecessary.' },
      { t: 'mc', q: 'Tus amigas Carmen y Lucía = ___', c: ['ellos', 'ellas', 'vosotros', 'nosotras'], a: 1,
        exp: 'An all-female group (spoken about) → ellas.' },
      { t: 'mc', q: 'El regalo es para ___. (you, informal)', c: ['tú', 'ti', 'te', 'usted'], a: 1,
        exp: 'After prepositions, tú → ti (no accent): para ti.' },
      { t: 'mc', q: '¿Quieres venir ___? (with me)', c: ['con mí', 'conmigo', 'contigo', 'con yo'], a: 1,
        exp: 'con + mí fuses into conmigo.' },
      { t: 'mc', q: 'Speaking TO your friends in Spain (informal): “___ habláis muy rápido.”', c: ['Ustedes', 'Vosotros', 'Ellos', 'Nosotros'], a: 1,
        exp: 'Spain, informal plural “you” → vosotros.' },
      { t: 'mc', q: 'Ana, Luisa y Pedro = ___', c: ['ellas', 'ellos', 'ustedes', 'vosotras'], a: 1,
        exp: 'A mixed group (spoken about) is masculine plural → ellos.' },
      { t: 'mc', q: 'Which pronoun replaces “mi madre”?', c: ['él', 'ella', 'usted', 'ellas'], a: 1,
        exp: 'One woman (spoken about) → ella.' },
      { t: 'mc', q: 'In Latin America, “you all” (any group) = ___', c: ['vosotros', 'ustedes', 'ellos', 'vos'], a: 1,
        exp: 'Latin America uses ustedes for every plural “you”, formal or not.' },
      { t: 'mc', q: '“Mi” without an accent means…', c: ['me (after a preposition)', 'my', 'I', 'mine'], a: 1,
        exp: 'mi = my; mí (with accent) = me after prepositions.' },
      { t: 'mc', q: 'El café es para ___. (me)', c: ['yo', 'mi', 'mí', 'me'], a: 2,
        exp: 'After para, yo → mí (with accent): para mí.' },
      { t: 'mc', q: 'Tu hermana y tú (in Latin America) = ___', c: ['vosotras', 'nosotras', 'ustedes', 'ellas'], a: 2,
        exp: '“You and your sister” addressed as a group → ustedes in Latin America.' },
      { t: 'mc', q: 'Speaking TO two doctors, formally: ___', c: ['ellos', 'ustedes', 'vosotros', 'los'], a: 1,
        exp: 'Formal plural “you” → ustedes.' },
      { t: 'mc', q: '“Hablamos” — who is the subject?', c: ['yo', 'tú', 'nosotros', 'ellos'], a: 2,
        exp: 'The -amos ending can only be nosotros.' },
      { t: 'mc', q: '“Vives en Madrid.” — who is the subject?', c: ['yo', 'tú', 'él', 'vosotros'], a: 1,
        exp: 'The -es ending on an -ir verb is tú: tú vives.' },
    ],
    gender: [
      { t: 'mc', q: '___ libro', c: ['el', 'la', 'los', 'las'], a: 0,
        exp: 'libro ends in -o → masculine: el libro.' },
      { t: 'mc', q: '___ mesa', c: ['el', 'la', 'un', 'los'], a: 1,
        exp: 'mesa ends in -a → feminine: la mesa.' },
      { t: 'mc', q: '___ gato (a cat)', c: ['una', 'unas', 'un', 'unos'], a: 2,
        exp: 'gato is masculine singular → un gato.' },
      { t: 'mc', q: 'Plural of “el libro”:', c: ['el libros', 'los libros', 'las libros', 'los libroses'], a: 1,
        exp: 'el → los, add -s: los libros.' },
      { t: 'type', q: '___ escuela (the school)', a: ['la'],
        exp: 'escuela is feminine → la escuela.' },
      { t: 'mc', q: 'la casa ___ (white)', c: ['blanco', 'blanca', 'blancos', 'blancas'], a: 1,
        exp: 'Adjectives agree: feminine singular → blanca.' },
      { t: 'mc', q: '“The student” (a woman):', c: ['el estudiante', 'la estudiante', 'la estudianta', 'el estudianta'], a: 1,
        exp: 'estudiante keeps its form; only the article changes: la estudiante.' },
      { t: 'mc', q: '___ flores (the flowers)', c: ['los', 'las', 'la', 'el'], a: 1,
        exp: 'flor is feminine → las flores.' },
      { t: 'mc', q: 'los perros ___ (black)', c: ['negro', 'negra', 'negros', 'negras'], a: 2,
        exp: 'Masculine plural → negros.' },
      { t: 'type', q: '___ profesora (a female teacher — “a”)', a: ['una'],
        exp: 'profesora is feminine → una profesora.' },
      { t: 'mc', q: '___ ventana', c: ['el', 'la', 'los', 'un'], a: 1,
        exp: 'ventana ends in -a → feminine: la ventana.' },
      { t: 'mc', q: '___ cuaderno', c: ['la', 'una', 'el', 'las'], a: 2,
        exp: 'cuaderno ends in -o → masculine: el cuaderno.' },
      { t: 'mc', q: 'Plural of “la mesa”:', c: ['los mesas', 'las mesas', 'las mesa', 'la mesas'], a: 1,
        exp: 'la → las, add -s: las mesas.' },
      { t: 'type', q: '___ perro (the dog)', a: ['el'],
        exp: 'perro is masculine → el perro.' },
      { t: 'mc', q: '___ zapatos (some shoes)', c: ['unas', 'unos', 'un', 'una'], a: 1,
        exp: 'zapato is masculine, plural → unos zapatos.' },
      { t: 'mc', q: 'el coche ___ (red)', c: ['roja', 'rojos', 'rojo', 'rojas'], a: 2,
        exp: 'Masculine singular → rojo.' },
      { t: 'mc', q: '“The teacher” (a man):', c: ['la profesora', 'el profesor', 'el profesora', 'la profesor'], a: 1,
        exp: 'Male teacher → el profesor; female → la profesora.' },
      { t: 'mc', q: 'las sillas ___ (new)', c: ['nuevos', 'nueva', 'nuevas', 'nuevo'], a: 2,
        exp: 'Feminine plural → nuevas.' },
      { t: 'mc', q: '___ ciudades (the cities)', c: ['los', 'las', 'la', 'el'], a: 1,
        exp: 'ciudad is feminine → las ciudades.' },
      { t: 'type', q: '___ casa (a house)', a: ['una'],
        exp: 'casa is feminine → una casa.' },
      { t: 'mc', q: 'Plural of “el lápiz”:', c: ['los lápizes', 'los lápices', 'las lápices', 'el lápices'], a: 1,
        exp: 'Nouns in -z change to -ces in the plural: los lápices.' },
      { t: 'mc', q: 'un gato ___ (white)', c: ['blanca', 'blancos', 'blanco', 'blancas'], a: 2,
        exp: 'Masculine singular → blanco.' },
    ],
  },

  a2: {
    tenses: [
      { t: 'type', q: 'Ayer yo ___ con mi madre. (hablar, pretérito)', a: ['hablé', 'hable'],
        exp: 'yo + -ar in preterite → -é: hablé.' },
      { t: 'mc', q: 'Ella ___ una carta ayer. (escribir)', c: ['escribía', 'escribió', 'escribe', 'escribieron'], a: 1,
        exp: 'A completed action yesterday → preterite: escribió.' },
      { t: 'mc', q: 'Nosotros ___ tacos anoche. (comer)', c: ['comemos', 'comíamos', 'comimos', 'comieron'], a: 2,
        exp: 'Completed last night → preterite: comimos.' },
      { t: 'type', q: 'Tú ___ en Perú dos años. (vivir, pretérito)', a: ['viviste'],
        exp: 'tú + -ir in preterite → -iste: viviste.' },
      { t: 'mc', q: 'Yo ___ al cine ayer. (ir)', c: ['iba', 'fui', 'voy', 'fue'], a: 1,
        exp: 'ir is irregular in the preterite: fui, fuiste, fue…' },
      { t: 'mc', q: 'De niño, yo ___ mucho al fútbol. (jugar)', c: ['jugué', 'juego', 'jugaba', 'jugó'], a: 2,
        exp: 'Habitual past (“used to play”) → imperfect: jugaba.' },
      { t: 'type', q: 'Ellos ___ un perro cuando eran niños. (tener, imperfecto)', a: ['tenían', 'tenian'],
        exp: 'Imperfect of tener: tenían (ongoing state in the past).' },
      { t: 'mc', q: '¿Qué ___ tú ayer? (hacer)', c: ['hacías', 'haces', 'hiciste', 'hizo'], a: 2,
        exp: 'hacer is irregular in the preterite: hice, hiciste, hizo…' },
      { t: 'mc', q: 'Cuando era joven, mi abuela ___ muy guapa. (ser)', c: ['fue', 'era', 'es', 'sería'], a: 1,
        exp: 'Description in the past → imperfect; ser → era.' },
      { t: 'type', q: 'Ayer nosotros ___ la película. (ver, pretérito)', a: ['vimos'],
        exp: 'ver in preterite: vi, viste, vio, vimos… (no accents).' },
      { t: 'mc', q: 'El año pasado nosotros ___ a Chile. (viajar)', c: ['viajábamos', 'viajamos', 'viajaremos', 'viajan'], a: 1,
        exp: 'A completed trip last year → preterite: viajamos.' },
      { t: 'type', q: 'Ella ___ la puerta. (abrir, pretérito)', a: ['abrió'],
        exp: 'él/ella + -ir in preterite → -ió: abrió.' },
      { t: 'mc', q: 'Ustedes ___ tarde anoche. (llegar)', c: ['llegaban', 'llegaron', 'llegan', 'llegasteis'], a: 1,
        exp: 'One completed event last night → preterite: llegaron.' },
      { t: 'mc', q: 'Antes yo ___ en esta calle. (vivir)', c: ['viví', 'vivía', 'vivo', 'viviré'], a: 1,
        exp: 'An ongoing situation in the past (“used to live”) → imperfect: vivía.' },
      { t: 'type', q: 'Tú ___ mucho de niño. (cantar, imperfecto)', a: ['cantabas'],
        exp: 'Habitual past → imperfect; tú + -ar → -abas: cantabas.' },
      { t: 'mc', q: 'Nosotros ___ la tele todas las noches. (ver)', c: ['vimos', 'veíamos', 'vemos', 'veremos'], a: 1,
        exp: '“Every night” = habitual → imperfect; ver is irregular: veíamos.' },
      { t: 'mc', q: '¿Adónde ___ ellos ayer? (ir)', c: ['iban', 'fueron', 'van', 'fuisteis'], a: 1,
        exp: 'Completed yesterday → preterite of ir: fueron.' },
      { t: 'type', q: 'Yo ___ un regalo para ti. (comprar, pretérito)', a: ['compré'],
        exp: 'yo + -ar in preterite → -é: compré.' },
      { t: 'mc', q: 'Anoche ella ___ que estudiar. (tener)', c: ['tenía', 'tuvo', 'tiene', 'tendría'], a: 1,
        exp: '“tuvo que” = a completed obligation last night → preterite: tuvo.' },
      { t: 'mc', q: 'Mientras tanto, los niños ___ en el jardín. (jugar)', c: ['jugaron', 'jugaban', 'juegan', 'jugarán'], a: 1,
        exp: 'Background action in progress → imperfect: jugaban.' },
      { t: 'mc', q: 'Vosotros ya ___ la respuesta. (saber, imperfecto)', c: ['supisteis', 'sabíais', 'sabéis', 'sabréis'], a: 1,
        exp: 'Ongoing knowledge in the past → imperfect: sabíais.' },
      { t: 'type', q: 'El tren ___ a las diez. (llegar, pretérito)', a: ['llegó'],
        exp: 'él + -ar in preterite → -ó: llegó.' },
    ],
    pronouns: [
      { t: 'mc', q: 'Replace the object: “Veo el libro.” → “___ veo.”', c: ['La', 'Lo', 'Le', 'Los'], a: 1,
        exp: 'el libro = masculine singular thing → lo.' },
      { t: 'mc', q: '“Compro las flores.” → “___ compro.”', c: ['Los', 'Lo', 'La', 'Las'], a: 3,
        exp: 'las flores = feminine plural → las.' },
      { t: 'type', q: '¿Me ves? — Sí, ___ veo.', a: ['te'],
        exp: '“Do you see me?” — “Yes, I see you” → te.' },
      { t: 'mc', q: 'Yo ___ levanto a las siete.', c: ['se', 'te', 'me', 'nos'], a: 2,
        exp: 'Reflexive with yo → me: me levanto.' },
      { t: 'mc', q: 'Ella ___ ducha por la mañana.', c: ['me', 'se', 'te', 'le'], a: 1,
        exp: 'Reflexive with ella → se: se ducha.' },
      { t: 'mc', q: 'Which are correct ways to say “I am going to buy it (el coche)”?', c: ['Only “Voy a comprarlo”', 'Only “Lo voy a comprar”', 'Both', 'Neither'], a: 2,
        exp: 'With infinitives the pronoun can go before the conjugated verb or attach to the infinitive.' },
      { t: 'mc', q: '“¡Nos vemos!” literally means…', c: ['We go', 'We see each other', 'They see us', 'You see us'], a: 1,
        exp: 'Reciprocal nos: “we see each other” → “see you!”' },
      { t: 'type', q: 'Ellos ___ acuestan muy tarde.', a: ['se'],
        exp: 'Reflexive with ellos → se: se acuestan.' },
      { t: 'mc', q: '¿Dónde está mi teléfono? No ___ encuentro.', c: ['la', 'le', 'lo', 'me'], a: 2,
        exp: 'el teléfono = masculine singular → lo encuentro.' },
      { t: 'mc', q: 'Nosotros ___ despertamos temprano.', c: ['se', 'os', 'me', 'nos'], a: 3,
        exp: 'Reflexive with nosotros → nos: nos despertamos.' },
      { t: 'mc', q: '“¿Compraste los libros?” — “Sí, ___ compré.”', c: ['las', 'los', 'les', 'lo'], a: 1,
        exp: 'los libros = masculine plural → los.' },
      { t: 'mc', q: '“Veo a María.” → “___ veo.”', c: ['Lo', 'Le', 'La', 'Las'], a: 2,
        exp: 'María = feminine singular direct object → la.' },
      { t: 'type', q: 'Tú ___ duchas por la noche.', a: ['te'],
        exp: 'Reflexive with tú → te: te duchas.' },
      { t: 'mc', q: '“¿Me oyes?” — “Sí, ___ oigo.”', c: ['te', 'me', 'lo', 'le'], a: 0,
        exp: '“Do you hear me?” — “Yes, I hear you” → te oigo.' },
      { t: 'mc', q: 'Vosotros ___ laváis las manos.', c: ['se', 'os', 'nos', 'te'], a: 1,
        exp: 'Reflexive with vosotros → os: os laváis.' },
      { t: 'mc', q: '“la televisión” → “No ___ veo mucho.”', c: ['lo', 'la', 'le', 'las'], a: 1,
        exp: 'la televisión = feminine singular → la veo.' },
      { t: 'type', q: 'Mi padre ___ afeita cada mañana.', a: ['se'],
        exp: 'Reflexive with él → se: se afeita.' },
      { t: 'mc', q: 'Where can the pronoun go in “Quiero ver la película”?', c: ['Only “Quiero verla”', 'Only “La quiero ver”', 'Both are correct', 'Neither'], a: 2,
        exp: 'With an infinitive: before the conjugated verb or attached to the infinitive.' },
      { t: 'mc', q: '“¿Compraste la fruta?” — “Sí, ___ compré.”', c: ['lo', 'la', 'los', 'las'], a: 1,
        exp: 'la fruta = feminine singular → la.' },
      { t: 'mc', q: 'Ellos ___ conocen desde 2010. (each other)', c: ['se', 'los', 'les', 'nos'], a: 0,
        exp: 'Reciprocal “each other” → se: se conocen.' },
      { t: 'type', q: 'Nosotros ___ vestimos rápido.', a: ['nos'],
        exp: 'Reflexive with nosotros → nos: nos vestimos.' },
      { t: 'mc', q: 'In “Te veo mañana”, “te” refers to…', c: ['the speaker', 'the person spoken to', 'a third person', 'nobody — it is reflexive'], a: 1,
        exp: 'te = you (the person being addressed): “I’ll see you tomorrow.”' },
    ],
    gender: [
      { t: 'mc', q: '___ problema', c: ['la', 'el', 'las', 'una'], a: 1,
        exp: 'problema is a Greek -ma word → masculine: el problema.' },
      { t: 'mc', q: '___ mano', c: ['el', 'un', 'la', 'los'], a: 2,
        exp: 'mano is feminine despite -o: la mano.' },
      { t: 'mc', q: '___ día', c: ['la', 'el', 'las', 'una'], a: 1,
        exp: 'día is masculine despite -a: el día. (Buenos días!)' },
      { t: 'mc', q: '___ mapa', c: ['la', 'una', 'el', 'las'], a: 2,
        exp: 'mapa is masculine: el mapa.' },
      { t: 'type', q: '___ foto (the photo)', a: ['la'],
        exp: 'foto is short for la fotografía → feminine: la foto.' },
      { t: 'mc', q: '___ moto', c: ['el', 'la', 'un', 'los'], a: 1,
        exp: 'moto = la motocicleta → feminine: la moto.' },
      { t: 'mc', q: '___ idioma', c: ['la', 'una', 'las', 'el'], a: 3,
        exp: 'idioma is a -ma word → masculine: el idioma.' },
      { t: 'mc', q: 'el problema ___ (serious)', c: ['seria', 'serio', 'serios', 'serias'], a: 1,
        exp: 'problema is masculine, so the adjective is too: serio.' },
      { t: 'mc', q: '___ sistema', c: ['el', 'la', 'una', 'las'], a: 0,
        exp: 'sistema is a -ma word → masculine: el sistema.' },
      { t: 'mc', q: 'la mano ___ (left)', c: ['izquierdo', 'izquierda', 'izquierdos', 'izquierdas'], a: 1,
        exp: 'mano is feminine → izquierda.' },
      { t: 'mc', q: '___ clima', c: ['la', 'el', 'una', 'las'], a: 1,
        exp: 'clima is a Greek -ma word → masculine: el clima.' },
      { t: 'mc', q: '___ tema', c: ['la', 'el', 'una', 'las'], a: 1,
        exp: 'tema is a -ma word → masculine: el tema.' },
      { t: 'mc', q: '___ planeta', c: ['la', 'una', 'el', 'las'], a: 2,
        exp: 'planeta is masculine despite -a: el planeta.' },
      { t: 'type', q: '___ radio (the radio — broadcasting)', a: ['la'],
        exp: 'radio (broadcasting) is feminine: la radio.' },
      { t: 'mc', q: '___ programa', c: ['la', 'el', 'una', 'las'], a: 1,
        exp: 'programa is a -ma word → masculine: el programa.' },
      { t: 'mc', q: 'el día ___ (long)', c: ['larga', 'largo', 'largos', 'largas'], a: 1,
        exp: 'día is masculine → largo: el día largo.' },
      { t: 'mc', q: 'la foto ___ (old)', c: ['viejo', 'vieja', 'viejos', 'viejas'], a: 1,
        exp: 'foto is feminine → vieja.' },
      { t: 'mc', q: '___ drama', c: ['la', 'una', 'el', 'las'], a: 2,
        exp: 'drama is a -ma word → masculine: el drama.' },
      { t: 'mc', q: '___ poema', c: ['la', 'el', 'una', 'las'], a: 1,
        exp: 'poema is a -ma word → masculine: el poema.' },
      { t: 'mc', q: 'Plural: “the hands”', c: ['los manos', 'las manos', 'los manoses', 'las manas'], a: 1,
        exp: 'mano is feminine → las manos.' },
      { t: 'mc', q: '___ sofá', c: ['la', 'el', 'una', 'las'], a: 1,
        exp: 'sofá is masculine despite -á: el sofá.' },
      { t: 'mc', q: 'la moto ___ (fast)', c: ['rápido', 'rápida', 'rápidos', 'rápidas'], a: 1,
        exp: 'moto is feminine → rápida.' },
    ],
  },

  b1: {
    tenses: [
      { t: 'mc', q: 'Cuando era niño, ___ en México. (vivir)', c: ['viví', 'vivía', 'viviré', 'viviría'], a: 1,
        exp: 'Ongoing situation in the past → imperfect: vivía.' },
      { t: 'mc', q: 'Anoche ___ una película muy buena. (ver)', c: ['veía', 'vi', 'veré', 'vería'], a: 1,
        exp: 'One completed event last night → preterite: vi.' },
      { t: 'mc', q: 'Mientras yo ___, sonó el teléfono. (leer)', c: ['leí', 'leía', 'leeré', 'leería'], a: 1,
        exp: 'Action in progress that got interrupted → imperfect: leía.' },
      { t: 'type', q: 'Mañana yo ___ a Barcelona. (viajar, futuro)', a: ['viajaré', 'viajare'],
        exp: 'Future = infinitive + é: viajaré.' },
      { t: 'mc', q: 'Yo ___ más tiempo la próxima semana. (tener, futuro)', c: ['teneré', 'tendré', 'tendría', 'tenía'], a: 1,
        exp: 'tener has the irregular future stem tendr-: tendré.' },
      { t: 'type', q: 'Me ___ viajar por Sudamérica. (gustar, condicional)', a: ['gustaría', 'gustaria'],
        exp: 'Conditional = infinitive + ía: me gustaría (“I would like”).' },
      { t: 'mc', q: 'Ellos ___ a la fiesta el sábado. (venir, futuro)', c: ['venirán', 'vendrían', 'vendrán', 'venían'], a: 2,
        exp: 'venir → irregular stem vendr- + án: vendrán.' },
      { t: 'mc', q: '___ las tres de la tarde cuando llegamos. (ser)', c: ['Fueron', 'Eran', 'Serán', 'Fue'], a: 1,
        exp: 'Time in the past always takes the imperfect: eran las tres.' },
      { t: 'mc', q: 'En tu lugar, yo no ___ eso. (hacer, condicional)', c: ['haría', 'haré', 'hacía', 'hice'], a: 0,
        exp: 'Hypothetical advice → conditional; hacer → har-: haría.' },
      { t: 'type', q: 'Ayer Marta no ___ venir a clase. (poder, pretérito)', a: ['pudo'],
        exp: 'poder is irregular in the preterite: pude, pudiste, pudo…' },
      { t: 'mc', q: 'De repente, alguien ___ a la puerta. (llamar)', c: ['llamaba', 'llamó', 'llama', 'llamará'], a: 1,
        exp: '“De repente” signals a sudden completed event → preterite: llamó.' },
      { t: 'type', q: 'Nosotros ___ la verdad algún día. (saber, futuro)', a: ['sabremos'],
        exp: 'saber has the irregular future stem sabr-: sabremos.' },
      { t: 'mc', q: 'Ellos dijeron que ___ mañana. (venir)', c: ['vendrían', 'vendrán', 'venían', 'vinieron'], a: 0,
        exp: '“Future in the past” (they said they would come) → conditional: vendrían.' },
      { t: 'mc', q: 'Cada verano nosotros ___ a la playa. (ir)', c: ['fuimos', 'íbamos', 'iremos', 'vamos'], a: 1,
        exp: '“Every summer” = habitual past → imperfect: íbamos.' },
      { t: 'type', q: '¿Qué ___ tú en mi lugar? (hacer, condicional)', a: ['harías'],
        exp: 'hacer → irregular stem har- + ías: harías.' },
      { t: 'mc', q: 'Mañana ___ mal tiempo. (hacer)', c: ['hacerá', 'hará', 'haría', 'hacía'], a: 1,
        exp: 'Future of hacer uses the stem har-: hará (not “hacerá”).' },
      { t: 'mc', q: 'Yo ___ diez años cuando nos mudamos. (tener)', c: ['tuve', 'tenía', 'tendré', 'tendría'], a: 1,
        exp: 'Age in the past → imperfect: tenía diez años.' },
      { t: 'type', q: 'Ellos ___ la casa el año que viene. (vender, futuro)', a: ['venderán'],
        exp: 'Future = infinitive + án: venderán.' },
      { t: 'mc', q: '¿___ ayudarme con esto? (poder — polite request)', c: ['Puedes', 'Podrías', 'Podías', 'Pudiste'], a: 1,
        exp: 'Polite requests use the conditional: ¿Podrías…? (“Could you…?”)' },
      { t: 'mc', q: 'Ayer ___ mucho frío. (hacer)', c: ['hacía', 'hizo', 'hará', 'hace'], a: 1,
        exp: 'Yesterday viewed as one complete block → preterite: hizo frío.' },
      { t: 'type', q: 'Sin coche, nosotros ___ en tren. (viajar, condicional)', a: ['viajaríamos'],
        exp: 'Conditional = infinitive + íamos: viajaríamos.' },
      { t: 'mc', q: 'Ella ___ mientras yo cocinaba. (estudiar)', c: ['estudió', 'estudiaba', 'estudiará', 'estudie'], a: 1,
        exp: 'Two parallel ongoing actions → both imperfect: estudiaba… cocinaba.' },
    ],
    pronouns: [
      { t: 'mc', q: '“Doy el libro a María.” → “___ doy el libro.”', c: ['La', 'Lo', 'Le', 'Se'], a: 2,
        exp: 'a María = indirect object → le.' },
      { t: 'mc', q: 'Replace both objects: “Doy el libro a María.” → “___ doy.”', c: ['Le lo', 'Se lo', 'Lo le', 'Se la'], a: 1,
        exp: 'le + lo is forbidden; le becomes se: Se lo doy.' },
      { t: 'mc', q: 'Why does “le” change to “se” in “Se lo doy”?', c: ['It is formal', 'le cannot appear before lo/la/los/las', 'se sounds better', 'It marks past tense'], a: 1,
        exp: 'Two l- pronouns cannot go together: le/les → se before lo/la/los/las.' },
      { t: 'type', q: 'A mí ___ gustan los tacos.', a: ['me'],
        exp: 'gustar uses indirect object pronouns: a mí me gustan.' },
      { t: 'mc', q: 'In “Te lo digo”, what is “te”?', c: ['Direct object', 'Indirect object', 'Reflexive', 'Subject'], a: 1,
        exp: 'te = to you (indirect), lo = it (direct): “I say it to you.”' },
      { t: 'mc', q: '¿Me prestas tu coche? — Sí, ___ presto.', c: ['te lo', 'te la', 'me lo', 'se lo'], a: 0,
        exp: 'to you (te) + it, el coche (lo) → te lo presto.' },
      { t: 'mc', q: 'Which is written correctly?', c: ['Está diciendomelo', 'Está diciéndomelo', 'Está diciendo melo', 'Está dicíendomelo'], a: 1,
        exp: 'Attached pronouns shift the stress, so an accent is added: diciéndomelo.' },
      { t: 'type', q: 'A ellos ___ encanta bailar.', a: ['les'],
        exp: 'encantar works like gustar: a ellos les encanta.' },
      { t: 'mc', q: '“¿Le diste las llaves a tu hermano?” — “Sí, ___ di.”', c: ['le las', 'se las', 'se los', 'las le'], a: 1,
        exp: 'le + las → se las: Se las di.' },
      { t: 'mc', q: 'Nos ___ mandaron ayer. (las cartas)', c: ['los', 'les', 'las', 'se'], a: 2,
        exp: 'nos (to us) + las (them, las cartas): Nos las mandaron.' },
      { t: 'mc', q: '“Escribo una carta a mis padres.” → “___ escribo una carta.”', c: ['Los', 'Les', 'Se', 'Le'], a: 1,
        exp: 'a mis padres = plural indirect object → les.' },
      { t: 'mc', q: '“¿Me das el libro?” — “Sí, ___ doy.”', c: ['te lo', 'te la', 'me lo', 'se lo'], a: 0,
        exp: 'to you (te) + it, el libro (lo) → te lo doy.' },
      { t: 'type', q: 'A nosotros ___ gusta el cine.', a: ['nos'],
        exp: 'gustar takes indirect object pronouns: a nosotros nos gusta.' },
      { t: 'mc', q: '“Envié las fotos a Juan.” → “___ envié.”', c: ['Le las', 'Se las', 'Se los', 'Las le'], a: 1,
        exp: 'le + las → se las: Se las envié.' },
      { t: 'mc', q: 'A ti ___ interesan los idiomas.', c: ['te', 'ti', 'le', 'me'], a: 0,
        exp: 'interesar works like gustar: a ti te interesan.' },
      { t: 'mc', q: '¿Quién te regaló esas flores? — Mi novio ___ regaló.', c: ['me las', 'me los', 'se las', 'te las'], a: 0,
        exp: 'to me (me) + them, las flores (las) → me las regaló.' },
      { t: 'mc', q: 'Which is written correctly?', c: ['Quiero dárselo', 'Quiero dárlose', 'Quiero se lo dar', 'Quiero darsélo'], a: 0,
        exp: 'Pronouns attach to the infinitive; the added syllables need an accent: dárselo.' },
      { t: 'type', q: 'A mis abuelos ___ encanta el mar.', a: ['les'],
        exp: 'encantar works like gustar: a mis abuelos les encanta.' },
      { t: 'mc', q: '“Compré un regalo para mi hermana.” → “___ compré un regalo.”', c: ['La', 'Le', 'Se', 'Lo'], a: 1,
        exp: 'The recipient (for my sister) is an indirect object → le.' },
      { t: 'mc', q: 'In “Se lo expliqué”, “lo” refers to…', c: ['the person listening', 'the thing explained', 'the speaker', 'a place'], a: 1,
        exp: 'lo = the direct object (the thing explained); se = to him/her/them.' },
      { t: 'mc', q: '“¿Nos mandáis los documentos?” — “Sí, ___ mandamos.”', c: ['os los', 'os las', 'nos los', 'se los'], a: 0,
        exp: 'to you all (os) + them, los documentos (los) → os los mandamos.' },
      { t: 'mc', q: 'A usted ___ gustaría un café, ¿verdad?', c: ['lo', 'te', 'le', 'se'], a: 2,
        exp: 'usted takes third-person indirect le: a usted le gustaría.' },
    ],
    gender: [
      { t: 'mc', q: '___ canción', c: ['el', 'la', 'un', 'los'], a: 1,
        exp: '-ción words are always feminine: la canción.' },
      { t: 'mc', q: '___ ciudad', c: ['el', 'un', 'la', 'los'], a: 2,
        exp: '-dad words are always feminine: la ciudad.' },
      { t: 'type', q: '___ libertad (the liberty)', a: ['la'],
        exp: '-tad words are feminine: la libertad.' },
      { t: 'mc', q: '___ costumbre', c: ['el', 'la', 'un', 'los'], a: 1,
        exp: '-umbre words are feminine: la costumbre.' },
      { t: 'mc', q: '___ corazón', c: ['la', 'una', 'el', 'las'], a: 2,
        exp: 'Careful! -ón (not -ción/-sión) is usually masculine: el corazón.' },
      { t: 'mc', q: '___ televisión', c: ['el', 'la', 'un', 'los'], a: 1,
        exp: '-sión words are feminine: la televisión.' },
      { t: 'mc', q: '___ análisis', c: ['la', 'el', 'las', 'una'], a: 1,
        exp: 'Unlike la crisis / la tesis, análisis is masculine: el análisis.' },
      { t: 'mc', q: '___ crisis', c: ['el', 'los', 'la', 'un'], a: 2,
        exp: 'crisis is feminine: la crisis.' },
      { t: 'mc', q: '___ viaje', c: ['la', 'una', 'las', 'el'], a: 3,
        exp: '-aje words are masculine: el viaje.' },
      { t: 'mc', q: '___ vejez', c: ['el', 'la', 'un', 'los'], a: 1,
        exp: '-ez abstract nouns are feminine: la vejez.' },
      { t: 'mc', q: '___ universidad', c: ['el', 'la', 'un', 'los'], a: 1,
        exp: '-dad words are always feminine: la universidad.' },
      { t: 'mc', q: '___ decisión', c: ['el', 'un', 'la', 'los'], a: 2,
        exp: '-sión words are feminine: la decisión.' },
      { t: 'mc', q: '___ amor', c: ['la', 'el', 'una', 'las'], a: 1,
        exp: '-or words are usually masculine: el amor.' },
      { t: 'type', q: '___ belleza (the beauty)', a: ['la'],
        exp: '-eza abstract nouns are feminine: la belleza.' },
      { t: 'mc', q: '___ paisaje', c: ['la', 'el', 'una', 'las'], a: 1,
        exp: '-aje words are masculine: el paisaje.' },
      { t: 'mc', q: '___ muchedumbre', c: ['el', 'la', 'un', 'los'], a: 1,
        exp: '-umbre words are feminine: la muchedumbre.' },
      { t: 'mc', q: '___ calor (standard usage)', c: ['la', 'el', 'una', 'las'], a: 1,
        exp: 'calor is masculine in standard Spanish: el calor (hace mucho calor).' },
      { t: 'mc', q: '___ niñez', c: ['el', 'la', 'un', 'los'], a: 1,
        exp: '-ez abstract nouns are feminine: la niñez.' },
      { t: 'mc', q: '___ equipaje', c: ['la', 'una', 'el', 'las'], a: 2,
        exp: '-aje words are masculine: el equipaje.' },
      { t: 'mc', q: '___ verdad', c: ['el', 'la', 'un', 'los'], a: 1,
        exp: '-dad words are feminine: la verdad.' },
      { t: 'mc', q: '“la canción hermosa” in the plural:', c: ['los canciones hermosos', 'las canciones hermosas', 'las cancións hermosas', 'los canciónes hermosas'], a: 1,
        exp: '-ón → -ones (accent drops), feminine plural agreement: las canciones hermosas.' },
      { t: 'mc', q: '___ tesis', c: ['el', 'la', 'los', 'un'], a: 1,
        exp: 'tesis is feminine (like la crisis): la tesis.' },
    ],
  },

  b2: {
    tenses: [
      { t: 'mc', q: 'Quiero que tú ___ a la fiesta. (venir)', c: ['vienes', 'vengas', 'vendrás', 'venías'], a: 1,
        exp: 'querer que + subjunctive; venir → yo vengo → vengas.' },
      { t: 'type', q: 'Es importante que nosotros ___ todos los días. (estudiar)', a: ['estudiemos'],
        exp: 'Impersonal expression + que → subjunctive: estudiemos.' },
      { t: 'mc', q: 'No creo que ella ___ la respuesta. (saber)', c: ['sabe', 'sabrá', 'sepa', 'sabía'], a: 2,
        exp: 'Doubt/denial → subjunctive; saber is irregular: sepa.' },
      { t: 'mc', q: 'Creo que él ___ razón. (tener)', c: ['tenga', 'tiene', 'tuviera', 'tendría'], a: 1,
        exp: 'Belief (affirmative creer) takes the indicative: tiene.' },
      { t: 'type', q: '¡___ más despacio, por favor! (hablar, tú — affirmative command)', a: ['habla'],
        exp: 'Affirmative tú command = 3rd person present: habla.' },
      { t: 'mc', q: 'No ___ eso, está caducado. (comer, tú)', c: ['come', 'comes', 'comas', 'comieras'], a: 2,
        exp: 'Negative tú commands use the subjunctive: no comas.' },
      { t: 'mc', q: 'Ojalá ___ mañana. (llover)', c: ['llueve', 'lloverá', 'llueva', 'llovía'], a: 2,
        exp: 'ojalá always takes the subjunctive: llueva.' },
      { t: 'mc', q: 'Cuando ___ a casa, te llamaré. (llegar, yo)', c: ['llego', 'llegué', 'llegaré', 'llegue'], a: 3,
        exp: 'cuando + future meaning → subjunctive: llegue (with -gu- to keep the hard g).' },
      { t: 'mc', q: 'Te recomiendo que ___ ese libro. (leer)', c: ['lees', 'leas', 'leerás', 'leías'], a: 1,
        exp: 'Recommendation + que → subjunctive: leas.' },
      { t: 'type', q: '¡___ paciencia! (tener, tú — affirmative command)', a: ['ten'],
        exp: 'tener has an irregular tú command: ten (di, haz, ve, pon, sal, sé, ten, ven).' },
      { t: 'mc', q: 'Espero que ustedes ___ pronto. (volver)', c: ['vuelven', 'vuelvan', 'volverán', 'volvían'], a: 1,
        exp: 'esperar que (wish) → subjunctive; volver stem-changes: vuelvan.' },
      { t: 'type', q: 'Dudo que él ___ la verdad. (decir)', a: ['diga'],
        exp: 'Doubt → subjunctive; decir → yo digo → diga.' },
      { t: 'mc', q: 'Es posible que ___ mañana. (nevar)', c: ['nieva', 'nieve', 'nevará', 'nevaba'], a: 1,
        exp: 'es posible que (impersonal, uncertain) → subjunctive: nieve.' },
      { t: 'mc', q: 'No ___ tan rápido, por favor. (conducir, tú)', c: ['conduce', 'conduces', 'conduzcas', 'condujeras'], a: 2,
        exp: 'Negative tú command = subjunctive; conducir → conduzco → conduzcas.' },
      { t: 'type', q: '¡___ aquí, por favor! (venir, tú — affirmative command)', a: ['ven'],
        exp: 'venir has an irregular tú command: ven.' },
      { t: 'mc', q: 'Me alegro de que te ___ la ciudad. (gustar)', c: ['gusta', 'guste', 'gustará', 'gustaba'], a: 1,
        exp: 'Emotion (alegrarse de que) → subjunctive: guste.' },
      { t: 'mc', q: '___ ustedes la puerta, por favor. (abrir — command)', c: ['Abren', 'Abran', 'Abrid', 'Abrirán'], a: 1,
        exp: 'ustedes commands always use the subjunctive: abran.' },
      { t: 'mc', q: 'Aunque ___ caro, lo compraré. (ser — “even if it is”)', c: ['es', 'sea', 'será', 'era'], a: 1,
        exp: 'aunque + unknown/hypothetical → subjunctive: aunque sea caro.' },
      { t: 'type', q: 'Quiero que nosotros ___ juntos. (ir)', a: ['vayamos'],
        exp: 'querer que → subjunctive; ir is irregular: vayamos.' },
      { t: 'mc', q: 'Es verdad que ella ___ mucho. (trabajar)', c: ['trabaje', 'trabaja', 'trabajara', 'trabajaría'], a: 1,
        exp: 'es verdad que states a fact → indicative: trabaja.' },
      { t: 'mc', q: '¡No me ___ eso! (decir, tú)', c: ['di', 'dices', 'digas', 'dirás'], a: 2,
        exp: 'Negative tú command → subjunctive: no me digas.' },
      { t: 'mc', q: 'Busco un piso que ___ balcón. (tener — any flat at all)', c: ['tiene', 'tenga', 'tendrá', 'tenía'], a: 1,
        exp: 'An indefinite antecedent (any flat, maybe none exists) → subjunctive: tenga.' },
    ],
    pronouns: [
      { t: 'mc', q: 'El libro ___ leí era fascinante.', c: ['quien', 'que', 'cuyo', 'lo que'], a: 1,
        exp: 'que is the all-purpose relative pronoun for things: el libro que leí.' },
      { t: 'mc', q: 'La mujer con ___ hablé es abogada.', c: ['que', 'cuya', 'quien', 'lo que'], a: 2,
        exp: 'After a preposition, people take quien: con quien hablé.' },
      { t: 'mc', q: '___ dices es verdad.', c: ['Que', 'Lo que', 'Quien', 'Cual'], a: 1,
        exp: '“What (the thing that) you say” → lo que.' },
      { t: 'mc', q: '“Se venden casas.” What is this “se”?', c: ['Reflexive', 'Replacement for le', 'Impersonal/passive se', 'Accidental se'], a: 2,
        exp: 'Passive se: “houses are sold / for sale”.' },
      { t: 'mc', q: '“Se me olvidaron las llaves.” This construction…', c: ['blames me directly', 'presents it as an accident that happened to me', 'is past subjunctive', 'is a command'], a: 1,
        exp: 'The accidental se removes blame: “the keys got forgotten on me”.' },
      { t: 'mc', q: 'El autor ___ libro ganó el premio vive aquí.', c: ['que', 'quien', 'cuyo', 'el cual'], a: 2,
        exp: '“whose” → cuyo, agreeing with libro (masc. sing.): cuyo libro.' },
      { t: 'mc', q: 'La empresa para ___ trabajo es alemana.', c: ['la cual', 'el cual', 'cuyo', 'lo que'], a: 0,
        exp: 'After a preposition, formal style: para la cual (or para la que).' },
      { t: 'mc', q: '“Se lo dije a ella.” Here “se” =', c: ['reflexive', 'le (changed before lo)', 'impersonal', 'accidental'], a: 1,
        exp: 'le + lo → se lo: “I said it to her.”' },
      { t: 'mc', q: '“___ habla español aquí.”', c: ['Se', 'Le', 'Lo', 'Sí'], a: 0,
        exp: 'Impersonal se: Se habla español = “Spanish is spoken here”.' },
      { t: 'mc', q: 'Los niños ___ escriben cartas. (to each other)', c: ['los', 'les', 'se', 'nos'], a: 2,
        exp: 'Reciprocal se: they write letters to each other.' },
      { t: 'mc', q: 'La casa en ___ vivo es antigua.', c: ['que', 'la que', 'quien', 'cuya'], a: 1,
        exp: 'After a preposition, things take el/la que (or el/la cual): en la que vivo.' },
      { t: 'mc', q: 'Es la profesora ___ hijos estudian aquí.', c: ['que', 'quienes', 'cuyos', 'cuyas'], a: 2,
        exp: 'cuyo agrees with the thing possessed (hijos, masc. pl.): cuyos hijos.' },
      { t: 'mc', q: 'Aquí se ___ coches. (reparar)', c: ['repara', 'reparan', 'repare', 'reparen'], a: 1,
        exp: 'Passive se agrees with the noun: coches is plural → se reparan.' },
      { t: 'mc', q: '“Se me rompió el vaso.” Who is affected?', c: ['nobody', 'the speaker', 'the glassmaker', 'the listener'], a: 1,
        exp: 'me marks the affected person: the glass broke “on me”.' },
      { t: 'mc', q: '“Los que llegaron tarde” means…', c: ['the ones who arrived late', 'which arrived late', 'whose late arrival', 'them, arriving late'], a: 0,
        exp: 'el que / los que = “the one(s) who” — a headless relative.' },
      { t: 'mc', q: '“No entiendo ___ me dices.”', c: ['que', 'lo que', 'quien', 'cual'], a: 1,
        exp: '“what (the thing that) you tell me” → lo que.' },
      { t: 'mc', q: 'Mis amigos, ___ viven en Perú, vienen en junio. (formal)', c: ['los cuales', 'cuyos', 'lo que', 'el cual'], a: 0,
        exp: 'Formal non-restrictive relative for a plural noun: los cuales.' },
      { t: 'mc', q: '“Se necesitan camareros.” This means…', c: ['They need themselves', 'Waiters are needed', 'He needs waiters', 'We need waiters'], a: 1,
        exp: 'Passive se: “waiters are needed / waiters wanted”.' },
      { t: 'mc', q: '“Se te cayeron las monedas.” The “te” is…', c: ['a direct object', 'the affected person', 'the subject', 'reflexive on the coins'], a: 1,
        exp: 'Accidental se + dative: the coins fell “on you”.' },
      { t: 'mc', q: 'El chico con ___ salgo es de Cuba.', c: ['que', 'quien', 'cual', 'cuyo'], a: 1,
        exp: 'Person after a preposition → quien: con quien salgo.' },
      { t: 'mc', q: '“¿Le mandaste el paquete a tu tía?” — “Sí, ___ mandé ayer.”', c: ['le lo', 'se lo', 'se la', 'lo le'], a: 1,
        exp: 'le + lo → se lo: Se lo mandé.' },
      { t: 'mc', q: 'En España ___ cena muy tarde.', c: ['se', 'le', 'lo', 'les'], a: 0,
        exp: 'Impersonal se: “people eat dinner very late in Spain”.' },
    ],
    gender: [
      { t: 'mc', q: '___ agua está fría.', c: ['La', 'El', 'Los', 'Un'], a: 1,
        exp: 'agua starts with stressed a- → el agua; but it stays feminine: fría.' },
      { t: 'mc', q: 'Plural of “el agua”:', c: ['los aguas', 'las aguas', 'los aguos', 'el aguas'], a: 1,
        exp: 'The el is only for the singular sound clash; plural is las aguas.' },
      { t: 'mc', q: '___ águila es majestuosa.', c: ['La', 'Los', 'El', 'Las'], a: 2,
        exp: 'Stressed á- → el águila (still feminine: majestuosa).' },
      { t: 'mc', q: 'el alma ___ (good)', c: ['bueno', 'buena', 'buenos', 'buenas'], a: 1,
        exp: 'alma is feminine despite el → buena.' },
      { t: 'mc', q: '___ amiga de Carlos vive aquí. (the)', c: ['El', 'La', 'Un', 'Los'], a: 1,
        exp: 'amiga starts with UNstressed a-, so normal la applies: la amiga.' },
      { t: 'mc', q: 'el aula ___ (small)', c: ['pequeño', 'pequeña', 'pequeños', 'pequeñas'], a: 1,
        exp: 'aula is feminine → pequeña, even with el.' },
      { t: 'mc', q: 'Which is the standard modern form?', c: ['la mar', 'el mar', 'los mar', 'las mar'], a: 1,
        exp: 'el mar is standard; la mar survives in poetry and sailor speech.' },
      { t: 'mc', q: '“Art” in the plural (fine arts):', c: ['los bellos artes', 'las bellas artes', 'los bellas artes', 'el bellas artes'], a: 1,
        exp: 'el arte (sing.) but las bellas artes (pl.) — arte flips gender in the plural.' },
      { t: 'mc', q: 'Tengo mucha ___. (hunger)', c: ['hambre', 'hambro', 'hambra', 'hambres'], a: 0,
        exp: 'el hambre is feminine (stressed ha-): mucha hambre.' },
      { t: 'mc', q: '___ hacha está afilada.', c: ['La', 'El', 'Los', 'Una'], a: 1,
        exp: 'hacha: stressed ha- → el hacha, but feminine: afilada.' },
      { t: 'mc', q: '___ arma está cargada.', c: ['La', 'El', 'Los', 'Una'], a: 1,
        exp: 'arma: stressed a- → el arma; still feminine: cargada.' },
      { t: 'mc', q: 'el área ___ (protected)', c: ['protegido', 'protegida', 'protegidos', 'protegidas'], a: 1,
        exp: 'área is feminine despite el → protegida.' },
      { t: 'mc', q: '___ ala del avión (the wing)', c: ['La', 'El', 'Las', 'Un'], a: 1,
        exp: 'ala: stressed a- → el ala (feminine: el ala rota).' },
      { t: 'mc', q: 'Plural of “el alma”:', c: ['los almas', 'las almas', 'los almos', 'el almas'], a: 1,
        exp: 'The el is singular-only; plural is regular feminine: las almas.' },
      { t: 'mc', q: '___ arena de la playa', c: ['El', 'La', 'Los', 'Un'], a: 1,
        exp: 'arena starts with UNstressed a- → normal la arena.' },
      { t: 'mc', q: 'Tengo ___ hambre terrible.', c: ['un', 'una', 'el', 'la'], a: 0,
        exp: 'The indefinite article also switches before stressed ha-: un hambre (still feminine).' },
      { t: 'mc', q: '___ águilas vuelan alto. (plural)', c: ['Los', 'Las', 'El', 'Un'], a: 1,
        exp: 'Plural is regular feminine: las águilas.' },
      { t: 'mc', q: '___ aula está llena de estudiantes.', c: ['La', 'El', 'Un', 'Los'], a: 1,
        exp: 'aula: stressed au- → el aula; feminine: llena.' },
      { t: 'mc', q: 'el agua ___ (clear)', c: ['claro', 'clara', 'claros', 'claras'], a: 1,
        exp: 'agua is feminine → clara, even with el.' },
      { t: 'mc', q: '___ avenida principal', c: ['El', 'La', 'Un', 'Los'], a: 1,
        exp: 'avenida starts with UNstressed a- → la avenida.' },
      { t: 'mc', q: '“The axe and the saw”: ___ hacha y ___ sierra', c: ['el… la', 'la… la', 'el… el', 'la… el'], a: 0,
        exp: 'hacha has stressed ha- → el; sierra is a normal feminine → la.' },
      { t: 'mc', q: 'Which noun does NOT take “el” in the singular?', c: ['agua', 'águila', 'amiga', 'alma'], a: 2,
        exp: 'amiga has UNstressed a- → la amiga; the others have stressed a-/á-.' },
    ],
  },

  c1: {
    tenses: [
      { t: 'mc', q: 'Si ___ dinero, viajaría por el mundo. (tener, yo)', c: ['tengo', 'tuviera', 'tendría', 'tenga'], a: 1,
        exp: 'Unreal present condition: si + imperfect subjunctive → tuviera.' },
      { t: 'type', q: 'Si hubiera estudiado, ___ el examen. (aprobar — conditional perfect)', a: ['habría aprobado', 'habria aprobado'],
        exp: 'Unreal past: si + pluperfect subj. → conditional perfect: habría aprobado.' },
      { t: 'mc', q: 'Ya ___ cuando llegaste. (comer, yo)', c: ['he comido', 'había comido', 'habré comido', 'hube comer'], a: 1,
        exp: 'Action before another past action → pluperfect: había comido.' },
      { t: 'mc', q: 'Dudaba que ellos ___ a tiempo. (venir)', c: ['vengan', 'vendrían', 'vinieran', 'vienen'], a: 2,
        exp: 'Past doubt → imperfect subjunctive: vinieran.' },
      { t: 'type', q: 'Nosotros ya ___ esa película. (ver — present perfect)', a: ['hemos visto'],
        exp: 'haber + irregular participle visto: hemos visto.' },
      { t: 'mc', q: 'Para junio, yo ya ___ el proyecto. (terminar)', c: ['terminaré', 'habré terminado', 'habría terminado', 'termine'], a: 1,
        exp: 'Completed before a future point → future perfect: habré terminado.' },
      { t: 'mc', q: 'Me pidió que le ___ con la mudanza. (ayudar)', c: ['ayude', 'ayudara', 'ayudaré', 'ayudo'], a: 1,
        exp: 'Past main verb → imperfect subjunctive: ayudara (sequence of tenses).' },
      { t: 'mc', q: 'Habla como si ___ todo. (saber)', c: ['sabe', 'sepa', 'supiera', 'sabría'], a: 2,
        exp: 'como si always takes the imperfect subjunctive: supiera.' },
      { t: 'mc', q: '¿Has ___ la puerta? (abrir)', c: ['abrido', 'abierto', 'abriendo', 'abrió'], a: 1,
        exp: 'abrir has the irregular participle abierto.' },
      { t: 'type', q: 'Ojalá ___ venir ayer. (poder — pluperfect subjunctive: “if only you had been able”)', a: ['hubieras podido', 'hubiera podido'],
        exp: 'Regret about the past: ojalá + hubiera(s) podido.' },
      { t: 'mc', q: 'Cuando llegues, nosotros ya ___. (salir)', c: ['salimos', 'habremos salido', 'hemos salido', 'saldríamos'], a: 1,
        exp: 'Completed before a future moment → future perfect: habremos salido.' },
      { t: 'type', q: 'Nunca ___ una tormenta así. (yo, ver — present perfect)', a: ['he visto'],
        exp: 'haber + irregular participle visto: he visto.' },
      { t: 'mc', q: 'Si me lo ___ antes, habría venido. (decir)', c: ['dijeras', 'hubieras dicho', 'habrías dicho', 'dices'], a: 1,
        exp: 'Unreal past condition: si + pluperfect subjunctive: hubieras dicho.' },
      { t: 'mc', q: 'Esperaba que tú ___ la cena. (preparar)', c: ['prepares', 'prepararas', 'prepararías', 'preparabas'], a: 1,
        exp: 'Past main verb → imperfect subjunctive: prepararas (sequence of tenses).' },
      { t: 'type', q: 'Ellos ya ___ la tarea cuando llamé. (hacer — pluperfect)', a: ['habían hecho'],
        exp: 'Action completed before another past action: habían hecho.' },
      { t: 'mc', q: 'Yo que tú, no ___ eso. (hacer)', c: ['haría', 'haré', 'hago', 'hiciera'], a: 0,
        exp: '“If I were you” advice → conditional: no haría eso.' },
      { t: 'mc', q: 'Si ___ más tiempo, saldríamos más. (nosotros, tener)', c: ['tenemos', 'tuviéramos', 'tendríamos', 'tengamos'], a: 1,
        exp: 'Unreal present: si + imperfect subjunctive: tuviéramos.' },
      { t: 'mc', q: 'No pensé que ___ tan difícil. (ser)', c: ['es', 'fuera', 'sea', 'será'], a: 1,
        exp: 'Negated past belief → imperfect subjunctive: fuera.' },
      { t: 'type', q: '¿Todavía no has ___ el correo? (escribir)', a: ['escrito'],
        exp: 'escribir has the irregular participle escrito.' },
      { t: 'mc', q: 'Para 2030, la ciudad ___ mucho. (cambiar)', c: ['cambiará', 'habrá cambiado', 'habría cambiado', 'cambie'], a: 1,
        exp: 'Completed by a future date → future perfect: habrá cambiado.' },
      { t: 'mc', q: 'Nos trataron como si ___ niños. (ser)', c: ['éramos', 'fuéramos', 'seríamos', 'seamos'], a: 1,
        exp: 'como si always takes the imperfect subjunctive: fuéramos.' },
      { t: 'mc', q: 'Habría venido si lo ___ invitado. (haber, nosotros)', c: ['habíamos', 'hubiéramos', 'habríamos', 'hayamos'], a: 1,
        exp: 'The si-clause takes the pluperfect subjunctive: si lo hubiéramos invitado.' },
    ],
    pronouns: [
      { t: 'mc', q: '“Le vi ayer” (= a Juan). This leísmo is…', c: ['always wrong', 'accepted by the RAE for a masculine, singular, human direct object', 'required in Latin America', 'only used in writing'], a: 1,
        exp: 'The RAE tolerates le for masculine singular human direct objects (common in Spain).' },
      { t: 'mc', q: '___ difícil es empezar.', c: ['El', 'La', 'Lo', 'Le'], a: 2,
        exp: 'Neuter lo + adjective = “the … thing/part”: lo difícil.' },
      { t: 'mc', q: 'Habla siempre de ___ mismo.', c: ['él', 'se', 'sí', 'su'], a: 2,
        exp: 'Reflexive after a preposition → sí (mismo): habla de sí mismo.' },
      { t: 'mc', q: 'Siempre lleva el pasaporte ___. (with himself)', c: ['con sí', 'consigo', 'con él mismo… only', 'contigo'], a: 1,
        exp: 'con + sí fuses into consigo.' },
      { t: 'mc', q: '“Se me murió el gato.” The “me” expresses…', c: ['who did it', 'that the loss affects me emotionally', 'possession only', 'formality'], a: 1,
        exp: 'Dative of interest: the event happened “on me” — I am affected.' },
      { t: 'mc', q: 'Quienquiera que ___, no abras la puerta. (ser)', c: ['es', 'sea', 'fuera', 'será'], a: 1,
        exp: 'quienquiera que + subjunctive: sea.' },
      { t: 'mc', q: '“___ mucho abarca, poco aprieta.”', c: ['Que', 'Cual', 'Quien', 'Cuyo'], a: 2,
        exp: 'Headless relative for people → quien: “He who grasps too much…”' },
      { t: 'mc', q: '¿Supiste ___ de Marta? (the business about)', c: ['el', 'la', 'lo', 'le'], a: 2,
        exp: 'lo de + noun = “the matter/business about”: lo de Marta.' },
      { t: 'mc', q: 'With “usted” (formal you, masc.) as direct object, the standard pronoun is…', c: ['le', 'lo', 'se', 'te'], a: 1,
        exp: 'Standard: lo veo (usted, masc.); le veo is tolerated leísmo.' },
      { t: 'mc', q: '“Cuanto más estudio, ___ aprendo.”', c: ['lo más', 'más', 'el más', 'mucho'], a: 1,
        exp: 'Correlative: cuanto más…, más… — no article.' },
      { t: 'mc', q: 'In “Dile la verdad”, the attached “-le” is…', c: ['a direct object', 'an indirect object', 'reflexive', 'a subject pronoun'], a: 1,
        exp: 'di + le = “tell TO him/her” → indirect object.' },
      { t: 'mc', q: '___ bueno de vivir aquí es el clima.', c: ['El', 'Lo', 'La', 'Le'], a: 1,
        exp: 'Neuter lo + adjective: lo bueno = “the good thing”.' },
      { t: 'mc', q: 'Ella solo piensa en ___ misma.', c: ['ella', 'se', 'sí', 'su'], a: 2,
        exp: 'Reflexive after a preposition → sí misma.' },
      { t: 'mc', q: '“No te me pongas nervioso.” The “me” is…', c: ['a direct object', 'a dative of interest — it affects me', 'reflexive', 'a mistake'], a: 1,
        exp: 'The ethical dative: “don’t go getting nervous on me”.' },
      { t: 'mc', q: 'Trajo el dinero ___. (with her)', c: ['con sí', 'consigo', 'con se', 'contigo'], a: 1,
        exp: 'con + sí fuses into consigo.' },
      { t: 'mc', q: '“¿Son felices? — Lo son.” The “lo”…', c: ['replaces the adjective “felices”', 'is a masculine direct object', 'is leísmo', 'is impersonal'], a: 0,
        exp: 'Invariable neuter lo stands in for a predicate adjective or noun: Lo son.' },
      { t: 'mc', q: 'Hagan ___ que hagan, no te rindas.', c: ['el', 'lo', 'la', 'los'], a: 1,
        exp: '“Whatever they do” → lo que: hagan lo que hagan.' },
      { t: 'mc', q: '“A quien madruga, Dios le ayuda.” Here “quien”…', c: ['refers to a specific person', 'is a headless relative — “whoever”', 'is a question word', 'is incorrect'], a: 1,
        exp: 'quien without an antecedent = “whoever / he who”.' },
      { t: 'mc', q: 'Standard (non-leísta): “Vi a Juan y a Pedro. ___ vi en el parque.”', c: ['Les', 'Los', 'Se', 'Le'], a: 1,
        exp: 'Plural direct objects are always los/las — leísmo is only tolerated in the masculine singular.' },
      { t: 'mc', q: '“Se lo agradezco” (said to a client). The “se” refers to…', c: ['myself', 'usted — to you, formal', 'the thing thanked', 'nobody'], a: 1,
        exp: 'le (a usted) → se before lo: “I thank you for it”.' },
      { t: 'mc', q: '¿Lo decidisteis entre ___? (among yourselves)', c: ['os', 'vosotros', 'sí', 'se'], a: 1,
        exp: 'entre takes subject pronouns: entre vosotros, entre tú y yo.' },
      { t: 'mc', q: '“Le di el libro a él, no a ella.” Why add “a él”?', c: ['It is redundant and wrong', 'To clarify or emphasize who “le” is', 'Because le is plural', 'Pure formality'], a: 1,
        exp: 'le is ambiguous, so a él/a ella/a usted clarifies or contrasts.' },
    ],
    gender: [
      { t: 'mc', q: '“They invested a lot of capital.” → Invirtieron mucho ___.', c: ['capital (el)', 'capital (la)', 'capitala', 'capitales (las)'], a: 0,
        exp: 'el capital = money; la capital = capital city.' },
      { t: 'mc', q: '“Madrid is the capital.” → Madrid es ___ capital.', c: ['el', 'la', 'un', 'lo'], a: 1,
        exp: 'la capital = capital city.' },
      { t: 'mc', q: '“The priest” vs. “the cure”:', c: ['la cura / el cura', 'el cura / la cura', 'el curo / la cura', 'both are el'], a: 1,
        exp: 'el cura = priest; la cura = cure.' },
      { t: 'mc', q: 'Me duele ___ frente. (forehead)', c: ['el', 'la', 'un', 'lo'], a: 1,
        exp: 'la frente = forehead; el frente = front (war/weather).' },
      { t: 'mc', q: '“Everything is in order.” → Todo está en ___.', c: ['la orden', 'el orden', 'las órdenes', 'lo orden'], a: 1,
        exp: 'el orden = order/sequence; la orden = command.' },
      { t: 'mc', q: 'A child flies ___ cometa. (kite)', c: ['el', 'un', 'una', 'los'], a: 2,
        exp: 'la cometa = kite; el cometa = comet.' },
      { t: 'mc', q: 'In Latin America, “the potato” is…', c: ['el papa', 'la papa', 'el papá', 'la papá'], a: 1,
        exp: 'la papa = potato; el papa = pope; el papá = dad.' },
      { t: 'mc', q: '“The slope was steep.” → ___ pendiente era empinada.', c: ['El', 'La', 'Lo', 'Un'], a: 1,
        exp: 'la pendiente = slope; el pendiente = earring (Spain).' },
      { t: 'mc', q: 'The queen appeared before ___ corte. (the royal court)', c: ['el', 'la', 'un', 'lo'], a: 1,
        exp: 'la corte = court; el corte = cut.' },
      { t: 'mc', q: 'Compré ___ guía de Roma. (guidebook)', c: ['un', 'una', 'el', 'los'], a: 1,
        exp: 'la guía = guidebook; el/la guía = the guide (person).' },
      { t: 'mc', q: '“el editorial” vs. “la editorial”:', c: ['opinion piece / publishing house', 'publishing house / opinion piece', 'both = opinion piece', 'both = publisher'], a: 0,
        exp: 'el editorial = the (newspaper) editorial; la editorial = the publisher.' },
      { t: 'mc', q: '“The future is uncertain.” → ___ mañana es incierto.', c: ['La', 'El', 'Una', 'Lo'], a: 1,
        exp: 'el mañana = the future; la mañana = the morning.' },
      { t: 'mc', q: 'Nos vemos por ___ mañana. (in the morning)', c: ['el', 'la', 'lo', 'un'], a: 1,
        exp: 'la mañana = the morning; el mañana = the future.' },
      { t: 'mc', q: 'El paciente está en ___ coma.', c: ['la', 'el', 'una', 'lo'], a: 1,
        exp: 'el coma = coma (medical); la coma = comma.' },
      { t: 'mc', q: 'Falta ___ coma en esta frase. (comma)', c: ['el', 'un', 'una', 'lo'], a: 2,
        exp: 'la coma = comma → una coma.' },
      { t: 'mc', q: '___ radio de un círculo (radius)', c: ['La', 'El', 'Una', 'Las'], a: 1,
        exp: 'el radio = radius (also the metal); la radio = radio broadcasting.' },
      { t: 'mc', q: 'El soldado recibió ___ orden de retirarse.', c: ['el', 'la', 'un', 'lo'], a: 1,
        exp: 'la orden = command; el orden = order/sequence.' },
      { t: 'mc', q: 'Caminamos por ___ margen del río. (riverbank)', c: ['el', 'la', 'un', 'lo'], a: 1,
        exp: 'la margen = riverbank; el margen = margin (page, profit).' },
      { t: 'mc', q: '“el cólera” vs. “la cólera”:', c: ['disease / rage', 'rage / disease', 'both = the disease', 'both = rage'], a: 0,
        exp: 'el cólera = cholera; la cólera = rage, anger.' },
      { t: 'mc', q: '“el parte” vs. “la parte”:', c: ['report, bulletin / portion', 'portion / report, bulletin', 'both = portion', 'both = report'], a: 0,
        exp: 'el parte = report/bulletin (el parte meteorológico); la parte = part, portion.' },
      { t: 'mc', q: 'Dieron ___ parte meteorológico en la tele.', c: ['la', 'el', 'una', 'lo'], a: 1,
        exp: 'el parte = bulletin/report → el parte meteorológico.' },
      { t: 'mc', q: 'Which pair is correct?', c: ['el frente = forehead / la frente = battlefront', 'el frente = battlefront / la frente = forehead', 'both mean forehead', 'both mean front line'], a: 1,
        exp: 'el frente = front (war, weather); la frente = forehead.' },
    ],
  },
};

/* ============================================================
   Conjugation drill engine data
   ============================================================ */

const PERSONS = [
  { key: 0, label: 'yo' },
  { key: 1, label: 'tú' },
  { key: 2, label: 'él/ella/usted' },
  { key: 3, label: 'nosotros' },
  { key: 4, label: 'vosotros' },
  { key: 5, label: 'ellos/ustedes' },
];

const REGULAR_ENDINGS = {
  present: {
    ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
    er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
    ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
  },
  preterite: {
    ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
    er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
    ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
  },
  imperfect: {
    ar: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
    er: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    ir: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
  },
  // future/conditional endings attach to the full infinitive (or irregular stem)
  future: { all: ['é', 'ás', 'á', 'emos', 'éis', 'án'] },
  conditional: { all: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'] },
  presentSubj: {
    ar: ['e', 'es', 'e', 'emos', 'éis', 'en'],
    er: ['a', 'as', 'a', 'amos', 'áis', 'an'],
    ir: ['a', 'as', 'a', 'amos', 'áis', 'an'],
  },
  imperfectSubj: {
    ar: ['ara', 'aras', 'ara', 'áramos', 'arais', 'aran'],
    er: ['iera', 'ieras', 'iera', 'iéramos', 'ierais', 'ieran'],
    ir: ['iera', 'ieras', 'iera', 'iéramos', 'ierais', 'ieran'],
  },
};

const TENSE_INFO = {
  present:       { name: 'presente',               en: 'present' },
  preterite:     { name: 'pretérito',              en: 'preterite' },
  imperfect:     { name: 'imperfecto',             en: 'imperfect' },
  future:        { name: 'futuro',                 en: 'future' },
  conditional:   { name: 'condicional',            en: 'conditional' },
  presentSubj:   { name: 'presente de subjuntivo', en: 'present subjunctive' },
  imperfectSubj: { name: 'imperfecto de subjuntivo', en: 'imperfect subjunctive' },
};

// Which tenses each level drills
const LEVEL_TENSES = {
  a1: ['present'],
  a2: ['present', 'preterite', 'imperfect'],
  b1: ['present', 'preterite', 'imperfect', 'future', 'conditional'],
  b2: ['present', 'preterite', 'imperfect', 'future', 'conditional', 'presentSubj'],
  c1: ['present', 'preterite', 'imperfect', 'future', 'conditional', 'presentSubj', 'imperfectSubj'],
};

const REGULAR_VERBS = [
  { inf: 'hablar',   en: 'to speak' },
  { inf: 'trabajar', en: 'to work' },
  { inf: 'estudiar', en: 'to study' },
  { inf: 'comprar',  en: 'to buy' },
  { inf: 'cocinar',  en: 'to cook' },
  { inf: 'comer',    en: 'to eat' },
  { inf: 'aprender', en: 'to learn' },
  { inf: 'beber',    en: 'to drink' },
  { inf: 'vender',   en: 'to sell' },
  { inf: 'vivir',    en: 'to live' },
  { inf: 'escribir', en: 'to write' },
  { inf: 'abrir',    en: 'to open' },
  { inf: 'escuchar', en: 'to listen' },
  { inf: 'bailar',   en: 'to dance' },
  { inf: 'cantar',   en: 'to sing' },
  { inf: 'caminar',  en: 'to walk' },
  { inf: 'viajar',   en: 'to travel' },
  { inf: 'cenar',    en: 'to have dinner' },
  { inf: 'correr',   en: 'to run' },
  { inf: 'subir',    en: 'to go up' },
  { inf: 'recibir',  en: 'to receive' },
  { inf: 'decidir',  en: 'to decide' },
];

// Fully irregular verbs: explicit forms per tense (only tenses where they differ
// enough to be worth storing; regular-pattern tenses are generated).
const IRREGULAR_VERBS = [
  {
    inf: 'ser', en: 'to be (identity)',
    forms: {
      present:     ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
      preterite:   ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
      imperfect:   ['era', 'eras', 'era', 'éramos', 'erais', 'eran'],
      presentSubj: ['sea', 'seas', 'sea', 'seamos', 'seáis', 'sean'],
      imperfectSubj: ['fuera', 'fueras', 'fuera', 'fuéramos', 'fuerais', 'fueran'],
    },
  },
  {
    inf: 'estar', en: 'to be (state/place)',
    forms: {
      present:     ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
      preterite:   ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis', 'estuvieron'],
      presentSubj: ['esté', 'estés', 'esté', 'estemos', 'estéis', 'estén'],
      imperfectSubj: ['estuviera', 'estuvieras', 'estuviera', 'estuviéramos', 'estuvierais', 'estuvieran'],
    },
  },
  {
    inf: 'ir', en: 'to go',
    forms: {
      present:     ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
      preterite:   ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
      imperfect:   ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
      presentSubj: ['vaya', 'vayas', 'vaya', 'vayamos', 'vayáis', 'vayan'],
      imperfectSubj: ['fuera', 'fueras', 'fuera', 'fuéramos', 'fuerais', 'fueran'],
    },
  },
  {
    inf: 'tener', en: 'to have',
    stem: 'tendr',
    forms: {
      present:     ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
      preterite:   ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron'],
      presentSubj: ['tenga', 'tengas', 'tenga', 'tengamos', 'tengáis', 'tengan'],
      imperfectSubj: ['tuviera', 'tuvieras', 'tuviera', 'tuviéramos', 'tuvierais', 'tuvieran'],
    },
  },
  {
    inf: 'hacer', en: 'to do/make',
    stem: 'har',
    forms: {
      present:     ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'],
      preterite:   ['hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron'],
      presentSubj: ['haga', 'hagas', 'haga', 'hagamos', 'hagáis', 'hagan'],
      imperfectSubj: ['hiciera', 'hicieras', 'hiciera', 'hiciéramos', 'hicierais', 'hicieran'],
    },
  },
  {
    inf: 'poder', en: 'to be able to',
    stem: 'podr',
    forms: {
      present:     ['puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden'],
      preterite:   ['pude', 'pudiste', 'pudo', 'pudimos', 'pudisteis', 'pudieron'],
      presentSubj: ['pueda', 'puedas', 'pueda', 'podamos', 'podáis', 'puedan'],
      imperfectSubj: ['pudiera', 'pudieras', 'pudiera', 'pudiéramos', 'pudierais', 'pudieran'],
    },
  },
  {
    inf: 'querer', en: 'to want',
    stem: 'querr',
    forms: {
      present:     ['quiero', 'quieres', 'quiere', 'queremos', 'queréis', 'quieren'],
      preterite:   ['quise', 'quisiste', 'quiso', 'quisimos', 'quisisteis', 'quisieron'],
      presentSubj: ['quiera', 'quieras', 'quiera', 'queramos', 'queráis', 'quieran'],
      imperfectSubj: ['quisiera', 'quisieras', 'quisiera', 'quisiéramos', 'quisierais', 'quisieran'],
    },
  },
  {
    inf: 'venir', en: 'to come',
    stem: 'vendr',
    forms: {
      present:     ['vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen'],
      preterite:   ['vine', 'viniste', 'vino', 'vinimos', 'vinisteis', 'vinieron'],
      presentSubj: ['venga', 'vengas', 'venga', 'vengamos', 'vengáis', 'vengan'],
      imperfectSubj: ['viniera', 'vinieras', 'viniera', 'viniéramos', 'vinierais', 'vinieran'],
    },
  },
  {
    inf: 'decir', en: 'to say',
    stem: 'dir',
    forms: {
      present:     ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'],
      preterite:   ['dije', 'dijiste', 'dijo', 'dijimos', 'dijisteis', 'dijeron'],
      presentSubj: ['diga', 'digas', 'diga', 'digamos', 'digáis', 'digan'],
      imperfectSubj: ['dijera', 'dijeras', 'dijera', 'dijéramos', 'dijerais', 'dijeran'],
    },
  },
  {
    inf: 'saber', en: 'to know',
    stem: 'sabr',
    forms: {
      present:     ['sé', 'sabes', 'sabe', 'sabemos', 'sabéis', 'saben'],
      preterite:   ['supe', 'supiste', 'supo', 'supimos', 'supisteis', 'supieron'],
      presentSubj: ['sepa', 'sepas', 'sepa', 'sepamos', 'sepáis', 'sepan'],
      imperfectSubj: ['supiera', 'supieras', 'supiera', 'supiéramos', 'supierais', 'supieran'],
    },
  },
  {
    inf: 'poner', en: 'to put',
    stem: 'pondr',
    forms: {
      present:     ['pongo', 'pones', 'pone', 'ponemos', 'ponéis', 'ponen'],
      preterite:   ['puse', 'pusiste', 'puso', 'pusimos', 'pusisteis', 'pusieron'],
      presentSubj: ['ponga', 'pongas', 'ponga', 'pongamos', 'pongáis', 'pongan'],
      imperfectSubj: ['pusiera', 'pusieras', 'pusiera', 'pusiéramos', 'pusierais', 'pusieran'],
    },
  },
  {
    inf: 'salir', en: 'to go out',
    stem: 'saldr',
    forms: {
      present:     ['salgo', 'sales', 'sale', 'salimos', 'salís', 'salen'],
      presentSubj: ['salga', 'salgas', 'salga', 'salgamos', 'salgáis', 'salgan'],
    },
  },
];

/* ============================================================
   Generator data — powers the unlimited pronoun & gender
   question generators (see app.js). Quizzes mix these with the
   hand-written bank so no session feels like a rerun.
   ============================================================ */

// Regular -o adjectives; forms are derived (o/a/os/as)
const GEN_ADJECTIVES = [
  { base: 'negr',     en: 'black' },
  { base: 'blanc',    en: 'white' },
  { base: 'roj',      en: 'red' },
  { base: 'pequeñ',   en: 'small' },
  { base: 'bonit',    en: 'pretty' },
  { base: 'car',      en: 'expensive' },
  { base: 'barat',    en: 'cheap' },
  { base: 'limpi',    en: 'clean' },
  { base: 'suci',     en: 'dirty' },
  { base: 'viej',     en: 'old' },
  { base: 'nuev',     en: 'new' },
  { base: 'alt',      en: 'tall' },
  { base: 'modern',   en: 'modern' },
  { base: 'cómod',    en: 'comfortable' },
  { base: 'antigu',   en: 'antique' },
  { base: 'famos',    en: 'famous' },
  { base: 'tranquil', en: 'quiet' },
];

// Noun banks per level. g = real gender; ela = feminine noun that takes
// el/un in the singular (stressed a-/ha-); why = rule for the explanation.
const GEN_NOUNS = {
  a1: [
    { w: 'libro', g: 'm', en: 'book' },       { w: 'mesa', g: 'f', en: 'table' },
    { w: 'gato', g: 'm', en: 'cat' },         { w: 'casa', g: 'f', en: 'house' },
    { w: 'perro', g: 'm', en: 'dog' },        { w: 'silla', g: 'f', en: 'chair' },
    { w: 'cuaderno', g: 'm', en: 'notebook' },{ w: 'ventana', g: 'f', en: 'window' },
    { w: 'zapato', g: 'm', en: 'shoe' },      { w: 'puerta', g: 'f', en: 'door' },
    { w: 'plato', g: 'm', en: 'plate' },      { w: 'camisa', g: 'f', en: 'shirt' },
    { w: 'vaso', g: 'm', en: 'glass' },       { w: 'mochila', g: 'f', en: 'backpack' },
    { w: 'bolso', g: 'm', en: 'handbag' },    { w: 'cocina', g: 'f', en: 'kitchen' },
    { w: 'abrigo', g: 'm', en: 'coat' },      { w: 'falda', g: 'f', en: 'skirt' },
  ],
  a2: [
    { w: 'problema', g: 'm', en: 'problem', why: 'Greek -ma words are masculine' },
    { w: 'programa', g: 'm', en: 'program', why: 'Greek -ma words are masculine' },
    { w: 'idioma', g: 'm', en: 'language', why: 'Greek -ma words are masculine' },
    { w: 'sistema', g: 'm', en: 'system', why: 'Greek -ma words are masculine' },
    { w: 'clima', g: 'm', en: 'climate', why: 'Greek -ma words are masculine' },
    { w: 'tema', g: 'm', en: 'topic', why: 'Greek -ma words are masculine' },
    { w: 'drama', g: 'm', en: 'drama', why: 'Greek -ma words are masculine' },
    { w: 'poema', g: 'm', en: 'poem', why: 'Greek -ma words are masculine' },
    { w: 'día', g: 'm', en: 'day', why: 'día is masculine despite -a' },
    { w: 'mapa', g: 'm', en: 'map', why: 'mapa is masculine despite -a' },
    { w: 'planeta', g: 'm', en: 'planet', why: 'planeta is masculine despite -a' },
    { w: 'sofá', g: 'm', en: 'sofa', why: 'sofá is masculine despite -á' },
    { w: 'mano', g: 'f', en: 'hand', why: 'mano is feminine despite -o' },
    { w: 'foto', g: 'f', en: 'photo', why: 'foto = la fotografía, feminine' },
    { w: 'moto', g: 'f', en: 'motorbike', why: 'moto = la motocicleta, feminine' },
    { w: 'radio', g: 'f', en: 'radio', why: 'radio (broadcasting) is feminine' },
  ],
  b1: [
    { w: 'canción', g: 'f', en: 'song', why: '-ción words are feminine' },
    { w: 'estación', g: 'f', en: 'station/season', why: '-ción words are feminine' },
    { w: 'televisión', g: 'f', en: 'television', why: '-sión words are feminine' },
    { w: 'decisión', g: 'f', en: 'decision', why: '-sión words are feminine' },
    { w: 'ciudad', g: 'f', en: 'city', why: '-dad words are feminine' },
    { w: 'universidad', g: 'f', en: 'university', why: '-dad words are feminine' },
    { w: 'libertad', g: 'f', en: 'liberty', why: '-tad words are feminine' },
    { w: 'amistad', g: 'f', en: 'friendship', why: '-tad words are feminine' },
    { w: 'costumbre', g: 'f', en: 'custom', why: '-umbre words are feminine' },
    { w: 'muchedumbre', g: 'f', en: 'crowd', why: '-umbre words are feminine' },
    { w: 'belleza', g: 'f', en: 'beauty', why: '-eza abstract nouns are feminine' },
    { w: 'tristeza', g: 'f', en: 'sadness', why: '-eza abstract nouns are feminine' },
    { w: 'vejez', g: 'f', en: 'old age', why: '-ez abstract nouns are feminine' },
    { w: 'color', g: 'm', en: 'color', why: '-or words are usually masculine' },
    { w: 'amor', g: 'm', en: 'love', why: '-or words are usually masculine' },
    { w: 'calor', g: 'm', en: 'heat', why: '-or words are usually masculine' },
    { w: 'viaje', g: 'm', en: 'trip', why: '-aje words are masculine' },
    { w: 'paisaje', g: 'm', en: 'landscape', why: '-aje words are masculine' },
    { w: 'garaje', g: 'm', en: 'garage', why: '-aje words are masculine' },
    { w: 'equipaje', g: 'm', en: 'luggage', why: '-aje words are masculine' },
    { w: 'corazón', g: 'm', en: 'heart', why: '-ón (not -ción/-sión) is usually masculine' },
    { w: 'mensaje', g: 'm', en: 'message', why: '-aje words are masculine' },
  ],
  b2: [
    { w: 'agua', g: 'f', ela: true, en: 'water' },
    { w: 'águila', g: 'f', ela: true, en: 'eagle' },
    { w: 'alma', g: 'f', ela: true, en: 'soul' },
    { w: 'aula', g: 'f', ela: true, en: 'classroom' },
    { w: 'hacha', g: 'f', ela: true, en: 'axe' },
    { w: 'arma', g: 'f', ela: true, en: 'weapon' },
    { w: 'área', g: 'f', ela: true, en: 'area' },
    { w: 'ala', g: 'f', ela: true, en: 'wing' },
    { w: 'ancla', g: 'f', ela: true, en: 'anchor' },
    { w: 'arpa', g: 'f', ela: true, en: 'harp' },
    { w: 'arena', g: 'f', en: 'sand', why: 'unstressed a- keeps la' },
    { w: 'amiga', g: 'f', en: 'female friend', why: 'unstressed a- keeps la' },
    { w: 'abuela', g: 'f', en: 'grandmother', why: 'unstressed a- keeps la' },
    { w: 'avenida', g: 'f', en: 'avenue', why: 'unstressed a- keeps la' },
    { w: 'aventura', g: 'f', en: 'adventure', why: 'unstressed a- keeps la' },
  ],
};

// Meaning-changing gender pairs for C1: m/f = meaning with that article
const GEN_PAIRS = [
  { w: 'capital',   m: 'sum of money',            f: 'capital city' },
  { w: 'cura',      m: 'priest',                  f: 'cure' },
  { w: 'frente',    m: 'front (war, weather)',    f: 'forehead' },
  { w: 'orden',     m: 'order, sequence',         f: 'order, command' },
  { w: 'cometa',    m: 'comet',                   f: 'kite' },
  { w: 'papa',      m: 'pope',                    f: 'potato (Lat. Am.)' },
  { w: 'corte',     m: 'cut',                     f: 'court' },
  { w: 'pendiente', m: 'earring (Spain)',         f: 'slope' },
  { w: 'guía',      m: 'guide (male person)',     f: 'guidebook' },
  { w: 'mañana',    m: 'future, tomorrow (noun)', f: 'morning' },
  { w: 'coma',      m: 'coma (medical)',          f: 'comma' },
  { w: 'radio',     m: 'radius',                  f: 'radio (broadcasting)' },
  { w: 'editorial', m: 'opinion piece',           f: 'publishing house' },
  { w: 'parte',     m: 'report, bulletin',        f: 'part, portion' },
  { w: 'margen',    m: 'margin (page, profit)',   f: 'riverbank' },
  { w: 'cólera',    m: 'cholera',                 f: 'rage, anger' },
];

// Names for subject-pronoun questions (A1)
const GEN_NAMES = {
  m: ['Juan', 'Pedro', 'Carlos', 'Miguel', 'Diego', 'Pablo', 'Andrés', 'Luis'],
  f: ['María', 'Ana', 'Lucía', 'Carmen', 'Sofía', 'Elena', 'Marta', 'Isabel'],
};

// Regular -ar reflexive verbs (A2)
const GEN_REFLEXIVES = [
  { inf: 'levantar', en: 'to get up' },
  { inf: 'duchar',   en: 'to shower' },
  { inf: 'lavar',    en: 'to wash up' },
  { inf: 'peinar',   en: 'to comb one’s hair' },
  { inf: 'afeitar',  en: 'to shave' },
  { inf: 'bañar',    en: 'to bathe' },
  { inf: 'maquillar', en: 'to put on makeup' },
  { inf: 'relajar',  en: 'to relax' },
];
const REFLEXIVE_PRONOUNS = ['me', 'te', 'se', 'nos', 'os', 'se'];

// Transitive verbs (yo-form) for direct-object replacement (A2)
const GEN_TRANSITIVES = ['Veo', 'Compro', 'Tengo', 'Busco', 'Necesito', 'Quiero', 'Vendo'];

// gustar-type constructions (B1)
const GEN_GUSTAR = {
  persons: [
    { p: 'A mí', pr: 'me' }, { p: 'A ti', pr: 'te' }, { p: 'A él', pr: 'le' },
    { p: 'A ella', pr: 'le' }, { p: 'A usted', pr: 'le' }, { p: 'A nosotros', pr: 'nos' },
    { p: 'A vosotros', pr: 'os' }, { p: 'A ellos', pr: 'les' }, { p: 'A mis padres', pr: 'les' },
  ],
  verbs: [
    { sg: 'gusta', pl: 'gustan', inf: 'gustar' },
    { sg: 'encanta', pl: 'encantan', inf: 'encantar' },
    { sg: 'interesa', pl: 'interesan', inf: 'interesar' },
    { sg: 'molesta', pl: 'molestan', inf: 'molestar' },
    { sg: 'importa', pl: 'importan', inf: 'importar' },
  ],
  itemsSg: ['el café', 'la música', 'el cine', 'este libro', 'la playa', 'el ruido'],
  itemsPl: ['los tacos', 'las películas', 'los deportes', 'los idiomas', 'los lunes', 'las fiestas'],
};

// Double-object-pronoun generator (B1): give-verbs (yo, present) + recipients
const GEN_GIVE_VERBS = ['doy', 'presto', 'mando', 'regalo', 'muestro', 'vendo', 'enseño'];
const GEN_RECIPIENTS = ['María', 'Juan', 'mi hermano', 'mi hermana', 'los niños', 'mis padres', 'la profesora'];

// Accidental-se generator (B2/C1)
const GEN_ACCIDENTAL = {
  verbs: [
    { inf: 'olvidar', sg: 'olvidó', pl: 'olvidaron' },
    { inf: 'perder',  sg: 'perdió', pl: 'perdieron' },
    { inf: 'romper',  sg: 'rompió', pl: 'rompieron' },
    { inf: 'caer',    sg: 'cayó',   pl: 'cayeron' },
    { inf: 'quedar en casa', sg: 'quedó en casa', pl: 'quedaron en casa' },
    { inf: 'acabar',  sg: 'acabó',  pl: 'acabaron' },
  ],
  itemsSg: ['el pasaporte', 'el móvil', 'la cartera', 'el paraguas', 'la contraseña'],
  itemsPl: ['las llaves', 'las gafas', 'los papeles', 'las entradas', 'los documentos'],
  datives: [
    { p: 'a mí', pr: 'me' }, { p: 'a ti', pr: 'te' }, { p: 'a él', pr: 'le' },
    { p: 'a nosotros', pr: 'nos' }, { p: 'a vosotros', pr: 'os' }, { p: 'a ellos', pr: 'les' },
  ],
};

// cuyo-agreement generator (B2)
const GEN_CUYO = {
  owners: ['el autor', 'la escritora', 'el profesor', 'la doctora', 'el arquitecto', 'la directora'],
  possessions: [
    { w: 'libro', form: 'cuyo' },  { w: 'novela', form: 'cuya' },
    { w: 'poemas', form: 'cuyos' }, { w: 'obras', form: 'cuyas' },
    { w: 'hijo', form: 'cuyo' },   { w: 'hija', form: 'cuya' },
    { w: 'proyectos', form: 'cuyos' }, { w: 'ideas', form: 'cuyas' },
  ],
};

// Passive-se number agreement generator (B2)
const GEN_SE_PASSIVE = {
  verbs: [
    { inf: 'vender',    sg: 'vende',    pl: 'venden' },
    { inf: 'alquilar',  sg: 'alquila',  pl: 'alquilan' },
    { inf: 'reparar',   sg: 'repara',   pl: 'reparan' },
    { inf: 'buscar',    sg: 'busca',    pl: 'buscan' },
    { inf: 'necesitar', sg: 'necesita', pl: 'necesitan' },
  ],
  itemsSg: ['fruta', 'pan', 'café', 'ropa usada', 'oro'],
  itemsPl: ['casas', 'coches', 'pisos', 'bicicletas', 'camareros', 'ordenadores'],
};
