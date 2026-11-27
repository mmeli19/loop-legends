"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadJSON, saveJSON, shuffle } from "@/lib/shared";
import { boxCounts, buildSession, DAILY_GOAL, grade, INTERVALS, liveStreak, SCIENCE_NOTE, today, touchStreak, type CardState, type Streak } from "@/lib/srs";
import { CARDS, DOMAIN_IDS, DOMAINS, QUESTIONS, ROMAN } from "@/lib/teacher/data";
import type { DomainId, ExamQuestion, TeacherStore } from "@/lib/teacher/types";

const KEY = "cs241-arcade-v1"; // same key as the original app, so saved progress carries over
interface Store extends TeacherStore {
  srs: Record<string, CardState>;
  streak?: Streak;
  daily?: { day: number; done: number };
}
const EMPTY: Store = { best: 0, seen: {}, missed: {}, timer: true, srs: {} };

type Mode = "run" | "domain" | "missed" | "code" | "review";
type Screen = { kind: "home" } | { kind: "pick" } | { kind: "quiz"; mode: Mode; d?: DomainId; qs: ExamQuestion[] } | { kind: "flash"; d: DomainId | 0 };

function buildRun(): ExamQuestion[] {
  // 12 questions weighted like the real exam: 12.5% / 35% / 40% / 12.5%.
  const plan: Record<DomainId, number> = { 1: 2, 2: 4, 3: 4, 4: 2 };
  return shuffle(DOMAIN_IDS.flatMap((d) => shuffle(QUESTIONS.filter((q) => q.d === d)).slice(0, plan[d])));
}

function Swatch({ d }: { d: DomainId }) {
  return <i className="sw" style={{ background: DOMAINS[d].color }} />;
}

export default function TeacherApp() {
  const [store, setStore] = useState<Store | null>(null);
  const [screen, setScreen] = useState<Screen>({ kind: "home" });
  const [key, setKey] = useState(0);

  useEffect(() => {
    const s = loadJSON<Store>(KEY, EMPTY);
    setStore({ ...EMPTY, ...s, seen: s.seen ?? {}, missed: s.missed ?? {}, srs: s.srs ?? {} });
  }, []);
  if (!store) return <p style={{ padding: 24 }}>Loading…</p>;

  const update = (fn: (s: Store) => Store) =>
    setStore((prev) => {
      const next = fn(prev!);
      saveJSON(KEY, next);
      return next;
    });
  const go = (s: Screen) => {
    setScreen(s);
    setKey((k) => k + 1);
    window.scrollTo({ top: 0 });
  };
  const home = () => go({ kind: "home" });

  const start = (mode: Mode, d?: DomainId) => {
    let qs: ExamQuestion[] = [];
    if (mode === "run") qs = buildRun();
    else if (mode === "domain") qs = shuffle(QUESTIONS.filter((q) => q.d === d));
    else if (mode === "missed") qs = shuffle(QUESTIONS.filter((q) => store.missed[q.id]));
    else if (mode === "code") qs = shuffle(QUESTIONS.filter((q) => q.code)).slice(0, 10);
    else qs = buildSession(QUESTIONS, store.srs).session;
    if (!qs.length) return home();
    go({ kind: "quiz", mode, d, qs });
  };

  return (
    <div className="wrap">
      {screen.kind === "home" && <Home store={store} update={update} start={start} onPick={() => go({ kind: "pick" })} onFlash={() => go({ kind: "flash", d: 0 })} />}
      {screen.kind === "pick" && <PickDomain store={store} onBack={home} start={start} />}
      {screen.kind === "quiz" && <Quiz key={key} store={store} update={update} mode={screen.mode} d={screen.d} initial={screen.qs} onHome={home} onAgain={() => start(screen.mode, screen.d)} />}
      {screen.kind === "flash" && <Flashcards key={key} d={screen.d} onHome={home} onDeck={(d) => go({ kind: "flash", d })} onTest={(d) => start(d ? "domain" : "run", d || undefined)} />}
    </div>
  );
}

