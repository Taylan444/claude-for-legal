/**
 * Zustellung Ende zu Ende: Chat → Kern → Outbox → Gast, Betrieb und Make.
 *
 * Der wichtigste Test hier ist der Wiederholungsfall. Ein Event hat mehrere
 * Ziele; scheitert eines, wiederholt der Dispatcher das ganze Event. Ohne
 * Schutz bekäme der Gast bei jedem Versuch eine weitere Bestätigung.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { handleInboundRequest } from "../src/handleInboundRequest.ts";
import { dispatchDue } from "../src/dispatcher.ts";
import { EventDelivery } from "../src/delivery/EventDelivery.ts";
import {
  EVENT_ID_HEADER,
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  WebhookSender,
  verifySignature,
} from "../src/delivery/webhook.ts";
import { NotificationService } from "../src/notifications/NotificationService.ts";
import { MemoryEmailProvider } from "../src/notifications/providers.ts";
import {
  FixedClock,
  MemoryDeliveryLog,
  MemoryHttpClient,
  MemoryOutbox,
  MemoryTenantStore,
  RecordingLogger,
  StaticSecretResolver,
} from "../src/adapters/memory.ts";
import { RESTAURANT, goodReservation, harness } from "./fixtures.ts";
import type { OutboxEvent, TenantConfig } from "../src/types.ts";

const WEBHOOK_SECRET = "s3cret-fuer-make";
const NO_JITTER = () => 0;

function delivery(config: TenantConfig = RESTAURANT) {
  const email = new MemoryEmailProvider();
  const http = new MemoryHttpClient();
  const logger = new RecordingLogger();
  const log = new MemoryDeliveryLog();
  const clock = new FixedClock(new Date("2026-07-01T10:00:00Z"));

  const port = new EventDelivery({
    tenants: new MemoryTenantStore([config]),
    notifications: new NotificationService({ email, logger }),
    webhooks: new WebhookSender(http),
    secrets: new StaticSecretResolver({ MAKE_WEBHOOK_SECRET_PILOT: WEBHOOK_SECRET }),
    log,
    logger,
    now: () => clock.now(),
  });

  return { email, http, logger, log, clock, port };
}

/** Erzeugt echte Events über den Kern statt sie von Hand zu bauen. */
async function eventsFromIntake(input: Record<string, unknown> = {}): Promise<OutboxEvent[]> {
  const h = harness();
  await handleInboundRequest(
    { ...goodReservation(), ...input } as never,
    h,
  );
  return h.store.events;
}

test("eine Reservierung erreicht Gast, Betrieb und Make", async () => {
  const events = await eventsFromIntake();
  assert.equal(events.length, 1);

  const d = delivery();
  const outbox = new MemoryOutbox(events);
  const summary = await dispatchDue(
    { outbox, delivery: d.port, clock: d.clock, logger: d.logger },
    { jitter: NO_JITTER },
  );

  assert.equal(summary.delivered, 1);
  assert.equal(d.email.sent.length, 2, "Gast und Betrieb");
  assert.deepEqual(d.email.sent[0]!.to, ["anna@example.com"]);
  assert.deepEqual(d.email.sent[1]!.to, ["team@pilot-restaurant.example"]);
  assert.equal(d.http.requests.length, 1, "ein Webhook nach Make");
  assert.ok(outbox.events[0]!.deliveredAt);
});

test("der Webhook ist signiert und die Signatur prüft durch", async () => {
  const events = await eventsFromIntake();
  const d = delivery();
  await d.port.deliver(events[0]!);

  const request = d.http.requests[0]!;
  const timestamp = Number(request.headers[TIMESTAMP_HEADER]);
  assert.equal(request.headers[EVENT_ID_HEADER], events[0]!.id);

  assert.ok(
    verifySignature(WEBHOOK_SECRET, timestamp, request.body, request.headers[SIGNATURE_HEADER]!, {
      now: d.clock.now(),
    }),
    "gültige Signatur",
  );

  const body = JSON.parse(request.body) as { type: string; data: Record<string, unknown> };
  assert.equal(body.type, "reservation.requested");
  assert.equal(body.data.partySize, 4);
});

test("eine veränderte Nutzlast fällt bei der Prüfung durch", async () => {
  const events = await eventsFromIntake();
  const d = delivery();
  await d.port.deliver(events[0]!);

  const request = d.http.requests[0]!;
  const timestamp = Number(request.headers[TIMESTAMP_HEADER]);
  const tampered = request.body.replace('"partySize":4', '"partySize":40');

  assert.equal(
    verifySignature(WEBHOOK_SECRET, timestamp, tampered, request.headers[SIGNATURE_HEADER]!, {
      now: d.clock.now(),
    }),
    false,
  );
});

