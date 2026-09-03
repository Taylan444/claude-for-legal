-- ============================================================
-- Northline Growth · Kunden-Onboarding
-- Ein neuer Kunde = ein Durchlauf dieser Datei, von oben nach unten.
-- Laeuft im Supabase SQL Editor und in psql.
--
--   1) Kunde anlegen        -> gibt id + webhook_secret zurueck
--   2) Kanaele nachtragen   -> Vapi, Kalender, CRM, Chatbot
--   3) Smoke-Test           -> beweist die Kette, raeumt sich selbst auf
--   4) Uebergabe-Check      -> was fehlt noch?
--   5) Abschalten / loeschen
-- ============================================================

-- ------------------------------------------------------------
-- 1) KUNDE ANLEGEN
--    Nur den input-Block anfassen. Alles darunter bleibt.
--    webhook_secret wird automatisch erzeugt -> nach Make kopieren,
--    danach steht es nirgends sonst.
-- ------------------------------------------------------------
with input as (
  select
    'mustermann-dach'                as slug,           -- klein, mit Bindestrich, = client_id in allen Payloads
    'Mustermann Bedachungen GmbH'    as company_name,
    'Handwerk'                       as industry,
    'Europe/Berlin'                  as timezone,
    array[
      'info@mustermann-dach.de'
    ]::text[]                        as notify_emails,  -- alle Empfaenger der Lead-Mail
    array[
      '+4917012345678'
    ]::text[]                        as sms_numbers,    -- E.164, sonst schluckt der Provider es nicht
    'high'::urgency                  as sms_only_when,  -- 'low' = SMS immer, 'high' = nur Notfaelle
    'leads@northline-growth.de'      as fallback_email, -- Roh-Mail an uns, wenn die Zustellung scheitert
    '{"mon":["07:00","17:00"],"tue":["07:00","17:00"],"wed":["07:00","17:00"],
      "thu":["07:00","17:00"],"fri":["07:00","15:00"],"sat":null,"sun":null}'::jsonb
                                     as business_hours,
    '{"after_hours":"sms_only","no_pickup_minutes":15}'::jsonb
                                     as escalation_rules
)
insert into clients (
  slug, company_name, industry, timezone,
  notify_emails, sms_numbers, sms_only_when, fallback_email,
  business_hours, escalation_rules
)
select
  slug, company_name, industry, timezone,
  notify_emails, sms_numbers, sms_only_when, fallback_email,
  business_hours, escalation_rules
from input
returning id, slug, webhook_secret;

-- ------------------------------------------------------------
-- 2) KANAELE NACHTRAGEN
--    Kommt spaeter als der Kunde: erst Vapi-Assistent bauen,
--    dann hier die IDs eintragen. Nicht benoetigte Bloecke weglassen.
-- ------------------------------------------------------------

-- Telefon (Vapi): ordnet eingehende Calls diesem Kunden zu
update clients set
  vapi_assistant_id = 'asst_xxxxxxxx',
  vapi_phone_number = '+4930123456789'
where slug = 'mustermann-dach';

-- Website-Chatbot
update clients set
  bot_prompt = 'Du bist der Assistent von Mustermann Bedachungen. Nimm Anliegen auf, versprich keine Preise und keine Termine.',
  bot_kb_url = 'https://mustermann-dach.de'
where slug = 'mustermann-dach';

-- Terminbuchung
update clients set
  calendar_provider = 'cal.com',
  calendar_id       = 'mustermann/erstberatung'
where slug = 'mustermann-dach';

-- CRM
update clients set
  crm_provider = 'hubspot',
  crm_config   = '{"pipeline":"default","owner_id":"12345"}'::jsonb
where slug = 'mustermann-dach';

-- ------------------------------------------------------------
-- 3) SMOKE-TEST
--    Als ganzen Block ausfuehren. Das rollback am Ende raeumt die
--    Testdaten weg - beim Kunden bleibt nichts stehen.
--    Erwartung: dedupe_ok = t, danach eine Zeile in lead_overview.
-- ------------------------------------------------------------
begin;

insert into leads (client_id, channel, external_id, name, phone, subject, message, urgency)
select id, 'voice', 'onboarding-smoke-1', 'Testanruf Northline',
       '+4915100000000', 'Dach undicht nach Sturm',
       'Automatischer Onboarding-Test, keine echte Anfrage.', 'high'
from clients where slug = 'mustermann-dach';

-- Greift der Dedupe-Schutz, den Make vor jedem Insert aufruft?
select find_recent_duplicate(
         (select id from clients where slug = 'mustermann-dach'),
         '+4915100000000', null, 24
       ) is not null as dedupe_ok;

-- Zustellung protokollieren, wie Make es nach dem Versand tut
insert into lead_deliveries (lead_id, kind, target, status, sent_at)
select l.id, 'email', c.notify_emails[1], 'sent', now()
from leads l join clients c on c.id = l.client_id
where l.external_id = 'onboarding-smoke-1';

-- So sieht der Kunde seinen Lead im Dashboard
select client, channel, status, urgency, name, phone, subject,
       deliveries_sent, deliveries_failed
from lead_overview
where client = 'mustermann-dach';

rollback;

-- ------------------------------------------------------------
-- 4) UEBERGABE-CHECK
--    Alles 't'? Dann kann der Kunde scharf geschaltet werden.
--    Der Rest ist bewusst optional - ein Kunde ohne CRM ist ok.
-- ------------------------------------------------------------
select
  slug,
  active                                          as aktiv,
  cardinality(notify_emails) > 0                  as mail_empfaenger,
  fallback_email is not null                      as fallback_gesetzt,
  business_hours <> '{}'::jsonb                   as zeiten_gepflegt,
  length(webhook_secret) >= 32                    as secret_ok,
  -- ab hier optional, je nach gebuchtem Paket
  vapi_assistant_id is not null                   as kanal_telefon,
  bot_prompt is not null                          as kanal_chat,
  calendar_provider is not null                   as kanal_kalender,
  crm_provider is not null                        as kanal_crm,
  cardinality(sms_numbers) > 0                    as sms_moeglich
from clients
where slug = 'mustermann-dach';

-- Demo-Kunde aus schema.sql Abschnitt 8 - vor dem Livegang weg:
delete from clients where slug = 'demo-dachdecker';

-- ------------------------------------------------------------
-- 5) ABSCHALTEN / LOESCHEN
-- ------------------------------------------------------------

-- Pause (Vertrag ruht): Konfiguration und Leads bleiben erhalten.
-- Make muss active pruefen, sonst laufen die Benachrichtigungen weiter.
update clients set active = false where slug = 'mustermann-dach';

-- Endgueltig. Loescht per cascade ALLE Leads und Zustellnachweise
-- dieses Kunden. Vorher exportieren - es gibt kein Undo.
-- delete from clients where slug = 'mustermann-dach';
