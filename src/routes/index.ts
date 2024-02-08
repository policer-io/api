import root from './root'
import api from './api'
import type { FastifyPluginCallback } from 'fastify'
import docs from './docs'

const routes: FastifyPluginCallback = async function (server) {
  await server.register(api, { prefix: '/api' })
  await server.register(root)
  await server.register(docs)
}

export default routes
