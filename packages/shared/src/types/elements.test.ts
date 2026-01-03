import { describe, it, expect } from 'vitest'
import { isValidElement } from './elements'

describe('Element Types', () => {
  it('should validate fire element', () => {
    expect(isValidElement('fire')).toBe(true)
  })

  it('should reject invalid element', () => {
    expect(isValidElement('invalid')).toBe(false)
  })
})
