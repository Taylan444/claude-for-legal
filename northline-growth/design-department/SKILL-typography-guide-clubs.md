---
name: typography-guide-clubs
description: "Definiere Schriftarten und Größen für Club-Websites — Font-Pairing, Größen-Skala, Mobile-Optimierung, Fallback-Fonts."
metadata:
  version: 1.0.0
  product: Northline Growth
  department: Design Department
---

# Typografie-Guide für Clubs

Deine Aufgabe: Eine **klare, konsistente Typografie** definieren — welche Fonts, welche Größen, welche Gewichte — damit Website + Ads + Print-Material gleich aussehen.

**Warum?** Damit Seniorenclubmitglieder die Website lesen können und jede Headline nach dem Club aussieht.

---

## Font-Pairing (Headlines + Body kombinieren)

### Pairing 1: Classic (Montserrat + Inter)

**Best für:** Golfclub, etablierte Clubs, traditionell

```
Headlines: Montserrat Bold
Body-Text: Inter Regular (400)
Small-Text: Inter Medium (500)

Charakteristik:
- Montserrat: Selbstbewusst, modern, gut lesbar
- Inter: Neutral, freundlich, sehr web-optimiert
- Kombiniert: Elegant + Lesbar

Font-Import (Google Fonts):
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

CSS:
body { font-family: 'Inter', sans-serif; }
h1, h2, h3 { font-family: 'Montserrat', sans-serif; font-weight: 700; }
```

---

### Pairing 2: Modern (Poppins + Open Sans)

**Best für:** Tennisverein, jugendliche Clubs

```
Headlines: Poppins Bold/SemiBold
Body-Text: Open Sans Regular (400)
Small-Text: Open Sans SemiBold (600)

Charakteristik:
- Poppins: Freundlich, rund, modern
- Open Sans: Neutral, sehr web-standard, lesbar
- Kombiniert: Einladend + Professionell

Font-Import:
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Open+Sans:wght@400;600&display=swap" rel="stylesheet">

CSS:
body { font-family: 'Open Sans', sans-serif; }
h1, h2, h3 { font-family: 'Poppins', sans-serif; font-weight: 700; }
```

---

### Pairing 3: Minimal (Lato + Roboto)

**Best für:** Fahrschule, moderne Clubs, sehr clean

```
Headlines: Lato Bold
Body-Text: Roboto Light/Regular
Small-Text: Roboto Medium

Charakteristik:
- Lato: Elegant, zeichenreich, gut für Headlines
- Roboto: Zukunftsorientiert, sehr neutral
- Kombiniert: Modern + Vertrauenswürdig

Font-Import:
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;600;700&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">

CSS:
body { font-family: 'Roboto', sans-serif; }
h1, h2, h3 { font-family: 'Lato', sans-serif; font-weight: 700; }
```

---

### Pairing 4: Serif (Playfair Display + Lora)

**Best für:** Premium Clubs, elegante Clubs (Wein-Club, Kunstclub)

```
Headlines: Playfair Display Bold
Body-Text: Lora Regular (400)
Small-Text: Lora Medium (500)

Charakteristik:
- Playfair Display: Klassisch, elegant, Luxury-feel
- Lora: Warm, lesbar, Klassik-Look
- Kombiniert: Ultra-elegant, traditionell

Warnung: Serif-Fonts brauchen größer Schrift (18px+) für Web

Font-Import:
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lora:wght@400;500&display=swap" rel="stylesheet">

CSS:
body { font-family: 'Lora', serif; }
h1, h2, h3 { font-family: 'Playfair Display', serif; font-weight: 700; }
```

---

## Größen-Skala (Desktop)

```
H1 (Landing-Page-Headline)
- Size: 48px
- Weight: Bold (700)
- Line-Height: 1.2
- Letter-Spacing: -0.5px (enger, dramatischer)
- Margin-Bottom: 30px

Beispiel:
"Willkommen im Golfclub Hannover"

---

H2 (Section-Headlines)
- Size: 36px
- Weight: Bold (700)
- Line-Height: 1.3
- Letter-Spacing: 0px
- Margin-Bottom: 25px

Beispiel:
"Warum Golfclub Hannover?"

---

H3 (Card-Titles, Sub-Headlines)
- Size: 24px
- Weight: 600 (SemiBold)
- Line-Height: 1.4
- Letter-Spacing: 0px
- Margin-Bottom: 15px

Beispiel:
"Professionelle Plätze"

---

Body Text (Standard-Paragraph)
- Size: 16px
- Weight: 400 (Regular)
- Line-Height: 1.6 (locker, lesbar)
- Letter-Spacing: 0px
- Margin-Bottom: 20px

Beispiel:
"Der Golfclub Hannover ist seit 1998..."

---

Small Text (Meta-Info, Captions)
- Size: 14px
- Weight: 400
- Line-Height: 1.5
- Letter-Spacing: 0px
- Color: #666666 (grau, nicht black)
- Margin-Bottom: 10px

Beispiel:
"Veröffentlicht am 23. August 2026 von Taylan"

---

Label (Form-Labels, Tags)
- Size: 12px
- Weight: 600 (Bold)
- Line-Height: 1.4
- Letter-Spacing: 0.5px (gedehnter, für Lesbarkeit)
- Text-Transform: uppercase
- Color: #1B3A6B (Primärfarbe)

Beispiel:
"E-MAIL-ADRESSE"

---

Button Text (CTAs)
- Size: 16px
- Weight: 600 (Bold)
- Text-Transform: none
- Letter-Spacing: 0px

Beispiel:
"Jetzt anmelden"
```

