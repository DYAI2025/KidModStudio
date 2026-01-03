import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Project, ProjectItem } from '@kms/shared'

export interface ProjectState {
  project: Project | null
  filePath: string | null
  isDirty: boolean
  selectedItemId: string | null
}

export const initialState: ProjectState = {
  project: null,
  filePath: null,
  isDirty: false,
  selectedItemId: null
}

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProject(state, action: PayloadAction<Project>) {
      state.project = action.payload
      state.isDirty = false
      state.selectedItemId = null
    },
    setFilePath(state, action: PayloadAction<string | null>) {
      state.filePath = action.payload
    },
    markDirty(state) {
      state.isDirty = true
      if (state.project) {
        state.project.modifiedAt = new Date().toISOString()
      }
    },
    markClean(state) {
      state.isDirty = false
    },
    addItem(state, action: PayloadAction<ProjectItem>) {
      if (state.project) {
        state.project.items.push(action.payload)
        state.isDirty = true
        state.project.modifiedAt = new Date().toISOString()
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      if (state.project) {
        state.project.items = state.project.items.filter((item: ProjectItem) => item.id !== action.payload)
        state.isDirty = true
        state.project.modifiedAt = new Date().toISOString()
        if (state.selectedItemId === action.payload) {
          state.selectedItemId = null
        }
      }
    },
    updateItem(state, action: PayloadAction<{ id: string; changes: Partial<ProjectItem> }>) {
      if (state.project) {
        const index = state.project.items.findIndex((item: ProjectItem) => item.id === action.payload.id)
        if (index !== -1) {
          state.project.items[index] = { ...state.project.items[index], ...action.payload.changes }
          state.isDirty = true
          state.project.modifiedAt = new Date().toISOString()
        }
      }
    },
    selectItem(state, action: PayloadAction<string | null>) {
      state.selectedItemId = action.payload
    }
  }
})

export const projectActions = projectSlice.actions
export const projectReducer = projectSlice.reducer
