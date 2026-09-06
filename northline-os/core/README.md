# @northline/core

Der Kern von Northline OS: **der eine Schreibpfad**, durch den jeder
Eingangskanal läuft, und die Zustellschicht dahinter. Chat, Voice und Formular
unterscheiden sich ausschließlich im Adapter davor — ab
`handleInboundRequest()` gibt es genau eine Logik.

Architekturbegründung: [`../ARCHITECTURE-AUDIT.md`](../ARCHITECTURE-AUDIT.md),
Abschnitt F.

## Ausführen

```bash
cd northline-os/core
npm test        # 78 Tests, ohne Installation lauffähig
npm run check   # zusätzlich Typprüfung (benötigt einmal npm install)
```

Der Kern hat **null Laufzeitabhängigkeiten**. Node 22 führt TypeScript direkt
aus, deshalb braucht `npm test` keine Installation.

Zwei Entwicklungsabhängigkeiten gibt es: `typescript` und `@types/node`, allein
für `npm run typecheck`. Die sind nicht optional im Sinne von verzichtbar —
Node *strippt* Typen nur, es prüft sie nicht. Ohne Typechecker bleiben
Typfehler in einem TypeScript-Projekt unbemerkt, bis sie zur Laufzeit
auffallen. Der erste Lauf hat prompt einen echten Fehler gefunden.

## Aufbau

```
db/schema.sql                    Postgres-Schema inkl. Row-Level-Security
src/types.ts                     Anfrage-Modell, Mandanten-Konfiguration
src/ports.ts                     Schnittstellen: Store, Tx, Email, Http, …
src/time.ts                      Zeitzonen und Sommerzeit, ohne Bibliothek
src/normalize.ts                 Freitext → geprüfte Felder (E.164, E-Mail)
src/rules.ts                     Pflichtfelder, Öffnungszeiten, Eskalation
src/events.ts                    Welche Anfrage welches Event auslöst
src/handleInboundRequest.ts      DER Schreibpfad
src/dispatcher.ts                Outbox: Retry, Backoff, Dead Letter
src/notifications/templates.ts   E-Mail-Vorlagen, mandantenfähig, de/en
src/notifications/NotificationService.ts   Die zentrale Benachrichtigungsschicht
src/notifications/providers.ts   EmailProvider: Memory + Resend
src/delivery/webhook.ts          Signierte Webhooks (HMAC), Signaturprüfung
src/delivery/EventDelivery.ts    Event → Gast, Betrieb, Make
src/adapters/inbound.ts          Kanal-Adapter (Formular, Chat, Voice)
src/adapters/memory.ts           In-Memory-Adapter für Tests
```

Der Kern kennt weder Postgres noch einen E-Mail- oder Voice-Anbieter. Er kennt
die Interfaces in `ports.ts`. Deshalb ist er vollständig ohne Datenbank und ohne
Netzwerk testbar — und deshalb betrifft ein Anbieterwechsel eine Datei statt ein
Projekt.

## Die Entscheidungen, die im Code stecken

**Ein Schreibpfad.** Kanäle sind Adapter, keine Parallelwelten. Ein Test belegt
es: derselbe Vorgang über Voice und über Chat erzeugt identische Anfragen, nur
das Feld `channel` unterscheidet sich.

**Transaktion erzwungen, nicht empfohlen.** `insertRequest` und `appendEvents`
liegen beide auf `Tx`. Es gibt keinen Weg, eine Reservierung zu speichern, ohne
ihr Event im selben Zug zu schreiben.

**Wiederholung belästigt den Gast nicht.** Ein Event hat mehrere Ziele — Gast,
Betrieb, Make. Scheitert nur der Webhook, wiederholt der Dispatcher das ganze
Event. Jedes Ziel wird deshalb einzeln protokolliert und übersprungen, wenn es
schon zugestellt war. Das ist der Unterschied zwischen „Wiederholung ist sicher"
und „Wiederholung schickt dem Gast die vierte Bestätigung".

**Das System sagt nichts zu, was niemand zugesagt hat.** Die Gastnachricht
lautet „Ihre Anfrage ist eingegangen", nie „Ihr Tisch ist reserviert".
Bestätigen kann nur der Betrieb. Ein Test prüft die Formulierung, weil der
Fehlerfall darin besteht, dass jemand vor einer vollen Gaststube steht.

**Bei einer Eskalation schreibt ein Mensch.** Wer sich beschwert oder um
Rückruf bittet, bekommt keine automatische Mail.

**Secrets stehen nicht in der Konfiguration.** `OutboundWebhook.secretRef` ist
eine Referenz; aufgelöst wird sie zur Laufzeit über den `SecretResolver`. Die
Mandantenkonfiguration liegt in der Datenbank — Secrets gehören dort nicht hin.
Lässt sich eine Referenz nicht auflösen, scheitert die Zustellung, statt
unsigniert zu senden.

