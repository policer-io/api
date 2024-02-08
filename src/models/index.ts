import type { Model } from 'mongoose'

import Application, { ApplicationSchema } from './application'
import Tenant, { TenantSchema } from './tenant'

const models = { Tenant, Application } as const

export type ModelName = keyof typeof models

export type Models = {
  Application: Model<ApplicationSchema>
  Tenant: Model<TenantSchema>
}

export type QueryUtility = unknown

export default models

export * from './application'
export * from './tenant'

interface ModelTag {
  name: ModelName | string
  description: string
}

/** Model descriptions used for swagger documentation */
export const modelTags: ModelTag[] = [
  { name: 'Application', description: 'represents one application or service' },
  { name: 'Tenant', description: 'represents one organization (company)' },
]
