"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { loadJSON, saveJSON } from "@/lib/shared";
import { touchStreak, today } from "@/lib/srs";
import type { ByLang, Lang, StudentStore } from "@/lib/student/types";

const KEY = "cs1-quest-v1"; // same key as the original app, so saved progress carries over
const EMPTY: StudentStore = { lang: "py", xp: 0, units: {}, qs: {}, games: {}, srs: {} };

export const RANKS = ["Rookie", "Coder", "Debugger", "Builder", "Developer", "Engineer", "Architect", "Legend"];
export const XP_PER_LEVEL = 250;
export function levelOf(xp: number) {
  const lv = Math.floor(xp / XP_PER_LEVEL);
  return { lv: lv + 1, rank: RANKS[Math.min(lv, RANKS.length - 1)], into: xp % XP_PER_LEVEL };
}

/** Pick the right value for the current language. */
export function pickLang<T>(v: ByLang<T> | undefined, lang: Lang): T | undefined {
  if (v && typeof v === "object" && !Array.isArray(v) && ("py" in v || "java" in v || "all" in v)) {
    const o = v as { py?: T; java?: T; all?: T };
    return o[lang] ?? o.all;
  }
  return v as T | undefined;
}

interface Ctx {
  store: StudentStore;
  update: (fn: (s: StudentStore) => StudentStore) => void;
  addXP: (n: number) => void;
  /** Record one answered review for the streak and daily goal. */
  markStudied: () => void;
  lv: <T>(v: ByLang<T> | undefined) => T | undefined;
  langName: string;
  xpPop: number;
}
const StoreCtx = createContext<Ctx | null>(null);

export function StudentStoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<StudentStore | null>(null);
  const [xpPop, setXpPop] = useState(0);

  useEffect(() => {
    const s = loadJSON<StudentStore>(KEY, EMPTY);
    setStore({ ...EMPTY, ...s, units: s.units ?? {}, qs: s.qs ?? {}, games: s.games ?? {}, srs: s.srs ?? {} });
  }, []);

  const update = useCallback((fn: (s: StudentStore) => StudentStore) => {
    setStore((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      saveJSON(KEY, next);
      return next;
    });
  }, []);

  const addXP = useCallback(
    (n: number) => {
      update((s) => ({ ...s, xp: s.xp + n }));
      setXpPop((p) => p + 1);
    },
    [update],
  );

  const markStudied = useCallback(() => {
    update((s) => {
      const d = today();
      const daily = s.daily && s.daily.day === d ? { day: d, done: s.daily.done + 1 } : { day: d, done: 1 };
      return { ...s, streak: touchStreak(s.streak, d), daily };
    });
  }, [update]);

  if (!store) return <p className="muted" style={{ padding: 24 }}>Loading…</p>;
  const lv = <T,>(v: ByLang<T> | undefined) => pickLang(v, store.lang);
  const langName = store.lang === "py" ? "Python" : "Java";
  return (
    <StoreCtx.Provider value={{ store, update, addXP, markStudied, lv, langName, xpPop }}>{children}</StoreCtx.Provider>
  );
}

export function useStudent() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStudent must be used inside StudentStoreProvider");
  return c;
}
