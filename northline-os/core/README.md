# @northline/core

Der Kern von Northline OS: **der eine Schreibpfad**, durch den jeder
Eingangskanal läuft. Chat, Voice und Formular unterscheiden sich ausschließlich
im Adapter davor — ab `handleInboundRequest()` gibt es genau eine Logik.

Architekturbegründung: [`../ARCHITECTURE-AUDIT.md`](../ARCHITECTURE-AUDIT.md),
Abschnitt F.

## Tests ausführen

```bash
cd northline-os/core
npm test
```

Es gibt **nichts zu installieren**. Node 22 führt TypeScript nativ aus, und der
Kern hat null Laufzeit- und null Entwicklungsabhängigkeiten. Das ist kein
Selbstzweck: keine Abhängigkeit bedeutet keine Lieferketten-Angriffsfläche,
keine Versionspflege und Tests, die in jeder Umgebung sofort laufen.

Stand: **58 Tests, alle grün.**

## Aufbau

```
db/schema.sql              Postgres-Schema inkl. Row-Level-Security
src/types.ts               Einheitliches Anfrage-Modell, Mandanten-Konfiguration
src/ports.ts               Schnittstellen: Store, Tx, Clock, Delivery, …
src/time.ts                Zeitzonen und Sommerzeit, ohne Bibliothek
src/normalize.ts           Freitext → geprüfte Felder (E.164, E-Mail, Anzahl)
src/rules.ts               Pflichtfelder, Öffnungszeiten, Eskalation, Status
src/events.ts              Welche Anfrage welches Event auslöst
src/handleInboundRequest.ts  DER Schreibpfad
src/dispatcher.ts          Outbox: Retry, Backoff, Dead Letter
src/adapters/inbound.ts    Kanal-Adapter (Formular, Chat, Voice)
src/adapters/memory.ts     In-Memory-Adapter für Tests und lokale Entwicklung
```

Der Kern kennt weder Postgres noch einen E-Mail- oder Voice-Anbieter. Er kennt
die Interfaces in `ports.ts`. Deshalb ist er vollständig ohne Datenbank und ohne
Netzwerk testbar — und deshalb betrifft ein Anbieterwechsel später eine Datei
statt ein Projekt.

## Die Entscheidungen, die im Code stecken

**Ein Schreibpfad.** Kanäle sind Adapter, keine Parallelwelten. Was einmal
geprüft wird, gilt überall.

**Transaktion erzwungen, nicht empfohlen.** `insertRequest` und `appendEvents`
liegen beide auf `Tx`. Es gibt keinen Weg, eine Reservierung zu speichern, ohne
ihr Event im selben Zug zu schreiben. Ein Test lässt den Speicher gezielt
scheitern und prüft, dass nichts Halbes zurückbleibt.

**Unvollständige Anfragen werden gespeichert.** `needs_info` ist ein Zustand,
kein Abbruch. Was ein Gast gesagt hat, geht nicht verloren, nur weil noch eine
Telefonnummer fehlt — es löst nur noch keine Benachrichtigung aus.

**Große Gruppen werden eskaliert, nicht abgelehnt.** Eine Tischgesellschaft von
zwanzig Personen ist ein guter Kunde, über den ein Mensch entscheiden soll.

**Wer nach einem Menschen fragt, wird nicht weiter ausgefragt.** Eskalation auf
ausdrücklichen Wunsch und bei Beschwerden schlägt jede Pflichtfeldabfrage.

**Sommerzeit wird geprüft, nicht angenommen.** `19:30 Berlin` sind im Juli
17:30 UTC und im Januar 18:30 UTC. Ohne diese Umrechnung landen Reservierungen
im Winter eine Stunde daneben, und niemand merkt es bis zum Livegang.

## Was geprüft ist

Die 58 Tests decken die Szenarien aus Abschnitt 20 des Master-Prompts ab:
normale Reservierung · fehlender Name · fehlende Telefonnummer · unbrauchbare
Telefonnummer · unklares Datum · Ruhetag · Schließtag · Uhrzeit außerhalb der
Öffnungszeiten · Vergangenheit · unterschrittene Vorlaufzeit · zu weit im Voraus
· große Gruppe · Allergien · vegan/glutenfrei · Eskalation auf Wunsch ·
Beschwerde · unsichere Extraktion · Stornierung · Stornierung einer unbekannten
Anfrage · mandantenübergreifender Zugriffsversuch · doppelter Webhook ·
Schlüsselkollision · Speicherausfall · unbekannter Mandant · Ausfall des
E-Mail-Anbieters · Dead Letter · Zeitzonen und Zeitumstellung.

## Was noch fehlt — ausdrücklich

Damit hier nichts als fertig gilt, was es nicht ist:

| Fehlt | Warum / was als Nächstes |
|---|---|
| **Postgres-Adapter** | `db/schema.sql` steht, die Implementierung von `Store` gegen eine echte Datenbank nicht. Ohne bereitgestellte Datenbank ist sie nicht verifizierbar — und ungetestet würde ich sie nicht als fertig ausgeben. |
| **HTTP-Schicht** | Die Route-Handler (`/api/v1/chat`, `/api/v1/intake`, Voice-Webhook) fehlen. Sie sind dünn — Signaturprüfung, Rate-Limit, Aufruf des Kerns —, brauchen aber die Anwendungsumgebung. |
| **Signaturprüfung des Voice-Webhooks** | Gehört in die HTTP-Schicht. Der Idempotenzschlüssel dafür wird hier bereits erzeugt und ist getestet. |
| **Voice-Payload verifiziert** | `fromVoice()` ist defensiv gegen mehrere plausible Hüllen gebaut, aber **nicht gegen einen echten Anruf geprüft**. Vor dem Livegang muss ein Testanruf mitgeschnitten und der Adapter dagegen validiert werden. |
| **NotificationService** | Die Zustellseite (`DeliveryPort`) ist definiert und der Dispatcher getestet; die konkrete E-Mail-Anbindung samt mandantenfähiger Templates fehlt. |
| **Knowledge Base / Agent-Schicht** | Kein Retrieval, kein Prompt, keine Halluzinationsgrenze. Der Kern nimmt entgegen, was ein Agent extrahiert hat — den Agenten selbst gibt es noch nicht. |
| **Rufnummern außerhalb DACH** | `normalizePhone` normalisiert das Format, prüft aber keine landesspezifischen Nummernpläne. Beim ersten Mandanten außerhalb des DACH-Raums gehört hier libphonenumber hin. |
| **Anfragen ändern** | Stornieren ist implementiert, Umbuchen nicht. |

## Nächster Schritt

Postgres in EU-Region bereitstellen, `db/schema.sql` einspielen und den
`Store`-Adapter dagegen implementieren — mit Integrationstests gegen eine echte
Datenbank, insbesondere für Row-Level-Security. Danach die HTTP-Schicht.

Dafür wird eine Datenbankinstanz benötigt; das ist eine Entscheidung mit
laufenden Kosten und daher keine, die ich allein treffe.
