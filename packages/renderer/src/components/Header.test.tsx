import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { projectReducer } from '../store/projectSlice'
import Header from './Header'
import { createEmptyProject } from '@kms/shared'

// Mock electronAPI
const mockElectronAPI = {
  platform: 'linux' as const,
  project: {
    new: vi.fn(),
    save: vi.fn(),
    saveAs: vi.fn(),
    load: vi.fn(),
    restoreBackup: vi.fn()
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(window as any).electronAPI = mockElectronAPI
})

function renderWithStore(ui: React.ReactElement, preloadedState = {}) {
  const store = configureStore({
    reducer: { project: projectReducer },
    preloadedState
  })
  return { ...render(<Provider store={store}>{ui}</Provider>), store }
}

describe('Header', () => {
  it('should show app title', () => {
    renderWithStore(<Header />)
    expect(screen.getByText('KidModStudio')).toBeInTheDocument()
  })

  it('should show Neu button', () => {
    renderWithStore(<Header />)
    expect(screen.getByText('Neu')).toBeInTheDocument()
  })

  it('should show Laden button', () => {
    renderWithStore(<Header />)
    expect(screen.getByText('Laden')).toBeInTheDocument()
  })

  it('should show Speichern button when project is loaded', () => {
    const project = createEmptyProject('Test')
    renderWithStore(<Header />, {
      project: { project, filePath: null, isDirty: false, selectedItemId: null }
    })
    expect(screen.getByText('Speichern')).toBeInTheDocument()
  })

  it('should NOT show Speichern button when no project', () => {
    renderWithStore(<Header />)
    expect(screen.queryByText('Speichern')).not.toBeInTheDocument()
  })

  it('should call project.new when Neu clicked', async () => {
    mockElectronAPI.project.new.mockResolvedValue(createEmptyProject('Neues Projekt'))
    const { store } = renderWithStore(<Header />)

    fireEvent.click(screen.getByText('Neu'))

    await waitFor(() => {
      expect(mockElectronAPI.project.new).toHaveBeenCalledWith('Neues Projekt')
      expect(store.getState().project.project?.name).toBe('Neues Projekt')
    })
  })

  it('should call project.load when Laden clicked', async () => {
    const project = createEmptyProject('Loaded Project')
    mockElectronAPI.project.load.mockResolvedValue({ project, filePath: '/path/file.kms' })
    const { store } = renderWithStore(<Header />)

    fireEvent.click(screen.getByText('Laden'))

    await waitFor(() => {
      expect(mockElectronAPI.project.load).toHaveBeenCalled()
      expect(store.getState().project.project?.name).toBe('Loaded Project')
      expect(store.getState().project.filePath).toBe('/path/file.kms')
    })
  })

  it('should show dirty indicator when project modified', () => {
    const project = createEmptyProject('Test')
    renderWithStore(<Header />, {
      project: { project, filePath: '/file.kms', isDirty: true, selectedItemId: null }
    })
    expect(screen.getByText('●')).toBeInTheDocument()
  })

  it('should show alert when saving items without element or trigger', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const project = createEmptyProject('Test')
    project.items = [{ id: '1', name: 'Incomplete Item', type: 'item' }]

    renderWithStore(<Header />, {
      project: { project, filePath: '/file.kms', isDirty: true, selectedItemId: null }
    })

    fireEvent.click(screen.getByText('Speichern'))

    expect(alertMock).toHaveBeenCalledWith(
      'Bitte wähle zuerst Element oder Trigger für: Incomplete Item'
    )
    expect(mockElectronAPI.project.save).not.toHaveBeenCalled()
    alertMock.mockRestore()
  })

  it('should save when items have element or trigger', async () => {
    const project = createEmptyProject('Test')
    project.items = [{ id: '1', name: 'Complete Item', type: 'item', element: { type: 'fire', level: 1 } }]
    mockElectronAPI.project.saveAs.mockResolvedValue(undefined)

    renderWithStore(<Header />, {
      project: { project, filePath: '/file.kms', isDirty: true, selectedItemId: null }
    })

    fireEvent.click(screen.getByText('Speichern'))

    await waitFor(() => {
      expect(mockElectronAPI.project.saveAs).toHaveBeenCalledWith('/file.kms', project)
    })
  })
})
