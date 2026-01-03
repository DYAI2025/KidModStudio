# Sprint 1: Save/Load Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable users to create, save, and load KidModStudio projects with atomic writes and automatic backups.

**Architecture:** Redux manages UI state, IPC bridges to main process for file operations. Atomic writes prevent corruption (write to temp, then rename). Automatic backup before each save. Schema validation on load prevents malformed data.

**Tech Stack:** Redux Toolkit, Electron IPC, Node.js fs/promises, Zod (schema validation)

---

## Task 1: Add Zod Schema Validation to Shared Package

**Files:**
- Create: `packages/shared/src/validation/project-schema.ts`
- Create: `packages/shared/src/validation/project-schema.test.ts`
- Modify: `packages/shared/src/index.ts`
- Modify: `packages/shared/package.json`

**Step 1: Add Zod dependency**

Run: `pnpm --filter @kms/shared add zod`

**Step 2: Write failing test for schema validation**

Create: `packages/shared/src/validation/project-schema.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { validateProject, ProjectValidationError } from './project-schema'
import { createEmptyProject } from '../types/project'

describe('Project Schema Validation', () => {
  it('should validate a valid project', () => {
    const project = createEmptyProject('Test Project')
    const result = validateProject(project)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.name).toBe('Test Project')
    }
  })

  it('should reject project with missing name', () => {
    const invalid = { version: '1.0', items: [] }
    const result = validateProject(invalid)
    expect(result.success).toBe(false)
  })

  it('should reject project with invalid version', () => {
    const invalid = { ...createEmptyProject('Test'), version: 123 }
    const result = validateProject(invalid)
    expect(result.success).toBe(false)
  })

  it('should validate project with items', () => {
    const project = createEmptyProject('Test')
    project.items = [{
      id: 'item-1',
      name: 'Fire Sword',
      type: 'item',
      element: { type: 'fire', level: 1 },
      trigger: { type: 'hit' }
    }]
    const result = validateProject(project)
    expect(result.success).toBe(true)
  })

  it('should reject item with invalid element type', () => {
    const project = createEmptyProject('Test')
    project.items = [{
      id: 'item-1',
      name: 'Bad Item',
      type: 'item',
      element: { type: 'invalid' as any, level: 1 }
    }]
    const result = validateProject(project)
    expect(result.success).toBe(false)
  })
})
```

**Step 3: Run test to verify it fails**

Run: `pnpm --filter @kms/shared test`
Expected: FAIL with "Cannot find module './project-schema'"

**Step 4: Implement schema validation**

Create: `packages/shared/src/validation/project-schema.ts`

```typescript
import { z } from 'zod'
import { ELEMENT_TYPES } from '../types/elements'
import { TRIGGER_TYPES } from '../types/triggers'

const ElementSchema = z.object({
  type: z.enum(ELEMENT_TYPES),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)])
})

const TriggerSchema = z.object({
  type: z.enum(TRIGGER_TYPES)
})

const ProjectItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['item', 'block']),
  element: ElementSchema.optional(),
  trigger: TriggerSchema.optional()
})

const ProjectSchema = z.object({
  version: z.string(),
  name: z.string().min(1),
  items: z.array(ProjectItemSchema),
  createdAt: z.string(),
  modifiedAt: z.string()
})

export type ValidatedProject = z.infer<typeof ProjectSchema>

export interface ValidationSuccess {
  success: true
  data: ValidatedProject
}

export interface ValidationFailure {
  success: false
  errors: z.ZodError
}

export type ValidationResult = ValidationSuccess | ValidationFailure

export function validateProject(data: unknown): ValidationResult {
  const result = ProjectSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error }
}

export class ProjectValidationError extends Error {
  constructor(public errors: z.ZodError) {
    super(`Project validation failed: ${errors.message}`)
    this.name = 'ProjectValidationError'
  }
}
```

**Step 5: Run test to verify it passes**

Run: `pnpm --filter @kms/shared test`
Expected: PASS (5 new tests)

**Step 6: Export from index**

Update: `packages/shared/src/index.ts`

```typescript
export * from './types/elements'
export * from './types/triggers'
export * from './types/project'
export * from './validation/project-schema'
```

**Step 7: Commit**

```bash
git add packages/shared
git commit -m "feat(shared): add Zod schema validation for projects"
```

---

## Task 2: Create File Service in Main Process

**Files:**
- Create: `packages/main/src/services/file-service.ts`
- Create: `packages/main/src/services/file-service.test.ts`
- Modify: `packages/main/package.json`

**Step 1: Add vitest to main package**

Update `packages/main/package.json`:

```json
{
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^1.1.0"
  }
}
```

Run: `pnpm install`

**Step 2: Write failing test for file service**

