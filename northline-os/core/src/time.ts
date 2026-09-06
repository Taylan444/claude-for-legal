/**
 * Zeit und Zeitzonen — ohne externe Bibliothek.
 *
 * Der Gast nennt Ortszeit ("Freitag 19:30"). Gespeichert wird ein UTC-Instant.
 * Zwischen beidem liegt die Sommerzeit, und genau dort brechen Reservierungen
 * still: eine Anfrage landet eine Stunde daneben, und niemand merkt es, bis der
 * Gast vor der Tür steht.
 *
 * Node bringt mit Intl eine vollständige IANA-Zeitzonendatenbank mit. Die
 * Umrechnung darüber ist exakt und spart eine Abhängigkeit.
 */

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

const partsCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  const cached = partsCache.get(timeZone);
  if (cached) return cached;
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  partsCache.set(timeZone, dtf);
  return dtf;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** Wanduhrzeit eines Instants in der angegebenen Zone. */
export function partsInZone(instant: Date, timeZone: string): ZonedParts {
  const parts = formatterFor(timeZone).formatToParts(instant);
  const read = (type: Intl.DateTimeFormatPartTypes): number => {
    const found = parts.find((p) => p.type === type);
    return found ? Number(found.value) : 0;
  };
  // Manche ICU-Versionen liefern für Mitternacht "24" statt "00".
  const hour = read("hour") % 24;
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour,
    minute: read("minute"),
    second: read("second"),
  };
}

/** Offset der Zone gegenüber UTC zum gegebenen Instant, in Millisekunden. */
export function tzOffsetMs(instant: Date, timeZone: string): number {
  const truncated = Math.floor(instant.getTime() / 1000) * 1000;
  const p = partsInZone(new Date(truncated), timeZone);
  const asIfUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asIfUtc - truncated;
}

/**
 * Ortszeit → UTC-Instant.
 *
 * Zwei Durchläufe, weil der Offset selbst vom gesuchten Instant abhängt: der
 * erste Versuch schätzt mit dem Offset der naiven Zeit, der zweite korrigiert
 * ihn, falls die Schätzung auf der anderen Seite eines Zeitumstellungspunkts
 * lag. In der zur Sommerzeit übersprungenen Stunde existiert die genannte
 * Ortszeit nicht; das Ergebnis ist dann der unmittelbar folgende reale Instant.
 */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const naive = Date.UTC(year, month - 1, day, hour, minute, 0);
  const firstGuess = tzOffsetMs(new Date(naive), timeZone);
  let timestamp = naive - firstGuess;
  const secondGuess = tzOffsetMs(new Date(timestamp), timeZone);
  if (secondGuess !== firstGuess) timestamp = naive - secondGuess;
  return new Date(timestamp);
}

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

export interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

/** "YYYY-MM-DD" → Datum, oder null wenn ungültig (auch 2026-02-30). */
export function parseDate(value: string): CalendarDate | null {
  const match = DATE_PATTERN.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

/** "19:30" → 1170 Minuten seit Mitternacht, oder null wenn ungültig. */
export function parseTimeToMinutes(value: string): number | null {
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

/** Wochentag eines Kalenderdatums: 0 = Sonntag … 6 = Samstag. */
export function weekdayOf(date: CalendarDate): number {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatDate(date: CalendarDate): string {
  return `${date.year}-${pad(date.month)}-${pad(date.day)}`;
}

export function formatMinutes(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** Ganze Tage zwischen zwei Kalenderdaten (b - a). */
export function daysBetween(a: CalendarDate, b: CalendarDate): number {
  const from = Date.UTC(a.year, a.month - 1, a.day);
  const to = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((to - from) / 86_400_000);
}
