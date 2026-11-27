"use client";
import { useEffect, useRef, useState } from "react";
import { loadJSON, saveJSON } from "@/lib/shared";
import { BUGS, UNITS } from "@/lib/student/data";
import { copyText, fnv, readCodes, type ScoreData } from "./Progress";

/**
 * Teacher mode inside the student app: paste student score codes to see a
 * leaderboard and score table. Everything stays in this browser.
 */
const TKEY = "cs1-quest-teacher-v1";
interface TeacherData {
  pin?: string;
  students: Record<string, ScoreData>;
}
const pinHash = (p: string) => fnv("cs1q-pin|" + p);
const mastered = (d: ScoreData) => d.u.filter((b) => b >= 80).length;
const acc = (d: ScoreData) => (d.a ? Math.round((d.c / d.a) * 100) : null);
const lvl = (x: number) => Math.floor(x / 250) + 1;
const cellClass = (b: number) => (b < 0 ? "c" : b >= 80 ? "c hi" : b >= 50 ? "c mid" : "c lo");

function csv(rows: ScoreData[]) {
  const esc = (v: unknown) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = ["Name", "Period", "Level", "XP", "Units mastered", "Accuracy %", "Questions answered", ...UNITS.map((_, i) => `Unit ${i + 1} %`), "Binary Blitz", "Bug Hunt", "Code Builder", "Output Lab", "Code made"];
  const lines = [
    head,
    ...rows.map((d) => [d.n, d.p || "", lvl(d.x), d.x, mastered(d), acc(d) ?? "", d.a, ...d.u.map((b) => (b < 0 ? "" : b)), d.g[0], d.g[1], d.g[2], d.g[3], new Date(d.ts * 60000).toLocaleString()]),
  ];
  return lines.map((r) => r.map(esc).join(",")).join("\n");
}

