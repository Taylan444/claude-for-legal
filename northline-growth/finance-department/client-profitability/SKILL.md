---
name: client-profitability
description: "Berechne Gewinn pro Client nach allen Kosten — Einnahmen, Ausgaben, Break-Even, Guarantee-Impact, Client-Ranking."
metadata:
  version: 1.0.0
  product: Northline Growth
  department: Finance Department
---

# Client-Profitabilität-Analyse

Deine Aufgabe: **Berechne den Netto-Gewinn für jeden Client** — damit wir wissen, welche Clients wirklich profitabel sind und welche Geld kosten.

**Warum?** Damit Northline nicht 100 Leads generiert, aber Geld verliert. Und damit Partner wissen, ob ein Deal gut ist.

---

## Profitabilität-Formel (Basis)

```
EINNAHMEN:
= Monatlicher Contract-Preis (von Client)

AUSGABEN:
= Ad-Spend (Client zahlt separat, aber wir verwalten)
+ Freelancer (Video, Social, Ads-Manager, Designer)
+ Tools (Analytics, Figma, Adobe, etc.)
+ Overhead (Taylan Zeit, Server, Versicherung)

GEWINN BRUTTO:
= Einnahmen - Ausgaben

GEWINN NETTO (nach Guarantee-Risiko):
= Gewinn Brutto - (Guarantee-Refund bei Zielverfehlung)

GEWINN-MARGE %:
= (Gewinn / Einnahmen) × 100

Beispiel:
- Einnahmen: €2,500/Monat
- Ausgaben: €1,000/Monat
- Brutto-Gewinn: €1,500 (60% Marge) ✅
- Guarantee-Risiko: -€1,250 (falls verfehlt)
- Netto-Gewinn: €250 (10% Marge) ⚠️
```

---

## Detaillierte Kostenaufschlüsselung

### Ausgaben Breakdown (pro Client/Monat)

```
1. AD-SPEND (Pass-Through — Client zahlt!)
   ├─ Meta Ads Budget: €2,000–€4,000
   ├─ Google Ads: €0–€500 (optional)
   ├─ LinkedIn Ads: €0–€300 (optional)
   └─ Sonstiges (Pinterest, TikTok): €0–€200
   
   → WICHTIG: Das zahlt der CLIENT, nicht Northline!
   → Aber: Wir verwalten es, daher ist Kosten-Tracking wichtig

2. FREELANCER-KOSTEN (Northline zahlt!)
   ├─ Video Producer/Schnitt: €400–€600/Monat (1× Drehtag)
   ├─ Ads Manager: €600–€800/Monat (Meta-Management)
   ├─ Social Media Manager: €400–€600/Monat (4–5 Posts/Woche)
   ├─ Designer: €300–€500/Monat (Grafiken + Brand)
   └─ TOTAL: €1,700–€2,500/Monat
   
   → Je nach Club-Größe & Anforderungen

3. SOFTWARE-TOOLS (Monatlich)
   ├─ Google Analytics 4: €0 (kostenlos)
   ├─ Meta Business Suite: €0 (kostenlos)
   ├─ Figma/Adobe: €50–€150
   ├─ Video-Editing (Adobe Premiere): €20–€50
   ├─ Content Calendar (Buffer, Later): €30–€100
   ├─ Email Platform (Brevo, ConvertKit): €20–€50
   ├─ Project Management (Notion, Asana): €10–€50
   └─ TOTAL: €100–€300/Monat

4. OVERHEAD (Northline-intern, anteilig)
   ├─ Taylan Zeit (Sales, Kundenbetreuung): €200–€400/Client
   ├─ Partner Zeit (Strategy, Reporting): €100–€200/Client
   ├─ Büro/Server/Versicherung: €50–€150/Client
   └─ TOTAL: €350–€750/Monat (je nach Client-Mix)

GESAMT AUSGABEN PRO CLIENT:
€1,700–€2,500 (Freelancer + Tools + Overhead)
+ €0 (Ad-Spend, zahlt Client)
= €1,700–€2,500/Monat typisch
```

---

## Profitabilität-Rechner (Template)

### "Client Profitability Analysis" Sheet

