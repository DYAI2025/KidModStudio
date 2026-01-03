import { FC } from 'react'
import { Sparkles } from '@react-three/drei'
import { Element, ElementType } from '@kms/shared'

export const PARTICLE_COLORS: Record<ElementType, string> = {
  fire: '#ff4500',
  ice: '#00ffff',
  water: '#1e90ff',
  poison: '#9400d3',
  healing: '#32cd32',
  lightning: '#ffff00',
  light: '#fffacd'
}

interface ParticleConfig {
  count: number
  size: number
  speed: number
  opacity: number
}

export function getParticleConfig(level: 1 | 2 | 3): ParticleConfig {
  return {
    count: level * 15,
    size: 0.05 + level * 0.03,
    speed: 0.1 + level * 0.2,
    opacity: 0.5 + level * 0.15
  }
}

interface ElementParticlesProps {
  element: Element
}

const ElementParticles: FC<ElementParticlesProps> = ({ element }) => {
  const config = getParticleConfig(element.level)
  const color = PARTICLE_COLORS[element.type]

  return (
    <Sparkles
      count={config.count}
      size={config.size * 10}
      speed={config.speed}
      opacity={config.opacity}
      color={color}
      scale={[2, 2, 2]}
      noise={1}
    />
  )
}

export default ElementParticles
