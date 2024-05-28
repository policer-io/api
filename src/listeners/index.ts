import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import promulgator from './promulgator'
import change from './change'

const plugin: FastifyPluginAsync = async function (server) {
  await server.register(promulgator)

  await server.register(change)
}

/**
 * The listeners subscribe to events published with the event publisher plugin and handle them
 */
export default fp(plugin, {
  name: 'listeners',
  decorators: {
    fastify: ['publisher'],
  },
  dependencies: ['publisher'],
})
