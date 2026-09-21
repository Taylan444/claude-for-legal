# 01 — Architekturvorschlag

## 1. Leitbild

**Ein modularer Monolith.** Eine Next.js-Anwendung, eine PostgreSQL-Datenbank, ein
Deployment. Intern strikt geschichtet, damit einzelne Module später herauslösbar sind —
aber ohne verteilte Systeme, solange es keinen Grund dafür gibt.

```
┌─────────────────────────────────────────────────────────────┐
│  UI  (Next.js App Router, React Server Components, shadcn)  │
│  app/(app)/dashboard · clients · strategy · creative · …    │
└───────────────┬─────────────────────────────────────────────┘
                │  Server Actions (Zod-validiert) / Route Handlers
┌───────────────▼─────────────────────────────────────────────┐
│  Domain-Module (server/modules/*)                           │
│  clients · brandbrain · strategy · creatives · campaigns    │
│  metrics · recommendations · knowledge · audit              │
│  → Geschäftslogik, KPI-Berechnung, Freigabe-Workflows       │
└──────┬──────────────────────────┬───────────────────────────┘
       │                          │
┌──────▼───────────────┐  ┌───────▼──────────────────────────┐
│ Data Access          │  │ AI-Schicht (server/ai)           │
│ server/db/repos/*    │  │ workflows · prompts · context    │
│ erzwingt client_id   │  │ providers (austauschbar)         │
└──────┬───────────────┘  └───────┬──────────────────────────┘
       │                          │
┌──────▼───────────┐  ┌───────────▼─────────┐  ┌─────────────┐
│ PostgreSQL       │  │ LLM-Anbieter (API)  │  │ Object      │
│ (Prisma)         │  │                     │  │ Storage (S3)│
└──────────────────┘  └─────────────────────┘  └─────────────┘
                                      ┌──────────────────────┐
                                      │ integrations/meta    │
                                      │ (M9, read-only)      │
                                      └──────────────────────┘
```

**Drei eiserne Regeln:**
1. UI-Komponenten sprechen nie direkt mit dem ORM. Nur Module dürfen Repositories aufrufen.
2. Jede kundenbezogene Repository-Funktion nimmt `clientId` als **ersten Parameter**.
   Kein Default, kein optionales Feld.
3. AI-Kontext wird ausschließlich von `buildClientContext()` erzeugt. Kein Modul baut
   Prompts von Hand zusammen.

---

## 2. Entscheidungen

Format: Option A / Option B / Empfehlung / Begründung.
Entscheidungen mit **[BLOCKIEREND]** brauchen deine Antwort vor dem Coding.

### D1 — Wo lebt der Code? **[BLOCKIEREND]**

- **Option A:** Neues, eigenes Repository `northline-ai-marketing-manager` (privat).
- **Option B:** Unterverzeichnis in diesem Repository (`claude-for-legal`).

**Empfehlung: A.**
`claude-for-legal` ist ein Fork eines öffentlichen Anthropic-Plugin-Marketplace. Seine
`CLAUDE.md`, seine CI (CLA-Workflow) und seine Konventionen gelten Plugin-Manifesten,
nicht einer Next.js-App. Ein Produkt mit Kundendaten gehört in ein privates Repo mit
eigener CI, eigenen Secrets und eigener Historie. Die Vermischung würde beides
unübersichtlich machen und bei jedem Upstream-Sync Konflikte erzeugen.

*Falls du B willst:* Dann unter `apps/northline/` mit eigenem `package.json` und dem
expliziten Hinweis, dass die Repo-`CLAUDE.md` dort nicht gilt. Funktioniert, ist aber
die schlechtere Variante.

### D2 — Framework-Architektur

- **Option A:** Next.js App Router, Full-Stack in einer Codebase (Server Actions + RSC).
- **Option B:** Getrennte Schichten: NestJS/Fastify-Backend + React-SPA.

