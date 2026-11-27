# Loop Legends

Practice and games for Texas computer science, built as one web app with two sides:

- **Students** (`/students`): Computer Science I for grades 9–12, in Python or Java.
- **Teachers** (`/teachers`): prep for the TExES Computer Science 8–12 (241) certification exam.

Built with **Next.js 15 (App Router), React 19, and TypeScript**, exported as a static site. No accounts and no server: progress is saved in the browser with `localStorage`.

## What's inside

### Student app: Texas Computer Science I

- **17 units, 144 questions**, each with a short lesson and code examples in both Python and Java.
- **All 62 Computer Science I student expectations (TEKS 1A–6S) are mapped to at least one unit.** Each lesson shows its TEKS codes, and the Progress tab has a TEKS map that lights up as students master units.
- **Daily Review (spaced repetition):** questions come back after 1, 2, 4, 7, 15, and 30 days. A miss drops the question back to the first box. Includes a daily goal (20 answers), a day streak, and a "memory ladder" showing how many questions sit in each box.
- **Games:** Binary Blitz (60-second binary/decimal conversion), Bug Hunt, Code Builder (put scrambled lines in order), Term Match, and Output Lab (freshly generated code every round, so it never runs out).
- **Practice:** Mixed Review (15 interleaved questions from every unit), Fix My Misses, and a quiz for each unit.
- **XP, levels, and combo streaks** (×1.5 at 3 in a row, ×2 at 5 in a row).
- **Class Dashboard for teachers** (Progress → Teacher sign in, or `/students/#teacher`): protected by a PIN on that device. Students make a score code; the teacher pastes codes in to get a leaderboard, a big-screen view, a class snapshot, a per-unit score table for all 17 units, and a CSV copy for Sheets or Excel. Score codes are checked with a hash, so a code that was cut off or edited is flagged.

| Unit | Title | TEKS |
|---|---|---|
| 1 | Computational Thinking | 4A 4B 4C 4F 4G 4Q |
| 2 | How Computers Store Data | 6K 6M |
| 3 | Variables, Types & Input | 3B 4D 4P 6N 6O |
| 4 | Operators & Expressions | 4N 4O 4P |
| 5 | Strings | 6P |
| 6 | Making Decisions | 4M 4R 4T 4U 6J |
| 7 | Loops | 4M 4S |
| 8 | Functions & Methods | 4E 6E 6G 6H 6I |
| 9 | Lists & Arrays | 4K 6Q 6R |
| 10 | Searching & Sorting | 4K 6Q |
| 11 | Objects & Classes | 6D 6F 6O |
| 12 | Debugging, Testing & Ethics | 4H 4I 4J 5A 5D |
| 13 | Hardware & Programming Languages | 6A 6B 6C 6E 6L 6O 6S |
| 14 | Style, Output & Graphics | 1C 3A 3B 3C 3D 3E |
| 15 | Math, Random & Error Handling | 4H 4K 4L 4O 4V |
| 16 | Digital Citizenship & Security | 5A 5B 5C 5D 5E |
| 17 | Careers & Teamwork in CS | 1A–1I 2A 2B |

The TEKS descriptions in the app are short paraphrases. Check them against the official Computer Science I TEKS from the Texas Education Agency before using the map for lesson planning or reporting.

### Teacher app: TExES Computer Science 8–12 (241)

- **78 practice questions and 44 flashcards** across the four exam domains, weighted like the real exam (12.5% / 35% / 40% / 12.5%).
- **Daily Review** with the same spaced-repetition schedule, daily goal, streak, and memory ladder as the student app.
- **Exam Run:** 12 questions in exam proportions, with a 45-second timer, speed bonus, streak multiplier, and high score.
- **Drill a Domain, Fix My Misses, Trace the Code** (code-tracing questions only), and **Flashcards** with Got it / Again sorting (cards marked Again come back until you know them).
- Per-domain accuracy bars and a results screen that lists every missed question with its explanation.

## Why the practice is built this way

The review and game modes lean on well-studied learning techniques:

- **Spaced repetition:** reviewing just before you would forget leads to longer-lasting memory than cramming.
- **Retrieval practice:** answering from memory (quizzes, flashcards) builds stronger recall than rereading.
- **Interleaving:** Daily Review and Mixed Review shuffle topics together, which trains students to recognize which tool fits which problem.
- **Immediate feedback:** every answer shows why it is right or wrong.

These are the techniques; the app has not been tested in a classroom study of its own.

## Run it locally

You need Node.js 18.18 or newer.

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # TypeScript check
npm run build      # static site in ./out
```

## Deploy

`npm run build` writes a fully static site to `out/`. The easiest host is **Vercel** (import the repo; no settings needed). Netlify, Cloudflare Pages, and similar static hosts also work with build command `npm run build` and output folder `out`.

For **GitHub Pages** at `https://<user>.github.io/loop-legends/`, add `basePath: "/loop-legends"` to `next.config.mjs` first, since that site lives in a subfolder.

## Project layout

```
app/
  page.tsx               landing page (pick Students or Teachers)
  students/page.tsx      student app route (styles scoped under .ll-s)
  teachers/page.tsx      teacher app route (styles scoped under .ll-t)
components/
  student/               StudentApp shell, Learn, Quiz, Review, Games, Progress, ClassDashboard
  teacher/TeacherApp.tsx  teacher app
lib/
  srs.ts                 spaced-repetition engine (Leitner boxes, sessions, streaks)
  student/content.json   units, lessons, questions, TEKS map
  teacher/content.json   exam domains, questions, flashcards
legacy/                  the original single-file HTML versions, kept for reference
scripts/migration/       one-time scripts used to move content out of the legacy files
```

Saved progress uses the same browser storage keys as the original HTML apps (`cs1-quest-v1`, `cs1-quest-teacher-v1`, `cs241-arcade-v1`), so anyone who used the old versions keeps their progress when served from the same site.
