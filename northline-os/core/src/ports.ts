/**
 * Ports — die Schnittstellen, gegen die der Kern gebaut ist.
 *
 * Der Kern kennt weder Postgres noch Resend noch Vapi. Er kennt diese
 * Interfaces. Das ist der Grund, warum ein Anbieterwechsel später eine Datei
 * betrifft und nicht ein Projekt — und warum der gesamte Kern ohne Datenbank
 * und ohne Netzwerk testbar ist.
 */

import type {
  NorthlineRequest,
  OutboxEvent,
  TenantConfig,
} from "./types.ts";

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  next(): string;
}

export interface Logger {
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
}

export interface TenantConfigStore {
  /** Null, wenn der Mandant unbekannt oder deaktiviert ist. */
  get(tenantId: string): Promise<TenantConfig | null>;
}

export interface IdempotencyRecord {
  key: string;
  tenantId: string;
  requestHash: string;
  response: unknown;
}

/**
 * Die Transaktionsklammer. Fachliche Änderung und ausgehendes Event werden
 * gemeinsam geschrieben oder gar nicht — dass beides durch dasselbe `tx` geht,
 * ist keine Konvention, sondern durch die Typen erzwungen.
 */
export interface Tx {
  insertRequest(request: NorthlineRequest): Promise<void>;
  updateRequest(request: NorthlineRequest): Promise<void>;
  findRequest(tenantId: string, requestId: string): Promise<NorthlineRequest | null>;
  appendEvents(events: readonly OutboxEvent[]): Promise<void>;
  saveIdempotency(record: IdempotencyRecord): Promise<void>;
}

export interface Store {
  transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
  getIdempotency(tenantId: string, key: string): Promise<IdempotencyRecord | null>;
}

export interface Deps {
  clock: Clock;
  ids: IdGenerator;
  tenants: TenantConfigStore;
  store: Store;
  logger: Logger;
}

// ---------------------------------------------------------------------------
// Zustellung (vom Outbox-Dispatcher genutzt)
// ---------------------------------------------------------------------------

export interface DeliveryResult {
  target: string;
  providerMessageId?: string | null;
}

export interface DeliveryPort {
  /** Wirft bei Fehlschlag. Der Dispatcher entscheidet über Wiederholung. */
  deliver(event: OutboxEvent): Promise<DeliveryResult>;
}

/**
 * Zustellprotokoll je Ziel.
 *
 * Der Grund: ein Event geht an mehrere Ziele (Gast-E-Mail, Betriebs-E-Mail,
 * Make-Webhook). Scheitert nur das letzte, wiederholt der Dispatcher das ganze
 * Event — ohne dieses Protokoll bekäme der Gast bei jedem Versuch eine weitere
 * Bestätigung. Bereits zugestellte Ziele werden übersprungen.
 */
export interface DeliveryLogEntry {
  eventId: string;
  tenantId: string;
  target: string;
  /** "skipped" = bewusst nicht gesendet (Mandant deaktiviert, kein Empfänger). */
  status: "sent" | "failed" | "skipped";
  providerMessageId?: string | null;
  error?: string | null;
}

export interface DeliveryLog {
  wasDelivered(eventId: string, target: string): Promise<boolean>;
  record(entry: DeliveryLogEntry): Promise<void>;
}

/** Löst eine Secret-Referenz aus der Konfiguration in den echten Wert auf. */
export interface SecretResolver {
  resolve(ref: string): Promise<string | null>;
}

export interface EmailMessage {
  to: readonly string[];
  fromName: string;
  fromEmail: string;
  replyTo?: string | null;
  subject: string;
  text: string;
  /** Verhindert Doppelversand, wenn ein Zustellversuch nach dem Senden abbricht. */
  idempotencyKey?: string | null;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<{ id: string }>;
}

export interface HttpRequest {
  url: string;
  method: "POST";
  headers: Record<string, string>;
  body: string;
}

export interface HttpClient {
  send(request: HttpRequest): Promise<{ status: number; body: string }>;
}

export interface OutboxStore {
  /** Fällige, noch nicht zugestellte, nicht totgelegte Events. */
  claimDue(now: Date, limit: number): Promise<OutboxEvent[]>;
  markDelivered(id: string, at: Date, result: DeliveryResult): Promise<void>;
  markRetry(id: string, nextRetryAt: Date, attempts: number, error: string): Promise<void>;
  markDeadLettered(id: string, at: Date, error: string): Promise<void>;
}
