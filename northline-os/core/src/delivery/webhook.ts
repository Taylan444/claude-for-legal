/**
 * Ausgehende Webhooks — signiert.
 *
 * Ein unsignierter Webhook ist eine offene Tür: Wer die URL kennt, kann im
 * Namen des Mandanten Ereignisse einspeisen. Signiert wird über Zeitstempel und
 * Rumpf gemeinsam, damit eine abgefangene Zustellung nicht später erneut
 * eingespielt werden kann.
 *
 * `verifySignature` ist dasselbe Verfahren in Gegenrichtung und wird für
 * eingehende Webhooks (Voice-Provider) gebraucht, sobald die HTTP-Schicht steht.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import type { HttpClient } from "../ports.ts";
import type { OutboxEvent, OutboundWebhook } from "../types.ts";

export const SIGNATURE_HEADER = "x-northline-signature";
export const TIMESTAMP_HEADER = "x-northline-timestamp";
export const EVENT_ID_HEADER = "x-northline-event-id";

/** Signatur über "<Zeitstempel>.<Rumpf>", damit ein Replay auffällt. */
export function computeSignature(secret: string, timestamp: number, body: string): string {
  return `v1=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
}

export interface VerifyOptions {
  /** Zulässige Abweichung des Zeitstempels in Sekunden. */
  toleranceSeconds?: number;
  now?: Date;
}

/**
 * Prüft eine eingehende Signatur. Der Vergleich ist laufzeitkonstant — ein
 * gewöhnlicher Stringvergleich verrät über die Antwortzeit, wie viele Zeichen
 * stimmen.
 */
export function verifySignature(
  secret: string,
  timestamp: number,
  body: string,
  presented: string,
  options: VerifyOptions = {},
): boolean {
  const tolerance = options.toleranceSeconds ?? 300;
  const now = Math.floor((options.now ?? new Date()).getTime() / 1000);
  if (!Number.isFinite(timestamp) || Math.abs(now - timestamp) > tolerance) return false;

  const expected = Buffer.from(computeSignature(secret, timestamp, body));
  const actual = Buffer.from(presented);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export class WebhookSender {
  private http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async send(webhook: OutboundWebhook, event: OutboxEvent, secret: string, now: Date): Promise<void> {
    const body = JSON.stringify({
      id: event.id,
      type: event.type,
      clientId: event.tenantId,
      createdAt: event.createdAt.toISOString(),
      data: event.payload,
    });
    const timestamp = Math.floor(now.getTime() / 1000);

    const response = await this.http.send({
      url: webhook.url,
      method: "POST",
      headers: {
        "content-type": "application/json",
        [EVENT_ID_HEADER]: event.id,
        [TIMESTAMP_HEADER]: String(timestamp),
        [SIGNATURE_HEADER]: computeSignature(secret, timestamp, body),
      },
      body,
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`Webhook ${webhook.id} antwortete mit ${response.status}`);
    }
  }
}
