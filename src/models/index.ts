import type { Model } from 'mongoose'

import Tenant, { TenantSchema } from './tenant'

const models = { Tenant } as const

export type ModelName = keyof typeof models

export type Models = {
  Tenant: Model<TenantSchema>
}

export type QueryUtility = unknown

export default models

export * from './tenant'

interface ModelTag {
  name: ModelName | string
  description: string
}

/** Model descriptions used for swagger documentation */
export const modelTags: ModelTag[] = [{ name: 'Tenant', description: 'represents one organization (company) using the app' }]
