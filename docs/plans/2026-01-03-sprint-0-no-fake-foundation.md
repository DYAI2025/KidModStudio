# Sprint 0: No-Fake Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish monorepo structure with No-Fake Scanner CI enforcement and minimal Electron app shell that only shows implemented features.

**Architecture:** pnpm monorepo with 6 packages (main, renderer, shared, voice-service, exporter, llm-gateway). Vite for builds, Vitest for tests, TypeScript everywhere. No-Stub scanner enforces "no mocks in production path" rule via CI.

**Tech Stack:** Electron, React, TypeScript, Redux Toolkit, Vite, pnpm workspaces, Vitest, ESLint

---

## Task 1: Initialize Monorepo Structure

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `tsconfig.base.json`
- Create: `.npmrc`

**Step 1: Create root package.json**

```json
{
  "name": "kidmodstudio",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter @kms/main dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.6"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

**Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
```

**Step 3: Create .npmrc**

```
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
```

**Step 4: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**Step 5: Create .gitignore**

```
node_modules/
dist/
*.log
.DS_Store
.env
.env.local
coverage/
.vite/
out/
*.tsbuildinfo
.swarm/
.hive-mind/
coordination/
memory/
```

**Step 6: Verify pnpm install**

Run: `pnpm install`
Expected: Dependencies installed successfully

**Step 7: Commit monorepo base**

```bash
git add -A
git commit -m "chore: initialize monorepo structure with pnpm workspaces"
```

---

## Task 2: Create Shared Package (Domain Types)

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/types/project.ts`
- Create: `packages/shared/src/types/elements.ts`
- Create: `packages/shared/src/types/triggers.ts`

**Step 1: Create shared package.json**

```json
{
  "name": "@kms/shared",
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "typescript": "workspace:*",
    "vitest": "^1.1.0"
  }
}
```

**Step 2: Create shared tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Write failing test for Element types**

Create: `packages/shared/src/types/elements.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { ElementType, isValidElement } from './elements'

describe('Element Types', () => {
  it('should validate fire element', () => {
    expect(isValidElement('fire')).toBe(true)
  })

  it('should reject invalid element', () => {
    expect(isValidElement('invalid')).toBe(false)
  })
})
```

**Step 4: Run test to verify it fails**

Run: `cd packages/shared && pnpm test`
Expected: FAIL with "Cannot find module './elements'"

**Step 5: Create Element types**

Create: `packages/shared/src/types/elements.ts`

```typescript
export const ELEMENT_TYPES = ['fire', 'ice', 'water', 'poison', 'healing', 'lightning', 'light'] as const
export type ElementType = typeof ELEMENT_TYPES[number]

export interface Element {
  type: ElementType
  level: 1 | 2 | 3
}

export function isValidElement(value: string): value is ElementType {
  return ELEMENT_TYPES.includes(value as ElementType)
}
```

**Step 6: Run test to verify it passes**

Run: `cd packages/shared && pnpm test`
Expected: PASS (2/2)

**Step 7: Write failing test for Trigger types**

Create: `packages/shared/src/types/triggers.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { TriggerType, isValidTrigger } from './triggers'

describe('Trigger Types', () => {
  it('should validate use trigger', () => {
    expect(isValidTrigger('use')).toBe(true)
  })

  it('should validate hit trigger', () => {
    expect(isValidTrigger('hit')).toBe(true)
  })

  it('should reject open trigger in MVP', () => {
    expect(isValidTrigger('open')).toBe(false)
  })
})
```

**Step 8: Run test to verify it fails**

Run: `cd packages/shared && pnpm test`
Expected: FAIL with "Cannot find module './triggers'"

**Step 9: Create Trigger types (MVP: only use/hit)**

Create: `packages/shared/src/types/triggers.ts`

```typescript
// MVP: Only use and hit triggers
export const TRIGGER_TYPES = ['use', 'hit'] as const
export type TriggerType = typeof TRIGGER_TYPES[number]

