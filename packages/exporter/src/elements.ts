import { ElementType } from '@kms/shared'

export interface ElementConfig {
  enchantment: string
  color: string
  attribute: 'attack_damage' | 'attack_speed' | 'max_health' | 'movement_speed'
}

export const ELEMENT_CONFIG: Record<ElementType, ElementConfig> = {
  fire: { enchantment: 'fire_aspect', color: 'red', attribute: 'attack_damage' },
  ice: { enchantment: 'frost_walker', color: 'aqua', attribute: 'attack_speed' },
  water: { enchantment: 'knockback', color: 'blue', attribute: 'attack_damage' },
  poison: { enchantment: 'bane_of_arthropods', color: 'dark_purple', attribute: 'attack_damage' },
  healing: { enchantment: 'mending', color: 'green', attribute: 'max_health' },
  lightning: { enchantment: 'channeling', color: 'yellow', attribute: 'attack_damage' },
  light: { enchantment: 'unbreaking', color: 'white', attribute: 'movement_speed' }
}

export interface ResolvedElementConfig extends ElementConfig {
  enchantmentLevel: number
  damageBonus: number
}

export function getElementConfig(type: ElementType, level: 1 | 2 | 3): ResolvedElementConfig {
  const base = ELEMENT_CONFIG[type]
  return {
    ...base,
    enchantmentLevel: level,
    damageBonus: level * 2
  }
}
