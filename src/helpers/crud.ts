import type { FastifyPluginCallback, RouteOptionsShorthand } from 'fastify'
import type { ModelName } from '../models'
import { ApiError } from '.'
import { STATUS_CODES } from 'http'
import type { Model, Query } from 'mongoose'
import type { Api } from '../@types'
import { ApplicationDocumentSchema, TenantDocumentSchema } from '../plugins/documents'

type RouteName = 'create' | 'read' | 'list' | 'update' | 'remove'

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
  // verifiers?: VerifierName[]

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
  const { model, target = model.toLocaleLowerCase(), enable = {}, options: routesOptions = {}, populate = [] } = options
  const { create = true, read = true, list = true, update = true, remove = true } = enable

  server.log.debug({ create, read, list, update, remove }, `${model} route attaching...`)

  if (!model) throw new Error('Can not create crud routes for undefined `model`! Specify it in the CRUD plugin options.')

  // if (verifiers) {
  //   server.addHook(
  //     'preHandler',
  //     server.auth(
  //       verifiers.map((verifier) => server.verifiers[verifier]),
  //       { relation: 'or' }
  //     )
  //   )
  // }

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
        return reply.payload(201, `${model} created`, await document.save())
      },
      preSerialization: async function (request, _reply, payload) {
        const {
          auth: { key },
        } = request
        const { data } = payload as Api.Payload<Partial<TenantDocumentSchema & ApplicationDocumentSchema>>
        server.publisher.emit(`${target}:create`, { tenant: key?.tenant, data })
        return payload
      },
      schema: {
        description: `Create a ${model} document.`,
        tags: [model],
        body: server.generator.createSchema(`${model}Create`),
        response: {
          201: { ...server.generator.createSchema(`${model}ItemResponse`), description: STATUS_CODES[201] },
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
        return reply.payload(200, `${model} document ${_id} retrieved`, document)
      },
      preSerialization: async function (request, _reply, payload) {
        const {
          auth: { key },
        } = request
        const { data } = payload as Api.Payload<Partial<TenantDocumentSchema & ApplicationDocumentSchema>>
        server.publisher.emit(`${target}:read`, { tenant: key?.tenant, data })
        return payload
      },
      schema: {
        description: `Get one ${model} document by \`_id\`.`,
        tags: [model],
        params: server.generator.createSchema('Api.IdParam'),
        response: {
          200: { ...server.generator.createSchema(`${model}ItemResponse`), description: STATUS_CODES[200] },
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

        const documents = await (server.models[model] as Model<unknown>).find(finalFilter, project, { sort, skip, limit }).populate(populate).exec()
        const count = await server.models[model].countDocuments(finalFilter).exec()
        return reply.payload(200, `List of ${model}s retrieved`, documents, count)
      },
      preSerialization: async function (request, _reply, payload) {
        const {
          auth: { key },
        } = request
        const { data, count } = payload as Api.Payload<Partial<TenantDocumentSchema & ApplicationDocumentSchema>[]>
        server.publisher.emit(`${target}:list`, { tenant: key?.tenant, data: { data, count } })
        return payload
      },
      schema: {
        description: `Query a list of ${model} documents. Querystring is parsed with [qs](https://github.com/ljharb/qs). \
          Swagger UI does not support parsing with qs. Thus, querying is limited with Swagger UI.`,
        tags: [model],
        querystring: server.generator.createSchema('Api.ListQuery'),
        response: {
          200: { ...server.generator.createSchema(`${model}ListResponse`), description: STATUS_CODES[200] },
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
        document.set(body as Record<string, unknown>)
        const saved = await document.save()
        return reply.payload(200, `${model} document ${_id} updated`, saved)
      },
      preSerialization: async function (request, _reply, payload) {
        const {
          auth: { key },
        } = request
        const { data } = payload as Api.Payload<Partial<TenantDocumentSchema & ApplicationDocumentSchema>[]>
        server.publisher.emit(`${target}:update`, { tenant: key?.tenant, data })
        return payload
      },
      schema: {
        description: `Update properties of a ${model} document by \`_id\`.`,
        tags: [model],
        body: server.generator.createSchema(`${model}Update`),
        params: server.generator.createSchema('Api.IdParam'),
        response: {
          200: { ...server.generator.createSchema(`${model}ItemResponse`), description: STATUS_CODES[200] },
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
        return reply.payload(200, `${model} document ${_id} deleted`, document)
      },
      preSerialization: async function (request, _reply, payload) {
        const {
          auth: { key },
        } = request
        const { data } = payload as Api.Payload<Partial<TenantDocumentSchema & ApplicationDocumentSchema>[]>
        server.publisher.emit(`${target}:remove`, { tenant: key?.tenant, data })
        return payload
      },
      schema: {
        description: `Delete a ${model} document by \`_id\`.`,
        tags: [model],
        params: server.generator.createSchema('Api.IdParam'),
        response: {
          200: { ...server.generator.createSchema(`${model}ItemResponse`), description: STATUS_CODES[200] },
        },
      },
      ...routesOptions.remove,
    })
  }

  server.log.debug(`${model} route attached`)
}

export default plugin
