# 02 — Datenmodell

Notation: Prisma-nah, aber als Entwurf zu lesen. Alle IDs sind `cuid`/`uuid`,
alle Tabellen haben `created_at`/`updated_at`, sofern nicht anders vermerkt.

## Grundsätze

1. **`client_id` auf jeder kundenbezogenen Tabelle** — auch wenn sie über Joins
   ableitbar wäre. Bewusste Denormalisierung: sie macht den Mandanten-Guard zu einer
   einzigen `WHERE`-Bedingung und Leaks durch vergessene Joins unmöglich.
2. **`organization_id` nur auf internen Entitäten** (User, Knowledge, Audit). Im MVP
   existiert genau eine Organisation; das Feld verhindert eine teure Migration, falls
   daraus ein SaaS wird.
3. **Abgeleitete KPIs werden nie gespeichert.** CTR, CPC, CPM, CPL, CPA, CAC und ROAS
   werden aus Basiswerten berechnet. Grund: Gespeicherte Quotienten lassen sich nicht
   korrekt aggregieren (der ROAS einer Woche ist nicht der Mittelwert der Tages-ROAS)
   und laufen bei Re-Importen auseinander.
4. **Jede Kennzahl trägt ihre Herkunft** (`source`) und ihren Stand (`as_of`).
5. **Freitext, den nur der Mensch liest, darf `jsonb` sein. Alles, wonach gefiltert,
   gruppiert oder verknüpft wird, bekommt eine Spalte oder eine eigene Tabelle.**

---

## 1. Organisation, Nutzer, Audit

```prisma
model Organization {
  id        String  @id @default(cuid())
  name      String
  timezone  String  @default("Europe/Berlin")
  currency  String  @default("EUR")
}

model User {
  id             String   @id @default(cuid())
  organizationId String
  email          String   @unique
  name           String?
  role           UserRole @default(MEMBER)   // ADMIN | MEMBER
  status         UserStatus @default(ACTIVE) // ACTIVE | DISABLED
  lastLoginAt    DateTime?
  @@index([organizationId])
}

// Auth.js: Account, Session, VerificationToken — Standardschema

model AuditLog {
  id             String   @id @default(cuid())
  organizationId String
  userId         String?            // null = Systemaktion
  clientId       String?            // Mandantenbezug, wenn vorhanden
  action         String             // "strategy.generated", "recommendation.approved", …
  entityType     String
  entityId       String?
  metadata       Json?              // niemals personenbezogene Daten
  createdAt      DateTime @default(now())
  @@index([organizationId, createdAt])
  @@index([clientId, createdAt])
}
```

`AuditLog` ist **append-only**: Das Repository bietet nur `create` und `list`. Kein
Update, kein Delete (außer im dokumentierten Kunden-Hard-Delete).

---

## 2. Kunde und Zielwerte

```prisma
model Client {
  id             String   @id @default(cuid())
  organizationId String
  companyName    String
  slug           String   @unique
  industry       String?
  website        String?
  location       String?
  contactPerson  String?
  contactEmail   String?
  status         ClientStatus @default(ACTIVE) // PROSPECT | ACTIVE | PAUSED | CHURNED
  currency       String   @default("EUR")
  timezone       String   @default("Europe/Berlin")
  aiEnabled      Boolean  @default(true)   // Kunde kann AI-Verarbeitung ausschließen
  archivedAt     DateTime?
  @@index([organizationId, status])
}

// FEHLENDE ANFORDERUNG A1 — ohne Zielwerte hat die AI keinen Bewertungsmaßstab.
model ClientTarget {
  id              String   @id @default(cuid())
  clientId        String
  periodStart     DateTime
  periodEnd       DateTime?
  monthlyBudget   Decimal?
  targetCpl       Decimal?
  targetCpa       Decimal?
  targetRoas      Decimal?
  avgOrderValue   Decimal?   // Basis für Umsatzschätzungen
  leadToCustomer  Decimal?   // erwartete Abschlussquote, 0..1
  notes           String?
  @@index([clientId, periodStart])
}

// FEHLENDE ANFORDERUNG A3 — pro Kunde definieren, was ein Lead/Booking/Kunde ist.
model ClientFunnelDefinition {
  id            String @id @default(cuid())
  clientId      String @unique
  leadDefinition     String   // "Formular abgesendet oder WhatsApp-Nachricht"
  bookingDefinition  String   // "bestätigter Termin im Kalender"
  customerDefinition String   // "Termin wahrgenommen und bezahlt"
  revenueBasis       RevenueBasis @default(NET) // NET | GROSS
}
```

