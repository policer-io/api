import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'

const plugin: FastifyPluginAsync = async function (server) {
  server.log.debug('Access Control plugin registering...')

  // TODO: implement

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
