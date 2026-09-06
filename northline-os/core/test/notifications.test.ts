import { test } from "node:test";
import assert from "node:assert/strict";

import { NotificationService } from "../src/notifications/NotificationService.ts";
import { MemoryEmailProvider } from "../src/notifications/providers.ts";
import { formatWhen, summarize } from "../src/notifications/templates.ts";
import { RecordingLogger } from "../src/adapters/memory.ts";
import { RESTAURANT } from "./fixtures.ts";
import type { TenantConfig } from "../src/types.ts";

function service() {
  const email = new MemoryEmailProvider();
  const logger = new RecordingLogger();
  return { email, logger, service: new NotificationService({ email, logger }) };
}

const PAYLOAD = {
  requestId: "req-1",
  type: "reservation",
  status: "new",
  customer: { name: "Anna Weber", phone: "+49301234567", email: "anna@example.com" },
  requestedLocal: "2026-07-15 19:30",
  partySize: 4,
  details: { dietaryNotes: ["vegan"], message: "Fensterplatz wenn möglich" },
  issues: [],
};

test("die Gastnachricht bestätigt den Eingang und sagt nichts zu", async () => {
  const { email, service: notifications } = service();
  await notifications.sendCustomerConfirmation(summarize(PAYLOAD), RESTAURANT, "k1");

  const sent = email.sent[0]!;
  assert.match(sent.subject, /eingegangen/i);
  assert.match(sent.text, /noch keine Bestätigung/i);
  // Der springende Punkt: das System darf keinen Tisch zusagen, den niemand
  // zugesagt hat. Sonst steht der Gast vor einer vollen Gaststube.
  assert.doesNotMatch(sent.text, /ist reserviert|haben wir bestätigt|Tisch ist Ihnen sicher/i);
});

test("Absender, Antwortadresse und Empfänger stammen aus der Mandantenkonfiguration", async () => {
  const { email, service: notifications } = service();
  await notifications.sendCustomerConfirmation(summarize(PAYLOAD), RESTAURANT, "k1");

  const sent = email.sent[0]!;
  assert.deepEqual(sent.to, ["anna@example.com"]);
  assert.equal(sent.fromEmail, "reservierung@pilot-restaurant.example");
  assert.equal(sent.replyTo, "team@pilot-restaurant.example");
  assert.equal(sent.idempotencyKey, "k1");
});

test("Betriebe, die selbst antworten wollen, schalten die Gastnachricht ab", async () => {
  const { email, service: notifications } = service();
  const config: TenantConfig = {
    ...RESTAURANT,
    notifications: { ...RESTAURANT.notifications, confirmCustomer: false },
  };

  const outcome = await notifications.sendCustomerConfirmation(summarize(PAYLOAD), config, "k1");
  assert.deepEqual(outcome, { delivered: false, reason: "disabled_by_tenant" });
  assert.equal(email.sent.length, 0);
});

test("ohne E-Mail-Adresse des Gastes wird nichts verschickt", async () => {
  const { email, service: notifications } = service();
  const summary = summarize({ ...PAYLOAD, customer: { name: "Anna" } });

  const outcome = await notifications.sendCustomerConfirmation(summary, RESTAURANT, "k1");
  assert.deepEqual(outcome, { delivered: false, reason: "no_recipient" });
  assert.equal(email.sent.length, 0);
});

test("die Betriebsnachricht enthält, was zum Handeln nötig ist", async () => {
  const { email, service: notifications } = service();
  await notifications.sendBusinessNotification(summarize(PAYLOAD), RESTAURANT, "k2");

  const sent = email.sent[0]!;
  assert.deepEqual(sent.to, ["team@pilot-restaurant.example"]);
  assert.match(sent.text, /Anna Weber/);
  assert.match(sent.text, /\+49301234567/);
  assert.match(sent.text, /vegan/);
  assert.match(sent.text, /Fensterplatz/);
  assert.match(sent.subject, /15\.07\.2026/);
});

test("eine Eskalation nennt dem Betrieb den Grund", async () => {
  const { email, service: notifications } = service();
  const summary = summarize({
    ...PAYLOAD,
    status: "escalated",
    partySize: 20,
    issues: ["party_too_large"],
  });

  await notifications.sendBusinessNotification(summary, RESTAURANT, "k3");
  const sent = email.sent[0]!;
  assert.match(sent.subject, /Bitte übernehmen/i);
  assert.match(sent.text, /Große Gruppe/i);
});

test("interne Alarme gehen ausschließlich an Northline", async () => {
  const { email, service: notifications } = service();
  await notifications.sendInternalAlert("Dead Letter", "Details", RESTAURANT, "k4");

  const sent = email.sent[0]!;
  assert.deepEqual(sent.to, ["alerts@northline.example"]);
  assert.match(sent.subject, /^\[Northline\]/);
  assert.ok(!sent.to.includes("anna@example.com"));
  assert.ok(!sent.to.includes("team@pilot-restaurant.example"));
});

test("englischsprachige Mandanten bekommen englische Vorlagen", async () => {
  const { email, service: notifications } = service();
  const config: TenantConfig = { ...RESTAURANT, defaultLocale: "en" };

  await notifications.sendCustomerConfirmation(summarize(PAYLOAD), config, "k5");
  const sent = email.sent[0]!;
  assert.match(sent.subject, /We received your request/);
  assert.match(sent.text, /not a confirmation yet/);
});

test("Termine werden je Sprache lesbar dargestellt", () => {
  assert.equal(formatWhen("2026-07-15 19:30", "de"), "15.07.2026 um 19:30 Uhr");
  assert.equal(formatWhen("2026-07-15 19:30", "en"), "2026-07-15 at 19:30");
  assert.equal(formatWhen(null, "de"), "noch offen");
});

test("ein Ausfall des Anbieters wird nach oben gereicht, nicht verschluckt", async () => {
  const { email, service: notifications } = service();
  email.failures = 1;

  await assert.rejects(
    () => notifications.sendCustomerConfirmation(summarize(PAYLOAD), RESTAURANT, "k6"),
    /nicht erreichbar/,
  );
});
