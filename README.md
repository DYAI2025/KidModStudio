# KidModStudio

> Minecraft mod creation for kids - with voice commands and visual interface

## Status

**Current Sprint:** Sprint 0 - No-Fake Foundation ✅ Complete

**Next Sprint:** Sprint 1 - Save/Load functionality (Week 3-4)

## Quick Start

```bash
# Install dependencies
pnpm install

# Run in development
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# No-Stub scanner
pnpm scan
```

## Project Structure

```
kidmodstudio/
├── packages/
│   ├── main/          # Electron main process
│   ├── renderer/      # React UI
│   ├── preload/       # IPC bridge
│   ├── shared/        # Domain types
│   └── no-stub-scanner/ # CI enforcement
├── docs/
│   ├── plans/         # Sprint plans
│   ├── demos/         # Demo scripts
│   └── stubs.md       # Placeholder tracking
└── templates/
    └── fabric-1.21.x/ # (Future) Fabric mod templates
```

## No-Fake Foundation

**Rule:** UI elements only appear when underlying functionality is real.

- ✅ No "Export" button until Exporter works (Sprint 3)
- ✅ No "Crafty" window until Voice+LLM works (Sprint 4-5)
- ✅ CI enforces: no Mock/Stub/Echo providers in production code

See: `docs/stubs.md` for current placeholders.

## Tech Stack

- **Desktop:** Electron 28
- **UI:** React 18 + TypeScript
- **State:** Redux Toolkit (Sprint 1+)
- **Build:** Vite + pnpm workspaces
- **Tests:** Vitest + Playwright
- **3D:** React Three Fiber (Sprint 2+)

## Development

See [Architecture Docs](./docs/architecture.md) for details.

## Sprint Progress

- [x] Sprint 0: No-Fake Foundation (Week 1-2)
- [ ] Sprint 1: Save/Load (Week 3-4)
- [ ] Sprint 2: Live Workbench (Week 5-6)
- [ ] Sprint 3: Fabric Export (Week 7-8) - MVP 0.0.1
- [ ] Sprint 4: Voice Integration (Week 9-10)
- [ ] Sprint 5: LLM + Skills (Week 11-12) - MVP 0.0.2
- [ ] Sprint 6: Content + Polish (Week 13-14)
