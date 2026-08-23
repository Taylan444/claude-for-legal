---
name: website-redesign-clubs
description: "Audit + Upgrade einer Club-Website — 15-Punkte-Checklist, Common Sins beheben, Section-by-Section Redesign, Timeline + Kosten."
metadata:
  version: 1.0.0
  product: Northline Growth
  department: Design Department
---

# Website-Redesign für Clubs

Deine Aufgabe: Eine **alte oder mittelmäßige Club-Website analysieren** und zum Upgrade-Plan machen — was muss gefixt werden, in welcher Reihenfolge, wie lange braucht's.

**Warum?** Damit die Website nicht wie 2010 aussieht und neue Clubmitglieder gewinnt.

---

## Website-Audit: 15-Punkte-Checklist

Gib der bestehenden Website eine Note von 1–5:

### 1. **Mobile-Responsive**
```
Frage: Sieht die Website auf Handy genauso gut aus wie auf Desktop?

Check:
□ Navigation ist auf Handy ein Hamburger-Menü (3 Linien)?
□ Text ist lesbar ohne Zoom (16px+)?
□ Buttons sind 44px × 44px groß (Finger können drücken)?
□ Keine horizontales Scrollen (nicht seitlich scrollen müssen)?
□ Bilder skalieren richtig (nicht verzerrt)?

Wenn NEIN: Mobile-Design muss komplett neu

GEWICHT: 25% (wichtigste Metrik!)
```

### 2. **Page-Speed**
```
Frage: Lädt die Website schnell (<3 Sekunden)?

Check mit: Google PageSpeed Insights (pagespeed.web.dev)
□ Performance-Score > 50?
□ Largest Contentful Paint < 2.5s?
□ Cumulative Layout Shift < 0.1?
□ First Input Delay < 100ms?

Tools zur Prüfung:
- Google PageSpeed Insights
- GTMetrix
- Lighthouse (Chrome DevTools)

Wenn LANGSAM: Bilder komprimieren, Code optimieren, CDN nutzen

GEWICHT: 15% (Rankings leiden, Users verlassen Seite)
```

### 3. **Design-Kohärenz**
```
Frage: Sieht jede Seite aus wie vom gleichen Club?

Check:
□ Gleiche Farben überall (#1B3A6B, #D4AF37)?
□ Gleiche Fonts überall (nicht 5 verschiedene)?
□ Gleiche Spacing/Layout-Struktur (Hero, Features, CTA)?
□ Logo ist überall gleich (Größe, Position)?

Wenn NEIN: Design-System muss definiert werden

GEWICHT: 20%
```

### 4. **Navigation**
```
Frage: Kann ein neuer Besucher die Website navigieren?

Check:
□ Header-Menu hat max 4–6 Links (nicht 20)?
□ Logo ist klickbar (back to home)?
□ Breadcrumbs auf tiefen Seiten (du bist hier: Home > Über uns)?
□ Footer hat Link-Struktur (Kontakt, Social, Sitemap)?
□ Keine toten Links (404 Fehler)?

Wenn NEIN: Navigation muss vereinfacht werden

GEWICHT: 10%
```

### 5. **Content-Qualität**
```
Frage: Ist der Text hilfreich oder Marketing-Blah?

Check:
□ Headlines sind konkret (nicht: "Willkommen")?
□ Texte sind kurz (<200 Worte pro Block)?
□ Keine Grammatik-Fehler oder Typos?
□ CTAs sind klar ("Jetzt anmelden" nicht "Mehr")?
□ Informationen sind aktuell (Preise, Events, Trainer)?

Wenn JA: Content ist gut, muss nur Design updated werden

GEWICHT: 15%
```

### 6. **Bilder-Qualität**
```
Frage: Sind die Bilder professionell oder Stock-Fotos?

Check:
□ Bilder zeigen echte People, nicht Stock-Platformen?
□ Golden Hour / gute Beleuchtung (nicht flach)?
□ High-Resolution (nicht pixelig)?
□ Relevant zu Club (nicht generic)?
□ ALT-Text vorhanden (für Accessibility)?

Wenn STOCK: Bilder müssen neu fotografiert werden

GEWICHT: 10%
```

