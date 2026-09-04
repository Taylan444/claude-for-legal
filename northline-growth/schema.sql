-- ============================================================
-- Northline Growth · Zentrale Lead-Instanz
-- Supabase / PostgreSQL Schema  ·  Version 1.0
-- Mandantenfähig: 1 Instanz, n Kunden (clients.slug = client_id)
--
-- Wiederholbar: die Datei laeuft mehrfach durch, ohne zu knallen und
-- ohne vorhandene Daten anzufassen. Nach einem Abbruch mittendrin
-- einfach nochmal komplett ausfuehren.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- ENUMS
-- ------------------------------------------------------------
-- create type kennt kein "if not exists" -> pro Typ abfangen.
do $enums$
begin
  create type lead_channel as enum ('voice', 'chat', 'form', 'booking', 'manual');
exception when duplicate_object then null;
end $enums$;

do $enums$
begin
  create type lead_status as enum ('new', 'notified', 'contacted', 'booked', 'won', 'lost', 'spam');
exception when duplicate_object then null;
end $enums$;

do $enums$
begin
  create type urgency as enum ('low', 'normal', 'high');
exception when duplicate_object then null;
end $enums$;

do $enums$
begin
  create type delivery_kind as enum ('email', 'sms', 'crm', 'webhook', 'calendar');
exception when duplicate_object then null;
end $enums$;

do $enums$
begin
  create type delivery_status as enum ('pending', 'sent', 'failed', 'skipped');
exception when duplicate_object then null;
end $enums$;

-- ------------------------------------------------------------
-- 1) CLIENTS  ·  Die Schablone. Neuer Kunde = neue Zeile.
-- ------------------------------------------------------------
create table if not exists clients (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,          -- "mustermann-dach" -> client_id in allen Payloads
  company_name      text not null,
  industry          text,
  timezone          text not null default 'Europe/Berlin',

  -- Zustellung
  notify_emails     text[] not null default '{}',  -- kann mehrere Empfaenger haben
  sms_numbers       text[] not null default '{}',  -- E.164, z.B. {+4915112345678}
  sms_only_when     urgency not null default 'high',
  fallback_email    text,                          -- Roh-Mail bei Systemfehlern

  -- Betrieb
  business_hours    jsonb not null default
    '{"mon":["08:00","17:00"],"tue":["08:00","17:00"],"wed":["08:00","17:00"],
      "thu":["08:00","17:00"],"fri":["08:00","16:00"],"sat":null,"sun":null}'::jsonb,
  escalation_rules  jsonb not null default '{}'::jsonb,

  -- Kanal-Konfiguration
  vapi_assistant_id text,
  vapi_phone_number text,
  bot_prompt        text,                          -- Systemprompt Website-Chatbot
  bot_kb_url        text,                          -- Wissensquelle (Website/Doku)
  calendar_provider text,                          -- 'cal.com' | 'google' | null
  calendar_id       text,
  crm_provider      text,                          -- 'hubspot' | 'pipedrive' | null
  crm_config        jsonb not null default '{}'::jsonb,

  -- Sicherheit
  webhook_secret    text not null default encode(gen_random_bytes(24), 'hex'),

  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table clients is 'Mandanten-Konfiguration. Make liest hier per slug alle Regeln.';

-- ------------------------------------------------------------
-- 2) LEADS  · Einheitliches Format fuer ALLE Kanaele
-- ------------------------------------------------------------
create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id) on delete cascade,
  channel       lead_channel not null,

  -- Idempotenz: Vapi call_id, Cal.com booking_uid, Chat session_id
  external_id   text,

  -- Kontakt
  name          text,
  phone         text,                              -- normalisiert auf E.164
  email         text,

  -- Inhalt
  subject       text,                              -- Kurzanliegen, eine Zeile
  message       text,                              -- Freitext / Zusammenfassung
  requested_at  timestamptz,                       -- Wunschtermin (nicht bestaetigt)
  booked_at     timestamptz,                       -- bestaetigter Termin
  urgency       urgency not null default 'normal',

  -- Nachweis
  transcript    text,
  recording_url text,
  source_url    text,                              -- Seite, auf der der Lead entstand
  raw           jsonb not null default '{}'::jsonb,-- Original-Payload, unveraendert

  status        lead_status not null default 'new',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint leads_contact_present
    check (phone is not null or email is not null)
);