export interface Trigger {
  type: TriggerType
}

export function isValidTrigger(value: string): value is TriggerType {
  return TRIGGER_TYPES.includes(value as TriggerType)
}
```

**Step 10: Run test to verify it passes**

Run: `cd packages/shared && pnpm test`
Expected: PASS (5/5)

**Step 11: Write failing test for Project schema**

Create: `packages/shared/src/types/project.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { Project, createEmptyProject } from './project'

describe('Project Schema', () => {
  it('should create empty project', () => {
    const project = createEmptyProject('Test Project')
    expect(project.name).toBe('Test Project')
    expect(project.items).toEqual([])
  })

  it('should have version field', () => {
    const project = createEmptyProject('Test')
    expect(project.version).toBe('1.0')
  })
})
```

**Step 12: Run test to verify it fails**

Run: `cd packages/shared && pnpm test`
Expected: FAIL with "Cannot find module './project'"

**Step 13: Create Project schema**

Create: `packages/shared/src/types/project.ts`

```typescript
import { Element } from './elements'
import { Trigger } from './triggers'

export interface ProjectItem {
  id: string
  name: string
  type: 'item' | 'block'
  element?: Element
  trigger?: Trigger
}

export interface Project {
  version: string
  name: string
  items: ProjectItem[]
  createdAt: string
  modifiedAt: string
}

export function createEmptyProject(name: string): Project {
  const now = new Date().toISOString()
  return {
    version: '1.0',
    name,
    items: [],
    createdAt: now,
    modifiedAt: now
  }
}
```

**Step 14: Run test to verify it passes**

Run: `cd packages/shared && pnpm test`
Expected: PASS (7/7)

**Step 15: Create shared index exports**

Create: `packages/shared/src/index.ts`

```typescript
export * from './types/elements'
export * from './types/triggers'
export * from './types/project'
```

**Step 16: Commit shared package**

```bash
git add packages/shared
git commit -m "feat(shared): add domain types with tests (elements, triggers, project)"
```

---

## Task 3: Create No-Stub Scanner Package

**Files:**
- Create: `packages/no-stub-scanner/package.json`
- Create: `packages/no-stub-scanner/tsconfig.json`
- Create: `packages/no-stub-scanner/src/scanner.ts`
- Create: `packages/no-stub-scanner/src/scanner.test.ts`
- Create: `packages/no-stub-scanner/src/cli.ts`

**Step 1: Write failing test for stub detection**

Create: `packages/no-stub-scanner/src/scanner.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { scanForStubs } from './scanner'

