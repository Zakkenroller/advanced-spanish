# ¡Adelante! — Roadmap to a social Spanish app

The goal: start as a hobby app for close friends and family (avatars, visible
Spanish levels, light community features), grow organically if people love it.
This document is the executable plan — a future session (any model) or any
developer can pick up a phase and build it without re-deriving decisions.

## Where we are (Phase 0 — shipped)

Static site on Netlify, no backend. Already in place:

- Local **profiles**: display name + emoji avatar, shown in the header
  (`state.profile` in localStorage) — designed to migrate 1:1 into accounts
- **Share results**: Web Share API / clipboard from the results screen
- **Flag this question**: every question and story has a 🚩 reporter.
  Flags go to Netlify Forms (site dashboard → Forms → `question-flag`) when
  served from Netlify; elsewhere they store locally and offer a prefilled
  email. Maintainer address lives in `FLAG_EMAIL` in `app.js`
- Duolingo non-affiliation disclaimer in the footer
- All progress (XP, streak, per-topic stats, review queue, weak-form weights,
  seen-content cycling) in one localStorage object: `adelante-state-v1` —
  this single object is the thing accounts will sync

**Sharing it today**: send friends the Netlify URL. Each person's progress and
profile live on their own device. That's the friends-and-family MVP.

## Phase 1 — Accounts + sync (the real backbone)

**Stack decision: Supabase** (Postgres + auth + row-level security), frontend
stays a static site. No framework migration — the app stays vanilla JS.

- Auth: magic-link email login (no passwords to manage or breach)
- Sync strategy: keep localStorage as the source of truth for instant UX;
  push the state object to Postgres (debounced) after each session; pull and
  merge on login. Merge rule: take max(xp), max(streak), union of review
  queues by question text, and per-key max of stats counters
- The existing `state.profile` becomes the `profiles` row

### Schema (run in Supabase SQL editor)

```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  handle text unique not null check (char_length(handle) between 2 and 20),
  display_name text not null default '',
  avatar text not null default '🙂',          -- emoji only, no uploads (see Legal)
  level text not null default 'a1',           -- a1..c1, shown to friends
  xp int not null default 0,
  streak int not null default 0,
  updated_at timestamptz not null default now()
);

create table progress (
  user_id uuid primary key references profiles on delete cascade,
  blob jsonb not null,                        -- the adelante-state-v1 object
  updated_at timestamptz not null default now()
);

create table friendships (
  requester uuid references profiles on delete cascade,
  addressee uuid references profiles on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  primary key (requester, addressee),
  check (requester <> addressee)
);

create table flags (                          -- replaces Netlify Forms at this phase
  id bigint generated always as identity primary key,
  user_id uuid references profiles on delete set null,
  question text not null, answer text, context text,
  reason text, comment text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;
alter table progress enable row level security;
alter table friendships enable row level security;
alter table flags enable row level security;

create policy "own profile rw" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "friends can read profiles" on profiles for select using (
  auth.uid() = id or exists (
    select 1 from friendships f where f.status = 'accepted'
    and ((f.requester = auth.uid() and f.addressee = profiles.id)
      or (f.addressee = auth.uid() and f.requester = profiles.id))));
create policy "own progress rw" on progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "friendship parties rw" on friendships
  for all using (auth.uid() in (requester, addressee))
  with check (auth.uid() = requester or auth.uid() = addressee);
create policy "anyone authed can flag" on flags
  for insert with check (auth.role() = 'authenticated');
```

### Frontend work

- `auth.js`: Supabase client (CDN ESM import), magic-link form, session watch
- Sync layer: `pushState()` after `save()`, `pullAndMerge()` on login
- Settings additions: log in / log out, delete account (calls a Supabase
  edge function that removes the auth user → cascades wipe the data)

## Phase 2 — Friends & community (the fun part)

- **Add friends**: by handle (`@maria`) or an invite link
  (`?invite=<handle>` → prefilled friend request after login)
- **Amigos panel** on the home screen: each friend's avatar, level badge
  (their `profiles.level`), weekly XP, current streak
- **Weekly leaderboard** among friends only (reset Mondays; compute
  client-side from friends' profiles — no server code needed)
- **Nudge**: "🌮 Sofía challenged you: beat 80% on B1 Tense Workout" — start
  as a copyable share message, not push notifications (zero infra)
- Groups ("**familias**") only if friend-graph feels limiting — a `groups` +
  `group_members` table pair, same RLS pattern as friendships

## Phase 3 — Organic growth hardening

Only when strangers start signing up:

- **Terms + privacy policy** pages, 13+ age gate at signup
- **Handle moderation**: profanity list check + report button; avatars stay
  emoji-only (this is what keeps moderation and CSAM liability near zero)
- **Custom domain** (~$12/yr) and Supabase Pro ($25/mo) when free tier strains
- Native-speaker **content review pass** over `data.js` (~430 hand-written
  items) — the flag queue will already have prioritized the worst offenders
- Dialect preference setting (Latin America / Spain) — filters vosotros
  questions and leísmo notes
- Consider an LLC once there's revenue (note: California ~$800/yr franchise tax)

## Cost curve (monthly)

| Stage | Cost |
|---|---|
| Phase 0 (today) | $0 |
| Phase 1–2, ≤ ~50k monthly users | $0 (Supabase + Netlify free tiers) |
| Growing past free tiers | ~$25–45 |
| Tens of thousands of actives | $50–150 |

## Engineering rules that keep this maintainable

1. **No framework.** Vanilla JS has zero dependency rot — the app from Phase 0
   still runs unmodified in ten years.
2. **One state object.** Everything syncable lives in `adelante-state-v1`.
   New features add keys to it; sync code never changes.
3. **Emoji avatars only.** The single highest-leverage legal/moderation
   decision in this document.
4. **Content lives in `data.js`,** readable by non-programmers. A Spanish
   teacher can review or extend it with no tooling.
5. **Flags before fixes.** Every grammar correction starts from the flag
   queue, not from re-auditing the whole corpus.
