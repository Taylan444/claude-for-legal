# Northline Growth Skills — Version Tracking

Central changelog for all skills across all 4 departments. Each row mirrors the `metadata.version` in each skill's SKILL.md frontmatter.

**Current Repo Release Version: 1.0.0**

## Marketing Department

| Skill | Version | Status | Last Updated | Notes |
|-------|---------|--------|--------------|-------|
| `meta-ads-campaigns` | 1.0.0 | Stable | 23.08.2026 | Campaign structure, guarantee models, Andromeda algorithm, identity-trigger hacks, bidding strategies, kill-rules |
| `social-media-content` | 1.0.0 | Stable | 23.08.2026 | 3-Säulen-Strategie (60/25/15), Reel-Produktion, Posting-Rhythmen |
| `copywriting-clubs` | 1.0.0 | Stable | 23.08.2026 | Homepage-Copy, Landing Pages, Email-Sequenzen, Tone of Voice |
| `video-production` | 1.0.0 | Stable | 23.08.2026 | Drehtag-Modell (2-3h = 3-5 Reels), Schnitt-Workflow (48h), Reel-Rezepte |
| `cold-email-outreach` | 1.0.0 | Stable | 23.08.2026 | UWG-Compliance, Anruf-Skript, 3-Email-Sequenz, Prospect-Research |
| `content-strategy` | 1.0.0 | Stable | 23.08.2026 | 3-Säulen-Strategie, Jahreskalender, Content-Recycling, Saisonalität |
| `analytics-reporting` | 1.0.0 | Stable | 23.08.2026 | 3-Messquellen-System, Pixel-Setup, Garantie-Messbericht, Wochenreport |

## Social Media Department

| Skill | Version | Status | Last Updated | Notes |
|-------|---------|--------|--------------|-------|
| `voice-builder-clubs` | 1.0.0 | Stable | 23.08.2026 | 4-Fragen-Interview, brand-voice.md Template, Konsistenz-Checklist |
| `hook-generator-clubs` | 1.0.0 | Stable | 23.08.2026 | Hook-Anatomie, 6 Hook-Formeln, konkrete Club-Beispiele |
| `content-matrix-clubs` | 1.0.0 | Stable | 23.08.2026 | 4 Content-Pillars, 8 Formate, 24-32 Ideen/Monat, September-Beispiel |
| `post-formatter-clubs` | 1.0.0 | Stable | 23.08.2026 | 5 Copy-Frameworks (PAS, AIDA, BAB, STAR, SLAY), Mobile-Optimierung |
| `post-graphics-clubs` | 1.0.0 | Stable | 23.08.2026 | AI-Prompt-Struktur, 4 HTML/CSS-Templates, Farb-Codes pro Club-Typ |

## Design Department

| Skill | Version | Status | Last Updated | Notes |
|-------|---------|--------|--------------|-------|
| `brandkit-clubs` | 1.0.0 | Stable | 23.08.2026 | Brand Discovery Interview, brand.md Template, Farbpalette, Logo-Richtung, Photography Style |
| `design-system-clubs` | 1.0.0 | Stable | 23.08.2026 | 4 Core Components (Header, Hero, Features, CTA), Layout-Grid, Responsive Rules, Accessibility |
| `color-palette-generator-clubs` | 1.0.0 | Stable | 23.08.2026 | 5 Palette-Templates, Kontrast-Checker, Club-Typ-Vorlagen (Golf, Tennis, Segel, Fahrschule) |
| `typography-guide-clubs` | 1.0.0 | Stable | 23.08.2026 | Font-Pairing (Montserrat + Inter), Größen-Skala, Mobile-Optimierung, Fallback-Fonts |
| `website-redesign-clubs` | 1.0.0 | Stable | 23.08.2026 | 15-Punkte-Audit-Checklist, Common Sins, Section-by-Section Redesign, Timeline + Kosten |

## Finance Department

| Skill | Version | Status | Last Updated | Notes |
|-------|---------|--------|--------------|-------|
| `budget-tracking-ads` | 1.0.0 | Stable | 23.08.2026 | Daily/Weekly/Monthly Ad-Spend Tracking, Budget-Alerts (80%/100%), CPA-Analysis, Spend-to-Budget Template |
| `freelancer-payments` | 1.0.0 | Stable | 23.08.2026 | Rate-Sheet (Video €500, Ads €600, Social €500, Design €300), Performance-Tracking, Invoice-Template |
| `client-profitability` | 1.0.0 | Stable | 23.08.2026 | Profitabilität-Formel, Kosten-Aufschlüsselung, Break-Even-Analyse, Client-Ranking |
| `cost-calculator` | 1.0.0 | Stable | 23.08.2026 | Startup-Kosten (€1,500-€2,500), Laufende Kosten (€2,150-€3,550), Pricing-Modelle, ROI-Prognose |
| `financial-reporting` | 1.0.0 | Stable | 23.08.2026 | Monatl./Quarterly Report Structure, Einnahmen/Ausgaben Breakdown, Client-Profitabilität, KPIs |

---

## Versioning Rules

- **Repo Release Version** (x.y.z in `plugin.json`, `marketplace.json`, VERSIONS.md headings):
  - **x** = repo-wide changes (restructures, spec changes, breaking changes)
  - **y** = new skill(s) added
  - **z** = updates to existing skills

- **Per-Skill Version** (in `metadata.version` in each SKILL.md):
  - Bump on ANY shipped change to that skill
  - Use SemVer: Major for capability/trigger changes, patch for fixes/clarifications
  - Mirror versions in this VERSIONS.md table

## Deployment Checklist (before bumping versions)

- [ ] All skills have YAML frontmatter with `name`, `description`, `metadata.version`
- [ ] Directory names match skill `name` field exactly (lowercase, alphanumeric + hyphens)
- [ ] All descriptions include context about when/where to use the skill
- [ ] SKILL.md files are under 500 lines (references/ subdirectory for details)
- [ ] No sensitive data or credentials in any skill
- [ ] All club-type examples (Golf, Tennis, Segel, Fahrschule) are current and realistic
- [ ] Freelancer rates, costs, pricing models reflect current business reality
- [ ] Department READMEs link correctly to all skills
- [ ] Git commit message follows Conventional Commits (feat:, fix:, docs:, refactor:)
- [ ] PR includes updated VERSIONS.md when versions bump

---

*Zuletzt aktualisiert: 23. August 2026*  
*Repo Release: 1.0.0 — Complete*
