import { z } from 'zod'
import { ELEMENT_TYPES } from '../types/elements'
import { TRIGGER_TYPES } from '../types/triggers'

const ElementSchema = z.object({
  type: z.enum(ELEMENT_TYPES),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)])
})

const TriggerSchema = z.object({
  type: z.enum(TRIGGER_TYPES)
})

const ProjectItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['item', 'block']),
  element: ElementSchema.optional(),
  trigger: TriggerSchema.optional()
})

const ProjectSchema = z.object({
  version: z.string(),
  name: z.string().min(1),
  items: z.array(ProjectItemSchema),
  createdAt: z.string(),
  modifiedAt: z.string()
})

export type ValidatedProject = z.infer<typeof ProjectSchema>

export interface ValidationSuccess {
  success: true
  data: ValidatedProject
}

export interface ValidationFailure {
  success: false
  errors: z.ZodError
}

export type ValidationResult = ValidationSuccess | ValidationFailure

export function validateProject(data: unknown): ValidationResult {
  const result = ProjectSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error }
}

export class ProjectValidationError extends Error {
  constructor(public errors: z.ZodError) {
    super(`Project validation failed: ${errors.message}`)
    this.name = 'ProjectValidationError'
  }
}