function PinField({ id, label, auto, value, onChange, inputRef }: { id: string; label: string; auto: string; value: string; onChange: (v: string) => void; inputRef?: React.Ref<HTMLInputElement> }) {
  return (
    <label className="field" style={{ maxWidth: 260 }}>
      {label}
      <input id={id} ref={inputRef} type="password" inputMode="numeric" pattern="[0-9]*" maxLength={8} autoComplete={auto} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export function ClassDashboard({ onExit }: { onExit: () => void }) {
  const [T, setT] = useState<TeacherData>(() => loadJSON<TeacherData>(TKEY, { students: {} }));
  const [unlocked, setUnlocked] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [msg, setMsg] = useState("");
  const [fails, setFails] = useState(0);
  const [wait, setWait] = useState(0);
  const [period, setPeriod] = useState("all");
  const [sort, setSort] = useState<"n" | "x" | "m" | "a">("x");
  const [paste, setPaste] = useState("");
  const [addMsg, setAddMsg] = useState("");
  const [big, setBig] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmRm, setConfirmRm] = useState<string | null>(null);
  const [csvLabel, setCsvLabel] = useState("Copy as spreadsheet (CSV)");
  const firstInput = useRef<HTMLInputElement>(null);

  useEffect(() => firstInput.current?.focus(), [forgot, unlocked]);
  const save = (next: TeacherData) => {
    setT(next);
    saveJSON(TKEY, next);
  };

  /* ---------- sign in ---------- */
  if (!unlocked) {
    return (
      <>
        <div className="row between">
          <button className="btn ghost small" onClick={onExit}>
            ← Back
          </button>
          <span className="eyebrow">Teacher sign in</span>
        </div>
        {!T.pin ? (
          <section className="card">
            <h2>Set up teacher mode</h2>
            <p>Teacher mode opens the Class Dashboard, where you paste student score codes and see the leaderboard and score table.</p>
            <p className="muted">Your PIN keeps students out of the dashboard on this device. Use one your students don&apos;t know.</p>
            <form
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (!/^\d{4,8}$/.test(p1.trim())) return setMsg("Use 4 to 8 digits, numbers only.");
                if (p1.trim() !== p2.trim()) return setMsg("The two PINs don't match. Type them again.");
                save({ ...T, pin: pinHash(p1.trim()) });
                setUnlocked(true);
                setMsg("");
              }}
            >
              <PinField id="pin-new" label="Create a PIN (4–8 digits)" auto="new-password" value={p1} onChange={setP1} inputRef={firstInput} />
              <PinField id="pin-confirm" label="Type it again" auto="new-password" value={p2} onChange={setP2} />
              <p role="status" style={{ color: "var(--bad)", minHeight: "1.4em" }}>
                {msg}
              </p>
              <div className="row">
                <button className="btn" type="submit">
                  Create PIN and open dashboard
                </button>
              </div>
            </form>
          </section>
        ) : forgot ? (
          <section className="card">
            <h2>Reset teacher mode?</h2>
            <p>This removes the PIN and erases the class list saved on this device. Students would need to send their score codes again.</p>
            <div className="row">
              <button
                className="btn"
                style={{ background: "var(--bad)" }}
                onClick={() => {
                  save({ students: {} });
                  setForgot(false);
                }}
              >
                Erase and reset
              </button>
              <button className="btn ghost" onClick={() => setForgot(false)}>
                Cancel
              </button>
            </div>
          </section>
        ) : (
          <section className="card">
            <h2>Enter your teacher PIN</h2>
            <form
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
              onSubmit={(e) => {
                e.preventDefault();
                const w = Math.ceil((wait - Date.now()) / 1000);
                if (w > 0) return setMsg(`Too many tries. Wait ${w} seconds.`);
                if (pinHash(p1.trim()) === T.pin) {
                  setFails(0);
                  setMsg("");
                  setUnlocked(true);
                  return;
                }
                setP1("");
                if (fails + 1 >= 5) {
                  setFails(0);
                  setWait(Date.now() + 30000);
                  setMsg("Too many tries. Wait 30 seconds.");
                } else {
                  setFails(fails + 1);
                  setMsg("That PIN isn't right.");
                }
              }}
            >
              <PinField id="pin-enter" label="Teacher PIN" auto="current-password" value={p1} onChange={setP1} inputRef={firstInput} />
              <p role="status" style={{ color: "var(--bad)", minHeight: "1.4em" }}>
                {msg}
              </p>
              <div className="row">
                <button className="btn" type="submit">
                  Open dashboard
                </button>
                <button className="linkbtn" type="button" onClick={() => setForgot(true)}>
                  Forgot PIN?
                </button>
              </div>
            </form>
          </section>
        )}
      </>
    );
  }

  /* ---------- dashboard ---------- */
  const all = Object.values(T.students);
  const periods = [...new Set(all.map((r) => r.p || "—"))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const per = period !== "all" && !periods.includes(period) ? "all" : period;
  let rows = all.filter((r) => per === "all" || (r.p || "—") === per);
  rows = rows.sort((a, b) =>
    sort === "n" ? a.n.localeCompare(b.n) : sort === "m" ? mastered(b) - mastered(a) || b.x - a.x : sort === "a" ? (acc(b) ?? -1) - (acc(a) ?? -1) : b.x - a.x || mastered(b) - mastered(a),
  );
  const byXP = rows.slice().sort((a, b) => b.x - a.x);

  if (big)
    return (
      <>
        <div className="row between">
          <button className="btn ghost small" onClick={() => setBig(false)}>
            ← Exit big screen
          </button>
          <span className="eyebrow">{per === "all" ? "All periods" : `Period ${per}`}</span>
        </div>
        <h1>Class Leaderboard</h1>
        <ol className="lb huge">
          {byXP.slice(0, 10).map((d, i) => (
            <li key={d.n + d.p}>
              <span className="rk">{i + 1}</span>
              <span className="nm">{d.n}</span>
              <span className="num">{d.x} XP</span>
            </li>
          ))}
        </ol>
      </>
    );

  const addCodes = () => {
    if (!paste.trim()) return;
    const { out, bad } = readCodes(paste);
    const students = { ...T.students };
    let added = 0,
      updated = 0,
      older = 0;
    for (const d of out) {
      const key = d.n.toLowerCase() + "|" + (d.p || "").toLowerCase();
      const cur = students[key];
      if (!cur) {
        students[key] = d;
        added++;
      } else if (d.ts >= cur.ts) {
        students[key] = d;
        updated++;
      } else older++;
    }
    save({ ...T, students });
    const parts: string[] = [];
    if (added) parts.push(`${added} added`);
    if (updated) parts.push(`${updated} updated`);
    if (older) parts.push(`${older} skipped (an older code than the one saved)`);
    if (bad) parts.push(`${bad} couldn't be read. Ask ${bad === 1 ? "that student" : "those students"} to copy the code again, since it was cut off or changed`);
    setAddMsg(parts.length ? parts.join(" · ") + "." : "No score codes found. Codes start with CSQ1.");
    setPaste("");
  };

  const avg = UNITS.map((_, i) => {
    const v = rows.map((r) => r.u[i]).filter((b) => b >= 0);
    return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : -1;
  });
  const lowest = avg
    .map((a, i) => ({ a, i }))
    .filter((o) => o.a >= 0)
    .sort((x, y) => x.a - y.a)
    .slice(0, 3);
  let ta = 0,
    tc = 0;
  rows.forEach((r) => {
    ta += r.a;
    tc += r.c;
  });
  const totAcc = ta ? Math.round((tc / ta) * 100) : null;
  const SortBtn = ({ k, label }: { k: typeof sort; label: string }) => (
    <button aria-pressed={sort === k} onClick={() => setSort(k)} title="Sort">
      {label}
    </button>
  );

  return (
    <>
      <div className="row between">
        <button
          className="btn ghost small"
          onClick={() => {
            setUnlocked(false);
            onExit();
          }}
        >
          Lock &amp; exit
        </button>
        <span className="eyebrow">Teacher mode</span>
      </div>
      <h2 style={{ fontSize: "1.5rem" }}>Class Dashboard</h2>
      <section className="card">
        <h3>Add score codes</h3>
        <p className="muted">Students open Progress, make a score code, and submit it. Paste everything they sent below. A newer code from the same student replaces the old one.</p>
        <textarea rows={4} placeholder="Paste student score codes here. One or many at once, in any format." value={paste} onChange={(e) => setPaste(e.target.value)} />
        <div className="row">
          <button className="btn" onClick={addCodes}>
            Add codes
          </button>
        </div>
        {addMsg && <p role="status">{addMsg}</p>}
      </section>

      {!all.length ? (
        <section className="card">
          <h3>No students yet</h3>
          <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            <li>Share this page&apos;s link with your class.</li>
            <li>Students practice, then go to Progress → Make my score code → Copy.</li>
            <li>They submit the code (an assignment, a form, or a chat message).</li>
            <li>Paste the codes above. The leaderboard and score table fill in here.</li>
          </ol>
          <p className="muted">Everything you add stays in this browser only. Student data isn&apos;t sent anywhere.</p>
        </section>
      ) : (
        <>
          <div className="chips">
            <button className="chip" aria-pressed={per === "all"} onClick={() => setPeriod("all")}>
              All ({all.length})
            </button>
            {periods.map((p) => (
              <button key={p} className="chip" aria-pressed={per === p} onClick={() => setPeriod(p)}>
                {p === "—" ? "No period" : `Period ${p}`}
              </button>
            ))}
          </div>
          <section className="card">
            <div className="row between">
              <h3>Leaderboard</h3>
              <button className="btn ghost small" onClick={() => setBig(true)}>
                Big screen
              </button>
            </div>
            <ol className="lb">
              {byXP.slice(0, 10).map((d, i) => (
                <li key={d.n + d.p}>
                  <span className="rk">{i + 1}</span>
                  <span className="nm">{d.n + (per === "all" && d.p ? ` · P${d.p}` : "")}</span>
                  <span className="num muted">
                    {d.x} XP · {mastered(d)}/{UNITS.length}
                  </span>
                </li>
              ))}
            </ol>
          </section>
          <section className="card">
            <h3>Class snapshot</h3>
            <div className="stats">
              <div>
                <strong className="num">{rows.length}</strong>
                <small>Students</small>
              </div>
              <div>
                <strong className="num">{totAcc == null ? "—" : totAcc + "%"}</strong>
                <small>Avg accuracy</small>
              </div>
              <div>
                <strong className="num">{rows.length ? (rows.reduce((a, r) => a + mastered(r), 0) / rows.length).toFixed(1) : "0"}</strong>
                <small>Avg units mastered</small>
              </div>
            </div>
            {lowest.length ? (
              <p>
                <b>Lowest unit averages: </b>
                {lowest.map((o) => `Unit ${o.i + 1} ${UNITS[o.i].title} (${o.a}%)`).join(" · ")}
              </p>
            ) : (
              <p className="muted">No unit quizzes taken yet.</p>
            )}
          </section>
          <section className="card">
            <div className="row between">
              <h3>Scores</h3>
              <button
                className="btn ghost small"
                onClick={async () => {
                  const ok = await copyText(csv(rows));
                  setCsvLabel(ok ? "Copied!" : "Copy failed");
                  setTimeout(() => setCsvLabel("Copy as spreadsheet (CSV)"), 1800);
                }}
              >
                {csvLabel}
              </button>
            </div>
            <p className="muted" style={{ fontSize: ".85rem" }}>
              Unit cells show each student&apos;s best quiz score. Green is mastered (80%+), yellow is 50–79%, red is under 50%, and – means not taken.
            </p>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      <SortBtn k="n" label="Student" />
                    </th>
                    <th>Per.</th>
                    <th>
                      <SortBtn k="x" label="XP" />
                    </th>
                    <th>
                      <SortBtn k="m" label="Mastered" />
                    </th>
                    <th>
                      <SortBtn k="a" label="Accuracy" />
                    </th>
                    {UNITS.map((u, i) => (
                      <th key={u.id} title={u.title}>
                        U{i + 1}
                      </th>
                    ))}
                    <th>Blitz</th>
                    <th>Bugs</th>
                    <th>Updated</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => {
                    const key = d.n.toLowerCase() + "|" + (d.p || "").toLowerCase();
                    return (
                      <tr key={key}>
                        <td>
                          <b>{d.n}</b>
                        </td>
                        <td>{d.p || "—"}</td>
                        <td className="num">
                          {d.x} · L{lvl(d.x)}
                        </td>
                        <td className="c">
                          {mastered(d)}/{UNITS.length}
                        </td>
                        <td className="c">{acc(d) == null ? "—" : acc(d) + "%"}</td>
                        {d.u.slice(0, UNITS.length).map((b, i) => (
                          <td key={i} className={cellClass(b)}>
                            {b < 0 ? "–" : b}
                          </td>
                        ))}
                        <td className="c">{d.g[0]}</td>
                        <td className="c">
                          {d.g[1]}/{BUGS.length}
                        </td>
                        <td className="muted">{new Date(d.ts * 60000).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</td>
                        <td>
                          <button
                            className="btn ghost small"
                            onClick={() => {
                              if (confirmRm === key) {
                                const students = { ...T.students };
                                delete students[key];
                                save({ ...T, students });
                                setConfirmRm(null);
                              } else setConfirmRm(key);
                            }}
                          >
                            {confirmRm === key ? "Confirm remove" : "Remove"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="avg">
                    <td>Class average</td>
                    <td />
                    <td />
                    <td />
                    <td />
                    {avg.map((a, i) => (
                      <td key={i} className={cellClass(a)}>
                        {a < 0 ? "–" : a}
                      </td>
                    ))}
                    <td />
                    <td />
                    <td />
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
          <section className="card">
            <p className="muted">This class list is saved only in this browser. To keep a backup, use Copy as spreadsheet and paste it into Sheets or Excel.</p>
            {confirmClear ? (
              <div className="row">
                <span>Remove every student from this dashboard?</span>
                <button
                  className="btn"
                  style={{ background: "var(--bad)" }}
                  onClick={() => {
                    save({ ...T, students: {} });
                    setConfirmClear(false);
                    setAddMsg("");
                  }}
                >
                  Yes, clear
                </button>
                <button className="btn ghost" onClick={() => setConfirmClear(false)}>
                  Cancel
                </button>
              </div>
            ) : (
              <div className="row">
                <button className="btn ghost small" onClick={() => setConfirmClear(true)}>
                  Clear class list
                </button>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
