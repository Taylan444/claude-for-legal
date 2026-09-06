/**
 * Der Dispatcher ist die Antwort auf "Keine stille Datenvernichtung".
 * Entsprechend werden hier vor allem die Fehlerfälle geprüft.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { backoffMs, dispatchDue } from "../src/dispatcher.ts";
import { newEvent } from "../src/events.ts";
import { FixedClock, MemoryOutbox, RecordingLogger, SequentialIds } from "../src/adapters/memory.ts";
import type { DeliveryPort, DeliveryResult } from "../src/ports.ts";
import type { OutboxEvent } from "../src/types.ts";

const NO_JITTER = () => 0;

function makeEvent(clock: FixedClock, ids: SequentialIds): OutboxEvent {
  return newEvent("reservation.requested", "tenant-1", { requestId: "r1" }, { clock, ids });
}

class ScriptedDelivery implements DeliveryPort {
  private failures: number;
  attempts = 0;
  constructor(failures: number) {
    this.failures = failures;
  }
  async deliver(): Promise<DeliveryResult> {
    this.attempts += 1;
    if (this.attempts <= this.failures) throw new Error("Anbieter nicht erreichbar");
    return { target: "email:guest", providerMessageId: "msg-1" };
  }
}

test("erfolgreiche Zustellung wird markiert", async () => {
  const clock = new FixedClock(new Date("2026-07-01T10:00:00Z"));
  const ids = new SequentialIds("evt");
  const outbox = new MemoryOutbox([makeEvent(clock, ids)]);
  const logger = new RecordingLogger();

  const summary = await dispatchDue(
    { outbox, delivery: new ScriptedDelivery(0), clock, logger },
    { jitter: NO_JITTER },
  );

  assert.deepEqual(summary, { claimed: 1, delivered: 1, retried: 0, deadLettered: 0 });
  assert.ok(outbox.events[0]!.deliveredAt, "deliveredAt gesetzt");
});

test("Ausfall des E-Mail-Anbieters führt zur Wiederholung, nicht zum Verlust", async () => {
  const clock = new FixedClock(new Date("2026-07-01T10:00:00Z"));
  const ids = new SequentialIds("evt");
  const outbox = new MemoryOutbox([makeEvent(clock, ids)]);
  const logger = new RecordingLogger();

  const summary = await dispatchDue(
    { outbox, delivery: new ScriptedDelivery(1), clock, logger },
    { jitter: NO_JITTER },
  );

  assert.deepEqual(summary, { claimed: 1, delivered: 0, retried: 1, deadLettered: 0 });
  const event = outbox.events[0]!;
  assert.equal(event.attempts, 1);
  assert.equal(event.deliveredAt, null);
  assert.equal(event.deadLetteredAt, null, "nicht verworfen");
  assert.ok(event.nextRetryAt.getTime() > clock.now().getTime(), "später erneut fällig");
  assert.match(event.lastError ?? "", /nicht erreichbar/);
});

test("noch nicht fällige Events werden nicht angefasst", async () => {
  const clock = new FixedClock(new Date("2026-07-01T10:00:00Z"));
  const ids = new SequentialIds("evt");
  const event = makeEvent(clock, ids);
  event.nextRetryAt = new Date("2026-07-01T10:05:00Z");
  const outbox = new MemoryOutbox([event]);

  const summary = await dispatchDue(
    { outbox, delivery: new ScriptedDelivery(0), clock, logger: new RecordingLogger() },
    { jitter: NO_JITTER },
  );

  assert.equal(summary.claimed, 0);
});

test("nach der letzten Wiederholung wird totgelegt statt verworfen", async () => {
  const clock = new FixedClock(new Date("2026-07-01T10:00:00Z"));
  const ids = new SequentialIds("evt");
  const outbox = new MemoryOutbox([makeEvent(clock, ids)]);
  const logger = new RecordingLogger();
  const delivery = new ScriptedDelivery(99);
  const options = { jitter: NO_JITTER, maxAttempts: 3 };

  for (let round = 0; round < 3; round += 1) {
    await dispatchDue({ outbox, delivery, clock, logger }, options);
    clock.advance(24 * 3_600_000); // weit genug für jeden Backoff
  }

  const event = outbox.events[0]!;
  assert.ok(event.deadLetteredAt, "als Dead Letter markiert");
  assert.equal(event.deliveredAt, null);
  // Die Zeile ist sichtbar und der Alarm liegt an: nichts ist verschwunden.
  assert.ok(logger.lines.some((l) => l.level === "error" && l.message === "outbox.dead_lettered"));
});

test("Backoff wächst exponentiell und ist gedeckelt", () => {
  const options = {
    maxAttempts: 5,
    baseDelayMs: 30_000,
    maxDelayMs: 3_600_000,
    batchSize: 50,
    jitter: NO_JITTER,
  };
  assert.equal(backoffMs(1, options), 30_000);
  assert.equal(backoffMs(2, options), 60_000);
  assert.equal(backoffMs(3, options), 120_000);
  assert.equal(backoffMs(20, options), 3_600_000, "gedeckelt");
});

test("Jitter streut die Wiederholung, damit nicht alles gleichzeitig anläuft", () => {
  const options = {
    maxAttempts: 5,
    baseDelayMs: 30_000,
    maxDelayMs: 3_600_000,
    batchSize: 50,
    jitter: () => 1,
  };
  assert.equal(backoffMs(1, options), 36_000);
});
