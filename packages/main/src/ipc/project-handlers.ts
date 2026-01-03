import { ipcMain, dialog, BrowserWindow } from 'electron'
import { FileService } from '../services/file-service'
import { createEmptyProject, Project } from '@kms/shared'

const fileService = new FileService()

export function registerProjectHandlers(): void {
  ipcMain.handle('project:new', async (_event, name: string): Promise<Project> => {
    return createEmptyProject(name)
  })

  ipcMain.handle('project:save', async (event, project: Project): Promise<string | null> => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return null

    const result = await dialog.showSaveDialog(window, {
      title: 'Projekt speichern',
      defaultPath: `${project.name}.kms`,
      filters: [
        { name: 'KidModStudio Projekt', extensions: ['kms'] }
      ]
    })

    if (result.canceled || !result.filePath) {
      return null
    }

    await fileService.saveProject(result.filePath, project)
    return result.filePath
  })

  ipcMain.handle('project:saveAs', async (_event, filePath: string, project: Project): Promise<void> => {
    await fileService.saveProject(filePath, project)
  })

  ipcMain.handle('project:load', async (event): Promise<{ project: Project; filePath: string } | null> => {
    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) return null

    const result = await dialog.showOpenDialog(window, {
      title: 'Projekt laden',
      filters: [
        { name: 'KidModStudio Projekt', extensions: ['kms'] }
      ],
      properties: ['openFile']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    const filePath = result.filePaths[0]
    const project = await fileService.loadProject(filePath)
    return { project, filePath }
  })

  ipcMain.handle('project:restoreBackup', async (_event, filePath: string): Promise<Project> => {
    await fileService.restoreBackup(filePath)
    return fileService.loadProject(filePath)
  })
}
