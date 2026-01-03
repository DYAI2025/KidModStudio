import { describe, it, expect } from 'vitest'
import { validateProject } from './project-schema'
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
