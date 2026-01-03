// MVP: Only use and hit triggers
export const TRIGGER_TYPES = ['use', 'hit'] as const
export type TriggerType = typeof TRIGGER_TYPES[number]

export interface Trigger {
  type: TriggerType
}

export function isValidTrigger(value: string): value is TriggerType {
  return TRIGGER_TYPES.includes(value as TriggerType)
}
