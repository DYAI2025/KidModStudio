import { FC } from 'react'
import { ElementType } from '@kms/shared'

export const ITEM_COLORS: Record<ElementType | 'default', string> = {
  fire: '#ff6b35',
  ice: '#74b9ff',
  water: '#0984e3',
  poison: '#6c5ce7',
  healing: '#00b894',
  lightning: '#fdcb6e',
  light: '#ffeaa7',
  default: '#a0a0a0'
}

interface GeometryConfig {
  type: 'sword' | 'pickaxe' | 'block'
}

export function getItemGeometry(itemType: 'item' | 'block'): GeometryConfig {
  return itemType === 'block'
    ? { type: 'block' }
    : { type: 'sword' }
}

interface VoxelItemProps {
  itemType: 'item' | 'block'
  elementType?: ElementType
}

const VoxelItem: FC<VoxelItemProps> = ({ itemType, elementType }) => {
  const color = elementType ? ITEM_COLORS[elementType] : ITEM_COLORS.default

  if (itemType === 'block') {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    )
  }

  // Sword geometry
  return (
    <group>
      {/* Blade */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.15, 1.2, 0.05]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Guard */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[0.4, 0.1, 0.1]} />
        <meshStandardMaterial color="#5a4a3a" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, -0.45, 0]}>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} />
      </mesh>
      {/* Pommel */}
      <mesh position={[0, -0.75, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#5a4a3a" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

export default VoxelItem
