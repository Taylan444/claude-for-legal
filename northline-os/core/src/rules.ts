/**
 * Fachregeln — Pflichtfelder, Öffnungszeiten, Eskalation.
 *
 * Alles hier ist reine Funktion: Eingabe rein, Befund raus. Keine Datenbank,
 * kein Netzwerk, keine Uhr außer der übergebenen. Das macht die Regeln
 * vollständig testbar, und Tests sind der einzige Weg, bei Öffnungszeiten und
 * Sommerzeit sicher zu sein.
 */

import type {
  Issue,
  RequestStatus,
  RequestType,
  TenantConfig,
} from "./types.ts";
import type { NormalizedInbound } from "./normalize.ts";
import {
  daysBetween,
  formatDate,
  partsInZone,
  weekdayOf,
  zonedTimeToUtc,
  type CalendarDate,
} from "./time.ts";

/** Pflichtfeld-Pfade, wie sie in der Mandanten-Konfiguration stehen. */
const FIELD_READERS: Record<string, (n: NormalizedInbound) => unknown> = {
  "customer.name": (n) => n.customer.name,
  "customer.phone": (n) => n.customer.phone,
  "customer.email": (n) => n.customer.email,
  date: (n) => n.date,
  time: (n) => n.minutes,
  partySize: (n) => n.partySize,
};

export function findMissingFields(
  normalized: NormalizedInbound,
  type: RequestType,
  config: TenantConfig,
): string[] {
  const required = config.booking.requiredFields[type] ?? [];
  const missing: string[] = [];
  for (const field of required) {
    const read = FIELD_READERS[field];
    if (!read) continue; // Unbekanntes Feld in der Konfiguration ignorieren.
    const value = read(normalized);
    if (value === null || value === undefined) missing.push(field);
  }
  return missing;
}

/** Liegt die Ortszeit in einem Öffnungsintervall des Wochentags? */
export function isWithinOpeningHours(
  date: CalendarDate,
  minutes: number,
  config: TenantConfig,
): boolean {
  const ranges = config.openingHours[weekdayOf(date)] ?? [];
  return ranges.some((range) => minutes >= range.from && minutes < range.to);
}

export interface RuleInput {
  normalized: NormalizedInbound;
  type: RequestType;
  config: TenantConfig;
  now: Date;
  escalateRequested: boolean;
}

export interface RuleOutcome {
  issues: Issue[];
  /** Wunschtermin als UTC-Instant, null wenn Datum oder Zeit fehlt. */
  requestedAt: Date | null;
}

/** Alle Textfelder, in denen nach Eskalationsbegriffen gesucht wird. */
function searchableText(normalized: NormalizedInbound): string {
  const parts: string[] = [];
  for (const value of Object.values(normalized.details)) {
    if (typeof value === "string") parts.push(value);
  }
  const notes = normalized.details.dietaryNotes;
  if (Array.isArray(notes)) parts.push(...notes);
  return parts.join(" ").toLowerCase();
}

export function applyRules(input: RuleInput): RuleOutcome {
  const { normalized, config, now, escalateRequested } = input;
  const issues: Issue[] = [];
  let requestedAt: Date | null = null;

  if (normalized.date !== null && normalized.minutes !== null) {
    const { date, minutes } = normalized;
    requestedAt = zonedTimeToUtc(
      date.year,
      date.month,
      date.day,
      Math.floor(minutes / 60),
      minutes % 60,
      config.timezone,
    );

    const nowParts = partsInZone(now, config.timezone);
    const today: CalendarDate = {
      year: nowParts.year,
      month: nowParts.month,
      day: nowParts.day,
    };
    const leadMinutes = (requestedAt.getTime() - now.getTime()) / 60_000;

    if (leadMinutes < 0) {
      issues.push("in_the_past");
    } else if (leadMinutes < config.booking.minLeadTimeMinutes) {
      issues.push("below_lead_time");
    }

    if (daysBetween(today, date) > config.booking.maxAdvanceDays) {
      issues.push("too_far_in_advance");
    }

    if (config.closedDates.includes(formatDate(date))) {
      issues.push("closed_date");
    } else if (!isWithinOpeningHours(date, minutes, config)) {
      issues.push("outside_opening_hours");
    }
  }

  const maxParty = config.booking.maxPartySize;
  if (
    maxParty !== null &&
    normalized.partySize !== null &&
    normalized.partySize > maxParty
  ) {
    // Bewusst keine Ablehnung: eine große Gruppe ist ein guter Kunde, über den
    // ein Mensch entscheiden soll.
    issues.push("party_too_large");
  }

  if (escalateRequested) issues.push("escalation_requested");

  const haystack = searchableText(normalized);
  if (
    haystack.length > 0 &&
    config.escalation.keywords.some((word) => haystack.includes(word.toLowerCase()))
  ) {
    issues.push("escalation_keyword");
  }

  const notes = normalized.details.dietaryNotes;
  if (
    config.escalation.dietaryNeedsConfirmation &&
    Array.isArray(notes) &&
    notes.length > 0
  ) {
    issues.push("dietary_requires_confirmation");
  }

  if (
    normalized.confidence !== null &&
    normalized.confidence < config.confidenceThreshold
  ) {
    issues.push("low_confidence");
  }

  return { issues, requestedAt };
}

/** Der Gast hat ausdrücklich einen Menschen verlangt, oder es ist eine Beschwerde. */
const IMMEDIATE_ESCALATION: readonly Issue[] = [
  "escalation_requested",
  "escalation_keyword",
];

/** Gründe, aus denen der Agent nachfragen soll, statt die Anfrage anzunehmen. */
const NEEDS_INFO: readonly Issue[] = [
  "outside_opening_hours",
  "closed_date",
  "too_far_in_advance",
  "below_lead_time",
  "in_the_past",
  "low_confidence",
];

/** Vollständige Anfragen, über die ein Mensch entscheiden soll. */
const DEFERRED_ESCALATION: readonly Issue[] = [
  "party_too_large",
  "dietary_requires_confirmation",
];

/**
 * Statusentscheidung. Die Reihenfolge ist die eigentliche Aussage:
 *
 * 1. Wer nach einem Menschen fragt oder sich beschwert, wird sofort eskaliert —
 *    weiter auszufragen wäre in beiden Fällen das Falsche.
 * 2. Sonst gilt: fehlt etwas oder passt der Termin nicht, fragt der Agent nach.
 * 3. Erst eine vollständige Anfrage wird an einen Menschen übergeben, wenn sie
 *    eine Entscheidung braucht (große Gruppe, Allergie).
 */
export function decideStatus(issues: readonly Issue[], missingFields: readonly string[]): RequestStatus {
  if (issues.some((i) => IMMEDIATE_ESCALATION.includes(i))) return "escalated";
  if (missingFields.length > 0) return "needs_info";
  if (issues.some((i) => NEEDS_INFO.includes(i))) return "needs_info";
  if (issues.some((i) => DEFERRED_ESCALATION.includes(i))) return "escalated";
  return "new";
}
