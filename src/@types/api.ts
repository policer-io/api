/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars */
export declare namespace Api {
  export interface Payload<Data = unknown> {
    /**
     * the status code
     *
     * @example 200
     */
    statusCode: number

    /**
     * the status description
     *
     * @example "OK"
     */
    status: string

    /** the info message */
    message: string

    /** the response data */
    data?: Data

    /** the total count of document */
    count?: number
  }

  /** query a list of documents
   * @style "deepObject"
   * @explode true
   */
  export interface ListQuery {
    /**
     * filter documents using mongodb [query operators](https://docs.mongodb.com/manual/reference/operator/query/)
     *
     * @default {}
     * @example { "createdAt": { "$gt": "2011-10-05T14:48:00.000Z" } }
     * @style "deepObject"
     * @explode true
     */
    filter?: {
      [key: string]: unknown
    }

    /**
     * sort documents by `key` in asc (`1`) or desc (`-1`) direction
     *
     * @default {}
     * @example { "createdAt": -1 }
     */
    sort?: {
      [key: string]: 1 | -1
    }

    /**
     * search for text on defined properties
     *
     * @example { "name": "Hans" }
     * @style "deepObject"
     * @explode true
     */
    search?: {
      [key: string]: string
    }

    /**
     * project fields to return from query. [More info](https://www.mongodb.com/docs/manual/tutorial/project-fields-from-query-results/)
     *
     * @example { "_id": 0, "name": 1 }
     * @style "deepObject"
     * @explode true
     */
    project?:
      | {
          [key: string]: 1 | 0 | boolean
        }
      | undefined

    /**
     * The amount of documents to skip
     *
     * @default 0
     * @minimum 0
     * @asType integer
     */
    skip?: number

    /**
     * The amount of documents to deliver
     *
     * @default 10
     * @minimum 0
     * @asType integer
     */
    limit?: number
  }

  /** response data is a list of items (documents) */
  export type ListResponse<Data = unknown> = Partial<Payload<Partial<Data>[]>>

  /** response data is one item (document) */
  export type ItemResponse<Data = unknown> = Partial<Omit<Api.Payload<Partial<Data>>, 'count'>>

  /** response data is empty */
  export type EmptyResponse = Partial<Omit<Api.Payload, 'count' | 'data'>>

  export interface IdParam {
    /**
     * Document unique `_id` as BSON id.
     *
     * @format ObjectId
     * @pattern ^[a-f\d]{24}$
     */
    _id: string
  }

  export interface UserIdParam {
    /**
     * User unique `id` as UUID id.
     *
     * @format uuid
     * @example 5eff62cb-2c5c-4318-8c2b-2bf32b370013
     */
    id: string
  }

  export interface HashParam {
    /**
     * Document unique `hash`.
     *
     * @pattern ^[a-f0-9]{32}$
     */
    hash: string
  }

  /** create one route interface */
  export interface RouteCreate<DocumentCreate = unknown> {
    Body: DocumentCreate
  }
  /** read one route interface */
  export interface RouteRead {
    Params: IdParam
  }
  /** read one by hash route interface */
  export interface RouteReadByHash {
    Params: HashParam
  }
  /** list multiple route interface */
  export interface RouteList {
    Querystring: Required<ListQuery>
  }
  /** update one route interface */
  export interface RouteUpdate<DocumentUpdate = unknown> {
    Params: IdParam
    Body: DocumentUpdate
  }
  /** remove one route interface */
  export interface RouteRemove {
    Params: IdParam
  }

  export interface UserRouteById {
    Params: UserIdParam
  }

  export interface UserRouteCreate<DocumentCreate = unknown> {
    Body: DocumentCreate
  }

  export interface UserRouteUpdate<DocumentUpdate = unknown> {
    Params: UserIdParam
    Body: DocumentUpdate
  }
}
