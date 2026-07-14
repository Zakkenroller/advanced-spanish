# Konjuga — Spanish Grammar Trainer

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
- **Conjugation drill** — unlimited sentence-based questions across every tense
  unlocked at your level, mixing 22 regular verbs with 12 core irregulars (ser,
  estar, ir, tener, hacer, poder, querer, venir, decir, saber, poner, salir).
  Every question lives inside a real sentence whose trigger word (ayer, mañana,
  de niño, ojalá que…) quietly reinforces the tense association — and the drill
  **adapts to your weak spots**, revisiting the verb–tense combos you miss until
  you've re-mastered them
- **Review queue (spaced repetition)** — every question you miss is scheduled for
  review: due immediately, then 1 day and 3 days after each correct pass until it
  graduates. Missing it again resets the clock
- **Mixed practice** — tenses, pronouns, and gender interleaved in one 12-question
  session, which is harder than blocked practice but better for long-term retention
- **Adaptive difficulty** — the app tracks your rolling accuracy per topic and
  suggests moving up (≥85%) or reviewing a level down (≤50%)
- **Skip vosotros** — a toggle on the home screen turns off Spain's informal
  *vosotros*/*vosotras* "you all". With it off, that form disappears from the
  conjugation drill, ending references, flashcards, and every verb table — handy
  if you're learning Latin American Spanish
- **Progress that sticks** — XP, streaks, and per-topic stats are saved in your
  browser (localStorage); nothing leaves your machine unless you enable sync
- **Optional accounts & sync** — with a free Supabase project configured (see
  below), users sign in with an emailed magic link and their progress — level,
  XP, stats, review queue — follows them across devices

## The Tense Lab

The verb-tense side gets its own lab, built on findings from
second-language-acquisition research (form-focused salience, VanPatten's
processing instruction, and interleaved retrieval practice):

- **Tense Toolkit** — a visual timeline of every tense, the photo-vs-video metaphor
  for preterite/imperfect, trigger-word tables, and the classic mnemonics:
  SIMBA, CHEATED, DOCTOR/PLACE, WEIRDO, the Three Amigos, the 12 irregular
  futures in three families, and Car-Gar-Zar
- **Tense Detective** — interpretation exercises (20 per level, 100 total): decode
  who, when, and whether it's finished from the verb form alone, the way
  processing-instruction research recommends. Sessions cycle through the pool
  without repeats
- **Story Mode** — twelve cloze narratives per level (60 stories, 480 blanks),
  from a market morning at A1 to a haunted house and a retirement speech at C1,
  including workplace scenes (a county office, a clinic front desk, a Napa grape
  harvest): the imperfect paints the set, the preterite moves the plot. Stories
  cycle so you always get the one you've seen least recently. Mistakes get the
  full treatment: a per-blank review (what you typed vs. the correct form, in
  context, with the rule), then an immediate **fix-it round** where you retype
  every miss — repeating until you get each one right — and finally a spot in
  the spaced-repetition review queue
- **Ending Flashcards** — flip through all eleven tenses: the verb endings (or the
  compound-tense formula) on one side, what the tense means and when to use it on
  the other. Tap to reveal, step through the deck, or shuffle
- **Tense Workout** — a tense-focused interleaved set: detective questions,
  curated exercises, and generated drills shuffled together

Misses in every lab mode feed the same spaced-repetition review queue as the
rest of the app.

## Running it

No build step, no dependencies. Either open `index.html` directly in a browser, or
serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

It also works out of the box on GitHub Pages: Settings → Pages → deploy from the
main branch.

## Accounts & sync (optional, ~10 minutes)

Out of the box the app is fully local — no account UI appears and no data leaves
the browser. To enable individual accounts with cross-device sync:

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is plenty —
   each user's progress is a few KB).
2. **Create the table.** In the SQL Editor, run:

   ```sql
   create table public.progress (
     user_id uuid primary key references auth.users(id) on delete cascade,
     state jsonb not null,
     updated_at timestamptz not null default now()
   );

   alter table public.progress enable row level security;

   create policy "Users can manage own progress"
     on public.progress for all
     using (auth.uid() = user_id)
     with check (auth.uid() = user_id);
   ```

3. **Set the redirect URL.** In Authentication → URL Configuration, set the
   Site URL to where the app is served (e.g. your GitHub Pages URL, or
   `http://localhost:8000` while developing). Magic links redirect there.
4. **Paste your keys.** In Project Settings → API, copy the project URL and the
   `anon public` key into `sync-config.js`. The anon key is safe to commit — it's
   public by design; row-level security (step 2) is what keeps each user's data
   private to them.

That's it. A "☁️ Sign in to sync" button appears in the header; users enter an
email, click the emailed link, and their progress syncs automatically after
every answer (debounced). Conflict handling is last-write-wins on the whole
profile: on sign-in, whichever copy (local or cloud) was saved most recently
wins. Signing in on a fresh device pulls the cloud copy; "Reset progress" also
clears the cloud copy.

**Caveat worth knowing:** if a *different* person signs in on a browser that
already has local progress and their account has no cloud data yet, the local
progress is adopted as theirs. Have new users sign in before practicing, or
reset progress first.

## Project layout

```
index.html   app shell and views
styles.css   theme (light + dark) and layout
data.js         levels, lessons, 330 hand-written exercises, conjugation tables,
                generator data banks (nouns, adjectives, names, verb patterns)
app.js          quiz engine, question generators, placement test, adaptive logic
sync-config.js  Supabase URL + anon key (empty = local-only mode)
sync.js         optional accounts: magic-link auth, cloud sync of progress
```
