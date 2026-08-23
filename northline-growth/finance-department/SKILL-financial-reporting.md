---
name: financial-reporting
description: "Erstelle monatliche/quarterly Finanzberichte für Partner und interne Nutzung — Gewinn-Verlust, Ausgaben, Client-Performance, Garantie-Messung, KPIs."
metadata:
  version: 1.0.0
  product: Northline Growth
  department: Finance Department
---

# Finanzreporting für Northline Growth

Deine Aufgabe: **Erstelle monatliche und quarterly Berichte** für Partner, Taylan und interne Nutzung — damit jeder weiß, wie es um Northline steht.

**Warum?** Damit Partner sehen, ob das Business läuft, wo Probleme sind, welche Clients profitabel sind.

---

## Monatlicher Financial Report (1–2 Std)

### Report-Struktur

```markdown
# NORTHLINE GROWTH — Monatlicher Financial Report
## [Monat] 2026 (z.B. August 2026)

---

## EXECUTIVE SUMMARY (1 Seite — für schnelle Übersicht)

### Kennzahlen auf einen Blick:
| Metrik | Wert | Status |
|--------|------|--------|
| **Monatliche Einnahmen** | €[X] | 🟢/🟡/🔴 |
| **Monatliche Ausgaben** | €[X] | 🟢/🟡/🔴 |
| **Nettogewinn** | €[X] | 🟢/🟡/🔴 |
| **Gewinn-Marge** | [X]% | 🟢/🟡/🔴 |
| **Clients aktiv** | [X] | 🟢 |
| **Durchschnittlicher Deal-Wert** | €[X] | 🟢/🟡/🔴 |
| **Freelancer-Kosten** | €[X] | 🟢/🟡/🔴 |
| **Guarantee-Erfüllung** | [X]% | 🟢/🟡/🔴 |

### Quick-Trends:
- Vormonat Vergleich: [+€X] oder [-€X]
- YTD (Jahr bis jetzt): €[X]
- Prognose Rest des Jahres: €[X]

---

## 1. EINNAHMEN (A)

### Aktive Clients & Verträge:
| Client | Club-Typ | Monats-Preis | Status | Startdatum | Vertrag-Ende |
|--------|----------|--------------|--------|-----------|--------------|
| [Name 1] | Golf | €3,500 | ✅ Active | 1.5.26 | 31.12.27 |
| [Name 2] | Tennis | €2,500 | ✅ Active | 1.8.26 | 31.1.27 |
| [Name 3] | Segel | €2,000 | ✅ Active | 15.6.26 | 30.6.27 |
| [Name 4] | Fahrschule | €3,000 | ⏸️ Paused | 1.7.26 | auf Eis |

**TOTAL EINNAHMEN:** €[X]/Monat
**YTD Einnahmen:** €[X]

### Einnahmen-Trends:
- Neue Clients diesen Monat: [X]
- Gekündigte Clients: [X]
- Geplante neue Clients nächsten Monat: [X]

---

## 2. AUSGABEN (B)

### A. Freelancer-Kosten (Variable)
| Rolle | Kosten Aug | Kosten Juli | YTD |
|-------|-----------|-----------|-----|
| Video Producer | €500 | €500 | €3,500 |
| Ads Manager | €600 | €600 | €4,200 |
| Social Media | €500 | €500 | €3,500 |
| Designer | €300 | €400 | €2,100 |
| TOTAL Freelancer | €1,900 | €2,000 | €13,300 |

**Durchschnitt pro Freelancer:** €1,900 / 4 = €475
**% der Einnahmen:** €1,900 / €11,000 = 17% ✅ (unter 30%)

### B. Software-Tools (Fixkosten)
| Tool | Kosten | Kategorie | Notizen |
|------|--------|-----------|---------|
| Figma | €80 | Design | Shared Team |
| Adobe Premiere | €30 | Video | Jahresabo |
| Buffer/Later | €60 | Social | Content Calendar |
| Analytics Suite | €40 | Data | GA4 + Meta |
| Email Platform | €30 | Email | Brevo |
| Notion | €20 | Project Mgmt | Team Workspace |
| Slack | €0 | Communication | Free Plan |
| **TOTAL TOOLS** | **€260** | | **Monatlich** |

### C. Overhead (Northline-intern)
| Item | Kosten | Basis |
|------|--------|-------|
| Büro/Miete (anteilig) | €200 | €200 × 5 Clients |
| Server/Hosting | €50 | CloudFlare, Domain |
| Versicherung (anteilig) | €100 | Betriebshaftpflicht |
| Accountant/Steuern (anteilig) | €150 | 1 Std/Monat × 5 Clients |
| **TOTAL OVERHEAD** | **€500** | **Anteilig** |

### D. Direkte Ad-Spend (Pass-Through, zahlt Client!)
```
WICHTIG: Das zahlt der CLIENT, nicht Northline
Aber: Wir tracken und verwalten es

