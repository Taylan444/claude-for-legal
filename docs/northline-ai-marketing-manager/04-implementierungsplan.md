# 04 — Implementierungsplan

## Prüfung deiner Phasenreihenfolge (Kapitel 26)

Die vorgeschlagene Reihenfolge ist im Kern richtig. Vier Korrekturen:

**1. Ein "Walking Skeleton" muss vor allem anderen stehen.**
Auth, Datenbank, Deployment, CI und eine echte Seite — am ersten Tag produktiv
deploybar. Grund: Deployment-, Auth- und Migrationsprobleme sind die einzigen, die
später ganze Milestones blockieren können. Sie gehören nach vorn, nicht ans Ende.

**2. Phase 3 (Strategy) und Phase 4 (Creative Studio) gehören in einen Milestone.**
Beide nutzen denselben AI-Layer: Provider, Prompt-Registry, Kontext-Builder,
Output-Validierung, Generierungsprotokoll. Getrennt gebaut, baut man diesen Layer
zweimal oder baut ihn beim zweiten Mal um. Zusammen ist es ein Milestone mit zwei
Features und deutlich weniger Nacharbeit.

**3. Das Creative↔Ad-Mapping muss bei der Kampagnenplanung entstehen, nicht beim Import.**
Sonst liegen in Phase 6 Kennzahlen vor, die sich keinem Creative zuordnen lassen — und
Phase 7 (die eigentliche Produktidee) läuft leer. Deshalb gehört `ExternalRef` samt
Zuordnungs-UI in M5, nicht in M6.

**4. Eine minimale Knowledge Base muss vor die AI-Strategie, nicht dahinter.**
Phase 8 ist zu spät: Ohne das Northline-Playbook im Kontext erzeugt der Strategy-Workflow
generische Marketing-Sprache, und ihr bewertet den Workflow anhand schlechter Ergebnisse.
Lösung: in M3 eine schlanke Variante (Dokumente als Markdown in der Datenbank +
Volltextsuche); die komfortable Verwaltungsoberfläche kommt später in M8.

Ergebnis: 11 Milestones. Jeder ist einzeln deploybar und für sich nützlich.

---

## Milestones

### M0 — Fundament (Walking Skeleton)
**Inhalt:** Repository, Next.js + TypeScript (strict), Tailwind + shadcn/ui, Prisma +
Postgres (lokal via Docker), Auth (Login funktioniert), App-Shell mit Navigation, CI
(Lint, Typecheck, Test, Build), Deployment auf die Zielumgebung, `.env.example`,
geprüfte Umgebungsvariablen, Fehler- und Ladezustände als wiederverwendbare Komponenten.
**Definition of Done:** Ein Northline-Mitarbeiter kann sich auf der deployten URL
anmelden und eine leere, gestaltete Oberfläche sehen. Migration läuft in der Produktion.
**Prüfbar durch:** Login, Deployment-URL, grüner CI-Lauf.

### M1 — Client Management
**Inhalt:** Kunden anlegen, bearbeiten, archivieren; Liste mit Filter und Suche;
Kundendetail-Shell mit Tab-Navigation; Rollen (`ADMIN`/`MEMBER`); Audit-Log-Infrastruktur
inkl. `withAudit()`-Wrapper; Repository-Guard und die ersten Isolations-Tests.
**DoD:** DoD-Punkt 1 der Spezifikation erfüllt ("einen Kunden anlegen"). Cross-Tenant-Tests
laufen grün.

### M2 — Brand Brain
**Inhalt:** Brand-Brain-Abschnitte (bearbeiten, versionieren, Historie), Services,
Personas, Offers, Competitors, Brand Voice, Zielwerte (`ClientTarget`), Funnel-Definition;
Asset-Upload mit signierten URLs und Personenbezug-Kennzeichnung;
Vollständigkeitsanzeige ("Brand Brain zu 60 % gefüllt").
**DoD:** DoD-Punkt 2 erfüllt. Ein Kunde ist vollständig beschreibbar, ohne dass ein
Freitextfeld zum Sammelbecken wird.

### M3 — AI-Fundament + Strategie + Creative Studio
**Inhalt:**
- AI-Schicht: Provider-Abstraktion, Prompt-Registry mit Versionierung,
  `buildClientContext()`, Output-Validierung, `AiGeneration`-Protokoll, Token-/Kostenerfassung,
  Rate Limiting.
- Minimale Knowledge Base: Dokumente + Volltextsuche + `retrieveKnowledge()`.
- `generateStrategy()`: Eingabemaske (Ziel, Leistung, Budget, Zeitraum) → strukturierte,
  vollständig editierbare Strategie; Speichern, Versionieren, Archivieren.
- `generateCreatives()`: Angles, Hooks, Copy, Headlines, CTA, Skripte; alles speicherbar
  als `Creative` mit Status und Hypothese.
- Isolations-Tests für den Kontext-Builder.
**DoD:** DoD-Punkte 3, 4, 5 erfüllt. Für einen echten Kunden entsteht eine Strategie, die
ein Northline-Mitarbeiter ohne Umschreiben verwenden würde. Jede Generierung ist auf
Prompt-Version und Modell zurückführbar.
**Risiko:** Der größte Milestone. Falls er zu groß wird, wird er an der Grenze
AI-Fundament / Creative Studio geteilt.