describe('No-Stub Scanner', () => {
  it('should detect echo provider', () => {
    const code = `
      export const voiceService = new EchoVoiceProvider()
    `
    const violations = scanForStubs(code, 'test.ts')
    expect(violations).toHaveLength(1)
    expect(violations[0].pattern).toBe('EchoVoiceProvider')
  })

  it('should detect mock provider', () => {
    const code = `
      const llm = new MockLLMGateway()
    `
    const violations = scanForStubs(code, 'test.ts')
    expect(violations).toHaveLength(1)
    expect(violations[0].pattern).toBe('MockLLMGateway')
  })

  it('should allow test files to use mocks', () => {
    const code = `
      const mock = new MockLLMGateway()
    `
    const violations = scanForStubs(code, 'test.test.ts')
    expect(violations).toHaveLength(0)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `cd packages/no-stub-scanner && pnpm test`
Expected: FAIL with "Cannot find module './scanner'"

**Step 3: Create scanner implementation**

Create: `packages/no-stub-scanner/src/scanner.ts`

```typescript
export interface Violation {
  file: string
  line: number
  column: number
  pattern: string
  message: string
}

const FORBIDDEN_PATTERNS = [
  'EchoVoiceProvider',
  'MockVoiceProvider',
  'MockLLMGateway',
  'DummyExporter',
  'StubExporter',
  'FakeVoiceService'
]

export function scanForStubs(code: string, filename: string): Violation[] {
  // Skip test files
  if (filename.includes('.test.') || filename.includes('.spec.')) {
    return []
  }

  const violations: Violation[] = []
  const lines = code.split('\n')

  lines.forEach((line, index) => {
    FORBIDDEN_PATTERNS.forEach(pattern => {
      if (line.includes(pattern)) {
        violations.push({
          file: filename,
          line: index + 1,
          column: line.indexOf(pattern) + 1,
          pattern,
          message: `Forbidden stub/mock pattern "${pattern}" found in production code`
        })
      }
    })
  })

  return violations
}
```

**Step 4: Run test to verify it passes**

Run: `cd packages/no-stub-scanner && pnpm test`
Expected: PASS (3/3)

**Step 5: Write failing test for file scanning**

Add to `packages/no-stub-scanner/src/scanner.test.ts`:

```typescript
import { scanFile } from './scanner'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'

describe('File Scanner', () => {
  const testDir = join(__dirname, '__test-files__')

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  it('should scan file and detect violations', async () => {
    const testFile = join(testDir, 'bad.ts')
    writeFileSync(testFile, 'const x = new MockLLMGateway()')

    const violations = await scanFile(testFile)
    expect(violations).toHaveLength(1)
  })
})
```

**Step 6: Run test to verify it fails**

Run: `cd packages/no-stub-scanner && pnpm test`
Expected: FAIL with "scanFile is not a function"

**Step 7: Implement file scanning**

Update: `packages/no-stub-scanner/src/scanner.ts`

```typescript
import { readFileSync } from 'fs'

// ... existing code ...

export async function scanFile(filepath: string): Promise<Violation[]> {
  const code = readFileSync(filepath, 'utf-8')
  return scanForStubs(code, filepath)
}
```

**Step 8: Run test to verify it passes**

Run: `cd packages/no-stub-scanner && pnpm test`
Expected: PASS (4/4)

**Step 9: Create CLI**

Create: `packages/no-stub-scanner/src/cli.ts`

```typescript
#!/usr/bin/env node
import { globSync } from 'glob'
import { scanFile } from './scanner'

async function main() {
  const files = globSync('packages/*/src/**/*.ts', {
    ignore: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**']
  })

  console.log(`Scanning ${files.length} files...`)

  let totalViolations = 0

  for (const file of files) {
    const violations = await scanFile(file)
    if (violations.length > 0) {
      console.error(`\n❌ ${file}:`)
      violations.forEach(v => {
        console.error(`  Line ${v.line}:${v.column} - ${v.message}`)
      })
      totalViolations += violations.length
    }
  }

  if (totalViolations > 0) {
    console.error(`\n❌ Found ${totalViolations} violations`)
    process.exit(1)
  } else {
    console.log('\n✅ No violations found')
    process.exit(0)
  }
}

main()
```

**Step 10: Create package.json**

Create: `packages/no-stub-scanner/package.json`

```json
{
  "name": "@kms/no-stub-scanner",
  "version": "0.0.0",
  "type": "module",
  "main": "./src/scanner.ts",
  "bin": {
    "no-stub-scan": "./src/cli.ts"
  },
  "scripts": {
    "scan": "tsx src/cli.ts",
    "test": "vitest run"
  },
  "dependencies": {
    "glob": "^10.3.10"
  },
  "devDependencies": {
    "typescript": "workspace:*",
    "vitest": "^1.1.0",
    "tsx": "^4.7.0",
    "@types/node": "workspace:*"
  }
}
```

**Step 11: Add scan script to root**

Update: `package.json`

```json
{
  "scripts": {
    "scan": "pnpm --filter @kms/no-stub-scanner scan"
  }
}
```

**Step 12: Test scanner CLI**

Run: `pnpm scan`
Expected: "✅ No violations found"

**Step 13: Commit no-stub scanner**

```bash
git add packages/no-stub-scanner package.json
git commit -m "feat(no-stub-scanner): add scanner with CLI for production code validation"
```

---

## Task 4: Setup Electron Main Package

**Files:**
- Create: `packages/main/package.json`
- Create: `packages/main/tsconfig.json`
- Create: `packages/main/vite.config.ts`
- Create: `packages/main/src/index.ts`
- Create: `packages/main/src/window.ts`

**Step 1: Create main package.json**

```json
{
  "name": "@kms/main",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "electron": "^28.1.0"
  },
  "devDependencies": {
    "vite": "^5.0.10",
    "vite-plugin-electron": "^0.28.1",
    "typescript": "workspace:*",
    "@types/node": "workspace:*"
  }
}
```

**Step 2: Create vite.config.ts**

Create: `packages/main/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'

export default defineConfig({
  plugins: [
    electron({
      entry: 'src/index.ts'
    })
  ]
})
```

**Step 3: Create minimal main process**

Create: `packages/main/src/index.ts`

```typescript
import { app, BrowserWindow } from 'electron'
import { createMainWindow } from './window'

let mainWindow: BrowserWindow | null = null

app.whenReady().then(() => {
  mainWindow = createMainWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    mainWindow = createMainWindow()
  }
})
```

**Step 4: Create window factory**

Create: `packages/main/src/window.ts`

```typescript
import { BrowserWindow } from 'electron'
import { join } from 'path'

export function createMainWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: join(__dirname, '../preload/dist/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(join(__dirname, '../renderer/dist/index.html'))
  }

  return win
}
```

**Step 5: Create tsconfig.json**

Create: `packages/main/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "types": ["node"]
  },
  "include": ["src/**/*"]
}
```

**Step 6: Commit main package**

```bash
git add packages/main
git commit -m "feat(main): add electron main process with window management"
```

---

## Task 5: Setup Renderer Package (React UI)

**Files:**
- Create: `packages/renderer/package.json`
- Create: `packages/renderer/tsconfig.json`
- Create: `packages/renderer/vite.config.ts`
- Create: `packages/renderer/index.html`
- Create: `packages/renderer/src/main.tsx`
- Create: `packages/renderer/src/App.tsx`
- Create: `packages/renderer/src/vite-env.d.ts`

**Step 1: Create renderer package.json**

```json
{
  "name": "@kms/renderer",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "@kms/shared": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.10",
    "vitest": "^1.1.0",
    "typescript": "workspace:*"
  }
}
```

**Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist'
  }
})
```

**Step 3: Create index.html**

```html
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>KidModStudio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 4: Write failing test for App component**

Create: `packages/renderer/src/App.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('should render workbench title', () => {
    render(<App />)
    expect(screen.getByText('KidModStudio')).toBeInTheDocument()
  })

  it('should NOT show export button initially (No-Fake)', () => {
    render(<App />)
    expect(screen.queryByText(/export/i)).not.toBeInTheDocument()
  })

  it('should NOT show Crafty button initially (No-Fake)', () => {
    render(<App />)
    expect(screen.queryByText(/crafty/i)).not.toBeInTheDocument()
  })
})
```

**Step 5: Run test to verify it fails**

Run: `cd packages/renderer && pnpm test`
Expected: FAIL with "Cannot find module './App'"

**Step 6: Create minimal App component (No-Fake compliant)**

Create: `packages/renderer/src/App.tsx`

```typescript
import { FC } from 'react'

const App: FC = () => {
  return (
    <div className="app">
      <header>
        <h1>KidModStudio</h1>
      </header>

      <main className="workbench">
        <div className="workbench-left">
          {/* Item Library - Sprint 1 */}
        </div>

        <div className="workbench-center">
          {/* 3D Preview - Sprint 2 */}
        </div>

        <div className="workbench-right">
          {/* Properties Panel - Sprint 1 */}
        </div>
      </main>

      {/* No Export button - not implemented yet (No-Fake) */}
      {/* No Crafty window - not implemented yet (No-Fake) */}
    </div>
  )
}

export default App
```

**Step 7: Add testing library**

Update: `packages/renderer/package.json` devDependencies:

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "jsdom": "^23.0.1"
  }
}
```

**Step 8: Create vitest setup**

Create: `packages/renderer/vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts'
  }
})
```

Create: `packages/renderer/src/test-setup.ts`

```typescript
import '@testing-library/jest-dom/vitest'
```

**Step 9: Run test to verify it passes**

Run: `cd packages/renderer && pnpm install && pnpm test`
Expected: PASS (3/3)

**Step 10: Create main entry point**

Create: `packages/renderer/src/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**Step 11: Create minimal CSS**

