# 00 — Analyse der Produktspezifikation

## 1. Befund: Repository-Stand

Geprüft am 2026-09-21, Branch `claude/northline-ai-marketing-manager-ww1ltw`.

- Das Repository ist `claude-for-legal`: ein **Claude-Code-Plugin-Marketplace**
  (12 First-Party-Legal-Plugins, 1 Vendor-Plugin, 5 Managed-Agent-Cookbooks).
- Inhalt: Markdown-Prompts (`skills/`, `agents/`), JSON-Manifeste, YAML-Cookbooks,
  Python-Validierungsskripte.
- **Kein Applikationscode vorhanden**: kein `package.json`, kein `next.config.*`,
  kein `tsconfig.json`, keine `.tsx`, kein Prisma/Drizzle-Schema, keine Datenbank.
- CI: nur ein CLA-Workflow. Die Repo-eigene `CLAUDE.md` definiert Konventionen für
  Plugin-Manifeste und Marketplace-Invarianten — für eine Next.js-Anwendung irrelevant
  und in Teilen hinderlich.

**Konsequenz:** Wir bauen auf der grünen Wiese. Es gibt keinen bestehenden Stack, an
den wir uns anpassen müssten. Aber: dieses Repo ist der falsche Ort für das Produkt
(→ Entscheidung **D1** in `01-architektur.md`).

---

## 2. Offene Fragen

Nach Priorität. "Blockierend" = ohne Antwort kann ich einen Teil des MVP nicht
sinnvoll bauen.

### Blockierend

| # | Frage | Warum sie blockiert |
| --- | --- | --- |
| F1 | Wo soll der Code leben — neues Repository oder hier? | Bestimmt Setup, CI, Deployment. |
| F2 | Hosting-Region und -Anbieter: EU-Pflicht? Gibt es Kundenverträge (AVV), die deutsches/EU-Hosting vorschreiben? | Bestimmt Datenbank, Storage, Deployment-Ziel. Nachträglicher Wechsel ist teuer. |
| F3 | Auth: Nutzt Northline Google Workspace oder Microsoft 365? Wie viele interne Nutzer (heute / in 12 Monaten)? | Bestimmt SSO vs. Magic Link vs. Passwort. |
| F4 | Dürfen **personenbezogene Leaddaten** (Name, Telefon, E-Mail von Endkunden) ins System? Meine starke Empfehlung: nein, nur aggregierte Zahlen. | Ändert das gesamte Datenschutz-Profil, Löschkonzept und den AI-Kontext. |
| F5 | Dürfen Kundendaten (Brand Brain, Kampagnendaten) an einen externen LLM-Anbieter gesendet werden? Existieren dafür AVV/Unterauftragsverarbeiter-Klauseln mit euren Kunden? | Ohne Rechtsgrundlage ist der gesamte AI-Teil nicht produktiv einsetzbar. |

### Wichtig, aber nicht sofort blockierend

| # | Frage |
| --- | --- |
| F6 | **Meta-Zugang:** Habt ihr einen eigenen Business Manager mit Partner-Zugriff auf die Kunden-Werbekonten? Existiert eine Meta-App mit `ads_read`? Status des App Review? System-User-Token vorhanden? |
| F7 | **Woher kommen Leads, Bookings, Umsatz?** Meta liefert nur Spend/Impressions/Clicks (und evtl. Pixel-Leads). Bookings und Umsatz liegen in den Systemen der Kunden (Kalender, Kasse, CRM). Wie erfasst ihr das heute? |
| F8 | CSV-Format: Welcher Export genau (Meta Ads Manager, deutsche oder englische Spaltenköpfe, Dezimalkomma)? Bitte 2–3 echte Beispieldateien (anonymisiert). |
| F9 | Währung, Netto/Brutto, Zeitzone für Reporting. Alle Kunden EUR? Umsatz netto? |
| F10 | Wer pflegt das Brand Brain — nur Northline-Mitarbeiter, oder sollen Kunden später Zugriff bekommen? |
| F11 | Assets: Müssen Videos (GB-Größen) im System liegen, oder reichen Links (Drive/Frame.io) plus Vorschaubilder? |
| F12 | Sprache: UI deutsch? AI-Outputs deutsch? Einzelne Kunden mit englischen Creatives? |
| F13 | Welche Tools werden abgelöst (Notion, Google Sheets, Airtable)? Ist ein Initial-Import nötig? |
| F14 | Wer wartet die Software langfristig? Interner Entwickler, Freelancer, du selbst? Das bestimmt, wie konservativ der Stack sein sollte. |
| F15 | Budget-Rahmen pro Monat für Infrastruktur + AI-Tokens? |
| F16 | Gibt es bereits ein Northline-Playbook (Meta Ads, Creative Strategy, Tracking Standards) als Dokument? Das ist der Startinhalt der Knowledge Base. |