### M4 — Creative-Verwaltung
**Inhalt:** Creative-Übersicht mit Filtern (Angle, Format, Status), Statusworkflow inkl.
Historie, Verknüpfung mit Assets, Creative-Briefs, Duplizieren und Variantenbildung.
**DoD:** Der Bestand an Creatives eines Kunden ist über Zeit nachvollziehbar, inklusive
der Hypothese hinter jedem einzelnen.

### M5 — Kampagnenplanung + externes Mapping
**Inhalt:** Kampagne → Ad Sets → Ads → Creatives; Status-Workflow; Budget und Zeitraum;
`ExternalRef` mit Zuordnungs-UI ("dieses Ad Set entspricht Meta-Ad-Set X"); Planungsexport
(CSV/PDF) als Umsetzungsgrundlage.
**DoD:** DoD-Punkt 6 erfüllt. Eine Kampagne ist intern vollständig planbar, und die
Brücke zu den Meta-Objekten steht — Voraussetzung für M6/M7.

### M6 — Import von Performance-Daten
**Inhalt:** CSV-Upload (Meta-Ads-Manager-Export, deutsche und englische Spaltenköpfe,
Dezimalkomma), Vorschau vor dem Commit, Spaltenzuordnung, Duplikat- und
Zeitraumerkennung, Importprotokoll, Re-Import mit Aktualisierung statt Verdopplung;
manuelle Erfassung von Bookings, Kunden und Umsatz pro Zeitraum; Herkunfts-Kennzeichnung
jeder Kennzahl in der UI.
**DoD:** DoD-Punkt 7 erfüllt. Ein Monatsexport eines echten Kunden lässt sich importieren
und die Summen stimmen mit dem Ads Manager überein (Abweichungen erklärbar).

### M7 — Analytics
**Inhalt:** KPI-Berechnung (rein, getestet), Zeitreihen, Kampagnen-, Creative-, Angle-
und Hook-Vergleich, Funnel-Visualisierung, Zeitraumauswahl, Kunden-Dashboard und
Northline-Gesamtdashboard mit Kundenstatus-Tabelle.
**DoD:** DoD-Punkt 8 erfüllt. Keine Zahl ohne Herkunft; fehlende Basiswerte führen zu
"nicht verfügbar", nicht zu 0.

### M8 — AI-Analyse und Recommendations + vollständige Knowledge Base
**Inhalt:** `analyzeCampaign()` und `generateRecommendations()` im geforderten Format
(Observation / Problem / Hypothese / Next Action / Test / Confidence); Evidence-Validierung
gegen die Datenbank; Recommendation-Verwaltung mit Freigabe/Ablehnung inkl. Begründung
und Audit; AI-Alerts auf dem Dashboard, ausschließlich aus vorhandenen Daten abgeleitet;
Knowledge-Base-Oberfläche (Anlegen, Kategorien, Tags, Versionen).
**DoD:** DoD-Punkte 9, 10, 11 erfüllt. Eine Empfehlung ohne belegbare Evidence erscheint
nicht als belegt.

### M9 — Meta Marketing API (nur lesend)
**Inhalt:** `integrations/meta` mit verschlüsselter Token-Ablage, Ad-Account-Auswahl pro
Kunde, Insights-Abruf (Kampagne/Ad Set/Ad/Creative), Mapping auf `MetricSnapshot`,
Abgleich mit `ExternalRef`, täglicher Abruf, Behandlung von Rate Limits, Token-Ablauf und
rückwirkenden Änderungen.
**DoD:** DoD-Punkt 7 automatisiert. **Kein einziger schreibender API-Aufruf im Code.**
**Voraussetzung:** Antwort auf F6.

### M10 — Härtung und Betrieb
**Inhalt:** Datenexport und Hard-Delete pro Kunde, Audit-Log-Ansicht, Rechte-Review,
Rate Limits final, Restore-Test dokumentiert, Runbook, Onboarding-Dokumentation,
Zugänglichkeit (Tastaturbedienung, Kontraste, Screenreader-Labels), Performance-Durchgang.
**DoD:** DoD-Punkt 12 formal nachgewiesen. Ein Kundenoffboarding ist in unter 5 Minuten
vollständig und protokolliert durchführbar.

---

## Arbeitsweise pro Milestone

Nach jedem Milestone liefere ich:
1. Was gebaut wurde (kurz),
2. Liste der geänderten Dateien,
3. Testergebnisse — inklusive fehlgeschlagener Tests, falls vorhanden,
4. offene Probleme und getroffene Detailentscheidungen (als ADR in `docs/decisions/`),
5. den nächsten Milestone.

Detailentscheidungen treffe ich selbst und dokumentiere sie. Rückfragen stelle ich nur,
wenn eine Entscheidung das Produkt spürbar verändert oder wenn mir Fakten fehlen, die ich
nicht erfinden darf (Zugangsdaten, Geschäftszahlen, rechtliche Rahmenbedingungen).

## Mock-Daten

Solange keine echten Datenquellen angebunden sind, sind Beispielwerte
- ausschließlich über `prisma/seed.ts` erzeugt,
- an einen Demo-Kunden gebunden ("DEMO — Muster GmbH"),
- in der UI durch ein Badge "Mock-Daten" gekennzeichnet,
- in der Produktion nicht geladen.

Es gibt keine erfundenen Zahlen in Produktionsansichten. Leere Zustände zeigen leere
Zustände.
