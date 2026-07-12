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
];

/* ============================================================
   Tense Toolkit — visual references, mnemonics, rules of thumb
   ============================================================ */

const TOOLKIT_HTML = `
<section class="tk-section card">
  <h3>🗺️ The tense timeline</h3>
  <p>Every tense is a way of placing an action relative to <b>now</b>.
  A dot is a completed event; a wave is something ongoing or background.</p>
  <div class="tl">
    <div class="tl-row"><span class="tl-name">pretérito <span class="lvl-tag">A2</span></span>
      <span class="tl-track"><span class="tl-now"></span><span class="tl-dot" style="left:30%"></span></span>
      <span class="tl-ex">comí — a snapshot: it happened, it's done</span></div>
    <div class="tl-row"><span class="tl-name">imperfecto <span class="lvl-tag">A2</span></span>
      <span class="tl-track"><span class="tl-now"></span><span class="tl-wave" style="left:15%;width:30%"></span></span>
      <span class="tl-ex">comía — a video rolling in the background</span></div>
    <div class="tl-row"><span class="tl-name">pluscuamperfecto <span class="lvl-tag">C1</span></span>
      <span class="tl-track"><span class="tl-now"></span><span class="tl-dot" style="left:12%"></span><span class="tl-dot faded" style="left:35%"></span></span>
      <span class="tl-ex">había comido — done <i>before</i> another past moment</span></div>
    <div class="tl-row"><span class="tl-name">perfecto <span class="lvl-tag">C1</span></span>
      <span class="tl-track"><span class="tl-now"></span><span class="tl-span" style="left:35%;width:25%"></span></span>
      <span class="tl-ex">he comido — past that still touches now</span></div>
    <div class="tl-row"><span class="tl-name">presente <span class="lvl-tag">A1</span></span>
      <span class="tl-track"><span class="tl-now"></span><span class="tl-dot on-now"></span></span>
      <span class="tl-ex">como — happening now / in general</span></div>
    <div class="tl-row"><span class="tl-name">futuro <span class="lvl-tag">B1</span></span>
      <span class="tl-track"><span class="tl-now"></span><span class="tl-dot" style="left:80%"></span></span>
      <span class="tl-ex">comeré — will happen</span></div>
    <div class="tl-row"><span class="tl-name">futuro perfecto <span class="lvl-tag">C1</span></span>
      <span class="tl-track"><span class="tl-now"></span><span class="tl-dot" style="left:72%"></span><span class="tl-dot faded" style="left:90%"></span></span>
      <span class="tl-ex">habré comido — done <i>before</i> a future moment</span></div>
    <div class="tl-row"><span class="tl-name">condicional <span class="lvl-tag">B1</span></span>
      <span class="tl-track"><span class="tl-now"></span><span class="tl-dot ghost" style="left:70%"></span></span>
      <span class="tl-ex">comería — would happen (hypothetical, polite)</span></div>
    <div class="tl-row"><span class="tl-name">subjuntivo <span class="lvl-tag">B2</span></span>
      <span class="tl-track tl-mood">not a time — an attitude</span>
      <span class="tl-ex">coma — wished, doubted, or demanded, not stated as fact</span></div>
  </div>
</section>

<section class="tk-section card">
  <h3>📸 Photo vs. 🎥 video <span class="lvl-tag">A2+</span></h3>
  <p>The single most useful metaphor for the two past tenses:</p>
  <ul>
    <li><b>Pretérito = a photo.</b> A camera flash freezes one finished moment:
      <i>Ayer <b>llovió</b></i> — it rained, event over, next scene.</li>
    <li><b>Imperfecto = a video.</b> The camera was already rolling and nobody
      pressed stop: <i><b>Llovía</b> cuando salí</i> — the rain is scenery,
      not the event.</li>
  </ul>
  <p>Storytelling rule: the <b>preterite moves the plot forward</b>; the
  <b>imperfect paints the set</b> — descriptions, weather, time, age, feelings,
  and things that “used to” happen.</p>
</section>

<section class="tk-section card">
  <h3>🚦 Trigger words <span class="lvl-tag">A2+</span></h3>
  <p>Time markers strongly predict the tense. Learn to spot them before you conjugate:</p>
  <table>
    <tr><th>If you see…</th><th>Reach for…</th></tr>
    <tr><td>ayer, anoche, el año pasado, una vez, de repente, entonces</td><td><b>pretérito</b></td></tr>
    <tr><td>siempre, todos los días, mientras, de niño/a, cada verano, antes, a menudo</td><td><b>imperfecto</b></td></tr>
    <tr><td>mañana, la próxima semana, el año que viene, dentro de…</td><td><b>futuro</b></td></tr>
    <tr><td>ya, todavía no, alguna vez, este mes (Spain)</td><td><b>perfecto</b> (he comido)</td></tr>
    <tr><td>quiero que, es posible que, no creo que, ojalá, para que, cuando (+ future idea)</td><td><b>subjuntivo</b></td></tr>
  </table>
  <p class="tk-warn">⚠️ Trigger words are training wheels: real Spanish often gives no
  marker, and then the <b>verb ending is the only clue</b>. That's what Tense
  Detective trains.</p>
</section>

<section class="tk-section card">
  <h3>🧠 Mnemonics that stick</h3>
  <p><b>SIMBA</b> — when the <b>pretérito</b> pounces <span class="lvl-tag">A2+</span>:</p>
  <ul class="tk-acro">
    <li><b>S</b>ingle completed action — <i>Compré pan.</i></li>
    <li><b>I</b>nterruption — <i>…cuando <b>sonó</b> el teléfono.</i></li>
    <li><b>M</b>ain event of the story — <i>Por fin <b>llegó</b>.</i></li>
    <li><b>B</b>eginning or end of an action — <i><b>Empezó</b> a llover.</i></li>
    <li><b>A</b>rrivals & departures — <i><b>Salí</b> a las ocho.</i></li>
  </ul>
  <p><b>CHEATED</b> — the <b>imperfecto</b> plays the long game <span class="lvl-tag">A2+</span>:</p>
  <ul class="tk-acro">
    <li><b>C</b>haracteristics & descriptions — <i>La casa <b>era</b> vieja.</i></li>
    <li><b>H</b>ealth — <i><b>Estaba</b> enfermo.</i></li>
    <li><b>E</b>motion — <i><b>Tenía</b> miedo.</i></li>
    <li><b>A</b>ge — <i><b>Tenía</b> diez años.</i></li>
    <li><b>T</b>ime & weather — <i><b>Eran</b> las tres. <b>Llovía</b>.</i></li>
    <li><b>E</b>ndless (habitual) activities — <i><b>Jugaba</b> cada día.</i></li>
    <li><b>D</b>escription of a scene — <i>Todo <b>estaba</b> tranquilo.</i></li>
  </ul>
  <p><b>The Three Amigos</b> <span class="lvl-tag">A2</span> — only <b>three</b> verbs are
  irregular in the whole imperfect: <b>ser</b> (era), <b>ir</b> (iba), <b>ver</b> (veía).
  Everything else is regular. Relax.</p>
  <p><b>DOCTOR / PLACE</b> <span class="lvl-tag">A1</span> — ser vs. estar:</p>
  <ul class="tk-acro">
    <li><b>SER = DOCTOR</b>: Description, Occupation, Characteristic, Time, Origin, Relationship</li>
    <li><b>ESTAR = PLACE</b>: Position, Location, Action (estar + -ndo), Condition, Emotion</li>
  </ul>
  <p><b>WEIRDO</b> <span class="lvl-tag">B2</span> — subjunctive triggers: Wishes, Emotions,
  Impersonal expressions, Recommendations, Doubt/denial, Ojalá.</p>
</section>

<section class="tk-section card">
  <h3>⚙️ Pattern hacks <span class="lvl-tag">B1+</span></h3>
  <p><b>The 12 irregular futures</b> come in three families (conditional uses the same stems):</p>
  <ul>
    <li><b>Drop the e</b>: haber→habr-, poder→podr-, querer→querr-, saber→sabr-, caber→cabr-</li>
    <li><b>Swap in a d</b>: poner→pondr-, salir→saldr-, tener→tendr-, venir→vendr-, valer→valdr-</li>
    <li><b>The shorties</b>: decir→dir-, hacer→har-</li>
  </ul>
  <p><b>Car-Gar-Zar</b> <span class="lvl-tag">A2</span> — preterite <i>yo</i> spelling guards:
  bus<b>car</b>→bus<b>qué</b>, lle<b>gar</b>→lle<b>gué</b>, empe<b>zar</b>→empe<b>cé</b>.
  The sound never changes — only the spelling protects it.</p>
  <p><b>i→y rescue</b> <span class="lvl-tag">A2</span> — vowel-stem -er/-ir verbs in 3rd person
  preterite: leer→le<b>y</b>ó, oír→o<b>y</b>eron, construir→constru<b>y</b>ó.</p>
  <p><b>“Would” fork</b> <span class="lvl-tag">B1</span> — English “would” splits two ways:
  <i>would = used to</i> → <b>imperfecto</b> (<i>íbamos cada verano</i>);
  <i>would = hypothetical</i> → <b>condicional</b> (<i>iría si pudiera</i>).</p>
</section>

<section class="tk-section card">
  <h3>📌 Rules of thumb</h3>
  <ul>
    <li>Can you swap in <b>“used to”</b> or <b>“was …-ing”</b>? → imperfecto.</li>
    <li><b>Time, age, weather</b> in the past? → imperfecto, almost always.</li>
    <li>A <b>chain of events</b> (“then… then… then…”)? → pretérito for every link.</li>
    <li><b>Ojalá</b> and <b>para que</b>? → subjunctive, no exceptions.</li>
    <li><b>Cuando</b> about the future? → subjunctive (<i>cuando llegue</i>);
        cuando about habit/past fact? → indicative (<i>cuando llegaba</i>).</li>
    <li>Guessing/probability about <b>now</b>? → future (<i>Serán las diez</i> —
        “it must be around ten”). About the <b>past</b>? → conditional (<i>Serían las diez</i>).</li>
    <li>Say new forms <b>out loud</b> — rhythm and stress (habló vs. hablo) carry meaning.</li>
  </ul>
</section>`;