**Empfehlung: A** — entspricht auch deiner Präferenz.
Begründung: Ein Team, ein Deployment, ein Typensystem end-to-end. Der häufigste Einwand
gegen A ("Business-Logik verteilt sich in UI-Dateien") wird durch die Schichtung in
`server/modules/` gelöst, nicht durch ein zweites Repository. Option B kostet ein
zusätzliches Deployment, eine API-Vertragspflege und doppelte Auth — ohne Nutzen bei
dieser Größe. Falls später ein separates Backend nötig wird (z. B. für externe
API-Konsumenten), sind die Domain-Module bereits framework-unabhängig.

### D3 — ORM: Prisma oder Drizzle

- **Option A: Prisma.** Ausgereifter Migrationsworkflow (`prisma migrate`), sehr gutes
  Tooling (Studio), einfaches Onboarding, deklaratives Schema.
- **Option B: Drizzle.** Näher an SQL, schlanker, bessere Kontrolle über generierte
  Queries, angenehmer im Zusammenspiel mit Row-Level Security.

**Empfehlung: A (Prisma).**
Begründung: Der Engpass hier ist Wartbarkeit durch ein kleines Team, nicht
Query-Performance. Prismas Migrationsworkflow ist das robusteste Stück am gesamten Stack
und Kapitel 25.16 fordert explizit saubere Migrationen. Drizzles Vorteile (SQL-Nähe,
RLS) wiegen leichter, weil wir die Mandantentrennung ohnehin in der Repository-Schicht
erzwingen (siehe D5).

### D4 — Authentifizierung **[BLOCKIEREND]**

- **Option A: Auth.js (NextAuth v5)** mit Google-Workspace-SSO, Sessions in unserer
  eigenen Postgres.
- **Option B: Clerk / WorkOS** — fertige UI, MFA, Organisationen out of the box.

**Empfehlung: A, wenn Northline Google Workspace oder Microsoft 365 nutzt.**
Begründung: Kein weiterer Unterauftragsverarbeiter, keine Nutzerdaten bei Dritten, keine
laufenden Kosten, und MFA/Offboarding laufen über euren bestehenden Identity-Provider —
das ist sicherheitstechnisch besser als jede eigene Lösung. Wenn ihr keinen
Identity-Provider habt: Auth.js mit Magic Link (E-Mail) statt Passwörtern.
Option B wäre nur dann richtig, wenn ihr kurzfristig externe Kundenzugänge mit
Self-Service-Registrierung braucht.

### D5 — Mandantentrennung: Row-Level Security oder Repository-Guard

- **Option A: Erzwungene Repository-Schicht** + denormalisierte `client_id` +
  ESLint-Regel + automatisierte Leak-Tests.
- **Option B: PostgreSQL Row-Level Security** zusätzlich, mit `SET LOCAL` pro Transaktion.

**Empfehlung: A jetzt, B als spätere Härtung (spätestens vor einem Multi-Agentur-SaaS).**
Begründung: RLS mit Prisma erfordert, jede Query in eine Transaktion mit
`SET LOCAL app.client_id` zu verpacken — das ist fehleranfällig und genau die Sorte
Komplexität, die man sich im MVP nicht leisten sollte, wenn eine Person sie warten muss.
Eine Repository-Schicht, in der `clientId` schlicht ein Pflichtparameter ist, liefert
95 % des Schutzes bei 10 % der Komplexität, und Tests decken den Rest ab. Wenn eines
Tages fremde Agenturen in derselben Datenbank liegen, kommt RLS als zweites Netz dazu.

### D6 — Hosting und Datenbank **[BLOCKIEREND]**

- **Option A: Vercel (Function Region Frankfurt) + Managed Postgres in der EU**
  (Neon/Supabase EU) + S3-kompatibler Storage in der EU.
- **Option B: Hetzner (Nürnberg/Falkenstein), Docker + Coolify/Dokploy, Postgres und
  Object Storage auf eigener Infrastruktur.**

