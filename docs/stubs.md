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

## Sprint 2 - 3D Preview

### Completed
- [x] Preview3D component with Three.js canvas
- [x] AutoRotate for automatic item rotation
- [x] VoxelItem component (sword, block geometries)
- [x] ElementParticles with level-based scaling
- [x] Zoom-only OrbitControls (kid-friendly)

### UI Now Visible
- [x] 3D preview canvas in center panel
- [x] Rotating items when selected
- [x] Element particle effects (fire, ice, water, poison, healing, lightning, light)
- [x] Level-based particle intensity (1-3)

## Sprint 3 - Datapack Export

### Completed
- [x] @kms/exporter package with datapack generator
- [x] Element → Enchantment mapping (fire_aspect, frost_walker, etc.)
- [x] Item command generator for Minecraft 1.20.5+
- [x] Export IPC handler with folder dialog
- [x] Exportieren button in Header

### UI Now Visible
- [x] "Exportieren" button (generates Minecraft datapack)
- [x] Validation alerts for incomplete items
- [x] Success alert with export path

## Placeholders (Not Yet Started)
- [ ] `packages/voice-service/` - Entire package (Sprint 4)
- [ ] `packages/llm-gateway/` - Entire package (Sprint 5)

## Rules

1. **Before showing UI element:** Remove from this list AND implement real functionality
2. **CI enforces:** No `Mock*`, `Echo*`, `Stub*`, `Dummy*`, `Fake*` providers in production code
3. **Update this file:** Every sprint planning session

## Next Sprint (Sprint 4)

**To implement:**
- [ ] Voice command service
- [ ] Speech-to-text integration
- [ ] Voice UI feedback
