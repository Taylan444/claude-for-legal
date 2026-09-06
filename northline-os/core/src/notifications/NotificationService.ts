/**
 * NotificationService — die zentrale Benachrichtigungsschicht.
 *
 * Nirgends im System wird ein E-Mail-Anbieter direkt aufgerufen. Alles läuft
 * hierüber. Das ist der Grund, warum Absender, Antwortadresse, Sprache und
 * Vorlagen pro Mandant funktionieren, ohne dass an fünf Stellen dasselbe
 * nachgezogen werden muss — und warum ein Anbieterwechsel eine Datei betrifft.
 *
 * `sendFollowUp()` aus der Zielarchitektur fehlt hier bewusst: Nachfassen
 * braucht einen zeitlichen Auslöser, den es noch nicht gibt. Eine Methode, die
 * niemand aufruft, wäre toter Code in einem Produktionspfad.
 */

import type { EmailProvider, Logger } from "../ports.ts";
import type { TenantConfig } from "../types.ts";
import {
  businessEscalation,
  businessNewRequest,
  customerReceived,
  internalAlert,
  localeFor,
  type RequestSummary,
} from "./templates.ts";

export type NotificationOutcome =
  | { delivered: true; messageId: string }
  | { delivered: false; reason: "disabled_by_tenant" | "no_recipient" };

export interface NotificationDeps {
  email: EmailProvider;
  logger: Logger;
}

export class NotificationService {
  private email: EmailProvider;
  private logger: Logger;

  constructor(deps: NotificationDeps) {
    this.email = deps.email;
    this.logger = deps.logger;
  }

  /**
   * Eingangsbestätigung an den Gast.
   *
   * `idempotencyKey` ist hier keine Kür: Bricht ein Zustellversuch ab, nachdem
   * der Anbieter die Nachricht angenommen hat, wiederholt der Dispatcher das
   * Event — ohne den Schlüssel bekäme der Gast die Mail zweimal.
   */
  async sendCustomerConfirmation(
    summary: RequestSummary,
    config: TenantConfig,
    idempotencyKey: string,
  ): Promise<NotificationOutcome> {
    if (!config.notifications.confirmCustomer) {
      // Manche Betriebe wollen jede Anfrage selbst beantworten.
      return { delivered: false, reason: "disabled_by_tenant" };
    }
    if (!summary.customerEmail) {
      return { delivered: false, reason: "no_recipient" };
    }

    const locale = localeFor(config);
    const rendered = customerReceived(summary, config, locale);
    return this.dispatch([summary.customerEmail], rendered, config, idempotencyKey, "email:customer");
  }

  /** Neue oder eskalierte Anfrage an den Betrieb. */
  async sendBusinessNotification(
    summary: RequestSummary,
    config: TenantConfig,
    idempotencyKey: string,
  ): Promise<NotificationOutcome> {
    const recipients = config.notifications.businessRecipients;
    if (recipients.length === 0) return { delivered: false, reason: "no_recipient" };

    const locale = localeFor(config);
    const rendered =
      summary.status === "escalated"
        ? businessEscalation(summary, config, locale)
        : businessNewRequest(summary, config, locale);

    return this.dispatch([...recipients], rendered, config, idempotencyKey, "email:business");
  }

  /** Interner Alarm an Northline. Geht nie an Kunden oder Gäste. */
  async sendInternalAlert(
    subject: string,
    body: string,
    config: TenantConfig,
    idempotencyKey: string,
  ): Promise<NotificationOutcome> {
    const recipients = config.notifications.internalAlertRecipients;
    if (recipients.length === 0) return { delivered: false, reason: "no_recipient" };

    return this.dispatch(
      [...recipients],
      internalAlert(subject, body),
      config,
      idempotencyKey,
      "email:internal",
    );
  }

  private async dispatch(
    to: string[],
    rendered: { subject: string; text: string },
    config: TenantConfig,
    idempotencyKey: string,
    target: string,
  ): Promise<NotificationOutcome> {
    const identity = config.notifications.identity;
    const { id } = await this.email.send({
      to,
      fromName: identity.fromName,
      fromEmail: identity.fromEmail,
      replyTo: identity.replyTo ?? null,
      subject: rendered.subject,
      text: rendered.text,
      idempotencyKey,
    });

    this.logger.info("notification.sent", {
      tenantId: config.clientId,
      target,
      recipients: to.length,
      messageId: id,
    });

    return { delivered: true, messageId: id };
  }
}
