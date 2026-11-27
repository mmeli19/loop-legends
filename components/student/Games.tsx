"use client";
import { useEffect, useRef, useState } from "react";
import { pick, rand, shuffle } from "@/lib/shared";
import { BUGS, ORDERS, UNITS } from "@/lib/student/data";
import type { Lang, Unit } from "@/lib/student/types";
import { useStudent } from "./store";
import { CodeBlock, DoneCard, Feedback, Hud, ProgressBar } from "./ui";

/* ---------------- Output Lab: freshly generated code-tracing problems ---------------- */
const WORDS = ["PYTHON", "LAPTOP", "GALAXY", "PIXELS", "BINARY", "ROCKET", "CODING", "SCHOOL", "TEXAS", "MUSTANG"];

export interface Traced {
  code: string;
  ans: string;
  topic: string;
}

export function generateTrace(lang: Lang): Traced {
  const py = lang === "py";
  const t = pick(["div", "mod", "prec", "vars", "sum", "count", "idx", "slice", "len", "ifs", "dbl", "list", "listlast", "abs", "gcd"]);
  const P = (s: string) => (py ? `print(${s})` : `System.out.println(${s});`);
  let code = "";
  let ans: string | number = "";
  let topic = "";
  if (t === "div") {
    const a = rand(11, 49), b = rand(2, 7);
    code = py ? P(`${a} // ${b}`) : P(`${a} / ${b}`);
    ans = Math.floor(a / b);
    topic = py ? "Floor division" : "Integer division";
  } else if (t === "mod") {
    const a = rand(10, 60), b = rand(2, 9);
    code = P(`${a} % ${b}`);
    ans = a % b;
    topic = "Modulus";
  } else if (t === "prec") {
    const a = rand(1, 9), b = rand(2, 6), c = rand(2, 6);
    const f = pick([0, 1]);
    code = f ? P(`(${a} + ${b}) * ${c}`) : P(`${a} + ${b} * ${c}`);
    ans = f ? (a + b) * c : a + b * c;
    topic = "Order of operations";
  } else if (t === "vars") {
    const a = rand(2, 12), b = rand(2, 9);
    code = py
      ? `x = ${a}\ny = ${b}\nx = x + y\ny = x - 1\nprint(x * y)`
      : `int x = ${a};\nint y = ${b};\nx = x + y;\ny = x - 1;\nSystem.out.println(x * y);`;
    ans = (a + b) * (a + b - 1);
    topic = "Variables";
  } else if (t === "sum" || t === "count") {
    const st = rand(0, 3), step = rand(1, 3), stop = st + step * rand(2, 5) + rand(0, 1);
    let s = 0, c = 0;
    for (let i = st; i < stop; i += step) {
      s += i;
      c++;
    }
    const rng = step === 1 ? (st === 0 ? `range(${stop})` : `range(${st}, ${stop})`) : `range(${st}, ${stop}, ${step})`;
    const inc = step === 1 ? "i++" : `i += ${step}`;
    if (t === "sum") {
      code = py
        ? `total = 0\nfor i in ${rng}:\n    total += i\nprint(total)`
        : `int total = 0;\nfor (int i = ${st}; i < ${stop}; ${inc}) {\n    total += i;\n}\nSystem.out.println(total);`;
      ans = s;
      topic = "Loops: accumulator";
    } else {
      code = py
        ? `count = 0\nfor i in ${rng}:\n    count += 1\nprint(count)`
        : `int count = 0;\nfor (int i = ${st}; i < ${stop}; ${inc}) {\n    count++;\n}\nSystem.out.println(count);`;
      ans = c;
      topic = "Loops: counting";
    }
  } else if (t === "idx") {
    const w = pick(WORDS), i = rand(0, w.length - 1);
    code = py ? `word = "${w}"\nprint(word[${i}])` : `String word = "${w}";\nSystem.out.println(word.charAt(${i}));`;
    ans = w[i];
    topic = "String index";
  } else if (t === "slice") {
    const w = pick(WORDS), a = rand(0, 3), b = Math.min(w.length, a + rand(1, 3));
    code = py ? `word = "${w}"\nprint(word[${a}:${b}])` : `String word = "${w}";\nSystem.out.println(word.substring(${a}, ${b}));`;
    ans = w.slice(a, b);
    topic = py ? "String slice" : "substring";
  } else if (t === "len") {
    const w = pick(WORDS), k = rand(1, 5);
    code = py ? `word = "${w}"\nprint(len(word) + ${k})` : `String word = "${w}";\nSystem.out.println(word.length() + ${k});`;
    ans = w.length + k;
    topic = "String length";
  } else if (t === "ifs") {
    const x = rand(40, 100);
    code = py
      ? `x = ${x}\nif x >= 90:\n    print("A")\nelif x >= 80:\n    print("B")\nelif x >= 70:\n    print("C")\nelse:\n    print("F")`
      : `int x = ${x};\nif (x >= 90) {\n    System.out.println("A");\n} else if (x >= 80) {\n    System.out.println("B");\n} else if (x >= 70) {\n    System.out.println("C");\n} else {\n    System.out.println("F");\n}`;
    ans = x >= 90 ? "A" : x >= 80 ? "B" : x >= 70 ? "C" : "F";
    topic = "if / else";
  } else if (t === "dbl") {
    const n0 = rand(1, 3), f = pick([2, 3]), lim = rand(20, 150);
    let n = n0;
    while (n < lim) n *= f;
    code = py ? `n = ${n0}\nwhile n < ${lim}:\n    n *= ${f}\nprint(n)` : `int n = ${n0};\nwhile (n < ${lim}) {\n    n *= ${f};\n}\nSystem.out.println(n);`;
    ans = n;
    topic = "while loops";
  } else if (t === "list") {
    const nums = Array.from({ length: 5 }, () => rand(1, 50)), i = rand(0, 4), j = rand(0, 4);
    code = py ? `nums = [${nums.join(", ")}]\nprint(nums[${i}] + nums[${j}])` : `int[] nums = {${nums.join(", ")}};\nSystem.out.println(nums[${i}] + nums[${j}]);`;
    ans = nums[i] + nums[j];
    topic = "Lists & arrays";
  } else if (t === "listlast") {
    const nums = Array.from({ length: rand(3, 6) }, () => rand(1, 50));
    code = py
      ? `nums = [${nums.join(", ")}]\nprint(nums[-1] - nums[0])`
      : `int[] nums = {${nums.join(", ")}};\nSystem.out.println(nums[nums.length - 1] - nums[0]);`;
    ans = nums[nums.length - 1] - nums[0];
    topic = "Lists & arrays";
  } else if (t === "abs") {
    const a = rand(2, 20), b = rand(21, 40);
    code = py ? P(`abs(${a} - ${b})`) : P(`Math.abs(${a} - ${b})`);
    ans = Math.abs(a - b);
    topic = "Math library";
  } else {
    // Euclid's GCD with small numbers so it can be traced by hand.
    const g = rand(2, 9), a = g * rand(2, 9), b = g * rand(2, 9);
    let x = a, y = b;
    while (y !== 0) [x, y] = [y, x % y];
    code = py
      ? `a, b = ${a}, ${b}\nwhile b != 0:\n    a, b = b, a % b\nprint(a)`
      : `int a = ${a}, b = ${b};\nwhile (b != 0) {\n    int r = a % b;\n    a = b;\n    b = r;\n}\nSystem.out.println(a);`;
    ans = x;
    topic = "GCD algorithm";
  }
  return { code, ans: String(ans), topic };
}