/* ============================================================
   Tense Detective — interpretation exercises (processing
   instruction): decode meaning from the verb form itself
   ============================================================ */

const DETECTIVE = {
  a1: [
    { t: 'mc', q: '«Comemos a las dos.» Who is eating?', c: ['yo', 'tú', 'nosotros', 'ellos'], a: 2,
      exp: 'The -emos ending can only be nosotros — no pronoun needed.' },
    { t: 'mc', q: '«¿Trabajas hoy?» Who is this question about?', c: ['me', 'you (informal)', 'him', 'them'], a: 1,
      exp: 'The -as ending marks tú: “Are you working today?”' },
    { t: 'mc', q: '«Viven en Lima.» Who lives in Lima?', c: ['I do', 'you do', 'she does', 'they do'], a: 3,
      exp: '-en on an -ir verb marks ellos/ustedes: “they live”.' },
    { t: 'mc', q: '«Hablo poco.» Who speaks little?', c: ['I do', 'you do', 'he does', 'we do'], a: 0,
      exp: 'The -o ending is always yo in the present.' },
    { t: 'mc', q: '«Pedro es aburrido» vs. «Pedro está aburrido» —', c: ['both mean he is bored', 'both mean he is boring', 'es = boring (trait), está = bored (state)', 'es = bored, está = boring'], a: 2,
      exp: 'ser = permanent trait (DOCTOR); estar = current condition (PLACE).' },
    { t: 'mc', q: '«La sopa está fría.» Why estar?', c: ['soups are feminine', 'it describes its current condition', 'it is an opinion', 'fría requires it'], a: 1,
      exp: 'estar for conditions that can change — the soup could be reheated (PLACE: Condition).' },
    { t: 'mc', q: '«Somos de Chile.» Why ser?', c: ['location', 'origin', 'emotion', 'action in progress'], a: 1,
      exp: 'Origin is the O in DOCTOR: ser + de + place.' },
    { t: 'mc', q: '«Estamos en casa.» Why estar?', c: ['location', 'occupation', 'time', 'relationship'], a: 0,
      exp: 'Location is the L in PLACE: estar tells you where.' },
  ],
  a2: [
    { t: 'mc', q: 'You spot «anoche» in a sentence about the past. Which tense is it calling for?', c: ['imperfecto', 'pretérito', 'presente', 'either, equally'], a: 1,
      exp: '“Last night” frames a single completed occasion → pretérito.' },
    { t: 'mc', q: '«Todos los días» (talking about childhood) points to…', c: ['pretérito', 'imperfecto', 'futuro', 'presente'], a: 1,
      exp: 'Habitual repetition → imperfecto (CHEATED: Endless activities).' },
    { t: 'mc', q: '«Llovía.» What does the speaker present?', c: ['rain as a finished event', 'rain as background scenery', 'a forecast', 'a command'], a: 1,
      exp: 'Imperfect = the video camera rolling: rain in progress, no endpoints.' },
    { t: 'mc', q: '«Llovió.» And now?', c: ['rain as a finished event', 'rain as background', 'rain happening now', 'a wish for rain'], a: 0,
      exp: 'Preterite = the photo: it rained, complete, done.' },
    { t: 'mc', q: '«De niño jugaba en la calle.» Which CHEATED letter justifies the imperfect?', c: ['Health', 'Age', 'Endless (habitual) activities', 'Time'], a: 2,
      exp: 'A repeated childhood habit → Endless activities.' },
    { t: 'mc', q: '«Ayer fui al mercado.» Why preterite?', c: ['description of a scene', 'a single completed action', 'an emotion', 'the weather'], a: 1,
      exp: 'SIMBA: Single completed action — one trip, over and done.' },
    { t: 'mc', q: '«Mientras cocinaba, sonó el teléfono.» Which action interrupted the other?', c: ['cocinaba interrupted sonó', 'sonó interrupted cocinaba', 'they happened one after another', 'neither happened'], a: 1,
      exp: 'The imperfect (cocinaba) was rolling; the preterite (sonó) burst in. SIMBA: Interruption.' },
    { t: 'mc', q: 'No time markers, just: «Estudiaba medicina.» Most likely meaning?', c: ['she studied it once', 'she was studying it / used to study it', 'she will study it', 'she just finished it'], a: 1,
      exp: 'With no marker, the -aba ending alone signals ongoing/habitual past.' },
  ],
  b1: [
    { t: 'mc', q: '«El año que viene» sets you up for…', c: ['pretérito', 'imperfecto', 'futuro', 'perfecto'], a: 2,
      exp: '“Next year” → future: el año que viene viajaré.' },
    { t: 'mc', q: '«Serían las diez cuando llegó.» The conditional here expresses…', c: ['a wish', 'probability about the past', 'a polite request', 'a future plan'], a: 1,
      exp: 'Conditional of conjecture: “it must have been around ten.”' },
    { t: 'mc', q: '«Me gustaría hablar con usted.» The conditional makes this…', c: ['a demand', 'a polite wish', 'a past habit', 'a certainty'], a: 1,
      exp: 'Conditional softens requests: “I would like to…”.' },
    { t: 'mc', q: '«Iba a llamarte.» What happened to the call?', c: ['it already happened', 'it was planned, but something got in the way', 'it will definitely happen', 'the speaker refuses to call'], a: 1,
      exp: '“iba a + infinitive” = was going to — a plan usually left unrealized.' },
    { t: 'mc', q: '«De repente» inside a past story announces…', c: ['background description', 'a preterite plot twist', 'a habit', 'the imperfecto'], a: 1,
      exp: '“Suddenly” = an interrupting event → pretérito.' },
    { t: 'mc', q: '«En aquella época» leans toward…', c: ['pretérito', 'imperfecto', 'futuro', 'condicional'], a: 1,
      exp: '“Back in those days” frames ongoing circumstances → imperfecto.' },
    { t: 'mc', q: '«Habrá unas veinte personas.» The future tense here means…', c: ['there will be 20 later', 'there are probably about 20 right now', 'there were 20', 'an order to invite 20'], a: 1,
      exp: 'Future of probability: a guess about the present.' },
    { t: 'mc', q: '«Cuando era estudiante, salía cada noche.» The two imperfects paint…', c: ['two single events', 'a chain of plot points', 'a habitual life period', 'the future'], a: 2,
      exp: 'Both verbs describe how life used to be — pure background, no plot.' },
  ],
  b2: [
    { t: 'mc', q: '«Quiero que…» — what must come next?', c: ['indicative', 'subjunctive', 'infinitive always', 'preterite'], a: 1,
      exp: 'Wishes imposed on someone else (WEIRDO: W) → subjunctive: quiero que vengas.' },
    { t: 'mc', q: '«Creo que…» — and here?', c: ['subjunctive', 'indicative', 'imperative', 'conditional only'], a: 1,
      exp: 'Affirmative belief = asserted as fact → indicative. (No creo que → subjunctive!)' },
    { t: 'mc', q: '«No creo que…» flips to…', c: ['indicative', 'subjunctive', 'future', 'preterite'], a: 1,
      exp: 'Doubt/denial (WEIRDO: D) → subjunctive: no creo que sea verdad.' },
    { t: 'mc', q: '«Es obvio que…» takes…', c: ['subjunctive — impersonal expression', 'indicative — it asserts certainty', 'either', 'imperative'], a: 1,
      exp: 'Impersonal expressions of certainty (es obvio/cierto/verdad que) keep the indicative.' },
    { t: 'mc', q: '«Es posible que…» takes…', c: ['indicative', 'subjunctive', 'future only', 'preterite'], a: 1,
      exp: 'Possibility is not asserted fact → subjunctive: es posible que llueva.' },
    { t: 'mc', q: '«Cuando llegue» vs. «cuando llega» — llegue means…', c: ['a habit', 'a future, not-yet-real arrival', 'a past arrival', 'a mistake'], a: 1,
      exp: 'cuando + subjunctive = pending future event; cuando + indicative = habit or known fact.' },
    { t: 'mc', q: '«Aunque está lloviendo, salgo.» The indicative está tells you…', c: ['the speaker doubts the rain', 'the rain is a known fact', 'the rain is hypothetical', 'nothing'], a: 1,
      exp: 'aunque + indicative = “even though (it IS raining)”; + subjunctive = “even if (it may rain)”.' },
    { t: 'mc', q: '«Ojalá» is followed by the subjunctive…', c: ['sometimes', 'only in questions', 'always', 'never'], a: 2,
      exp: 'ojalá (from Arabic “God willing”) always takes the subjunctive.' },
  ],
  c1: [
    { t: 'mc', q: '«Cuando llegué, ya se habían ido.» Which happened first?', c: ['my arrival', 'their leaving', 'simultaneous', 'cannot tell'], a: 1,
      exp: 'Pluperfect (habían ido) marks the action completed before the other past action.' },
    { t: 'mc', q: '«Habré terminado para el viernes.» The report will be done…', c: ['on Friday exactly', 'at some point before Friday', 'after Friday', 'it was done last Friday'], a: 1,
      exp: 'Future perfect = completed before a future deadline.' },
    { t: 'mc', q: '«Habría ido, pero tenía trabajo.» Did the person go?', c: ['yes', 'no', 'maybe', 'they will go'], a: 1,
      exp: 'Conditional perfect = unreal past: “I would have gone (but didn’t).”' },
    { t: 'mc', q: '«Si tuviera dinero…» — how much money does the speaker have?', c: ['plenty', 'not enough — this is a present unreality', 'they had money before', 'unknown, it is a real possibility'], a: 1,
      exp: 'si + imperfect subjunctive = contrary to present fact.' },
    { t: 'mc', q: '«Si hubiera sabido…» regrets something in…', c: ['the present', 'the future', 'the past', 'a habit'], a: 2,
      exp: 'si + pluperfect subjunctive = a past that cannot be changed.' },
    { t: 'mc', q: '«Llevaba tres años viviendo allí.» At that past moment, the living situation…', c: ['had just ended', 'had been going on for three years', 'would start in three years', 'lasted exactly three more years'], a: 1,
      exp: 'llevar + time + gerund = duration up to the reference point.' },
    { t: 'mc', q: '«Acababa de salir cuando llamaste.» When did they leave?', c: ['long before the call', 'moments before the call', 'during the call', 'after the call'], a: 1,
      exp: 'acabar de (imperfect) + infinitive = “had just…”.' },
    { t: 'mc', q: '«Estará durmiendo.» The speaker is…', c: ['ordering someone to sleep', 'guessing what is happening right now', 'narrating the past', 'making a promise'], a: 1,
      exp: 'Future + gerund = live conjecture: “he’s probably sleeping.”' },
  ],
};

