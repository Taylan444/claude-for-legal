/**
 * Northline OS — Kerntypen.
 *
 * Das einheitliche Anfrage-Modell. Jeder Kanal (Chat, Voice, Formular) wird auf
 * diese Typen normalisiert; alles dahinter kennt nur noch sie.
 */

export type Channel = "chat" | "voice" | "form";

export type Industry =
  | "restaurant"
  | "hotel"
  | "beauty"
  | "golf"
  | "tennis"
  | "services";

export type RequestType =
  | "reservation"
  | "appointment"
  | "lead"
  | "question"
  | "complaint"
  | "cancellation";

export type RequestStatus =
  | "new"
  | "needs_info"
  | "confirmed"
  | "escalated"
  | "cancelled";

/** Maschinenlesbare Gründe. Formulierungen gehören in die Agent-Schicht. */
export type Issue =
  | "outside_opening_hours"
  | "closed_date"
  | "too_far_in_advance"
  | "below_lead_time"
  | "in_the_past"
  | "party_too_large"
  | "low_confidence"
  | "escalation_keyword"
  | "escalation_requested"
  | "dietary_requires_confirmation"
  | "unknown_related_request";

export interface Customer {
  name: string | null;
  phone: string | null;
  email: string | null;
}

export interface RequestDetails {
  /** Freitext des Gastes, unverändert. */
  message?: string | null;
  /** Restaurant: Allergien, vegan, glutenfrei … */
  dietaryNotes?: string[];
  occasion?: string | null;
  service?: string | null;
  [key: string]: unknown;
}

/** Das, was ein Kanal-Adapter liefert. Alles optional — der Gast redet frei. */
export interface RawInbound {
  tenantId: string;
  channel: Channel;
  intent: RequestType;
  conversationId?: string | null;
  /** Kanal-eigene ID (Call-ID, Session-ID) — für Dedupe und Support. */
  externalId?: string | null;
  idempotencyKey?: string | null;
  locale?: string | null;
  customer?: Partial<Customer>;
  /** Wunschtermin als Ortszeit des Mandanten. */
  date?: string | null; // YYYY-MM-DD
  time?: string | null; // HH:mm
  partySize?: number | string | null;
  details?: RequestDetails;
  /** Vom Agent gemeldete Extraktionssicherheit, 0..1. */
  confidence?: number | null;
  /** Der Agent oder der Gast hat ausdrücklich einen Menschen verlangt. */
  escalate?: boolean;
  /** Bei intent "cancellation": die zu stornierende Anfrage. */
  relatedRequestId?: string | null;
  /** Rohpayload des Kanals. Wird immer mitgespeichert. */
  rawInput?: unknown;
}

export interface NorthlineRequest {
  requestId: string;
  clientId: string;
  conversationId: string | null;
  channel: Channel;
  type: RequestType;
  status: RequestStatus;
  customer: Customer;
  /** Wunschtermin als UTC-Instant. Null, wenn Datum oder Zeit fehlt. */
  requestedAt: Date | null;
  /** Wunschtermin als Ortszeit "YYYY-MM-DD HH:mm" — für Anzeige und E-Mail. */
  requestedLocal: string | null;
  partySize: number | null;
  details: RequestDetails;
  issues: Issue[];
  missingFields: string[];
  confidence: number | null;
  relatedRequestId: string | null;
  rawInput: unknown;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Mandanten-Konfiguration — hier steht alles Kundenspezifische, nicht im Code.
// ---------------------------------------------------------------------------

/** Minuten seit Mitternacht, Ortszeit. 19:30 = 1170. */
export interface TimeRange {
  from: number;
  to: number;
}

/** Index 0 = Sonntag, 6 = Samstag. Leeres Array = geschlossen. */
export type WeeklyHours = readonly [
  readonly TimeRange[], readonly TimeRange[], readonly TimeRange[],
  readonly TimeRange[], readonly TimeRange[], readonly TimeRange[],
  readonly TimeRange[],
];

export interface BookingRules {
  /** Pflichtfelder je Anfragetyp, als Pfade: "customer.phone", "date" … */
  requiredFields: Partial<Record<RequestType, readonly string[]>>;
  /** Darüber wird nicht abgelehnt, sondern an einen Menschen eskaliert. */
  maxPartySize: number | null;
  /** Vorlaufzeit in Minuten. */
  minLeadTimeMinutes: number;
  maxAdvanceDays: number;
}

export interface EscalationRules {
  /** Kleingeschrieben; Treffer im Freitext löst Eskalation aus. */
  keywords: readonly string[];
  /** Ernährungshinweise vom Menschen bestätigen lassen (z. B. Allergien). */
  dietaryNeedsConfirmation: boolean;
}

export interface TenantConfig {
  clientId: string;
  slug: string;
  name: string;
  industry: Industry;
  /** IANA-Zone, z. B. "Europe/Berlin". */
  timezone: string;
  defaultLocale: string;
  /** Ländervorwahl für die Telefon-Normalisierung, z. B. "+49". */
  defaultDialCode: string;
  openingHours: WeeklyHours;
  /** Einzelne Schließtage, "YYYY-MM-DD". */
  closedDates: readonly string[];
  booking: BookingRules;
  escalation: EscalationRules;
  /** Darunter fragt der Agent nach, statt die Extraktion zu übernehmen. */
  confidenceThreshold: number;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export type EventType =
  | "reservation.requested"
  | "appointment.requested"
  | "lead.created"
  | "request.status_changed"
  | "escalation.requested"
  | "conversation.completed"
  | "notification.failed";

export interface OutboxEvent {
  id: string;
  tenantId: string;
  type: EventType;
  payload: Record<string, unknown>;
  createdAt: Date;
  attempts: number;
  nextRetryAt: Date;
  deliveredAt: Date | null;
  deadLetteredAt: Date | null;
  lastError: string | null;
}

/** Ergebnis des Intake — das, was der Agent zum Weiterreden braucht. */
export interface IntakeResult {
  requestId: string;
  status: RequestStatus;
  missingFields: string[];
  issues: Issue[];
  events: EventType[];
  /** true, wenn dieses Ergebnis aus dem Idempotenz-Speicher stammt. */
  deduplicated: boolean;
}
