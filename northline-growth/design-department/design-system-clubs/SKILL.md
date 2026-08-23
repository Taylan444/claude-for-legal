---
name: design-system-clubs
description: "Baue ein einfaches Design-System für Club-Websites — 4 Core Components, Layout-Grid, Responsive Rules, Accessibility."
metadata:
  version: 1.0.0
  product: Northline Growth
  department: Design Department
---

# Design-System für Clubs

Deine Aufgabe: Ein **wiederverwendbares Design-System** aufbauen, damit alle Club-Websites einheitlich aussehen — kein Durcheinander von unterschiedlichen Layouts, Spacing, Knöpfen.

**Warum?** Damit Designer + Developer schneller arbeiten und jede Website wie vom gleichen Club wirkt.

---

## Die 4 Core Components (Alles was du brauchst)

### Component 1: Header + Navigation

```html
<header style="
  background: #1B3A6B;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
">
  <!-- Logo -->
  <div style="font-weight: bold; color: white; font-size: 18px;">
    Golfclub Hannover
  </div>
  
  <!-- Navigation -->
  <nav style="display: flex; gap: 30px;">
    <a href="#" style="color: white; text-decoration: none; font-size: 16px;">Home</a>
    <a href="#" style="color: white; text-decoration: none; font-size: 16px;">Über uns</a>
    <a href="#" style="color: white; text-decoration: none; font-size: 16px;">Mitgliedschaft</a>
    <a href="#" style="color: white; text-decoration: none; font-size: 16px;">Kontakt</a>
  </nav>
  
  <!-- CTA Button -->
  <button style="
    background: #D4AF37;
    color: #1B3A6B;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
  ">
    Probemitgliedschaft
  </button>
</header>
```

**Rules:**
- **Breite:** 100% der Bildschirmbreite
- **Höhe:** 60–70px (kompakt, nicht überrascht)
- **Logo:** 40–60px breit
- **Navigation:** 4–6 Links (nicht mehr)
- **Spacing:** 20px links/rechts, 15px oben/unten
- **Button:** Kontrastfarbe (nicht gleich wie Background)
- **Mobile:** Bei <768px: Hamburger-Menü (3 Linien)

---

### Component 2: Hero Section (Startbild + Headline)

```html
<section style="
  background: linear-gradient(135deg, #1B3A6B 0%, #0F1F3D 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;
">
  <h1 style="
    font-size: 48px;
    font-weight: bold;
    margin: 0 0 20px 0;
    line-height: 1.2;
  ">
    Willkommen im Golfclub Hannover
  </h1>
  
  <p style="
    font-size: 20px;
    margin: 0 0 30px 0;
    opacity: 0.9;
  ">
    Seit 1998: Der Ort, wo Unternehmer spielen und Beziehungen aufbauen.
  </p>
  
  <button style="
    background: #D4AF37;
    color: #1B3A6B;
    border: none;
    padding: 15px 40px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
  ">
    Jetzt Probemitgliedschaft buchen
  </button>
</section>
```

**Rules:**
- **Hintergrund:** Gradient (dunkel zu dunkel) oder Bild mit Overlay
- **Text:** Weiß, zentralisiert
- **Headline:** 48px (Desktop), 32px (Mobile), Max 2 Zeilen
- **Subline:** 20px, max 100 Zeichen
- **Padding:** 80px oben/unten (großzügig), 20px links/rechts
- **CTA-Button:** Kontrastfarbe, groß (15px padding)
- **Mobile:** Padding 40px oben/unten, Headline 32px

---

### Component 3: Feature Section (3 Features nebeneinander)

