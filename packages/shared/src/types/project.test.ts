import { describe, it, expect } from 'vitest'
import { createEmptyProject } from './project'

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
