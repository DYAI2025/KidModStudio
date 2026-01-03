import { readFileSync } from 'fs'

export interface Violation {
  file: string
  line: number
  column: number
  pattern: string
  message: string
}

const FORBIDDEN_PATTERNS = [
  'EchoVoiceProvider',
  'MockVoiceProvider',
  'MockLLMGateway',
  'DummyExporter',
  'StubExporter',
  'FakeVoiceService'
]

export function scanForStubs(code: string, filename: string): Violation[] {
  // Skip test files
  if (filename.includes('.test.') || filename.includes('.spec.')) {
    return []
  }

  const violations: Violation[] = []
  const lines = code.split('\n')

  lines.forEach((line, index) => {
    FORBIDDEN_PATTERNS.forEach(pattern => {
      if (line.includes(pattern)) {
        violations.push({
          file: filename,
          line: index + 1,
          column: line.indexOf(pattern) + 1,
          pattern,
          message: `Forbidden stub/mock pattern "${pattern}" found in production code`
        })
      }
    })
  })

  return violations
}

export async function scanFile(filepath: string): Promise<Violation[]> {
  const code = readFileSync(filepath, 'utf-8')
  return scanForStubs(code, filepath)
}
