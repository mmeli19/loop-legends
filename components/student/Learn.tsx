"use client";
import { UNITS } from "@/lib/student/data";
import type { Unit } from "@/lib/student/types";
import { useStudent } from "./store";
import { CodeBlock, Html } from "./ui";

export function unitStatus(best: number | undefined, read: boolean | undefined): [string, string] {
  if (best != null && best >= 80) return ["Mastered", "done"];
  if (read || best != null) return [best != null ? `Quiz best ${best}%` : "Started", "going"];
  return ["New", ""];
}

export function TeksChips({ codes }: { codes: string[] }) {
  return (
    <div className="chips" aria-label="Texas TEKS covered">
      {codes.map((c) => (
        <span key={c} className="chip teks" title={`Computer Science I TEKS (${c[0]})(${c.slice(1)})`}>
          TEKS {c}
        </span>
      ))}
    </div>
  );
}

export function LearnHome({ onOpen }: { onOpen: (u: Unit) => void }) {
  const { store, langName } = useStudent();
  return (
    <>
      <p className="muted">
        {UNITS.length} units that cover every Texas Computer Science I standard (TEKS). Read the lesson, then score 80% or higher on the quiz to master it.
        Code is shown in {langName}; switch anytime at the top.
      </p>
      <div className="units">
        {UNITS.map((u, i) => {
          const s = store.units[u.id] ?? {};
          const [st, cls] = unitStatus(s.best, s.read);
          return (
            <button key={u.id} className="unit" onClick={() => onOpen(u)}>
              <span className="n">{i + 1}</span>
              <span>
                <b>{u.title}</b>
                <small>{u.blurb}</small>
              </span>
              <span className={"pill " + cls}>{st}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export function Lesson({
  unit,
  onBack,
  onQuiz,
  onMatch,
  onOpen,
}: {
  unit: Unit;
  onBack: () => void;
  onQuiz: () => void;
  onMatch: () => void;
  onOpen: (u: Unit) => void;
}) {
  const { lv, langName } = useStudent();
  const idx = UNITS.indexOf(unit);
  return (
    <>
      <div className="row between">
        <button className="btn ghost small" onClick={onBack}>
          ← All units
        </button>
        <span className="eyebrow">
          Unit {idx + 1} of {UNITS.length}
        </span>
      </div>
      <h2 style={{ fontSize: "1.5rem" }}>{unit.title}</h2>
      <TeksChips codes={unit.teks} />
      {unit.lesson.map((s, k) => {
        const code = lv(s.code);
        const shared = s.code && typeof s.code === "object" && "all" in s.code;
        return (
          <section key={k} className="card lesson-sec">
            <h3>{s.h}</h3>
            {lv(s.p) ? <Html html={lv(s.p)!} /> : null}
            {s.list ? (
              <ul>
                {s.list.map((li, j) => (
                  <Html key={j} as="li" html={li} />
                ))}
              </ul>
            ) : null}
            {code ? (
              <>
                <div className="codehead">
                  <span>{shared ? "" : langName}</span>
                </div>
                <CodeBlock src={code} />
              </>
            ) : null}
            {lv(s.after) ? <Html className="muted" html={lv(s.after)!} /> : null}
          </section>
        );
      })}
      <section className="card">
        <h3>Key terms</h3>
        <div className="terms">
          {unit.terms.map(([t, d]) => (
            <div key={t} className="term">
              <b>{t}</b>
              {d}
            </div>
          ))}
        </div>
      </section>
      <div className="row">
        <button className="btn" onClick={onQuiz}>
          Take the Unit {idx + 1} quiz
        </button>
        <button className="btn ghost" onClick={onMatch}>
          Match the terms
        </button>
        {idx < UNITS.length - 1 ? (
          <button className="btn ghost" onClick={() => onOpen(UNITS[idx + 1])}>
            Next unit →
          </button>
        ) : null}
      </div>
    </>
  );
}
