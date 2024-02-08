import type { FastifyPluginCallback } from 'fastify'

import tenant from './tenant'

const routes: FastifyPluginCallback = async function (server) {
  // collect all possible authentication information
  // server.addHook(
  //   'preHandler',
  //   server.authCollect([
  //     server.collectors.collectConsultationSession,
  //     server.collectors.collectDeviceSession,
  //     server.collectors.collectEmployeeSession,
  //     server.collectors.collectOAuthUser,
  //     server.collectors.collectApiKey,
  //   ])
  // )

  // collect access control context information
  // server.addHook('preHandler', server.accessCollect)

  await server.register(tenant, { prefix: '/tenants' })
}

export default routes
