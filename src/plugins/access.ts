import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import type { Model } from 'mongoose'
import { AccessCollect, AccessContext, AccessDocumentSchema, RouteAccessControlable } from '../@types'
import { ApiError } from '../helpers'

const plugin: FastifyPluginAsync = async function (server) {
  server.log.debug('Access Control plugin registering...')

  server.decorateRequest<AccessContext | null>('access', null)

  // TODO: implement
  server.decorate<AccessCollect<RouteAccessControlable>>('accessCollect', async function (request) {
    const { params, auth, query, body, method } = request
    const { user, key } = auth

    request.access = {
      server,
      body,
      roles: [],
      tenant:
        (user?.tenant && new server.mongoose.Types.ObjectId(user.tenant)) ||
        (key?.tenant?.toString() && new server.mongoose.Types.ObjectId(key.tenant.toString())) ||
        null,
      auth,
      params,
      query,
    }

    // // if request on user document
    // if (params.id) {
    //   const user = await server.identity.getUserById(params.id)
    //   if (user.registrations?.length !== 1) throw new ApiError(500, { user }, 'User has more than one registration!')
    //   request.access.userDocument = user
    // }

    // if document _id, collect document information
    if (params._id) {
      if (!request.model) throw new ApiError(500, undefined, 'Can not collect document access context. Model name is undefined on request.')
      const document = (await (server.models[request.model] as unknown as Model<AccessDocumentSchema>)?.findById(params._id).exec())?.toObject()
      request.access.document = document && { ...document, model: request.model }
    }

    // if API key, use god role for now TODO: change this. use scope or manage key role in DB.
    if (key) request.access.roles.push('god')
    // if OAuth2 user, use OAuth2 role
    if (user?.roles) request.access.roles.push(...user.roles)
    // no role identified, use customer role
    if (!request.access.roles.length) request.access.roles.push('enforcer')

    const isGod = request.access.roles.includes('god')

    // extend request body with additional information
    if (request.body) {
      if (!isGod || (isGod && !(request.body as Record<string, unknown>)['tenant'])) {
        ;(request.body as Record<string, unknown>)['tenant'] = request.access.tenant || null
      }
      if (user) {
        if (method === 'POST') {
          server.log.debug({ user: user?.id }, 'set createdBy on body')
          ;(request.body as Record<string, unknown>)['createdBy'] = user?.id || null
        }
        if (method === 'PATCH' || method === 'PUT') {
          server.log.debug({ user: user?.id }, 'set updatedBy on body')
          ;(request.body as Record<string, unknown>)['updatedBy'] = user?.id || null
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { server: _server, body: _body, document, ...rest } = request.access
    server.log.debug({ ...rest, document: document?._id, hasBody: !!_body }, 'collected access context')
  })

  server.log.debug('Access Control plugin registerd')
}

export default fp(plugin, {
  name: 'access',
  decorators: {
    // fastify: ['mongoose'],
    request: ['auth'],
  },
  dependencies: ['mongoose', 'auth'],
})
