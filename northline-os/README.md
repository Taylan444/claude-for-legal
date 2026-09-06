# northline-os/

Dieses Verzeichnis gehört **nicht** zum Legal-Plugin-Marketplace in diesem
Repository. Es enthält Northline OS und liegt auf dem Branch
`claude/northline-os-architecture-ycil3a`, weil für dieses Vorhaben noch kein
eigenes Repository existiert.

**Vor einem Merge nach `main` prüfen:** Dieser Ordner sollte in ein eigenes
Northline-Repository umziehen. Er hat keine Beziehung zu
`.claude-plugin/marketplace.json` und wird von den Validierungs-Skripten in
`scripts/` nicht erfasst.

## Inhalt

- [`ARCHITECTURE-AUDIT.md`](./ARCHITECTURE-AUDIT.md) — Audit und Zielarchitektur
  (Abschnitte A–I des Master-Prompts). Abschnitt F ist der Bauplan.
- [`core/`](./core/README.md) — der Kern: der eine Schreibpfad, durch den jeder
  Eingangskanal läuft. Postgres-Schema mit Row-Level-Security, Regelwerk,
  Outbox-Dispatcher, Kanal-Adapter. 58 Tests.

## Schnellstart

```bash
cd core
npm test
```

Nichts zu installieren — Node 22 führt TypeScript nativ aus, und der Kern hat
keine Abhängigkeiten.