```
| Metrik | Golfclub | Tennis | Segel | Fahrschule |
|--------|----------|--------|-------|-----------|
| **EINNAHMEN** | | | | |
| Monatl. Vertrag | €3,500 | €2,500 | €2,000 | €3,000 |
| | | | | |
| **AUSGABEN** | | | | |
| Freelancer (durchschn) | €2,000 | €1,500 | €1,300 | €1,800 |
| Tools | €150 | €150 | €100 | €150 |
| Overhead (Taylan/Partner) | €400 | €300 | €250 | €350 |
| **TOTAL AUSGABEN** | €2,550 | €1,950 | €1,650 | €2,300 |
| | | | | |
| **GEWINN BRUTTO** | €950 | €550 | €350 | €700 |
| **GEWINN-MARGE %** | 27% | 22% | 18% | 23% |
| | | | | |
| **GUARANTEE-RISIKO** | | | | |
| Zusichertes Ziel | 50 Leads | 35 Leads | 25 Leads | 40 Leads |
| Erreichte Leads | 45 | 38 | 22 | 42 |
| Status | ⚠️ Risk | ✅ OK | ❌ FAIL | ✅ OK |
| Refund-Betrag | -€500 | €0 | -€1,000 | €0 |
| | | | | |
| **GEWINN NETTO** | €450 | €550 | -€650 | €700 |
| **NETTO-MARGE %** | 13% | 22% | -33% | 23% |
| | | | | |
| **STATUS** | 🟢 OK | 🟢 GUT | 🔴 LOSS | 🟢 GUT |
```

---

## Profitabilität nach 3 Monaten

Nach 3 Monaten sollte jeder Client **mindestens 15% Netto-Marge** haben.

```
MONAT 1 (Startup-Phase):
- Marge oft nur 5–10% (Onboarding, Bilder machen, Setup)
- Normale Verluste

MONAT 2–3 (Optimization-Phase):
- Marge sollte 15–20% sein (Videos funktionieren, Processes optimiert)
- Wenn nicht: Client wird sauschwach, neu evaluieren

MONAT 4+ (Steady-State):
- Marge sollte 25–30% sein (optimal läuft, Kosten gleich)
- Wenn nicht: Entweder Preis erhöhen oder Kosten senken
```

---

## Break-Even-Analyse (Wann profitable?)

```
Break-Even = Punkt, ab dem Client KEIN Geld mehr kostet

Formel:
Break-Even Monat = TOTAL Startup-Kosten / Monatlicher Gewinn

Beispiel:
- Startup-Kosten (Onboarding, Brand-Kit, Website): €3,000
- Monatlicher Gewinn (nach Monat 1): €300
- Break-Even: 3,000 / 300 = 10 Monate

→ Dieser Golfclub wird erst nach 10 Monaten wirklich profitabel
→ Falls Guarantee verfehlt: könnte 15+ Monate brauchen
```

---

## Client-Ranking (Best to Worst)

Erstelle monatlich ein Ranking, um zu sehen:
- Welche Clients bringen Gewinn?
- Welche kosten Geld?
- Welche sollten wir kündigen?

### Ranking Template

```
| Rank | Client | Monthly Revenue | Total Costs | Profit | Margin % | Lead-Status | Action |
|------|--------|-----------------|-------------|--------|----------|-------------|--------|
| 1 | Fahrschule | €3,000 | €2,100 | €900 | 30% | ✅ OK | 🟢 Keep |
| 2 | Golfclub | €3,500 | €2,550 | €950 | 27% | ⚠️ Risk | 🟡 Monitor |
| 3 | Tennis | €2,500 | €1,950 | €550 | 22% | ✅ OK | 🟢 Keep |
| 4 | Segel | €2,000 | €1,650 | €350 | 18% | ✅ OK | 🟡 Gering-Margin |
| 5 | Flugschule | €1,500 | €2,000 | -€500 | -33% | ❌ FAIL | 🔴 KÜNDIGEN |

Interpretation:
🟢 GREEN (>25% Margin): Halte diesen Client, optimiere nicht mehr
🟡 YELLOW (15-25%): Überwachen, aber profitable genug
🔴 RED (<15% oder Negative): Entweder Preis erhöhen oder kündigen
```

