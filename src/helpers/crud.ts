import type { FastifyPluginCallback, RouteOptionsShorthand } from 'fastify'
import type { ModelName } from '../models'
import { ApiError } from '.'
import { STATUS_CODES } from 'http'
import type { Model, Query } from 'mongoose'
import type { Api, VerifierName } from '../@types'

export type RouteName = 'create' | 'read' | 'list' | 'update' | 'remove'

export interface EventPayload<Data> {
  /** the name of the model */
  model: ModelName
  /** the operation applied on the model */
  operation: RouteName
  /** the document/documents after the operation is applied */
  data: Data
  /** the document/documents before the operation is applied (only for update operation) */
  original?: Data
  /** the total document count (only for list operation) */
  count?: number
}

interface PluginOptions {
  /** the name of the model to create the crud routes from */
  model: ModelName

  /**
   * the name of the access control target
   *
   * @default model.toLowerCase()
   */
  target?: string

  /** flags to control which routes to create */
  enable?: Partial<{
    [route in RouteName]: boolean
  }>

  /** required verifiers (OR) */
  verifiers?: VerifierName[]

  /** populate fields on `read`, `list` and `update` */
  populate?: Parameters<Query<unknown, unknown>['populate']>[0]

  /** overwrite route options or specify additional options such as `preHandler` or `preSerialization` */
  options?: Partial<{
    /** options for create route */
    create: Partial<RouteOptionsShorthand<Api.RouteCreate>>

    /** options for read route */
    read: Partial<RouteOptionsShorthand<Api.RouteRead>>

    /** options for list route */
    list: Partial<RouteOptionsShorthand<Api.RouteList>>

    /** options for update route */
    update: Partial<RouteOptionsShorthand<Api.RouteUpdate>>

    /** options for remove route */
    remove: Partial<RouteOptionsShorthand<Api.RouteRemove>>
  }>
}

