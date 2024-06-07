import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import type { Api, DocumentCreate, DocumentRead, DocumentUpdate } from '../@types'
import { ApplicationDocumentSchema, TenantDocumentSchema } from '../plugins/documents'
import { JsonLogicRule } from '../@types/logic'

const logicTypes = ['condition', 'filter', 'projection', 'setter'] as const

/**
 * The `type` of the logic determines the expected return value type
 *
 * ### Supported types
 *
 * - `'condition'` - should return a `boolean` value
 *
 * - `'filter'` - should return anything that describes a query filter on a database resource set
 *
 * - `'projection'` - should return anything that describes which properties of the database resource can be accessed
 */
type LogicType = (typeof logicTypes)[number]

const model: FastifyPluginCallback = fp(
  async function (server) {
    server.log.debug('Logic model attaching...')
    const { Schema, model } = server.mongoose

    const schema = new Schema<LogicSchema>(
      {
        name: { type: String, required: true },
        rule: { type: Schema.Types.Mixed, required: true },
        type: {
          type: String,
          validate: {
            message: `Type must be one of: ${logicTypes.join(', ')}`,
            validator(item: unknown) {
              return logicTypes.includes(item as LogicType)
            },
          },
          required: true,
        },
      },
      {
        optimisticConcurrency: true,
        timestamps: true,
        minimize: false, // allows saving empty objects
      }
    )

    schema.add(server.templates.tenantDocumentSchema)
    schema.add(server.templates.applicationDocumentSchema)

    // logic name must be unique for each tenant and application
    schema.index({ name: 1, tenant: 1, application: 1 }, { unique: true })

    server.models.Logic = model<LogicSchema>('Logic', schema)

    // await server.models.Logic.syncIndexes()

    server.log.debug('Logic model attached')
  },
  {
    name: 'logic-model',
    decorators: {
      fastify: ['mongoose', 'models', 'templates'],
    },
    dependencies: ['mongoose', 'documents'],
  }
)

export default model

// INTERFACES and TYPES

/** a logic documents implements a rule evaluating the access control context  */
export interface LogicSchema {
  /**
   * descriptive name of the logic
   *
   * @example "isOwnerOfDocument"
   */
  name: string

  rule: JsonLogicRule

  type: LogicType

  // TODO: add tests?
  // TODO: add context validation?
}

export type LogicSchemaExtended = LogicSchema & TenantDocumentSchema & ApplicationDocumentSchema

export type LogicRead = DocumentRead<LogicSchemaExtended>
export type LogicItemResponse = Api.ItemResponse<LogicRead>
export type LogicListResponse = Api.ListResponse<LogicRead>
export type LogicCreate = DocumentCreate<LogicSchema & ApplicationDocumentSchema, 'name' | 'rule' | 'type' | 'application'>
export type LogicUpdate = DocumentUpdate<LogicSchema>
