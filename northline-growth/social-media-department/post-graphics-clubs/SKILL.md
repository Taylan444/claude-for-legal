---
name: post-graphics-clubs
description: "Generiere AI-Bild-Prompts für Club-Post-Grafiken — oder erstelle einfache HTML-Grafiken mit Frameworks, Listen, Vergleichen."
metadata:
  version: 1.0.0
  product: Northline Growth
  department: Social Media Department
---

# Post Graphics für Clubs

Deine Aufgabe: Zu jedem Post ein **passende Grafik** liefern — entweder:
1. **AI-Bild-Prompt** (Grundlagen + Best Practices)
2. **HTML/CSS-Grafik** (für Frameworks, Listen, Vergleiche)

---

## Wann welches Format?

### AI-Bilder (Gemini, Midjourney, etc.)

**Nutze AI-Bilder für:**
- Community-Vibes (Leute spielen, lachen, feiern)
- Transformationen (Before/After)
- Ästhetische Inspiration (Natur, Sonnenuntergang, Abenteuer)
- Emotionale Momente (Freude, Motivation)

**Nutze KEINE AI für:**
- Real People (zu fake, wirkt creepy)
- Club-spezifische Infos (Namen, Daten, Zahlen)
- Technik (Diagramme, Frames, Listen)

### HTML/CSS-Grafiken

**Nutze HTML für:**
- Frameworks (PAS, AIDA, BAB strukturiert darstellen)
- Listen (5 Tipps, 3 Schritte, etc.)
- Vergleiche (Before/After Tabelle)
- Daten/Zahlen (Statistiken, Ranglisten)
- Text mit Structure (Zentrales Zitat + Kontext)

---

## AI-Bild-Prompts (Northline Template)

### Prompt-Struktur

```
[SCENE] 
[PEOPLE/EMOTION] 
[STYLE/MOOD]
[DETAILS]
[QUALITY]
```

### Konkrete Beispiele

#### Prompt 1: Community-Vibe (Golfclub)
```
A group of businessmen and businesswomen in their 40s, laughing 
on a beautiful golf course at golden hour. 
They're holding golf clubs and champagne glasses, 
celebrating together like friends, not competitors.
Shot from behind the group, looking at the fairway.
Warm, sophisticated, inviting.
Ultra high-quality photography, natural light, professional photography.
```

#### Prompt 2: Transformation (Tennis)
```
Split screen:
Left: Young tennis player, frustrated, holding racket incorrectly, sun going down
Right: Same player, weeks later, serving confidently, sun rising, smile
Clear progress and confidence visible.
Vibrant, motivational mood.
Ultra high-quality, clean, professional sports photography.
```

#### Prompt 3: Adventure (Segelclub)
```
A person's first time sailing.
Blue water, white sail catching wind,
Golden hour light, wind-blown hair, pure joy on face.
Shot from the water level, looking up at sail and sky.
Adventurous, romantic, inviting.
Ultra high-quality photography, cinematic, 4K.
```

#### Prompt 4: Triumph (Fahrschule)
```
Young person, 17–18 years old, holding driving license certificate,
standing next to a car, genuine smile, proud family in background.
Sunlit, warm, celebratory.
Real photography style, not AI-looking.
Ultra high-quality portrait photography.
```

### Prompt-Best-Practices

