import { describe, it, expect } from 'vitest'
import { isValidTrigger } from './triggers'

describe('Trigger Types', () => {
  it('should validate use trigger', () => {
    expect(isValidTrigger('use')).toBe(true)
  })

  it('should validate hit trigger', () => {
    expect(isValidTrigger('hit')).toBe(true)
  })

  it('should reject open trigger in MVP', () => {
    expect(isValidTrigger('open')).toBe(false)
  })
})
