-- Northline OS — Kernschema (v1)
--
-- Zwei Invarianten, die dieses Schema erzwingt statt sie zu erhoffen:
--   1. Jede fachliche Zeile trägt tenant_id, und Row-Level-Security trennt die
--      Mandanten in der Datenbank. Mandantentrennung darf nicht davon abhängen,
--      dass niemand ein WHERE vergisst.
--   2. Fachliche Änderung und ausgehendes Event werden in derselben Transaktion
--      geschrieben (Tabelle outbox). Es gibt keinen Zustand, in dem eine
--      Reservierung gespeichert ist, die Benachrichtigung aber verloren ging.
--
-- Anwendung: psql "$DATABASE_URL" -f db/schema.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

-- ---------------------------------------------------------------------------
-- Mandant und Konfiguration
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tenants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  name          text NOT NULL,
  industry      text NOT NULL,
  timezone      text NOT NULL,
  default_locale text NOT NULL DEFAULT 'de',
  status        text NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'paused', 'disabled')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Versioniert, damit eine fehlerhafte Konfigurationsänderung revidierbar ist,
-- ohne dass jemand den vorherigen Stand aus dem Gedächtnis rekonstruiert.
CREATE TABLE IF NOT EXISTS tenant_configs (
  tenant_id    uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  version      integer NOT NULL,
  config       jsonb NOT NULL,
  published_at timestamptz NOT NULL DEFAULT now(),
  published_by text,
  PRIMARY KEY (tenant_id, version)
);

CREATE OR REPLACE VIEW tenant_config_current AS
SELECT DISTINCT ON (tenant_id) tenant_id, version, config, published_at
FROM tenant_configs
ORDER BY tenant_id, version DESC;

-- ---------------------------------------------------------------------------
-- Gespräche über alle Kanäle
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS conversations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  channel     text NOT NULL CHECK (channel IN ('chat', 'voice', 'form')),
  external_id text,
  locale      text,
  status      text NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'completed', 'escalated')),
  started_at  timestamptz NOT NULL DEFAULT now(),
  ended_at    timestamptz,
  UNIQUE (tenant_id, channel, external_id)
);

-- Token- und Latenzfelder sind kein Luxus: ohne sie sind weder die
-- Kostenfrage (Deckungsbeitrag pro Kunde) noch Support-Rückfragen beantwortbar.
CREATE TABLE IF NOT EXISTS messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role            text NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content         text NOT NULL,
  model           text,
  tokens_in       integer,
  tokens_out      integer,
  latency_ms      integer,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS messages_conversation_idx
  ON messages (conversation_id, created_at);

-- ---------------------------------------------------------------------------
-- Das einheitliche Anfrage-Objekt
-- ---------------------------------------------------------------------------
-- Kernfelder als Spalten, weil das Dashboard danach filtert und sortiert.
-- Branchenspezifisches in details, damit die Tabelle nicht mit jeder neuen
-- Branche um Spalten wächst, die 90 % der Zeilen leer lassen.

