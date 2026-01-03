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
