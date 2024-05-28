import { ApplicationDocumentSchema, TenantDocumentSchema } from '../plugins/documents'
import type { Document } from './models'

export const changeTypes = ['create', 'update', 'remove'] as const

/**
 * The `type` of the change describes the nature of the doocument change
 *
 * ### Supported types
 *
 * - `'create'` - is the change type for a newly created document
 *
 * - `'update'` - is the change type for any change during the document lifecycle
 *
 * - `'remove'` - is the change type when the document is deleted
 */
export type ChangeType = (typeof changeTypes)[number]

export interface ChangeLogger<ModelName extends string = string> {
  /**
   * logs the change of a document
   *
   * @arg modelName - the name of the data model the document belongs to
   * @arg type - the kind of change: `'create'`, `'update'`, or  `'delete'`
   * @arg original - the original, unchanged document object
   * @arg changed - the changed, modified document object
   */
  log: (
    modelName: ModelName,
    type: ChangeType,
    original?: Record<string, unknown> & Document & Partial<TenantDocumentSchema & ApplicationDocumentSchema>,
    changed?: Record<string, unknown> & Document & Partial<TenantDocumentSchema & ApplicationDocumentSchema>
  ) => Promise<void>
}
