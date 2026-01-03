# Stubs & Placeholders Tracking

> **No-Fake Foundation Rule:** This file tracks all placeholders/stubs that exist in the codebase.
> Each item MUST be replaced with real implementation before the feature can be shown in UI.

## Sprint 0 - Foundation

### Completed
- [x] Monorepo structure (pnpm workspaces)
- [x] Type definitions (elements, triggers, project)
- [x] No-Stub Scanner with CLI
- [x] CI Pipeline (GitHub Actions)
- [x] Basic Electron shell (main process)
- [x] React UI shell (No-Fake compliant)
- [x] Preload bridge (IPC types)
- [x] E2E test setup (Playwright)
- [x] Documentation (README, architecture)

### Placeholders (Not Yet Started)
- [ ] `packages/voice-service/` - Entire package (Sprint 4)
- [ ] `packages/llm-gateway/` - Entire package (Sprint 5)
- [ ] `packages/exporter/` - Entire package (Sprint 3)
- [ ] Save/Load functionality (Sprint 1)
- [ ] 3D Preview (Sprint 2)
- [ ] Element Palette (Sprint 2)
- [ ] Properties Panel (Sprint 1)

## Rules

1. **Before showing UI element:** Remove from this list AND implement real functionality
2. **CI enforces:** No `Mock*`, `Echo*`, `Stub*`, `Dummy*`, `Fake*` providers in production code
3. **Update this file:** Every sprint planning session

## Next Sprint (Sprint 1)

**To implement:**
- [ ] Project save/load with atomic writes
- [ ] Project schema validator
- [ ] Backup/restore flow
- [ ] ItemLibraryPanel component
- [ ] PropertiesPanel component with checklist

**UI to show after implementation:**
- [ ] "Speichern" button (only when save implemented)
- [ ] "Laden" button (only when load implemented)
- [ ] Item library panel (only when items exist)
