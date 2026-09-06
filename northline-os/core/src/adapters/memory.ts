/**
 * In-Memory-Adapter — für Tests und lokale Entwicklung.
 *
 * Die Transaktion ist hier echt: Schreibvorgänge landen zunächst in einem
 * Zwischenspeicher und werden erst übernommen, wenn die Funktion ohne Fehler
 * durchläuft. Damit prüft ein Test die Atomizität tatsächlich, statt sie
 * anzunehmen.
 */

import type { NorthlineRequest, OutboxEvent } from "../types.ts";
import type {
  Clock,
  DeliveryResult,
  IdGenerator,
  IdempotencyRecord,
  Logger,
  OutboxStore,
  Store,
  TenantConfigStore,
  Tx,
} from "../ports.ts";
import type { TenantConfig } from "../types.ts";

export class FixedClock implements Clock {
  current: Date;
  constructor(current: Date) {
    this.current = current;
  }
  now(): Date {
    return new Date(this.current.getTime());
  }
  advance(ms: number): void {
    this.current = new Date(this.current.getTime() + ms);
  }
}

export class SequentialIds implements IdGenerator {
  private counter = 0;
  private prefix: string;
  constructor(prefix = "id") {
    this.prefix = prefix;
  }
  next(): string {
    this.counter += 1;
    return `${this.prefix}-${this.counter}`;
  }
}

export interface LogLine {
  level: "info" | "warn" | "error";
  message: string;
  fields: Record<string, unknown>;
}

export class RecordingLogger implements Logger {
  lines: LogLine[] = [];
  info(message: string, fields: Record<string, unknown> = {}): void {
    this.lines.push({ level: "info", message, fields });
  }
  warn(message: string, fields: Record<string, unknown> = {}): void {
    this.lines.push({ level: "warn", message, fields });
  }
  error(message: string, fields: Record<string, unknown> = {}): void {
    this.lines.push({ level: "error", message, fields });
  }
}

export class MemoryTenantStore implements TenantConfigStore {
  private configs = new Map<string, TenantConfig>();
  constructor(configs: readonly TenantConfig[] = []) {
    for (const config of configs) this.configs.set(config.clientId, config);
  }
  put(config: TenantConfig): void {
    this.configs.set(config.clientId, config);
  }
  async get(tenantId: string): Promise<TenantConfig | null> {
    return this.configs.get(tenantId) ?? null;
  }
}

/** Schreiboperationen, die ein Test gezielt scheitern lassen kann. */
export type StoreFault = "insertRequest" | "updateRequest" | "appendEvents" | "saveIdempotency";

export class MemoryStore implements Store {
  requests = new Map<string, NorthlineRequest>();
  events: OutboxEvent[] = [];
  idempotency = new Map<string, IdempotencyRecord>();
  faults = new Set<StoreFault>();

  async getIdempotency(tenantId: string, key: string): Promise<IdempotencyRecord | null> {
    const record = this.idempotency.get(`${tenantId}:${key}`);
    return record ? structuredClone(record) : null;
  }

  async transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
    const stagedRequests = new Map<string, NorthlineRequest>();
    const stagedEvents: OutboxEvent[] = [];
    const stagedIdempotency: IdempotencyRecord[] = [];
    const faults = this.faults;
    const committed = this.requests;

    const guard = (operation: StoreFault): void => {
      if (faults.has(operation)) {
        throw new Error(`simulierter Speicherfehler: ${operation}`);
      }
    };

    const tx: Tx = {
      async insertRequest(request) {
        guard("insertRequest");
        stagedRequests.set(request.requestId, structuredClone(request));
      },
      async updateRequest(request) {
        guard("updateRequest");
        stagedRequests.set(request.requestId, structuredClone(request));
      },
      async findRequest(tenantId, requestId) {
        const found = stagedRequests.get(requestId) ?? committed.get(requestId);
        if (!found || found.clientId !== tenantId) return null;
        // Kopie, damit eine Änderung des Aufrufers ohne Commit nicht durchschlägt.
        return structuredClone(found);
      },
      async appendEvents(events) {
        guard("appendEvents");
        stagedEvents.push(...events.map((e) => structuredClone(e)));
      },
      async saveIdempotency(record) {
        guard("saveIdempotency");
        stagedIdempotency.push(structuredClone(record));
      },
    };

    const result = await fn(tx);

    // Commit erst nach fehlerfreiem Durchlauf.
    for (const [id, request] of stagedRequests) this.requests.set(id, request);
    this.events.push(...stagedEvents);
    for (const record of stagedIdempotency) {
      this.idempotency.set(`${record.tenantId}:${record.key}`, record);
    }
    return result;
  }
}

export class MemoryOutbox implements OutboxStore {
  events: OutboxEvent[];
  delivered: DeliveryResult[] = [];

  constructor(events: OutboxEvent[] = []) {
    this.events = events;
  }

  async claimDue(now: Date, limit: number): Promise<OutboxEvent[]> {
    return this.events
      .filter(
        (e) =>
          e.deliveredAt === null &&
          e.deadLetteredAt === null &&
          e.nextRetryAt.getTime() <= now.getTime(),
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .slice(0, limit);
  }

  private find(id: string): OutboxEvent | undefined {
    return this.events.find((e) => e.id === id);
  }

  async markDelivered(id: string, at: Date, result: DeliveryResult): Promise<void> {
    const event = this.find(id);
    if (!event) return;
    event.deliveredAt = at;
    this.delivered.push(result);
  }

  async markRetry(id: string, nextRetryAt: Date, attempts: number, error: string): Promise<void> {
    const event = this.find(id);
    if (!event) return;
    event.attempts = attempts;
    event.nextRetryAt = nextRetryAt;
    event.lastError = error;
  }

  async markDeadLettered(id: string, at: Date, error: string): Promise<void> {
    const event = this.find(id);
    if (!event) return;
    event.deadLetteredAt = at;
    event.lastError = error;
  }
}
