import { readFile, writeFile, rename, copyFile, access } from 'fs/promises'
import { validateProject, ProjectValidationError, Project } from '@kms/shared'

export class FileService {
  async saveProject(filePath: string, project: Project): Promise<void> {
    // Create backup if file exists
    if (await this.fileExists(filePath)) {
      const backupPath = filePath + '.backup'
      await copyFile(filePath, backupPath)
    }

    // Atomic write: write to temp, then rename
    const tempPath = filePath + '.tmp'
    const content = JSON.stringify(project, null, 2)
    await writeFile(tempPath, content, 'utf-8')
    await rename(tempPath, filePath)
  }

  async loadProject(filePath: string): Promise<Project> {
    const content = await readFile(filePath, 'utf-8')
    const data = JSON.parse(content)

    const result = validateProject(data)
    if (!result.success) {
      throw new ProjectValidationError(result.errors)
    }

    return result.data
  }

  async restoreBackup(filePath: string): Promise<void> {
    const backupPath = filePath + '.backup'
    if (!(await this.fileExists(backupPath))) {
      throw new Error('No backup file found')
    }
    await copyFile(backupPath, filePath)
  }

  private async fileExists(path: string): Promise<boolean> {
    try {
      await access(path)
      return true
    } catch {
      return false
    }
  }
}
