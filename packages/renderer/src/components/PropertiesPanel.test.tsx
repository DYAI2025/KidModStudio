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