**Unvollständige Anfragen werden gespeichert.** `needs_info` ist ein Zustand,
kein Abbruch. Was ein Gast gesagt hat, geht nicht verloren, nur weil noch eine
Telefonnummer fehlt — es löst nur noch keine Benachrichtigung aus.

**Große Gruppen werden eskaliert, nicht abgelehnt.** Zwanzig Personen sind ein
guter Kunde, über den ein Mensch entscheiden soll.

**Sommerzeit wird geprüft, nicht angenommen.** `19:30 Berlin` sind im Juli
17:30 UTC und im Januar 18:30 UTC.

## Was geprüft ist

78 Tests, alle grün. Sie decken die Szenarien aus Abschnitt 20 des
Master-Prompts ab, Happy Paths wie Failure Paths:

*Intake* — normale Reservierung · fehlender Name · fehlende oder unbrauchbare
Telefonnummer · unklares Datum · Ruhetag · Schließtag · Uhrzeit außerhalb der
Öffnungszeiten · Vergangenheit · unterschrittene Vorlaufzeit · zu weit im
Voraus · große Gruppe · Allergien · vegan/glutenfrei · Eskalation auf Wunsch ·
Beschwerde · unsichere Extraktion · Stornierung · Stornierung einer unbekannten
Anfrage · mandantenübergreifender Zugriffsversuch.

*Robustheit* — doppelter Webhook · Idempotenzschlüssel mit abweichendem Inhalt ·
Speicherausfall ohne halben Zustand · unbekannter Mandant · Ausfall des
E-Mail-Anbieters · Dead Letter · Zeitzonen und beide Zeitumstellungen.

*Zustellung* — Ende zu Ende von der Chat-Anfrage bis zu Gast, Betrieb und Make ·
Webhook-Signatur gültig, bei veränderter Nutzlast ungültig, nach Ablauf
abgewiesen · **Wiederholung nach Teilfehler ohne zweite Gastnachricht** ·
fehlendes Secret · Eskalation ohne Gastnachricht · abgeschaltete Gastnachricht ·
Event-Abonnements je Webhook.

## Was noch fehlt — ausdrücklich

| Fehlt | Warum / was als Nächstes |
|---|---|
| **Postgres-Adapter** | `db/schema.sql` steht, die Implementierung von `Store`, `OutboxStore` und `DeliveryLog` gegen eine echte Datenbank nicht. Ohne bereitgestellte Datenbank nicht verifizierbar — und ungetestet gebe ich sie nicht als fertig aus. Insbesondere Row-Level-Security braucht Integrationstests: eine ungeprüfte Sicherheitsregel ist keine. |
| **HTTP-Schicht** | Route-Handler (`/api/v1/chat`, `/api/v1/intake`, Voice-Webhook), Rate-Limiting, Tenant-Auflösung über Domain. Die Signaturprüfung für eingehende Webhooks liegt als `verifySignature()` bereits getestet vor. |
| **Resend verifiziert** | `ResendEmailProvider` ist nach bestem Wissen gebaut, aber **ohne Zugangsdaten nicht gegen die echte API geprüft**. Der getestete Weg ist `MemoryEmailProvider`. |
| **Voice-Payload verifiziert** | `fromVoice()` ist defensiv gebaut, aber **nicht gegen einen echten Anruf geprüft**. Vor dem Livegang Testanruf mitschneiden und dagegen validieren. |
| **Agent- und Knowledge-Schicht** | Kein Retrieval, kein Prompt, keine Halluzinationsgrenze. Der Kern nimmt entgegen, was ein Agent extrahiert hat — den Agenten gibt es noch nicht. |
| **Nachfassen (`sendFollowUp`)** | Braucht einen zeitlichen Auslöser, den es noch nicht gibt. Eine Methode, die niemand aufruft, wäre toter Code in einem Produktionspfad. |
| **Umbuchen** | Stornieren ist implementiert, Ändern nicht. |
| **Rufnummern außerhalb DACH** | `normalizePhone` normalisiert das Format, prüft keine landesspezifischen Nummernpläne. Beim ersten Mandanten außerhalb DACH gehört hier libphonenumber hin. |

## Nächster Schritt

Postgres in EU-Region bereitstellen, `db/schema.sql` einspielen und die
Speicher-Adapter dagegen implementieren — mit Integrationstests, besonders für
Row-Level-Security. Danach die HTTP-Schicht.

Dafür wird eine Datenbankinstanz benötigt: laufende Kosten und ein Account, also
keine Entscheidung, die im Code getroffen wird.
