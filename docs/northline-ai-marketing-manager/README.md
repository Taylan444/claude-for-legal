# Northline AI Marketing Manager — Phase 0

Ergebnis der Anforderungs- und Architekturanalyse. **Noch keine Implementierung.**

| Dokument | Inhalt |
| --- | --- |
| [00-analyse.md](./00-analyse.md) | Befund, offene Fragen, Risiken, fehlende Anforderungen, Scope-Cuts, Datenschutz |
| [01-architektur.md](./01-architektur.md) | Architekturvorschlag + Entscheidungen D1–D13 (Option A / Option B / Empfehlung) |
| [02-datenmodell.md](./02-datenmodell.md) | Datenmodell inkl. Mandantentrennung und KPI-Speicherlogik |
| [03-ordnerstruktur.md](./03-ordnerstruktur.md) | Geplante Verzeichnisstruktur |
| [04-implementierungsplan.md](./04-implementierungsplan.md) | Milestones M0–M10 mit Definition of Done |
| [05-offene-entscheidungen.md](./05-offene-entscheidungen.md) | Was ich von dir brauche, bevor Coding beginnt |

## Status

Phase 0 abgeschlossen. Die strukturellen Entscheidungen E1–E4 sind getroffen:
eigenes privates Repository, Vercel EU + Managed Postgres in der EU, SSO über
Google Workspace / Microsoft 365, keine personenbezogenen Leaddaten im System.
Details in `05-offene-entscheidungen.md`.

Implementierung startet nach Freigabe ("START MVP") mit Milestone M0.

## Hinweis zum Ablageort

Diese Dokumente liegen aktuell im Repository `claude-for-legal`, weil die Session
darauf gescopt ist. `claude-for-legal` ist ein Claude-Code-Plugin-Marketplace und
enthält keinen Applikationscode. Der Produktcode des Northline AI Marketing
Managers gehört in ein eigenes Repository — siehe Entscheidung **D1**.
