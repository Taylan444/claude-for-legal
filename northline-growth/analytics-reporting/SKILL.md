---
name: analytics-reporting
description: "Tracking-Setup, Messung von Ads + Website + Conversions. Wöchentliche und Quartals-Reports für Garantie-Messung."
metadata:
  version: 1.0.0
  product: Northline Growth
  department: Analytics & Performance
---

# Analytics & Reporting (Tracking + Guarantie-Nachweis)

Deine Aufgabe: **Conversion-Tracking** aufbauen, **wöchentliche Reports** schreiben und **Quartals-Ende Garantiewerte** messen — alles mit voller Dokumentation für rechtliche Sicherheit.

---

## Das Northline-Messsystem (3 Quellen)

### 1. Meta Werbeanzeigenmanager (PRIMÄR)
**Wichtigkeit:** ⭐⭐⭐⭐⭐ (hier messen wir die Garantie)

**Was messen wir:**
- Impressionen
- Clicks
- Conversions (Lead-Form Submissions oder Pixel-Events)
- CPA = Budget / Conversions
- Reach + Frequency

**Einrichtung:**
- Conversion Pixel auf Website installiert
- Lead-Form in Meta oder auf Website konfiguriert
- Events trackbar gemacht (Lead-Submission, Phone-Click, Booking)

### 2. GA4 (Google Analytics) (SEKUNDÄR)
**Wichtigkeit:** ⭐⭐⭐ (Cross-Check, Validierung)

**Was messen wir:**
- UTM-Parameter-Daten (utm_source=meta, utm_campaign=[club])
- Page-Conversion-Events (booking_completed, phone_click)
- User-Journeys (Ads → Website → Conversion)

**Einrichtung:**
- GA4-Property erstellt (nicht Universal Analytics)
- UTM-Parameter auf allen externen Links (Meta-Ads → Website)
- Events konfiguriert (lead_form_submit, phone_call, booking)

### 3. CRM / Kundentelefon (TERTIÄR — Qualitäts-Check)
**Wichtigkeit:** ⭐⭐ (qualitatives Feedback, nicht für offizielle Messung)

**Was messen wir:**
- Anrufe von Probemitgliedschaften
- Lead-Qualität (Spam vs. echte Anfrage)
- Conversion-Rate Lead → Member

**Einrichtung:**
- Club notiert in Excel/Tabelle: Datum, Name, über welchen Channel
- Northline prüft regelmäßig gegen Meta-Zahlen

---

## Tracking-Setup Checkliste (vor Kampagnenstart)

### Meta Pixel Setup

```
☐ Meta Business Manager Account erstellt
☐ Werbekonto verbunden mit Zahlungsmittel
☐ Meta Pixel Code generiert
☐ Pixel auf Club-Website installiert (im <head> Tag)
☐ Test Event Code verwendet (Pixel testen)

☐ Conversion Events definiert:
   ☐ Lead Form Submission (Lead-Anfrage)
   ☐ Phone Call Click (Direkter Anruf)
   ☐ Booking Completed (Termin gebucht)
   ☐ Member Signup (Mitgliedschaft abgeschlossen) — optional

☐ Pixel verifiziert (Test mit „Test Event Code" durchgeführt)
```

### GA4 Setup

```
☐ GA4-Property in Google Analytics erstellt
☐ Tracking ID kopiert: G-[XXXXXXX]
☐ GA4-Tag im Website-Head installiert
☐ UTM-Parameter-Struktur definiert:
   utm_source=meta
   utm_medium=paid
   utm_campaign=[Clubname]_[Objective]

☐ Events erstellt:
   ☐ lead_form_submit (Parameter: source=meta)
   ☐ phone_call_click
   ☐ booking_completed

☐ Alle externen Links tragen UTM-Parameter:
   Beispiel: https://clubname.de/probemitgliedschaft?utm_source=meta&utm_medium=paid&utm_campaign=golfclub_leads_q4
```

### Website/Landing Page Setup

```
☐ Lead-Form oder Call-Button hat onclick-Event für GA4/Pixel
☐ „Thank You"-Seite nach Lead-Form-Submit existiert
   → URL: /thank-you-lead/ oder /confirmation/
   → Meta Pixel feuert Conversion-Event auf dieser Seite

☐ Phone-Call-Links haben Analytics-Event
   → HTML: <a href="tel:+495551234567" onclick="gtag('event', 'phone_call_click');">
   → Meta Pixel: Custom Event „phone_call_click"

☐ Booking-Link auf Website existiert (zu externer Buchungsseite oder internem System)
   → Redirect mit UTM-Parametern beibhalten
```

---

## Messung der Garantiewerte (Quartalsweise)

### Garantie-Messung: Die 4 Faktoren

**Alle 4 müssen erfüllt sein, sonst keine Erstattung:**

1. ✅ **Werbebudget durchgehend geschaltet** (600–1.200 €/Monat für 13 Wochen)
   - Check: Ausgabenbericht aus Meta (müssen täglich positive Spend zeigen)
   - Zielwert: Mindestens 600 €/Monat × 3 Monate = 1.800 € Gesamtbudget