| Client | Ad-Spend | Northline-Anteil | Notizen |
|--------|----------|------------------|---------|
| Golfclub | €3,500 | €0 (zahlt Client) | – |
| Tennis | €2,200 | €0 (zahlt Client) | – |
| Segel | €1,500 | €0 (zahlt Client) | – |
| Fahrschule | €3,000 | €0 (zahlt Client) | – |
| TOTAL | €10,200 | €0 | Pass-Through |
```

### TOTAL AUSGABEN (A + B + C):
- Freelancer: €1,900
- Tools: €260
- Overhead: €500
- **TOTAL: €2,660/Monat**

---

## 3. GEWINN-VERLUST

```
Einnahmen:           €11,000 (3 aktive Clients × durchschnitt)
Ausgaben:             -€2,660
───────────────────────────
BRUTTO-GEWINN:        €8,340

Guarantee-Reservierung (Risiko):
- Clients mit Risiko: Golfclub (-€500 potenzial Refund)
- Reserve: -€500
───────────────────────────
NETTO-GEWINN:        €7,840

Gewinn-Marge:        71% (sehr stark! 🟢)
```

---

## 4. CLIENT-PROFITABILITÄT (Ranking)

| Rank | Client | Revenue | Costs | Profit | Margin | Lead-Status | Action |
|------|--------|---------|-------|--------|--------|-------------|--------|
| 1 | Fahrschule | €3,000 | €2,000 | €1,000 | 33% | ✅ OK | 🟢 Keep |
| 2 | Golfclub | €3,500 | €2,500 | €1,000 | 29% | ⚠️ Risk | 🟡 Monitor |
| 3 | Tennis | €2,500 | €1,800 | €700 | 28% | ✅ OK | 🟢 Keep |
| 4 | Segel | €2,000 | €1,500 | €500 | 25% | ✅ OK | 🟡 Minimal |

---

## 5. GUARANTEE-STATUS

| Client | Ziel (Leads) | Erreicht | Status | Refund-Risiko | Notizen |
|--------|----------|----------|--------|---------------|---------|
| Golfclub | 50 | 45 | ⚠️ -10% | -€1,750 | Neue Creatives nächste Woche |
| Tennis | 35 | 38 | ✅ +9% | €0 | On track, weiter so |
| Segel | 25 | 22 | ⚠️ -12% | -€1,000 | Audience anpassen |
| Fahrschule | 40 | 42 | ✅ +5% | €0 | Top performer |

**GESAMT GUARANTEE-ERFÜLLUNG: 75% ⚠️**
- 2/4 Clients erreichen Ziel
- Durchschnittliches Refund-Risiko: €2,750 (falls verfehlt)

---

## 6. AUSGABEN-BREAKDOWN (Tortendiagramm)

```
Freelancer-Kosten: €1,900 (71%)
├─ Video: €500
├─ Ads: €600
├─ Social: €500
└─ Design: €300

Tools: €260 (10%)
Overhead: €500 (19%)

TOTAL: €2,660
```

---

## 7. CASH-FLOW-PROGNOSE (3 Monate)

```
| Monat | Einnahmen | Ausgaben | Gewinn | Kumulativ |
|-------|-----------|----------|--------|-----------|
| Aug 2026 | €11,000 | €2,660 | €8,340 | €8,340 |
| Sept 2026 | €11,500 | €2,700 | €8,800 | €17,140 |
| Okt 2026 | €12,500 | €2,800 | €9,700 | €26,840 |

Annahmen:
- 1 neuer Client (Tennisverein) im September (+€2,500)
- Fahrschule Pause endet (September), wieder aktiv
- Kosten steigen um €100/Monat (zusätzliche Video)
```

---

## 8. KPIs (Kennzahlen für Partner)

```
WACHSTUMS-KPIs:
- Clients am Monatsbeginn: 4
- Clients am Monatsende: 3 (1 Pause)
- Kundenzahl-Trend: -25% (⚠️ Problem!)
- Neue Clients: 0 (besser sollten 1-2 sein)

