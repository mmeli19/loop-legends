import content from "./content.json";
import type { Bug, OrderPuzzle, Unit } from "./types";

export const UNITS = content.UNITS as unknown as Unit[];
export const BUGS = content.BUGS as unknown as Bug[];
export const ORDERS = content.ORDERS as unknown as OrderPuzzle[];

/** Texas CS I TEKS grouped by strand: { strand: { code: description } }. */
export const TEKS = content.TEKS as Record<string, Record<string, string>>;
