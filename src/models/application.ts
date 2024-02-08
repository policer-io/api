import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import type { Api, DocumentCreate, DocumentRead, DocumentUpdate } from '../@types'
import { TenantDocumentSchema } from '../plugins/documents'

const model: FastifyPluginCallback = fp(
  async function (server) {
    server.log.debug('Application model attaching...')
    const { Schema, model } = server.mongoose

    const schema = new Schema<ApplicationSchema>(
      {
        name: { type: String, required: true },
      },
      {
        optimisticConcurrency: true,
        timestamps: true,
      }
    )

    schema.add(server.templates.tenantDocumentSchema)

    // branch name must be unique for each tenant
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

/** a application represents one organization (company) using the app  */
export interface ApplicationSchema {
  /**
   * name of the application
   *
   * @example "pharmassist-p"
   */
  name: string
}

export type ApplicationSchemaExtended = ApplicationSchema & TenantDocumentSchema

export type ApplicationRead = DocumentRead<ApplicationSchemaExtended>
export type ApplicationItemResponse = Api.ItemResponse<ApplicationRead>
export type ApplicationListResponse = Api.ListResponse<ApplicationRead>
export type ApplicationCreate = DocumentCreate<ApplicationSchema, 'name'>
export type ApplicationUpdate = DocumentUpdate<ApplicationSchema>
