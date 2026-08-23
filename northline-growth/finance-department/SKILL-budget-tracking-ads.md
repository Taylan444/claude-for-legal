---
name: budget-tracking-ads
description: "Verwalte Werbebudgets pro Client — Spend-Tracking, Budget-Alerts, Spend-to-CPA-Analyse, monatlicher Budget-Report."
metadata:
  version: 1.0.0
  product: Northline Growth
  department: Finance Department
---

# Budget-Tracking für Ad-Spend

Deine Aufgabe: **Tägliches und wöchentliches Tracking** von Werbebudgets — damit wir nicht über Budget gehen und ROI optimal bleibt.

**Warum?** Damit jeder Club sein Budget optimal nutzt und Northline nicht überrascht wird von unerwartetem Overspend.

---

## Ad-Spend-Budget pro Club-Typ

Typische monatliche Budgets (orientierend):

```
Golfclub (Premium):
€3,000–€5,000/Monat
- Awareness (30%): €900–€1,500 (neue Member locken)
- Conversion (50%): €1,500–€2,500 (Buchungen)
- Scaling (20%): €600–€1,000 (Retargeting, Lookalikes)

Tennisverein (Mittel):
€2,000–€3,500/Monat
- Awareness (30%): €600–€1,050
- Conversion (50%): €1,000–€1,750
- Scaling (20%): €400–€700

Segelclub (Nische):
€1,500–€2,500/Monat
- Awareness (30%): €450–€750
- Conversion (50%): €750–€1,250
- Scaling (20%): €300–€500

Fahrschule (Regional):
€2,500–€4,000/Monat
- Awareness (30%): €750–€1,200
- Conversion (50%): €1,250–€2,000
- Scaling (20%): €500–€800

Tipp: Start immer mit 70% Conversion, 30% Awareness. 
Nach 2 Wochen: Scaling hinzufügen wenn CPA gut läuft.
```

---

## Tägliches Spend-Tracking (10 Min / Tag)

### Schritt 1: Meta Ads Manager Checken

```
Wo: facebook.com/ads/manager

Checklist:
☐ Campaign "Active" Status (nicht "Paused")?
☐ Daily Spend heute (vs. budgetierter Daily Amount)?
☐ Lifetime Budget verbraucht (% of total)?
☐ CPA für Campaign (ist zu hoch?)?
☐ ROAS für Campaign (unter 2:1?)?
```

### Schritt 2: Spend-Vergleich (Aktuell vs. Budget)

```
Template (Google Sheets):

| Date | Club | Budget | Spent YTD | % Used | Daily Avg | Days Left | Projected | Alert? |
|------|------|--------|-----------|--------|-----------|-----------|-----------|--------|
| 23.8 | Golf | €3,000 | €1,950    | 65%    | €150      | 8         | €2,150    | 🟢 OK  |
| 23.8 | Tenn | €2,500 | €1,800    | 72%    | €135      | 8         | €2,880    | 🟡 80% |
| 23.8 | Segel| €1,500 | €400      | 27%    | €30       | 8         | €640      | 🟢 OK  |

Formel für "Projected":
= (YTD Spent) + (Daily Avg × Days Left)

Alert wenn Projected > Budget:
→ Email Ads-Manager oder reduziere Spend
```

### Schritt 3: Problem-Alerts

```
🔴 CRITICAL ALERTS (Sofort handeln):
- Spend heute > Daily Budget × 1.5 (über 150%)
- ROAS < 1:1 (Verlust statt Gewinn)
- CPA > 2× Ziel-CPA (was kostet ein Lead?)
- Campaign ist "Learning Limited" (nicht genug Daten)

🟡 WARNING ALERTS (Heute prüfen):
- Projected > Budget (80%+)
- ROAS 1-2:1 (okay, aber nicht toll)
- CPA 1-2× Ziel-CPA (grenzwertig)
- Conversion Rate < 2% (keine Conversions)

🟢 HEALTHY (weitermachen):
- Projected ≤ 100% Budget
- ROAS > 2:1
- CPA ≤ Ziel-CPA
- Conversion Rate > 3%
```

---

## Wöchentliches Spend-Report (30 Min / Woche)

Erstelle einen **Wochenreport** für den Client (freitags oder montags).

### Report-Template

