/**
 * Kanal-Adapter — Provider-Payload → RawInbound.
 *
 * Hier endet alles Kanalspezifische. Ein Providerwechsel betrifft diese Datei
 * und sonst nichts.
 */

import type { RawInbound, RequestType } from "../types.ts";

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function pick(source: unknown, ...path: string[]): unknown {
  let current = source;
  for (const key of path) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

// ---------------------------------------------------------------------------
// Formular und Chat
// ---------------------------------------------------------------------------

export interface FormSubmission {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  date?: unknown;
  time?: unknown;
  partySize?: unknown;
  message?: unknown;
}

export function fromForm(
  tenantId: string,
  submission: FormSubmission,
  intent: RequestType = "reservation",
): RawInbound {
  return {
    tenantId,
    channel: "form",
    intent,
    customer: {
      name: str(submission.name),
      phone: str(submission.phone),
      email: str(submission.email),
    },
    date: str(submission.date),
    time: str(submission.time),
    partySize: typeof submission.partySize === "number" ? submission.partySize : str(submission.partySize),
    details: { message: str(submission.message) },
    // Das Formular liefert Felder, keine Interpretation — volle Sicherheit.
    confidence: 1,
    rawInput: submission,
  };
}

/** Was der Chat-Agent per Tool-Use strukturiert zurückgibt. */
export interface AgentExtraction {
  intent: RequestType;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  date?: unknown;
  time?: unknown;
  partySize?: unknown;
  message?: unknown;
  dietaryNotes?: unknown;
  occasion?: unknown;
  confidence?: unknown;
  escalate?: unknown;
  relatedRequestId?: unknown;
}

export function fromChat(
  tenantId: string,
  conversationId: string,
  extraction: AgentExtraction,
): RawInbound {
  return {
    tenantId,
    channel: "chat",
    intent: extraction.intent,
    conversationId,
    externalId: conversationId,
    customer: {
      name: str(extraction.name),
      phone: str(extraction.phone),
      email: str(extraction.email),
    },
    date: str(extraction.date),
    time: str(extraction.time),
    partySize: typeof extraction.partySize === "number" ? extraction.partySize : str(extraction.partySize),
    details: {
      message: str(extraction.message),
      occasion: str(extraction.occasion),
      dietaryNotes: Array.isArray(extraction.dietaryNotes) ? extraction.dietaryNotes : [],
    },
    confidence: typeof extraction.confidence === "number" ? extraction.confidence : null,
    escalate: extraction.escalate === true,
    relatedRequestId: str(extraction.relatedRequestId),
    rawInput: extraction,
  };
}

// ---------------------------------------------------------------------------
// Voice
// ---------------------------------------------------------------------------

/**
 * Voice-Payload → RawInbound.
 *
 * ⚠️ Die Feldpfade sind defensiv gegen mehrere plausible Hüllen gebaut, aber
 * **noch nicht gegen einen echten Anruf verifiziert**. Vor dem Livegang muss der
 * tatsächliche Payload eines Testanrufs mitgeschnitten und dieser Adapter
 * dagegen geprüft werden. Bis dahin gilt er als unbestätigt.
 *
 * Der Idempotenzschlüssel ist der eigentliche Zweck dieser Funktion: Voice-
 * Provider liefern bei Timeout erneut aus, und ohne stabilen Schlüssel entstehen
 * doppelte Reservierungen und doppelte Gast-E-Mails.
 */
export function voiceIdempotencyKey(
  provider: string,
  callId: string,
  eventType: string,
  toolCallId?: string | null,
): string {
  return [provider, callId, eventType, toolCallId ?? ""].join(":");
}

export interface VoicePayloadResult {
  inbound: RawInbound;
  callId: string;
  eventType: string;
}

export function fromVoice(
  tenantId: string,
  provider: string,
  body: unknown,
): VoicePayloadResult | null {
  const callId =
    str(pick(body, "message", "call", "id")) ??
    str(pick(body, "call", "id")) ??
    str(pick(body, "callId"));
  const eventType =
    str(pick(body, "message", "type")) ?? str(pick(body, "type")) ?? "unknown";

  // Ohne Call-ID gibt es keinen stabilen Idempotenzschlüssel. Eine solche
  // Zustellung darf nicht verarbeitet werden — der Aufrufer speichert den
  // Rohpayload und alarmiert.
  if (!callId) return null;

  const args =
    pick(body, "message", "toolCalls", "0", "function", "arguments") ??
    pick(body, "message", "functionCall", "parameters") ??
    pick(body, "message", "analysis", "structuredData") ??
    {};
  const extraction = (typeof args === "object" && args !== null ? args : {}) as AgentExtraction;
  const toolCallId = str(pick(body, "message", "toolCalls", "0", "id"));

  const intent: RequestType =
    typeof extraction.intent === "string" ? extraction.intent : "reservation";

  return {
    callId,
    eventType,
    inbound: {
      tenantId,
      channel: "voice",
      intent,
      conversationId: null,
      externalId: callId,
      idempotencyKey: voiceIdempotencyKey(provider, callId, eventType, toolCallId),
      customer: {
        name: str(extraction.name),
        phone: str(extraction.phone) ?? str(pick(body, "message", "call", "customer", "number")),
        email: str(extraction.email),
      },
      date: str(extraction.date),
      time: str(extraction.time),
      partySize:
        typeof extraction.partySize === "number" ? extraction.partySize : str(extraction.partySize),
      details: {
        message: str(extraction.message),
        occasion: str(extraction.occasion),
        dietaryNotes: Array.isArray(extraction.dietaryNotes) ? extraction.dietaryNotes : [],
      },
      confidence: typeof extraction.confidence === "number" ? extraction.confidence : null,
      escalate: extraction.escalate === true,
      relatedRequestId: str(extraction.relatedRequestId),
      rawInput: body,
    },
  };
}