const norm = (s: string) => s.trim().replace(/^["']+|["']+$/g, "").trim().toLowerCase();

export function OutputLab({ onExit }: { onExit: () => void }) {
  const { store, update, addXP, langName } = useStudent();
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [n, setN] = useState(0);
  const [right, setRight] = useState(0);
  const [cur, setCur] = useState<Traced>(() => generateTrace(store.lang));
  const [val, setVal] = useState("");
  const [checked, setChecked] = useState<null | boolean>(null);
  const inp = useRef<HTMLInputElement>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (phase === "play" && checked === null) inp.current?.focus();
    if (checked !== null) nextBtn.current?.focus();
  }, [phase, checked, n]);

  const start = () => {
    setN(0);
    setRight(0);
    setCur(generateTrace(store.lang));
    setVal("");
    setChecked(null);
    setPhase("play");
  };
  const check = () => {
    if (checked !== null) return nextQ();
    if (!val.trim()) return;
    const ok = norm(val) === norm(cur.ans);
    setChecked(ok);
    if (ok) {
      setRight((r) => r + 1);
      addXP(15);
    }
  };
  const nextQ = () => {
    if (n + 1 >= 10) {
      update((s) => ({ ...s, games: { ...s.games, output: Math.max(s.games.output ?? 0, right) } }));
      setPhase("done");
      return;
    }
    setN(n + 1);
    setCur(generateTrace(store.lang));
    setVal("");
    setChecked(null);
  };

  if (phase === "intro")
    return (
      <>
        <div className="row">
          <button className="btn ghost small" onClick={onExit}>
            ← Back
          </button>
        </div>
        <section className="card">
          <span className="eyebrow">Output Lab</span>
          <h2>What does it print?</h2>
          <p>You&apos;ll get 10 short {langName} programs, made fresh each round. Trace them in your head (or on paper) and type the exact output. +15 XP each.</p>
          <p className="muted">Covers division, modulus, order of operations, strings, if/else, loops, lists, math functions, and GCD.</p>
          <div className="row">
            <button className="btn" onClick={start}>
              Start
            </button>
          </div>
        </section>
      </>
    );
  if (phase === "done")
    return (
      <section className="card">
        <span className="eyebrow">Output Lab</span>
        <div className="big num">{right}/10</div>
        <p>{right >= 8 ? "Sharp tracing!" : "Tip: write each variable's value on paper after every line. That's a trace table."}</p>
        <div className="row">
          <button className="btn" onClick={start}>
            New round
          </button>
          <button className="btn ghost small" onClick={onExit}>
            Done
          </button>
        </div>
      </section>
    );
  return (
    <>
      <Hud onQuit={onExit}>
        <span className="num">{n + 1} / 10</span>
        <span className="num">{right} correct</span>
      </Hud>
      <ProgressBar pct={n * 10} />
      <section className="card">
        <span className="eyebrow">{cur.topic}</span>
        <p className="qtext">What is printed?</p>
        <CodeBlock src={cur.code} />
        <form
          className="answer"
          onSubmit={(e) => {
            e.preventDefault();
            check();
          }}
        >
          <input ref={inp} type="text" autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="Type the output" aria-label="Your answer" value={val} disabled={checked !== null} onChange={(e) => setVal(e.target.value)} />
          <button className="btn" type="submit">
            Check
          </button>
        </form>
        {checked !== null && (
          <>
            <Feedback ok={checked} title={checked ? "Correct! +15 XP" : "Not quite."}>
              <span>
                It prints: <code>{cur.ans}</code>
              </span>
            </Feedback>
            <div className="row" style={{ marginTop: 12 }}>
              <button className="btn" ref={nextBtn} onClick={nextQ}>
                {n < 9 ? "Next program →" : "See results"}
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}

/* ---------------- Binary Blitz ---------------- */
interface BlitzQ {
  show: string;
  label: string;
  ans: number;
  base: 2 | 10;
}
function blitzQ(score: number): BlitzQ {
  const max = score >= 8 ? 255 : score >= 4 ? 63 : 31;
  const n = rand(1, max);
  return pick([0, 1]) ? { show: n.toString(2), label: "binary → decimal", ans: n, base: 10 } : { show: String(n), label: "decimal → binary", ans: n, base: 2 };
}

export function BinaryBlitz({ onExit }: { onExit: () => void }) {
  const { store, update, addXP } = useStudent();
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [score, setScore] = useState(0);
  const [miss, setMiss] = useState(0);
  const [end, setEnd] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [q, setQ] = useState<BlitzQ>(() => blitzQ(0));
  const [val, setVal] = useState("");
  const [last, setLast] = useState("");
  const [isBest, setIsBest] = useState(false);
  const inp = useRef<HTMLInputElement>(null);
  const scoreRef = useRef(0);
  scoreRef.current = score;

  useEffect(() => {
    if (phase !== "play") return;
    const t = setInterval(() => {
      const left = end - Date.now();
      setNow(Date.now());
      if (left <= 0) {
        clearInterval(t);
        const sc = scoreRef.current;
        setIsBest(sc > (store.games.blitz ?? 0));
        update((s) => ({ ...s, games: { ...s.games, blitz: Math.max(s.games.blitz ?? 0, sc) } }));
        if (sc) addXP(sc * 5);
        setPhase("done");
      }
    }, 200);
    return () => clearInterval(t);
  }, [phase, end]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === "play") inp.current?.focus();
  }, [phase, q]);

  const start = () => {
    setScore(0);
    setMiss(0);
    setLast("");
    setVal("");
    setQ(blitzQ(0));
    setEnd(Date.now() + 60000);
    setNow(Date.now());
    setPhase("play");
  };

  if (phase === "intro")
    return (
      <>
        <div className="row">
          <button className="btn ghost small" onClick={onExit}>
            ← Back
          </button>
        </div>
        <section className="card">
          <span className="eyebrow">Binary Blitz</span>
          <h2>60 seconds. How many can you convert?</h2>
          <p>You&apos;ll see a decimal number to write in binary, or a binary number to write in decimal. Leading zeros are fine. Numbers get bigger as you score.</p>
          <CodeBlock src={"Place values: 128 64 32 16 8 4 2 1"} />
          <div className="row">
            <button className="btn" onClick={start}>
              Start
            </button>
          </div>
        </section>
      </>
    );
  if (phase === "done")
    return (
      <section className="card">
        <span className="eyebrow">{isBest ? "New best!" : "Time!"}</span>
        <div className="big num">{score}</div>
        <p>
          {score} correct, {miss} missed. +{score * 5} XP.
        </p>
        <div className="row">
          <button className="btn" onClick={start}>
            Play again
          </button>
          <button className="btn ghost small" onClick={onExit}>
            Done
          </button>
        </div>
      </section>
    );
  const left = Math.max(0, end - now);
  return (
    <>
      <Hud onQuit={onExit}>
        <span className="num">{Math.ceil(left / 1000)}s</span>
        <span className="num">Score {score}</span>
      </Hud>
      <ProgressBar pct={left / 600} />
      <section className="card" style={{ textAlign: "center", alignItems: "center" }}>
        <span className="eyebrow">{q.label}</span>
        <div className="big num" style={{ fontFamily: "var(--mono)", letterSpacing: ".05em" }}>
          {q.show}
        </div>
        <form
          className="answer"
          onSubmit={(e) => {
            e.preventDefault();
            const v = val.trim();
            if (!v) return;
            const valid = q.base === 2 ? /^[01]+$/.test(v) : /^\d+$/.test(v);
            const ok = valid && parseInt(v, q.base) === q.ans;
            const shown = q.base === 2 ? q.ans.toString(2) : String(q.ans);
            if (ok) setScore((s) => s + 1);
            else setMiss((m) => m + 1);
            setLast(`${ok ? "✓" : "✗"} ${q.show} = ${shown}`);
            setVal("");
            setQ(blitzQ(ok ? score + 1 : score));
          }}
        >
          <input ref={inp} type="text" inputMode="numeric" autoComplete="off" placeholder={q.base === 2 ? "Binary, like 1011" : "Decimal number"} aria-label="Your answer" value={val} onChange={(e) => setVal(e.target.value)} />
          <button className="btn" type="submit">
            Go
          </button>
        </form>
        <p className="muted">{last || " "}</p>
      </section>
    </>
  );
}

/* ---------------- Bug Hunt ---------------- */
export function BugHunt({ onExit }: { onExit: () => void }) {
  const { store, update, addXP, lv } = useStudent();
  const [list, setList] = useState(() => shuffle(BUGS));
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const nextBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (picked !== null) nextBtn.current?.focus();
  }, [picked]);

  const restart = () => {
    setList(shuffle(BUGS));
    setI(0);
    setRight(0);
    setPicked(null);
    setDone(false);
  };
  if (done)
    return <DoneCard name="Bug Hunt" big={`${right}/${list.length}`} label="bugs fixed" onAgain={restart} onDone={onExit} />;

  const b = list[i];
  const lines = b[store.lang];
  const bug = b.bug[store.lang];
  return (
    <>
      <Hud onQuit={onExit}>
        <span className="num">
          {i + 1} / {list.length}
        </span>
        <span className="num">{right} found</span>
      </Hud>
      <section className="card">
        <span className="eyebrow">Bug Hunt · tap the broken line</span>
        <p className="qtext">{b.goal}</p>
        <div className="lines">
          {lines.map((ln, k) => {
            let cls = "line";
            if (picked !== null && k === bug) cls += " right";
            else if (picked !== null && k === picked) cls += " wrong";
            return (
              <button
                key={k}
                className={cls}
                disabled={picked !== null || ln === ""}
                onClick={() => {
                  setPicked(k);
                  if (k === bug) {
                    setRight((r) => r + 1);
                    addXP(20);
                  }
                }}
              >
                <span className="ln">{k + 1}</span>
                {ln || " "}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <>
            <Feedback ok={picked === bug} title={picked === bug ? "Found it! +20 XP" : `The bug is on line ${bug + 1}.`}>
              <span>{lv(b.e)}</span>
              <span>
                Fix: <code>{lv(b.fix)}</code>
              </span>
            </Feedback>
            <div className="row" style={{ marginTop: 12 }}>
              <button
                className="btn"
                ref={nextBtn}
                onClick={() => {
                  if (i + 1 < list.length) {
                    setI(i + 1);
                    setPicked(null);
                  } else {
                    update((s) => ({ ...s, games: { ...s.games, bugs: Math.max(s.games.bugs ?? 0, right) } }));
                    setDone(true);
                  }
                }}
              >
                {i + 1 < list.length ? "Next bug →" : "See results"}
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}

/* ---------------- Code Builder (Parsons problems) ---------------- */
interface Piece {
  t: string;
  k: number;
}
function scramble(lines: string[]): Piece[] {
  let pool: Piece[];
  do pool = shuffle(lines.map((t, k) => ({ t, k })));
  while (lines.length > 2 && pool.every((p, k) => p.t === lines[k]));
  return pool;
}

export function CodeBuilder({ onExit }: { onExit: () => void }) {
  const { store, update, addXP, langName } = useStudent();
  const [list, setList] = useState(() => shuffle(ORDERS));
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [pool, setPool] = useState<Piece[]>(() => scramble(list[0][store.lang]));
  const [built, setBuilt] = useState<Piece[]>([]);
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);

  const target = list[i][store.lang];
  const ok = built.length === target.length && built.every((p, k) => p.t === target[k]);

  const restart = () => {
    const l = shuffle(ORDERS);
    setList(l);
    setI(0);
    setRight(0);
    setPool(scramble(l[0][store.lang]));
    setBuilt([]);
    setChecked(false);
    setDone(false);
  };
  if (done)
    return <DoneCard name="Code Builder" big={`${right}/${list.length}`} label="programs built correctly on the first try" onAgain={restart} onDone={onExit} />;

  return (
    <>
      <Hud onQuit={onExit}>
        <span className="num">
          {i + 1} / {list.length}
        </span>
        <span className="num">{right} built</span>
      </Hud>
      <section className="card">
        <span className="eyebrow">Code Builder · {langName}</span>
        <p className="qtext">{list[i].goal}</p>
        <span className="eyebrow">Your program</span>
        <div className="lines slot">
          {built.length ? (
            built.map((p, k) => (
              <button
                key={k}
                className={"line" + (checked ? (p.t === target[k] ? " right" : " wrong") : "")}
                disabled={checked}
                onClick={() => {
                  setPool([...pool, p]);
                  setBuilt(built.filter((_, j) => j !== k));
                }}
              >
                <span className="ln">{k + 1}</span>
                {p.t}
              </button>
            ))
          ) : (
            <span className="empty">Tap lines below to build your program here.</span>
          )}
        </div>
        {pool.length > 0 && (
          <>
            <span className="eyebrow">Lines to use</span>
            <div className="pool">
              {pool.map((p, k) => (
                <button
                  key={k}
                  className="line"
                  onClick={() => {
                    setBuilt([...built, p]);
                    setPool(pool.filter((_, j) => j !== k));
                  }}
                >
                  {p.t}
                </button>
              ))}
            </div>
          </>
        )}
        {!checked ? (
          <div className="row">
            <button
              className="btn"
              disabled={pool.length > 0}
              onClick={() => {
                setChecked(true);
                if (ok) {
                  setRight((r) => r + 1);
                  addXP(25);
                }
              }}
            >
              Run it
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                setPool([...pool, ...built]);
                setBuilt([]);
              }}
            >
              Clear
            </button>
          </div>
        ) : (
          <>
            <Feedback ok={ok} title={ok ? "It runs! +25 XP" : "Not in the right order yet."}>
              {!ok && <span>Here&apos;s a working version:</span>}
            </Feedback>
            {!ok && <CodeBlock src={target.join("\n")} />}
            <div className="row" style={{ marginTop: 12 }}>
              <button
                className="btn"
                onClick={() => {
                  if (i + 1 < list.length) {
                    setI(i + 1);
                    setPool(scramble(list[i + 1][store.lang]));
                    setBuilt([]);
                    setChecked(false);
                  } else {
                    update((s) => ({ ...s, games: { ...s.games, order: Math.max(s.games.order ?? 0, right) } }));
                    setDone(true);
                  }
                }}
              >
                {i + 1 < list.length ? "Next program →" : "See results"}
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}

/* ---------------- Term Match ---------------- */
interface Pair {
  t: string;
  d: string;
  i: number;
}
function makePairs(unit: Unit | null): Pair[] {
  const src = unit ? unit.terms : UNITS.flatMap((u) => u.terms);
  return shuffle(src)
    .slice(0, Math.min(5, src.length))
    .map(([t, d], i) => ({ t, d, i }));
}

export function TermMatch({ unit, onExit }: { unit: Unit | null; onExit: () => void }) {
  const { store, update, addXP } = useStudent();
  const [pairs, setPairs] = useState(() => makePairs(unit));
  const [left, setLeft] = useState(() => shuffle(pairs));
  const [right, setRight] = useState(() => shuffle(pairs));
  const [sel, setSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<Set<number>>(() => new Set());
  const [miss, setMiss] = useState(0);
  const [shake, setShake] = useState<number | null>(null);
  const [start, setStart] = useState(() => Date.now());
  const [secs, setSecs] = useState<number | null>(null);

  const restart = () => {
    const p = makePairs(unit);
    setPairs(p);
    setLeft(shuffle(p));
    setRight(shuffle(p));
    setSel(null);
    setMatched(new Set());
    setMiss(0);
    setStart(Date.now());
    setSecs(null);
  };

  if (secs !== null)
    return (
      <DoneCard
        name="Term Match"
        big={`${secs}s`}
        label={`All ${pairs.length} pairs matched with ${miss} wrong ${miss === 1 ? "guess" : "guesses"}. +20 XP`}
        onAgain={restart}
        onDone={onExit}
      />
    );

  return (
    <>
      <Hud onQuit={onExit}>
        <span className="num">
          {matched.size} / {pairs.length} matched
        </span>
        <span className="num">{miss} wrong</span>
      </Hud>
      <section className="card">
        <span className="eyebrow">{unit ? unit.title : "All units"}</span>
        <p className="muted">Tap a term, then tap its meaning.</p>
        <div className="match">
          <div className="col">
            {left.map((p) => (
              <button key={p.i} className={"mbtn" + (matched.has(p.i) ? " ok" : "") + (sel === p.i ? " sel" : "")} disabled={matched.has(p.i)} onClick={() => setSel(p.i)}>
                <b>{p.t}</b>
              </button>
            ))}
          </div>
          <div className="col">
            {right.map((p) => (
              <button
                key={p.i}
                className={"mbtn" + (matched.has(p.i) ? " ok" : "") + (shake === p.i ? " no" : "")}
                disabled={matched.has(p.i)}
                onClick={() => {
                  if (sel == null) return;
                  if (sel === p.i) {
                    const m = new Set(matched).add(p.i);
                    setMatched(m);
                    setSel(null);
                    if (m.size === pairs.length) {
                      const s = Math.round((Date.now() - start) / 1000);
                      if (!unit && (!store.games.match || s < store.games.match)) update((st) => ({ ...st, games: { ...st.games, match: s } }));
                      addXP(20);
                      setSecs(s);
                    }
                  } else {
                    setMiss((x) => x + 1);
                    setShake(p.i);
                    setTimeout(() => setShake(null), 450);
                  }
                }}
              >
                {p.d}
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
