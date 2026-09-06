/**
 * E-Mail-Vorlagen — mandantenfähig und mehrsprachig.
 *
 * Eine Formulierung darin ist keine Stilfrage, sondern eine Zusage: Der Gast
 * bekommt „Ihre Anfrage ist eingegangen", niemals „Ihr Tisch ist reserviert".
 * Das System nimmt Anfragen entgegen; bestätigen kann nur der Betrieb. Wer hier
 * bestätigt, was noch niemand zugesagt hat, produziert Gäste, die vor einer
 * vollen Gaststube stehen.
 */

import type { Issue, RequestStatus, RequestType, TenantConfig } from "../types.ts";

export type TemplateLocale = "de" | "en";

export interface RenderedEmail {
  subject: string;
  text: string;
}

export interface RequestSummary {
  requestId: string;
  type: RequestType;
  status: RequestStatus;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  requestedLocal: string | null;
  partySize: number | null;
  dietaryNotes: string[];
  message: string | null;
  issues: Issue[];
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Event-Payload → Zusammenfassung. Defensiv, weil der Payload aus JSON kommt. */
export function summarize(payload: Record<string, unknown>): RequestSummary {
  const customer = (payload.customer ?? {}) as Record<string, unknown>;
  const details = (payload.details ?? {}) as Record<string, unknown>;
  const notes = details.dietaryNotes;
  return {
    requestId: str(payload.requestId) ?? "unbekannt",
    type: (str(payload.type) ?? "reservation") as RequestType,
    status: (str(payload.status) ?? "new") as RequestStatus,
    customerName: str(customer.name),
    customerPhone: str(customer.phone),
    customerEmail: str(customer.email),
    requestedLocal: str(payload.requestedLocal),
    partySize: typeof payload.partySize === "number" ? payload.partySize : null,
    dietaryNotes: Array.isArray(notes) ? notes.filter((n): n is string => typeof n === "string") : [],
    message: str(details.message),
    issues: Array.isArray(payload.issues) ? (payload.issues as Issue[]) : [],
  };
}

/** "2026-07-15 19:30" → "15.07.2026 um 19:30 Uhr" bzw. "2026-07-15 at 19:30". */
export function formatWhen(requestedLocal: string | null, locale: TemplateLocale): string {
  if (!requestedLocal) return locale === "de" ? "noch offen" : "not yet set";
  const [date, time] = requestedLocal.split(" ");
  if (!date || !time) return requestedLocal;
  if (locale === "de") {
    const [year, month, day] = date.split("-");
    return `${day}.${month}.${year} um ${time} Uhr`;
  }
  return `${date} at ${time}`;
}

function signature(config: TenantConfig): string {
  const line = config.branding.signature;
  return line ? `\n\n--\n${line}` : "";
}

function detailBlock(summary: RequestSummary, locale: TemplateLocale): string {
  const label = locale === "de"
    ? { when: "Termin", people: "Personen", name: "Name", phone: "Telefon", email: "E-Mail", notes: "Hinweise", message: "Nachricht" }
    : { when: "When", people: "Guests", name: "Name", phone: "Phone", email: "Email", notes: "Notes", message: "Message" };

  const lines = [`${label.when}: ${formatWhen(summary.requestedLocal, locale)}`];
  if (summary.partySize !== null) lines.push(`${label.people}: ${summary.partySize}`);
  if (summary.customerName) lines.push(`${label.name}: ${summary.customerName}`);
  if (summary.customerPhone) lines.push(`${label.phone}: ${summary.customerPhone}`);
  if (summary.customerEmail) lines.push(`${label.email}: ${summary.customerEmail}`);
  if (summary.dietaryNotes.length > 0) lines.push(`${label.notes}: ${summary.dietaryNotes.join(", ")}`);
  if (summary.message) lines.push(`${label.message}: ${summary.message}`);
  return lines.join("\n");
}

/**
 * Bestätigung des Eingangs an den Gast — ausdrücklich keine Zusage.
 */
export function customerReceived(
  summary: RequestSummary,
  config: TenantConfig,
  locale: TemplateLocale,
): RenderedEmail {
  const name = config.branding.displayName;
  if (locale === "de") {
    const greeting = summary.customerName ? `Hallo ${summary.customerName},` : "Hallo,";
    return {
      subject: `Ihre Anfrage bei ${name} ist eingegangen`,
      text:
        `${greeting}\n\n` +
        `vielen Dank für Ihre Anfrage. Wir haben sie erhalten:\n\n` +
        `${detailBlock(summary, locale)}\n\n` +
        `Das ist noch keine Bestätigung — wir melden uns in Kürze und bestätigen ` +
        `Ihnen den Termin verbindlich.\n\n` +
        `Ihre Vorgangsnummer: ${summary.requestId}` +
        signature(config),
    };
  }
  const greeting = summary.customerName ? `Hello ${summary.customerName},` : "Hello,";
  return {
    subject: `We received your request at ${name}`,
    text:
      `${greeting}\n\n` +
      `thank you for your request. We have received it:\n\n` +
      `${detailBlock(summary, locale)}\n\n` +
      `This is not a confirmation yet — we will get back to you shortly to ` +
      `confirm.\n\n` +
      `Your reference: ${summary.requestId}` +
      signature(config),
  };
}

/** Neue Anfrage an den Betrieb. */
export function businessNewRequest(
  summary: RequestSummary,
  config: TenantConfig,
  locale: TemplateLocale,
): RenderedEmail {
  const when = formatWhen(summary.requestedLocal, locale);
  if (locale === "de") {
    return {
      subject: `Neue Anfrage: ${when}${summary.partySize ? `, ${summary.partySize} Personen` : ""}`,
      text:
        `Neue Anfrage über ${config.branding.displayName}:\n\n` +
        `${detailBlock(summary, locale)}\n\n` +
        `Vorgangsnummer: ${summary.requestId}`,
    };
  }
  return {
    subject: `New request: ${when}${summary.partySize ? `, ${summary.partySize} guests` : ""}`,
    text:
      `New request via ${config.branding.displayName}:\n\n` +
      `${detailBlock(summary, locale)}\n\n` +
      `Reference: ${summary.requestId}`,
  };
}

const ISSUE_TEXT_DE: Partial<Record<Issue, string>> = {
  party_too_large: "Große Gruppe — bitte Kapazität prüfen",
  dietary_requires_confirmation: "Ernährungshinweis — bitte bestätigen",
  escalation_requested: "Der Gast hat ausdrücklich um Rückruf gebeten",
  escalation_keyword: "Beschwerde erkannt",
};

const ISSUE_TEXT_EN: Partial<Record<Issue, string>> = {
  party_too_large: "Large party — please check capacity",
  dietary_requires_confirmation: "Dietary note — please confirm",
  escalation_requested: "The guest explicitly asked to be called back",
  escalation_keyword: "Complaint detected",
};

/** Eskalation an den Betrieb — hier muss ein Mensch ran. */
export function businessEscalation(
  summary: RequestSummary,
  config: TenantConfig,
  locale: TemplateLocale,
): RenderedEmail {
  const table = locale === "de" ? ISSUE_TEXT_DE : ISSUE_TEXT_EN;
  const reasons = summary.issues.map((issue) => table[issue] ?? issue).join("\n- ");
  if (locale === "de") {
    return {
      subject: `Bitte übernehmen: Anfrage braucht einen Menschen`,
      text:
        `Diese Anfrage konnte nicht automatisch bearbeitet werden.\n\n` +
        `Grund:\n- ${reasons}\n\n` +
        `${detailBlock(summary, locale)}\n\n` +
        `Vorgangsnummer: ${summary.requestId}`,
    };
  }
  return {
    subject: `Needs a human: request requires attention`,
    text:
      `This request could not be handled automatically.\n\n` +
      `Reason:\n- ${reasons}\n\n` +
      `${detailBlock(summary, locale)}\n\n` +
      `Reference: ${summary.requestId}`,
  };
}

/** Interner Alarm an Northline — nie an den Kunden. */
export function internalAlert(subject: string, body: string): RenderedEmail {
  return { subject: `[Northline] ${subject}`, text: body };
}

export function localeFor(config: TenantConfig): TemplateLocale {
  return config.defaultLocale.toLowerCase().startsWith("en") ? "en" : "de";
}
