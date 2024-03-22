import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import type { Api, DocumentCreate, DocumentRead, DocumentUpdate, ObjectId } from '../@types'
import { ApplicationDocumentSchema, TenantDocumentSchema } from '../plugins/documents'

const model: FastifyPluginCallback = fp(
  async function (server) {
    server.log.debug('Role model attaching...')
    const { Schema, model } = server.mongoose

    const schema = new Schema<RoleSchema>(
      {
        name: { type: String, required: true },
        description: { type: String, default: null },
        permissions: { type: [Schema.Types.ObjectId], ref: 'Permission', default: (): ObjectId[] => [] },
        inherits: { type: [Schema.Types.ObjectId], ref: 'Role', default: (): ObjectId[] => [] },
      },
      {
        optimisticConcurrency: true,
        timestamps: true,
      }
    )

    schema.add(server.templates.tenantDocumentSchema)
    schema.add(server.templates.applicationDocumentSchema)

    // role name must be unique for each tenant
    schema.index({ name: 1, tenant: 1, application: 1 }, { unique: true })

    server.models.Role = model<RoleSchema>('Role', schema)

    // await server.models.Role.syncIndexes()

    server.log.debug('Role model attached')
  },
  {
    name: 'role-model',
    decorators: {
      fastify: ['mongoose', 'models', 'templates'],
    },
    dependencies: ['mongoose', 'documents'],
  }
)

export default model

// INTERFACES and TYPES

/**
 * a description of the role
 *
 * @example "managers are responsible for one or more stores"
 */
type Description = string

/** a role documents implements a rule evaluating the access control context  */
export interface RoleSchema<Permission = ObjectId> {
  /**
   * descriptive name of the role
   *
   * @example "manager"
   */
  name: string

  /** @example null */
  description: Description | null

  /**
   * the list of permissions a role has
   */
  permissions: Permission[]

  /**
   * references to parent roles that are inherited by this role
   */
  inherits: ObjectId[]
}

export type RoleSchemaExtended<Permission = ObjectId> = RoleSchema<Permission> & TenantDocumentSchema & ApplicationDocumentSchema

export type RoleRead = DocumentRead<RoleSchemaExtended>
export type RoleItemResponse = Api.ItemResponse<RoleRead>
export type RoleListResponse = Api.ListResponse<RoleRead>
export type RoleCreate = DocumentCreate<RoleSchema & ApplicationDocumentSchema, 'name'>
export type RoleUpdate = DocumentUpdate<RoleSchema>
