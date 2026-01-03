import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { projectReducer } from '../../store/projectSlice'
import Preview3D from './Preview3D'
import { createEmptyProject } from '@kms/shared'

// Mock react-three/fiber since it requires WebGL
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="three-canvas">{children}</div>
  )
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Environment: () => null
}))

function renderWithStore(preloadedState = {}) {
  const store = configureStore({
    reducer: { project: projectReducer },
    preloadedState
  })
  return render(<Provider store={store}><Preview3D /></Provider>)
}

describe('Preview3D', () => {
  it('should show placeholder when no project', () => {
    renderWithStore()
    expect(screen.getByText('3D Vorschau')).toBeInTheDocument()
  })

  it('should show canvas when project exists', () => {
    const project = createEmptyProject('Test')
    renderWithStore({
      project: { project, filePath: null, isDirty: false, selectedItemId: null }
    })
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
  })

  it('should show "Wähle ein Item" when no item selected', () => {
    const project = createEmptyProject('Test')
    renderWithStore({
      project: { project, filePath: null, isDirty: false, selectedItemId: null }
    })
    expect(screen.getByText('Wähle ein Item')).toBeInTheDocument()
  })
})
