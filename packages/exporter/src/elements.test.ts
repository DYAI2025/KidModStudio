import { describe, it, expect } from 'vitest'
import { ELEMENT_CONFIG, getElementConfig } from './elements'

describe('ELEMENT_CONFIG', () => {
  it('should have config for all 7 elements', () => {
    expect(Object.keys(ELEMENT_CONFIG)).toHaveLength(7)
    expect(ELEMENT_CONFIG.fire).toBeDefined()
    expect(ELEMENT_CONFIG.ice).toBeDefined()
    expect(ELEMENT_CONFIG.water).toBeDefined()
    expect(ELEMENT_CONFIG.poison).toBeDefined()
    expect(ELEMENT_CONFIG.healing).toBeDefined()
    expect(ELEMENT_CONFIG.lightning).toBeDefined()
    expect(ELEMENT_CONFIG.light).toBeDefined()
  })

  it('should have enchantment for fire', () => {
    expect(ELEMENT_CONFIG.fire.enchantment).toBe('fire_aspect')
    expect(ELEMENT_CONFIG.fire.color).toBe('red')
  })

  it('should have enchantment for ice', () => {
    expect(ELEMENT_CONFIG.ice.enchantment).toBe('frost_walker')
    expect(ELEMENT_CONFIG.ice.color).toBe('aqua')
  })
})

describe('getElementConfig', () => {
  it('should return damage bonus based on level', () => {
    const config = getElementConfig('fire', 1)
    expect(config.damageBonus).toBe(2)
  })

  it('should scale damage with level', () => {
    expect(getElementConfig('fire', 2).damageBonus).toBe(4)
    expect(getElementConfig('fire', 3).damageBonus).toBe(6)
  })
})
