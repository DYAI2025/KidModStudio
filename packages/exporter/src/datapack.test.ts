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
