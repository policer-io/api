import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import type { Api, DocumentCreate, DocumentRead, DocumentUpdate, ObjectId } from '../@types'
import { TenantDocumentSchema } from '../plugins/documents'

const model: FastifyPluginCallback = fp(
  async function (server) {
    server.log.debug('Application model attaching...')
    const { Schema, model } = server.mongoose

    const schema = new Schema<ApplicationSchema>(
      {
        name: { type: String, required: true },
        options: {
          global: {
            condition: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
            filter: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
            projection: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
          },
          merge: {
            filter: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
            projection: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
          },
        },
      },
      {
        optimisticConcurrency: true,
        timestamps: true,
      }
    )

    schema.add(server.templates.tenantDocumentSchema)

    // application name must be unique for each tenant
    schema.index({ name: 1, tenant: 1 }, { unique: true })

    server.models.Application = model<ApplicationSchema>('Application', schema)

    // await server.models.Application.syncIndexes()

    server.log.debug('Application model attached')
  },
  {
    name: 'application-model',
    decorators: {
      fastify: ['mongoose', 'models', 'templates'],
    },
    dependencies: ['mongoose', 'documents'],
  }
)

export default model

// INTERFACES and TYPES

/** a application represents one application or service */
export interface ApplicationSchema {
  /**
   * name of the application
   *
   * @example "pharmassist-p"
   */
  name: string

  /**
   * options that apply for the application
   */
  options: {
    /** Define logic that apply for all operations for the application. For example, only grant permission if `user.tenant` matches `document.tenant`. */
    global: {
      /**
       * reference to the Logic defining the conditions for access.
       *
       * defaults to `null`. If `null` the owner of the permission has conditionless permission.
       *
       * @example null
       */
      condition: ObjectId | null

      /**
       * reference to the Logic returning possible DB query filter for a list of a given resource.
       *
       * defaults to `null`. If `null` the owner of the permission can query resources without conditions.
       *
       * @example null
       */
      filter: ObjectId | null

      /**
       * reference to the Logic returning a projection describing which properties of the database resource can be accessed
       *
       * defaults to `null`. If `null` the owner of the permission can access all properties of a given resource.
       *
       * @example null
       */
      projection: ObjectId | null
    }

    /** Define logic how to merge filters or projections if multiple apply */
    merge: {
      /**
       * reference to the Logic that combines conditions if multiple apply. If `null` the following is applied as default:
       *
       * - If both `global.condition` and `permission.condition` apply they are merged with logical `AND`. This means both conditions musst return `true`.
       * - If multiple `permission.condition` apply—for example if multiple roles apply—they are merged with logical `OR`. This means
       * only one condition must return `true`—allow if one role has permission.
       *
       * rules context data provides:
       *
       * - `filters: Logic[]` - the list of the filter logics that apply
       * - `operation: string` - the name of the operation the permissions are checked for
       * - `type: 'global' | 'roles'` - merge is executed when either multiple roles apply (type `'roles'`)
       * or global and operation filter are defined (type `'global'`). Use `type` to implement different merge rules
       * for these two scenarios.
       *
       * @example null
       */
      condition: ObjectId | null

      /**
       * reference to the Logic returning possible DB query filter from multiple filters.
       *
       * how to merge filters if multiple apply. It is only executed if more than one filter applies.
       *
       * rules context data provides:
       *
       * - `filters: Logic[]` - the list of the filter logics that apply
       * - `operation: string` - the name of the operation the permissions are checked for
       * - `type: 'global' | 'roles'` - merge is executed when either multiple roles apply (type `'roles'`)
       * or global and operation filter are defined (type `'global'`). Use `type` to implement different merge rules
       * for these two scenarios.
       *
       * @example null
       */
      filter: ObjectId | null

      /**
       * how to merge projections if multiple apply. `mergeProjectios()` is only executed if more than one project applies.
       *
       * how to merge filters if multiple apply. It is only executed if more than one filter applies.
       *
       * rules context data provides:
       *
       * - `filters: Logic[]` - the list of the projection logics that apply
       * - `operation: string` - the name of the operation the permissions are checked for
       * - `type: 'global' | 'roles'` - merge is executed when either multiple roles apply (type `'roles'`)
       * or global and operation filter are defined (type `'global'`). Use `type` to implement different merge rules
       * for these two scenarios.
       *
       * @example null
       */
      projection: ObjectId | null
    }
  }
}

export type ApplicationSchemaExtended = ApplicationSchema & TenantDocumentSchema

export type ApplicationRead = DocumentRead<ApplicationSchemaExtended>
export type ApplicationItemResponse = Api.ItemResponse<ApplicationRead>
export type ApplicationListResponse = Api.ListResponse<ApplicationRead>
export type ApplicationCreate = DocumentCreate<ApplicationSchema, 'name'>
export type ApplicationUpdate = DocumentUpdate<ApplicationSchema>
