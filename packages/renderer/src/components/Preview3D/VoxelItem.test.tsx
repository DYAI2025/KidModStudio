import { describe, it, expect } from 'vitest'
import { getItemGeometry, ITEM_COLORS } from './VoxelItem'

describe('VoxelItem', () => {
  it('should return sword config for item type', () => {
    const config = getItemGeometry('item')
    expect(config.type).toBe('sword')
  })

  it('should return block config for block type', () => {
    const config = getItemGeometry('block')
    expect(config.type).toBe('block')
  })

  it('should have colors for all elements', () => {
    expect(ITEM_COLORS.fire).toBe('#ff6b35')
    expect(ITEM_COLORS.ice).toBe('#74b9ff')
    expect(ITEM_COLORS.water).toBe('#0984e3')
    expect(ITEM_COLORS.poison).toBe('#6c5ce7')
    expect(ITEM_COLORS.healing).toBe('#00b894')
    expect(ITEM_COLORS.lightning).toBe('#fdcb6e')
    expect(ITEM_COLORS.light).toBe('#ffeaa7')
  })

  it('should return default color when no element', () => {
    expect(ITEM_COLORS.default).toBe('#a0a0a0')
  })
})