Create: `packages/renderer/src/index.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: #f5f5f5;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: #2563eb;
  color: white;
  padding: 1rem;
}

.workbench {
  flex: 1;
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  gap: 1rem;
  padding: 1rem;
}

.workbench-left,
.workbench-center,
.workbench-right {
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
```

**Step 12: Create vite-env.d.ts**

Create: `packages/renderer/src/vite-env.d.ts`

```typescript
/// <reference types="vite/client" />
```

**Step 13: Commit renderer package**

```bash
git add packages/renderer
git commit -m "feat(renderer): add react UI with workbench shell (No-Fake compliant)"
```

---

## Task 6: Setup Preload Package (IPC Bridge)

**Files:**
- Create: `packages/preload/package.json`
- Create: `packages/preload/tsconfig.json`
- Create: `packages/preload/vite.config.ts`
- Create: `packages/preload/src/index.ts`

**Step 1: Create preload package.json**

```json
{
  "name": "@kms/preload",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "scripts": {
    "build": "vite build",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "electron": "workspace:*"
  },
  "devDependencies": {
    "vite": "^5.0.10",
    "typescript": "workspace:*",
    "@types/node": "workspace:*"
  }
}
```

**Step 2: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['cjs'],
      fileName: 'index'
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['electron']
    }
  }
})
```

**Step 3: Create preload script with type-safe API**

Create: `packages/preload/src/index.ts`

```typescript
import { contextBridge, ipcRenderer } from 'electron'

