/**
 * Normalisierung — aus dem, was ein Gast sagt, wird ein einheitliches Objekt.
 *
 * Jeder Kanal liefert hier ab. Was nicht normalisierbar ist, wird zu null und
 * damit zu einem fehlenden Pflichtfeld — nie zu einem stillen Fehlwert.
 */

import type { Customer, RawInbound, RequestDetails, TenantConfig } from "./types.ts";
import { parseDate, parseTimeToMinutes, type CalendarDate } from "./time.ts";

const MAX_TEXT = 2_000;
const MAX_NAME = 120;
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, maxLength);
}

export function normalizeName(value: unknown): string | null {
  const text = cleanText(value, MAX_NAME);
  // Ein Agent, der nichts verstanden hat, liefert gern Platzhalter.
  if (text === null) return null;
  const lowered = text.toLowerCase();
  if (lowered === "null" || lowered === "undefined" || lowered === "unbekannt") {
    return null;
  }
  return text;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const candidate = value.trim().toLowerCase();
  if (!EMAIL_PATTERN.test(candidate) || candidate.length > 254) return null;
  return candidate;
}

/**
 * Telefonnummer → E.164.
 *
 * Bewusst schmal gehalten: erkannt werden internationale Schreibweisen (+49…,
 * 0049…) und nationale mit Amtsvorwahl (0…). Alles andere wird mit der
 * Ländervorwahl des Mandanten ergänzt.
 *
 * Das ersetzt keine vollständige Rufnummern-Bibliothek und validiert
 * insbesondere keine landesspezifischen Nummernpläne — es normalisiert das
 * Format. Sobald Mandanten außerhalb des DACH-Raums dazukommen, gehört hier
 * libphonenumber hin.
 */
export function normalizePhone(value: unknown, defaultDialCode: string): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (raw.length === 0) return null;

  const hasPlus = raw.startsWith("+");
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 0) return null;

  let e164: string;
  if (hasPlus) {
    e164 = `+${digits}`;
  } else if (digits.startsWith("00")) {
    e164 = `+${digits.slice(2)}`;
  } else if (digits.startsWith("0")) {
    e164 = `${defaultDialCode}${digits.replace(/^0+/, "")}`;
  } else {
    e164 = `${defaultDialCode}${digits}`;
  }

  return /^\+[1-9]\d{7,14}$/.test(e164) ? e164 : null;
}

export function normalizePartySize(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded = Math.trunc(value);
    return rounded > 0 && rounded <= 10_000 ? rounded : null;
  }
  if (typeof value === "string") {
    const match = /\d+/.exec(value);
    if (!match) return null;
    return normalizePartySize(Number(match[0]));
  }
  return null;
}

export function normalizeConfidence(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(1, Math.max(0, value));
}

/** Flach kopieren, Prototype-Pollution ausschließen, Strings begrenzen. */
export function normalizeDetails(value: RequestDetails | undefined): RequestDetails {
  const result: RequestDetails = {};
  if (!value || typeof value !== "object") return result;

  for (const [key, raw] of Object.entries(value)) {
    if (FORBIDDEN_KEYS.has(key)) continue;
    if (key === "dietaryNotes") continue;
    if (typeof raw === "string") {
      const text = cleanText(raw, MAX_TEXT);
      if (text !== null) result[key] = text;
    } else if (
      typeof raw === "number" ||
      typeof raw === "boolean" ||
      raw === null
    ) {
      result[key] = raw;
    }
    // Verschachtelte Objekte bleiben draußen: unbegrenzte Tiefe aus einer
    // LLM-Ausgabe gehört nicht ungeprüft in die Datenbank.
  }

  const notes = normalizeDietaryNotes(value.dietaryNotes);
  if (notes.length > 0) result.dietaryNotes = notes;
  return result;
}

export function normalizeDietaryNotes(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  for (const entry of value) {
    const text = cleanText(entry, 200);
    if (text !== null) seen.add(text);
    if (seen.size >= 20) break;
  }
  return [...seen];
}

export interface NormalizedInbound {
  customer: Customer;
  date: CalendarDate | null;
  /** Minuten seit Mitternacht, Ortszeit. */
  minutes: number | null;
  partySize: number | null;
  details: RequestDetails;
  confidence: number | null;
  locale: string;
}

export function normalizeInbound(
  input: RawInbound,
  config: TenantConfig,
): NormalizedInbound {
  return {
    customer: {
      name: normalizeName(input.customer?.name),
      phone: normalizePhone(input.customer?.phone, config.defaultDialCode),
      email: normalizeEmail(input.customer?.email),
    },
    date: typeof input.date === "string" ? parseDate(input.date) : null,
    minutes: typeof input.time === "string" ? parseTimeToMinutes(input.time) : null,
    partySize: normalizePartySize(input.partySize),
    details: normalizeDetails(input.details),
    confidence: normalizeConfidence(input.confidence),
    locale: cleanText(input.locale, 16) ?? config.defaultLocale,
  };
}
