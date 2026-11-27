"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { shuffle } from "@/lib/shared";
import { buildSession, liveStreak } from "@/lib/srs";
import { BUGS, ORDERS, UNITS } from "@/lib/student/data";
import type { Lang, Question, Unit } from "@/lib/student/types";
import { ClassDashboard } from "./ClassDashboard";
import { BinaryBlitz, BugHunt, CodeBuilder, OutputLab, TermMatch } from "./Games";
import { LearnHome, Lesson, unitStatus } from "./Learn";
import { ProgressView } from "./Progress";
import { allQuestions, Quiz, type QuizOpts } from "./Quiz";
import { ReviewHome } from "./Review";
import { levelOf, StudentStoreProvider, useStudent, XP_PER_LEVEL } from "./store";

type Tab = "learn" | "review" | "practice" | "games" | "progress";
type View =
  | { kind: "lesson"; unit: Unit }
  | { kind: "quiz"; qs: Question[]; opts: QuizOpts }
  | { kind: "output" }
  | { kind: "blitz" }
  | { kind: "bugs" }
  | { kind: "order" }
  | { kind: "match"; unit: Unit | null }
  | { kind: "teacher" };

const TABS: [Tab, string][] = [
  ["learn", "Learn"],
  ["review", "Daily Review"],
  ["practice", "Practice"],
  ["games", "Games"],
  ["progress", "Progress"],
];

/** Views where switching language mid-activity would scramble the questions. */
const ACTIVITIES = new Set(["quiz", "output", "blitz", "bugs", "order", "match"]);