Create: `packages/main/src/services/file-service.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FileService } from './file-service'
import { createEmptyProject, Project } from '@kms/shared'
import { mkdirSync, rmSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'

describe('FileService', () => {
  const testDir = join(__dirname, '__test-files__')
  let fileService: FileService

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true })
    fileService = new FileService()
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  describe('saveProject', () => {
    it('should save project to file', async () => {
      const project = createEmptyProject('Test Project')
      const filePath = join(testDir, 'test.kms')

      await fileService.saveProject(filePath, project)

      expect(existsSync(filePath)).toBe(true)
      const content = readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(content)
      expect(parsed.name).toBe('Test Project')
    })

    it('should create backup before overwriting', async () => {
      const project1 = createEmptyProject('Version 1')
      const project2 = createEmptyProject('Version 2')
      const filePath = join(testDir, 'test.kms')

      await fileService.saveProject(filePath, project1)
      await fileService.saveProject(filePath, project2)

      const backupPath = filePath + '.backup'
      expect(existsSync(backupPath)).toBe(true)
      const backup = JSON.parse(readFileSync(backupPath, 'utf-8'))
      expect(backup.name).toBe('Version 1')
    })

    it('should use atomic write (temp file + rename)', async () => {
      const project = createEmptyProject('Atomic Test')
      const filePath = join(testDir, 'atomic.kms')

      await fileService.saveProject(filePath, project)

      // Temp file should not exist after save
      expect(existsSync(filePath + '.tmp')).toBe(false)
      expect(existsSync(filePath)).toBe(true)
    })
  })

  describe('loadProject', () => {
    it('should load project from file', async () => {
      const project = createEmptyProject('Load Test')
      const filePath = join(testDir, 'load.kms')
      await fileService.saveProject(filePath, project)

      const loaded = await fileService.loadProject(filePath)

      expect(loaded.name).toBe('Load Test')
    })

    it('should throw on invalid project schema', async () => {
      const filePath = join(testDir, 'invalid.kms')
      const invalidData = { invalid: true }
      require('fs').writeFileSync(filePath, JSON.stringify(invalidData))

      await expect(fileService.loadProject(filePath)).rejects.toThrow()
    })

    it('should throw on file not found', async () => {
      await expect(fileService.loadProject('/nonexistent.kms')).rejects.toThrow()
    })
  })

  describe('restoreBackup', () => {
    it('should restore from backup file', async () => {
      const project1 = createEmptyProject('Original')
      const project2 = createEmptyProject('Modified')
      const filePath = join(testDir, 'restore.kms')

      await fileService.saveProject(filePath, project1)
      await fileService.saveProject(filePath, project2)
      await fileService.restoreBackup(filePath)

      const restored = await fileService.loadProject(filePath)
      expect(restored.name).toBe('Original')
    })
  })
})
```

**Step 3: Run test to verify it fails**

Run: `pnpm --filter @kms/main test`
Expected: FAIL with "Cannot find module './file-service'"

**Step 4: Implement file service**

Create: `packages/main/src/services/file-service.ts`

```typescript
import { readFile, writeFile, rename, copyFile, access } from 'fs/promises'
import { validateProject, ProjectValidationError, Project } from '@kms/shared'

export class FileService {
  async saveProject(filePath: string, project: Project): Promise<void> {
    // Create backup if file exists
    if (await this.fileExists(filePath)) {
      const backupPath = filePath + '.backup'
      await copyFile(filePath, backupPath)
    }

    // Atomic write: write to temp, then rename
    const tempPath = filePath + '.tmp'
    const content = JSON.stringify(project, null, 2)
    await writeFile(tempPath, content, 'utf-8')
    await rename(tempPath, filePath)
  }

  async loadProject(filePath: string): Promise<Project> {
    const content = await readFile(filePath, 'utf-8')
    const data = JSON.parse(content)

    const result = validateProject(data)
    if (!result.success) {
      throw new ProjectValidationError(result.errors)
    }

    return result.data
  }

  async restoreBackup(filePath: string): Promise<void> {
    const backupPath = filePath + '.backup'
    if (!(await this.fileExists(backupPath))) {
      throw new Error('No backup file found')
    }
    await copyFile(backupPath, filePath)
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      await access(path)
      return true
    } catch {
      return false
    }
  }
}
```

**Step 5: Add @kms/shared dependency to main**

Update `packages/main/package.json`:

```json
{
  "dependencies": {
    "@kms/shared": "workspace:*"
  }
}
```

Run: `pnpm install`

**Step 6: Run test to verify it passes**

Run: `pnpm --filter @kms/main test`
Expected: PASS (6 tests)

**Step 7: Commit**

```bash
git add packages/main
git commit -m "feat(main): add file service with atomic writes and backups"
```

---

## Task 3: Add IPC Handlers for File Operations

**Files:**
- Create: `packages/main/src/ipc/project-handlers.ts`
- Modify: `packages/main/src/index.ts`

**Step 1: Create IPC handlers**

Create: `packages/main/src/ipc/project-handlers.ts`

```typescript
import { ipcMain, dialog, BrowserWindow } from 'electron'
import { FileService } from '../services/file-service'
import { createEmptyProject, Project } from '@kms/shared'

const fileService = new FileService()

export function registerProjectHandlers(): void {
  ipcMain.handle('project:new', async (_event, name: string): Promise<Project> => {
    return createEmptyProject(name)
  })

  ipcMain.handle('project:save', async (event, project: Project): Promise<string | null> => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return null

    const result = await dialog.showSaveDialog(window, {
      title: 'Projekt speichern',
      defaultPath: `${project.name}.kms`,
      filters: [
        { name: 'KidModStudio Projekt', extensions: ['kms'] }
      ]
    })

    if (result.canceled || !result.filePath) {
      return null
    }

    await fileService.saveProject(result.filePath, project)
    return result.filePath
  })

  ipcMain.handle('project:saveAs', async (event, filePath: string, project: Project): Promise<void> => {
    await fileService.saveProject(filePath, project)
  })

  ipcMain.handle('project:load', async (event): Promise<{ project: Project; filePath: string } | null> => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return null

    const result = await dialog.showOpenDialog(window, {
      title: 'Projekt laden',
      filters: [
        { name: 'KidModStudio Projekt', extensions: ['kms'] }
      ],
      properties: ['openFile']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const filePath = result.filePaths[0]
    const project = await fileService.loadProject(filePath)
    return { project, filePath }
  })

  ipcMain.handle('project:restoreBackup', async (_event, filePath: string): Promise<Project> => {
    await fileService.restoreBackup(filePath)
    return fileService.loadProject(filePath)
  })
}
```