### 7. **Trust-Signals**
```
Frage: Wirkt der Club vertrauenswürdig?

Check:
□ Member-Testimonials mit echten Namen/Fotos?
□ Social-Media-Links (Instagram, Facebook)?
□ Kontakt-Informationen sichtbar (Adresse, Tel, Email)?
□ "Über uns"-Seite mit Team/Geschichte?
□ Privacy-Policy + Impressum im Footer?
□ Keine veralteten Copyright-Jahre (2020 statt 2025)?

Wenn NEIN: Trust-Sektion muss hinzugefügt werden

GEWICHT: 10%
```

### 8. **CTA-Buttons**
```
Frage: Sind die Buttons deutlich und klickbar?

Check:
□ CTA-Buttons sind Primärfarbe (#D4AF37 Gold?)?
□ Button-Text ist aktiv ("Buchen" nicht "Klick hier")?
□ Mindestens 3–5 CTAs auf Landing-Page?
□ Buttons sind > 44px groß (auf Handy klickbar)?
□ Hover-State definiert (visuelles Feedback)?

Wenn NEIN: CTAs müssen prominent gemacht werden

GEWICHT: 10%
```

### 9. **Form-Usability**
```
Frage: Können User sich leicht anmelden/kontaktieren?

Check:
□ Anmeldeform ist sichtbar (nicht versteckt)?
□ Max 5 Felder (Name, Email, Phone, Message)?
□ Labels sind klar (nicht "Telefon" vs "Handy")?
□ Submit-Button ist groß und deutlich?
□ Error-Messages sind verständlich (nicht: "Feld ungültig")?

Wenn NEIN: Forms müssen vereinfacht werden

GEWICHT: 10%
```

### 10. **SEO-Basics**
```
Frage: Findet Google die Website?

Check:
□ Title-Tag < 60 Zeichen ("Golfclub Hannover | Mitgliedschaft")?
□ Meta-Description < 160 Zeichen (Zusammenfassung)?
□ H1 ist einzigartig pro Seite (nicht 0 oder mehrere)?
□ Keywords sind in Headlines (nicht nur Body)?
□ Sitemap.xml vorhanden (für Search Engines)?

Wenn NEIN: SEO-Audit notwendig (kein Ranking = keine Leads)

GEWICHT: 10%
```

### 11. **Kontrast & Accessibility**
```
Frage: Können auch ältere User die Website lesen?

Check:
□ Text-zu-Background Kontrast ≥ 4.5:1?
□ Schriftgröße ≥ 16px (ohne Zoom lesbar)?
□ Farbe wird nicht allein zur Info genutzt (Rot = Error + ❌ Icon)?
□ Links sind unterstrichen oder auffällig farbig?
□ Videos haben Captions (für Gehörlose)?

Test mit: webaim.org/resources/contrastchecker/

GEWICHT: 15% (Golfclub-Member sind teilweise 60+)
```

### 12. **Footer**
```
Frage: Ist der Footer hilfreich oder geleert?

Check:
□ Footer hat Links (Home, Über, Kontakt, Privacy)?
□ Social-Media-Icons sind sichtbar (Instagram, FB)?
□ Kontaktdaten sind deutlich (Telefon, Email, Adresse)?
□ Copyright ist aktuell (© 2026)?
□ Responsive auf Mobile (nicht überfüllt)?

GEWICHT: 5%
```

### 13. **Sicherheit (SSL/HTTPS)**
```
Frage: Ist die Website sicher?

Check:
□ URL beginnt mit https:// (nicht http://)?
□ Kein "Unsecure"-Warning im Browser?
□ SSL-Zertifikat ist aktuell (nicht abgelaufen)?
□ Kontaktform ist verschlüsselt?

Wenn NEIN: SSL-Zertifikat muss installiert werden (kostenlos über Let's Encrypt)

GEWICHT: 5%
```

### 14. **Branding**
```
Frage: Repräsentiert die Website die Club-Identität?

Check:
□ Logo ist prominent (Header, nicht klein)?
□ Farben entsprechen Brand-Richtlinien?
□ Tone of Voice ist konsistent (formal? freundlich?)?
□ Club-Werte sind sichtbar (Eleganz? Energie? Natur?)?

GEWICHT: 10%
```

