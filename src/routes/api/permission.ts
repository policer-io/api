import type { FastifyPluginCallback } from 'fastify'
import crud from '../../helpers/crud'

const routes: FastifyPluginCallback = async function (server) {
  server.decorateRequest('model', 'Permission')

  server.addHook('preHandler', server.auth([server.verifiers.requireApiKey, server.verifiers.requireOAuthUser], { relation: 'or' }))

  await server.register(crud, { model: 'Permission' })
}

export default routes