**Step 2: Register handlers in main**

Update: `packages/main/src/index.ts`

```typescript
import { app, BrowserWindow } from 'electron'
import { createMainWindow } from './window'
import { registerProjectHandlers } from './ipc/project-handlers'

app.whenReady().then(() => {
  registerProjectHandlers()
  createMainWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})
```

**Step 3: Commit**

```bash
git add packages/main
git commit -m "feat(main): add IPC handlers for project save/load"
```

---

## Task 4: Extend Preload API with Project Methods

**Files:**
- Modify: `packages/preload/src/index.ts`
- Modify: `packages/preload/src/electron-api.d.ts`

**Step 1: Update preload with project API**

Update: `packages/preload/src/index.ts`

```typescript
import { contextBridge, ipcRenderer } from 'electron'
import { Project } from '@kms/shared'

// Type-safe API exposed to renderer
export interface ElectronAPI {
  platform: NodeJS.Platform
  project: {
    new: (name: string) => Promise<Project>
    save: (project: Project) => Promise<string | null>
    saveAs: (filePath: string, project: Project) => Promise<void>
    load: () => Promise<{ project: Project; filePath: string } | null>
    restoreBackup: (filePath: string) => Promise<Project>
  }
}

const api: ElectronAPI = {
  platform: process.platform,
  project: {
    new: (name: string) => ipcRenderer.invoke('project:new', name),
    save: (project: Project) => ipcRenderer.invoke('project:save', project),
    saveAs: (filePath: string, project: Project) => ipcRenderer.invoke('project:saveAs', filePath, project),
    load: () => ipcRenderer.invoke('project:load'),
    restoreBackup: (filePath: string) => ipcRenderer.invoke('project:restoreBackup', filePath)
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)
```

**Step 2: Add @kms/shared dependency**

Update `packages/preload/package.json`:

```json
{
  "dependencies": {
    "@kms/shared": "workspace:*",
    "electron": "^28.1.0"
  }
}
```

Run: `pnpm install`

**Step 3: Update type declarations**

Update: `packages/preload/src/electron-api.d.ts`

```typescript
import { ElectronAPI } from './index'

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {}
```

**Step 4: Commit**

```bash
git add packages/preload
git commit -m "feat(preload): add project IPC methods to preload API"
```

---

## Task 5: Setup Redux Store for Project State

**Files:**
- Create: `packages/renderer/src/store/index.ts`
- Create: `packages/renderer/src/store/projectSlice.ts`
- Create: `packages/renderer/src/store/projectSlice.test.ts`
- Modify: `packages/renderer/src/main.tsx`

**Step 1: Write failing test for project slice**

Create: `packages/renderer/src/store/projectSlice.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { projectReducer, projectActions, initialState, ProjectState } from './projectSlice'
import { createEmptyProject } from '@kms/shared'

describe('projectSlice', () => {
  it('should return initial state', () => {
    const state = projectReducer(undefined, { type: 'unknown' })
    expect(state.project).toBeNull()
    expect(state.filePath).toBeNull()
    expect(state.isDirty).toBe(false)
  })

  it('should handle setProject', () => {
    const project = createEmptyProject('Test')
    const state = projectReducer(initialState, projectActions.setProject(project))
    expect(state.project?.name).toBe('Test')
    expect(state.isDirty).toBe(false)
  })

  it('should handle setFilePath', () => {
    const state = projectReducer(initialState, projectActions.setFilePath('/path/to/file.kms'))
    expect(state.filePath).toBe('/path/to/file.kms')
  })

  it('should handle markDirty', () => {
    const withProject = projectReducer(
      initialState,
      projectActions.setProject(createEmptyProject('Test'))
    )
    const state = projectReducer(withProject, projectActions.markDirty())
    expect(state.isDirty).toBe(true)
  })

  it('should handle markClean', () => {
    let state = projectReducer(initialState, projectActions.setProject(createEmptyProject('Test')))
    state = projectReducer(state, projectActions.markDirty())
    state = projectReducer(state, projectActions.markClean())
    expect(state.isDirty).toBe(false)
  })

  it('should handle addItem', () => {
    let state = projectReducer(initialState, projectActions.setProject(createEmptyProject('Test')))
    state = projectReducer(state, projectActions.addItem({
      id: 'item-1',
      name: 'Fire Sword',
      type: 'item'
    }))
    expect(state.project?.items).toHaveLength(1)
    expect(state.project?.items[0].name).toBe('Fire Sword')
    expect(state.isDirty).toBe(true)
  })

  it('should handle removeItem', () => {
    let state = projectReducer(initialState, projectActions.setProject(createEmptyProject('Test')))
    state = projectReducer(state, projectActions.addItem({
      id: 'item-1',
      name: 'Fire Sword',
      type: 'item'
    }))
    state = projectReducer(state, projectActions.removeItem('item-1'))
    expect(state.project?.items).toHaveLength(0)
  })

  it('should handle updateItem', () => {
    let state = projectReducer(initialState, projectActions.setProject(createEmptyProject('Test')))
    state = projectReducer(state, projectActions.addItem({
      id: 'item-1',
      name: 'Fire Sword',
      type: 'item'
    }))
    state = projectReducer(state, projectActions.updateItem({
      id: 'item-1',
      changes: { name: 'Ice Sword', element: { type: 'ice', level: 2 } }
    }))
    expect(state.project?.items[0].name).toBe('Ice Sword')
    expect(state.project?.items[0].element?.type).toBe('ice')
  })

  it('should handle selectItem', () => {
    const state = projectReducer(initialState, projectActions.selectItem('item-1'))
    expect(state.selectedItemId).toBe('item-1')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @kms/renderer test`