// Type-safe API exposed to renderer
export interface ElectronAPI {
  // Future: saveProject, loadProject, etc.
  // Sprint 0: Empty (No-Fake)
  platform: NodeJS.Platform
}

const api: ElectronAPI = {
  platform: process.platform
}

contextBridge.exposeInMainWorld('electronAPI', api)
```

**Step 4: Create type declarations for renderer**

Create: `packages/preload/src/electron-api.d.ts`

```typescript
import { ElectronAPI } from './index'

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
```

**Step 5: Commit preload package**

```bash
git add packages/preload
git commit -m "feat(preload): add IPC bridge with type-safe API"
```

---

## Task 7: Setup CI Pipeline with No-Stub Scanner

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/no-stub-scan.yml`

**Step 1: Create main CI workflow**

Create: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Run tests
        run: pnpm test

      - name: Build
        run: pnpm build
```

**Step 2: Create No-Stub Scanner workflow**

Create: `.github/workflows/no-stub-scan.yml`

```yaml
name: No-Stub Scanner

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  scan:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run No-Stub Scanner
        run: pnpm scan

      - name: Upload scan report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: no-stub-violations
          path: |
            packages/**/src/**/*.ts
```

**Step 3: Test CI locally (optional)**

Run: `pnpm typecheck && pnpm test && pnpm scan`
Expected: All pass

**Step 4: Commit CI workflows**

```bash
git add .github
git commit -m "ci: add CI pipeline with no-stub scanner enforcement"
```

---

## Task 8: Create stubs.md Tracking File

**Files:**
- Create: `docs/stubs.md`

**Step 1: Create stubs tracking document**

Create: `docs/stubs.md`

```markdown
# Stubs & Placeholders Tracking

> **No-Fake Foundation Rule:** This file tracks all placeholders/stubs that exist in the codebase.
> Each item MUST be replaced with real implementation before the feature can be shown in UI.

## Sprint 0 - Foundation

