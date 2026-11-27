"use client";
import { useRef, useState } from "react";
import { boxCounts, liveStreak } from "@/lib/srs";
import { BUGS, ORDERS, TEKS, UNITS } from "@/lib/student/data";
import { allQuestions } from "./Quiz";
import { levelOf, useStudent, XP_PER_LEVEL } from "./store";

/* ---------- score codes (students share these with their teacher) ---------- */
const SALT = "cs1quest-26";
export function fnv(str: string): string {
  let x = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    x ^= str.charCodeAt(i);
    x = Math.imul(x, 0x01000193) >>> 0;
  }
  return x.toString(36);
}
const b64e = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64d = (s: string) => {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return new TextDecoder().decode(Uint8Array.from(atob(s), (c) => c.charCodeAt(0)));
};

export interface ScoreData {
  v: 1;
  n: string;
  p: string;
  x: number;
  u: number[];
  g: number[];
  a: number;
  c: number;
  ts: number;
}

export function readCodes(text: string): { out: ScoreData[]; bad: number } {
  const out: ScoreData[] = [];
  let bad = 0;
  const re = /CSQ1\.([A-Za-z0-9_-]+)\.([0-9a-z]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (fnv(SALT + m[1]) !== m[2]) {
      bad++;
      continue;
    }
    try {
      const d = JSON.parse(b64d(m[1]));
      if (d && d.v === 1 && typeof d.n === "string" && d.n && Array.isArray(d.u)) {
        // Older codes may have fewer units; pad so every row has one cell per unit.
        while (d.u.length < UNITS.length) d.u.push(-1);
        out.push(d);
      } else bad++;
    } catch {
      bad++;
    }
  }
  const stray = (text.match(/CSQ1/g) || []).length - out.length - bad;
  return { out, bad: bad + Math.max(0, stray) };
}

export async function copyText(txt: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(txt);
    return true;
  } catch {
    return false;
  }
}