2. ✅ **Reichweite-/Klick-Zielwert erreicht** (z.B. 50.000 Impressionen, 1.200 Clicks)
   - Check: Meta Werbeanzeigenmanager → Kampagnen-Übersicht
   - Diese Zahlen werden IM ERSTGESPRÄCH festgelegt (Club-spezifisch)

3. ✅ **Lead-Zielwert erreicht** (z.B. 60 Leads für Golfclub)
   - Check: Meta Conversion Events (Lead-Form Submissions)
   - Messfenster: 7-Tage-Fenster Meta (Standard)
   - Messdauer: 13 Wochen (Kampagnenstart bis Quartalende)

4. ✅ **Mitwirkungspflicht-Erfüllung durch Kundenservice** (im Vertrag verankert)
   - Check: Lead-Bearbeitung innerhalb 24h dokumentiert
   - Check: Antwortzeiten von Kundenseite (E-Mail, Telefon)
   - Wenn Kunde nicht mitarbeitet → keine Erstattung (auch wenn Ads gut sind)

### Garantie-Messbericht (Quartalsende)

**Format: Offizieller Bericht (PDF) für Kundenakten + Rechtssicherheit**

```
————————————————————————————————————————————
NORTHLINE GROWTH — GARANTIE-MESSBERICHT Q4 2026
————————————————————————————————————————————

Kunde: Golfclub Hannover
Zeitraum: 1. Oktober — 31. Dezember 2026 (13 Wochen)
Kampagne: Golfclub_Awareness_Q4
Mesquelle: Meta Werbeanzeigenmanager

————————————————————————————————————————————
GARANTIEWERTE (Vereinbart im Vertrag v. 01.10.2026)
————————————————————————————————————————————

| Metrik | Zielwert | Erreicht | Status |
|--------|----------|----------|--------|
| Budget geschaltet | 1.800 € | 1.850 € | ✅ ERFÜLLT |
| Reichweite | 50.000 Impressionen | 52.340 | ✅ ERFÜLLT |
| Clicks | 1.200 | 1.340 | ✅ ERFÜLLT |
| Leads | 60 | 52 | ❌ NICHT ERFÜLLT |
| CPA | < 25 € | 35,60 € | ❌ NICHT ERFÜLLT |
| Kundenmitwirkung | 100% | 85% | ⚠️ TEILWEISE |

————————————————————————————————————————————
ERGEBNIS: ERSTATTUNG BERECHNET
————————————————————————————————————————————

Betreuungspauschale Q4: 1.800 € (600 €/Monat × 3 Monate)
Erstattungsquote: 50% (weil Ziele nicht erreicht)
Erstattungsbetrag: 900 €

Status: Erstattung überwiesen am [Datum]
Kontonummer: [IBAN]

————————————————————————————————————————————
ANALYSE & NÄCHSTE SCHRITTE
————————————————————————————————————————————

Warum nicht alles erreicht:
— Lead-Ziel -8 Leads (52 vs. 60): CPA zu hoch (35,60 € statt Ziel 25 €)
— Grund: Kundenmitarbeit war schwächer (Lead-Bearbeitung 85% vs. vertraglich 100%)
   → 15% der eingehenden Leads wurden nicht innerhalb 24h bearbeitet
   → Lead-Qualität vermutlich gelitten

Empfehlung für Q1 2027:
1. Lead-Bearbeitung-SLA verschärfen (24h → 8h)
2. Creative refreshen (CPA ist zu hoch, neue Videos/Reels nötig)
3. Targeting testen (neue Audiences, verschiedene Geoips)

Nächster Termin: [Datum] um Strategie zu besprechen

————————————————————————————————————————————
Unterschrift Northline Growth: ________________
Unterschrift Kunde: ___________
Datum: 15. Januar 2027
```

---

## Wöchentliches Reporting (an Kunden + intern)

### Format: Kurz-Bericht (E-Mail oder Dashboard)

```
=== Wochenreport Golfclub Hannover ===
Woche vom 4.–10. Oktober 2026

📊 KPI diese Woche:
– Impressionen: 3.240 (durchschnittlich +500/Tag)
– Clicks: 95 (CTR 2,9%)
– Leads: 4 (CPA diese Woche: 37,50 €)
– Reach: 2.340 unique Menschen

🎯 Kumulative Zahlen (seit Kampagnenstart):
– Gesamtbudget: 420 € von 1.800 € (23% verbraucht)
– Gesamtleads: 12 von 60 Ziel (20% Weg)
– Average CPA: 35 € (Ziel: < 25 €) ⚠️ zu hoch

🏆 Top-Performer (nach CPA):
1. Reel „Community-Vibe" — CPA 28 € (BEST)
2. Video „Anfänger-Transformation" — CPA 34 €
3. Testimonial-Carousel — CPA 42 €

⚡ Aktion diese Woche:
✓ Neue Reel gedreht (Trainer-Tipps)
— CPA immer noch > Ziel — Testing nächste Woche
— Audience erweitern auf Umkreis 80km (von 60km)

Nächste Woche: Neue Creative launchen, Audience A/B-Test

Fragen? Ruf mich an.
```