---

## 3. Brand Brain

**Entwurfsentscheidung:** Hybrid aus generischen, versionierbaren Textabschnitten und
echten Tabellen für alles, was referenziert werden muss. So ist das Brand Brain kein
Monsterprompt, sondern eine Menge einzeln abrufbarer Bausteine.

```prisma
// Generische, versionierte Wissensbausteine — die Einheit des AI-Kontexts.
model BrandBrainSection {
  id         String @id @default(cuid())
  clientId   String
  key        String            // "company" | "positioning" | "customer_problems" | …
  title      String
  contentMd  String            // Freitext, vom Menschen gepflegt
  structured Json?             // optionale strukturierte Ergänzung
  version    Int    @default(1)
  updatedById String?
  @@unique([clientId, key])
  @@index([clientId])
}

model BrandBrainSectionHistory {
  id        String @id @default(cuid())
  sectionId String
  clientId  String
  version   Int
  contentMd String
  changedById String?
  changedAt DateTime @default(now())
}

model Service {
  id           String  @id @default(cuid())
  clientId     String
  name         String
  description  String?
  price        Decimal?
  priceModel   String?          // "ab", "Festpreis", "pro Stunde"
  marginPct    Decimal?
  isBestseller Boolean @default(false)
  priority     Int     @default(0)
  @@index([clientId])
}

model Persona {
  id          String  @id @default(cuid())
  clientId    String
  name        String
  description String?
  problems    String[]
  desires     String[]
  objections  String[]
  buyingMotives String[]
  @@index([clientId])
}

model Offer {
  id          String  @id @default(cuid())
  clientId    String
  name        String
  description String?
  price       Decimal?
  validFrom   DateTime?
  validTo     DateTime?
  @@index([clientId])
}

model Competitor {
  id       String @id @default(cuid())
  clientId String
  name     String
  website  String?
  notes    String?
  @@index([clientId])
}

model BrandVoice {
  id             String @id @default(cuid())
  clientId       String @unique
  tone           String?
  voiceDescription String?
  wordsToUse     String[]
  wordsToAvoid   String[]
  ctaPreferences String[]
  dos            String[]
  donts          String[]
  colors         Json?    // { primary: "#…", secondary: […] }
  fonts          Json?
  visualStyle    String?
}

model Asset {
  id            String  @id @default(cuid())
  clientId      String
  type          AssetType // LOGO | PHOTO | VIDEO | TESTIMONIAL | BRAND_GUIDELINE | PREVIOUS_AD
  storageKey    String?   // S3-Key (private)
  externalUrl   String?   // für Videos im MVP
  filename      String?
  mimeType      String?
  sizeBytes     Int?
  notes         String?
  containsPersonalData Boolean @default(false)  // Risiko R9
  consentReference     String?                  // Pflicht bei TESTIMONIAL/UGC
  uploadedById  String?
  @@index([clientId, type])
}
```

---

## 4. Strategie und Angles

```prisma
model Strategy {
  id           String @id @default(cuid())
  clientId     String
  name         String
  goal         String
  serviceId    String?
  budget       Decimal?
  periodStart  DateTime?
  periodEnd    DateTime?
  status       StrategyStatus @default(DRAFT) // DRAFT | ACTIVE | ARCHIVED
  content      Json     // objective, audience, problem, desire, offer, funnel,
                        // creativeStrategy, landingPageStrategy,
                        // trackingRequirements, kpis[], testPlan[]
  generationId String?  // Herkunft: welche AI-Generierung
  editedById   String?
  version      Int @default(1)
  @@index([clientId, status])
}

// Angles bekommen eine eigene Tabelle, weil Creatives und Auswertungen sie referenzieren.
model Angle {
  id          String @id @default(cuid())
  clientId    String
  strategyId  String?
  name        String
  type        AngleType   // PROBLEM | RESULT | TRUST | SOCIAL_PROOF | PRICE | URGENCY | OTHER
  description String?
  @@index([clientId])
}
```

`content` ist `jsonb`, weil der Block vom Menschen frei bearbeitet und als Ganzes
gelesen wird — es gibt keinen Anwendungsfall "alle Strategien mit Funnel-Typ X".
`Angle` dagegen wird gruppiert und ausgewertet, deshalb relational.

