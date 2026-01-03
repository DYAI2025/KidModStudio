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

## Sprint 1 - Save/Load

### Completed
- [x] Zod schema validation for projects
- [x] File service with atomic writes and backups
- [x] IPC handlers for save/load/new
- [x] Preload API with project methods
- [x] Redux store with project slice
- [x] ItemLibraryPanel component
- [x] PropertiesPanel component
- [x] Header with Speichern/Laden/Neu buttons

### UI Now Visible
- [x] "Neu" button (creates new project)
- [x] "Laden" button (opens file dialog)
- [x] "Speichern" button (only when project loaded)
- [x] Item library with templates
- [x] Properties panel with element/trigger selection

## Placeholders (Not Yet Started)
- [ ] `packages/voice-service/` - Entire package (Sprint 4)
- [ ] `packages/llm-gateway/` - Entire package (Sprint 5)
- [ ] `packages/exporter/` - Entire package (Sprint 3)
- [ ] 3D Preview (Sprint 2)
- [ ] Element Palette (Sprint 2)

## Rules

1. **Before showing UI element:** Remove from this list AND implement real functionality
2. **CI enforces:** No `Mock*`, `Echo*`, `Stub*`, `Dummy*`, `Fake*` providers in production code
3. **Update this file:** Every sprint planning session

## Next Sprint (Sprint 2)

**To implement:**
- [ ] 3D Preview with Three.js
- [ ] Element visual effects
- [ ] Item/Block rendering
- [ ] Camera controls

**UI to show after implementation:**
- [ ] 3D preview canvas (only when rendering works)
- [ ] Element visual indicators
