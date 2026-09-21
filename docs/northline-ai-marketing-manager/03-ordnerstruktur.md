# 03 — Geplante Ordnerstruktur

```
northline-ai-marketing-manager/
├── README.md
├── CLAUDE.md                      # Konventionen für künftige AI-/Entwicklerarbeit
├── .env.example                   # nur Namen, niemals Werte
├── package.json
├── tsconfig.json                  # strict: true, noUncheckedIndexedAccess: true
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── docker-compose.yml             # lokale Postgres + MinIO
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                    # Demo-Kunde, deutlich als Mock markiert
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── sign-in/page.tsx
│   │   ├── (app)/                 # geschützter Bereich, Layout prüft Session
│   │   │   ├── layout.tsx         # Sidebar-Navigation
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [clientId]/
│   │   │   │       ├── layout.tsx         # lädt Kunde, setzt Kontext, prüft Zugriff
│   │   │   │       ├── page.tsx           # Overview
│   │   │   │       ├── brand-brain/
│   │   │   │       ├── strategy/
│   │   │   │       ├── creatives/
│   │   │   │       ├── campaigns/
│   │   │   │       ├── analytics/
│   │   │   │       ├── recommendations/
│   │   │   │       └── assets/
│   │   │   ├── strategy/page.tsx          # kundenübergreifende Listen
│   │   │   ├── creative-studio/page.tsx
│   │   │   ├── campaigns/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── recommendations/page.tsx
│   │   │   ├── knowledge/
│   │   │   └── settings/
│   │   │       ├── users/
│   │   │       ├── ai/                    # Modellwahl, Kostenübersicht
│   │   │       └── data/                  # Export & Löschung pro Kunde
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── uploads/route.ts           # signierte Upload-URLs
│   │   │   └── exports/[clientId]/route.ts
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                    # shadcn/ui — unverändert generiert
│   │   ├── layout/                # AppSidebar, Topbar, ClientSwitcher
│   │   ├── data/                  # DataTable, EmptyState, ErrorState, LoadingState
│   │   ├── charts/                # LineChart, BarChart, FunnelChart, KpiTile
│   │   ├── ai/                    # GenerationPanel, StreamingOutput, DiffEditor
│   │   └── common/                # MockDataBadge, SourceBadge, ConfirmDialog
│   │
│   ├── server/
│   │   ├── auth/                  # Auth.js-Konfiguration, requireUser(), requireAdmin()
│   │   ├── db/
│   │   │   ├── client.ts          # einzige Prisma-Instanz
│   │   │   └── repositories/      # EINZIGER Ort mit direktem Prisma-Zugriff
│   │   │       ├── _guard.ts      # assertClientAccess(), withClient()
│   │   │       ├── clients.repo.ts
│   │   │       ├── brandBrain.repo.ts
│   │   │       ├── strategies.repo.ts
│   │   │       ├── creatives.repo.ts
│   │   │       ├── campaigns.repo.ts
│   │   │       ├── metrics.repo.ts
│   │   │       ├── recommendations.repo.ts
│   │   │       ├── knowledge.repo.ts
│   │   │       └── audit.repo.ts
│   │   ├── modules/               # Geschäftslogik, framework-unabhängig
│   │   │   ├── clients/
│   │   │   ├── brandbrain/
│   │   │   ├── strategy/
│   │   │   ├── creatives/
│   │   │   ├── campaigns/
│   │   │   ├── metrics/
│   │   │   │   ├── kpi.ts         # alle abgeleiteten Kennzahlen, rein & getestet
│   │   │   │   ├── aggregate.ts   # Zeitreihen, Vergleiche, Funnel
│   │   │   │   └── import/
│   │   │   │       ├── parseMetaCsv.ts
│   │   │   │       ├── mapping.ts # Zuordnung Export-Zeile → interne Entität
│   │   │   │       └── commit.ts
│   │   │   ├── recommendations/
│   │   │   ├── knowledge/
│   │   │   └── audit/
│   │   ├── ai/
│   │   │   ├── provider/
│   │   │   │   ├── types.ts       # LlmProvider-Interface
│   │   │   │   ├── anthropic.ts
│   │   │   │   └── index.ts       # Auswahl per Konfiguration
│   │   │   ├── prompts/
│   │   │   │   ├── definePrompt.ts
│   │   │   │   ├── strategy.ts
│   │   │   │   ├── creative.ts
│   │   │   │   ├── analytics.ts
│   │   │   │   └── optimization.ts
│   │   │   ├── context/
│   │   │   │   ├── buildClientContext.ts   # einzige Quelle für Kundenkontext
│   │   │   │   └── retrieveKnowledge.ts
│   │   │   ├── workflows/
│   │   │   │   ├── generateStrategy.ts
│   │   │   │   ├── generateCreatives.ts
│   │   │   │   ├── generateCreativeBrief.ts
│   │   │   │   ├── analyzeCampaign.ts
│   │   │   │   └── generateRecommendations.ts
│   │   │   ├── validation/        # Schema- und Evidence-Prüfung der Outputs
│   │   │   └── usage.ts           # Token-/Kostenerfassung, Rate Limits
│   │   ├── actions/               # Server Actions, dünn: Auth → Zod → Modul → Audit
│   │   ├── storage/               # S3-Client, signierte URLs, Pfadschema
│   │   └── integrations/
│   │       └── meta/              # ab M9, read-only
│   │           ├── client.ts
│   │           ├── mapInsights.ts
│   │           └── types.ts
│   │
│   └── lib/
│       ├── validation/            # gemeinsame Zod-Schemata
│       ├── format/                # Währung, Prozent, Datum (de-DE)
│       ├── errors.ts              # AppError, NotFound, Forbidden
│       └── config.ts              # geprüfte Umgebungsvariablen (Zod)
│
├── tests/
│   ├── unit/                      # kpi, parser, context-builder, validierung
│   ├── isolation/                 # Cross-Tenant-Leak-Tests
│   └── e2e/                       # Playwright: Kunde anlegen → Strategie → Creative
│
└── docs/
    ├── architecture.md
    ├── data-model.md
    ├── decisions/                 # ADRs, fortlaufend nummeriert
    ├── prompts.md                 # Prompt-Versionen und Änderungsgründe
    └── runbook.md                 # Deployment, Backup/Restore, Incident
```

## Durchgesetzte Grenzen

| Regel | Durchsetzung |
| --- | --- |
| Kein Prisma-Zugriff außerhalb `server/db/repositories/` | ESLint `no-restricted-imports` |
| Kein Import aus `server/` in Client-Komponenten | `import 'server-only'` in `server/**` |
| Kundenbezogene Repository-Funktionen verlangen `clientId` als ersten Parameter | Konvention + Review + Typen (`ClientScoped<T>`) |
| Keine AI-Aufrufe außerhalb `server/ai/workflows/` | ESLint-Regel auf den Provider-Import |
| Jede Server Action schreibt ins Audit Log | Wrapper `withAudit()` |