---

## 5. Creatives

```prisma
model Creative {
  id           String @id @default(cuid())
  clientId     String
  campaignId   String?
  strategyId   String?
  angleId      String?
  name         String
  format       CreativeFormat  // REEL | STATIC | CAROUSEL | UGC | TESTIMONIAL | STORY
  hook         String?
  primaryText  String?
  headline     String?
  description  String?
  cta          String?
  script       String?
  hypothesis   String?          // "Problem-Angle spricht Zielgruppe stärker an als Brand-Angle"
  status       CreativeStatus @default(IDEA)
  // IDEA | DRAFT | APPROVED | LIVE | WINNER | LOSER | ARCHIVED
  generationId String?
  createdById  String?
  @@index([clientId, status])
  @@index([clientId, angleId])
}

model CreativeAsset {
  creativeId String
  assetId    String
  @@id([creativeId, assetId])
}

model CreativeStatusChange {
  id         String @id @default(cuid())
  creativeId String
  clientId   String
  fromStatus CreativeStatus?
  toStatus   CreativeStatus
  reason     String?
  changedById String?
  changedAt  DateTime @default(now())
}
```

---

## 6. Kampagnen

```prisma
model Campaign {
  id            String @id @default(cuid())
  clientId      String
  name          String
  platform      Platform @default(META)   // META | GOOGLE | TIKTOK | ORGANIC | OTHER
  objective     String?
  offerId       String?
  audienceDescription String?
  budgetTotal   Decimal?
  budgetDaily   Decimal?
  startDate     DateTime?
  endDate       DateTime?
  status        CampaignStatus @default(DRAFT)
  // DRAFT | READY | ACTIVE | PAUSED | COMPLETED
  @@index([clientId, status])
}

model AdSet {
  id         String @id @default(cuid())
  clientId   String
  campaignId String
  name       String
  audience   String?
  budgetDaily Decimal?
  @@index([clientId, campaignId])
}

model Ad {
  id         String @id @default(cuid())
  clientId   String
  adSetId    String
  creativeId String?
  name       String
  @@index([clientId, adSetId])
}

// FEHLENDE ANFORDERUNG A2 — Brücke zwischen internen Entitäten und Meta-Objekten.
model ExternalRef {
  id         String @id @default(cuid())
  clientId   String
  entityType ExternalEntityType // CAMPAIGN | ADSET | AD | CREATIVE | AD_ACCOUNT
  entityId   String
  platform   Platform
  externalId String
  externalName String?
  @@unique([platform, externalId, entityType])
  @@index([clientId, entityType])
}
```

`ExternalRef` ist die Entität, ohne die der gesamte Analytics-Teil nicht funktioniert:
Sie verknüpft die Zeile aus dem Meta-Export mit dem internen Creative. Beim Import gibt
es dafür eine Zuordnungs-UI, und die Zuordnung bleibt für künftige Importe bestehen.

---

## 7. Kennzahlen und Import

```prisma
model MetricSnapshot {
  id          String @id @default(cuid())
  clientId    String
  entityType  MetricEntityType   // CLIENT | CAMPAIGN | ADSET | AD | CREATIVE
  entityId    String
  date        DateTime  @db.Date
  source      MetricSource       // META_API | CSV_IMPORT | MANUAL | ESTIMATE
  currency    String  @default("EUR")

  // ausschließlich Basiswerte — nichts Abgeleitetes
  spend             Decimal?
  impressions       Int?
  reach             Int?
  clicks            Int?
  linkClicks        Int?
  landingPageViews  Int?
  leads             Int?
  bookings          Int?
  customers         Int?
  revenue           Decimal?

  asOf        DateTime            // Stand der Daten (Risiko R7)
  importId    String?
  @@unique([clientId, entityType, entityId, date, source])
  @@index([clientId, date])
}

model Import {
  id           String @id @default(cuid())
  clientId     String
  userId       String?
  source       MetricSource
  filename     String?
  periodStart  DateTime?
  periodEnd    DateTime?
  rowCount     Int      @default(0)
  rowsImported Int      @default(0)
  rowsSkipped  Int      @default(0)
  status       ImportStatus @default(PENDING) // PENDING | PARSED | COMMITTED | FAILED
  errors       Json?
  @@index([clientId, createdAt])
}
```

