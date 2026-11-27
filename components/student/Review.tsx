"use client";
import { useMemo } from "react";
import { boxCounts, buildSession, DAILY_GOAL, INTERVALS, liveStreak, SCIENCE_NOTE, today } from "@/lib/srs";
import type { Question } from "@/lib/student/types";
import { allQuestions } from "./Quiz";
import { useStudent } from "./store";

const LADDER = ["Not started", "Box 1", "Box 2", "Box 3", "Box 4", "Box 5", "Box 6"];

/** Spaced-repetition hub: streak, daily goal, what's due, and the memory ladder. */
export function ReviewHome({ onStart }: { onStart: (qs: Question[]) => void }) {
  const { store } = useStudent();
  const all = useMemo(() => allQuestions(), []);
  const srs = store.srs ?? {};
  const day = today();
  const { session, due, fresh } = buildSession(all, srs, { day });
  const counts = boxCounts(
    all.map((q) => q.id),
    srs,
  );
  const streak = liveStreak(store.streak, day);
  const doneToday = store.daily?.day === day ? store.daily.done : 0;
  const goalPct = Math.min(100, Math.round((doneToday / DAILY_GOAL) * 100));
  const longTerm = counts[5] + counts[6];

  return (
    <>
      <section className="card review-hero">
        <div className="row between" style={{ alignItems: "center" }}>
          <div>
            <span className="eyebrow">Daily Review</span>
            <h2>Keep it in your memory</h2>
          </div>
          <div className="streak-badge" title="Days in a row you've reviewed">
            <span aria-hidden="true">🔥</span>
            <strong className="num">{streak}</strong>
            <small>day streak</small>
          </div>
        </div>
        <div className="goal" aria-label={`Daily goal: ${doneToday} of ${DAILY_GOAL} reviews`}>
          <div className="row between">
            <span>Today&apos;s goal</span>
            <span className="num muted">
              {Math.min(doneToday, DAILY_GOAL)} / {DAILY_GOAL} answers{doneToday >= DAILY_GOAL ? " · goal met!" : ""}
            </span>
          </div>
          <div className="track">
            <div className="fill" style={{ width: `${goalPct}%` }} />
          </div>
        </div>
        <p>
          {session.length
            ? `${due} question${due === 1 ? "" : "s"} due for review${fresh ? ` and ${fresh} new` : ""}. Topics are mixed together on purpose.`
            : "You're all caught up! Come back tomorrow, or practice anything in the other tabs."}
        </p>
        <div className="row">
          <button className="btn" disabled={!session.length} onClick={() => onStart(session)}>
            {session.length ? `Start review (${session.length})` : "Nothing due today"}
          </button>
        </div>
      </section>

      <section className="card">
        <div className="row between">
          <h3>Memory ladder</h3>
          <span className="num muted">{longTerm} in long-term memory</span>
        </div>
        <p className="muted" style={{ fontSize: ".9rem" }}>
          Get a question right and it climbs a box and waits longer before coming back. Miss it and it drops to Box 1.
        </p>
        <div className="ladder">
          {counts.map((n, b) => (
            <div key={b} className="rung">
              <span>{LADDER[b]}</span>
              <span className="num muted">{b === 0 ? `${n}` : `${n} · every ${INTERVALS[b]} day${INTERVALS[b] === 1 ? "" : "s"}`}</span>
              <div className="track">
                <div className={"fill b" + b} style={{ width: `${(n / all.length) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <details className="card science">
        <summary>
          <b>Why this works</b>
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
