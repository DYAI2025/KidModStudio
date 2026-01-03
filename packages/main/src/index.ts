import { app, BrowserWindow } from 'electron'
import { createMainWindow } from './window'
import { registerProjectHandlers } from './ipc/project-handlers'

app.whenReady().then(() => {
  registerProjectHandlers()
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