**Warum `Decimal`, nicht `Float`:** Geldbeträge. Keine Diskussion.
**Warum `@@unique(... , source)`:** Manuell erfasste Bookings sollen Meta-Importe nicht
überschreiben, sondern daneben stehen. Die Aggregationslogik entscheidet dann bewusst,
welche Quelle für welche Kennzahl gilt (Priorität: `META_API` > `CSV_IMPORT` > `MANUAL`
für Spend/Klicks; `MANUAL` > alles für Bookings/Umsatz).

**Frequency, CTR, CPC, CPM, CPL, CPA, CAC, ROAS** werden in
`server/modules/metrics/kpi.ts` berechnet — mit definiertem Verhalten bei fehlenden
Basiswerten (`null`, nicht `0`) und Division durch null.

---

## 8. AI-Artefakte

```prisma
model AiGeneration {
  id            String @id @default(cuid())
  clientId      String
  userId        String?
  workflow      AiWorkflow // STRATEGY | CREATIVES | CREATIVE_BRIEF | ANALYSIS | RECOMMENDATIONS
  promptId      String
  promptVersion Int
  provider      String
  model         String
  contextSections String[]        // welche Brand-Brain-Abschnitte gingen hinein
  contextHash   String            // Reproduzierbarkeit ohne Rohdatenspeicherung
  inputSummary  Json?             // Parameter, keine Rohkundendaten
  output        Json?
  tokensIn      Int?
  tokensOut     Int?
  costCents     Int?
  latencyMs     Int?
  status        GenerationStatus @default(RUNNING) // RUNNING | SUCCEEDED | FAILED | REJECTED_VALIDATION
  error         String?
  @@index([clientId, createdAt])
  @@index([workflow, promptVersion])
}

model Recommendation {
  id             String @id @default(cuid())
  clientId       String
  campaignId     String?
  creativeId     String?
  generationId   String
  severity       Severity   // LOW | MEDIUM | HIGH
  category       RecCategory // CREATIVE | AUDIENCE | BUDGET | FUNNEL | TRACKING | OFFER | LANDING_PAGE
  observation    String
  hypothesis     String
  recommendation String
  confidence     Confidence  // LOW | MEDIUM | HIGH
  evidence       Json        // [{ entityType, entityId, metric, value, period }]
  evidenceValid  Boolean @default(false)  // Ergebnis der Nachprüfung (Risiko R5)
  status         RecStatus @default(NEW)  // NEW | REVIEWED | APPROVED | REJECTED | IMPLEMENTED
  decidedById    String?
  decidedAt      DateTime?
  decisionNote   String?
  @@index([clientId, status, createdAt])
}
```

`evidence` verweist ausschließlich auf Entitäten und Kennzahlen, die im übergebenen
Kontext vorkamen. Nach der Generierung prüft ein Validator jeden Eintrag gegen die
Datenbank; schlägt das fehl, wird `evidenceValid = false` gesetzt und die Empfehlung in
der UI als unbelegt markiert (oder verworfen — siehe Entscheidung E5).

---

## 9. Knowledge Base

```prisma
model KnowledgeDoc {
  id             String @id @default(cuid())
  organizationId String            // organisationsweit, NICHT kundenbezogen
  title          String
  category       String            // "Meta Ads Playbook", "Tracking Standards", …
  tags           String[]
  contentMd      String
  summary        String?           // für kompakten Kontext statt Volltext
  status         DocStatus @default(PUBLISHED) // DRAFT | PUBLISHED | ARCHIVED
  version        Int @default(1)
  updatedById    String?
  @@index([organizationId, category])
  // + tsvector-Spalte & GIN-Index via Migration (deutsche Textsuche-Konfiguration)
}
```

**Policy:** Knowledge-Dokumente enthalten keine Kundendaten. Das ist die Bedingung
dafür, dass sie organisationsweit in jeden Prompt dürfen, ohne die Mandantentrennung
zu verletzen. Hinweis in der UI, Review beim Veröffentlichen.

---

## 10. Was das Modell bewusst NICHT enthält

- **Keine Endkunden-Datensätze.** Keine Namen, Telefonnummern oder E-Mail-Adressen von
  Leads (siehe Entscheidung E4). Nur Zählwerte.
- **Keine gespeicherten Quotienten** (CTR/ROAS/…).
- **Keine Meta-Zugangstoken im MVP.** Kommt mit M9, dann verschlüsselt in einer eigenen
  `Integration`-Tabelle mit Rotation.
- **Keine Social-Media-Posts / Content-Kalender.** Verschoben.
