export const ELEMENT_TYPES = ['fire', 'ice', 'water', 'poison', 'healing', 'lightning', 'light'] as const
export type ElementType = typeof ELEMENT_TYPES[number]

export interface Element {
  type: ElementType
  level: 1 | 2 | 3
}

export function isValidElement(value: string): value is ElementType {
  return ELEMENT_TYPES.includes(value as ElementType)
}
