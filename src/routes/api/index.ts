import type { FastifyPluginCallback } from 'fastify'

import logic from './logic'
import application from './application'
import tenant from './tenant'
import permission from './permission'
import role from './role'

const routes: FastifyPluginCallback = async function (server) {
  // collect all possible authentication information
  server.addHook('preHandler', server.authCollect([server.collectors.collectOAuthUser, server.collectors.collectApiKey]))

  // collect access control context information
  // server.addHook('preHandler', server.accessCollect)

  await server.register(permission, { prefix: '/permissions' })
  await server.register(role, { prefix: '/roles' })
  await server.register(logic, { prefix: '/logics' })
  await server.register(application, { prefix: '/applications' })
  await server.register(tenant, { prefix: '/tenants' })
}

export default routes