/* ============================================================
   Story Mode — cloze narratives (tenses in real context)
   ============================================================ */

const CLOZE_STORIES = {
  a1: [{
    title: 'Un día normal',
    note: 'Fill in the present tense. Watch who does each action!',
    text: 'Me llamo Sofía y {1} en Sevilla. Todas las mañanas {2} café con leche y mi hermano {3} el desayuno. Nosotros {4} juntos a las dos de la tarde. Por la noche, mis padres {5} la televisión, pero yo {6} con mis amigos en el parque. Mi familia {7} muy simpática y nuestra casa {8} cerca del centro.',
    blanks: [
      { hint: 'vivir, yo', a: ['vivo'], exp: 'yo + -ir → vivo' },
      { hint: 'beber, yo', a: ['bebo'], exp: 'yo + -er → bebo' },
      { hint: 'preparar, él', a: ['prepara'], exp: 'él + -ar → prepara' },
      { hint: 'comer, nosotros', a: ['comemos'], exp: 'nosotros + -er → comemos' },
      { hint: 'ver, ellos', a: ['ven'], exp: 'ellos + ver → ven' },
      { hint: 'hablar, yo', a: ['hablo'], exp: 'yo + -ar → hablo' },
      { hint: 'ser', a: ['es'], exp: 'A lasting trait of the family → ser: es simpática' },
      { hint: 'estar', a: ['está'], exp: 'Location → estar: está cerca' },
    ],
  }],
  a2: [{
    title: 'El sábado pasado',
    note: 'A finished weekend story — mostly preterite, with imperfect for the scenery.',
    text: 'El sábado pasado {1} un día increíble. Por la mañana {2} al mercado y {3} fruta fresca. {4} sol y no {5} frío. Al mediodía, mi amiga Carmen me {6} por teléfono. Nosotras {7} en un café del centro y {8} durante horas.',
    blanks: [
      { hint: 'ser', a: ['fue'], exp: 'The day, viewed whole and finished → preterite: fue' },
      { hint: 'ir, yo', a: ['fui'], exp: 'One completed trip → fui (ir is irregular)' },
      { hint: 'comprar, yo', a: ['compré', 'compre'], exp: 'Single completed purchase → compré' },
      { hint: 'hacer — weather', a: ['hacía', 'hacia'], exp: 'Weather as background → imperfect: hacía sol' },
      { hint: 'hacer — weather', a: ['hacía', 'hacia'], exp: 'Still scenery → hacía frío (negated)' },
      { hint: 'llamar', a: ['llamó', 'llamo'], exp: 'One phone call, completed → llamó' },
      { hint: 'quedar, nosotras', a: ['quedamos'], exp: 'quedar = to meet up: quedamos en un café' },
      { hint: 'hablar, nosotras', a: ['hablamos'], exp: 'The talking, viewed as a completed block → hablamos' },
    ],
  }],
  b1: [{
    title: 'Una noche extraña',
    note: 'The classic narrative dance: imperfect sets the scene, preterite moves the plot.',
    text: '{1} medianoche y toda la casa {2} en silencio. Yo {3} tranquilamente cuando, de repente, {4} un ruido en la cocina. Me {5} despacio y {6} la puerta. ¡{7} solo el gato! Al día siguiente, decidí que {8} una cámara para la cocina.',
    blanks: [
      { hint: 'ser — time', a: ['era'], exp: 'Time in the past → imperfect: era medianoche (CHEATED: Time)' },
      { hint: 'estar', a: ['estaba'], exp: 'Scene description → imperfect: estaba en silencio' },
      { hint: 'dormir, yo', a: ['dormía', 'dormia'], exp: 'Action in progress, camera rolling → dormía' },
      { hint: 'oír, yo', a: ['oí', 'oi'], exp: 'The interruption! → preterite: oí (SIMBA: Interruption)' },
      { hint: 'levantar, yo (reflexive already given)', a: ['levanté', 'levante'], exp: 'Plot moves forward → me levanté' },
      { hint: 'abrir, yo', a: ['abrí', 'abri'], exp: 'Next plot point → abrí' },
      { hint: 'ser', a: ['Era', 'era'], exp: 'Description of what it turned out to be → era el gato' },
      { hint: 'comprar, yo — condicional', a: ['compraría', 'compraria'], exp: 'Future-in-the-past → conditional: decidí que compraría' },
    ],
  }],
  b2: [{
    title: 'Consejos para tu viaje',
    note: 'Advice is subjunctive territory — but watch for the facts that stay indicative.',
    text: 'Sé que {1} visitar Granada este verano. Te recomiendo que {2} la Alhambra por la mañana y que {3} entradas con antelación. Es importante que {4} zapatos cómodos. Cuando {5} a la ciudad, llámame y te doy más ideas. No creo que {6} más de tres días para verlo todo, pero ojalá {7} buen tiempo. ¡Espero que lo {8} genial!',
    blanks: [
      { hint: 'querer, tú', a: ['quieres'], exp: '“Sé que” asserts a fact → indicative: quieres' },
      { hint: 'visitar, tú', a: ['visites'], exp: 'Recommendation (WEIRDO: R) → subjunctive: visites' },
      { hint: 'comprar, tú', a: ['compres'], exp: 'Still under “te recomiendo que” → compres' },
      { hint: 'llevar, tú', a: ['lleves'], exp: 'Es importante que (Impersonal) → subjunctive: lleves' },
      { hint: 'llegar, tú', a: ['llegues'], exp: 'cuando + future idea → subjunctive: llegues (-gu- keeps the hard g)' },
      { hint: 'necesitar, tú', a: ['necesites'], exp: 'No creo que (Doubt) → subjunctive: necesites' },
      { hint: 'hacer — weather', a: ['haga'], exp: 'ojalá always → subjunctive: haga' },
      { hint: 'pasar, tú', a: ['pases'], exp: 'Esperar que (Emotion/wish) → subjunctive: pases' },
    ],
  }],
  c1: [{
    title: 'La entrevista',
    note: 'Layered past: pluperfect, conditional perfect, and the imperfect subjunctive.',
    text: 'Cuando llegué a la entrevista, ya {1} mi presentación tres veces. La directora me saludó como si me {2} de toda la vida. Me pidió que le {3} sobre mi experiencia. Si {4} más tiempo, le habría contado todos los detalles. Al salir, pensé: si no {5} tan nervioso, la reunión {6} mejor. Para el viernes ya me {7} — o eso esperaba. Dudaba que {8} otros candidatos con mi perfil.',
    blanks: [
      { hint: 'practicar, yo — pluscuamperfecto', a: ['había practicado', 'habia practicado'], exp: 'Done before arriving → pluperfect: había practicado' },
      { hint: 'conocer — imperfecto de subjuntivo', a: ['conociera'], exp: 'como si + imperfect subjunctive, always: conociera' },
      { hint: 'hablar — imperfecto de subjuntivo', a: ['hablara'], exp: 'Past request → sequence of tenses: pidió que hablara' },
      { hint: 'tener, yo — imperfecto de subjuntivo', a: ['hubiera tenido', 'tuviera'], exp: 'Unreal condition: si hubiera tenido (or tuviera) más tiempo' },
      { hint: 'estar, yo — imperfecto de subjuntivo', a: ['hubiera estado', 'estuviera'], exp: 'Unreal: si no hubiera estado / no estuviera tan nervioso' },
      { hint: 'salir — condicional perfecto', a: ['habría salido', 'habria salido'], exp: 'Unreal past result → conditional perfect: habría salido mejor' },
      { hint: 'responder, ellos — futuro perfecto', a: ['habrían respondido', 'habrian respondido'], exp: 'Conjecture about a future-in-the-past deadline → habrían respondido' },
      { hint: 'haber — imperfecto de subjuntivo', a: ['hubiera'], exp: 'Dudaba que + imperfect subjunctive: hubiera otros candidatos' },
    ],
  }],
};
