/**
 * handleInboundRequest — der einzige Schreibpfad von Northline OS.
 *
 * Chat, Voice und Formular unterscheiden sich ausschließlich im Adapter davor.
 * Ab hier gibt es genau eine Logik. Das ist die Entscheidung, aus der fast
 * alles andere folgt: was hier geprüft wird, gilt für jeden Kanal, und eine
 * Änderung muss einmal gebaut und einmal getestet werden statt zweimal.
 *
 * Ablauf:
 *   Mandant auflösen → Idempotenz → Normalisierung → Pflichtfelder → Regeln
 *   → Status → in EINER Transaktion: Anfrage + Events + Idempotenz-Eintrag
 */

import type {
  IntakeResult,
  Issue,
  NorthlineRequest,
  OutboxEvent,
  RawInbound,
} from "./types.ts";
import type { Deps, Tx } from "./ports.ts";
import { IdempotencyConflictError, UnknownTenantError } from "./errors.ts";
import { normalizeInbound } from "./normalize.ts";
import { applyRules, decideStatus, findMissingFields } from "./rules.ts";
import { eventsFor, newEvent, requestPayload } from "./events.ts";
import { hashPayload } from "./hash.ts";
import { formatDate, formatMinutes } from "./time.ts";

/** Der Teil der Eingabe, der ein Duplikat von einer Änderung unterscheidet. */
function idempotencyFingerprint(input: RawInbound): unknown {
  return {
    tenantId: input.tenantId,
    channel: input.channel,
    intent: input.intent,
    customer: input.customer ?? null,
    date: input.date ?? null,
    time: input.time ?? null,
    partySize: input.partySize ?? null,
    details: input.details ?? null,
    relatedRequestId: input.relatedRequestId ?? null,
    escalate: input.escalate ?? false,
  };
}

export async function handleInboundRequest(
  input: RawInbound,
  deps: Deps,
): Promise<IntakeResult> {
  const config = await deps.tenants.get(input.tenantId);
  if (!config) throw new UnknownTenantError(input.tenantId);

  const fingerprint = hashPayload(idempotencyFingerprint(input));
  const key = input.idempotencyKey ?? null;

  // Doppelte Zustellung: dieselbe Anfrage ein zweites Mal. Die gespeicherte
  // Antwort zurückgeben, nichts erneut schreiben.
  if (key) {
    const existing = await deps.store.getIdempotency(input.tenantId, key);
    if (existing) {
      if (existing.requestHash !== fingerprint) {
        throw new IdempotencyConflictError(key);
      }
      deps.logger.info("intake.deduplicated", { tenantId: input.tenantId, key });
      return { ...(existing.response as IntakeResult), deduplicated: true };
    }
  }

  const now = deps.clock.now();
  const normalized = normalizeInbound(input, config);
  const missingFields = findMissingFields(normalized, input.intent, config);
  const { issues, requestedAt } = applyRules({
    normalized,
    type: input.intent,
    config,
    now,
    escalateRequested: input.escalate === true,
  });

  const requestedLocal =
    normalized.date !== null && normalized.minutes !== null
      ? `${formatDate(normalized.date)} ${formatMinutes(normalized.minutes)}`
      : null;

  const request: NorthlineRequest = {
    requestId: deps.ids.next(),
    clientId: config.clientId,
    conversationId: input.conversationId ?? null,
    channel: input.channel,
    type: input.intent,
    status: decideStatus(issues, missingFields),
    customer: normalized.customer,
    requestedAt,
    requestedLocal,
    partySize: normalized.partySize,
    details: normalized.details,
    issues,
    missingFields,
    confidence: normalized.confidence,
    relatedRequestId: input.relatedRequestId ?? null,
    // Der Rohpayload wird immer mitgeschrieben. Ohne ihn ist die Frage
    // "warum steht da 19:30 und nicht 20:30?" nicht beantwortbar.
    rawInput: input.rawInput ?? null,
    createdAt: now,
    updatedAt: now,
  };

  const result = await deps.store.transaction(async (tx) => {
    const extraEvents: OutboxEvent[] = [];

    if (input.intent === "cancellation") {
      await applyCancellation(request, issues, tx, deps, extraEvents);
    }

    await tx.insertRequest(request);
    const events = [...eventsFor(request, deps), ...extraEvents];
    if (events.length > 0) await tx.appendEvents(events);

    const intakeResult: IntakeResult = {
      requestId: request.requestId,
      status: request.status,
      missingFields: request.missingFields,
      issues: request.issues,
      events: events.map((e) => e.type),
      deduplicated: false,
    };

    if (key) {
      await tx.saveIdempotency({
        key,
        tenantId: config.clientId,
        requestHash: fingerprint,
        response: intakeResult,
      });
    }

    return intakeResult;
  });

  deps.logger.info("intake.completed", {
    tenantId: config.clientId,
    requestId: result.requestId,
    channel: input.channel,
    type: input.intent,
    status: result.status,
    events: result.events,
  });

  return result;
}

/**
 * Stornierung. Die zu stornierende Anfrage muss existieren und demselben
 * Mandanten gehören — die Prüfung läuft in derselben Transaktion, damit
 * zwischen Fund und Änderung nichts dazwischenkommt.
 */
async function applyCancellation(
  request: NorthlineRequest,
  issues: Issue[],
  tx: Tx,
  deps: Deps,
  out: OutboxEvent[],
): Promise<void> {
  const relatedId = request.relatedRequestId;
  const target = relatedId
    ? await tx.findRequest(request.clientId, relatedId)
    : null;

  if (!target) {
    issues.push("unknown_related_request");
    request.issues = issues;
    request.status = "needs_info";
    return;
  }

  const previousStatus = target.status;
  target.status = "cancelled";
  target.updatedAt = request.updatedAt;
  await tx.updateRequest(target);

  request.status = "cancelled";
  out.push(
    newEvent(
      "request.status_changed",
      request.clientId,
      {
        ...requestPayload(target),
        previousStatus,
        cancelledBy: request.requestId,
      },
      deps,
    ),
  );
}
