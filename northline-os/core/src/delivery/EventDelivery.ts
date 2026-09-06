/**
 * EventDelivery — vom Event zu den tatsächlichen Empfängern.
 *
 * Ein Event geht an mehrere Ziele: Gast, Betrieb, Make. Scheitert nur eines,
 * wiederholt der Dispatcher das ganze Event. Ohne Gegenmaßnahme bekäme der Gast
 * dann bei jedem Versuch eine weitere Bestätigung. Deshalb wird jedes Ziel
 * einzeln protokolliert und beim nächsten Anlauf übersprungen, wenn es schon
 * zugestellt war.
 *
 * Das ist der Unterschied zwischen "Wiederholung ist sicher" und "Wiederholung
 * belästigt den Gast".
 */

import type {
  DeliveryLog,
  DeliveryPort,
  DeliveryResult,
  Logger,
  SecretResolver,
  TenantConfigStore,
} from "../ports.ts";
import type { OutboxEvent, TenantConfig } from "../types.ts";
import type { NotificationService } from "../notifications/NotificationService.ts";
import { summarize } from "../notifications/templates.ts";
import type { WebhookSender } from "./webhook.ts";

export interface EventDeliveryDeps {
  tenants: TenantConfigStore;
  notifications: NotificationService;
  webhooks: WebhookSender;
  secrets: SecretResolver;
  log: DeliveryLog;
  logger: Logger;
  now(): Date;
}

/** Events, die den Betrieb und die angebundenen Systeme betreffen. */
const REQUEST_EVENTS = new Set([
  "reservation.requested",
  "appointment.requested",
  "lead.created",
]);

export class EventDelivery implements DeliveryPort {
  private deps: EventDeliveryDeps;

  constructor(deps: EventDeliveryDeps) {
    this.deps = deps;
  }

  async deliver(event: OutboxEvent): Promise<DeliveryResult> {
    const config = await this.deps.tenants.get(event.tenantId);
    if (!config) {
      // Kein Retry sinnvoll: ein unbekannter Mandant wird nicht von selbst bekannt.
      throw new Error(`Unbekannter Mandant ${event.tenantId} bei Event ${event.id}`);
    }

    const attempted: string[] = [];
    const failures: string[] = [];

    for (const target of this.planTargets(event, config)) {
      if (await this.deps.log.wasDelivered(event.id, target)) continue;
      attempted.push(target);
      try {
        await this.execute(target, event, config);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`${target}: ${message}`);
        await this.deps.log.record({
          eventId: event.id,
          tenantId: event.tenantId,
          target,
          status: "failed",
          error: message,
        });
      }
    }

    if (failures.length > 0) {
      // Wirft, damit der Dispatcher wiederholt — die bereits erfolgreichen
      // Ziele sind protokolliert und werden dann übersprungen.
      throw new Error(failures.join("; "));
    }

    return { target: attempted.join(",") || "nichts offen" };
  }

  /** Welche Ziele dieses Event hat. Reine Funktion der Konfiguration. */
  private planTargets(event: OutboxEvent, config: TenantConfig): string[] {
    const targets: string[] = [];

    if (REQUEST_EVENTS.has(event.type)) {
      targets.push("email:customer", "email:business");
    } else if (event.type === "escalation.requested") {
      // Bewusst keine automatische Mail an den Gast: bei einer Beschwerde oder
      // einem Rückrufwunsch schreibt ein Mensch, nicht das System.
      targets.push("email:business");
    } else if (event.type === "request.status_changed") {
      targets.push("email:business");
    } else if (event.type === "notification.failed") {
      targets.push("email:internal");
    }

    for (const webhook of config.webhooks) {
      if (webhook.events.includes(event.type)) targets.push(`webhook:${webhook.id}`);
    }

    return targets;
  }

  private async execute(target: string, event: OutboxEvent, config: TenantConfig): Promise<void> {
    const summary = summarize(event.payload);
    const key = `${event.id}:${target}`;

    if (target.startsWith("webhook:")) {
      const id = target.slice("webhook:".length);
      const webhook = config.webhooks.find((w) => w.id === id);
      if (!webhook) throw new Error(`Webhook ${id} ist nicht mehr konfiguriert`);

      const secret = await this.deps.secrets.resolve(webhook.secretRef);
      if (!secret) {
        // Lieber scheitern als unsigniert senden.
        throw new Error(`Secret ${webhook.secretRef} für Webhook ${id} nicht auflösbar`);
      }

      await this.deps.webhooks.send(webhook, event, secret, this.deps.now());
      await this.deps.log.record({
        eventId: event.id,
        tenantId: event.tenantId,
        target,
        status: "sent",
      });
      return;
    }

    const outcome =
      target === "email:customer"
        ? await this.deps.notifications.sendCustomerConfirmation(summary, config, key)
        : target === "email:business"
          ? await this.deps.notifications.sendBusinessNotification(summary, config, key)
          : await this.deps.notifications.sendInternalAlert(
              `Zustellung fehlgeschlagen (${event.type})`,
              JSON.stringify(event.payload, null, 2),
              config,
              key,
            );

    await this.deps.log.record({
      eventId: event.id,
      tenantId: event.tenantId,
      target,
      status: outcome.delivered ? "sent" : "skipped",
      providerMessageId: outcome.delivered ? outcome.messageId : null,
      error: outcome.delivered ? null : outcome.reason,
    });
  }
}
