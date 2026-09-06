/**
 * Die Szenarien aus Abschnitt 20 des Master-Prompts — Happy Paths und
 * Failure Paths. Keine Funktion gilt als fertig, nur weil sie einmal
 * funktioniert hat.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { handleInboundRequest } from "../src/handleInboundRequest.ts";
import { IdempotencyConflictError, UnknownTenantError } from "../src/errors.ts";
import { MemoryTenantStore } from "../src/adapters/memory.ts";
import { RESTAURANT, goodReservation, harness } from "./fixtures.ts";
import type { RawInbound } from "../src/types.ts";

const submit = (h: ReturnType<typeof harness>, input: Record<string, unknown>) =>
  handleInboundRequest(input as unknown as RawInbound, h);

// --- Happy Path ------------------------------------------------------------

test("normale Reservierung wird angenommen und meldet reservation.requested", async () => {
  const h = harness();
  const result = await submit(h, goodReservation());

  assert.equal(result.status, "new");
  assert.deepEqual(result.missingFields, []);
  assert.deepEqual(result.issues, []);
  assert.deepEqual(result.events, ["reservation.requested"]);
  assert.equal(h.store.requests.size, 1);
  assert.equal(h.store.events.length, 1);

  const stored = [...h.store.requests.values()][0]!;
  assert.equal(stored.customer.phone, "+49301234567", "Telefon nach E.164 normalisiert");
  assert.equal(stored.requestedLocal, "2026-07-15 19:30");
  // 19:30 Berliner Sommerzeit = 17:30 UTC
  assert.equal(stored.requestedAt?.toISOString(), "2026-07-15T17:30:00.000Z");
});

test("Rohpayload wird immer mitgespeichert", async () => {
  const h = harness();
  const raw = { provider: "test", nested: { value: 1 } };
  await submit(h, goodReservation({ rawInput: raw }));
  const stored = [...h.store.requests.values()][0]!;
  assert.deepEqual(stored.rawInput, raw);
});

// --- Fehlende Angaben ------------------------------------------------------

test("fehlender Name führt zu needs_info ohne Event", async () => {
  const h = harness();
  const result = await submit(h, goodReservation({ customer: { phone: "030 1234567" } }));

  assert.equal(result.status, "needs_info");
  assert.deepEqual(result.missingFields, ["customer.name"]);
  assert.deepEqual(result.events, []);
  // Trotzdem gespeichert: eine unvollständige Anfrage darf nicht verschwinden.
  assert.equal(h.store.requests.size, 1);
});

test("fehlende Telefonnummer führt zu needs_info", async () => {
  const h = harness();
  const result = await submit(h, goodReservation({ customer: { name: "Anna Weber" } }));
  assert.equal(result.status, "needs_info");
  assert.deepEqual(result.missingFields, ["customer.phone"]);
});

test("unbrauchbare Telefonnummer zählt als fehlend, nicht als gültig", async () => {
  const h = harness();
  const result = await submit(h, goodReservation({
    customer: { name: "Anna Weber", phone: "keine Ahnung" },
  }));
  assert.equal(result.status, "needs_info");
  assert.deepEqual(result.missingFields, ["customer.phone"]);
});

test("unklares Datum führt zu needs_info", async () => {
  const h = harness();
  const result = await submit(h, goodReservation({ date: "irgendwann nächste Woche" }));
  assert.equal(result.status, "needs_info");
  assert.deepEqual(result.missingFields, ["date"]);
});

test("Platzhaltername des Agents zählt als fehlend", async () => {
  const h = harness();
  const result = await submit(h, goodReservation({
    customer: { name: "unbekannt", phone: "030 1234567" },
  }));
  assert.deepEqual(result.missingFields, ["customer.name"]);
});

// --- Öffnungszeiten --------------------------------------------------------

test("Ruhetag: Anfrage für Montag wird nicht angenommen", async () => {
  const h = harness();
  const result = await submit(h, goodReservation({ date: "2026-07-13" })); // Montag
  assert.equal(result.status, "needs_info");
  assert.ok(result.issues.includes("outside_opening_hours"));
  assert.deepEqual(result.events, []);
});

test("Uhrzeit vor Öffnung wird nicht angenommen", async () => {
  const h = harness();
  const result = await submit(h, goodReservation({ time: "15:00" }));
  assert.ok(result.issues.includes("outside_opening_hours"));
});

test("einzelner Schließtag wird erkannt", async () => {
  const h = harness();
  const result = await submit(h, goodReservation({ date: "2026-12-24", time: "19:30" }));
  assert.ok(result.issues.includes("closed_date"));
  assert.ok(!result.issues.includes("outside_opening_hours"), "der Schließtag ist der Grund");
});

test("Termin in der Vergangenheit wird erkannt", async () => {
  const h = harness("2026-07-15T20:00:00Z"); // 22:00 Ortszeit
  const result = await submit(h, goodReservation()); // 19:30 Ortszeit
  assert.ok(result.issues.includes("in_the_past"));
  assert.equal(result.status, "needs_info");
});

test("unterschrittene Vorlaufzeit wird erkannt", async () => {
  const h = harness("2026-07-15T15:00:00Z"); // 17:00 Ortszeit
  const result = await submit(h, goodReservation({ time: "17:30" })); // 30 Min später
  assert.ok(result.issues.includes("below_lead_time"));
});

test("zu weit im Voraus wird erkannt", async () => {
  const h = harness();
  const result = await submit(h, goodReservation({ date: "2027-06-16" }));
  assert.ok(result.issues.includes("too_far_in_advance"));
});

// --- Eskalation ------------------------------------------------------------

test("große Gruppe wird eskaliert statt abgelehnt", async () => {
  const h = harness();
  const result = await submit(h, goodReservation({ partySize: 20 }));

  assert.equal(result.status, "escalated");
  assert.ok(result.issues.includes("party_too_large"));
  assert.deepEqual(result.events, ["escalation.requested"]);
});

test("Allergiehinweis wird gespeichert und zur Bestätigung eskaliert", async () => {
  const h = harness();
  const result = await submit(h, goodReservation({
    details: { dietaryNotes: ["Nussallergie", "glutenfrei"], message: "Bitte Rücksprache" },
  }));

  assert.equal(result.status, "escalated");
  assert.ok(result.issues.includes("dietary_requires_confirmation"));
  const stored = [...h.store.requests.values()][0]!;
  assert.deepEqual(stored.details.dietaryNotes, ["Nussallergie", "glutenfrei"]);
});

test("vegane Anfrage wird als Ernährungshinweis erfasst", async () => {
  const h = harness();
  await submit(h, goodReservation({ details: { dietaryNotes: ["vegan"] } }));
  const stored = [...h.store.requests.values()][0]!;
  assert.deepEqual(stored.details.dietaryNotes, ["vegan"]);
});

test("ausdrücklicher Wunsch nach einem Menschen eskaliert sofort", async () => {
  const h = harness();
  // Bewusst unvollständig: wer nach einem Menschen fragt, wird nicht weiter ausgefragt.
  const result = await submit(h, goodReservation({ customer: {}, escalate: true }));

  assert.equal(result.status, "escalated");
  assert.ok(result.issues.includes("escalation_requested"));
  assert.deepEqual(result.events, ["escalation.requested"]);
  assert.ok(result.missingFields.length > 0, "fehlende Felder bleiben protokolliert");
});

test("Beschwerde im Freitext eskaliert", async () => {
  const h = harness();
  const result = await submit(h, goodReservation({
    details: { message: "Ich möchte eine Beschwerde loswerden" },
  }));
  assert.equal(result.status, "escalated");
  assert.ok(result.issues.includes("escalation_keyword"));
});

test("unsichere Extraktion führt zur Rückfrage statt zur Annahme", async () => {
  const h = harness();
  const result = await submit(h, goodReservation({ confidence: 0.3 }));
  assert.equal(result.status, "needs_info");
  assert.ok(result.issues.includes("low_confidence"));
});

// --- Stornierung -----------------------------------------------------------

test("Stornierung setzt die ursprüngliche Anfrage auf cancelled", async () => {
  const h = harness();
  const first = await submit(h, goodReservation());

  const result = await submit(h, {
    tenantId: RESTAURANT.clientId,
    channel: "voice",
    intent: "cancellation",
    relatedRequestId: first.requestId,
  });

  assert.equal(result.status, "cancelled");
  assert.deepEqual(result.events, ["request.status_changed"]);
  assert.equal(h.store.requests.get(first.requestId)?.status, "cancelled");
});

test("Stornierung einer unbekannten Anfrage wird nicht stillschweigend hingenommen", async () => {
  const h = harness();
  const result = await submit(h, {
    tenantId: RESTAURANT.clientId,
    channel: "voice",
    intent: "cancellation",
    relatedRequestId: "gibt-es-nicht",
  });

  assert.equal(result.status, "needs_info");
  assert.ok(result.issues.includes("unknown_related_request"));
  assert.deepEqual(result.events, []);
});

test("Stornierung greift nicht über Mandantengrenzen hinweg", async () => {
  const h = harness();
  const first = await submit(h, goodReservation());
  // Anfrage eines anderen Mandanten darf die fremde Reservierung nicht finden.
  const foreign = { ...RESTAURANT, clientId: "tenant-anderer" };
  h.tenants = new MemoryTenantStore([RESTAURANT, foreign]);

  const result = await submit(h, {
    tenantId: "tenant-anderer",
    channel: "chat",
    intent: "cancellation",
    relatedRequestId: first.requestId,
  });

  assert.equal(result.status, "needs_info");
  assert.ok(result.issues.includes("unknown_related_request"));
  assert.equal(h.store.requests.get(first.requestId)?.status, "new", "fremde Anfrage unverändert");
});

// --- Idempotenz und Ausfälle ----------------------------------------------

test("doppelte Zustellung erzeugt keine zweite Reservierung", async () => {
  const h = harness();
  const input = goodReservation({ idempotencyKey: "vapi:call-1:tool-calls" });

  const first = await submit(h, input);
  const second = await submit(h, input);

  assert.equal(first.deduplicated, false);
  assert.equal(second.deduplicated, true);
  assert.equal(second.requestId, first.requestId);
  assert.equal(h.store.requests.size, 1, "keine zweite Anfrage");
  assert.equal(h.store.events.length, 1, "keine zweite Benachrichtigung");
});

test("gleicher Schlüssel mit abweichendem Inhalt wird nicht verschluckt", async () => {
  const h = harness();
  await submit(h, goodReservation({ idempotencyKey: "vapi:call-1:tool-calls" }));

  await assert.rejects(
    () => submit(h, goodReservation({ idempotencyKey: "vapi:call-1:tool-calls", partySize: 8 })),
    IdempotencyConflictError,
  );
});

test("Speicherfehler hinterlässt keinen halben Zustand", async () => {
  const h = harness();
  h.store.faults.add("appendEvents");

  await assert.rejects(() => submit(h, goodReservation()), /simulierter Speicherfehler/);

  assert.equal(h.store.requests.size, 0, "keine Anfrage ohne ihr Event");
  assert.equal(h.store.events.length, 0);
  assert.equal(h.store.idempotency.size, 0);
});

test("unbekannter Mandant wird abgewiesen", async () => {
  const h = harness();
  await assert.rejects(
    () => submit(h, goodReservation({ tenantId: "gibt-es-nicht" })),
    UnknownTenantError,
  );
});

test("jeder Intake wird strukturiert protokolliert", async () => {
  const h = harness();
  const result = await submit(h, goodReservation());
  const line = h.logger.lines.find((l) => l.message === "intake.completed");
  assert.ok(line, "intake.completed fehlt im Log");
  assert.equal(line.fields.requestId, result.requestId);
  assert.equal(line.fields.status, "new");
});