---

## Messfehler vermeiden (Häufige Fehler)

| Fehler | Folge | Lösung |
|--------|-------|--------|
| Pixel installiert, aber nicht getestet | Keine Conversions trackbar → scheinbar 0 Leads | Pixel-Test mit „Test Event Code" **vor** Ads-Start |
| GA4 vs. Meta unterschiedliche Zahlen | Confusion, falsche Entscheidungen | Beide Quellen nutzen, aber **Meta** als Garantie-Messung definieren |
| UTM-Parameter nicht konsistent | Daten-Spaghetti, keine aussagekräftige Auswertung | **Naming-Convention:** utm_source=meta, utm_campaign=[club_objective_qX] |
| Lead-Form ohne „Thank You"-Page | Conversion-Event feuert nicht | Conversion-Tracking auf Thank-You-Seite platzieren (nicht Lead-Form selbst) |
| Conversions falsch definiert | Alles ist eine „Conversion", keine Unterscheidung | 3 Events: lead_form_submit, phone_call, booking_completed (getrennt tracken) |
| Keine Dokumentation | Bei Streit „wer sagt was" | **Alles schriftlich:** Verträge, Guarantiewerte, Messbericht, Screenshots |

---

## Tools & Integrationen

### Essentiell
- **Meta Werbeanzeigenmanager** (kostenlos mit Ad-Account)
- **Google Analytics 4** (kostenlos)
- **Google Tag Manager** (kostenlos, optional für komplexe Setups)

### Optional (für Automation)
- **Zapier** oder **Make** — automatische Lead-Notifications an Kundenservice
- **Data Studio** oder **Metabase** — automatisierte Dashboards statt Excel

---

## Dokumentation für Rechtssicherheit

### Vertrags-Grundlagen (vor Kampagne)

**Im Vertrag müssen festgehalten sein:**

```
GARANTIEWERTE (Anlage A):
— Ziel-Impressionen: ______
— Ziel-Leads: ______
— Ziel-CPA: < ______ €
— Mindebudget: 600 €/Monat kontinuierlich
— Mesquelle: Meta Werbeanzeigenmanager (7-Tage-Fenster)
— Messzeitraum: 13 Wochen

KUNDENMITARBEIT (Anlage B):
— Lead-Bearbeitung innerhalb 24 Stunden
— Antwortzeit auf Drafts: 5 Arbeitstage
— Pixel-Installation: Vor Kampagnenstart verifiziert
— Keine Angebotsänderungen während Kampagne (ohne Ankündigung)

ERSTATTUNGSFALL (Anlage C):
— Wenn Zielwert nicht erreicht: 50% Betreuungspauschale dieses Quartals
— Bedingung: Alle 4 Bedingungen erfüllt (Budget, Leads, Kundenmitwirkung, Technik)
```

### Messbericht-Archive

**Speichern für mindestens 7 Jahre (GbR/Buchhaltung):**
```
/Kunden/[Clubname]/
├─ Verträge/
│  ├─ Vertrag_Q4_2026.pdf
│  └─ Garantiewerte_Q4_2026.pdf
├─ Reporting/
│  ├─ Wochenreport_KW42_2026.pdf
│  ├─ Wochenreport_KW43_2026.pdf
│  └─ Garantie-Messbericht_Q4_2026_FINAL.pdf
├─ Screenshots/
│  ├─ Meta_Campaign_Metrics_13.12.2026.png
│  └─ GA4_Conversions_13.12.2026.png
└─ Dokumentation/
   └─ Pixel-Test_01.10.2026.pdf
```

---

## KPI-Dashboard (Monatlicher Überblick)

```
NORTHLINE GROWTH — Oktober 2026 DASHBOARD

CLIENT LEADERBOARD (Kennzahlen alle Kunden):
┌─────────────────┬──────────┬──────┬──────┬─────────┐
│ Club            │ Leads    │ CPA  │ ROAS │ Status  │
├─────────────────┼──────────┼──────┼──────┼─────────┤
│ Golfclub 1      │ 18/60 ✅ │ 28€  │ 10.7 │ Green   │
│ Tennisverein    │ 12/60 ⚠️ │ 35€  │ 8.2  │ Amber   │
│ Segelclub       │ 3/45 ❌  │ 48€  │ 6.1  │ Red     │
│ Fahrschule      │ 8/40 ✅ │ 22€  │ 13.6 │ Green   │
└─────────────────┴──────────┴──────┴──────┴─────────┘

Gesamt-Spend: 3.640 € (von 7.200 € budgetiert)
Gesamt-Leads: 41 (von 205 Ziel)
Durchschn. CPA: 31,22 € (Ziel: < 28 €)
```

---

*Zuletzt aktualisiert: 23. August 2026*
*Verfasser: Northline Growth — Analytics & Reporting*