test("eine alte Signatur wird abgewiesen", async () => {
  const events = await eventsFromIntake();
  const d = delivery();
  await d.port.deliver(events[0]!);

  const request = d.http.requests[0]!;
  const timestamp = Number(request.headers[TIMESTAMP_HEADER]);
  const muchLater = new Date(d.clock.now().getTime() + 3_600_000);

  assert.equal(
    verifySignature(WEBHOOK_SECRET, timestamp, request.body, request.headers[SIGNATURE_HEADER]!, {
      now: muchLater,
    }),
    false,
    "außerhalb des Toleranzfensters",
  );
});

test("nach einem Webhook-Fehler bekommt der Gast KEINE zweite Bestätigung", async () => {
  const events = await eventsFromIntake();
  const d = delivery();
  const outbox = new MemoryOutbox(events);
  d.http.failures = 1; // erster Webhook-Versuch scheitert

  const first = await dispatchDue(
    { outbox, delivery: d.port, clock: d.clock, logger: d.logger },
    { jitter: NO_JITTER },
  );
  assert.equal(first.retried, 1, "Event wird wiederholt");
  assert.equal(d.email.sent.length, 2, "Gast und Betrieb wurden erreicht");

  d.clock.advance(600_000);
  const second = await dispatchDue(
    { outbox, delivery: d.port, clock: d.clock, logger: d.logger },
    { jitter: NO_JITTER },
  );

  assert.equal(second.delivered, 1, "beim zweiten Anlauf zugestellt");
  assert.equal(d.email.sent.length, 2, "immer noch nur zwei Mails");
  assert.equal(d.http.requests.length, 2, "nur der Webhook wurde wiederholt");
  assert.ok(outbox.events[0]!.deliveredAt);
});

test("ohne auflösbares Secret wird nicht unsigniert gesendet", async () => {
  const events = await eventsFromIntake();
  const email = new MemoryEmailProvider();
  const http = new MemoryHttpClient();
  const logger = new RecordingLogger();
  const clock = new FixedClock(new Date("2026-07-01T10:00:00Z"));

  const port = new EventDelivery({
    tenants: new MemoryTenantStore([RESTAURANT]),
    notifications: new NotificationService({ email, logger }),
    webhooks: new WebhookSender(http),
    secrets: new StaticSecretResolver({}), // Secret fehlt
    log: new MemoryDeliveryLog(),
    logger,
    now: () => clock.now(),
  });

  await assert.rejects(() => port.deliver(events[0]!), /nicht auflösbar/);
  assert.equal(http.requests.length, 0, "nichts hinausgeschickt");
});

test("bei einer Eskalation schreibt das System dem Gast nicht", async () => {
  const events = await eventsFromIntake({ partySize: 20 });
  assert.equal(events[0]!.type, "escalation.requested");

  const d = delivery();
  await d.port.deliver(events[0]!);

  assert.equal(d.email.sent.length, 1);
  assert.deepEqual(d.email.sent[0]!.to, ["team@pilot-restaurant.example"]);
  assert.match(d.email.sent[0]!.subject, /Bitte übernehmen/i);
});

test("abgeschaltete Gastnachricht wird als erledigt vermerkt, nicht später doch gesendet", async () => {
  const config: TenantConfig = {
    ...RESTAURANT,
    notifications: { ...RESTAURANT.notifications, confirmCustomer: false },
  };
  const events = await eventsFromIntake();
  const d = delivery(config);
  d.http.failures = 1;

  await assert.rejects(() => d.port.deliver(events[0]!));
  await d.port.deliver(events[0]!);

  assert.equal(d.email.sent.length, 1, "nur der Betrieb");
  assert.deepEqual(d.log.targetsWithStatus("skipped"), ["email:customer"]);
});

test("ein Webhook bekommt nur die Events, die er abonniert hat", async () => {
  const config: TenantConfig = {
    ...RESTAURANT,
    webhooks: [{ ...RESTAURANT.webhooks[0]!, events: ["conversation.completed"] }],
  };
  const events = await eventsFromIntake();
  const d = delivery(config);

  await d.port.deliver(events[0]!);
  assert.equal(d.http.requests.length, 0, "reservation.requested ist nicht abonniert");
  assert.equal(d.email.sent.length, 2, "E-Mails laufen unabhängig davon");
});

test("ein unbekannter Mandant führt nicht zu stiller Zustellung", async () => {
  const events = await eventsFromIntake();
  const d = delivery();
  const foreign: OutboxEvent = { ...events[0]!, tenantId: "tenant-gibt-es-nicht" };

  await assert.rejects(() => d.port.deliver(foreign), /Unbekannter Mandant/);
  assert.equal(d.email.sent.length, 0);
});
