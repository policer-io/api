import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import type { Api, DocumentCreate, DocumentRead, DocumentUpdate, ObjectIdNullable } from '../@types'
import { ApplicationDocumentSchema, TenantDocumentSchema } from '../plugins/documents'
import { LogicRead } from './logic'

const model: FastifyPluginCallback = fp(
  async function (server) {
    server.log.debug('Permission model attaching...')
    const { Schema, model } = server.mongoose

    const schema = new Schema<PermissionSchema>(
      {
        name: { type: String, required: true },
        condition: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
        filter: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
        projection: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
      },
      {
        optimisticConcurrency: true,
        timestamps: true,
      }
    )

    schema.add(server.templates.tenantDocumentSchema)
    schema.add(server.templates.applicationDocumentSchema)

    server.models.Permission = model<PermissionSchema>('Permission', schema)

    // await server.models.Permission.syncIndexes()

    server.log.debug('Permission model attached')
  },
  {
    name: 'permission-model',
    decorators: {
      fastify: ['mongoose', 'models', 'templates'],
    },
    dependencies: ['mongoose', 'documents'],
  }
)

export default model

// INTERFACES and TYPES

/** a permission documents allows a certain action and optionally defines corresponding constraints  */
export interface PermissionSchema<Logic = ObjectIdNullable> {
  /**
   * name of the permission
   *
   * names can be freely chosen, but it is recommended to use the format `'{RESOURCE}:{ACTION}'`
   *
   * Permission name can have wildcards `*`, for example `'book:*'` allows the holder of the permission to do all book related actions.
   *
   * @example "book:read"
   */
  name: string

  /**
   * reference to the Logic defining the conditions for access.
   *
   * defaults to `null`. If `null` the owner of the permission has conditionless permission.
   *
   * @example null
   */
  condition: Logic

  /**
   * reference to the Logic returning possible DB query filters for a list of a given resource.
   *
   * defaults to `null`. If `null` the owner of the permission can query resources without conditions.
   *
   * @example null
   */
  filter: Logic

  /**
   * reference to the Logic returning a projection describing which properties of the database resource can be accessed
   *
   * defaults to `null`. If `null` the owner of the permission can access all properties of a given resource.
   *
   * @example null
   */
  projection: Logic
}

export type PermissionSchemaExtended<Logic = ObjectIdNullable> = PermissionSchema<Logic> & TenantDocumentSchema & ApplicationDocumentSchema

export type PermissionSchemaLogicPopulated = PermissionSchemaExtended<LogicRead | Record<string, unknown> | null>

export type PermissionRead = DocumentRead<PermissionSchemaExtended>
export type PermissionItemResponse = Api.ItemResponse<PermissionRead>
export type PermissionListResponse = Api.ListResponse<PermissionRead>
export type PermissionCreate = DocumentCreate<PermissionSchema & ApplicationDocumentSchema, 'name' | 'application'>
export type PermissionUpdate = DocumentUpdate<PermissionSchema>