PROFIT-KPIs:
- Durchschnittlicher Gewinn pro Client: €800/Monat
- Gewinn-Marge: 71% (🟢 sehr hoch!)
- Break-Even: 2.3 Monate (🟢 okay)

OPERATIONAL KPIs:
- Freelancer-Auslastung: 4.75h/Woche durchschnitt (75% genutzt)
- Tool-Kosten pro Client: €65
- Overhead pro Client: €125

CUSTOMER KPIs:
- Guarantee-Erfüllung: 75% (⚠️ sollte >85% sein)
- Average Contract-Dauer: 7 Monate
- Churn-Rate: 25% (1 Kündigung je 4 Clients, zu hoch)
```

---

## 9. ALERTS & HANDLUNGSANFORDERUNGEN

### 🔴 CRITICAL (Sofort Handeln)
- Golfclub verfehlt Guarantee → Refund €1,750 nächsten Monat
- Fahrschule ist in Pause → Plant Kündigung?
- Kundenzahl sank (4→3) → Churn zu hoch

### 🟡 WARNING (Diese Woche)
- Segel-Client unter 25% Marge → nicht profitabel genug
- Freelancer-Kosten steigen → sollten reduzieren oder Preis erhöhen
- Neue Client-Pipeline ist leer → brauchen 1-2 neue Clients bis Oktober

### 🟢 POSITIVE
- Gewinn-Marge (71%) ist sehr stark
- Tennis läuft hervorragend (+9% über Ziel)
- Fahrschule ist Top-Performer (€1,000 Gewinn)

---

## 10. EMPFEHLUNGEN FÜR NÄCHSTEN MONAT

```
1. PRIORITÄT: Neue Clients akquirieren
   → Ziel: 2 neue Clients bis Ende September
   → Taylan: Cold-Email-Outreach verstärken
   → Sonst: 3 Clients zu wenig für Profitabilität

2. PRIORITÄT: Golfclub & Segel retten
   → Neue Creatives testen (Video-Redesign)
   → Audience verfeinern (wer sind bessere Leads?)
   → Oder: Beide kündigen (unter Profitabilität)

3. Fahrschule-Pause beenden
   → Vereinbarung treffen: Wann wieder aktiv?
   → Sonst: Diese Einnahme verloren

4. Kosten-Kontrolle
   → Freelancer-Kosten sind hoch (€1,900)
   → Fragen: Video 2× pro Monat statt 3×?
   → Oder neue günstigere Video-Fachfrau?
```

---

## QUARTERLY REPORT (3 Monate: z.B. Q3)

### Format ähnlich, aber mit Jahresvergleich

```markdown
# NORTHLINE GROWTH — Q3 Report (Juli–September 2026)

| Metrik | Q3 | Q2 | Differenz |
|--------|-----|-----|-----------|
| Einnahmen | €32,500 | €22,000 | +€10,500 (+48%) |
| Ausgaben | €8,100 | €6,500 | +€1,600 (+25%) |
| Nettogewinn | €24,400 | €15,500 | +€8,900 (+57%) |
| Clients | 4 | 3 | +1 |
| Durchschn. Margin | 75% | 70% | +5% |

### Jahres-Prognose (bei aktuellem Tempo):
- Einnahmen YTD: €32,500 × 4 = €130,000
- Ausgaben YTD: €8,100 × 4 = €32,400
- **Prognose Jahresgewinn: €97,600** 🟢

### Ziele 2026:
- 6 Clients bis Jahresende (aktuell: 4)
- €150,000 Jahreseinnahmen (aktuell: €32,500 YTD)
- 30% Gewinn-Marge (aktuell: 75% ✅)
```

---

## Checkliste (Monatlich)

```
Bis 5. des Monats:
☐ Alle Einnahmen collected
☐ Alle Ausgaben (Freelancer, Tools, Overhead) dokumentiert
☐ Client-Profitabilität berechnet
☐ Guarantee-Status überprüft

Bis 15. des Monats:
☐ Report geschrieben
☐ KPIs kalkuliert
☐ Alerts/Empfehlungen dokumentiert
☐ Report gemailt an Partner + Taylan

Monatlich:
☐ Cash-Flow-Prognose updated
☐ Archivierung: Report als PDF speichern
☐ Trends analysieren (wächst Northline?)
```

---

*Zuletzt aktualisiert: 23. August 2026*
*Verfasser: Northline Growth — Finance Department*