function ShareCard() {
  const { store, update } = useStudent();
  const [name, setName] = useState(store.profile?.name ?? "");
  const [period, setPeriod] = useState(store.profile?.period ?? "");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [copied, setCopied] = useState<"" | "yes" | "no">("");
  const area = useRef<HTMLTextAreaElement>(null);

  const make = () => {
    const profile = { name: name.trim(), period: period.trim() };
    update((s) => ({ ...s, profile }));
    if (!profile.name) {
      setErr("Type your name first so your teacher knows whose scores these are.");
      setCode("");
      return;
    }
    setErr("");
    let t = 0,
      c = 0;
    Object.values(store.qs).forEach((q) => {
      t += q.t;
      c += q.c;
    });
    const d: ScoreData = {
      v: 1,
      n: profile.name.slice(0, 40),
      p: profile.period.slice(0, 12),
      x: store.xp,
      u: UNITS.map((u) => store.units[u.id]?.best ?? -1),
      g: [store.games.blitz ?? 0, store.games.bugs ?? 0, store.games.order ?? 0, store.games.output ?? 0],
      a: t,
      c,
      ts: Math.floor(Date.now() / 60000),
    };
    const body = b64e(JSON.stringify(d));
    setCode(`CSQ1.${body}.${fnv(SALT + body)}`);
  };

  return (
    <section className="card">
      <h3>Send your scores to your teacher</h3>
      <p className="muted">Make a score code, then submit it the way your teacher asks (Google Classroom, Canvas, or a form). Make a new code any time your scores go up.</p>
      <div className="row" style={{ alignItems: "flex-end" }}>
        <label className="field">
          Your name (first name + last initial)
          <input type="text" maxLength={40} autoComplete="off" value={name} placeholder="Maya R." onChange={(e) => setName(e.target.value)} />
        </label>
        <label className="field" style={{ flex: "0 1 110px", minWidth: 90 }}>
          Class period
          <input type="text" maxLength={12} autoComplete="off" value={period} placeholder="3" onChange={(e) => setPeriod(e.target.value)} />
        </label>
      </div>
      <div className="row">
        <button className="btn" onClick={make}>
          Make my score code
        </button>
      </div>
      {err && <p style={{ color: "var(--bad)" }}>{err}</p>}
      {code && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <textarea ref={area} rows={4} readOnly value={code} />
          <div className="row">
            <button
              className="btn"
              onClick={async () => {
                const ok = await copyText(code);
                if (!ok) area.current?.select();
                setCopied(ok ? "yes" : "no");
                setTimeout(() => setCopied(""), 1800);
              }}
            >
              {copied === "yes" ? "Copied!" : copied === "no" ? "Selected. Press copy" : "Copy code"}
            </button>
            <span className="muted" style={{ fontSize: ".85rem" }}>
              Paste it wherever your teacher collects it.
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

/** Which TEKS are mastered: a code is mastered when every unit that teaches it is mastered. */
function TeksMap() {
  const { store } = useStudent();
  const status = (code: string) => {
    const units = UNITS.filter((u) => u.teks.includes(code));
    const bests = units.map((u) => store.units[u.id]?.best);
    if (bests.every((b) => b != null && b >= 80)) return "hi";
    if (bests.some((b) => b != null)) return "mid";
    return "";
  };
  const all = Object.values(TEKS).flatMap((s) => Object.keys(s));
  const mastered = all.filter((c) => status(c) === "hi").length;
  return (
    <section className="card">
      <div className="row between">
        <h3>Texas TEKS coverage</h3>
        <span className="num muted">
          {mastered} / {all.length} mastered
        </span>
      </div>
      <p className="muted" style={{ fontSize: ".85rem" }}>
        Every Computer Science I standard is taught in this app. A standard turns green when you master every unit that teaches it.
      </p>
      {Object.entries(TEKS).map(([strand, codes]) => (
        <div key={strand} className="teks-strand">
          <b>{strand}</b>
          <div className="chips">
            {Object.entries(codes).map(([code, desc]) => (
              <span key={code} className={"chip teks " + status(code)} title={desc}>
                {code} · {desc}
              </span>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export function ProgressView({ onTeacher }: { onTeacher: () => void }) {
  const { store, update } = useStudent();
  const [confirmReset, setConfirmReset] = useState(false);
  const L = levelOf(store.xp);
  const mastered = UNITS.filter((u) => (store.units[u.id]?.best ?? 0) >= 80).length;
  let t = 0,
    c = 0;
  Object.values(store.qs).forEach((s) => {
    t += s.t;
    c += s.c;
  });
  const counts = boxCounts(
    allQuestions().map((q) => q.id),
    store.srs ?? {},
  );
  return (
    <>
      <section className="card">
        <h2>
          Level {L.lv} · {L.rank}
        </h2>
        <p className="muted">{XP_PER_LEVEL - L.into} XP to the next level.</p>
        <div className="stats">
          <div>
            <strong className="num">
              {mastered}/{UNITS.length}
            </strong>
            <small>Units mastered</small>
          </div>
          <div>
            <strong className="num">{t}</strong>
            <small>Questions answered</small>
          </div>
          <div>
            <strong className="num">{t ? Math.round((c / t) * 100) + "%" : "—"}</strong>
            <small>Accuracy</small>
          </div>
          <div>
            <strong className="num">{liveStreak(store.streak)}</strong>
            <small>Day streak (best {store.streak?.best ?? 0})</small>
          </div>
          <div>
            <strong className="num">{counts[5] + counts[6]}</strong>
            <small>In long-term memory</small>
          </div>
        </div>
      </section>
      <section className="card">
        <h3>Unit quiz scores</h3>
        <div className="bars">
          {UNITS.map((u, i) => {
            const b = store.units[u.id]?.best;
            return (
              <div key={u.id} className="bar">
                <span>
                  {i + 1}. {u.title}
                </span>
                <span className="num muted">{b == null ? "not taken" : `${b}%${b >= 80 ? " · mastered" : ""}`}</span>
                <div className="track">
                  <div className="fill" style={{ width: `${b ?? 0}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <TeksMap />
      <ShareCard />
      <section className="card">
        <h3>Game bests</h3>
        <div className="stats">
          <div>
            <strong className="num">{store.games.blitz ?? 0}</strong>
            <small>Binary Blitz</small>
          </div>
          <div>
            <strong className="num">
              {store.games.bugs ?? 0}/{BUGS.length}
            </strong>
            <small>Bug Hunt</small>
          </div>
          <div>
            <strong className="num">
              {store.games.order ?? 0}/{ORDERS.length}
            </strong>
            <small>Code Builder</small>
          </div>
          <div>
            <strong className="num">{store.games.output ?? 0}/10</strong>
            <small>Output Lab</small>
          </div>
        </div>
      </section>
      <section className="card">
        <p className="muted">Progress is saved in this browser on this device.</p>
        {confirmReset ? (
          <div className="row">
            <span>Erase all XP and scores?</span>
            <button
              className="btn"
              style={{ background: "var(--bad)" }}
              onClick={() => {
                update((s) => ({ lang: s.lang, profile: s.profile, xp: 0, units: {}, qs: {}, games: {}, srs: {} }));
                setConfirmReset(false);
              }}
            >
              Yes, reset
            </button>
            <button className="btn ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <div className="row">
            <button className="btn ghost small" onClick={() => setConfirmReset(true)}>
              Reset progress
            </button>
          </div>
        )}
      </section>
      <p className="muted" style={{ fontSize: ".85rem" }}>
        <button className="linkbtn" onClick={onTeacher}>
          Teacher sign in
        </button>
      </p>
    </>
  );
}
