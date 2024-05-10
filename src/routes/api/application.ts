import type { FastifyPluginCallback } from 'fastify'
import crud from '../../helpers/crud'
import { Api } from '../../@types'
import { STATUS_CODES } from 'http'

const routes: FastifyPluginCallback = async function (server) {
  server.decorateRequest('model', 'Application')

  await server.register(crud, { model: 'Application', verifiers: ['requireApiKey', 'requireOAuthUser'] })

  server.route<Api.RouteRead>({
    method: 'GET',
    url: '/:_id/policy',
    // // TODO: enable access control
    // preHandler: [server.can('policy:read')],
    handler: async function (request, reply) {
      const {
        params: { _id },
      } = request
      const policy = await server.queryUtil.Application.getPolicy(_id)

      return reply.payload(200, `Policy for application ${_id} retrieved`, policy)
    },
    schema: {
      // prettier-ignore
      description: 'Get an application\'s entire policy by application `_id`.',
      tags: ['Application'],
      params: server.createSchema('Api.IdParam'),
      response: {
        200: { ...server.createSchema('ApplicationPolicyResponse'), description: STATUS_CODES[200] },
      },
    },
  })
}

export default routes