**Empfehlung: A für den MVP — unter einer Auflage.**
Begründung: Geschwindigkeit. Vercel + Managed Postgres kostet bei dieser Last wenige
Euro im Monat und nimmt euch Betrieb, Patches und Backups ab; ein kleines Team hat für
Serveradministration keine Kapazität. **Auflage:** keine Vercel-spezifischen Features
(kein Edge-Runtime-Zwang, keine proprietären Primitives), damit ein Umzug nach Hetzner
ein Docker-Build bleibt und kein Rewrite.

**Option B wird zur richtigen Antwort, wenn** eure Kunden-AVVs Hosting in Deutschland
verlangen oder ihr US-Anbieter grundsätzlich ausschließt. Das ist eine geschäftliche,
keine technische Frage — deshalb F2.

### D7 — AI-Provider und Abstraktion

- **Option A: Schmale eigene Abstraktion** — ein Interface, Adapter pro Anbieter,
  Modellwahl pro Workflow in der Konfiguration.
- **Option B: Framework (Vercel AI SDK / LangChain)** als Abstraktionsebene.

**Empfehlung: A, ergänzt um das Vercel AI SDK nur für Streaming-UI.**
Begründung: Die tatsächlich benötigte Funktionalität ist klein: ein System-Prompt, ein
Input, ein erzwungenes JSON-Schema, Token-Zählung. Dafür ein Agenten-Framework
einzuziehen, bedeutet, dessen Abstraktionen und Breaking Changes mitzuwarten.
Das Interface:

```ts
interface LlmProvider {
  complete<T>(args: {
    model: string
    system: string
    input: string
    schema: ZodSchema<T>      // erzwungener strukturierter Output
    maxTokens?: number
  }): Promise<{ data: T; usage: TokenUsage; raw: string }>
}
```

Standardmodell: Claude (starke strukturierte Outputs, große Kontextfenster,
EU-Verarbeitung verfügbar). Austauschbar über Konfiguration, nicht über Code-Änderung.

### D8 — Datenzugriff aus der UI: Server Actions, tRPC oder REST

- **Option A: Server Actions** für Mutationen, RSC für Lesezugriffe, Route Handlers nur
  für Webhooks, Exporte und Datei-Uploads.
- **Option B: tRPC** als durchgängige typisierte API-Schicht.

**Empfehlung: A.**
Begründung: tRPC löst das Problem "typsichere Grenze zwischen getrenntem Client und
Server" — das wir bei RSC gar nicht haben. Zod-validierte Server Actions liefern dieselbe
Typsicherheit ohne zusätzliche Schicht. Wenn später eine externe API nötig wird, sind die
Domain-Module bereits der richtige Einstiegspunkt.

### D9 — Object Storage

**Empfehlung:** S3-kompatibel (Cloudflare R2, Hetzner Object Storage oder Supabase
Storage — abhängig von D6), private Buckets, Zugriff nur über kurzlebige signierte URLs,
Pfad-Schema `clients/<clientId>/...`.
Videos im MVP als **externe Links** (Drive/Frame.io) plus optionalem Vorschaubild.
Begründung: Videospeicherung und -transcoding ist ein eigenes Projekt und für den
MVP-Zweck (Creatives konzipieren, Performance bewerten) nicht nötig.

### D10 — Charts

**Empfehlung: Recharts** über die shadcn/ui-Chart-Komponenten.
Begründung: direkt in das gewählte Design-System integriert, Theming und Dark Mode
kommen mit, deckt Linie/Balken/Funnel/Vergleich ab. Alternativen (visx, ECharts) sind
mächtiger, aber hier unnötig.

### D11 — Prompt-Management und Versionierung

Prompts liegen als Module unter `server/ai/prompts/`, jedes exportiert:

```ts
export const strategyPromptV2 = definePrompt({
  id: 'strategy.generate',
  version: 2,
  system: `...`,
  outputSchema: StrategyOutputSchema,
  contextSections: ['company', 'services', 'personas', 'brand_voice', 'targets'],
})
```

