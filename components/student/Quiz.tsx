"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { shuffle } from "@/lib/shared";
import { grade, today } from "@/lib/srs";
import { UNITS } from "@/lib/student/data";
import type { Question } from "@/lib/student/types";
import { useStudent } from "./store";
import { CodeBlock, Feedback, Hud, ProgressBar } from "./ui";

export interface QuizOpts {
  title: string;
  unit?: string;
  keepOrder?: boolean;
  /** Spaced-repetition review: grades boxes and re-asks misses until correct. */
  review?: boolean;
}

interface LogEntry {
  q: Question;
  ok: boolean;
}

const LETTERS = "ABCD";

export function Quiz({ questions, opts, onExit }: { questions: Question[]; opts: QuizOpts; onExit: () => void }) {
  const { store, update, addXP, markStudied, lv } = useStudent();
  const [round, setRound] = useState(0);
  const [queue, setQueue] = useState<Question[]>(() => (opts.keepOrder ? questions : shuffle(questions)));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [graded, setGraded] = useState<Set<string>>(() => new Set());
  const [finished, setFinished] = useState(false);
  const nextRef = useRef<HTMLButtonElement>(null);

  const q = queue[i];
  const choices = q ? (lv(q.c) ?? []) : [];
  const answer = q ? (lv(q.a) ?? 0) : 0;
  // Shuffle choice order once per question appearance.
  const order = useMemo(() => shuffle(choices.map((t, idx) => ({ t, idx }))), [q?.id, i, round, store.lang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (picked !== null) nextRef.current?.focus();
  }, [picked]);

  // Keyboard shortcuts: A-D or 1-4 to answer, Enter for next.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished || !q) return;
      if (picked === null) {
        const k = "ABCD".indexOf(e.key.toUpperCase());
        const n = "1234".indexOf(e.key);
        const idx = k >= 0 ? k : n;
        if (idx >= 0 && idx < order.length) choose(idx);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function choose(k: number) {
    if (picked !== null) return;
    setPicked(k);
    const ok = order[k].idx === answer;
    const firstTime = !graded.has(q.id);
    update((s) => {
      const stats = { ...(s.qs[q.id] ?? { c: 0, t: 0 }) };
      stats.t++;
      if (ok) stats.c++;
      const next = { ...s, qs: { ...s.qs, [q.id]: stats } };
      // Spaced repetition: every answered question updates its box on the first try this session.
      if (firstTime) next.srs = { ...(s.srs ?? {}), [q.id]: grade(s.srs?.[q.id], ok, today()) };
      return next;
    });
    if (firstTime) setGraded((g) => new Set(g).add(q.id));
    if (opts.review) markStudied();
    if (ok) {
      const c = combo + 1;
      setCombo(c);
      setBestCombo((b) => Math.max(b, c));
      setRight((r) => r + 1);
      addXP(Math.round(10 * (c >= 5 ? 2 : c >= 3 ? 1.5 : 1)));
    } else {
      setCombo(0);
      // Review mode: re-ask missed questions at the end until they're correct.
      if (opts.review) setQueue((qq) => [...qq, q]);
    }
    if (firstTime) setLog((l) => [...l, { q, ok }]);
  }

  function next() {
    if (i + 1 < queue.length) {
      setI(i + 1);
      setPicked(null);
    } else finish();
  }

  function finish() {
    const pct = Math.round((log.filter((l) => l.ok).length / Math.max(1, log.length)) * 100);
    if (opts.unit) {
      update((s) => {
        const u = { ...(s.units[opts.unit!] ?? {}) };
        u.best = Math.max(u.best ?? 0, pct);
        return { ...s, units: { ...s.units, [opts.unit!]: u } };
      });
    }
    setFinished(true);
  }

  function restart() {
    setQueue(opts.keepOrder ? questions : shuffle(questions));
    setI(0);
    setPicked(null);
    setRight(0);
    setCombo(0);
    setBestCombo(0);
    setLog([]);
    setGraded(new Set());
    setFinished(false);
    setRound((r) => r + 1);
  }

  if (finished) {
    const firstRight = log.filter((l) => l.ok).length;
    const pct = Math.round((firstRight / Math.max(1, log.length)) * 100);
    const miss = log.filter((l) => !l.ok);
    const msg = opts.review
      ? miss.length
        ? `You fixed every miss before finishing. Those ${miss.length} will come back tomorrow, while correct ones wait longer.`
        : "Perfect recall. These questions move up the memory ladder and come back later."
      : pct >= 80
        ? opts.unit
          ? "Unit mastered!"
          : "Great work!"
        : "Score 80% or more to master it. Review the misses below and try again.";
    return (
      <>
        <section className="card">
          <span className="eyebrow">{opts.title}</span>
          <div className="big num">{pct}%</div>
          <p>
            {firstRight} of {log.length} right on the first try · best combo {bestCombo}. {msg}
          </p>
          <div className="row">
            {!opts.review && (
              <button className="btn" onClick={restart}>
                Try again
              </button>
            )}
            <button className={opts.review ? "btn" : "btn ghost small"} onClick={onExit}>
              Done
            </button>
          </div>
        </section>
        {miss.length > 0 && (
          <section className="card">
            <h3>Review</h3>
            {miss.map((l) => (
              <div key={l.q.id} style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                <b>{lv(l.q.q)}</b>
                {lv(l.q.code) ? <CodeBlock src={lv(l.q.code)!} /> : null}
                <span>
                  Answer: <strong>{(lv(l.q.c) ?? [])[lv(l.q.a) ?? 0]}</strong>
                </span>
                <span className="muted">{lv(l.q.e)}</span>
              </div>
            ))}
          </section>
        )}
      </>
    );
  }

  if (!q) return null;
  const unit = UNITS.find((u) => u.id === q.unit);
  const done = picked !== null;
  const ok = done && order[picked!].idx === answer;
  const retry = !done && graded.has(q.id);
  return (
    <>
      <Hud onQuit={onExit}>
        <span className="num">
          {i + 1} / {queue.length}
        </span>
        <span className="num">{combo >= 3 ? `🔥 combo ${combo} ×${combo >= 5 ? 2 : 1.5}` : `${right} correct`}</span>
      </Hud>
      <ProgressBar pct={(i / queue.length) * 100} />
      <section className="card">
        <span className="eyebrow">
          {retry ? "Try it again · " : ""}
          {unit ? unit.title : opts.title}
        </span>
        <p className="qtext">{lv(q.q)}</p>
        {lv(q.code) ? <CodeBlock src={lv(q.code)!} /> : null}
        <div className="choices">
          {order.map((o, k) => {
            let cls = "choice";
            if (done && o.idx === answer) cls += " right";
            else if (done && k === picked) cls += " wrong";
            return (
              <button key={k} className={cls} disabled={done} onClick={() => choose(k)}>
                <span className="k">{LETTERS[k]}</span>
                <span>{o.t}</span>
              </button>
            );
          })}
        </div>
        {done && (
          <>
            <Feedback ok={ok} title={ok ? `Correct! +${Math.round(10 * (combo >= 5 ? 2 : combo >= 3 ? 1.5 : 1))} XP` : opts.review ? "Not quite. You'll see this one again in a minute." : "Not quite."}>
              <span>{lv(q.e)}</span>
            </Feedback>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn" ref={nextRef} onClick={next}>
                {i + 1 < queue.length ? "Next →" : "See results"}
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}

/** Every question in the course, tagged with its unit id. */
export function allQuestions(): Question[] {
  return UNITS.flatMap((u) => u.qs.map((q) => ({ ...q, unit: u.id })));
}