function domainAcc(store: Store, d: DomainId) {
  let c = 0,
    t = 0;
  for (const q of QUESTIONS) {
    if (q.d !== d) continue;
    const s = store.seen[q.id];
    if (s) {
      c += s.c;
      t += s.t;
    }
  }
  return { c, t, p: t ? Math.round((c / t) * 100) : null };
}

/* ---------------- home ---------------- */
function Home({ store, update, start, onPick, onFlash }: { store: Store; update: (fn: (s: Store) => Store) => void; start: (m: Mode, d?: DomainId) => void; onPick: () => void; onFlash: () => void }) {
  const missedN = Object.keys(store.missed).length;
  const day = today();
  const { session, due, fresh } = buildSession(QUESTIONS, store.srs, { day });
  const counts = boxCounts(
    QUESTIONS.map((q) => q.id),
    store.srs,
  );
  const streak = liveStreak(store.streak, day);
  const doneToday = store.daily?.day === day ? store.daily.done : 0;
  let tot = 0,
    cor = 0;
  for (const s of Object.values(store.seen)) {
    tot += s.t;
    cor += s.c;
  }
  return (
    <>
      <header className="hero">
        <div className="eyebrow">
          <Link href="/">Loop Legends</Link> · TExES Computer Science 8–12 · Exam 241
        </div>
        <h1>
          Loop Legends <span className="badge">Teachers</span>
        </h1>
        <p className="muted">
          {QUESTIONS.length} practice questions and {CARDS.length} flashcards, weighted like the real 100-question exam.
        </p>
        <div className="blueprint" role="img" aria-label="Exam blueprint: Domain I 12.5%, II 35%, III 40%, IV 12.5%">
          {DOMAIN_IDS.map((d) => (
            <div key={d} style={{ width: `${DOMAINS[d].pct}%`, background: DOMAINS[d].color }}>
              {DOMAINS[d].pct}%
            </div>
          ))}
        </div>
        <div className="legend">
          {DOMAIN_IDS.map((d) => (
            <span key={d}>
              <Swatch d={d} />
              {ROMAN[d - 1]}. {DOMAINS[d].name}
            </span>
          ))}
        </div>
      </header>

      <section className="sheet review-sheet">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="eyebrow">Daily Review · spaced repetition</div>
            <h2>{session.length ? `${session.length} ready today` : "All caught up"}</h2>
          </div>
          <div className="streak-badge" title="Days in a row you've reviewed">
            <span aria-hidden="true">🔥</span>
            <strong className="num">{streak}</strong>
            <small>day streak</small>
          </div>
        </div>
        <div className="goal">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span>Today&apos;s goal</span>
            <span className="num muted">
              {Math.min(doneToday, DAILY_GOAL)} / {DAILY_GOAL}
              {doneToday >= DAILY_GOAL ? " · met!" : ""}
            </span>
          </div>
          <div className="track">
            <div className="fill" style={{ width: `${Math.min(100, (doneToday / DAILY_GOAL) * 100)}%` }} />
          </div>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          {session.length ? `${due} due, ${fresh} new. Domains are mixed, and misses come back until you get them right.` : "Come back tomorrow for your next set."}
        </p>
        <div className="ladder" aria-label="Memory ladder">
          {counts.map((n, b) => (
            <div key={b} className="rung" title={b === 0 ? "Not started" : `Box ${b}: review every ${INTERVALS[b]} days`}>
              <div className={"fill b" + b} style={{ height: `${Math.max(4, (n / QUESTIONS.length) * 100)}%` }} />
              <small>{b === 0 ? "new" : `B${b}`}</small>
              <small className="num">{n}</small>
            </div>
          ))}
        </div>
        <div className="row">
          <button className="btn" disabled={!session.length} onClick={() => start("review")}>
            {session.length ? "Start Daily Review" : "Nothing due"}
          </button>
        </div>
      </section>

      <div className="modes">
        <button className="mode primary" onClick={() => start("run")}>
          <span className="tag">Game</span>
          <b>Exam Run</b>
          <span className="muted">12 questions in exam proportions. Beat the clock, build streaks, chase your high score.</span>
        </button>
        <button className="mode" onClick={onPick}>
          <span className="tag">Study</span>
          <b>Drill a Domain</b>
          <span className="muted">Untimed, every question in one domain, with explanations.</span>
        </button>
        <button className="mode" onClick={() => start("missed")} disabled={missedN === 0}>
          <span className="tag">Study</span>
          <b>Fix My Misses ({missedN})</b>
          <span className="muted">{missedN ? "Retry questions you got wrong until they stick." : "Questions you miss land here."}</span>
        </button>
        <button className="mode" onClick={onFlash}>
          <span className="tag">Review</span>
          <b>Flashcards</b>
          <span className="muted">Key terms and rules. Tap to flip, sort into Got it / Again.</span>
        </button>
        <button className="mode" onClick={() => start("code")}>
          <span className="tag">Game</span>
          <b>Trace the Code</b>
          <span className="muted">Code-tracing questions only. Read it like the computer would.</span>
        </button>
      </div>

      <section className="sheet">
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
          <h2>Your progress</h2>
          <label className="toggle">
            <input type="checkbox" checked={store.timer} onChange={(e) => update((s) => ({ ...s, timer: e.target.checked }))} />
            Timer in games
          </label>
        </div>
        <div className="stats" style={{ marginBottom: 16 }}>
          <div>
            <strong className="num">{store.best}</strong>
            <small>High score</small>
          </div>
          <div>
            <strong className="num">{tot}</strong>
            <small>Answered</small>
          </div>
          <div>
            <strong className="num">{tot ? Math.round((cor / tot) * 100) + "%" : "—"}</strong>
            <small>Accuracy</small>
          </div>
        </div>
        <div className="bars">
          {DOMAIN_IDS.map((d) => {
            const a = domainAcc(store, d);
            return (
              <div key={d} className="bar">
                <span>{DOMAINS[d].name}</span>
                <span className="num muted">{a.p == null ? "not started" : `${a.p}% · ${a.c}/${a.t}`}</span>
                <div className="track">
                  <div className="fill" style={{ width: `${a.p ?? 0}%`, background: DOMAINS[d].color }} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="muted" style={{ margin: "14px 0 0", fontSize: ".82rem" }}>
          Passing score is 240 on a 100–300 scale. Aim for 80%+ in every domain here before test day. Progress is saved in this browser.
        </p>
      </section>

      <details className="sheet science">
        <summary>
          <b>Why Daily Review works</b>
        </summary>
        <ul>
          {SCIENCE_NOTE.map(([h, p]) => (
            <li key={h}>
              <b>{h}.</b> {p}
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}

function PickDomain({ store, onBack, start }: { store: Store; onBack: () => void; start: (m: Mode, d?: DomainId) => void }) {
  return (
    <>
      <div className="row">
        <button className="btn ghost" onClick={onBack}>
          ← Back
        </button>
      </div>
      <h2>Pick a domain to drill</h2>
      {DOMAIN_IDS.map((d) => {
        const n = QUESTIONS.filter((q) => q.d === d).length;
        const a = domainAcc(store, d);
        return (
          <button key={d} className="mode" onClick={() => start("domain", d)}>
            <span className="tag" style={{ color: DOMAINS[d].color, opacity: 1 }}>
              Domain {ROMAN[d - 1]} · {DOMAINS[d].pct}% of exam
            </span>
            <b>{DOMAINS[d].name}</b>
            <span className="muted">
              {n} questions{a.p != null ? ` · your accuracy ${a.p}%` : ""}
            </span>
          </button>
        );
      })}
    </>
  );
}

/* ---------------- quiz ---------------- */
interface Log {
  q: ExamQuestion;
  ok: boolean;
}

function Quiz({
  store,
  update,
  mode,
  d,
  initial,
  onHome,
  onAgain,
}: {
  store: Store;
  update: (fn: (s: Store) => Store) => void;
  mode: Mode;
  d?: DomainId;
  initial: ExamQuestion[];
  onHome: () => void;
  onAgain: () => void;
}) {
  const game = mode === "run" || mode === "code";
  const timed = game && store.timer;
  const LIMIT = 45;
  const [queue, setQueue] = useState(initial);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [log, setLog] = useState<Log[]>([]);
  const [gained, setGained] = useState(0);
  const [t0, setT0] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [done, setDone] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const graded = useRef(new Set<string>());
  const nextBtn = useRef<HTMLButtonElement>(null);

  const q = queue[i];
  const order = useMemo(() => shuffle(q ? q.c.map((t, idx) => ({ t, idx })) : []), [q, i]); // eslint-disable-line react-hooks/exhaustive-deps
  const mult = (s: number) => (s >= 5 ? 2 : s >= 3 ? 1.5 : 1);

  useEffect(() => {
    if (!timed || picked !== null || done) return;
    const id = setInterval(() => {
      setNow(Date.now());
      if ((Date.now() - t0) / 1000 >= LIMIT) answer(-1);
    }, 100);
    return () => clearInterval(id);
  }); // re-armed each render so it always sees current state

  useEffect(() => {
    if (picked !== null) nextBtn.current?.focus();
  }, [picked]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (done || !q) return;
      const k = "ABCD".indexOf(e.key.toUpperCase());
      const n = "1234".indexOf(e.key);
      const idx = k >= 0 ? k : n;
      if (picked === null && idx >= 0 && idx < order.length) answer(idx);
      else if (picked !== null && e.key === "Enter" && document.activeElement !== nextBtn.current) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function answer(k: number) {
    if (picked !== null) return;
    setPicked(k);
    const pickIdx = k >= 0 ? order[k].idx : -1;
    const ok = pickIdx === q.a;
    const first = !graded.current.has(q.id);
    graded.current.add(q.id);
    update((s) => {
      const seen = { ...s.seen, [q.id]: { c: (s.seen[q.id]?.c ?? 0) + (ok ? 1 : 0), t: (s.seen[q.id]?.t ?? 0) + 1 } };
      const missed = { ...s.missed };
      if (ok) delete missed[q.id];
      else missed[q.id] = 1;
      const next: Store = { ...s, seen, missed };
      if (first) next.srs = { ...s.srs, [q.id]: grade(s.srs[q.id], ok) };
      if (mode === "review") {
        const day = today();
        next.streak = touchStreak(s.streak, day);
        next.daily = s.daily?.day === day ? { day, done: s.daily.done + 1 } : { day, done: 1 };
      }
      return next;
    });
    let g = 0;
    if (ok) {
      const st = streak + 1;
      setStreak(st);
      setBestStreak((b) => Math.max(b, st));
      const speed = timed ? Math.max(0, 1 - (Date.now() - t0) / 1000 / LIMIT) : 0;
      g = Math.round((100 + 50 * speed) * mult(st));
      setScore((s) => s + g);
    } else {
      setStreak(0);
      if (mode === "review") setQueue((qq) => [...qq, q]);
    }
    setGained(g);
    if (first) setLog((l) => [...l, { q, ok }]);
  }

  function next() {
    if (i + 1 < queue.length) {
      setI(i + 1);
      setPicked(null);
      setT0(Date.now());
      setNow(Date.now());
    } else {
      if (game && score > store.best) {
        setNewBest(true);
        update((s) => ({ ...s, best: score }));
      }
      setDone(true);
    }
  }

  if (done) {
    const right = log.filter((l) => l.ok).length;
    const pct = Math.round((right / Math.max(1, log.length)) * 100);
    const verdict = mode === "review" ? "Correct answers wait longer before coming back; misses return tomorrow." : pct >= 85 ? "Test-ready on this set." : pct >= 70 ? "Close. Review the misses below." : "Keep drilling. The explanations below are your study list.";
    const byD: Partial<Record<DomainId, { c: number; t: number }>> = {};
    for (const l of log) {
      const v = (byD[l.q.d] ??= { c: 0, t: 0 });
      v.t++;
      if (l.ok) v.c++;
    }
    const misses = log.filter((l) => !l.ok);
    return (
      <>
        <section className="sheet" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="eyebrow">{newBest ? "New high score" : mode === "review" ? "Daily Review complete" : "Round complete"}</div>
          <div className="results-big num">{game ? score : `${pct}%`}</div>
          <p style={{ margin: 0 }}>
            {right} of {log.length} correct{game ? ` · ${pct}% · best streak ${bestStreak}` : " on the first try"}. {verdict}
          </p>
          <div className="bars">
            {(Object.keys(byD) as unknown as DomainId[])
              .map(Number)
              .sort()
              .map((dd) => {
                const v = byD[dd as DomainId]!;
                return (
                  <div key={dd} className="bar">
                    <span>{DOMAINS[dd as DomainId].name}</span>
                    <span className="num muted">
                      {v.c}/{v.t}
                    </span>
                    <div className="track">
                      <div className="fill" style={{ width: `${Math.round((v.c / v.t) * 100)}%`, background: DOMAINS[dd as DomainId].color }} />
                    </div>
                  </div>
                );
              })}
          </div>
          <div className="row">
            {mode !== "review" && (
              <button className="btn" onClick={onAgain}>
                Play again
              </button>
            )}
            <button className={mode === "review" ? "btn" : "btn ghost"} onClick={onHome}>
              Home
            </button>
          </div>
        </section>
        {misses.length > 0 && (
          <section className="sheet">
            <h2 style={{ marginBottom: 12 }}>Review your misses</h2>
            <div className="review">
              {misses.map((l) => (
                <div key={l.q.id} className="item">
                  <p style={{ margin: "0 0 6px", fontWeight: 700 }}>{l.q.q}</p>
                  {l.q.code ? (
                    <pre style={{ marginBottom: 8 }}>
                      <code>{l.q.code}</code>
                    </pre>
                  ) : null}
                  <p style={{ margin: 0 }}>
                    <span className="muted">Answer: </span>
                    <strong>{l.q.c[l.q.a]}</strong>
                  </p>
                  <p className="muted" style={{ margin: "4px 0 0" }}>
                    {l.q.e}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </>
    );
  }

  if (!q) return null;
  const D = DOMAINS[q.d];
  const answered = picked !== null;
  const pickIdx = answered && picked! >= 0 ? order[picked!].idx : -1;
  const ok = answered && pickIdx === q.a;
  const left = LIMIT - (now - t0) / 1000;
  const msg = picked === -1 ? "Time's up." : ok ? (gained ? `Correct  +${gained}` : "Correct") : mode === "review" ? "Not quite. It'll come back in a minute." : "Not quite.";
  return (
    <>
      <div className="hud">
        <button className="btn ghost" style={{ padding: "8px 12px" }} onClick={onHome}>
          Quit
        </button>
        <span>
          Q {i + 1} / {queue.length}
        </span>
        {game ? <span className="streak">{streak >= 3 ? `🔥 ${streak} streak ×${mult(streak)}` : `streak ${streak}`}</span> : <span>{log.filter((l) => l.ok).length} correct</span>}
        {game ? (
          <span key={score} className={"score num" + (score ? " pop" : "")}>
            {score}
          </span>
        ) : null}
      </div>
      {timed && (
        <div className={"timer" + (left < 10 ? " low" : "")}>
          <i style={{ width: `${Math.max(0, (left / LIMIT) * 100)}%` }} />
        </div>
      )}
      <section className="sheet qbody">
        <span className="dtag">
          <Swatch d={q.d} />
          Domain {ROMAN[q.d - 1]} · {D.short}
          {mode === "review" && graded.current.has(q.id) && !answered ? " · try again" : ""}
        </span>
        <p className="qtext">{q.q}</p>
        {q.code ? (
          <pre>
            <code>{q.code}</code>
          </pre>
        ) : null}
        <div className="choices">
          {order.map((o, k) => {
            let cls = "choice";
            if (answered && o.idx === q.a) cls += " right";
            else if (answered && k === picked) cls += " wrong";
            return (
              <button key={k} className={cls} disabled={answered} onClick={() => answer(k)}>
                <span className="k">{"ABCD"[k]}</span>
                <span>{o.t}</span>
              </button>
            );
          })}
        </div>
        {answered && (
          <>
            <div className={"explain" + (ok ? "" : " miss")} role="status">
              <strong>{msg}</strong>
              <p>{q.e}</p>
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn" ref={nextBtn} onClick={next}>
                {i + 1 < queue.length ? "Next question →" : "See results"}
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}

/* ---------------- flashcards ---------------- */
function Flashcards({ d, onHome, onDeck, onTest }: { d: DomainId | 0; onHome: () => void; onDeck: (d: DomainId | 0) => void; onTest: (d: DomainId | 0) => void }) {
  const [deck, setDeck] = useState(() => shuffle(CARDS.filter((c) => !d || c.d === d)));
  const [i, setI] = useState(0);
  const [got, setGot] = useState(0);
  const [again, setAgain] = useState<typeof CARDS>([]);
  const [flipped, setFlipped] = useState(false);

  // Cards marked "Again" come back after the deck is finished (repetition until known).
  useEffect(() => {
    if (i >= deck.length && again.length) {
      setDeck(shuffle(again));
      setAgain([]);
      setI(0);
    }
  }, [i, deck.length, again]);

  const chips = (
    <div className="chips">
      <button className="chip" aria-pressed={!d} onClick={() => onDeck(0)}>
        All
      </button>
      {DOMAIN_IDS.map((dd) => (
        <button key={dd} className="chip" aria-pressed={d === dd} onClick={() => onDeck(dd)}>
          {DOMAINS[dd].short}
        </button>
      ))}
    </div>
  );
  const header = (
    <div className="row" style={{ justifyContent: "space-between" }}>
      <button className="btn ghost" onClick={onHome}>
        ← Back
      </button>
      <span className="num muted">
        Got it {got} · Again {again.length}
      </span>
    </div>
  );

  if (i >= deck.length && !again.length)
    return (
      <>
        {header}
        {chips}
        <section className="sheet" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="eyebrow">Deck cleared</div>
          <h2>Every card marked Got it.</h2>
          <div className="row">
            <button className="btn" onClick={() => onDeck(d)}>
              Shuffle again
            </button>
            <button className="btn ghost" onClick={() => onTest(d)}>
              Test yourself
            </button>
          </div>
        </section>
      </>
    );
  const c = deck[i];
  if (!c) return null;
  const D = DOMAINS[c.d];
  return (
    <>
      {header}
      {chips}
      <div className="eyebrow">
        Card {i + 1} of {deck.length}
      </div>
      <button className={"card" + (flipped ? " flipped" : "")} aria-label="Flashcard. Tap to flip." onClick={() => setFlipped(!flipped)}>
        <div className="card-inner">
          <div className="face">
            <span className="dtag">
              <Swatch d={c.d} />
              {D.short}
            </span>
            <div className="term">{c.t}</div>
            <div className="hint">tap to flip</div>
          </div>
          <div className="face back">
            <span className="dtag">
              <Swatch d={c.d} />
              {c.t}
            </span>
            <div style={{ fontSize: "1.08rem" }}>{c.b}</div>
          </div>
        </div>
      </button>
      <div className="row">
        <button
          className="btn ghost"
          style={{ flex: 1 }}
          onClick={() => {
            setAgain([...again, c]);
            setI(i + 1);
            setFlipped(false);
          }}
        >
          Again
        </button>
        <button
          className="btn"
          style={{ flex: 1 }}
          onClick={() => {
            setGot(got + 1);
            setI(i + 1);
            setFlipped(false);
          }}
        >
          Got it
        </button>
      </div>
    </>
  );
}
