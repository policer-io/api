import type { FastifyPluginCallback } from 'fastify'
import crud from '../../helpers/crud'

const routes: FastifyPluginCallback = async function (server) {
  server.decorateRequest('model', 'Change')

  server.addHook('preHandler', server.auth([server.verifiers.requireApiKey, server.verifiers.requireOAuthUser], { relation: 'or' }))

  await server.register(crud, { model: 'Change', enable: { create: false, update: false, remove: false }  })
}

export default routes
