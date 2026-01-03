import { contextBridge, ipcRenderer } from 'electron'
import { Project } from '@kms/shared'

// Type-safe API exposed to renderer
export interface ElectronAPI {
  platform: NodeJS.Platform
  project: {
    new: (name: string) => Promise<Project>
    save: (project: Project) => Promise<string | null>
    saveAs: (filePath: string, project: Project) => Promise<void>
    load: () => Promise<{ project: Project; filePath: string } | null>
    restoreBackup: (filePath: string) => Promise<Project>
  }
}

const api: ElectronAPI = {
  platform: process.platform,
  project: {
    new: (name: string) => ipcRenderer.invoke('project:new', name),
    save: (project: Project) => ipcRenderer.invoke('project:save', project),
    saveAs: (filePath: string, project: Project) => ipcRenderer.invoke('project:saveAs', filePath, project),
    load: () => ipcRenderer.invoke('project:load'),
    restoreBackup: (filePath: string) => ipcRenderer.invoke('project:restoreBackup', filePath)
  }
}

contextBridge.exposeInMainWorld('electronAPI', api)
