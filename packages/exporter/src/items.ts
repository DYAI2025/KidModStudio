import { ProjectItem } from '@kms/shared'
import { getElementConfig, ELEMENT_CONFIG } from './elements'

export function generateItemCommand(item: ProjectItem): string {
  const baseItem = item.type === 'block' ? 'minecraft:diamond_block' : 'minecraft:diamond_sword'

  const components: string[] = []

  // Custom name with color
  const color = item.element ? ELEMENT_CONFIG[item.element.type].color : 'gray'
  const customName = `minecraft:custom_name='{"text":"${item.name}","color":"${color}","italic":false}'`
  components.push(customName)

  // Enchantments and attributes if element exists
  if (item.element) {
    const config = getElementConfig(item.element.type, item.element.level)

    // Enchantments
    const enchantments = `minecraft:enchantments={levels:{"minecraft:${config.enchantment}":${config.enchantmentLevel}}}`
    components.push(enchantments)

    // Attribute modifiers
    const attributes = `minecraft:attribute_modifiers=[{type:"minecraft:${config.attribute}",amount:${config.damageBonus},operation:"add_value",slot:"mainhand",id:"kidmod:bonus"}]`
    components.push(attributes)
  }

  return `give @s ${baseItem}[${components.join(',')}]`
}
