import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import type { Api, DocumentCreate, DocumentRead, DocumentUpdate, ObjectId } from '../@types'
import { ApplicationDocumentSchema, TenantDocumentSchema } from '../plugins/documents'
import { ChangeType, changeTypes } from '../@types'
import { OPS_ENV } from '../config'

const ONE_YEAR = 365 * 24 * 60 * 60 * 1000
const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000

const model: FastifyPluginCallback = fp(
  async function (server) {
    server.log.debug('Change model attaching...')
    const { Schema, model } = server.mongoose

    const schema = new Schema<ChangeSchemaExtended>(
      {
        document: { type: Schema.Types.ObjectId, required: true },
        modelName: { type: String, required: true },
        type: {
          type: String,
          validate: {
            message: `Type must be one of: ${changeTypes.join(', ')}`,
            validator(item: unknown) {
              return changeTypes.includes(item as ChangeType)
            },
          },
          required: true,
        },
        diffs: {
          forward: { type: Schema.Types.Mixed, default: () => ({}) },
          backward: { type: Schema.Types.Mixed, default: () => ({}) },
        },
        expiresAt: {
          type: Date,
          default: () => Date.now() + (OPS_ENV === 'production' ? ONE_YEAR : TWO_WEEKS),
        },
      },
      {
        optimisticConcurrency: true,
        timestamps: true,
        minimize: false, // allows saving empty objects
      }
    )

    schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

    schema.add(server.templates.tenantDocumentSchema)
    schema.add(server.templates.applicationDocumentSchema)

    server.models.Change = model<ChangeSchemaExtended>('Change', schema)

    // await server.models.Change.syncIndexes()

    server.log.debug('Change model attached')
  },
  {
    name: 'change-model',
    decorators: {
      fastify: ['mongoose', 'models', 'templates'],
    },
    dependencies: ['mongoose', 'documents'],
  }
)

export default model

// INTERFACES and TYPES

export type Diff = Record<string | number, unknown>

/**
 * describes the document the changes in both directions
 */
export interface ChangeDiffs {
  /** apply the forward diff on the original document to reproduce the change */
  forward?: Diff

  /** apply the backward diff on the changed document to undo the change */
  backward?: Diff
}

/** a change documents implements a rule evaluating the access control context  */
export interface ChangeSchema<ModelName extends string = string> {
  /**
   * reference to the document the change is logged for
   */
  document: ObjectId

  /** the model name of the changed document  */
  modelName: ModelName

  type: ChangeType

  diffs: ChangeDiffs

  /**
   * the duration the change log remains stored in the db
   *
   * @default "Date.now() + ONE_YEAR"
   */
  expiresAt: Date
}

export type ChangeSchemaExtended<ModelName extends string = string> = ChangeSchema<ModelName> & TenantDocumentSchema & ApplicationDocumentSchema

export type ChangeRead = DocumentRead<ChangeSchemaExtended>
export type ChangeItemResponse = Api.ItemResponse<ChangeRead>
export type ChangeListResponse = Api.ListResponse<ChangeRead>
export type ChangeCreate = DocumentCreate<ChangeSchema & ApplicationDocumentSchema & TenantDocumentSchema, 'document' | 'modelName' | 'type'>
export type ChangeUpdate = DocumentUpdate<ChangeSchema>
