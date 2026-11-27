/**
 * Spaced repetition with Leitner boxes.
 *
 * Research behind it:
 * - Spacing effect: reviews spread out over days beat cramming.
 * - Retrieval practice: answering from memory strengthens learning more than rereading.
 * - Interleaving: mixing topics in one session helps students tell problem types apart.
 *
 * Each card sits in a box (1-6). A correct answer moves it up one box and
 * pushes its next review further out. A miss sends it back to box 1, and it
 * is asked again later in the same session until it is answered correctly.
 */
export interface CardState {
  box: number; // 1..6, 0 = never seen
  due: number; // day number when it should be reviewed next
}

/** Days until the next review after landing in each box. */
export const INTERVALS = [0, 1, 2, 4, 7, 15, 30] as const;
export const MAX_BOX = 6;
export const NEW_PER_DAY = 10;
export const DAILY_GOAL = 20;

/** Local calendar day as a whole number (so "today" flips at local midnight). */
export function today(now: Date = new Date()): number {
  const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round(local.getTime() / 86_400_000);
}

export function grade(state: CardState | undefined, correct: boolean, day = today()): CardState {
  if (!correct) return { box: 1, due: day };
  const box = Math.min((state?.box ?? 0) + 1, MAX_BOX);
  return { box, due: day + INTERVALS[box] };
}

/**
 * Build today's session: every card that is due, plus a few new ones,
 * shuffled together so topics are interleaved.
 */
export function buildSession<T extends { id: string }>(
  cards: readonly T[],
  srs: Record<string, CardState>,
  opts: { day?: number; newLimit?: number; max?: number } = {},
): { session: T[]; due: number; fresh: number } {
  const day = opts.day ?? today();
  const due = cards.filter((c) => srs[c.id] && srs[c.id].box > 0 && srs[c.id].due <= day);
  const unseen = cards.filter((c) => !srs[c.id] || srs[c.id].box === 0);
  const fresh = unseen.slice(0, opts.newLimit ?? NEW_PER_DAY);
  // Most overdue first, then cap, then shuffle for interleaving.
  due.sort((a, b) => srs[a.id].due - srs[b.id].due);
  const picked = [...due, ...fresh].slice(0, opts.max ?? 30);
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return { session: picked, due: due.length, fresh: fresh.length };
}

/** Count cards in each box (index 0 = not started). */
export function boxCounts(ids: readonly string[], srs: Record<string, CardState>): number[] {
  const counts = new Array(MAX_BOX + 1).fill(0);
  for (const id of ids) counts[srs[id]?.box ?? 0]++;
  return counts;
}

export interface Streak {
  last: number;
  count: number;
  best: number;
}

/** Update the daily streak when the learner studies today. */
export function touchStreak(s: Streak | undefined, day = today()): Streak {
  if (!s) return { last: day, count: 1, best: 1 };
  if (s.last === day) return s;
  const count = s.last === day - 1 ? s.count + 1 : 1;
  return { last: day, count, best: Math.max(s.best, count) };
}

/** A streak is still alive if the learner studied today or yesterday. */
export function liveStreak(s: Streak | undefined, day = today()): number {
  if (!s) return 0;
  return s.last >= day - 1 ? s.count : 0;
}

export const SCIENCE_NOTE = [
  ["Spaced repetition", "Each question comes back right before you'd forget it: after 1, 2, 4, 7, 15, then 30 days."],
  ["Retrieval practice", "Pulling an answer from memory builds stronger recall than rereading notes."],
  ["Interleaving", "Daily Review mixes topics, which helps you recognize which tool fits each problem."],
  ["Immediate feedback", "Every answer shows why it's right or wrong, so mistakes get fixed right away."],
] as const;