---

## Szenario: Guarantee Verfehlt

Wenn Ziel nicht erreicht, zahle Northline 50% Refund.

```
SZENARIO 1: Golfclub, Ziel 50 Leads, erreicht 45 Leads
- Verfehlung: 5 Leads (-10%)
- Refund: 50% × Monatlicher Preis = 50% × €3,500 = €1,750
- Monatlicher Gewinn nach Refund: €950 - €1,750 = -€800 (VERLUST!)
- Aktion: Nächster Monat muss SEHR GUT laufen (über-liefern)

SZENARIO 2: Tennis, Ziel 35 Leads, erreicht 20 Leads
- Verfehlung: 15 Leads (-43%)
- Refund: 50% × €2,500 = €1,250
- Monatlicher Gewinn nach Refund: €550 - €1,250 = -€700 (VERLUST!)
- Aktion: Kampagne KOMPLETT überarbeiten (oder kündigen)

→ WICHTIG: Guarantee-Risiko immer in Profitabilität-Rechnung einberechnen!
```

---

## Best Practices

```
1. GARANTIE-FOKUS
   → Immer: Welcher Client hat Guarantee-Risiko?
   → 80% der Clients sollten Ziel erreichen
   → Wenn nur 50% Ziel erreichen: Pricing/Prognose war falsch

2. PREIS-ERHÖHUNG
   → Nach 6 Monaten erfolgreicher Arbeit: +10-20% Preis
   → Nach Guarantee-Verfehlung: -20-30% Preis (Rabatt bis nächster Monat okay)

3. KOSTEN-REDUKTION
   → Wenn Freelancer-Kosten zu hoch: andere Freelancer testen
   → Wenn Video 3× monatlich: Auf 2× reduzieren
   → Tools-Audit: Welche brauchst wir wirklich?

4. KÜNDIGEN KÖNNEN
   → Wenn 3 Monate in Folge Guarantee verfehlt: Kündigung besprechen
   → Wenn Netto-Margin unter 10%: Unrentabel, kündigen
   → Wenn Client "zu viel Zeit kostet" (Sales, Support): Nicht worth it

5. UPSELL
   → "Golfclub macht €900 Gewinn/Monat" → Upsell Video-Ads
   → Upsell 20% mehr Budget, mehr Gewinn für Northline
```

---

## Häufige Fehler

| Fehler | Folge | Fix |
|--------|-------|-----|
| Overhead nicht einrechnen | Gewinn sieht besser aus, aber ist falsch | Immer Taylan + Partner-Zeit hinzufügen |
| Guarantee-Risiko vergessen | Überraschung am Monatende, wenn verfehlt | Immer Refund-Betrag kalkulieren |
| Ad-Spend als Northline-Kosten | Denken wir zahlen das, aber zahlt Client | Klar trennen: Pass-Through vs. echt Northline-Kosten |
| Startup-Kosten vergessen | Monat 1 sieht profitabel aus, ist es nicht | Brand-Kit, Bilder, Website-Setup hinzufügen |
| Keine Kündigung unprofitabler Clients | Geld wird immer weniger | Nach 3 Monaten: Profitabilität prüfen, kündigen wenn nötig |
| Falscher Preis von Anfang an | Client zu billig, kann 50% Gewinn nicht verdienen | Cost Calculator vor Vertrag nutzen |

---

## Checkliste (monatlich)

```
Bis 5. des Monats:
☐ Alle Ausgaben für Vormonat tracken
☐ Ad-Spend von Client vs. Budget checken
☐ Freelancer-Kosten sammeln
☐ Tools-Kosten aufsummieren
☐ Overhead kalkulieren

Bis 15. des Monats:
☐ Profitabilität pro Client berechnen
☐ Guarantee-Status prüfen (Leads erreicht?)
☐ Refund-Rücktrag buchen (falls verfehlt)
☐ Client-Ranking erstellen

Monatlich:
☐ Report für Partner: "Client X profitabel, Client Y problematisch"
☐ Strategische Fragen: Kündigen? Preis erhöhen? Kosten senken?
```

---

*Zuletzt aktualisiert: 23. August 2026*
*Verfasser: Northline Growth — Finance Department*
