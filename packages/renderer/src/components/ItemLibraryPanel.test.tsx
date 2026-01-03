import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { projectReducer } from '../store/projectSlice'
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