### ✅ Completed
- [x] Monorepo structure
- [x] Type definitions (elements, triggers, project)
- [x] No-Stub Scanner
- [x] Basic Electron shell
- [x] React UI shell (No-Fake compliant)

### 🚧 Placeholders (Not Yet Started)
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
```

**Step 2: Commit stubs tracking**

```bash
git add docs/stubs.md
git commit -m "docs: add stubs.md for No-Fake Foundation tracking"
```

---

## Task 9: Integration Test - Full App Launch

**Files:**
- Create: `packages/main/test/app-launch.spec.ts`
- Update: `packages/main/package.json`

**Step 1: Add Playwright to main package**

Update: `packages/main/package.json`

```json
{
  "devDependencies": {
    "@playwright/test": "^1.40.1",
    "playwright": "^1.40.1"
  },
  "scripts": {
    "test:e2e": "playwright test"
  }
}
```

**Step 2: Create Playwright config**

Create: `packages/main/playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './test',
  timeout: 30000,
  use: {
    trace: 'on-first-retry'
  }
})
```

**Step 3: Write E2E test for app launch**

Create: `packages/main/test/app-launch.spec.ts`

```typescript
import { test, expect } from '@playwright/test'
import { _electron as electron } from 'playwright'

test('Sprint 0 - App launches with workbench shell', async () => {
  const app = await electron.launch({
    args: ['./dist/index.js']
  })

  const window = await app.firstWindow()

  // Wait for app to load
  await window.waitForLoadState('domcontentloaded')

  // Verify title
  const title = await window.title()
  expect(title).toContain('KidModStudio')

  // Verify No-Fake compliance: NO export button
  const exportButton = await window.locator('button:has-text("export")').count()
  expect(exportButton).toBe(0)

  // Verify No-Fake compliance: NO Crafty window
  const craftyWindow = await window.locator('[data-testid="crafty-window"]').count()
  expect(craftyWindow).toBe(0)

  // Verify workbench layout exists
  const workbench = await window.locator('.workbench').count()
  expect(workbench).toBe(1)

  await app.close()
})
```

**Step 4: Build app before E2E**

Run: `pnpm build`
Expected: All packages build successfully

**Step 5: Run E2E test**

Run: `cd packages/main && pnpm test:e2e`
Expected: PASS (Sprint 0 E2E test)

**Step 6: Commit E2E test**

```bash
git add packages/main/test packages/main/playwright.config.ts packages/main/package.json
git commit -m "test(main): add E2E test for Sprint 0 app launch (No-Fake verification)"
```

---

## Task 10: Create Sprint 0 Demo Script

**Files:**
- Create: `docs/demos/sprint-0-demo.md`

**Step 1: Write demo script**

Create: `docs/demos/sprint-0-demo.md`

```markdown
# Sprint 0 Demo Script

**Duration:** 60 seconds
**Goal:** Demonstrate No-Fake Foundation is working

## Setup (before demo)

```bash
# Clean install
rm -rf node_modules packages/*/node_modules
pnpm install

# Run CI checks
pnpm typecheck
pnpm test
pnpm scan
```

## Demo Flow

### Part 1: No-Stub Scanner Enforcement (20 seconds)

1. **Show scanner works:**
   ```bash
   pnpm scan
   # Expected: ✅ No violations found
   ```

2. **Demonstrate violation detection:**
   - Open `packages/renderer/src/App.tsx`
   - Add line: `const bad = new MockLLMGateway()`
   - Run: `pnpm scan`
   - Expected: ❌ Violation found with file/line number
   - Revert change

### Part 2: App Launches (No-Fake Compliant) (30 seconds)

3. **Build and launch app:**
   ```bash
   pnpm build
   pnpm dev
   ```

4. **Verify in app:**
   - ✅ Window opens with "KidModStudio" title
   - ✅ Workbench layout visible (3 columns)
   - ❌ NO "Export" button (not implemented yet)
   - ❌ NO "Crafty" window (not implemented yet)
   - → **No-Fake rule working!**

