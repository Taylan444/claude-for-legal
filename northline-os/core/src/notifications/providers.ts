/**
 * E-Mail-Anbieter hinter dem Port `EmailProvider`.
 */

import type { EmailMessage, EmailProvider, HttpClient } from "../ports.ts";

/** Für Tests und lokale Entwicklung: sammelt statt zu senden. */
export class MemoryEmailProvider implements EmailProvider {
  sent: EmailMessage[] = [];
  failures = 0;
  private counter = 0;

  async send(message: EmailMessage): Promise<{ id: string }> {
    if (this.failures > 0) {
      this.failures -= 1;
      throw new Error("E-Mail-Anbieter nicht erreichbar");
    }
    this.counter += 1;
    this.sent.push(message);
    return { id: `mem-${this.counter}` };
  }
}

export interface ResendOptions {
  apiKey: string;
  http: HttpClient;
  baseUrl?: string;
}

/**
 * Resend-Anbindung.
 *
 * ⚠️ **Nicht gegen die echte API verifiziert.** Payload und Endpunkt sind nach
 * bestem Wissen gebaut, aber ohne Zugangsdaten nicht überprüfbar. Vor dem
 * ersten produktiven Versand ist beides gegen die aktuelle Anbieter-
 * Dokumentation zu prüfen. Bis dahin gilt diese Klasse als unbestätigt — der
 * getestete Weg ist `MemoryEmailProvider`.
 *
 * Der Schlüssel wird ausschließlich übergeben, nie hier gelesen: kein
 * `process.env` in einer Klasse, die sonst überall einsetzbar wäre.
 */
export class ResendEmailProvider implements EmailProvider {
  private apiKey: string;
  private http: HttpClient;
  private baseUrl: string;

  constructor(options: ResendOptions) {
    this.apiKey = options.apiKey;
    this.http = options.http;
    this.baseUrl = options.baseUrl ?? "https://api.resend.com";
  }

  async send(message: EmailMessage): Promise<{ id: string }> {
    const headers: Record<string, string> = {
      "content-type": "application/json",
      authorization: `Bearer ${this.apiKey}`,
    };
    // Schützt gegen Doppelversand, wenn ein Versuch nach dem Senden abbricht.
    if (message.idempotencyKey) headers["idempotency-key"] = message.idempotencyKey;

    const body: Record<string, unknown> = {
      from: `${message.fromName} <${message.fromEmail}>`,
      to: [...message.to],
      subject: message.subject,
      text: message.text,
    };
    if (message.replyTo) body.reply_to = message.replyTo;

    const response = await this.http.send({
      url: `${this.baseUrl}/emails`,
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`E-Mail-Anbieter antwortete mit ${response.status}: ${response.body}`);
    }

    const parsed = JSON.parse(response.body) as { id?: unknown };
    if (typeof parsed.id !== "string") {
      throw new Error("E-Mail-Anbieter lieferte keine Nachrichten-ID");
    }
    return { id: parsed.id };
  }
}
