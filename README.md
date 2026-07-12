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
- **Practice quizzes** — multiple choice and typed answers, with instant explanations.
  Each 10-question quiz mixes 6 curated questions with 4 freshly generated ones, and
  curated questions never repeat until you've seen the whole pool for that topic
- **A deep library** — 330 hand-written questions (22 per topic per level) plus
  pronoun and gender generators built on noun, name, adjective, and verb banks:
  hundreds of unique generated combinations per topic
- **Accent-aware checking** — a near-miss on accents gets its own gentle feedback
  (plus on-screen accent buttons: á é í ó ú ñ ü)
- **Conjugation drill** — unlimited generated questions across every tense unlocked
  at your level, mixing 22 regular verbs with 12 core irregulars (ser, estar, ir,
  tener, hacer, poder, querer, venir, decir, saber, poner, salir)
- **Adaptive difficulty** — the app tracks your rolling accuracy per topic and
  suggests moving up (≥85%) or reviewing a level down (≤50%)
- **Progress that sticks** — XP, streaks, and per-topic stats are saved in your
  browser (localStorage); nothing leaves your machine

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
data.js      levels, lessons, 330 hand-written exercises, conjugation tables,
             generator data banks (nouns, adjectives, names, verb patterns)
app.js       quiz engine, question generators, placement test, adaptive logic
```
