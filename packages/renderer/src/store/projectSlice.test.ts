import { describe, it, expect } from 'vitest'
import { projectReducer, projectActions, initialState } from './projectSlice'
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