CREATE TABLE IF NOT EXISTS requests (
  id              uuid PRIMARY KEY,
  tenant_id       uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  channel         text NOT NULL CHECK (channel IN ('chat', 'voice', 'form')),
  type            text NOT NULL
                    CHECK (type IN ('reservation', 'appointment', 'lead',
                                    'question', 'complaint', 'cancellation')),
  status          text NOT NULL
                    CHECK (status IN ('new', 'needs_info', 'confirmed',
                                      'escalated', 'cancelled')),
  customer_name   text,
  customer_phone  text,
  customer_email  text,
  requested_at    timestamptz,          -- Wunschtermin, in UTC normalisiert
  requested_local text,                 -- Wunschtermin als Ortszeit, für Anzeige
  party_size      integer,
  details         jsonb NOT NULL DEFAULT '{}'::jsonb,
  issues          text[] NOT NULL DEFAULT '{}',
  missing_fields  text[] NOT NULL DEFAULT '{}',
  confidence      numeric(3,2),
  raw_input       jsonb,                -- Rohdaten, für Support unverzichtbar
  related_request_id uuid REFERENCES requests(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS requests_tenant_created_idx
  ON requests (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS requests_tenant_status_idx
  ON requests (tenant_id, status, requested_at);

-- Auskunfts- und Löschersuchen (Art. 15/17 DSGVO) müssen eine Person innerhalb
-- eines Mandanten auffindbar machen. Nachträglich ist das teuer, deshalb hier.
CREATE INDEX IF NOT EXISTS requests_tenant_phone_idx
  ON requests (tenant_id, customer_phone) WHERE customer_phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS requests_tenant_email_idx
  ON requests (tenant_id, lower(customer_email)) WHERE customer_email IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Outbox — kein stiller Datenverlust
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS outbox (
  id                uuid PRIMARY KEY,
  tenant_id         uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  type              text NOT NULL,
  payload           jsonb NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  delivered_at      timestamptz,
  attempts          integer NOT NULL DEFAULT 0,
  next_retry_at     timestamptz NOT NULL DEFAULT now(),
  last_error        text,
  dead_lettered_at  timestamptz
);

-- Der Dispatcher fragt genau danach: fällig, noch nicht zugestellt, nicht tot.
CREATE INDEX IF NOT EXISTS outbox_due_idx
  ON outbox (next_retry_at)
  WHERE delivered_at IS NULL AND dead_lettered_at IS NULL;

CREATE TABLE IF NOT EXISTS deliveries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  outbox_id           uuid REFERENCES outbox(id) ON DELETE SET NULL,
  target              text NOT NULL,          -- 'email:guest', 'webhook:make', ...
  provider_message_id text,
  status              text NOT NULL CHECK (status IN ('sent', 'failed', 'bounced')),
  error               text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Idempotenz — doppelte Webhooks
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS idempotency_keys (
  key          text PRIMARY KEY,
  tenant_id    uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  request_hash text NOT NULL,
  response     jsonb NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Knowledge Base — strikt pro Mandant
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS kb_documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  source_type text NOT NULL,     -- website | pdf | menu | faq | manual
  source_uri  text,
  title       text,
  version     integer NOT NULL DEFAULT 1,
  active      boolean NOT NULL DEFAULT true,
  ingested_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kb_chunks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES kb_documents(id) ON DELETE CASCADE,
  content     text NOT NULL,
  embedding   vector(1536),
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS kb_chunks_tenant_idx ON kb_chunks (tenant_id);

CREATE TABLE IF NOT EXISTS audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   uuid REFERENCES tenants(id) ON DELETE SET NULL,
  actor       text NOT NULL,
  action      text NOT NULL,
  entity_type text,
  entity_id   uuid,
  diff        jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Row-Level-Security
-- ---------------------------------------------------------------------------
-- Die Anwendung setzt pro Request: SET LOCAL app.tenant_id = '<uuid>';
-- Ohne gesetzten Wert liefert jede Tabelle null Zeilen — ein vergessenes
-- SET führt zu einem leeren Ergebnis, nicht zu fremden Daten.

CREATE OR REPLACE FUNCTION app_current_tenant() RETURNS uuid
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.tenant_id', true), '')::uuid
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'tenant_configs', 'conversations', 'messages', 'requests',
    'outbox', 'deliveries', 'idempotency_keys',
    'kb_documents', 'kb_chunks'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON %I', t);
    EXECUTE format(
      'CREATE POLICY tenant_isolation ON %I USING (tenant_id = app_current_tenant()) '
      'WITH CHECK (tenant_id = app_current_tenant())', t);
  END LOOP;
END $$;

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenant_self ON tenants;
CREATE POLICY tenant_self ON tenants
  USING (id = app_current_tenant())
  WITH CHECK (id = app_current_tenant());