```html
<section style="
  background: white;
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
">
  <h2 style="
    font-size: 36px;
    text-align: center;
    margin: 0 0 50px 0;
    color: #1B3A6B;
  ">
    Warum Golfclub Hannover?
  </h2>
  
  <div style="
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 30px;
  ">
    <!-- Feature 1 -->
    <div style="
      background: #F5F5F5;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
    ">
      <div style="
        font-size: 40px;
        margin: 0 0 15px 0;
      ">🏌️</div>
      
      <h3 style="
        font-size: 20px;
        font-weight: bold;
        color: #1B3A6B;
        margin: 0 0 10px 0;
      ">
        Professionelle Plätze
      </h3>
      
      <p style="
        font-size: 14px;
        color: #666;
        margin: 0;
        line-height: 1.6;
      ">
        18-Loch Championship Platz, gepflegt wie ein Garten.
      </p>
    </div>
    
    <!-- Feature 2 -->
    <div style="
      background: #F5F5F5;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
    ">
      <div style="font-size: 40px; margin: 0 0 15px 0;">🤝</div>
      <h3 style="
        font-size: 20px;
        font-weight: bold;
        color: #1B3A6B;
        margin: 0 0 10px 0;
      ">
        Elite-Netzwerk
      </h3>
      <p style="
        font-size: 14px;
        color: #666;
        margin: 0;
        line-height: 1.6;
      ">
        450 Business-Profis — dein Netzwerk wächst mit jedem Besuch.
      </p>
    </div>
    
    <!-- Feature 3 -->
    <div style="
      background: #F5F5F5;
      padding: 30px;
      border-radius: 8px;
      text-align: center;
    ">
      <div style="font-size: 40px; margin: 0 0 15px 0;">🌟</div>
      <h3 style="
        font-size: 20px;
        font-weight: bold;
        color: #1B3A6B;
        margin: 0 0 10px 0;
      ">
        Exklusive Events
      </h3>
      <p style="
        font-size: 14px;
        color: #666;
        margin: 0;
        line-height: 1.6;
      ">
        Monatliche Turniere, Galadinner, Jahresbälle.
      </p>
    </div>
  </div>
</section>
```

**Rules:**
- **Container:** max-width 1200px, zentriert, auto-margin
- **Headline:** 36px, zentriert, Primärfarbe
- **Grid:** 3 Spalten (Desktop), 1 Spalte (Mobile)
- **Cards:** Hintergrund = sekundäre Farbe, Padding 30px, Radius 8px
- **Card-Titel:** 20px, Primärfarbe, Bold
- **Card-Text:** 14px, Grau, Line-height 1.6
- **Spacing:** 30px zwischen Cards, 60px oben/unten
- **Gap zwischen Sections:** Immer 60px (nicht 20, nicht 100)

---

### Component 4: CTA Section (Call-to-Action — Final Button)

```html
<section style="
  background: linear-gradient(135deg, #1B3A6B 0%, #0F1F3D 100%);
  color: white;
  padding: 60px 20px;
  text-align: center;
">
  <h2 style="
    font-size: 32px;
    font-weight: bold;
    margin: 0 0 15px 0;
    line-height: 1.3;
  ">
    Bereit, Teil unserer Community zu werden?
  </h2>
  
  <p style="
    font-size: 18px;
    margin: 0 0 30px 0;
    opacity: 0.9;
  ">
    Starten Sie mit einer kostenfreien Probemitgliedschaft.
  </p>
  
  <button style="
    background: #D4AF37;
    color: #1B3A6B;
    border: none;
    padding: 15px 50px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 18px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  ">
    Jetzt anmelden
  </button>
</section>
```

**Rules:**
- **Hintergrund:** Primärfarbe-Gradient
- **Text:** Weiß, zentralisiert
- **Headline:** 32px, Max 2 Zeilen
- **Button:** Kontrastfarbe, groß (15px padding, 50px breite)
- **Padding:** 60px oben/unten, 20px links/rechts
- **Shadow:** Subtil, keine Überraschung

---

## Layout-Grid (Abstände, Breiten, Spacing)

```
Container-Breite:
- Desktop: max-width 1200px, zentriert
- Tablet (768–1024px): 100% minus 40px (20px Margin)
- Mobile (<768px): 100% minus 40px (20px Margin)

Spacing zwischen Sections:
- Groß: 80px (Hero, CTA)
- Standard: 60px (Features, Content)
- Kompakt: 30px (innerhalb Cards)

Spacing innerhalb Elements:
- H1/H2: margin-bottom 30px
- H3: margin-bottom 15px
- Paragraphen: margin-bottom 20px
- Links: margin-bottom 0

Line-Height (für Lesbarkeit):
- Headlines: 1.2 (enger, größer wirkt)
- Body-Text: 1.6 (locker, lesbar)
- Small-Text: 1.4 (mittel)
```

---

## Responsive Rules (Mobile First)

```
Breakpoints:
- Mobile: <768px (Handy)
- Tablet: 768px–1024px
- Desktop: >1024px

Regeln pro Breakpoint:

MOBILE (<768px):
□ Header: Hamburger-Menü statt Horizontal-Nav
□ Hero-Headline: 32px statt 48px
□ Feature-Grid: 1 Spalte statt 3
□ Button: Volle Breite (nicht fixed width)
□ Padding: 20px statt 30px
□ Font-Size Body: 16px (lesbar ohne Zoom)

TABLET (768–1024px):
□ Header: Normale Nav, kompaktes Logo
□ Hero-Headline: 40px
□ Feature-Grid: 2 Spalten
□ Padding: 40px oben/unten, 30px links/rechts

DESKTOP (>1024px):
□ Vollständiges Design wie oben
□ Max-Width Container: 1200px
□ Feature-Grid: 3 Spalten
□ Padding: 60–80px
```

