# Northline Growth · Zentrale Lead-Instanz

Supabase/PostgreSQL-Schema fuer die mandantenfaehige Lead-Erfassung: **eine**
Datenbank-Instanz, **n** Kunden. Ein neuer Kunde ist eine neue Zeile in
`clients` — kein neues Projekt, kein neues Schema.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `schema.sql` | Enums, Tabellen, Indizes, Trigger, RPC, View, RLS, Beispiel-Kunde |
| `onboarding.sql` | Neuen Kunden anlegen, Kanaele nachtragen, Smoke-Test, Uebergabe-Check |

## Einspielen

```bash
# Supabase CLI (empfohlen)
supabase db execute --file northline-growth/schema.sql

# oder direkt per psql gegen die Projekt-Connection-URL
psql "$SUPABASE_DB_URL" -f northline-growth/schema.sql
```

Die Datei ist **wiederholbar**: Enums, Tabellen und Indizes werden nur
angelegt, wenn sie fehlen, Trigger und View werden ersetzt, der Beispiel-Kunde
landet per `on conflict do nothing`. Bricht ein Lauf mittendrin ab, einfach
nochmal komplett ausfuehren — vorhandene Kunden, Leads und Zustellnachweise
bleiben unangetastet. Beim zweiten Lauf meldet Postgres `NOTICE: ... already
exists, skipping`; das ist der Normalfall, kein Fehler.

Was die Datei **nicht** macht: bestehende Tabellen an ein neueres Schema
anpassen. `create table if not exists` ueberspringt eine vorhandene Tabelle
samt abweichender Spalten. Strukturaenderungen gehoeren deshalb weiter in eine
eigene Migration mit `alter table`, nicht in diese Datei.

Was in der Instanz schon steht:

```sql
select table_name from information_schema.tables where table_schema = 'public';
select typname from pg_type where typname in
  ('lead_channel','lead_status','urgency','delivery_kind','delivery_status');
```

## Neuen Kunden aufschalten

`onboarding.sql` von oben nach unten durcharbeiten — der ganze Vorgang steckt
in einer Datei:

1. **Kunde anlegen.** Nur den `input`-Block am Anfang anfassen. Die Abfrage
   gibt `id` und `webhook_secret` zurueck; beides wandert nach Make, danach
   steht das Secret nirgends sonst.
2. **Kanaele nachtragen.** Vapi-Assistent, Chatbot, Kalender, CRM — kommt
   spaeter als der Kunde, deshalb eigene `update`-Bloecke. Nicht gebuchte
   Kanaele einfach weglassen.
3. **Smoke-Test.** Legt einen Testlead an, prueft `find_recent_duplicate()`,
   protokolliert eine Zustellung und zeigt die Dashboard-Zeile. Der Block
   endet auf `rollback` — beim Kunden bleibt nichts stehen.
4. **Uebergabe-Check.** Eine Zeile mit `t`/`f` pro Voraussetzung. Die ersten
   fuenf Spalten muessen `t` sein, die Kanal-Spalten haengen vom Paket ab.
   Direkt darunter fliegt der Demo-Kunde aus `schema.sql` raus.
5. **Abschalten.** `active = false` pausiert (Make muss das Flag pruefen),
   `delete` loescht per Cascade auch alle Leads — vorher exportieren.

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

### Idempotenz der Leads (Make-Retries)

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
