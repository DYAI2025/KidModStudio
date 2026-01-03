import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { FileService } from './file-service'
import { createEmptyProject } from '@kms/shared'
import { mkdirSync, rmSync, existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('FileService', () => {
  const testDir = join(__dirname, '__test-files__')
  let fileService: FileService

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true })
    fileService = new FileService()
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  describe('saveProject', () => {
    it('should save project to file', async () => {
      const project = createEmptyProject('Test Project')
      const filePath = join(testDir, 'test.kms')

      await fileService.saveProject(filePath, project)

      expect(existsSync(filePath)).toBe(true)
      const content = readFileSync(filePath, 'utf-8')
      const parsed = JSON.parse(content)
      expect(parsed.name).toBe('Test Project')
    })

    it('should create backup before overwriting', async () => {
      const project1 = createEmptyProject('Version 1')
      const project2 = createEmptyProject('Version 2')
      const filePath = join(testDir, 'test.kms')

      await fileService.saveProject(filePath, project1)
      await fileService.saveProject(filePath, project2)

      const backupPath = filePath + '.backup'
      expect(existsSync(backupPath)).toBe(true)
      const backup = JSON.parse(readFileSync(backupPath, 'utf-8'))
      expect(backup.name).toBe('Version 1')
    })

    it('should use atomic write (temp file + rename)', async () => {
      const project = createEmptyProject('Atomic Test')
      const filePath = join(testDir, 'atomic.kms')

      await fileService.saveProject(filePath, project)

      // Temp file should not exist after save
      expect(existsSync(filePath + '.tmp')).toBe(false)
      expect(existsSync(filePath)).toBe(true)
    })
  })

  describe('loadProject', () => {
    it('should load project from file', async () => {
      const project = createEmptyProject('Load Test')
      const filePath = join(testDir, 'load.kms')
      await fileService.saveProject(filePath, project)

      const loaded = await fileService.loadProject(filePath)

      expect(loaded.name).toBe('Load Test')
    })

    it('should throw on invalid project schema', async () => {
      const filePath = join(testDir, 'invalid.kms')
      const invalidData = { invalid: true }
      writeFileSync(filePath, JSON.stringify(invalidData))

      await expect(fileService.loadProject(filePath)).rejects.toThrow()
    })

    it('should throw on file not found', async () => {
      await expect(fileService.loadProject('/nonexistent.kms')).rejects.toThrow()
    })
  })

  describe('restoreBackup', () => {
    it('should restore from backup file', async () => {
      const project1 = createEmptyProject('Original')
      const project2 = createEmptyProject('Modified')
      const filePath = join(testDir, 'restore.kms')

      await fileService.saveProject(filePath, project1)
      await fileService.saveProject(filePath, project2)
      await fileService.restoreBackup(filePath)

      const restored = await fileService.loadProject(filePath)
      expect(restored.name).toBe('Original')
    })
  })
})
