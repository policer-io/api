import type { Model } from 'mongoose'

import Logic, { LogicSchema } from './logic'
import Application, { ApplicationSchema } from './application'
import Tenant, { TenantSchema } from './tenant'

const models = { Logic, Application, Tenant } as const

export type ModelName = keyof typeof models

export type Models = {
  Logic: Model<LogicSchema>
  Application: Model<ApplicationSchema>
  Tenant: Model<TenantSchema>
}

export type QueryUtility = unknown

export default models

export * from './logic'
export * from './application'
export * from './tenant'

interface ModelTag {
  name: ModelName | string
  description: string
}

/** Model descriptions used for swagger documentation */
export const modelTags: ModelTag[] = [
  { name: 'Logic', description: 'implements a rule evaluating the access control context' },
  { name: 'Application', description: 'represents one application or service' },
  { name: 'Tenant', description: 'represents one organization (company)' },
]
