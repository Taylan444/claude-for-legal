/** Testmandant: der Pilot — ein Restaurant in Berlin. */

import type { TenantConfig, WeeklyHours } from "../src/types.ts";
import { MemoryStore, MemoryTenantStore, RecordingLogger, SequentialIds, FixedClock } from "../src/adapters/memory.ts";
import type { Deps } from "../src/ports.ts";

const EVENING: readonly { from: number; to: number }[] = [{ from: 17 * 60, to: 23 * 60 }];

/** Montag Ruhetag, Dienstag bis Sonntag 17:00–23:00. */
export const RESTAURANT_HOURS: WeeklyHours = [
  EVENING, // So
  [],      // Mo — Ruhetag
  EVENING, // Di
  EVENING, // Mi
  EVENING, // Do
  EVENING, // Fr
  EVENING, // Sa
];

export const RESTAURANT: TenantConfig = {
  clientId: "tenant-restaurant",
  slug: "pilot-restaurant",
  name: "Pilot Restaurant",
  industry: "restaurant",
  timezone: "Europe/Berlin",
  defaultLocale: "de",
  defaultDialCode: "+49",
  openingHours: RESTAURANT_HOURS,
  closedDates: ["2026-12-24"],
  booking: {
    requiredFields: {
      reservation: ["customer.name", "customer.phone", "date", "time", "partySize"],
      appointment: ["customer.name", "customer.phone", "date", "time"],
      lead: ["customer.name", "customer.email"],
      question: [],
      cancellation: [],
      complaint: [],
    },
    maxPartySize: 12,
    minLeadTimeMinutes: 60,
    maxAdvanceDays: 180,
  },
  escalation: {
    keywords: ["beschwerde", "reklamation", "anwalt"],
    dietaryNeedsConfirmation: true,
  },
  confidenceThreshold: 0.6,
  branding: {
    displayName: "Pilot Restaurant",
    signature: "Pilot Restaurant · Musterstraße 1 · 10115 Berlin · 030 1234567",
  },
  notifications: {
    identity: {
      fromName: "Pilot Restaurant",
      fromEmail: "reservierung@pilot-restaurant.example",
      replyTo: "team@pilot-restaurant.example",
    },
    businessRecipients: ["team@pilot-restaurant.example"],
    internalAlertRecipients: ["alerts@northline.example"],
    confirmCustomer: true,
  },
  webhooks: [
    {
      id: "make-crm",
      url: "https://hook.make.example/abc123",
      secretRef: "MAKE_WEBHOOK_SECRET_PILOT",
      events: ["reservation.requested", "escalation.requested"],
    },
  ],
};

export interface TestHarness extends Deps {
  clock: FixedClock;
  store: MemoryStore;
  logger: RecordingLogger;
}

export function harness(now = "2026-07-01T10:00:00Z", config: TenantConfig = RESTAURANT): TestHarness {
  return {
    clock: new FixedClock(new Date(now)),
    ids: new SequentialIds("req"),
    tenants: new MemoryTenantStore([config]),
    store: new MemoryStore(),
    logger: new RecordingLogger(),
  };
}

/** Eine vollständige, unproblematische Reservierung. */
export function goodReservation(overrides: Record<string, unknown> = {}) {
  return {
    tenantId: RESTAURANT.clientId,
    channel: "chat" as const,
    intent: "reservation" as const,
    customer: { name: "Anna Weber", phone: "030 1234567", email: "anna@example.com" },
    date: "2026-07-15", // Mittwoch
    time: "19:30",
    partySize: 4,
    confidence: 0.95,
    ...overrides,
  };
}
