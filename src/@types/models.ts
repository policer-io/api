/** document identifier bson id
 *
 * @format ObjectId
 * @pattern ^[a-f\d]{24}$
 * @asType string
 * @example "507f1f77bcf86cd799439022"
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObjectId<Type = any> = Type

/**
 * @nullable
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ObjectIdNullable<Type = any> = ObjectId<Type> | null

/**
 * user identifier
 *
 * @format uuid
 */
export type UserId = string

export interface Document {
  /**
   * document identifier bson id
   *
   * @example "507f1f77bcf86cd799439011"
   * @format ObjectId
   * @asType string
   */
  _id: ObjectId

  /**
   * document creation timestamp as ISO date string
   *
   * @example "2011-10-05T14:48:00.000Z"
   * @format date-time
   */
  createdAt: Date

  /**
   * document updated timestamp as ISO date string
   *
   * @example "2011-10-05T14:48:00.000Z"
   * @format date-time
   */
  updatedAt: Date

  /**
   * document version
   *
   * @example 12
   * @asType integer
   * @minimum 0
   */
  __v: number
}

export interface Subdocument {
  /**
   * document identifier bson id
   *
   * @example "507f1f77bcf86cd799439011"
   * @format ObjectId
   * @asType string
   */
  _id: ObjectId
}

export type DocumentRead<DocumentSchema = Record<string, unknown>> = Partial<DocumentSchema & Document>
export type DocumentCreate<DocumentSchema = Record<string, unknown>, Required extends keyof DocumentSchema = never> = Partial<DocumentSchema> &
  Pick<DocumentSchema, Required>
export type DocumentUpdate<DocumentSchema = Record<string, unknown>> = Partial<DocumentSchema> & Pick<Document, '__v'>

export type SubdocumentRead<DocumentSchema = Record<string, unknown>> = Partial<DocumentSchema & Subdocument>
export type SubdocumentCreate<DocumentSchema = Record<string, unknown>, Required extends keyof DocumentSchema = never> = Partial<DocumentSchema> &
  Pick<DocumentSchema, Required>
export type SubdocumentUpdate<DocumentSchema = Record<string, unknown>> = Partial<DocumentSchema>
