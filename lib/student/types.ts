export type Lang = "py" | "java";
/** A value that can differ by language, or be shared via `all`. */
export type ByLang<T> = T | { py?: T; java?: T; all?: T };

export interface LessonSection {
  h: string;
  p?: ByLang<string>;
  list?: string[];
  code?: ByLang<string>;
  after?: ByLang<string>;
}

export interface Question {
  id: string;
  q: ByLang<string>;
  c: ByLang<string[]>;
  a: ByLang<number>;
  e: ByLang<string>;
  code?: ByLang<string>;
  /** Added at runtime: the unit this question belongs to. */
  unit?: string;
}

export interface Unit {
  id: string;
  title: string;
  blurb: string;
  lesson: LessonSection[];
  terms: [string, string][];
  qs: Question[];
  /** Texas CS I TEKS student expectations this unit covers, e.g. "4K". */
  teks: string[];
}

export interface Bug {
  goal: string;
  py: string[];
  java: string[];
  bug: { py: number; java: number };
  fix: ByLang<string>;
  e: ByLang<string>;
}

export interface OrderPuzzle {
  goal: string;
  py: string[];
  java: string[];
}

export interface StudentStore {
  lang: Lang;
  xp: number;
  units: Record<string, { read?: boolean; best?: number }>;
  qs: Record<string, { c: number; t: number }>;
  games: { blitz?: number; bugs?: number; order?: number; output?: number; match?: number };
  profile?: { name: string; period: string };
  /** Spaced-repetition state per question id. */
  srs?: Record<string, import("../srs").CardState>;
  /** Daily streak tracking (day numbers since epoch, local time). */
  streak?: { last: number; count: number; best: number };
  /** Reviews completed per day number, for the daily goal. */
  daily?: { day: number; done: number };
}