```markdown
# Ad-Spend Report [Club Name] — Woche vom [Datum]

## Zusammenfassung
- **Budget diese Woche:** €[Wochenbudget]
- **Tatsächlicher Spend:** €[Spend]
- **Verbrauchter Anteil:** [%]
- **Status:** 🟢 On Track / 🟡 Over / 🔴 Critical

## Breakdown nach Campaign
| Campaign | Spend | Leads | CPA | ROAS | Status |
|----------|-------|-------|-----|------|--------|
| Awareness | €[X] | [Y] | €[Z] | [A]:1 | 🟢 |
| Conversion | €[X] | [Y] | €[Z] | [A]:1 | 🟢 |
| Retargeting | €[X] | [Y] | €[Z] | [A]:1 | 🟢 |

## Metriken
- **Durchschnittlicher CPA:** €[X] (Ziel: €[Y])
- **Durchschnittlicher ROAS:** [A]:1 (Ziel: 2:1+)
- **Conversion Rate:** [X]% (Ziel: >3%)
- **Lead Quality:** [High/Medium/Low]

## Optimierungen diese Woche
- ✅ [Was wurde optimiert?]
- ✅ [Was wurde optimiert?]
- ⏳ [Was wird nächste Woche optimiert?]

## Prognose nächste Woche
- Geplantes Budget: €[X]
- Erwartete Leads: [Y]
- Erwarteter ROAS: [Z]:1

Fragen? Antwort: [Name und Kontakt]
```

---

## Monats-Budget-Report (1 Std. / Monat)

Erstelle einen **ausführlichen Monatsbericht** zum Monatswechsel.

### Report-Struktur

```markdown
# Monats-Budget-Report [Club Name] — [Monat] 2026

## Zusammenfassung
- **Monatliches Budget:** €[X]
- **Tatsächlicher Spend:** €[X]
- **Über/Unter Budget:** €[±X] ([±X]%)
- **Zielwert erreicht:** [Ja/Nein]

## Campaign-Breakdown
| Campaign | Budget | Spent | % | Leads | Avg CPA | ROAS | Notes |
|----------|--------|-------|---|-------|---------|------|-------|
| Awareness | €900 | €850 | 94% | 180 | €4.72 | 1.8:1 | 🟢 GUT |
| Conversion | €1,500 | €1,550 | 103% | 45 | €34.44 | 2.1:1 | 🟡 Over |
| Scaling | €600 | €480 | 80% | 15 | €32 | 1.5:1 | 🟡 Low-ROI |

## Kosten-Analyse
- **Total Lead Cost:** €34 (Durchschnitt über alle Campaigns)
- **Target Lead Cost:** €[X] (aus Guarantee festgelegt)
- **Überschuss/Defizit:** [€X] ([Bemerkung])

## Guarantee-Status
- **Zielwert:** [X Lead dieser Monat]
- **Tatsächlich:** [Y Lead]
- **Status:** ✅ Erreicht / ⚠️ Risk / ❌ Verfehlt
- **Refund-Risiko:** €[X] (wenn verfehlt)

## Optimierungen implementiert
- [Was wurde gemacht?]
- [Was funktionierte?]
- [Was nicht?]

## Prognose für nächsten Monat
- **Budget:** €[X]
- **Erwartete Leads:** [Y]
- **Zielwert Status:** 🟢 On Track / 🟡 Risk / 🔴 Critical

## Nächste Schritte
- [ ] [Aktion 1]
- [ ] [Aktion 2]
- [ ] [Aktion 3]
```

---

## Budget-Alerts & Kill-Rules

### Alert 1: Über 80% des Budgets verbraucht (Mitte Monat)

```
Aktion:
☐ Email an Ads-Manager + Client
☐ Schnelle Daily Spend reduzieren (z.B. €150 → €100/Tag)
☐ Oder: Approved für zusätzliches Budget?
☐ Campaign-Performance-Review (ROAS geprüft?)

Nachricht an Ads-Manager:
"[Club] hat 80% des Budgets verbraucht, nur [X] Tage mehr.
Aktueller CPA: €[X], ROAS [Y]:1.
Sollen wir Spend reduzieren oder Budget erhöhen?"
```

### Alert 2: ROAS unter 1:1 (Verlust)

```
Wenn: Lead-Wert < Werbe-Kosten

Aktion SOFORT:
☐ Campaign pausieren (nicht stoppen, pausieren)
☐ Ads prüfen (Hook, Copy, Video?)
☐ Audience prüfen (falsche Leute?)
☐ Landing Page prüfen (schlechte Conversion?)
☐ Neuen Creative testen (andere Video?)

Nicht: Einfach mehr Budget geben (das macht es schlechter)
```