---

## Mobil-Optimierung (< 768px)

```
H1 (Landing-Page)
- Desktop: 48px
- Mobile: 32px (20% Reduktion)
- Why: Auf kleinem Screen braucht es weniger Platz

---

H2 (Section-Headlines)
- Desktop: 36px
- Mobile: 28px

---

H3 (Card-Titles)
- Desktop: 24px
- Mobile: 20px

---

Body Text
- Desktop: 16px
- Mobile: 16px (NICHT kleiner!)
- Why: Seniorenclubmitglieder brauchen 16px+ ohne Zoom

---

Small Text
- Desktop: 14px
- Mobile: 12px

---

Line-Height bleibt GLEICH auf Mobile:
- Headlines: 1.2–1.4
- Body: 1.6 (nicht enger machen!)

---

Regel: Auf Mobile mehr Whitespace, nicht kleinere Fonts
```

---

## Font-Gewichte (Varianten nutzen)

```
Regular (400)
- Body-Text, Standard-Paragraphen
- Nicht für Headlines verwenden
- Beispiel: "Der Club ist seit 1998..."

Medium (500)
- Small-Headlines, Labels
- Empasis bei Body-Text
- Beispiel: "Wichtige Info" (etwas dicker als 400)

SemiBold (600)
- H3, Labels, Emphasis
- Nicht zu viel verwenden (wirkt gehackt)
- Beispiel: "Probemitgliedschaft" (hervorgehoben)

Bold (700)
- H1, H2, Buttons
- Nur für Attention verwenden
- Beispiel: "Willkommen!"

Extra-Bold (800+)
- NICHT verwenden auf Web
- Zu dominant, schwer zu lesen
- Nur Print-Material
```

---

## Fallback-Fonts (wenn Google Fonts nicht laden)

Immer Fallbacks definieren, falls das Netzwerk langsam ist:

```css
/* Montserrat mit Fallback zu sans-serif */
h1, h2, h3 {
  font-family: 'Montserrat', 'Helvetica Neue', 'Arial', sans-serif;
}

/* Inter mit Fallback zu sans-serif */
body, p {
  font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif;
}

/* Fallback-Strategie:
1. Primär-Font (Montserrat)
2. Ähnlicher Font (Helvetica Neue, wenn Montserrat nicht lädt)
3. Generic sans-serif (als letzter Ausweg)
*/
```

---

## Typografie-Regeln (Konsistenz)

```
☐ Maximal 2 Fonts pro Website (1 für Headlines, 1 für Body)
☐ Headline-Größe sollte H1 > H2 > H3 sein (nie kleiner)
☐ Body-Text immer 16px minimum (lesbar ohne Zoom)
☐ Line-Height immer 1.4+ für Body (nicht zu dicht)
☐ Letter-Spacing immer 0 (außer Labels, dann +0.5px)
☐ Nicht mehr als 3 Font-Gewichte verwenden (400, 600, 700)
☐ Headlines: Bold (700), nie Regular
☐ CTA-Buttons: Bold, kontrastierend
☐ Small-Text: Grau (#666), nicht schwarz
☐ Fallback-Fonts definiert (für schlechtes Internet)
```

---

## Größen-Skala-Generator (Copy-Paste)

```html
<!-- HTML-Vorlage für alle Text-Elemente -->

<h1>Willkommen im Club</h1>
<!-- 48px Bold, Margin-bottom 30px -->

<h2>Warum zu uns?</h2>
<!-- 36px Bold, Margin-bottom 25px -->

<h3>Feature-Titel</h3>
<!-- 24px SemiBold, Margin-bottom 15px -->

<p>Standard-Text auf Website...</p>
<!-- 16px Regular, Line-height 1.6, Margin-bottom 20px -->

<small>Meta-Information</small>
<!-- 14px Regular, Grau #666, Margin-bottom 10px -->

<label>Formular-Label</label>
<!-- 12px Bold, Uppercase, Margin-bottom 5px -->

<button>Jetzt anmelden</button>
<!-- 16px Bold, Center-Text -->
```