---

## 3. Technische Risiken

### R1 — Die Attributionskette ist das eigentliche Produktrisiko (hoch)

Die Produktvision hängt an der Kette
`Spend → Klick → Lead → Booking → Kunde → Umsatz`.
Technisch liefert Meta zuverlässig nur die linke Hälfte. Bookings, Kunden und Umsatz
entstehen in fremden Systemen. Auf Kampagnen-Ebene ist eine grobe Zuordnung machbar;
auf **Creative-Ebene** ist Umsatzattribution ohne durchgereichte Ad-ID (UTM-Parameter
bis ins Buchungssystem, oder Click-to-WhatsApp-Referral-Daten) praktisch unmöglich.

Folge: Kapitel 9 der Spezifikation ("welche Hypothese funktioniert, gemessen an ROAS
pro Hook") funktioniert im MVP nur bis CTR/CPC/CPL — nicht bis ROAS, solange die
Lead-Quelle nicht bis zur Buchung mitgeführt wird.

**Mitigation:**
- Jede Kennzahl bekommt eine explizite Herkunft (`source: META_API | CSV_IMPORT | MANUAL | ESTIMATE`)
  und wird in der UI entsprechend markiert. Keine Zahl ohne Herkunft.
- Abgeleitete KPIs werden nur berechnet, wenn beide Basiswerte aus einer belastbaren
  Quelle stammen; sonst zeigt die UI "nicht verfügbar" statt einer erfundenen Zahl.
- Creative-Level-Analyse im MVP ehrlich begrenzt auf: Spend, Impressions, Klicks,
  CTR, CPC, CPM, Frequency und — falls vorhanden — Leads.
- Eigener Milestone (M9) für "Tracking-Kette schließen", nicht versteckt im Import.

### R2 — Cross-Tenant-Leakage im AI-Kontext (hoch)

Das Risiko ist nicht die Datenbankabfrage (die lässt sich absichern), sondern der
Moment, in dem ein Prompt aus mehreren Quellen zusammengesetzt wird. Ein falsch
gesetzter Parameter, und Kunde A sieht die Positionierung von Kunde B.

**Mitigation** (mehrschichtig, siehe `01-architektur.md`):
1. Jede kundenbezogene Tabelle trägt `client_id` — auch dort, wo es über Joins
   ableitbar wäre (denormalisiert, bewusst).
2. Datenzugriff ausschließlich über eine Repository-Schicht mit erzwungenem
   `clientId`-Parameter. ESLint-Regel: kein direkter ORM-Zugriff außerhalb dieser Schicht.
3. `buildClientContext(clientId)` ist die **einzige** Funktion, die AI-Kontext aus
   Kundendaten baut. Sie prüft zur Laufzeit, dass jedes Fragment dieselbe `client_id` trägt,
   und wirft sonst.
4. Automatisierte Leak-Tests: Testsuite, die für jeden AI-Workflow prüft, dass im
   erzeugten Prompt kein String aus einem Fremdkunden vorkommt.
5. Der Knowledge-Base-Bereich ist bewusst **organisationsweit**, nicht kundenbezogen —
   und darf per Policy keine Kundendaten enthalten (Hinweis in der UI + Review-Pflicht).

### R3 — Zwei Ebenen von "Mandant" werden verwechselt (mittel)

"Tenant" = Northline (die Organisation, später ggf. andere Agenturen im SaaS).
"Client" = der betreute Kunde. Im MVP gibt es genau eine Organisation.

**Entscheidung:** `organization_id` wird von Anfang an mitgeführt (für interne Entitäten:
User, Knowledge, Audit), auch wenn sie im MVP konstant ist. Nachträglich einzuziehen ist
ein teurer Migrations-Refactor. Kosten jetzt: fast null.

### R4 — LLM-Latenz, -Kosten und -Nichtdeterminismus (mittel)

Strategie- und Creative-Generierungen dauern realistisch 15–60 Sekunden. Ein naiver
Request-Response-Zyklus führt zu Timeouts und verlorenen Outputs.

**Mitigation:** Vor jedem Modellaufruf wird eine `AiGeneration`-Zeile mit Status
`RUNNING` geschrieben; das Ergebnis wird dort persistiert, unabhängig davon, ob der
Browser noch verbunden ist. Streaming in der UI. Keine Job-Queue im MVP (nicht nötig
bei ~10 Nutzern), aber die Struktur erlaubt später einen Worker ohne Umbau.
Kostenkontrolle: Token- und Kostenerfassung pro Generierung, Rate Limit pro Nutzer/Tag.

### R5 — Erfundene Benchmarks und halluzinierte Zahlen (hoch für die Produktqualität)

Die Spezifikation fordert zu Recht: keine erfundenen Branchen-Benchmarks. Ein LLM
produziert sie trotzdem, wenn man es nicht daran hindert.

**Mitigation:**
- Strukturierter Output (JSON-Schema / Zod), nicht Freitext. Jede `Recommendation`
  enthält `evidence[]`, das ausschließlich auf IDs und Metriken aus dem übergebenen
  Kontext verweist.
- Validierungsschritt nach der Generierung: lässt sich ein Evidence-Verweis nicht auf
  reale Datensätze auflösen, wird die Empfehlung verworfen bzw. als "nicht belegt" markiert.
- Der Bewertungsmaßstab kommt aus den Daten, nicht aus dem Modellwissen — dafür braucht
  es Zielwerte pro Kunde (siehe fehlende Anforderung A1).

### R6 — Prompt Injection über Kundendaten (mittel)

Brand-Brain-Felder, importierte CSV-Zellen und Asset-Dateinamen landen im Prompt. Wer
sie befüllt, könnte (absichtlich oder versehentlich) Anweisungen einschleusen.

**Mitigation:** Kontext wird klar als Daten ausgezeichnet und nie als Instruktion
behandelt. Die AI hat **keine** Tools und **keine** Schreibrechte — ihr Output ist immer
nur ein Vorschlag, der in einer Tabelle landet. Damit ist die Angriffsfläche klein.

### R7 — Meta-Insights sind rückwirkend veränderlich (mittel)

Meta-Attributionsfenster reichen bis 28 Tage; Zahlen für einen Tag ändern sich noch
Tage später. Wer sie als unveränderlich speichert, bekommt Differenzen zum Ads Manager
und verliert das Vertrauen der Nutzer.

**Mitigation:** `MetricSnapshot` mit `as_of`-Zeitstempel und Upsert-Logik pro
(Kunde, Entität, Tag, Quelle); jeder Import wird protokolliert. Die UI zeigt "Stand: …".

### R8 — AI-Provider-Lock-in (niedrig, wenn man es nicht übertreibt)

Eine Abstraktionsschicht ist richtig — aber eine *schmale*. Eine Universal-Abstraktion
über alle Provider-Features kostet mehr, als sie spart.

**Mitigation:** Ein einziges Interface `complete({ model, system, input, schema })` plus
Provider-Adapter. Modellwahl pro Workflow konfigurierbar.

### R9 — Assets und Personenbezug (mittel)

Testimonials, UGC-Videos und Kundenfotos enthalten personenbezogene Daten und Bildrechte.
Ein Upload-Feld ohne Rechtenachweis erzeugt ein rechtliches Problem.

**Mitigation:** Asset-Datensatz mit Feldern `contains_personal_data` und `consent_reference`;
Pflichtangabe bei Typ `TESTIMONIAL`/`UGC`. Signierte, kurzlebige URLs statt öffentlicher Links.

### R10 — Was *kein* Risiko ist

Skalierung. Bei 8 Kunden, ~14 Kampagnen und ~10 internen Nutzern gibt es keinen
Performance-Druck. Jede Architekturentscheidung, die mit "aber wenn wir mal skalieren"
begründet wird, ist im MVP falsch.

---

## 4. Fehlende Anforderungen

Diese Dinge fehlen in der Spezifikation und sind nötig, damit der Rest funktioniert.

**A1 — Zielwerte pro Kunde (`ClientTarget`).**
Kapitel 12 verlangt eine Bewertung ohne Branchen-Benchmarks, "primär anhand von
Kundenzielen". Diese Ziele sind aber nirgends modelliert. Ohne Ziel-CPA, Ziel-ROAS,
Monatsbudget und durchschnittlichen Auftragswert hat die AI **keinen Maßstab** und
fällt zwangsläufig auf Modellwissen zurück. Ich ergänze dafür eine eigene Entität.

**A2 — Verknüpfung internes Creative ↔ Meta-Ad.**
Kapitel 9 setzt voraus, dass Performance-Daten dem richtigen Creative zugeordnet werden.
Dafür braucht es ein persistentes Mapping (`external_ref`) plus eine Zuordnungs-UI beim
Import ("welche Zeile gehört zu welchem Creative?"). Ohne das ist die Creative-Analyse wertlos.

**A3 — Definition der Funnel-Begriffe.**
"Lead", "Booking", "Customer" müssen pro Kunde definiert sein (ist eine WhatsApp-Nachricht
ein Lead? Ist ein Termin ein Booking oder erst der erschienene Termin?). Das gehört als
Konfiguration an den Kunden, sonst sind die KPIs quer über Kunden nicht vergleichbar.

**A4 — Löschkonzept und Export.**
Kapitel 22 nennt "data deletion" und "export capability", aber nicht, was passiert, wenn
ein Kunde gekündigt wird: Wie lange bleiben Daten? Wer löscht? Was wird exportiert?
Ich schlage vor: Soft-Archivierung + expliziter, protokollierter Hard-Delete pro Kunde
inkl. Assets, plus JSON-Vollexport pro Kunde.

**A5 — Audit-Log-Aufbewahrung.**
Wie lange? Wer darf es sehen? Append-only ist eine Design-Entscheidung, keine Option.

**A6 — Backup/Restore.**
Nicht erwähnt. Bei Kundendaten nicht verhandelbar: Point-in-Time-Recovery + getesteter Restore.

**A7 — Rollen.**
Die Spezifikation spricht von "Human-in-the-loop"-Freigaben, definiert aber nicht, **wer**
freigeben darf. MVP-Vorschlag: zwei Rollen (`ADMIN`, `MEMBER`), beide dürfen Recommendations
entscheiden; `ADMIN` verwaltet Nutzer, Kunden-Löschung und Einstellungen.

**A8 — Mehrere Währungen / Zeitzonen.**
Meta rechnet in der Zeitzone und Währung des Werbekontos. Ohne explizite Festlegung
entstehen falsche Tagesaggregationen. MVP-Vorschlag: Alles EUR, Zeitzone pro Kunde
gespeichert, Reporting in Kunden-Zeitzone.

---

## 5. Unnötige Komplexität — was ich bewusst weglasse

| Thema in der Spezifikation | Entscheidung | Begründung |
| --- | --- | --- |
| Fünf autonome AI-Agents (Kap. 19) | Fünf **Funktionen**, kein Agent-Framework | Es gibt keine Aufgabe, die mehrstufige autonome Planung braucht. Funktionen sind testbar, günstiger und nachvollziehbar. |
| Vektordatenbank für die Knowledge Base | Postgres Volltextsuche (`tsvector`, deutsche Konfiguration) + Tags | Bei erwartet 20–200 internen Dokumenten schlägt gute Volltextsuche + manuelle Kuratierung ein Embedding-Setup. Falls doch nötig: `pgvector` in derselben Datenbank, keine separate Vektor-DB. |
| Redis / Queue-System | Nicht im MVP | Keine Last, kein Nutzen. Falls später nötig: `pg-boss` in der vorhandenen Postgres statt zusätzlicher Infrastruktur. |
| Microservices | Modularer Monolith | Explizit auch deine Präferenz. Richtig. |
| Meta Write API (Kampagnen anlegen/pausieren) | Nicht im MVP, Architektur hält die Tür offen | Schreibzugriff auf Kunden-Werbekonten ist das größte operative Risiko im ganzen Produkt. |
| Social Publishing, Content Calendar, Scheduling (Kap. 24) | Verschoben | Eigenes Produkt, eigener Freigabe-Workflow, eigene API-Integrationen. |
| Feingranulares RBAC | 2 Rollen | Bei ~10 internen Nutzern ist alles andere Overhead. |
| Realtime-Updates / WebSockets | Nein | Niemand schaut einem Dashboard beim Aktualisieren zu. |
| Mehrsprachigkeit (i18n-Framework) | Eine Sprache, hart verdrahtet | Interne Software. i18n später nachrüsten ist unaufwendig, wenn man keine Strings in Komponenten streut. |
| "Lernendes" ML-System für Creative-Hypothesen | Deskriptive Aggregation + LLM-Analyse | Für echtes ML fehlen Datenmengen um Größenordnungen. |
| Dark/Light Mode | **Drin** | Mit shadcn/ui + `next-themes` praktisch kostenlos. |

---

## 6. Datenschutz und Sicherheit

### Rollenverteilung (DSGVO)

Northline verarbeitet im Auftrag seiner Kunden deren Marketing- und ggf. Kundendaten.
Damit ist Northline **Auftragsverarbeiter** (Art. 28 DSGVO) und braucht:
- einen AVV mit jedem betreuten Kunden,
- eine gepflegte Liste der Unterauftragsverarbeiter (Hosting, Datenbank, Object Storage,
  LLM-Anbieter, Fehler-Monitoring) — **jeder neue Dienst im Stack ist ein Unterauftragsverarbeiter**,
- ein Verzeichnis von Verarbeitungstätigkeiten,
- technische und organisatorische Maßnahmen (TOM).

Das ist kein Blocker für den Bau, aber einer für den Produktivbetrieb. Bitte parallel klären (F5).

### Grundsatzentscheidung, die ich empfehle: keine Lead-PII im System

Das System speichert **aggregierte Kennzahlen**, keine Endkunden-Datensätze. Also:
"47 Leads im Juni", nicht "Max Mustermann, 0171…".

Wirkung: Das Auskunfts-, Lösch- und Meldepflicht-Risiko sinkt drastisch, der
AI-Kontext wird automatisch datensparsam, und für den Zweck des Produkts
(Kampagnen-Optimierung) geht nichts verloren. Wenn ihr später Lead-Qualität pro Creative
bewerten wollt, geht das über pseudonyme Lead-IDs ohne Klarnamen.
→ Entscheidung **E4** in `05-offene-entscheidungen.md`.

### Maßnahmen im MVP (nicht später)

| Bereich | Umsetzung |
| --- | --- |
| Authentifizierung | SSO oder Magic Link, keine selbstgebauten Passwörter (→ D4) |
| Autorisierung | Server-seitige Prüfung in jeder Server Action / Route; niemals nur UI-seitig |
| Mandantentrennung | `client_id` auf jeder Entität + Repository-Guard + Leak-Tests (R2) |
| Eingabevalidierung | Zod-Schema an jeder Systemgrenze (Form, Route, CSV-Zeile, AI-Output) |
| Secrets | Nur serverseitig, aus dem Secret Store des Hosters. Keine API-Keys im Client-Bundle. Keine `.env` im Repo. |
| Kunden-Tokens (später Meta) | Verschlüsselt at rest (AES-GCM, Schlüssel aus Secret Store), nie im Log, nie im Klartext in der UI |
| Rate Limiting | Auf allen AI-Endpunkten (Kostenschutz) und Auth-Endpunkten |
| Dateizugriff | Private Buckets, kurzlebige signierte URLs, Zugriffsprüfung gegen `client_id` |
| Logging | Keine personenbezogenen Daten, keine Prompt-Inhalte mit Kundendaten in externen Log-Diensten |
| Audit Log | Append-only, kein Update/Delete, mit Nutzer, Kunde, Aktion, Entität, Zeitstempel |
| Löschung | Pro Kunde: vollständiger Hard-Delete inkl. Assets und Generierungen, protokolliert |
| Export | Pro Kunde: JSON-Vollexport + CSV der Kennzahlen |
| Backups | Managed PITR, Restore-Test einmal dokumentiert durchführen |
| Transport | HTTPS erzwungen, HSTS, sichere Cookies (`httpOnly`, `sameSite=lax`, `secure`) |

### AI-spezifisch

- Nur der tatsächlich benötigte Kontext geht an den Anbieter (kein "ganzes Brand Brain
  in jeden Prompt").
- Anbieter mit Zusicherung "kein Training auf API-Daten" und möglichst kurzer
  Datenspeicherung wählen; EU-Verarbeitung bevorzugen.
- Pro Generierung wird protokolliert: Workflow, Prompt-Version, Modell, Kunde, Nutzer,
  Kosten. Damit ist jederzeit belegbar, was wann an wen gesendet wurde.
- Ein globaler Schalter "AI deaktiviert" pro Kunde, falls ein Kunde der
  AI-Verarbeitung widerspricht.

---

## 7. Was wir verschieben (und wann es zurückkommt)

| Feature | Verschoben nach |
| --- | --- |
| Meta Marketing API (lesend) | M9 — erst wenn Import und KPI-Logik stabil sind |
| Meta API (schreibend) | Nach dem MVP, eigener Sicherheits-Review |
| Embedding-basierte Knowledge-Retrieval | Nur falls Volltextsuche messbar nicht reicht |
| Social Media Publishing / Content Calendar | Nach MVP |
| Kundenzugänge (Kunde sieht sein Dashboard) | Nach MVP — verändert Auth- und Rechtemodell |
| Automatisierte Aktionen ohne Freigabe | Bewusst nicht geplant |
| Multi-Agentur-SaaS | Datenmodell ist vorbereitet (`organization_id`), Feature später |
