# Sprint 3: Minecraft Datapack Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an "Exportieren" button that generates a Minecraft 1.20.5+ datapack with custom items using enchantments mapped from KidModStudio elements.

**Architecture:** New `@kms/exporter` package generates datapack folder structure with `.mcfunction` files containing `/give` commands. IPC handler in main process shows folder dialog and writes files. Renderer adds export button to Header with validation.

**Tech Stack:** TypeScript, Node.js fs/promises, Electron dialog API

---

## Task 1: Create Exporter Package Structure

**Files:**
- Create: `packages/exporter/package.json`
- Create: `packages/exporter/tsconfig.json`
- Create: `packages/exporter/src/index.ts`

**Step 1: Create package.json**

Create: `packages/exporter/package.json`

```json
{
  "name": "@kms/exporter",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@kms/shared": "workspace:*"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "vitest": "^1.1.0"
  }
}
```

**Step 2: Create tsconfig.json**

Create: `packages/exporter/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create index.ts stub**

Create: `packages/exporter/src/index.ts`

```typescript
export { generateDatapack } from './datapack'
export { generateItemCommand } from './items'
export { ELEMENT_CONFIG } from './elements'
```

**Step 4: Install dependencies**

Run: `pnpm install`
Expected: Dependencies resolved

**Step 5: Commit**

```bash
git add packages/exporter
git commit -m "feat(exporter): create package structure"
```

---

## Task 2: Implement Element Configuration

**Files:**
- Create: `packages/exporter/src/elements.ts`
- Create: `packages/exporter/src/elements.test.ts`

**Step 1: Write the failing test**

Create: `packages/exporter/src/elements.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { ELEMENT_CONFIG, getElementConfig } from './elements'

describe('ELEMENT_CONFIG', () => {
  it('should have config for all 7 elements', () => {
    expect(Object.keys(ELEMENT_CONFIG)).toHaveLength(7)
    expect(ELEMENT_CONFIG.fire).toBeDefined()
    expect(ELEMENT_CONFIG.ice).toBeDefined()
    expect(ELEMENT_CONFIG.water).toBeDefined()
    expect(ELEMENT_CONFIG.poison).toBeDefined()
    expect(ELEMENT_CONFIG.healing).toBeDefined()
    expect(ELEMENT_CONFIG.lightning).toBeDefined()
    expect(ELEMENT_CONFIG.light).toBeDefined()
  })

  it('should have enchantment for fire', () => {
    expect(ELEMENT_CONFIG.fire.enchantment).toBe('fire_aspect')
    expect(ELEMENT_CONFIG.fire.color).toBe('red')
  })

  it('should have enchantment for ice', () => {
    expect(ELEMENT_CONFIG.ice.enchantment).toBe('frost_walker')
    expect(ELEMENT_CONFIG.ice.color).toBe('aqua')
  })
})