### 15. **Conversion-Rate**
```
Frage: Konvertiert die Website (Besucher → Anmeldungen)?

Check:
□ Google Analytics ist installiert (Besucher-Zahlen?)?
□ Conversion-Rate > 2% (Besucher → Leads)?
□ Bounce-Rate < 50% (nicht zu viele verlassen Seite)?
□ Average Session Duration > 30s?
□ Top-Seiten sind nicht "404 Not Found"?

Wenn CONVERSION < 2%: Landing-Page-Redesign kritisch

GEWICHT: Variabel (abgesehen von Audit-Punkten)
```

---

## Audit-Ergebnis: Scoring-Tabelle

```
Summe alle 14 Punkte (jeder 1–5):

0–20 Punkte: 🔴 KRITISCH
"Website von 2010, komplett redesign notwendig"
Kosten: €4,000–8,000
Timeline: 3–4 Wochen

21–40 Punkte: 🟠 DRINGEND
"Outdated Design, aber brauchbar"
Kosten: €2,000–4,000
Timeline: 2–3 Wochen

41–60 Punkte: 🟡 WICHTIG
"Moderne Struktur, aber kleine Fixes"
Kosten: €1,000–2,000
Timeline: 1–2 Wochen

61–70 Punkte: 🟢 GUT
"Gutes Fundament, Optimierungen nötig"
Kosten: €500–1,000
Timeline: 1 Woche

71+ Punkte: 🟢 SEHR GUT
"Website ist modern, nur kleine Updates"
Kosten: €200–500
Timeline: 2–3 Tage
```

---

## Common Website Sins (Top 5 Fehler)

### Sin 1: Zu viele Fonts (5+)

```
❌ FALSCH:
- Header: Arial
- Headlines: Verdana
- Body: Georgia
- CTA: Impact
- Footer: Comic Sans

📊 Resultat: Wirkt chaotisch, unprofessionell, Seniorenclubmitglieder können nicht lesen

✅ RICHTIG:
- Headlines: Montserrat Bold
- Body: Inter Regular
- Alles andere: Inter
- Fertig.

FIX: Alle Fonts durch 2 ersetzen (Headlines + Body)
```

---

### Sin 2: Body-Text ist zu klein (12px oder weniger)

```
❌ FALSCH:
- Body-Text: 12px
- Seniorenclubmitglieder müssen zoomen
- Google + Browser sagen: "Bad mobile experience"

📊 Resultat: Schlechte Rankings + Absprünge

✅ RICHTIG:
- Body-Text: 16px minimum
- Lesbar ohne Zoom, auch für Ältere
- Bessere Rankings

FIX: Font-Size in CSS von 12px → 16px ändern
```

---

### Sin 3: Keine Mobile-Optimierung

```
❌ FALSCH:
- Website ist Desktop-only
- Auf Handy müssen User horizontal scrollen
- Text ist unlesbar
- Buttons sind zu klein

📊 Resultat: 60% der Besucher verlassen Seite (mobile traffic ist Mehrheit!)

✅ RICHTIG:
- Media-Queries für Mobile (<768px)
- Hamburger-Menü statt Horizontal-Nav
- 1-spaltig Layout auf Handy
- Buttons 44px × 44px

FIX: CSS Media-Queries hinzufügen, Responsive Grid definieren
```

---

### Sin 4: Schlechte Bilder (Stock-Fotos oder veraltete Aufnahmen)

```
❌ FALSCH:
- Generische Stock-Fotos (could-be-any-club)
- Fotos von 2015 (alte Trainer, alte Kleidung)
- Schlechte Beleuchtung oder low-res

📊 Resultat: Wirkt unprofessionell, nicht differenziert

✅ RICHTIG:
- Echte Fotos von echten Club-Mitgliedern
- Golden Hour (warm, einladend)
- Hochauflösung (1200px+ breit)
- Aktuelle Fotos (dieses Jahr)

FIX: Professionellen Fotografen beauftragen (drehtag), neue Bilder hochladen
```

---

### Sin 5: Keine CTAs oder versteckte CTAs

