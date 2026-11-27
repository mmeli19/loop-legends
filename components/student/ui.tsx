"use client";
import type { ReactNode } from "react";

/** Lesson text contains trusted inline markup from our own content files (<mark>, <code>). */
export function Html({ as: Tag = "p", html, className }: { as?: "p" | "span" | "li" | "div"; html: string; className?: string }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Code block that dims end-of-line comments, like the original app. */
export function CodeBlock({ src }: { src: string }) {
  const lines = src.split("\n");
  return (
    <pre>
      <code>
        {lines.map((ln, i) => {
          const m = ln.match(/^(.*?)(\s+(#|\/\/).*)$/);
          const body = m && !/["'][^"']*$/.test(m[1]) ? (
            <>
              {m[1]}
              <span className="cm">{m[2]}</span>
            </>
          ) : (
            ln
          );
          return (
            <span key={i}>
              {body}
              {i < lines.length - 1 ? "\n" : null}
            </span>
          );
        })}
      </code>
    </pre>
  );
}

export function Hud({ onQuit, children }: { onQuit: () => void; children: ReactNode }) {
  return (
    <div className="hud">
      <button className="btn ghost small" onClick={onQuit}>
        Quit
      </button>
      {children}
    </div>
  );
}

export function ProgressBar({ pct, id }: { pct: number; id?: string }) {
  return (
    <div className="progress">
      <i id={id} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

export function Feedback({ ok, title, children }: { ok: boolean; title: string; children?: ReactNode }) {
  return (
    <div className={"fb" + (ok ? "" : " miss")} role="status">
      <strong>{title}</strong>
      {children}
    </div>
  );
}

export function DoneCard({ name, big, label, onAgain, onDone }: { name: string; big: string; label: string; onAgain: () => void; onDone: () => void }) {
  return (
    <section className="card">
      <span className="eyebrow">{name}</span>
      <div className="big num">{big}</div>
      <p>{label}</p>
      <div className="row">
        <button className="btn" onClick={onAgain}>
          Play again
        </button>
        <button className="btn ghost small" onClick={onDone}>
          Done
        </button>
      </div>
    </section>
  );
}
