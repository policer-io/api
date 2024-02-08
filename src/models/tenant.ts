import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import type { Api, DocumentCreate, DocumentRead, DocumentUpdate } from '../@types'

const model: FastifyPluginCallback = fp(
  async function (server) {
    server.log.debug('Tenant model attaching...')
    const { Schema, model } = server.mongoose

    const schema = new Schema<TenantSchema>(
      {
        name: { type: String, required: true, unique: true },
      },
      {
        optimisticConcurrency: true,
        timestamps: true,
      }
    )

    server.models.Tenant = model<TenantSchema>('Tenant', schema)

    // await server.models.Tenant.syncIndexes()

    server.log.debug('Tenant model attached')
  },
  {
    name: 'tenant-model',
    decorators: {
      fastify: ['mongoose', 'models', 'templates'],
    },
    dependencies: ['mongoose', 'documents'],
  }
)

export default model

// INTERFACES and TYPES

/** a tenant represents one organization (company) using the app  */
export interface TenantSchema {
  /**
   * name of the tenant
   *
   * @example "EMBRIO.tech AG"
   */
  name: string
}

export type TenantRead = DocumentRead<TenantSchema>
export type TenantItemResponse = Api.ItemResponse<TenantRead>
export type TenantListResponse = Api.ListResponse<TenantRead>
export type TenantCreate = DocumentCreate<TenantSchema, 'name'>
export type TenantUpdate = DocumentUpdate<TenantSchema>
