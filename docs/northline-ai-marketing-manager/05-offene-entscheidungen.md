# 05 — Offene Entscheidungen und benötigte Informationen

## Teil 1 — Entscheidungen, die VOR dem Coding fallen müssen

Diese fünf ändern die Struktur des Projekts. Nachträglich zu korrigieren kostet Tage
bis Wochen.

### E1 — Wo lebt der Code? *(Entscheidung D1)*
- **A (Empfehlung):** neues privates Repository `northline-ai-marketing-manager`
- **B:** Unterverzeichnis `apps/northline/` in diesem Repository

*Warum blockierend:* Betrifft das erste Commit, CI, Secrets und Deployment.

### E2 — Hosting und Region *(Entscheidung D6)*
- **A (Empfehlung):** Vercel (Region Frankfurt) + Managed Postgres in der EU +
  S3-kompatibler Storage in der EU — schnell, wartungsarm, geringe Fixkosten
- **B:** Hetzner (Deutschland), Docker-Deployment, alles selbst betrieben — volle
  Datenhoheit, mehr Betriebsaufwand

*Warum blockierend:* Bestimmt Datenbank-Anbieter, Storage, Deployment-Pipeline und die
Liste der Unterauftragsverarbeiter in euren AVVs.
*Entscheidungshilfe:* Wenn auch nur ein Kunden-AVV Hosting in Deutschland verlangt oder
US-Anbieter ausschließt → B.

### E3 — Authentifizierung *(Entscheidung D4)*
- **A (Empfehlung, falls vorhanden):** SSO über euren Identity-Provider
  (Google Workspace / Microsoft 365)
- **B:** Magic-Link per E-Mail (kein Passwort)
- **C:** Externer Anbieter (Clerk/WorkOS)

*Warum blockierend:* Auth ist im Fundament (M0) und lässt sich nicht folgenlos tauschen.
*Frage an dich:* Welchen Identity-Provider nutzt Northline? Wie viele interne Nutzer?

### E4 — Personenbezogene Leaddaten im System?
- **A (starke Empfehlung):** **Nein.** Nur aggregierte Zahlen ("47 Leads im Juni").
  Keine Namen, Telefonnummern, E-Mail-Adressen von Endkunden.
- **B:** Ja, inklusive Leaddatensätze.

*Warum blockierend:* Option B verändert Datenmodell, Löschkonzept, AI-Kontext,
Zugriffsrechte, Protokollierung und den gesamten DSGVO-Aufwand grundlegend. Für den Zweck
des Produkts — Kampagnen optimieren — wird B nicht gebraucht.

### E5 — Umgang mit nicht belegbaren AI-Empfehlungen
- **A (Empfehlung):** Empfehlung wird gespeichert, aber sichtbar als "nicht belegt"
  markiert und in Listen nach hinten sortiert.
- **B:** Empfehlung wird verworfen und gar nicht angezeigt.

*Warum jetzt:* Bestimmt Validierungslogik und UI in M8, aber auch das Datenmodell
(`evidenceValid`). A ist ehrlicher gegenüber dem Nutzer und erhält die Möglichkeit,
Prompt-Qualität zu beobachten.

---

## Teil 2 — Informationen, die ich von dir brauche

### Bevor M0 startet
1. Antwort auf E1–E5.
2. Zugang bzw. Freigabe für das Ziel-Repository und die Deployment-Umgebung.
3. UI-Sprache und Sprache der AI-Ausgaben (Vermutung: beides Deutsch — bitte bestätigen).

### Bevor M2 (Brand Brain) startet
4. Ein realer, ausgefüllter Kunde als Referenz (anonymisiert reicht): Wie beschreibt ihr
   heute Zielgruppe, Leistungen, Preise, Einwände? Am besten das Dokument, das ihr aktuell
   verwendet. Daraus wird die Feldstruktur — nicht aus meiner Vorstellung.
5. Pflegt Northline das Brand Brain allein, oder sollen Kunden perspektivisch Zugriff
   bekommen? (beeinflusst das Rechtemodell)

### Bevor M3 (AI) startet
6. Freigabe, Kundendaten an einen LLM-Anbieter zu senden — inklusive der Frage, ob eure
   AVVs das abdecken (F5).
7. Existierende API-Zugänge / bevorzugter Anbieter, monatliches AI-Budget.
8. Euer Meta-Ads-Playbook, Creative-Strategie-Dokument, Tracking- und Reporting-Standards
   — in welcher Form auch immer sie existieren. Das ist der Startinhalt der Knowledge Base
   und der wichtigste Qualitätsfaktor für alle AI-Ausgaben.
9. 2–3 Beispiele für Strategien und Creatives, die ihr für **gut** haltet, und 1–2, die
   ihr für **schlecht** haltet. Das ist die Messlatte für die Prompts.

### Bevor M6 (Import) startet
10. 2–3 echte CSV-Exporte aus dem Meta Ads Manager (anonymisiert): Spaltenauswahl,
    Sprache, Zeitraum-Granularität.
11. Wie erfasst ihr heute Bookings, Kunden und Umsatz? (Kalender, Kasse, CRM,
    Tabelle, Zuruf?)
12. Definition von Lead / Booking / Kunde pro Kunde (fehlende Anforderung A3).
13. Währung, netto oder brutto, Reporting-Zeitzone.

### Bevor M9 (Meta API) startet
14. Meta Business Manager: Habt ihr Partner-Zugriff auf die Kunden-Werbekonten?
15. Existiert eine Meta-App? Status `ads_read`? App Review durch? System-User-Token?
16. Wer ist bei euch Meta-Business-Admin?

---

## Teil 3 — Entscheidungen, die ich selbst treffe (zur Information)

Diese dokumentiere ich, frage aber nicht nach — Widerspruch jederzeit willkommen:

| Thema | Entscheidung |
| --- | --- |
| ORM | Prisma |
| Datenzugriff aus der UI | Server Actions + RSC, kein tRPC |
| Charts | Recharts über shadcn/ui |
| Mandantentrennung | Repository-Guard + denormalisierte `client_id` + Leak-Tests (RLS später) |
| Abgeleitete KPIs | werden berechnet, nie gespeichert |
| Knowledge-Retrieval | Postgres-Volltextsuche statt Vektordatenbank |
| Hintergrundjobs | keine Queue im MVP |
| AI-Architektur | fünf Funktionen, kein Agent-Framework |
| Rollen | `ADMIN` und `MEMBER` |
| Tests | Vitest + Playwright, Schwerpunkt Isolation, KPI, Import, AI-Validierung |
| Geldbeträge | `Decimal`, nie `Float` |
| Dark Mode | enthalten (`next-themes`) |

---

## Nächster Schritt

Beantworte **E1–E5** (und idealerweise Punkt 3 aus Teil 2). Sobald du **START MVP**
sagst, beginne ich mit M0 und liefere nach jedem Milestone die in
`04-implementierungsplan.md` beschriebene Zusammenfassung.