function Shell() {
  const { store, update, xpPop } = useStudent();
  const [tab, setTab] = useState<Tab>("learn");
  const [view, setView] = useState<View | null>(null);
  // Key bumps remount activities so "play again" from a fresh entry starts clean.
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#teacher") {
      setTab("progress");
      setView({ kind: "teacher" });
    }
  }, []);

  const go = (v: View) => {
    setView(v);
    setKey((k) => k + 1);
    window.scrollTo({ top: 0 });
  };
  const back = () => {
    setView(null);
    window.scrollTo({ top: 0 });
  };
  const inActivity = view != null && ACTIVITIES.has(view.kind);
  const L = levelOf(store.xp);
  const startQuiz = (qs: Question[], opts: QuizOpts) => go({ kind: "quiz", qs, opts });
  const unitQs = (u: Unit) => u.qs.map((q) => ({ ...q, unit: u.id }));
  const reviewDue = buildSession(allQuestions(), store.srs ?? {}).session.length;

  let body: React.ReactNode;
  if (view) {
    switch (view.kind) {
      case "lesson":
        body = (
          <Lesson
            key={view.unit.id}
            unit={view.unit}
            onBack={back}
            onOpen={(u) => go({ kind: "lesson", unit: u })}
            onQuiz={() => startQuiz(unitQs(view.unit), { title: view.unit.title, unit: view.unit.id })}
            onMatch={() => go({ kind: "match", unit: view.unit })}
          />
        );
        break;
      case "quiz":
        body = <Quiz key={key} questions={view.qs} opts={view.opts} onExit={back} />;
        break;
      case "output":
        body = <OutputLab key={key} onExit={back} />;
        break;
      case "blitz":
        body = <BinaryBlitz key={key} onExit={back} />;
        break;
      case "bugs":
        body = <BugHunt key={key} onExit={back} />;
        break;
      case "order":
        body = <CodeBuilder key={key} onExit={back} />;
        break;
      case "match":
        body = <TermMatch key={key} unit={view.unit} onExit={back} />;
        break;
      case "teacher":
        body = <ClassDashboard onExit={back} />;
        break;
    }
  } else if (tab === "learn") {
    body = (
      <LearnHome
        onOpen={(u) => {
          update((s) => ({ ...s, units: { ...s.units, [u.id]: { ...(s.units[u.id] ?? {}), read: true } } }));
          go({ kind: "lesson", unit: u });
        }}
      />
    );
  } else if (tab === "review") {
    body = <ReviewHome onStart={(qs) => startQuiz(qs, { title: "Daily Review", review: true, keepOrder: true })} />;
  } else if (tab === "practice") {
    const all = allQuestions();
    const missed = all.filter((q) => {
      const s = store.qs[q.id];
      return s && s.c < s.t;
    });
    body = (
      <>
        <div className="tiles">
          <button className="tile wide" onClick={() => startQuiz(shuffle(all).slice(0, 15), { title: "Mixed Review" })}>
            <span className="tag">15 questions · interleaved</span>
            <b>Mixed Review</b>
            <span className="muted">Random questions from all {UNITS.length} units. Mixing topics is great test prep.</span>
          </button>
          <button className="tile" onClick={() => go({ kind: "output" })}>
            <span className="tag">Never runs out</span>
            <b>Output Lab</b>
            <span className="muted">New code every time. Type exactly what it prints.</span>
          </button>
          <button className="tile" disabled={!missed.length} onClick={() => startQuiz(missed, { title: "Fix My Misses" })}>
            <span className="tag">{missed.length} saved</span>
            <b>Fix My Misses</b>
            <span className="muted">{missed.length ? "Questions you've missed before." : "Questions you miss show up here."}</span>
          </button>
        </div>
        <h2>Quiz by unit</h2>
        <div className="units">
          {UNITS.map((u, i) => {
            const s = store.units[u.id] ?? {};
            const [st, cls] = unitStatus(s.best, s.read);
            return (
              <button key={u.id} className="unit" onClick={() => startQuiz(unitQs(u), { title: u.title, unit: u.id })}>
                <span className="n">{i + 1}</span>
                <span>
                  <b>{u.title}</b>
                  <small>{u.qs.length} questions</small>
                </span>
                <span className={"pill " + cls}>{st}</span>
              </button>
            );
          })}
        </div>
      </>
    );
  } else if (tab === "games") {
    const g = store.games;
    body = (
      <div className="tiles">
        <button className="tile wide" onClick={() => setTab("review")}>
          <span className="tag">{reviewDue ? `${reviewDue} ready · 🔥 ${liveStreak(store.streak)} day streak` : "All caught up today"}</span>
          <b>Daily Review</b>
          <span className="muted">Spaced repetition: climb the memory ladder and keep your streak alive.</span>
        </button>
        <button className="tile wide" onClick={() => go({ kind: "blitz" })}>
          <span className="tag">60 seconds · best {g.blitz ?? 0}</span>
          <b>Binary Blitz</b>
          <span className="muted">Convert between binary and decimal as fast as you can.</span>
        </button>
        <button className="tile" onClick={() => go({ kind: "bugs" })}>
          <span className="tag">
            Best {g.bugs ?? 0}/{BUGS.length}
          </span>
          <b>Bug Hunt</b>
          <span className="muted">Tap the line that&apos;s breaking the program.</span>
        </button>
        <button className="tile" onClick={() => go({ kind: "order" })}>
          <span className="tag">
            Best {g.order ?? 0}/{ORDERS.length}
          </span>
          <b>Code Builder</b>
          <span className="muted">Put scrambled lines in the right order.</span>
        </button>
        <button className="tile" onClick={() => go({ kind: "match", unit: null })}>
          <span className="tag">{g.match ? `Best ${g.match}s` : "All units"}</span>
          <b>Term Match</b>
          <span className="muted">Pair vocabulary words with their meanings.</span>
        </button>
        <button className="tile" onClick={() => go({ kind: "output" })}>
          <span className="tag">Best {g.output ?? 0}/10</span>
          <b>Output Lab</b>
          <span className="muted">Predict what fresh code prints.</span>
        </button>
      </div>
    );
  } else {
    body = <ProgressView onTeacher={() => go({ kind: "teacher" })} />;
  }

  return (
    <div className="wrap">
      <header className="top">
        <div className="brand">
          <span className="eyebrow">
            <Link href="/">Loop Legends</Link> · Texas Computer Science I · Grades 9–12
          </span>
          <h1>
            Loop Legends <span className="badge">Students</span>
          </h1>
        </div>
        <div className="lang" role="group" aria-label="Programming language">
          {(["py", "java"] as Lang[]).map((l) => (
            <button
              key={l}
              aria-pressed={store.lang === l}
              disabled={inActivity}
              title={inActivity ? "Finish or quit this activity to switch languages" : ""}
              onClick={() => update((s) => ({ ...s, lang: l }))}
            >
              {l === "py" ? "Python" : "Java"}
            </button>
          ))}
        </div>
      </header>
      <div className="xp">
        <span>
          Level {L.lv} · {L.rank}
        </span>
        <div className="xpbar" aria-hidden="true">
          <i style={{ width: `${(L.into / XP_PER_LEVEL) * 100}%` }} />
        </div>
        <strong key={xpPop} className={"num" + (xpPop ? " pop" : "")}>
          {store.xp} XP
        </strong>
      </div>
      <nav className="tabs" role="tablist">
        {TABS.map(([t, label]) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => {
              setTab(t);
              setView(null);
            }}
          >
            {label}
            {t === "review" && reviewDue > 0 ? <span className="dot num">{reviewDue}</span> : null}
          </button>
        ))}
      </nav>
      <main className="wrap" style={{ gap: 16 }}>
        {body}
      </main>
    </div>
  );
}

export default function StudentApp() {
  return (
    <StudentStoreProvider>
      <Shell />
    </StudentStoreProvider>
  );
}