Expected: FAIL with "Cannot find module './projectSlice'"

**Step 3: Implement project slice**

Create: `packages/renderer/src/store/projectSlice.ts`

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Project, ProjectItem } from '@kms/shared'

export interface ProjectState {
  project: Project | null
  filePath: string | null
  isDirty: boolean
  selectedItemId: string | null
}

export const initialState: ProjectState = {
  project: null,
  filePath: null,
  isDirty: false,
  selectedItemId: null
}

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProject(state, action: PayloadAction<Project>) {
      state.project = action.payload
      state.isDirty = false
      state.selectedItemId = null
    },
    setFilePath(state, action: PayloadAction<string | null>) {
      state.filePath = action.payload
    },
    markDirty(state) {
      state.isDirty = true
      if (state.project) {
        state.project.modifiedAt = new Date().toISOString()
      }
    },
    markClean(state) {
      state.isDirty = false
    },
    addItem(state, action: PayloadAction<ProjectItem>) {
      if (state.project) {
        state.project.items.push(action.payload)
        state.isDirty = true
        state.project.modifiedAt = new Date().toISOString()
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      if (state.project) {
        state.project.items = state.project.items.filter(item => item.id !== action.payload)
        state.isDirty = true
        state.project.modifiedAt = new Date().toISOString()
        if (state.selectedItemId === action.payload) {
          state.selectedItemId = null
        }
      }
    },
    updateItem(state, action: PayloadAction<{ id: string; changes: Partial<ProjectItem> }>) {
      if (state.project) {
        const index = state.project.items.findIndex(item => item.id === action.payload.id)
        if (index !== -1) {
          state.project.items[index] = { ...state.project.items[index], ...action.payload.changes }
          state.isDirty = true
          state.project.modifiedAt = new Date().toISOString()
        }
      }
    },
    selectItem(state, action: PayloadAction<string | null>) {
      state.selectedItemId = action.payload
    }
  }
})

export const projectActions = projectSlice.actions
export const projectReducer = projectSlice.reducer
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @kms/renderer test`
Expected: PASS (all tests including 10 new slice tests)

**Step 5: Create store index**

Create: `packages/renderer/src/store/index.ts`

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { projectReducer } from './projectSlice'

export const store = configureStore({
  reducer: {
    project: projectReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

**Step 6: Wire up Provider in main.tsx**

Update: `packages/renderer/src/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
```

**Step 7: Commit**

```bash
git add packages/renderer
git commit -m "feat(renderer): add Redux store with project slice"
```

---

## Task 6: Create ItemLibraryPanel Component

**Files:**
- Create: `packages/renderer/src/components/ItemLibraryPanel.tsx`
- Create: `packages/renderer/src/components/ItemLibraryPanel.test.tsx`
- Create: `packages/renderer/src/components/ItemLibraryPanel.css`

**Step 1: Write failing test for ItemLibraryPanel**

Create: `packages/renderer/src/components/ItemLibraryPanel.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { projectReducer, projectActions } from '../store/projectSlice'
import ItemLibraryPanel from './ItemLibraryPanel'
import { createEmptyProject } from '@kms/shared'

function renderWithStore(ui: React.ReactElement, preloadedState = {}) {
  const store = configureStore({
    reducer: { project: projectReducer },
    preloadedState
  })
  return { ...render(<Provider store={store}>{ui}</Provider>), store }
}