**DO:**
- ✅ Beschreib Emotion („genuine smile", „proud")
- ✅ Nenn Alter/Typ („businesswomen in their 40s")
- ✅ Szenerie konkret („golf course at golden hour")
- ✅ Camera-Winkel („shot from behind")
- ✅ Qualität hoch („ultra high-quality photography")
- ✅ Szenario klar (nicht: „happy people", sondern: „two friends celebrating after tennis match")

**DON'T:**
- ❌ Real people beim Namen nennen (Datenschutz)
- ❌ Zu viele Details (Tool wird verwirrt)
- ❌ Negative Szenarien (AI kann sie falsch interpretieren)
- ❌ Text im Bild (AI schreibt fehlerhaft)
- ❌ Zu nisch („German golfclub specifically" = nicht trainiert)

---

## HTML/CSS-Grafiken (Einfache Templates)

### Template 1: Framework-Visualisierung (PAS)

```html
<div style="
  max-width: 600px;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  text-align: center;
  font-family: Arial, sans-serif;
  color: white;
">
  <h2 style="font-size: 24px; margin: 20px 0; font-weight: bold;">
    Dein Serve?
  </h2>
  
  <div style="
    background: rgba(255,255,255,0.2);
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
  ">
    <p style="font-size: 18px; font-weight: bold;">❌ Problem</p>
    <p style="font-size: 16px;">Zu viel Kraft, keine Kontrolle</p>
  </div>

  <div style="
    background: rgba(255,255,255,0.2);
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
  ">
    <p style="font-size: 18px; font-weight: bold;">✅ Solution</p>
    <p style="font-size: 16px;">Technik zuerst, Kraft später</p>
  </div>

  <p style="font-size: 14px; margin-top: 30px; opacity: 0.9;">
    So machen es die Profis
  </p>
</div>
```

### Template 2: 3-Schritte-Liste

```html
<div style="
  max-width: 600px;
  padding: 40px;
  background: #f8f9fa;
  border-left: 5px solid #667eea;
  border-radius: 8px;
  font-family: Arial, sans-serif;
">
  <h2 style="text-align: center; color: #333; margin-bottom: 30px;">
    Dein Weg zum besseren Serve
  </h2>

  <div style="margin: 20px 0;">
    <div style="
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    ">
      <div style="
        width: 40px;
        height: 40px;
        background: #667eea;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-right: 15px;
      ">1</div>
      <div>
        <p style="margin: 0; font-weight: bold; color: #333;">Grip überprüfen</p>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
          Nicht locker, nicht fest. Wie ein Handshake.
        </p>
      </div>
    </div>

    <div style="
      display: flex;
      align-items: center;
      margin-bottom: 15px;
    ">
      <div style="
        width: 40px;
        height: 40px;
        background: #667eea;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-right: 15px;
      ">2</div>
      <div>
        <p style="margin: 0; font-weight: bold; color: #333;">Technik trainieren</p>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
          10 Serves täglich, richtig. Nicht 100 falsch.
        </p>
      </div>
    </div>

    <div style="
      display: flex;
      align-items: center;
    ">
      <div style="
        width: 40px;
        height: 40px;
        background: #667eea;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        margin-right: 15px;
      ">3</div>
      <div>
        <p style="margin: 0; font-weight: bold; color: #333;">Kraft hinzufügen</p>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
          Nach 4 Wochen: Dann kannst du schneller spielen.
        </p>
      </div>
    </div>
  </div>

  <div style="
    text-align: center;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
  ">
    <p style="color: #667eea; font-weight: bold; margin: 0;">
      Versuch diese Woche. Sag uns, was besser wird.
    </p>
  </div>
</div>
```

### Template 3: Before/After Vergleich

```html
<div style="
  max-width: 600px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 8px;
  font-family: Arial, sans-serif;
">
  <div style="
    background: #ff6b6b;
    color: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
  ">
    <p style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">❌ Before</p>
    <p style="font-size: 14px; margin: 0;">Allein in der Stadt</p>
    <p style="font-size: 14px; margin: 5px 0 0 0;">Kein Hobby</p>
    <p style="font-size: 14px; margin: 5px 0 0 0;">Depressiv</p>
  </div>

  <div style="
    background: #51cf66;
    color: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
  ">
    <p style="font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">✅ After</p>
    <p style="font-size: 14px; margin: 0;">Beste Freundesgruppe</p>
    <p style="font-size: 14px; margin: 5px 0 0 0;">Segelt 2x/Woche</p>
    <p style="font-size: 14px; margin: 5px 0 0 0;">Glücklich</p>
  </div>

  <div style="
    grid-column: 1 / -1;
    background: white;
    padding: 20px;
    border-radius: 8px;
    border: 2px solid #667eea;
    text-align: center;
  ">
    <p style="color: #667eea; font-weight: bold; margin: 0;">
      Der Unterschied? Sie traute sich.
    </p>
  </div>
</div>
```

### Template 4: Zitat + Kontext

```html
<div style="
  max-width: 600px;
  padding: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  text-align: center;
  font-family: Georgia, serif;
  color: white;
">
  <p style="
    font-size: 28px;
    font-weight: bold;
    margin: 0 0 20px 0;
    line-height: 1.4;
  ">
    „Ich dachte, Golf ist langweilig.<br/>Falscher dachte ich."
  </p>

  <p style="
    font-size: 18px;
    margin: 0 0 20px 0;
    opacity: 0.9;
  ">
    — Julia, 34, Hannover
  </p>

  <p style="
    font-size: 14px;
    opacity: 0.8;
    margin: 0;
  ">
    6 Wochen Mitglied. 4 neue Freund:innen. Süchtig nach Golf.
  </p>
</div>
```

---

## Workflow (Grafik zu jedem Post)

1. **Post-Type checken** (Community-Vibe, Tipps, Erfolgsgeschichte?)
2. **Format wählen** (AI-Bild oder HTML?)
3. **Content ausfüllen** (Text, Farben, Zahlen)
4. **Screenshot oder Download** (als PNG für Instagram)
5. **Zum Post hinzufügen** (oben oder unten)

**TOTAL: 5–10 Minuten pro Grafik**

---

## Farb-Codes (für HTML-Templates)

**Northline Club Standard:**
```
Primary Blue: #667eea
Secondary Purple: #764ba2
Success Green: #51cf66
Error Red: #ff6b6b
Light Background: #f8f9fa
Dark Text: #333333
```

**Diese Farben in HTML-Templates verwenden** → konsistenter Look über alle Posts.

---

## Häufige Fehler

| Fehler | Folge | Fix |
|--------|-------|-----|
| AI-Bild zu generic (könnte jeder Club sein) | Keine Differenzierung | Club-Details in Prompt: „Golfclub Hannover"-vibe, Businesspeople, etc. |
| HTML sieht schlecht auf Handy aus | Unlesbar | Breite auf max-width: 600px limitieren, Responsive Fonts |
| Zu viele Details in Grafik | Überladen, ablenkend | Max 3 Textzeilen oder 3 Punkte pro Grafik |
| Text zu klein | Unlesbar auf Instagram | Minimum 16px, besser 18px+ |
| Kein Brand-Konsistenz | Wirkt zufällig | Immer gleiche Farben nutzen (Northline Blue/Purple) |

---

## Tools (optional)

- **AI-Bilder:** Gemini 2.5, Midjourney, DALL-E
- **HTML-Grafiken:** Canva (für Vorschau), oder direkt HTML kopieren → Screenshot
- **Screenshot-Tool:** Chrome DevTools (Right-Click → Inspect → Screenshot), oder Canva

---

## Checkliste

```
☐ Grafik hat Kontrast (Farben lesbar?)
☐ Text ist > 16px (Handy-lesbar?)
☐ Breite ist max 600px (Responsive?)
☐ Farben sind Northline-Standard (Konsistenz?)
☐ Keine 100 Details (Clean & fokussiert?)
☐ Call-to-Action sichtbar (wenn relevant)
☐ PNG/JPG Format (für Instagram)
```

---

*Zuletzt aktualisiert: 23. August 2026*
*Verfasser: Northline Growth — Social Media Department*