const plugin: FastifyPluginCallback<PluginOptions> = async function (server, options) {
  const { model, target = model.toLocaleLowerCase(), enable = {}, options: routesOptions = {}, verifiers, populate = [] } = options
  const { create = true, read = true, list = true, update = true, remove = true } = enable

  server.log.debug({ create, read, list, update, remove }, `${model} route attaching...`)

  if (!model) throw new Error('Can not create crud routes for undefined `model`! Specify it in the CRUD plugin options.')

  if (verifiers) {
    server.addHook(
      'preHandler',
      server.auth(
        verifiers.map((verifier) => server.verifiers[verifier]),
        { relation: 'or' }
      )
    )
  }

  // create one route
  if (create) {
    server.route<Api.RouteCreate>({
      method: 'POST',
      url: '/',
      // preHandler: [server.can(`${target}:create`)],
      handler: async function (request, reply) {
        const { body } = request
        // TODO: set createdBy, tenant, branch from user
        server.log.debug(body, 'Body of create request')
        const document = new server.models[model](body)
        const saved = (await document.save()).toObject()
        server.publisher.emit<EventPayload<typeof saved>>(`${target}:create`, { model, operation: 'create', data: saved })
        return reply.payload(201, `${model} created`, saved)
      },
      schema: {
        description: `Create a ${model} document.`,
        tags: [model],
        body: server.createSchema(`${model}Create`),
        response: {
          201: { ...server.createSchema(`${model}ItemResponse`), description: STATUS_CODES[201] },
        },
      },
      ...routesOptions.create,
    })
  }

  // read one by _id route
  if (read) {
    server.route<Api.RouteRead>({
      method: 'GET',
      url: '/:_id',
      // preHandler: [server.can(`${target}:read`)],
      handler: async function (request, reply) {
        const {
          params: { _id },
        } = request
        const document = await (server.models[model] as Model<unknown>).findById(_id, {}).populate(populate).exec()
        if (!document) throw new ApiError(404, { _id, model: model }, `${model} with _id ${_id} does not exist.`)
        const data = document.toObject()
        server.publisher.emit<EventPayload<typeof data>>(`${target}:read`, { model, operation: 'read', data })
        return reply.payload(200, `${model} document ${_id} retrieved`, data)
      },
      schema: {
        description: `Get one ${model} document by \`_id\`.`,
        tags: [model],
        params: server.createSchema('Api.IdParam'),
        response: {
          200: { ...server.createSchema(`${model}ItemResponse`), description: STATUS_CODES[200] },
        },
      },
      ...routesOptions.read,
    })
  }

  // list multiply by query route
  if (list) {
    server.route<Api.RouteList>({
      method: 'GET',
      url: '/',
      // preHandler: [server.can(`${target}:list`)],
      handler: async function (request, reply) {
        const { query } = request
        const { filter, sort, skip, limit, search, project } = query

        const searchFilter =
          search && Object.keys(search).length ? { $or: Object.entries(search).map(([key, value]) => ({ [key]: new RegExp(value, 'i') })) } : undefined

        const finalFilter = searchFilter ? { $and: [filter, searchFilter] } : filter

        server.log.debug({ filter: finalFilter, sort, skip, limit }, 'query')

        const documents = (await (server.models[model] as Model<unknown>).find(finalFilter, project, { sort, skip, limit }).populate(populate).exec()).map(
          (document): ReturnType<typeof document.toObject> => document.toObject()
        )
        const count = await server.models[model].countDocuments(finalFilter).exec()

        server.publisher.emit<EventPayload<typeof documents>>(`${target}:list`, { model, operation: 'list', data: documents, count }, query)
        return reply.payload(200, `List of ${model}s retrieved`, documents, count)
      },
      schema: {
        description: `Query a list of ${model} documents. Querystring is parsed with [qs](https://github.com/ljharb/qs). \
          Swagger UI does not support parsing with qs. Thus, querying is limited with Swagger UI.`,
        tags: [model],
        querystring: server.createSchema('Api.ListQuery'),
        response: {
          200: { ...server.createSchema(`${model}ListResponse`), description: STATUS_CODES[200] },
        },
      },
      ...routesOptions.list,
    })
  }

  // update one route
  if (update) {
    server.route<Api.RouteUpdate>({
      method: 'PATCH',
      url: '/:_id',
      // preHandler: [server.can(`${target}:update`)],
      handler: async function (request, reply) {
        const {
          params: { _id },
          body,
        } = request
        const document = await (server.models[model] as Model<unknown>).findById(_id, {}).populate(populate).exec()
        if (!document) throw new ApiError(404, { _id, model: model }, `${model} with _id ${_id} does not exist.`)
        const original = document.toObject()
        document.set(body as Record<string, unknown>)
        const saved = (await document.save()).toObject()
        server.publisher.emit<EventPayload<typeof saved>>(`${target}:update`, { model, operation: 'update', data: saved, original })
        return reply.payload(200, `${model} document ${_id} updated`, saved)
      },
      schema: {
        description: `Update properties of a ${model} document by \`_id\`.`,
        tags: [model],
        body: server.createSchema(`${model}Update`),
        params: server.createSchema('Api.IdParam'),
        response: {
          200: { ...server.createSchema(`${model}ItemResponse`), description: STATUS_CODES[200] },
        },
      },
      ...routesOptions.update,
    })
  }

  // remove one route
  if (remove) {
    server.route<Api.RouteRemove>({
      method: 'DELETE',
      url: '/:_id',
      // preHandler: [server.can(`${target}:remove`)],
      handler: async function (request, reply) {
        const {
          params: { _id },
        } = request
        // Note: this triggers `findOneAndDelete` query hook
        const document = await (server.models[model] as Model<unknown>).findByIdAndDelete(_id).exec()
        if (!document) throw new ApiError(404, { _id, model: model }, `${model} with _id ${_id} does not exist.`)
        const data = document.toObject()
        server.publisher.emit<EventPayload<typeof data>>(`${target}:remove`, { model, operation: 'remove', data })
        return reply.payload(200, `${model} document ${_id} deleted`, data)
      },
      schema: {
        description: `Delete a ${model} document by \`_id\`.`,
        tags: [model],
        params: server.createSchema('Api.IdParam'),
        response: {
          200: { ...server.createSchema(`${model}ItemResponse`), description: STATUS_CODES[200] },
        },
      },
      ...routesOptions.remove,
    })
  }

  server.log.debug(`${model} route attached`)
}

export default plugin