```css
/* CSS für die Skala */

h1 {
  font-family: 'Montserrat', sans-serif;
  font-size: 48px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;
  margin-bottom: 30px;
}

h2 {
  font-family: 'Montserrat', sans-serif;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 25px;
}

h3 {
  font-family: 'Montserrat', sans-serif;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 15px;
}

p {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  margin-bottom: 20px;
}

small {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: #666666;
  margin-bottom: 10px;
}

label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 5px;
}

button {
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0px;
}

/* Mobile-Anpassung */
@media (max-width: 768px) {
  h1 { font-size: 32px; }
  h2 { font-size: 28px; }
  h3 { font-size: 20px; }
  /* Body-Text bleibt 16px! */
}
```

---

## Before/After Typografie-Beispiele

### BEFORE (Chaotisch)

```
❌ 5 verschiedene Fonts (Montserrat, Arial, Verdana, Times, Impact)
❌ Größen willkürlich (40px hier, 18px da, 22px dort)
❌ Line-height inconsistent (1.2, 1.5, 1.8 gemischt)
❌ Body-Text 12px (zu klein, Seniorenclubmitglieder können nicht lesen)
❌ Keine Fallback-Fonts (wirkt zerstückelt auf langsamen Netzwerken)
❌ Headlines sind Regular (400) statt Bold (wirkt schwach)
```

### AFTER (Konsistent)

```
✅ 2 Fonts: Montserrat (Headlines) + Inter (Body)
✅ Größen nach Skala: H1=48px, H2=36px, H3=24px, Body=16px
✅ Line-height konsistent: Headlines 1.2–1.4, Body 1.6
✅ Body-Text 16px minimum (lesbar, auch für Ältere)
✅ Fallback-Fonts definiert ('Helvetica', sans-serif)
✅ Headlines Bold (700), Strong-Statement
✅ Resultat: Professional, Lesbar, Konsistent
```

---

## Häufige Fehler

| Fehler | Folge | Fix |
|--------|-------|-----|
| Zu viele Fonts (5+) | Wirkt unprofessionell | Max 2 Fonts: Headlines + Body |
| Body-Text < 16px | Seniorenclubmitglieder können nicht lesen | Minimum 16px, besser 17px |
| Headlines sind Regular (400) | Wirkt schwach, nicht hierarchisch | Headlines immer Bold (700) |
| Line-height zu dicht (1.2 für Body) | Text ist schwer zu lesen | Body: 1.6+, Headlines: 1.2–1.4 |
| Keine Fallback-Fonts | Website sieht auf langsamen Netzen chaotisch aus | Fallback-Stack: Primary + Helvetica + sans-serif |
| Verschiedene Größen pro Seite | Inkohärenz, nicht professionell | Größen-Skala definieren und überall nutzen |
| H3 ist größer als H2 | Verwirrende Hierarchie | Immer: H1 > H2 > H3 in Größe |

---

## Checkliste (vor Finalisierung)

```
☐ 2 Fonts gewählt (Headlines + Body)
☐ Größen-Skala definiert (H1, H2, H3, Body, Small, Label)
☐ Body-Text ist 16px+ (lesbar)
☐ Alle Headlines sind Bold (700+)
☐ Line-height ist konsistent (Headlines 1.2–1.4, Body 1.6)
☐ Fallback-Fonts definiert (nicht nur Google Fonts)
☐ Mobile-Sizes definiert (H1 auf Mobile 32px, etc.)
☐ Font-Import in HTML/CSS (Google Fonts Link)
☐ Typografie-Test: Alle Elemente auf Desktop + Mobile getestet
☐ Developer erhielt CSS-Code mit Größen + Gewichte
```

---

## Developer-Handout

Gib deinem Developer diesen Code:

```
TYPOGRAFIE-VORGABEN für [Clubname]

FONTS:
- Headlines: Montserrat Bold (wght 700)
- Body: Inter Regular (wght 400)
- Small: Inter Medium (wght 500)

Google Fonts Import:
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">

SIZES (Desktop):
- H1: 48px Bold, line-height 1.2, margin-bottom 30px
- H2: 36px Bold, line-height 1.3, margin-bottom 25px
- H3: 24px SemiBold, line-height 1.4, margin-bottom 15px
- Body: 16px Regular, line-height 1.6, margin-bottom 20px
- Small: 14px Regular, color #666, line-height 1.5

SIZES (Mobile <768px):
- H1: 32px
- H2: 28px
- H3: 20px
- Body: 16px (NICHT kleiner!)

FALLBACK-FONTS:
h1, h2, h3 { font-family: 'Montserrat', 'Helvetica Neue', 'Arial', sans-serif; }
p { font-family: 'Inter', 'Segoe UI', 'Roboto', sans-serif; }
```

---

*Zuletzt aktualisiert: 23. August 2026*
*Verfasser: Northline Growth — Design Department*
