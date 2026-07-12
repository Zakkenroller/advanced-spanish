# ¡Adelante! — Spanish Grammar Trainer

A lightweight web app for practicing the three pillars of Spanish grammar:

- **Verb tenses** — present through compound tenses, subjunctive, and si-clauses
- **Pronouns** — subject, object, reflexive, relative, the many uses of *se*, and leísmo
- **Noun gender** — basic rules, exceptions, suffix patterns, *el agua*-type nouns, and
  meaning-changing gender pairs

## Meets you at your level

Content is organized into five CEFR levels, each labeled with its rough Duolingo
equivalent so you can jump in wherever you are:

| CEFR | Duolingo (approx.) | Focus |
|------|--------------------|-------|
| A1 | Sections 1–2 | Present tense, subject pronouns, el/la basics |
| A2 | Sections 2–3 | Preterite & imperfect, object/reflexive pronouns, gender exceptions |
| B1 | Sections 4–5 | Preterite vs. imperfect, future/conditional, *se lo*, suffix rules |
| B2 | Sections 6–7 | Subjunctive & commands, relative pronouns & *se*, *el agua* nouns |
| C1 | Section 8+ | Compound tenses, si-clauses, leísmo & neuter *lo*, gender pairs |

Not sure where you fit? Take the **15-question placement quiz** and the app will set
your level for you.

## Features

- **Lessons** — concise reference notes with conjugation and gender tables per level
- **Practice quizzes** — multiple choice and typed answers, with instant explanations
- **Accent-aware checking** — a near-miss on accents gets its own gentle feedback
  (plus on-screen accent buttons: á é í ó ú ñ ü)
- **Adaptive difficulty** — the app tracks your rolling accuracy per topic and
  suggests moving up (≥85%) or reviewing a level down (≤50%)
- **Progress that sticks** — XP, streaks, and per-topic stats are saved in your
  browser (localStorage); nothing leaves your machine

## The Tense Lab

The verb-tense side is built around findings from second-language-acquisition
research (form-focused salience, VanPatten's processing instruction, and
spaced/interleaved retrieval practice):

- **Tense Toolkit** — a visual timeline of every tense, the photo-vs-video metaphor
  for preterite/imperfect, trigger-word tables, and the classic mnemonics
  (SIMBA, CHEATED, DOCTOR/PLACE, WEIRDO, the Three Amigos, the 12 irregular
  futures, Car-Gar-Zar)
- **Tense Detective** — interpretation exercises: decode who, when, and whether
  it's finished from the verb form alone, the way processing-instruction research
  recommends
- **Story Mode** — cloze narratives per level, so tense choice is practiced in
  connected discourse (the imperfect paints the set, the preterite moves the plot)
- **Conjugation Drill** — unlimited generated questions across every tense unlocked
  at your level, mixing regular verbs with core irregulars (ser, estar, ir, tener,
  hacer, poder)
- **Tense Workout** — an interleaved set (detective + curated exercises + drills
  shuffled together), since mixed practice beats blocked practice for retention
- **Smart Review** — every question you miss enters a Leitner queue and resurfaces
  on a spaced schedule (10 min → 1 → 3 → 7 → 14 days, then it graduates)

## Running it

No build step, no dependencies. Either open `index.html` directly in a browser, or
serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

It also works out of the box on GitHub Pages: Settings → Pages → deploy from the
main branch.

## Project layout

```
index.html   app shell and views
styles.css   theme (light + dark) and layout
data.js      levels, lessons, 150 hand-written exercises, conjugation tables
app.js       quiz engine, drill generator, placement test, adaptive logic
```