-- Idempotenz-Schutz: derselbe Vapi-Call darf nie zweimal landen
create unique index if not exists leads_client_external_uniq
  on leads (client_id, external_id)
  where external_id is not null;

create index if not exists leads_client_created_idx on leads (client_id, created_at desc);
create index if not exists leads_client_phone_idx   on leads (client_id, phone);
create index if not exists leads_status_idx         on leads (client_id, status);

-- Dedupe per Mail: find_recent_duplicate() vergleicht case-insensitiv
create index if not exists leads_client_email_idx   on leads (client_id, lower(email));

-- ------------------------------------------------------------
-- 3) LEAD_DELIVERIES · Beweis, dass der Lead rausgegangen ist
-- ------------------------------------------------------------
create table if not exists lead_deliveries (
  id         uuid primary key default gen_random_uuid(),
  lead_id    uuid not null references leads(id) on delete cascade,
  kind       delivery_kind not null,
  target     text,                                 -- Mailadresse, Nummer, CRM-Objekt
  status     delivery_status not null default 'pending',
  attempts   int not null default 0,
  error      text,
  payload    jsonb,
  sent_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists lead_deliveries_lead_idx   on lead_deliveries (lead_id);
create index if not exists lead_deliveries_status_idx on lead_deliveries (status)
  where status in ('pending', 'failed');

-- ------------------------------------------------------------
-- 4) updated_at automatisch pflegen
-- ------------------------------------------------------------
create or replace function touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clients_touch on clients;
create trigger clients_touch before update on clients
  for each row execute function touch_updated_at();

drop trigger if exists leads_touch on leads;
create trigger leads_touch before update on leads
  for each row execute function touch_updated_at();

-- ------------------------------------------------------------
-- 5) Dedupe-Helfer  ·  Make ruft das vor dem Insert per RPC
--    Gleiche Nummer beim gleichen Kunden innerhalb X Stunden?
-- ------------------------------------------------------------
create or replace function find_recent_duplicate(
  p_client_id uuid,
  p_phone     text,
  p_email     text,
  p_hours     int default 24
) returns uuid as $$
  select id from leads
   where client_id = p_client_id
     and created_at > now() - (p_hours || ' hours')::interval
     and (
       (p_phone is not null and phone = p_phone)
       or (p_email is not null and lower(email) = lower(p_email))
     )
   order by created_at desc
   limit 1;
$$ language sql stable;

-- ------------------------------------------------------------
-- 6) Dashboard-View  ·  Basis fuer das Kunden-Frontend
--    security_invoker: die View erbt die RLS des Aufrufers,
--    sonst waere sie ein Loch in Abschnitt 7.
-- ------------------------------------------------------------
create or replace view lead_overview with (security_invoker = true) as
select
  l.id, c.slug as client, c.company_name,
  l.channel, l.status, l.urgency,
  l.name, l.phone, l.email, l.subject,
  l.requested_at, l.booked_at, l.created_at,
  (l.recording_url is not null) as has_recording,
  (select count(*) from lead_deliveries d
    where d.lead_id = l.id and d.status = 'sent') as deliveries_sent,
  (select count(*) from lead_deliveries d
    where d.lead_id = l.id and d.status = 'failed') as deliveries_failed
from leads l
join clients c on c.id = l.client_id;

-- ------------------------------------------------------------
-- 7) RLS  ·  Standardmaessig alles zu.
--    Make/Vapi schreiben ausschliesslich mit service_role.
--    Kunden-Frontend spaeter mit eigener Policy pro client_id.
-- ------------------------------------------------------------
alter table clients         enable row level security;
alter table leads           enable row level security;
alter table lead_deliveries enable row level security;

-- ------------------------------------------------------------
-- 8) Beispiel-Kunde
-- ------------------------------------------------------------
insert into clients (slug, company_name, industry, notify_emails, sms_numbers, fallback_email)
values (
  'demo-dachdecker',
  'Muster Dach GmbH',
  'Handwerk',
  array['buero@musterdach.de'],
  array['+4915112345678'],
  'leads@northline-growth.de'
)
on conflict (slug) do nothing;
