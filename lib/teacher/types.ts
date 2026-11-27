export type DomainId = 1 | 2 | 3 | 4;

export interface Domain {
  name: string;
  short: string;
  pct: number;
  color: string;
}

export interface ExamQuestion {
  id: string;
  d: DomainId;
  q: string;
  c: string[];
  a: number;
  e: string;
  code?: string;
}

export interface Flashcard {
  d: DomainId;
  t: string;
  b: string;
}

export interface TeacherStore {
  best: number;
  seen: Record<string, { c: number; t: number }>;
  missed: Record<string, 1>;
  timer: boolean;
}