```
❌ FALSCH:
- CTA-Button ist grau und klein (Ecke unten)
- Text sagt "Mehr" statt "Jetzt anmelden"
- Nur 1 CTA auf ganzer Landing-Page

📊 Resultat: User wissen nicht, was tun, verlassen Seite

✅ RICHTIG:
- CTA ist Primärfarbe (#D4AF37), prominent
- Text ist aktiv ("Jetzt Probemitgliedschaft buchen")
- 3–5 CTAs auf Landing-Page verteilt (Hero, Features, Footer)
- Hover-Effect (Farbe wechselt)

FIX: CTAs Farbe ändern, Text konkretisieren, mehr hinzufügen
```

---

## Section-by-Section Redesign

### Section 1: Hero (First Impression)

**BEFORE (alt):**
```
- Langweiliges Textbild (keine Farbgebung)
- Headline ist zu klein (24px)
- Kein CTA (User weiß nicht, was tun)
- Auf Handy nicht responsive
```

**AFTER (neu):**
```
- Gradient-Background oder Premium-Foto (Golden Hour)
- Headline ist groß + fett (48px, Montserrat Bold)
- Subline ist klar (20px, max 80 Zeichen)
- Großer CTA-Button (Gold #D4AF37, "Probemitgliedschaft buchen")
- Auf Handy: Headline 32px, Button full-width
- Padding 80px oben/unten
```

---

### Section 2: About Us (Wer seid ihr?)

**BEFORE (alt):**
```
- Lange, langsame Text-Blöcke
- Kein Bild (nur Text)
- Keine emotionale Connection
```

**AFTER (neu):**
```
- 1 Short Paragraph (max 150 Worte)
- 1 großes Bild (Foto von Clubmitgliedern, lachend)
- 3 Essence-Worte als Highlights:
  * Elegant
  * Netzwerk
  * Traditionsreich
- Trust-Signals: "Seit 1998", "450+ Member", "Champion Turniere"
```

---

### Section 3: Features (3 Columns)

**BEFORE (alt):**
```
- Text-only (keine Icons)
- 5+ Features nebeneinander (zu viel)
- Keine Struktur
```

**AFTER (neu):**
```
- Headline: "Warum Golfclub Hannover?" (36px)
- 3 Feature-Cards nebeneinander (Desktop), 1 unter anderem (Mobile)
- Jede Card hat:
  * Icon/Emoji (🏌️, 🤝, 🌟)
  * Titel (20px, Bold)
  * 1-2 Sätze (max 50 Worte)
  * Subtler Background (#F5F5F5)
- Padding 30px pro Card, Radius 8px
```

---

### Section 4: Social Proof (Member-Testimonials)

**BEFORE (alt):**
```
- Keine Testimonials (User wissen nicht, ob gut oder schlecht)
```

**AFTER (neu):**
```
- 3–5 echte Member-Quotes mit Foto + Namen
- Format: Foto + Name + Zitat + Kurze Description

Beispiel:
[Foto] Julia Müller, 34, Hannover
"Ich dachte, Golf ist langweilig. Falscher dachte ich. 
Jetzt habe ich 4 neue Freunde und spiele 2x die Woche."

- Zitate in Anführungszeichen
- Fotos sind professionell (Portrait)
- Reales Feedback, kein Generic-Blah
```

---

### Section 5: Membership Options (Preise + Optionen)

**BEFORE (alt):**
```
- Preise sind versteckt oder unklar
- Verschiedene Optionen nicht deutlich
```

**AFTER (neu):**
```
- 3 Membership-Tiers nebeneinander (Cards):
  * Starter (€99/Monat)
  * Premium (€199/Monat)
  * Elite (€399/Monat)
- Jede Card hat:
  * Preis (groß, bold)
  * 3–4 Punkte (✓ Zugang Platz, ✓ Events, ✓ Training)
  * CTA-Button ("Jetzt wählen")
- Premium-Tier: Größer, anders Farbe (Highlight)
- Auf Mobile: Stack vertikal
```

---

### Section 6: Events (Kommende Turniere)

**BEFORE (alt):**
```
- Events sind nicht sichtbar
- Oder: Alte Events, nicht gelöscht
```

