import type { Model } from 'mongoose'

import Permission, { type PermissionSchema } from './permission'
import Role, { type RoleSchema } from './role'
import Logic, { type LogicSchema } from './logic'
import Application, { type ApplicationPolicy, type ApplicationSchema } from './application'
import Tenant, { type TenantSchema } from './tenant'
import Change, { type ChangeSchema } from './change'
import type { Api } from '../@types'

const models = { Permission, Role, Logic, Application, Tenant, Change } as const

export type ModelName = keyof typeof models

export type Models = {
  Permission: Model<PermissionSchema>
  Role: Model<RoleSchema>
  Logic: Model<LogicSchema>
  Application: Model<ApplicationSchema>
  Tenant: Model<TenantSchema>
  Change: Model<ChangeSchema>
}

export type QueryUtility = {
  Application: {
    getPolicy: (_id: Api.IdParam['_id']) => Promise<ApplicationPolicy>
  }
}

export default models

export * from './permission'
export * from './role'
export * from './logic'
export * from './application'
export * from './tenant'
export * from './change'

interface ModelTag {
  name: ModelName | string
  description: string
}

/** Model descriptions used for swagger documentation */
export const modelTags: ModelTag[] = [
  { name: 'Permission', description: 'allows a certain action and optionally defines corresponding constraints' },
  { name: 'Role', description: 'groups a set of permissions' },
  { name: 'Logic', description: 'implements a rule evaluating the access control context' },
  { name: 'Application', description: 'represents one application or service' },
  { name: 'Tenant', description: 'represents one organization (company)' },
  { name: 'Change', description: 'is a log of a documents change serving as audit trail' },
]
