import content from "./content.json";
import type { Domain, DomainId, ExamQuestion, Flashcard } from "./types";

export const DOMAINS = content.DOMAINS as unknown as Record<DomainId, Domain>;
export const QUESTIONS = content.Q as unknown as ExamQuestion[];
export const CARDS = content.CARDS as unknown as Flashcard[];
export const DOMAIN_IDS: DomainId[] = [1, 2, 3, 4];
export const ROMAN = ["I", "II", "III", "IV"] as const;