describe('getElementConfig', () => {
  it('should return damage bonus based on level', () => {
    const config = getElementConfig('fire', 1)
    expect(config.damageBonus).toBe(2)
  })

  it('should scale damage with level', () => {
    expect(getElementConfig('fire', 2).damageBonus).toBe(4)
    expect(getElementConfig('fire', 3).damageBonus).toBe(6)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @kms/exporter test`
Expected: FAIL with "Cannot find module './elements'"

**Step 3: Implement elements.ts**

Create: `packages/exporter/src/elements.ts`

```typescript
import { ElementType } from '@kms/shared'

export interface ElementConfig {
  enchantment: string
  color: string
  attribute: 'attack_damage' | 'attack_speed' | 'max_health' | 'movement_speed'
}

export const ELEMENT_CONFIG: Record<ElementType, ElementConfig> = {
  fire: { enchantment: 'fire_aspect', color: 'red', attribute: 'attack_damage' },
  ice: { enchantment: 'frost_walker', color: 'aqua', attribute: 'attack_speed' },
  water: { enchantment: 'knockback', color: 'blue', attribute: 'attack_damage' },
  poison: { enchantment: 'bane_of_arthropods', color: 'dark_purple', attribute: 'attack_damage' },
  healing: { enchantment: 'mending', color: 'green', attribute: 'max_health' },
  lightning: { enchantment: 'channeling', color: 'yellow', attribute: 'attack_damage' },
  light: { enchantment: 'unbreaking', color: 'white', attribute: 'movement_speed' }
}

export interface ResolvedElementConfig extends ElementConfig {
  enchantmentLevel: number
  damageBonus: number
}

export function getElementConfig(type: ElementType, level: 1 | 2 | 3): ResolvedElementConfig {
  const base = ELEMENT_CONFIG[type]
  return {
    ...base,
    enchantmentLevel: level,
    damageBonus: level * 2
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @kms/exporter test`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/exporter/src/elements.ts packages/exporter/src/elements.test.ts
git commit -m "feat(exporter): add element configuration with enchantment mapping"
```

---

## Task 3: Implement Item Command Generator

**Files:**
- Create: `packages/exporter/src/items.ts`
- Create: `packages/exporter/src/items.test.ts`

**Step 1: Write the failing test**

Create: `packages/exporter/src/items.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { generateItemCommand } from './items'
import { ProjectItem } from '@kms/shared'

describe('generateItemCommand', () => {
  it('should generate give command for fire sword', () => {
    const item: ProjectItem = {
      id: '1',
      name: 'Feuerschwert',
      type: 'item',
      element: { type: 'fire', level: 2 }
    }
    const cmd = generateItemCommand(item)

    expect(cmd).toContain('give @s minecraft:diamond_sword')
    expect(cmd).toContain('fire_aspect')
    expect(cmd).toContain('"color":"red"')
    expect(cmd).toContain('Feuerschwert')
  })

  it('should generate block for type block', () => {
    const item: ProjectItem = {
      id: '2',
      name: 'Eisblock',
      type: 'block',
      element: { type: 'ice', level: 1 }
    }
    const cmd = generateItemCommand(item)

    expect(cmd).toContain('minecraft:diamond_block')
    expect(cmd).toContain('"color":"aqua"')
  })

  it('should scale enchantment level with element level', () => {
    const item: ProjectItem = {
      id: '3',
      name: 'Test',
      type: 'item',
      element: { type: 'fire', level: 3 }
    }
    const cmd = generateItemCommand(item)

    expect(cmd).toContain('"minecraft:fire_aspect":3')
  })

  it('should handle item without element', () => {
    const item: ProjectItem = {
      id: '4',
      name: 'Plain Sword',
      type: 'item'
    }
    const cmd = generateItemCommand(item)

    expect(cmd).toContain('give @s minecraft:diamond_sword')
    expect(cmd).toContain('Plain Sword')
    expect(cmd).not.toContain('enchantments')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @kms/exporter test`
Expected: FAIL with "Cannot find module './items'"

**Step 3: Implement items.ts**

Create: `packages/exporter/src/items.ts`

```typescript
import { ProjectItem } from '@kms/shared'
import { getElementConfig, ELEMENT_CONFIG } from './elements'

export function generateItemCommand(item: ProjectItem): string {
  const baseItem = item.type === 'block' ? 'minecraft:diamond_block' : 'minecraft:diamond_sword'

  const components: string[] = []

  // Custom name with color
  const color = item.element ? ELEMENT_CONFIG[item.element.type].color : 'gray'
  const customName = `minecraft:custom_name='{"text":"${item.name}","color":"${color}","italic":false}'`
  components.push(customName)

  // Enchantments and attributes if element exists
  if (item.element) {
    const config = getElementConfig(item.element.type, item.element.level)

    // Enchantments
    const enchantments = `minecraft:enchantments={levels:{"minecraft:${config.enchantment}":${config.enchantmentLevel}}}`
    components.push(enchantments)

    // Attribute modifiers
    const attributes = `minecraft:attribute_modifiers=[{type:"minecraft:${config.attribute}",amount:${config.damageBonus},operation:"add_value",slot:"mainhand",id:"kidmod:bonus"}]`
    components.push(attributes)
  }

  return `give @s ${baseItem}[${components.join(',')}]`
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @kms/exporter test`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/exporter/src/items.ts packages/exporter/src/items.test.ts
git commit -m "feat(exporter): add item command generator for Minecraft 1.20.5+"
```

---

## Task 4: Implement Datapack Generator

**Files:**
- Create: `packages/exporter/src/datapack.ts`
- Create: `packages/exporter/src/datapack.test.ts`

**Step 1: Write the failing test**

Create: `packages/exporter/src/datapack.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { generateDatapackStructure, generatePackMcmeta, generateGiveFunction } from './datapack'
import { createEmptyProject } from '@kms/shared'

describe('generatePackMcmeta', () => {
  it('should generate valid pack.mcmeta for 1.20.5+', () => {
    const mcmeta = generatePackMcmeta('Test Project')
    const parsed = JSON.parse(mcmeta)

    expect(parsed.pack.pack_format).toBe(41)
    expect(parsed.pack.description).toContain('Test Project')
  })
})

describe('generateGiveFunction', () => {
  it('should generate mcfunction content', () => {
    const item = {
      id: '1',
      name: 'Fire Sword',
      type: 'item' as const,
      element: { type: 'fire' as const, level: 2 as const }
    }
    const content = generateGiveFunction(item)

    expect(content).toContain('# Fire Sword')
    expect(content).toContain('give @s')
  })
})

describe('generateDatapackStructure', () => {
  it('should return file map with correct paths', () => {
    const project = createEmptyProject('MyMod')
    project.items = [
      { id: '1', name: 'Fire Sword', type: 'item', element: { type: 'fire', level: 1 } }
    ]

    const files = generateDatapackStructure(project)

    expect(files['pack.mcmeta']).toBeDefined()
    expect(files['data/kidmod/function/give/fire_sword.mcfunction']).toBeDefined()
    expect(files['data/kidmod/function/give_all.mcfunction']).toBeDefined()
  })

  it('should sanitize file names', () => {
    const project = createEmptyProject('Test')
    project.items = [
      { id: '1', name: 'Über Schwert!', type: 'item', element: { type: 'fire', level: 1 } }
    ]

    const files = generateDatapackStructure(project)

    expect(files['data/kidmod/function/give/uber_schwert.mcfunction']).toBeDefined()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @kms/exporter test`
Expected: FAIL with "Cannot find module './datapack'"

**Step 3: Implement datapack.ts**

Create: `packages/exporter/src/datapack.ts`

```typescript
import { Project, ProjectItem } from '@kms/shared'
import { generateItemCommand } from './items'

export function generatePackMcmeta(projectName: string): string {
  return JSON.stringify({
    pack: {
      pack_format: 41,
      description: `KidModStudio: ${projectName}`
    }
  }, null, 2)
}

export function generateGiveFunction(item: ProjectItem): string {
  const command = generateItemCommand(item)
  return `# ${item.name}\n# Generated by KidModStudio\n${command}\n`
}

function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}

export function generateDatapackStructure(project: Project): Record<string, string> {
  const files: Record<string, string> = {}

  // pack.mcmeta
  files['pack.mcmeta'] = generatePackMcmeta(project.name)

  // Individual give functions
  const functionCalls: string[] = []

  for (const item of project.items) {
    const fileName = sanitizeFileName(item.name)
    const path = `data/kidmod/function/give/${fileName}.mcfunction`
    files[path] = generateGiveFunction(item)
    functionCalls.push(`function kidmod:give/${fileName}`)
  }

  // give_all function
  files['data/kidmod/function/give_all.mcfunction'] =
    `# Give all items from ${project.name}\n# Generated by KidModStudio\n\n${functionCalls.join('\n')}\n`

  return files
}

export async function generateDatapack(project: Project, outputPath: string): Promise<void> {
  const { mkdir, writeFile } = await import('fs/promises')
  const { join, dirname } = await import('path')

  const files = generateDatapackStructure(project)

  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = join(outputPath, relativePath)
    await mkdir(dirname(fullPath), { recursive: true })
    await writeFile(fullPath, content, 'utf-8')
  }
}
```

**Step 4: Run test to verify it passes**

Run: `pnpm --filter @kms/exporter test`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/exporter/src/datapack.ts packages/exporter/src/datapack.test.ts
git commit -m "feat(exporter): add datapack structure generator"
```

---

## Task 5: Add Export IPC Handler

**Files:**
- Create: `packages/main/src/ipc/export.ts`
- Modify: `packages/main/src/ipc/index.ts`

**Step 1: Create export IPC handler**

Create: `packages/main/src/ipc/export.ts`

```typescript
import { ipcMain, dialog } from 'electron'
import { Project } from '@kms/shared'
import { generateDatapack } from '@kms/exporter'

export interface ExportResult {
  success: boolean
  path?: string
  error?: string
}

export function registerExportHandlers(): void {
  ipcMain.handle('export:datapack', async (_, project: Project): Promise<ExportResult> => {
    if (!project.items.length) {
      return { success: false, error: 'Keine Items zum Exportieren' }
    }

    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Datapack exportieren',
      defaultPath: `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_datapack`,
      properties: ['createDirectory', 'showOverwriteConfirmation']
    })

    if (canceled || !filePath) {
      return { success: false, error: 'Abgebrochen' }
    }

    try {
      await generateDatapack(project, filePath)
      return { success: true, path: filePath }
    } catch (err) {
      return { success: false, error: `Export fehlgeschlagen: ${err}` }
    }
  })
}
```

**Step 2: Register handler in main IPC index**

Read and modify: `packages/main/src/ipc/index.ts`

Add import and registration:

```typescript
import { registerExportHandlers } from './export'

// In the registration function, add:
registerExportHandlers()
```

**Step 3: Add exporter dependency to main package**

Modify: `packages/main/package.json`

Add to dependencies:
```json
"@kms/exporter": "workspace:*"
```

**Step 4: Install and typecheck**

Run: `pnpm install && pnpm --filter @kms/main typecheck`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/main/src/ipc/export.ts packages/main/src/ipc/index.ts packages/main/package.json pnpm-lock.yaml
git commit -m "feat(main): add export IPC handler for datapack generation"
```

---

## Task 6: Add Export to Preload API

**Files:**
- Modify: `packages/preload/src/index.ts`
- Modify: `packages/shared/src/types/api.ts`

**Step 1: Update API types**

Modify: `packages/shared/src/types/api.ts`

Add export types:

```typescript
export interface ExportResult {
  success: boolean
  path?: string
  error?: string
}

export interface ExportAPI {
  datapack: (project: Project) => Promise<ExportResult>
}

// Update ElectronAPI interface:
export interface ElectronAPI {
  platform: NodeJS.Platform
  project: ProjectAPI
  export: ExportAPI
}
```

**Step 2: Update preload to expose export API**

Modify: `packages/preload/src/index.ts`

Add export API:

```typescript
export: {
  datapack: (project: Project) => ipcRenderer.invoke('export:datapack', project)
}
```

**Step 3: Typecheck**

Run: `pnpm --filter @kms/preload typecheck`
Expected: PASS

**Step 4: Commit**

```bash
git add packages/preload/src/index.ts packages/shared/src/types/api.ts
git commit -m "feat(preload): expose export API to renderer"
```

---

## Task 7: Add Export Button to Header

**Files:**
- Modify: `packages/renderer/src/components/Header.tsx`
- Modify: `packages/renderer/src/components/Header.test.tsx`

**Step 1: Add test for export button**

Add to: `packages/renderer/src/components/Header.test.tsx`

```typescript
it('should show Exportieren button when project is loaded', () => {
  const project = createEmptyProject('Test')
  renderWithStore(<Header />, {
    project: { project, filePath: null, isDirty: false, selectedItemId: null }
  })
  expect(screen.getByText('Exportieren')).toBeInTheDocument()
})

it('should show alert when exporting empty project', () => {
  const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
  const project = createEmptyProject('Test')

  renderWithStore(<Header />, {
    project: { project, filePath: null, isDirty: false, selectedItemId: null }
  })

  fireEvent.click(screen.getByText('Exportieren'))

  expect(alertMock).toHaveBeenCalledWith('Keine Items zum Exportieren')
  alertMock.mockRestore()
})

it('should show alert when exporting items without element', () => {
  const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
  const project = createEmptyProject('Test')
  project.items = [{ id: '1', name: 'Test', type: 'item' }]

  renderWithStore(<Header />, {
    project: { project, filePath: null, isDirty: false, selectedItemId: null }
  })

  fireEvent.click(screen.getByText('Exportieren'))

  expect(alertMock).toHaveBeenCalledWith(
    expect.stringContaining('Bitte wähle zuerst Element')
  )
  alertMock.mockRestore()
})
```

**Step 2: Run tests to verify they fail**

Run: `pnpm --filter @kms/renderer test`
Expected: FAIL

**Step 3: Update Header component**

Modify: `packages/renderer/src/components/Header.tsx`

Add handleExport function and button:

```typescript
const handleExport = async () => {
  if (!project) return

  if (project.items.length === 0) {
    alert('Keine Items zum Exportieren')
    return
  }

  const incompleteItems = project.items.filter(
    item => !item.element && !item.trigger
  )
  if (incompleteItems.length > 0) {
    const itemNames = incompleteItems.map(i => i.name).join(', ')
    alert(`Bitte wähle zuerst Element oder Trigger für: ${itemNames}`)
    return
  }

  const result = await window.electronAPI.export.datapack(project)
  if (result.success) {
    alert(`Datapack exportiert nach:\n${result.path}`)
  } else if (result.error !== 'Abgebrochen') {
    alert(result.error)
  }
}

// In JSX, add button after Speichern:
{project && (
  <>
    <button onClick={handleSave}>
      Speichern
      {isDirty && <span className="dirty-indicator">●</span>}
    </button>
    <button onClick={handleExport}>Exportieren</button>
  </>
)}
```

**Step 4: Run tests**

Run: `pnpm --filter @kms/renderer test`
Expected: PASS

**Step 5: Commit**

```bash
git add packages/renderer/src/components/Header.tsx packages/renderer/src/components/Header.test.tsx
git commit -m "feat(renderer): add Exportieren button to Header"
```

---

## Task 8: Update Stubs and Final Verification

**Files:**
- Modify: `docs/stubs.md`

**Step 1: Update stubs.md**

Update Sprint 3 section:

```markdown
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
```

Remove from Placeholders:
```markdown
- [ ] `packages/exporter/` - Entire package (Sprint 3)
```

**Step 2: Run full verification**

```bash
pnpm typecheck
pnpm test
pnpm scan
```

Expected: All pass

**Step 3: Commit and push**

```bash
git add docs/stubs.md
git commit -m "docs: update stubs.md with Sprint 3 completion"
git push
```

---

## Summary

**Sprint 3 delivers:**
- New `@kms/exporter` package
- Element → Minecraft Enchantment mapping
- Datapack generator for Minecraft 1.20.5+
- "Exportieren" button with validation
- Generated files: `pack.mcmeta`, `.mcfunction` per item, `give_all.mcfunction`

**Total tasks:** 8
**Test coverage:** Element config, item commands, datapack structure, Header validation
