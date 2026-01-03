import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { scanForStubs, scanFile } from './scanner'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('No-Stub Scanner', () => {
  it('should detect echo provider', () => {
    const code = `
      export const voiceService = new EchoVoiceProvider()
    `
    const violations = scanForStubs(code, 'test.ts')
    expect(violations).toHaveLength(1)
    expect(violations[0].pattern).toBe('EchoVoiceProvider')
  })

  it('should detect mock provider', () => {
    const code = `
      const llm = new MockLLMGateway()
    `
    const violations = scanForStubs(code, 'test.ts')
    expect(violations).toHaveLength(1)
    expect(violations[0].pattern).toBe('MockLLMGateway')
  })

  it('should allow test files to use mocks', () => {
    const code = `
      const mock = new MockLLMGateway()
    `
    const violations = scanForStubs(code, 'test.test.ts')
    expect(violations).toHaveLength(0)
  })
})

describe('File Scanner', () => {
  const testDir = join(__dirname, '__test-files__')

  beforeEach(() => {
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  it('should scan file and detect violations', async () => {
    const testFile = join(testDir, 'bad.ts')
    writeFileSync(testFile, 'const x = new MockLLMGateway()')

    const violations = await scanFile(testFile)
    expect(violations).toHaveLength(1)
  })
})
