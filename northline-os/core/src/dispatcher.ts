/**
 * Outbox-Dispatcher — keine stille Datenvernichtung.
 *
 * Läuft als Minuten-Cron. Holt fällige Events, stellt zu, und wiederholt bei
 * Fehlschlag mit wachsendem Abstand. Was nach der letzten Wiederholung immer
 * noch scheitert, wird totgelegt statt verworfen: eine Zeile mit
 * dead_lettered_at ist sichtbar, ein verlorenes Event nicht.
 *
 * Bewusst keine Queue-Infrastruktur. Eine Tabelle und ein Cron erfüllen die
 * Anforderung vollständig und kosten nichts.
 */

import type { OutboxEvent } from "./types.ts";
import type { Clock, DeliveryPort, Logger, OutboxStore } from "./ports.ts";

export interface DispatcherOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  batchSize: number;
  /** 0..1, injizierbar damit Tests deterministisch sind. */
  jitter: () => number;
}

export const DEFAULT_DISPATCHER_OPTIONS: DispatcherOptions = {
  maxAttempts: 5,
  baseDelayMs: 30_000,
  maxDelayMs: 3_600_000,
  batchSize: 50,
  jitter: Math.random,
};

export interface DispatchSummary {
  claimed: number;
  delivered: number;
  retried: number;
  deadLettered: number;
}

export interface DispatcherDeps {
  outbox: OutboxStore;
  delivery: DeliveryPort;
  clock: Clock;
  logger: Logger;
}

/**
 * Exponentiell mit Jitter. Der Jitter verhindert, dass nach einem
 * Anbieterausfall alle wartenden Events gleichzeitig erneut anlaufen und den
 * gerade erst erholten Dienst sofort wieder umwerfen.
 */
export function backoffMs(attempts: number, options: DispatcherOptions): number {
  const exponential = options.baseDelayMs * 2 ** Math.max(0, attempts - 1);
  const capped = Math.min(exponential, options.maxDelayMs);
  return Math.round(capped * (1 + options.jitter() * 0.2));
}

export async function dispatchDue(
  deps: DispatcherDeps,
  overrides: Partial<DispatcherOptions> = {},
): Promise<DispatchSummary> {
  const options: DispatcherOptions = { ...DEFAULT_DISPATCHER_OPTIONS, ...overrides };
  const now = deps.clock.now();
  const due = await deps.outbox.claimDue(now, options.batchSize);

  const summary: DispatchSummary = {
    claimed: due.length,
    delivered: 0,
    retried: 0,
    deadLettered: 0,
  };

  for (const event of due) {
    await deliverOne(event, deps, options, summary);
  }

  return summary;
}

async function deliverOne(
  event: OutboxEvent,
  deps: DispatcherDeps,
  options: DispatcherOptions,
  summary: DispatchSummary,
): Promise<void> {
  try {
    const result = await deps.delivery.deliver(event);
    await deps.outbox.markDelivered(event.id, deps.clock.now(), result);
    summary.delivered += 1;
    deps.logger.info("outbox.delivered", {
      eventId: event.id,
      tenantId: event.tenantId,
      type: event.type,
      target: result.target,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const attempts = event.attempts + 1;

    if (attempts >= options.maxAttempts) {
      await deps.outbox.markDeadLettered(event.id, deps.clock.now(), message);
      summary.deadLettered += 1;
      // Ab hier muss ein Mensch schauen. Diese Zeile ist der Alarm-Anker.
      deps.logger.error("outbox.dead_lettered", {
        eventId: event.id,
        tenantId: event.tenantId,
        type: event.type,
        attempts,
        error: message,
      });
      return;
    }

    const nextRetryAt = new Date(deps.clock.now().getTime() + backoffMs(attempts, options));
    await deps.outbox.markRetry(event.id, nextRetryAt, attempts, message);
    summary.retried += 1;
    deps.logger.warn("outbox.retry_scheduled", {
      eventId: event.id,
      tenantId: event.tenantId,
      type: event.type,
      attempts,
      nextRetryAt: nextRetryAt.toISOString(),
      error: message,
    });
  }
}