**AFTER (neu):**
```
- "Nächste Events" oder "Kalender"-Section
- 3 kommende Events als kleine Cards:
  * Datum + Uhrzeit (z.B. "Sa, 15.9.2026, 14:00")
  * Event-Name (z.B. "Herbst-Meisterschaft")
  * 1-Zeile-Description
  * CTA: "Mehr Info" oder "Anmelden"
- Events sind dynamisch (automatisch aktualisiert, nicht 2015er Events)
```

---

### Section 7: CTA Section (Finale Aufforderung)

**BEFORE (alt):**
```
- Keine finale CTA (User haben keine Dringlichkeit)
```

**AFTER (neu):**
```
- Headline: "Bereit, Teil unserer Community zu werden?"
- Subline: "Starten Sie mit einer kostenfreien Probemitgliedschaft."
- Großer Button: "Jetzt anmelden"
- Background: Gradient (Primärfarbe)
- Padding 60px oben/unten
- Mobil: Full-width Button
```

---

### Section 8: Footer

**BEFORE (alt):**
```
- Footer ist leer oder zeigt nur Copyright
```

**AFTER (neu):**
```
- Link-Struktur:
  * Über uns
  * Mitgliedschaft
  * Events
  * Kontakt
- Social-Media-Icons:
  * Instagram
  * Facebook
  * LinkedIn
- Kontaktdaten:
  * Telefon: +49 511 123456
  * Email: info@golfclub-hannover.de
  * Adresse: Hannoverstraße 1, 30159 Hannover
- Copyright (© 2026)
- Privacy-Policy + Impressum Links
```

---

## Timeline + Kosten-Schätzung

```
OPTION 1: Kleine Fixes (1 Woche, €1,000–1,500)
- Fonts modernisieren (zu 2 wechseln)
- Font-Size erhöhen (12px → 16px)
- CTAs prominent machen
- Mobile-Responsive hinzufügen
- Besitzt bereits: Gutes Fundament

→ Beste für: Websites mit 41–60 Punkt-Score

---

OPTION 2: Moderate Redesign (2–3 Wochen, €2,000–3,500)
- Hero-Section neu
- About-Section optimieren
- Features-Sektion mit Icons
- Membership-Options hinzufügen
- Testimonials einfügen
- Footer aufbauen
- Bilder teilweise neu (nicht kompletter drehtag)

→ Beste für: Websites mit 21–40 Punkt-Score

---

OPTION 3: Kompletter Redesign (3–4 Wochen, €4,000–6,000)
- Alles komplett neu (keine Dateien wiederverwendet)
- Professioneller drehtag (neue Fotos)
- Design-System aufbauen
- Alle Seiten überarbeitet
- Performance optimiert
- SEO überarbeitet

→ Beste für: Websites mit 0–20 Punkt-Score oder sehr alt

---

EXTRA: Professioneller drehtag (€800–1,500)
- 2–3 Stunden
- 3–5 Sets (Member bei Aktivität, Team-Portrait, Platz-Aufnahmen)
- 100+ Photos, beste auswählen
- 3–5 Fotos für Website nutzbar
```

---

## Redesign-Checklist (vor Finalisierung)

```
☐ Audit durchgeführt (15 Punkte, Score bekannt)
☐ Common Sins identifiziert (Fonts, Mobile, Bilder?)
☐ Section-by-Section Plan erstellt
☐ Timeline + Kosten geschätzt
☐ Design-System definiert (Farben, Fonts, Spacing)
☐ Neue Bilder fotografiert (drehtag oder Stock-Photo-Update)
☐ Mobile-Responsive umgesetzt (<768px Breakpoint)
☐ CTAs sind prominent (Gold #D4AF37, aktiver Text)
☐ Accessibility geprüft (Kontrast 4.5:1+, Font 16px+)
☐ SEO-Basics implementiert (Title, Meta-Description, H1)
☐ Analytics installiert (Google Analytics + Konversions-Tracking)
☐ Go-Live + Monitoring (Bounce-Rate, Konversionen)
```

---

*Zuletzt aktualisiert: 23. August 2026*
*Verfasser: Northline Growth — Design Department*
