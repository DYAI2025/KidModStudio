import { ipcMain, dialog, BrowserWindow } from 'electron'
import { Project } from '@kms/shared'
import { generateDatapack } from '@kms/exporter'

export interface ExportResult {
  success: boolean
  path?: string
  error?: string
}

export function registerExportHandlers(): void {
  ipcMain.handle('export:datapack', async (event, project: Project): Promise<ExportResult> => {
    if (!project.items.length) {
      return { success: false, error: 'Keine Items zum Exportieren' }
    }

    const window = BrowserWindow.fromWebContents(event.sender)
    if (!window) {
      return { success: false, error: 'Fenster nicht gefunden' }
    }

    const { filePath, canceled } = await dialog.showSaveDialog(window, {
      title: 'Datapack exportieren',
      defaultPath: `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_datapack`,
      properties: ['createDirectory', 'showOverwriteConfirmation']
    })

    if (canceled || !filePath) {
      return { success: false, error: 'Abgebrochen' }
    }

    try {
      await generateDatapack(project, filePath)
      return { success: true, path: filePath }
    } catch (err) {
      return { success: false, error: `Export fehlgeschlagen: ${err}` }
    }
  })
}
