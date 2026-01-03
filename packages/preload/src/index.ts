import { contextBridge } from 'electron'

// Type-safe API exposed to renderer
export interface ElectronAPI {
  // Future: saveProject, loadProject, etc.
  // Sprint 0: Empty (No-Fake)
  platform: NodeJS.Platform
}

const api: ElectronAPI = {
  platform: process.platform
}

contextBridge.exposeInMainWorld('electronAPI', api)