### Part 3: CI Pipeline (10 seconds)

5. **Show CI config:**
   - Open `.github/workflows/no-stub-scan.yml`
   - Explain: "Every commit runs scanner automatically"
   - Show: "Build breaks if violations found"

## Success Criteria

- [x] Scanner detects forbidden patterns
- [x] CI pipeline configured
- [x] App launches with basic shell
- [x] No fake/stub UI elements visible
- [x] E2E test passes
```

**Step 2: Test demo script**

Run through the demo script to verify all steps work.

**Step 3: Commit demo script**

```bash
git add docs/demos
git commit -m "docs: add Sprint 0 demo script (60 second reproducible demo)"
```

---

## Task 11: Update Documentation

**Files:**
- Update: `README.md`
- Create: `docs/architecture.md`

**Step 1: Create README**

Create: `README.md`

```markdown
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
```

**Step 2: Create architecture documentation**

Create: `docs/architecture.md`

```markdown
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
// ❌ WRONG - shows button even if exporter doesn't exist
<button onClick={exportMod}>Export</button>

// ✅ CORRECT - button only appears when exporter ready
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
```

**Step 3: Commit documentation**

```bash
git add README.md docs/architecture.md
git commit -m "docs: add README and architecture documentation for Sprint 0"
```

---

## Task 12: Final Sprint 0 Verification

**Step 1: Clean install and full test**

```bash
# Clean everything
rm -rf node_modules packages/*/node_modules packages/*/dist

# Fresh install
pnpm install

# Run all checks
pnpm typecheck
pnpm test
pnpm scan
pnpm build
```

Expected: All pass ✅

**Step 2: Run E2E test**

```bash
cd packages/main
pnpm test:e2e
```

Expected: Sprint 0 E2E test passes ✅

**Step 3: Run demo script**

Follow `docs/demos/sprint-0-demo.md` exactly.

Expected: 60-second demo completes successfully ✅

**Step 4: Verify stubs.md is accurate**

Review `docs/stubs.md` - all Sprint 0 items should be marked complete.

**Step 5: Create Sprint 0 completion tag**

```bash
git tag -a sprint-0-complete -m "Sprint 0: No-Fake Foundation complete

- Monorepo structure with pnpm workspaces
- Type-safe domain model (@kms/shared)
- No-Stub scanner with CI enforcement
- Electron app with React UI shell
- No fake UI elements (Export/Crafty hidden)
- E2E test for No-Fake compliance
- 60-second reproducible demo

Next: Sprint 1 - Save/Load functionality"

git push origin sprint-0-complete
```

---

## Sprint 0 Definition of Done ✅

**Verify all criteria:**

- [x] No-Stub Gate exists and blocks violations
- [x] CI runs scanner automatically (`.github/workflows/no-stub-scan.yml`)
- [x] Scan report uploaded as artifact on failure
- [x] Workbench shell renders with 3-column layout
- [x] Export button NOT visible (No-Fake)
- [x] Crafty window NOT visible (No-Fake)
- [x] Demo script executable in 60 seconds
- [x] E2E test passes (app-launch.spec.ts)
- [x] All unit tests pass (`pnpm test`)
- [x] Type check passes (`pnpm typecheck`)
- [x] Build succeeds (`pnpm build`)
- [x] `docs/stubs.md` reflects current state

**User Value Demonstrated:**

Parents/Team can see: "What is clickable actually works." The foundation prevents showing fake features.

---

## Next Steps

**Sprint 1 Focus:** Save/Load functionality (Week 3-4)

Key tasks:
1. Project schema validator with fixtures
2. Redux store setup with actions (Create/Load/Save/Undo)
3. Atomic file save + backup
4. Load validation with friendly errors + restore flow
5. ItemLibraryPanel component (6-10 curated items)
6. PropertiesPanel with Element/Level/Trigger checklist
7. Golden test: Save/Load roundtrip produces identical state

**Ready to proceed to Sprint 1 planning?**
