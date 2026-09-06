/**
 * Sommerzeit ist der Ort, an dem Reservierungen still eine Stunde daneben
 * landen. Deshalb wird sie hier explizit geprüft, nicht angenommen.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  daysBetween,
  parseDate,
  parseTimeToMinutes,
  partsInZone,
  weekdayOf,
  zonedTimeToUtc,
} from "../src/time.ts";

const BERLIN = "Europe/Berlin";

test("Sommerzeit: 19:30 Ortszeit ist 17:30 UTC", () => {
  const utc = zonedTimeToUtc(2026, 7, 15, 19, 30, BERLIN);
  assert.equal(utc.toISOString(), "2026-07-15T17:30:00.000Z");
});

test("Winterzeit: dieselbe Ortszeit ist 18:30 UTC", () => {
  const utc = zonedTimeToUtc(2026, 1, 14, 19, 30, BERLIN);
  assert.equal(utc.toISOString(), "2026-01-14T18:30:00.000Z");
});

test("dieselbe Wanduhrzeit ergibt sommers und winters verschiedene Instants", () => {
  const summer = zonedTimeToUtc(2026, 7, 15, 19, 30, BERLIN);
  const winter = zonedTimeToUtc(2026, 1, 14, 19, 30, BERLIN);
  const summerUtcHour = summer.getUTCHours();
  const winterUtcHour = winter.getUTCHours();
  assert.equal(winterUtcHour - summerUtcHour, 1, "genau eine Stunde Unterschied");
});

test("übersprungene Stunde der Zeitumstellung ergibt einen realen Instant", () => {
  // 2026-03-29 02:30 Ortszeit existiert in Berlin nicht.
  const utc = zonedTimeToUtc(2026, 3, 29, 2, 30, BERLIN);
  const local = partsInZone(utc, BERLIN);
  assert.equal(local.hour, 3, "landet auf der unmittelbar folgenden realen Zeit");
  assert.equal(local.minute, 30);
});

test("doppelte Stunde der Zeitumstellung bleibt gültig", () => {
  // 2026-10-25 02:30 Ortszeit gibt es zweimal.
  const utc = zonedTimeToUtc(2026, 10, 25, 2, 30, BERLIN);
  const local = partsInZone(utc, BERLIN);
  assert.equal(local.hour, 2);
  assert.equal(local.minute, 30);
});

test("Zeitzone eines anderen Mandanten wird korrekt behandelt", () => {
  const utc = zonedTimeToUtc(2026, 7, 15, 19, 30, "Europe/Lisbon");
  assert.equal(utc.toISOString(), "2026-07-15T18:30:00.000Z");
});

test("Mitternacht wird nicht zu 24 Uhr", () => {
  const local = partsInZone(new Date("2026-07-15T22:00:00Z"), BERLIN);
  assert.equal(local.hour, 0);
  assert.equal(local.day, 16);
});

test("ungültige Kalenderdaten werden abgewiesen", () => {
  assert.equal(parseDate("2026-02-30"), null);
  assert.equal(parseDate("2026-13-01"), null);
  assert.equal(parseDate("15.07.2026"), null);
  assert.deepEqual(parseDate("2026-07-15"), { year: 2026, month: 7, day: 15 });
});

test("Schaltjahr wird korrekt behandelt", () => {
  assert.deepEqual(parseDate("2028-02-29"), { year: 2028, month: 2, day: 29 });
  assert.equal(parseDate("2026-02-29"), null);
});

test("Uhrzeiten werden in Minuten seit Mitternacht umgerechnet", () => {
  assert.equal(parseTimeToMinutes("19:30"), 1170);
  assert.equal(parseTimeToMinutes("9:05"), 545);
  assert.equal(parseTimeToMinutes("24:00"), null);
  assert.equal(parseTimeToMinutes("19:60"), null);
  assert.equal(parseTimeToMinutes("halb acht"), null);
});

test("Wochentag ist unabhängig von der Serverzeitzone", () => {
  assert.equal(weekdayOf({ year: 2026, month: 7, day: 15 }), 3, "Mittwoch");
  assert.equal(weekdayOf({ year: 2026, month: 7, day: 13 }), 1, "Montag");
});

test("Tagesabstand zählt Kalendertage über die Zeitumstellung hinweg", () => {
  const from = { year: 2026, month: 3, day: 28 };
  const to = { year: 2026, month: 3, day: 30 };
  assert.equal(daysBetween(from, to), 2);
});