---

## Accessibility Basics (für alle müssen verstehen)

```
☐ Kontrast-Ratio: Minimum 4.5:1 (Text zu Background)
  Prüfe mit: webaim.org/resources/contrastchecker/
  
☐ Font-Größe: Minimum 16px auf Body-Text (ohne Zoom lesbar)
  
☐ Line-Height: Minimum 1.4 (nicht zu dicht zusammen)
  
☐ Fokus-States: Alle Links müssen ein Fokus-Feedback haben
  Beispiel:
  a:focus { outline: 2px solid #D4AF37; }
  
☐ ALT-Text: Alle Bilder müssen Beschreibungen haben
  <img src="golfclub.jpg" alt="Golfspieler beim Abschlag auf Fairway">
  
☐ Color nicht allein zur Info nutzen
  Nicht: "Grüne Cards = verfügbar, rote = voll"
  Besser: "Verfügbar ✓" + Farbe

☐ Mobile-Tastenanschlag: 44px × 44px minimum
  Nicht zu kleine Buttons (Senioren können nicht treffen)
```

---

## Component-Checklist (vor jedem Design)

```
☐ Header ist einheitlich (Same Logo, Nav, Button)
☐ Hero hat Gradient oder Bild (nicht einfach weiß)
☐ H1 ist max 48px (nicht kleiner, nicht größer)
☐ Body-Text ist 16px+ (lesbar ohne Zoom)
☐ CTA-Buttons sind Kontrastfarbe (#D4AF37 auf #1B3A6B)
☐ Cards haben Padding 30px und Radius 8px
☐ Spacing zwischen Sections ist 60px (konsistent)
☐ Grid ist 3 Spalten Desktop, 1 Spalte Mobile
☐ Kontrast ist 4.5:1+ (prüfe mit contrast checker)
☐ Footer hat Navigation + Social Links + Kontakt
```

---

## Häufige Fehler

| Fehler | Folge | Fix |
|--------|-------|-----|
| Zu viele verschiedene Layouts | Wirkt unkoordiniert | Nur 4 Core Components, Wiederverwendung |
| Spacing ist willkürlich (20px hier, 50px dort) | Chaotisch | Spacing-Skala: 20, 30, 60, 80px only |
| Knöpfe haben unterschiedliche Größen | Ungleichgewicht | Alle Primary-Buttons: 15px padding, 18px font |
| Grids haben zu viele Spalten (5+) | Zu viel Information | Max 3 Spalten, besser 1–2 |
| Responsive ist nicht gedacht (kein Mobile) | Website auf Handy = unleserlich | Mobile-First: Design für <768px, dann hochskalen |
| Keine Accessibility | Ältere Clubmitglieder können nicht lesen | Kontrast 4.5:1+, Font ≥16px, ALT-Text |

---

## Developer-Handout Template

Gib diesen Text deinem Web-Developer:

```
DESIGN-SYSTEM VORGABEN für [Clubname]

Farben:
- Primary Blue: #1B3A6B (Headlines, CTAs)
- Accent Gold: #D4AF37 (Buttons hover)
- Light Background: #F5F5F5 (Card backgrounds)
- Dark Text: #333333 (Paragraphs)

Typografie:
- Headlines (H1–H3): Montserrat Bold, 48/36/24px
- Body: Inter, 16px, line-height 1.6
- Small: 14px, line-height 1.4

Layout:
- Container: max-width 1200px
- Spacing: 60px zwischen Sections
- Mobile: max-width 100% - 40px, 1 Spalte

Komponenten:
- Header: 60px Höhe, Fixed
- Hero: min-height 400px, Gradient Background
- Features: 3-Column Grid (Desktop), 1 Column (Mobile <768px)
- CTA: Full-width Background, zentralisiert
- Footer: Dark Background, weiße Links

Accessibility:
- Kontrast: 4.5:1 minimum
- Font-Size: 16px minimum
- Focus-Outline: 2px solid #D4AF37 auf Links
```

---

*Zuletzt aktualisiert: 23. August 2026*
*Verfasser: Northline Growth — Design Department*
