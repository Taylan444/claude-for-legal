/**
 * Events — was das System nach außen meldet.
 *
 * Erzeugt werden sie hier, geschrieben werden sie ausschließlich innerhalb der
 * Transaktion, die auch die fachliche Änderung schreibt.
 */

import type { EventType, NorthlineRequest, OutboxEvent, RequestType } from "./types.ts";
import type { Clock, IdGenerator } from "./ports.ts";

const REQUEST_EVENT: Partial<Record<RequestType, EventType>> = {
  reservation: "reservation.requested",
  appointment: "appointment.requested",
  lead: "lead.created",
};

export function newEvent(
  type: EventType,
  tenantId: string,
  payload: Record<string, unknown>,
  deps: { clock: Clock; ids: IdGenerator },
): OutboxEvent {
  const now = deps.clock.now();
  return {
    id: deps.ids.next(),
    tenantId,
    type,
    payload,
    createdAt: now,
    attempts: 0,
    nextRetryAt: now,
    deliveredAt: null,
    deadLetteredAt: null,
    lastError: null,
  };
}

/** Der Payload, den Make und die Benachrichtigungsschicht sehen. */
export function requestPayload(request: NorthlineRequest): Record<string, unknown> {
  return {
    requestId: request.requestId,
    clientId: request.clientId,
    conversationId: request.conversationId,
    channel: request.channel,
    type: request.type,
    status: request.status,
    customer: request.customer,
    requestedAt: request.requestedAt ? request.requestedAt.toISOString() : null,
    requestedLocal: request.requestedLocal,
    partySize: request.partySize,
    details: request.details,
    issues: request.issues,
    missingFields: request.missingFields,
  };
}

/**
 * Welche Events eine Anfrage auslöst.
 *
 * needs_info löst bewusst nichts aus: eine unvollständige Anfrage ist
 * gespeichert und im Dashboard sichtbar, aber sie ist für den Betrieb noch
 * nicht handlungsreif. Der Agent fragt weiter.
 */
export function eventsFor(
  request: NorthlineRequest,
  deps: { clock: Clock; ids: IdGenerator },
): OutboxEvent[] {
  const payload = requestPayload(request);
  const events: OutboxEvent[] = [];

  if (request.status === "escalated") {
    events.push(newEvent("escalation.requested", request.clientId, payload, deps));
    return events;
  }

  if (request.status === "new") {
    const type = REQUEST_EVENT[request.type];
    if (type) events.push(newEvent(type, request.clientId, payload, deps));
  }

  return events;
}
