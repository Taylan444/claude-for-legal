/**
 * Voice ist nur ein weiterer Eingangskanal — dieselbe Logik, derselbe
 * Schreibpfad. Geprüft wird genau das, plus die Doppelzustellung, die im
 * Telefonbetrieb sonst zu doppelten Reservierungen führt.
 */

import { test } from "node:test";
import assert from "node:assert/strict";

import { fromVoice, voiceIdempotencyKey } from "../src/adapters/inbound.ts";
import { handleInboundRequest } from "../src/handleInboundRequest.ts";
import { RESTAURANT, harness } from "./fixtures.ts";

function voicePayload(overrides: Record<string, unknown> = {}) {
  return {
    message: {
      type: "tool-calls",
      call: { id: "call-abc", customer: { number: "+4915112345678" } },
      toolCalls: [
        {
          id: "tc-1",
          function: {
            arguments: {
              intent: "reservation",
              name: "Anna Weber",
              date: "2026-07-15",
              time: "19:30",
              partySize: 4,
              confidence: 0.9,
              ...overrides,
            },
          },
        },
      ],
    },
  };
}

test("Voice-Payload wird auf das einheitliche Modell abgebildet", () => {
  const parsed = fromVoice(RESTAURANT.clientId, "vapi", voicePayload());
  assert.ok(parsed);
  assert.equal(parsed.callId, "call-abc");
  assert.equal(parsed.eventType, "tool-calls");
  assert.equal(parsed.inbound.channel, "voice");
  assert.equal(parsed.inbound.intent, "reservation");
  assert.equal(parsed.inbound.customer?.name, "Anna Weber");
  assert.equal(parsed.inbound.idempotencyKey, "vapi:call-abc:tool-calls:tc-1");
});

test("Anrufernummer dient als Rückfallwert für die Telefonnummer", () => {
  const parsed = fromVoice(RESTAURANT.clientId, "vapi", voicePayload({ phone: undefined }));
  assert.equal(parsed?.inbound.customer?.phone, "+4915112345678");
});

test("Zustellung ohne Call-ID wird nicht verarbeitet", () => {
  // Ohne stabile ID gibt es keinen Idempotenzschlüssel — lieber ablehnen und
  // den Rohpayload aufheben als eine Reservierung doppelt anlegen.
  assert.equal(fromVoice(RESTAURANT.clientId, "vapi", { message: { type: "tool-calls" } }), null);
});

test("Idempotenzschlüssel ist ohne Tool-Call-ID stabil", () => {
  assert.equal(
    voiceIdempotencyKey("vapi", "call-1", "end-of-call-report", null),
    "vapi:call-1:end-of-call-report:",
  );
});

test("Voice und Chat erzeugen dieselbe Anfrage", async () => {
  const viaVoice = harness();
  const parsed = fromVoice(RESTAURANT.clientId, "vapi", voicePayload({ phone: "030 1234567" }));
  assert.ok(parsed);
  const voiceResult = await handleInboundRequest(parsed.inbound, viaVoice);

  const viaChat = harness();
  const chatResult = await handleInboundRequest(
    {
      tenantId: RESTAURANT.clientId,
      channel: "chat",
      intent: "reservation",
      customer: { name: "Anna Weber", phone: "030 1234567" },
      date: "2026-07-15",
      time: "19:30",
      partySize: 4,
      confidence: 0.9,
    },
    viaChat,
  );

  assert.equal(voiceResult.status, chatResult.status);
  assert.deepEqual(voiceResult.events, chatResult.events);

  const fromVoiceStored = [...viaVoice.store.requests.values()][0]!;
  const fromChatStored = [...viaChat.store.requests.values()][0]!;
  assert.equal(fromVoiceStored.requestedAt?.toISOString(), fromChatStored.requestedAt?.toISOString());
  assert.equal(fromVoiceStored.customer.phone, fromChatStored.customer.phone);
  assert.notEqual(fromVoiceStored.channel, fromChatStored.channel, "nur der Kanal unterscheidet sich");
});

test("doppelt zugestellter Voice-Webhook erzeugt keine zweite Reservierung", async () => {
  const h = harness();
  const parsed = fromVoice(RESTAURANT.clientId, "vapi", voicePayload({ phone: "030 1234567" }));
  assert.ok(parsed);

  const first = await handleInboundRequest(parsed.inbound, h);
  const retry = fromVoice(RESTAURANT.clientId, "vapi", voicePayload({ phone: "030 1234567" }));
  assert.ok(retry);
  const second = await handleInboundRequest(retry.inbound, h);

  assert.equal(second.deduplicated, true);
  assert.equal(second.requestId, first.requestId);
  assert.equal(h.store.requests.size, 1);
  assert.equal(h.store.events.length, 1, "der Gast bekommt keine zweite Bestätigung");
});
