import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import type { Schema } from 'mongoose'
import type { ObjectId } from '../@types'

// TODO: remove UserDocumentSchema if change logger is implemented, because it becomes obsolete.

/** adds user references to document (`createdBy`, `updatedBy`) */
export interface UserDocumentSchema {
  /** the id of the employee or user who created the document
   *
   * @nullable
   * @format bsonOrUuid
   * @pattern (^[a-f\d]{24}$)|(^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$)
   * @asType string
   */
  createdBy: ObjectId
  /** the id of the employee or user who last updated the document
   *
   * @nullable
   * @format bsonOrUuid
   * @pattern (^[a-f\d]{24}$)|(^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$)
   * @asType string
   */
  updatedBy: ObjectId
}

/** adds a tenant reference to a document */
export interface TenantDocumentSchema {
  /**
   * the `_id` of the tenant the document belongs to
   *
   * @format ObjectId
   * @pattern ^[a-f\d]{24}$
   * @asType string
   * @example "507f1f77bcf86cd799439022"
   */
  tenant: ObjectId
}

/** adds a branch reference to a document */
export interface ApplicationDocumentSchema {
  /** the `_id` of the application the document belongs to
   *
   * @format ObjectId
   * @pattern ^[a-f\d]{24}$
   * @asType string
   * @example "507f1f77bcf86cd799439033"
   */
  application: ObjectId
}

export interface ArchivableDocumentSchema {
  /**
   * allows to soft-delete documents
   *
   * @type {boolean}
   * @memberof ArchivableDocumentSchema
   */
  archived: boolean
}

export interface DocumentTemplates {
  userDocumentSchema: Schema<UserDocumentSchema>
  tenantDocumentSchema: Schema<TenantDocumentSchema>
  applicationDocumentSchema: Schema<ApplicationDocumentSchema>
  archivableDocumentSchema: Schema<ArchivableDocumentSchema>
}

const plugin: FastifyPluginCallback = fp(
  async function (server) {
    server.log.debug('Document templates attaching...')
    const { Schema, Types } = server.mongoose

    const userDocumentSchema = new Schema<UserDocumentSchema>({
      createdBy: { type: String, default: null },
      updatedBy: { type: String, default: null },
    })

    const tenantDocumentSchema = new Schema<TenantDocumentSchema>({
      tenant: { type: Types.ObjectId, default: null, ref: 'Tenant' },
    })

    const applicationDocumentSchema = new Schema<ApplicationDocumentSchema>({
      application: { type: Types.ObjectId, default: null, ref: 'Application' },
    })

    const archivableDocumentSchema = new Schema<ArchivableDocumentSchema>({
      archived: { type: Boolean, default: false },
    })

    server.decorate<DocumentTemplates>('templates', {
      userDocumentSchema,
      tenantDocumentSchema,
      applicationDocumentSchema,
      archivableDocumentSchema,
    })

    server.log.debug('Document templates attached')
  },
  {
    name: 'documents',
    decorators: {
      fastify: ['mongoose'],
    },
    dependencies: ['mongoose'],
  }
)

export default plugin