Jede `AiGeneration` speichert `prompt_id`, `prompt_version`, `model`, `provider`,
Parameter, Token-Verbrauch, Kosten und einen Hash des Kontext-Inputs. Damit ist
jederzeit beantwortbar: "Welche Prompt-Version hat diese Empfehlung erzeugt?"
`contextSections` ist zugleich die Whitelist — ein Prompt bekommt exakt die Abschnitte
des Brand Brains, die er deklariert hat, und nichts sonst.

### D12 — Hintergrundverarbeitung

**Empfehlung: keine Queue im MVP.** Generierungen laufen in einer Server Action mit
Streaming; das Ergebnis wird in `AiGeneration` persistiert, bevor gestreamt wird, damit
ein Verbindungsabbruch nichts kostet. Wenn später ein Scheduler nötig wird (nächtlicher
Meta-Import), dann `pg-boss` in derselben Postgres — kein Redis, keine zusätzliche
Infrastruktur.

### D13 — Tests

**Empfehlung:** Vitest für Domain-Logik, Playwright für drei bis fünf kritische Flows.
Keine Coverage-Zielmarke. Pflicht-Tests für:
1. Mandantentrennung (Repository-Guard, AI-Kontext-Builder, Leak-Tests),
2. KPI-Berechnung (inkl. Division durch null, fehlende Basiswerte),
3. CSV-Import-Parser (deutsche Zahlenformate, unbekannte Spalten, Duplikate),
4. Validierung von AI-Outputs (Schema-Verstoß, nicht auflösbare Evidence),
5. Statusübergänge (Creative-Status, Recommendation-Freigabe).

---

## 3. Die AI-Schicht im Detail

Fünf Workflows, keine Agents:

| Funktion | Input | Output | Kontext |
| --- | --- | --- | --- |
| `generateStrategy()` | Kunde, Ziel, Leistung, Budget, Zeitraum | strukturierte Strategie | Company, Services, Personas, Brand Voice, Targets, relevantes Playbook-Wissen |
| `generateCreatives()` | Kunde, Strategie/Angle, Format, Anzahl | Hooks, Copy, Headlines, CTA, Skripte | Brand Voice, Personas, Offer, Gewinner-Creatives der Historie |
| `generateCreativeBrief()` | Creative-ID | Produktions-Brief | Creative, Brand Voice, Assets-Liste |
| `analyzeCampaign()` | Kampagne, Zeitraum | Observation / Problem / Hypothese / Next Action / Test / Confidence | Kennzahlen inkl. Herkunft, Zielwerte, Vergleichswerte im selben Konto |
| `generateRecommendations()` | Kunde, Zeitraum | Liste strukturierter Empfehlungen | wie oben, über Kampagnen hinweg |

Zwei Hilfsfunktionen:
- `buildClientContext(clientId, sections[])` — einzige Quelle für Kundenkontext,
  prüft Mandantenzugehörigkeit jedes Fragments, protokolliert die Größe.
- `retrieveKnowledge(query, { limit })` — organisationsweites Wissen per
  Postgres-Volltextsuche, gibt Ausschnitte statt ganzer Dokumente zurück.

**Kontextbudget:** Jeder Workflow deklariert die Abschnitte, die er braucht. Der Builder
schneidet zu und protokolliert die Tokenzahl. Kein Workflow bekommt "alles über den Kunden".

### Human-in-the-loop, technisch verankert

Die AI hat keinen Schreibpfad in operative Daten. Sie erzeugt ausschließlich Zeilen in
`AiGeneration` und `Recommendation` mit Status `NEW`. Statuswechsel setzen einen
eingeloggten Nutzer voraus und schreiben ins Audit Log. Es gibt im MVP keinen Code, der
Kampagnen, Budgets oder Kundenkonten automatisch verändert — nicht als Policy, sondern
weil die Funktion nicht existiert.