describe('ItemLibraryPanel', () => {
  it('should show "Kein Projekt" when no project loaded', () => {
    renderWithStore(<ItemLibraryPanel />)
    expect(screen.getByText('Kein Projekt geladen')).toBeInTheDocument()
  })

  it('should show item templates when project is loaded', () => {
    const project = createEmptyProject('Test')
    renderWithStore(<ItemLibraryPanel />, {
      project: { project, filePath: null, isDirty: false, selectedItemId: null }
    })
    expect(screen.getByText('Schwert')).toBeInTheDocument()
    expect(screen.getByText('Spitzhacke')).toBeInTheDocument()
    expect(screen.getByText('Block')).toBeInTheDocument()
  })

  it('should add item when template clicked', () => {
    const project = createEmptyProject('Test')
    const { store } = renderWithStore(<ItemLibraryPanel />, {
      project: { project, filePath: null, isDirty: false, selectedItemId: null }
    })

    fireEvent.click(screen.getByText('Schwert'))

    const state = store.getState()
    expect(state.project.project?.items).toHaveLength(1)
    expect(state.project.project?.items[0].type).toBe('item')
  })

  it('should show existing items in project', () => {
    const project = createEmptyProject('Test')
    project.items = [{ id: '1', name: 'Fire Sword', type: 'item' }]
    renderWithStore(<ItemLibraryPanel />, {
      project: { project, filePath: null, isDirty: false, selectedItemId: null }
    })
    expect(screen.getByText('Fire Sword')).toBeInTheDocument()
  })

  it('should highlight selected item', () => {
    const project = createEmptyProject('Test')
    project.items = [{ id: '1', name: 'Fire Sword', type: 'item' }]
    renderWithStore(<ItemLibraryPanel />, {
      project: { project, filePath: null, isDirty: false, selectedItemId: '1' }
    })
    const item = screen.getByText('Fire Sword').closest('.library-item')
    expect(item).toHaveClass('selected')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @kms/renderer test`
Expected: FAIL with "Cannot find module './ItemLibraryPanel'"

**Step 3: Implement ItemLibraryPanel**

Create: `packages/renderer/src/components/ItemLibraryPanel.tsx`

```typescript
import { FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { projectActions } from '../store/projectSlice'
import './ItemLibraryPanel.css'

const ITEM_TEMPLATES = [
  { label: 'Schwert', type: 'item' as const, icon: '⚔️' },
  { label: 'Spitzhacke', type: 'item' as const, icon: '⛏️' },
  { label: 'Block', type: 'block' as const, icon: '🧱' }
]

const ItemLibraryPanel: FC = () => {
  const dispatch = useDispatch()
  const project = useSelector((state: RootState) => state.project.project)
  const selectedItemId = useSelector((state: RootState) => state.project.selectedItemId)

  if (!project) {
    return (
      <div className="item-library-panel">
        <h3>Bibliothek</h3>
        <p className="empty-state">Kein Projekt geladen</p>
      </div>
    )
  }

  const handleAddItem = (template: typeof ITEM_TEMPLATES[0]) => {
    const id = `item-${Date.now()}`
    dispatch(projectActions.addItem({
      id,
      name: `Neues ${template.label}`,
      type: template.type
    }))
    dispatch(projectActions.selectItem(id))
  }

  const handleSelectItem = (id: string) => {
    dispatch(projectActions.selectItem(id))
  }

  return (
    <div className="item-library-panel">
      <h3>Bibliothek</h3>

      <div className="templates">
        <h4>Neu erstellen</h4>
        {ITEM_TEMPLATES.map(template => (
          <button
            key={template.label}
            className="template-button"
            onClick={() => handleAddItem(template)}
          >
            <span className="icon">{template.icon}</span>
            {template.label}
          </button>
        ))}
      </div>

      {project.items.length > 0 && (
        <div className="project-items">
          <h4>Im Projekt</h4>
          {project.items.map(item => (
            <div
              key={item.id}
              className={`library-item ${selectedItemId === item.id ? 'selected' : ''}`}
              onClick={() => handleSelectItem(item.id)}
            >
              <span className="icon">{item.type === 'item' ? '⚔️' : '🧱'}</span>
              {item.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ItemLibraryPanel
```

**Step 4: Add styles**

Create: `packages/renderer/src/components/ItemLibraryPanel.css`

```css
.item-library-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-library-panel h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.item-library-panel h4 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.empty-state {
  color: #999;
  font-style: italic;
}

.templates {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.template-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background: #f9f9f9;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.template-button:hover {
  border-color: #2563eb;
  background: #eff6ff;
}

.project-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.library-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.library-item:hover {
  border-color: #2563eb;
}

.library-item.selected {
  border-color: #2563eb;
  background: #eff6ff;
}

.icon {
  font-size: 1.2rem;
}
```

**Step 5: Run test to verify it passes**

Run: `pnpm --filter @kms/renderer test`
Expected: PASS

**Step 6: Commit**

```bash
git add packages/renderer
git commit -m "feat(renderer): add ItemLibraryPanel component"
```

---

## Task 7: Create PropertiesPanel Component

**Files:**
- Create: `packages/renderer/src/components/PropertiesPanel.tsx`
- Create: `packages/renderer/src/components/PropertiesPanel.test.tsx`
- Create: `packages/renderer/src/components/PropertiesPanel.css`

**Step 1: Write failing test for PropertiesPanel**

Create: `packages/renderer/src/components/PropertiesPanel.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { projectReducer } from '../store/projectSlice'
import PropertiesPanel from './PropertiesPanel'
import { createEmptyProject } from '@kms/shared'

function renderWithStore(ui: React.ReactElement, preloadedState = {}) {
  const store = configureStore({
    reducer: { project: projectReducer },
    preloadedState
  })
  return { ...render(<Provider store={store}>{ui}</Provider>), store }
}

describe('PropertiesPanel', () => {
  it('should show "Nichts ausgewählt" when no item selected', () => {
    const project = createEmptyProject('Test')
    renderWithStore(<PropertiesPanel />, {
      project: { project, filePath: null, isDirty: false, selectedItemId: null }
    })
    expect(screen.getByText('Nichts ausgewählt')).toBeInTheDocument()
  })

  it('should show item properties when selected', () => {
    const project = createEmptyProject('Test')
    project.items = [{ id: '1', name: 'Fire Sword', type: 'item' }]
    renderWithStore(<PropertiesPanel />, {
      project: { project, filePath: null, isDirty: false, selectedItemId: '1' }
    })
    expect(screen.getByDisplayValue('Fire Sword')).toBeInTheDocument()
  })

  it('should update item name on input change', () => {
    const project = createEmptyProject('Test')
    project.items = [{ id: '1', name: 'Fire Sword', type: 'item' }]
    const { store } = renderWithStore(<PropertiesPanel />, {
      project: { project, filePath: null, isDirty: false, selectedItemId: '1' }
    })

    const input = screen.getByDisplayValue('Fire Sword')
    fireEvent.change(input, { target: { value: 'Ice Sword' } })

    expect(store.getState().project.project?.items[0].name).toBe('Ice Sword')
  })

  it('should show element selector', () => {
    const project = createEmptyProject('Test')
    project.items = [{ id: '1', name: 'Sword', type: 'item' }]
    renderWithStore(<PropertiesPanel />, {
      project: { project, filePath: null, isDirty: false, selectedItemId: '1' }
    })
    expect(screen.getByText('Element')).toBeInTheDocument()
    expect(screen.getByText('Feuer')).toBeInTheDocument()
    expect(screen.getByText('Eis')).toBeInTheDocument()
  })

  it('should show trigger selector for items', () => {
    const project = createEmptyProject('Test')
    project.items = [{ id: '1', name: 'Sword', type: 'item' }]
    renderWithStore(<PropertiesPanel />, {
      project: { project, filePath: null, isDirty: false, selectedItemId: '1' }
    })
    expect(screen.getByText('Auslöser')).toBeInTheDocument()
  })

  it('should show delete button', () => {
    const project = createEmptyProject('Test')
    project.items = [{ id: '1', name: 'Sword', type: 'item' }]
    const { store } = renderWithStore(<PropertiesPanel />, {
      project: { project, filePath: null, isDirty: false, selectedItemId: '1' }
    })

    fireEvent.click(screen.getByText('Löschen'))

    expect(store.getState().project.project?.items).toHaveLength(0)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @kms/renderer test`
Expected: FAIL with "Cannot find module './PropertiesPanel'"

**Step 3: Implement PropertiesPanel**

Create: `packages/renderer/src/components/PropertiesPanel.tsx`

```typescript
import { FC } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../store'
import { projectActions } from '../store/projectSlice'
import { ELEMENT_TYPES, ElementType, TRIGGER_TYPES, TriggerType } from '@kms/shared'
import './PropertiesPanel.css'

const ELEMENT_LABELS: Record<ElementType, string> = {
  fire: 'Feuer',
  ice: 'Eis',
  water: 'Wasser',
  poison: 'Gift',
  healing: 'Heilung',
  lightning: 'Blitz',
  light: 'Licht'
}

const TRIGGER_LABELS: Record<TriggerType, string> = {
  use: 'Benutzen',
  hit: 'Treffen'
}

const PropertiesPanel: FC = () => {
  const dispatch = useDispatch()
  const project = useSelector((state: RootState) => state.project.project)
  const selectedItemId = useSelector((state: RootState) => state.project.selectedItemId)

  const selectedItem = project?.items.find(item => item.id === selectedItemId)

  if (!selectedItem) {
    return (
      <div className="properties-panel">
        <h3>Eigenschaften</h3>
        <p className="empty-state">Nichts ausgewählt</p>
      </div>
    )
  }

  const handleNameChange = (name: string) => {
    dispatch(projectActions.updateItem({ id: selectedItem.id, changes: { name } }))
  }

  const handleElementChange = (type: ElementType | '') => {
    if (type === '') {
      dispatch(projectActions.updateItem({ id: selectedItem.id, changes: { element: undefined } }))
    } else {
      dispatch(projectActions.updateItem({
        id: selectedItem.id,
        changes: { element: { type, level: 1 } }
      }))
    }
  }

  const handleTriggerChange = (type: TriggerType | '') => {
    if (type === '') {
      dispatch(projectActions.updateItem({ id: selectedItem.id, changes: { trigger: undefined } }))
    } else {
      dispatch(projectActions.updateItem({
        id: selectedItem.id,
        changes: { trigger: { type } }
      }))
    }
  }

  const handleDelete = () => {
    dispatch(projectActions.removeItem(selectedItem.id))
  }

  return (
    <div className="properties-panel">
      <h3>Eigenschaften</h3>

      <div className="property-group">
        <label>Name</label>
        <input
          type="text"
          value={selectedItem.name}
          onChange={e => handleNameChange(e.target.value)}
        />
      </div>

      <div className="property-group">
        <label>Element</label>
        <div className="element-grid">
          {ELEMENT_TYPES.map(type => (
            <button
              key={type}
              className={`element-button ${selectedItem.element?.type === type ? 'selected' : ''}`}
              onClick={() => handleElementChange(selectedItem.element?.type === type ? '' : type)}
            >
              {ELEMENT_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {selectedItem.type === 'item' && (
        <div className="property-group">
          <label>Auslöser</label>
          <div className="trigger-grid">
            {TRIGGER_TYPES.map(type => (
              <button
                key={type}
                className={`trigger-button ${selectedItem.trigger?.type === type ? 'selected' : ''}`}
                onClick={() => handleTriggerChange(selectedItem.trigger?.type === type ? '' : type)}
              >
                {TRIGGER_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="property-group">
        <button className="delete-button" onClick={handleDelete}>
          Löschen
        </button>
      </div>
    </div>
  )
}

export default PropertiesPanel
```

**Step 4: Add styles**

Create: `packages/renderer/src/components/PropertiesPanel.css`

```css
.properties-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.properties-panel h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.empty-state {
  color: #999;
  font-style: italic;
}

.property-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.property-group label {
  font-weight: 500;
  color: #555;
  font-size: 0.9rem;
}

.property-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.property-group input:focus {
  outline: none;
  border-color: #2563eb;
}

.element-grid,
.trigger-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.element-button,
.trigger-button {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.element-button:hover,
.trigger-button:hover {
  border-color: #2563eb;
}

.element-button.selected,
.trigger-button.selected {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.delete-button {
  padding: 0.75rem;
  border: 1px solid #ef4444;
  border-radius: 8px;
  background: white;
  color: #ef4444;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.delete-button:hover {
  background: #ef4444;
  color: white;
}
```

**Step 5: Run test to verify it passes**

Run: `pnpm --filter @kms/renderer test`
Expected: PASS

**Step 6: Commit**

```bash
git add packages/renderer
git commit -m "feat(renderer): add PropertiesPanel component"
```

---

## Task 8: Create Header with Save/Load Buttons

**Files:**
- Create: `packages/renderer/src/components/Header.tsx`
- Create: `packages/renderer/src/components/Header.test.tsx`
- Create: `packages/renderer/src/components/Header.css`
- Create: `packages/renderer/src/hooks/useProjectActions.ts`

**Step 1: Write failing test for Header**

Create: `packages/renderer/src/components/Header.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { projectReducer } from '../store/projectSlice'
import Header from './Header'
import { createEmptyProject } from '@kms/shared'

// Mock electronAPI
const mockElectronAPI = {
  platform: 'linux' as const,
  project: {
    new: vi.fn(),
    save: vi.fn(),
    saveAs: vi.fn(),
    load: vi.fn(),
    restoreBackup: vi.fn()
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(window as any).electronAPI = mockElectronAPI
})

function renderWithStore(ui: React.ReactElement, preloadedState = {}) {
  const store = configureStore({
    reducer: { project: projectReducer },
    preloadedState
  })
  return { ...render(<Provider store={store}>{ui}</Provider>), store }
}

describe('Header', () => {
  it('should show app title', () => {
    renderWithStore(<Header />)
    expect(screen.getByText('KidModStudio')).toBeInTheDocument()
  })

  it('should show Neu button', () => {
    renderWithStore(<Header />)
    expect(screen.getByText('Neu')).toBeInTheDocument()
  })

  it('should show Laden button', () => {
    renderWithStore(<Header />)
    expect(screen.getByText('Laden')).toBeInTheDocument()
  })

  it('should show Speichern button when project is loaded', () => {
    const project = createEmptyProject('Test')
    renderWithStore(<Header />, {
      project: { project, filePath: null, isDirty: false, selectedItemId: null }
    })
    expect(screen.getByText('Speichern')).toBeInTheDocument()
  })

  it('should NOT show Speichern button when no project', () => {
    renderWithStore(<Header />)
    expect(screen.queryByText('Speichern')).not.toBeInTheDocument()
  })

  it('should call project.new when Neu clicked', async () => {
    mockElectronAPI.project.new.mockResolvedValue(createEmptyProject('Neues Projekt'))
    const { store } = renderWithStore(<Header />)

    fireEvent.click(screen.getByText('Neu'))

    await waitFor(() => {
      expect(mockElectronAPI.project.new).toHaveBeenCalledWith('Neues Projekt')
      expect(store.getState().project.project?.name).toBe('Neues Projekt')
    })
  })

  it('should call project.load when Laden clicked', async () => {
    const project = createEmptyProject('Loaded Project')
    mockElectronAPI.project.load.mockResolvedValue({ project, filePath: '/path/file.kms' })
    const { store } = renderWithStore(<Header />)

    fireEvent.click(screen.getByText('Laden'))

    await waitFor(() => {
      expect(mockElectronAPI.project.load).toHaveBeenCalled()
      expect(store.getState().project.project?.name).toBe('Loaded Project')
      expect(store.getState().project.filePath).toBe('/path/file.kms')
    })
  })

  it('should show dirty indicator when project modified', () => {
    const project = createEmptyProject('Test')
    renderWithStore(<Header />, {
      project: { project, filePath: '/file.kms', isDirty: true, selectedItemId: null }
    })
    expect(screen.getByText('●')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @kms/renderer test`
Expected: FAIL with "Cannot find module './Header'"

**Step 3: Create useProjectActions hook**

Create: `packages/renderer/src/hooks/useProjectActions.ts`

```typescript
import { useDispatch } from 'react-redux'
import { projectActions } from '../store/projectSlice'
import { Project } from '@kms/shared'

export function useProjectActions() {
  const dispatch = useDispatch()

  const createNew = async () => {
    const project = await window.electronAPI.project.new('Neues Projekt')
    dispatch(projectActions.setProject(project))
    dispatch(projectActions.setFilePath(null))
  }

  const load = async () => {
    const result = await window.electronAPI.project.load()
    if (result) {
      dispatch(projectActions.setProject(result.project))
      dispatch(projectActions.setFilePath(result.filePath))
    }
  }

  const save = async (project: Project, filePath: string | null) => {
    if (filePath) {
      await window.electronAPI.project.saveAs(filePath, project)
      dispatch(projectActions.markClean())
    } else {
      const savedPath = await window.electronAPI.project.save(project)
      if (savedPath) {
        dispatch(projectActions.setFilePath(savedPath))
        dispatch(projectActions.markClean())
      }
    }
  }

  return { createNew, load, save }
}
```

**Step 4: Implement Header**

Create: `packages/renderer/src/components/Header.tsx`

```typescript
import { FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { useProjectActions } from '../hooks/useProjectActions'
import './Header.css'

const Header: FC = () => {
  const project = useSelector((state: RootState) => state.project.project)
  const filePath = useSelector((state: RootState) => state.project.filePath)
  const isDirty = useSelector((state: RootState) => state.project.isDirty)
  const { createNew, load, save } = useProjectActions()

  const handleSave = () => {
    if (project) {
      save(project, filePath)
    }
  }

  return (
    <header className="app-header">
      <h1>KidModStudio</h1>

      <div className="header-actions">
        <button onClick={createNew}>Neu</button>
        <button onClick={load}>Laden</button>
        {project && (
          <button onClick={handleSave}>
            Speichern
            {isDirty && <span className="dirty-indicator">●</span>}
          </button>
        )}
      </div>

      {project && (
        <div className="project-info">
          <span className="project-name">{project.name}</span>
          {filePath && <span className="file-path">{filePath}</span>}
        </div>
      )}
    </header>
  )
}

export default Header
```

**Step 5: Add styles**

Create: `packages/renderer/src/components/Header.css`

```css
.app-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 1rem 1.5rem;
  background: #2563eb;
  color: white;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.header-actions button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.header-actions button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.dirty-indicator {
  color: #fbbf24;
  margin-left: 0.25rem;
}

.project-info {
  display: flex;
  flex-direction: column;
  margin-left: auto;
  text-align: right;
}

.project-name {
  font-weight: 500;
}

.file-path {
  font-size: 0.75rem;
  opacity: 0.7;
}
```

**Step 6: Run test to verify it passes**

Run: `pnpm --filter @kms/renderer test`
Expected: PASS

**Step 7: Commit**

```bash
git add packages/renderer
git commit -m "feat(renderer): add Header with save/load buttons"
```

---

## Task 9: Wire Up App Component

**Files:**
- Modify: `packages/renderer/src/App.tsx`
- Modify: `packages/renderer/src/App.test.tsx`

**Step 1: Update App component**

Update: `packages/renderer/src/App.tsx`

```typescript
import { FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import Header from './components/Header'
import ItemLibraryPanel from './components/ItemLibraryPanel'
import PropertiesPanel from './components/PropertiesPanel'
import './App.css'

const App: FC = () => {
  const project = useSelector((state: RootState) => state.project.project)

  return (
    <div className="app">
      <Header />

      <main className="workbench">
        <div className="workbench-left">
          <ItemLibraryPanel />
        </div>

        <div className="workbench-center">
          {project ? (
            <div className="preview-placeholder">
              <p>3D Vorschau</p>
              <span className="coming-soon">Sprint 2</span>
            </div>
          ) : (
            <div className="welcome">
              <h2>Willkommen bei KidModStudio!</h2>
              <p>Erstelle ein neues Projekt oder lade ein bestehendes.</p>
            </div>
          )}
        </div>

        <div className="workbench-right">
          <PropertiesPanel />
        </div>
      </main>

      {/* No Export button - not implemented yet (No-Fake) */}
      {/* No Crafty window - not implemented yet (No-Fake) */}
    </div>
  )
}

export default App
```

**Step 2: Update App.css**

Create: `packages/renderer/src/App.css`

```css
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.workbench {
  flex: 1;
  display: grid;
  grid-template-columns: 280px 1fr 320px;
  gap: 1rem;
  padding: 1rem;
  background: #f5f5f5;
  overflow: hidden;
}

.workbench-left,
.workbench-center,
.workbench-right {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow-y: auto;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.coming-soon {
  background: #e5e7eb;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #666;
}

.welcome h2 {
  margin: 0 0 0.5rem;
  color: #333;
}
```

**Step 3: Update App.test.tsx**

Update: `packages/renderer/src/App.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { projectReducer } from './store/projectSlice'
import App from './App'
import { createEmptyProject } from '@kms/shared'

// Mock electronAPI
beforeEach(() => {
  ;(window as any).electronAPI = {
    platform: 'linux',
    project: {
      new: vi.fn(),
      save: vi.fn(),
      saveAs: vi.fn(),
      load: vi.fn(),
      restoreBackup: vi.fn()
    }
  }
})

function renderWithStore(preloadedState = {}) {
  const store = configureStore({
    reducer: { project: projectReducer },
    preloadedState
  })
  return render(<Provider store={store}><App /></Provider>)
}

describe('App', () => {
  it('should render workbench title', () => {
    renderWithStore()
    expect(screen.getByText('KidModStudio')).toBeInTheDocument()
  })

  it('should show welcome message when no project', () => {
    renderWithStore()
    expect(screen.getByText('Willkommen bei KidModStudio!')).toBeInTheDocument()
  })

  it('should NOT show export button (No-Fake)', () => {
    renderWithStore()
    expect(screen.queryByText(/export/i)).not.toBeInTheDocument()
  })

  it('should NOT show Crafty button (No-Fake)', () => {
    renderWithStore()
    expect(screen.queryByText(/crafty/i)).not.toBeInTheDocument()
  })

  it('should show library panel', () => {
    renderWithStore()
    expect(screen.getByText('Bibliothek')).toBeInTheDocument()
  })

  it('should show properties panel', () => {
    renderWithStore()
    expect(screen.getByText('Eigenschaften')).toBeInTheDocument()
  })

  it('should show 3D preview placeholder when project loaded', () => {
    const project = createEmptyProject('Test')
    renderWithStore({
      project: { project, filePath: null, isDirty: false, selectedItemId: null }
    })
    expect(screen.getByText('3D Vorschau')).toBeInTheDocument()
    expect(screen.getByText('Sprint 2')).toBeInTheDocument()
  })
})
```

**Step 4: Run all tests**

Run: `pnpm test`
Expected: All tests pass

**Step 5: Commit**

```bash
git add packages/renderer
git commit -m "feat(renderer): wire up App with all Sprint 1 components"
```

---

## Task 10: Update stubs.md and Final Verification

**Files:**
- Modify: `docs/stubs.md`

**Step 1: Update stubs.md**

Update the Sprint 1 section in `docs/stubs.md`:

```markdown
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
```

**Step 2: Run full verification**

```bash
pnpm typecheck
pnpm test
pnpm scan
```

Expected: All pass

**Step 3: Commit**

```bash
git add docs/stubs.md
git commit -m "docs: update stubs.md with Sprint 1 completion"
```

**Step 4: Push to GitHub**

```bash
git push
```

---

## Summary

**Sprint 1 delivers:**
- Schema validation with Zod
- Atomic file save/load with automatic backups
- Redux state management for projects
- Working UI: Header (Neu/Laden/Speichern), ItemLibraryPanel, PropertiesPanel
- Full No-Fake compliance: all buttons work, no stubs in production

**Total estimated tasks:** 10
**Test coverage:** Unit tests for all logic, component tests for all UI