### Alert 3: CPA über Zielwert hinaus

```
Wenn: Actual CPA > Target CPA × 1.3 (30% über)

Beispiel:
- Target CPA: €50
- Actual CPA: €75 (+50%)

Aktion:
☐ Campaign-Performance-Review (welche Metrics sind down?)
☐ Audience verfeinern (zu groß? zu alt?)
☐ Creative-Test (neue Video? neuer Text?)
☐ Budget auf andere Campaign verschieben (Awareness statt Conversion?)
☐ Oder: Kill die Campaign und restarten

Regel: Kill nach 2 Wochen wenn CPA nicht besser wird
```

---

## Budget-Optimierung (Best Practices)

```
Woche 1 (Testing Phase):
- Campaign läuft mit 50% Budget
- Audience ist breit (64+ Jahre, interessiert an Sport)
- Creative ist Baseline (generisches Video)
- Ziel: Lernphase (Facebook hat genug Data)

Woche 2–3 (Optimization Phase):
- Budget erhöht auf 80% (wenn ROAS > 2:1)
- Audience verfeinert (45–65 Jahre, CEO/Unternehmer)
- Creative-Test: 3–5 Varianten
- Kill: Schlechteste Creative

Woche 4+ (Scaling Phase):
- 100% Budget bei gutem ROAS (> 2:1)
- Audience ist eng definiert
- Creative sind Best-Performer
- CPA stabil, Lead-Qualität hoch

Regel für Budgetallocation:
- ROAS > 3:1 → 50% Budget erhöhen (hot performer)
- ROAS 1.5–2.5:1 → 10% Budget erhöhen
- ROAS 1–1.5:1 → halt bei Budgetplan
- ROAS < 1:1 → Kill Campaign
```

---

## Häufige Fehler

| Fehler | Folge | Fix |
|--------|-------|-----|
| Budget zu niedrig (€500/Monat) | Zu wenig Leads, kann Guarantee nicht erreichen | Min. €1,500/Monat (für 15–20 Leads) |
| Spend wird nicht tracked | Overspend, Überraschungen am Monatende | Daily Check ins Spreadsheet |
| Alte Creatives weiter finanzieren | Verschleudertes Budget auf schlechte Ads | Weekly Creative-Performance Review |
| Kein Projected-Budget (Planung) | Zu spät erkennt man Overspend | Immer "Projected" kalkulieren (YTD + Daily Avg) |
| Budget zu schnell verbraucht (erste Woche) | Kein Budget mehr für Rest des Monats | Daily Spend ≤ Budget / Days |
| Keine Alerts eingestellt | Client überrascht von hohem Spend | Alerts at 80%, 100%, over-budget |

---

## Checkliste (für das Budget-Tracking)

```
Täglich (10 Min):
☐ Meta Ads Manager checken (Spend vs. Budget)
☐ ROAS checken (< 1:1 = problem!)
☐ Projected Budget berechnen
☐ Alerts triggern (if needed)

Wöchentlich (30 Min):
☐ Client-Report schreiben + senden
☐ Campaign-Performance überprüfen
☐ Creative-Performance analysieren
☐ Audience-Größe checken (zu small = Learning Limited)

Monatlich (1 Std):
☐ Monatsbericht schreiben
☐ Guarantee-Status überprüfen
☐ Optimierungen dokumentieren
☐ Nächste Monat Budgetplan bestätigen
```

---

## Google Sheets Template (Copy-Paste)

```
Spreadsheet-Name: [Club Name] — Ad Budget Tracking 2026

Sheet 1: "Monthly Budget"
Columns:
- Month
- Total Budget
- Awareness Budget
- Conversion Budget
- Scaling Budget
- YTD Spent
- % Used
- Projected Total
- Alert Status

Sheet 2: "Weekly Spend"
Columns:
- Date
- Campaign
- Daily Spend
- Cumulative Spend
- CPA
- ROAS
- Status (🟢/🟡/🔴)

Sheet 3: "Performance Tracking"
Columns:
- Campaign
- Leads
- Cost per Lead
- ROAS
- Conversion Rate
- Creative
- Notes

Formula Beispiel:
=Projected = (YTD Spent) + (AVERAGE(Last 7 Days) × (Days Left in Month))
```

---

*Zuletzt aktualisiert: 23. August 2026*
*Verfasser: Northline Growth — Finance Department*
