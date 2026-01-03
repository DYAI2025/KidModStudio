import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { projectReducer } from './store/projectSlice'
import App from './App'
import { createEmptyProject } from '@kms/shared'

// Mock react-three/fiber since it requires WebGL
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="three-canvas">{children}</div>
  ),
  useFrame: () => {}
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  Environment: () => null,
  Sparkles: () => null
}))

// Mock electronAPI
beforeEach(() => {
  ;(window as any).electronAPI = {
    platform: 'linux',
    project: {
      new: vi.fn(),
      save: vi.fn(),
      saveAs: vi.fn(),
      load: vi.fn(),
      restoreBackup: vi.fn()
    }
  }
})

function renderWithStore(preloadedState = {}) {
  const store = configureStore({
    reducer: { project: projectReducer },
    preloadedState
  })
  return render(<Provider store={store}><App /></Provider>)
}

describe('App', () => {
  it('should render workbench title', () => {
    renderWithStore()
    expect(screen.getByText('KidModStudio')).toBeInTheDocument()
  })

  it('should show welcome message when no project', () => {
    renderWithStore()
    expect(screen.getByText('Willkommen bei KidModStudio!')).toBeInTheDocument()
  })

  it('should NOT show export button (No-Fake)', () => {
    renderWithStore()
    expect(screen.queryByText(/export/i)).not.toBeInTheDocument()
  })

  it('should NOT show Crafty button (No-Fake)', () => {
    renderWithStore()
    expect(screen.queryByText(/crafty/i)).not.toBeInTheDocument()
  })

  it('should show library panel', () => {
    renderWithStore()
    expect(screen.getByText('Bibliothek')).toBeInTheDocument()
  })

  it('should show properties panel', () => {
    renderWithStore()
    expect(screen.getByText('Eigenschaften')).toBeInTheDocument()
  })

  it('should show 3D preview when project loaded', () => {
    const project = createEmptyProject('Test')
    renderWithStore({
      project: { project, filePath: null, isDirty: false, selectedItemId: null }
    })
    expect(screen.getByTestId('three-canvas')).toBeInTheDocument()
  })
})
