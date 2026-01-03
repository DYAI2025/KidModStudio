import { describe, it, expect } from 'vitest'
import { getParticleConfig, PARTICLE_COLORS } from './ElementParticles'

describe('ElementParticles', () => {
  it('should scale particle count with level', () => {
    expect(getParticleConfig(1).count).toBe(15)
    expect(getParticleConfig(2).count).toBe(30)
    expect(getParticleConfig(3).count).toBe(45)
  })

  it('should scale particle size with level', () => {
    expect(getParticleConfig(1).size).toBeCloseTo(0.08)
    expect(getParticleConfig(2).size).toBeCloseTo(0.11)
    expect(getParticleConfig(3).size).toBeCloseTo(0.14)
  })

  it('should scale speed with level', () => {
    expect(getParticleConfig(1).speed).toBeCloseTo(0.3)
    expect(getParticleConfig(2).speed).toBeCloseTo(0.5)
    expect(getParticleConfig(3).speed).toBeCloseTo(0.7)
  })

  it('should have colors for all elements', () => {
    expect(PARTICLE_COLORS.fire).toBe('#ff4500')
    expect(PARTICLE_COLORS.ice).toBe('#00ffff')
    expect(PARTICLE_COLORS.water).toBe('#1e90ff')
    expect(PARTICLE_COLORS.poison).toBe('#9400d3')
    expect(PARTICLE_COLORS.healing).toBe('#32cd32')
    expect(PARTICLE_COLORS.lightning).toBe('#ffff00')
    expect(PARTICLE_COLORS.light).toBe('#fffacd')
  })
})
