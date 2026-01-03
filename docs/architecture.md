# KidModStudio Architecture

## Overview

KidModStudio is an Electron-based desktop application that enables children to create Minecraft Fabric mods through a visual interface and voice commands.

## Process Model

```
┌─────────────────────────────────────────────────┐
│ Main Process (Node.js)                          │
│ - Window management                             │
│ - File system operations                        │
│ - Child process spawning                        │
│ - IPC hub                                       │
└───────┬─────────────────────────────────────────┘
        │ IPC
        ↓
┌─────────────────────────────────────────────────┐
│ Renderer Process (React)                        │
│ - Workbench UI (3 columns)                     │
│ - Redux state management                        │
│ - React Three Fiber (3D preview)                │
│ - dnd-kit (drag & drop)                         │
└─────────────────────────────────────────────────┘

        ↓ (Sprint 3+)
┌─────────────────────────────────────────────────┐
│ Exporter Process (Child)                        │
│ - Fabric template rendering                    │
│ - Mod generation                                │
└─────────────────────────────────────────────────┘

        ↓ (Sprint 4+)
┌─────────────────────────────────────────────────┐
│ Voice-Service Process (WebSocket)              │
│ - STT/TTS (local)                               │
│ - neutts-air or RealtimeVoiceChat              │
└─────────────────────────────────────────────────┘

        ↓ (Sprint 5+)
┌─────────────────────────────────────────────────┐
│ LLM-Gateway Process (Child)                     │
│ - Ollama client                                 │
│ - JSON schema enforcement                       │
│ - Skills runtime                                │
└─────────────────────────────────────────────────┘
```

## Package Structure

### @kms/shared
- Domain types (Elements, Triggers, Project)
- Shared utilities
- Type-safe contracts between packages

### @kms/main
- Electron main process
- IPC handlers
- File operations
- Child process management

### @kms/renderer
- React UI components
- Redux state
- 3D visualization
- User interactions

### @kms/preload
- IPC bridge
- Type-safe window.electronAPI
- Security layer

### @kms/no-stub-scanner
- CI enforcement
- Pattern detection
- Violation reporting

## No-Fake Architecture

**Principle:** Never show UI for unimplemented features.

**Enforcement:**
1. **Type-level:** TypeScript prevents calling non-existent APIs
2. **CI-level:** Scanner blocks Mock/Stub patterns in production
3. **Runtime-level:** Conditional rendering based on service availability

**Example:**
```typescript
// WRONG - shows button even if exporter doesn't exist
<button onClick={exportMod}>Export</button>

// CORRECT - button only appears when exporter ready
{isExporterAvailable && <button onClick={exportMod}>Export</button>}
```

## Data Flow (Sprint 1+)

```
User Action (UI)
  → Redux Action
    → Reducer (update state)
      → IPC to Main (if persistence needed)
        → File System
      → React Re-render
        → 3D Scene Update (if relevant)
```

## Testing Strategy

### Unit Tests (Vitest)
- Domain logic in @kms/shared
- Redux reducers/selectors
- Utility functions

### Integration Tests (Vitest)
- IPC communication
- File operations
- Scanner logic

### E2E Tests (Playwright)
- Full user flows
- No-Fake compliance
- Sprint demos

### Golden Tests
- Save/Load roundtrip (Sprint 1)
- Voice == UI determinism (Sprint 5)

## Security Model

- **contextIsolation:** true
- **nodeIntegration:** false
- **Preload script:** Only exposes whitelisted APIs
- **IPC validation:** All inputs validated before file operations

## Build Pipeline

1. **Type Check:** `tsc --noEmit` across all packages
2. **Unit Tests:** `vitest` in all packages
3. **No-Stub Scan:** Custom scanner for production code
4. **Build:** Vite builds Main + Renderer + Preload
5. **E2E Tests:** Playwright on built app
6. **Package:** electron-builder (future)

## Sprint Progression

Each sprint adds one layer:

- **Sprint 0:** Foundation + Scanner
- **Sprint 1:** + Persistence layer
- **Sprint 2:** + 3D visualization
- **Sprint 3:** + Exporter process
- **Sprint 4:** + Voice process
- **Sprint 5:** + LLM process
- **Sprint 6:** + Content polish

## Future: Multi-Loader (Post-MVP)

When adding NeoForge support:
- Create @kms/exporter-fabric, @kms/exporter-neoforge
- Shared @kms/exporter-common
- UI shows loader selection only when both implemented
