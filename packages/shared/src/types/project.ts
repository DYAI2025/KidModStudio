import { Element } from './elements'
import { Trigger } from './triggers'

export interface ProjectItem {
  id: string
  name: string
  type: 'item' | 'block'
  element?: Element
  trigger?: Trigger
}

export interface Project {
  version: string
  name: string
  items: ProjectItem[]
  createdAt: string
  modifiedAt: string
}

export function createEmptyProject(name: string): Project {
  const now = new Date().toISOString()
  return {
    version: '1.0',
    name,
    items: [],
    createdAt: now,
    modifiedAt: now
  }
}
