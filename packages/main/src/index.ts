import { app, BrowserWindow } from 'electron'
import { createMainWindow } from './window'
import { registerProjectHandlers } from './ipc/project-handlers'
import { registerExportHandlers } from './ipc/export-handlers'

app.whenReady().then(() => {
  registerProjectHandlers()
  registerExportHandlers()
  createMainWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})
