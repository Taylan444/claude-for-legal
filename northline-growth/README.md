# Northline Growth · Zentrale Lead-Instanz

Supabase/PostgreSQL-Schema fuer die mandantenfaehige Lead-Erfassung: **eine**
Datenbank-Instanz, **n** Kunden. Ein neuer Kunde ist eine neue Zeile in
`clients` — kein neues Projekt, kein neues Schema.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `schema.sql` | Enums, Tabellen, Indizes, Trigger, RPC, View, RLS, Beispiel-Kunde |

## Einspielen

```bash
# Supabase CLI (empfohlen)
supabase db execute --file northline-growth/schema.sql

# oder direkt per psql gegen die Projekt-Connection-URL
psql "$SUPABASE_DB_URL" -f northline-growth/schema.sql
```

Das Skript ist als Erst-Migration (Version 1.0) gedacht und **nicht
idempotent** — `create type` und der Beispiel-Kunde in Abschnitt 8 laufen beim
zweiten Durchlauf auf einen Fehler. Fuer Folgeaenderungen eine eigene
Migration anlegen, nicht diese Datei editieren.

## Datenmodell

- **`clients`** — Mandanten-Konfiguration. Make liest hier per `slug` alle
  Regeln: Empfaenger (`notify_emails`, `sms_numbers`), Schwellwert fuer SMS
  (`sms_only_when`), Geschaeftszeiten (`business_hours`), Eskalation
  (`escalation_rules`), Kanal-Zugaenge (Vapi, Kalender, CRM) und das
  `webhook_secret` (wird beim Insert automatisch erzeugt).
- **`leads`** — einheitliches Format fuer alle Kanaele (`voice`, `chat`,
  `form`, `booking`, `manual`). Das Original-Payload bleibt unveraendert in
  `raw`.
- **`lead_deliveries`** — Nachweis pro Zustellversuch (Mail, SMS, CRM,
  Webhook, Kalender) inklusive `attempts` und `error`.

### Idempotenz

`leads_client_external_uniq` ist ein partieller Unique-Index auf
`(client_id, external_id)`. Wird `external_id` mit der Quell-ID gefuellt
(Vapi `call_id`, Cal.com `booking_uid`, Chat `session_id`), kann derselbe Call
bei einem Make-Retry nicht zweimal landen. Leads ohne `external_id` sind vom
Index ausgenommen.

### Dedupe

`find_recent_duplicate(client_id, phone, email, hours default 24)` gibt die ID
des letzten passenden Leads zurueck oder `null`. Make ruft das per RPC **vor**
dem Insert:

```
POST /rest/v1/rpc/find_recent_duplicate
{ "p_client_id": "...", "p_phone": "+4915112345678", "p_email": null, "p_hours": 24 }
```

Der Mail-Vergleich laeuft case-insensitiv; `leads_client_email_idx` liegt
deshalb auf `(client_id, lower(email))`.

## Sicherheit

RLS ist auf allen drei Tabellen aktiv und es gibt **keine** Policy — damit ist
per Default alles zu. Make und Vapi schreiben ausschliesslich mit
`service_role` (umgeht RLS). Das Kunden-Frontend bekommt spaeter eine eigene
Policy pro `client_id`.

`lead_overview` (Basis fuer das Dashboard) ist als `security_invoker = true`
angelegt und erbt damit die RLS des Aufrufers. Ohne dieses Flag laeuft eine
View mit den Rechten ihres Besitzers und haette die Sperre aus Abschnitt 7
ausgehebelt, sobald `anon`/`authenticated` Select-Recht auf die View haben.

Das `webhook_secret` gehoert in die Signaturpruefung der eingehenden Webhooks
(Vapi/Formular/Chat) und darf nie an den Browser.
