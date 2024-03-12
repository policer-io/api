import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { Server, ServerOptions } from 'socket.io'

const plugin: FastifyPluginAsync<ServerOptions> = async function (server) {
  server.log.debug('Socket.io plugin registering...')

  // TODO: make it work with multiple nodes, see https://socket.io/docs/v4/using-multiple-nodes/
  const options: Partial<ServerOptions> = {
    cors: {
      origin: '*',
    },
  }

  server.decorate('io', new Server(server.server, options))

  server.addHook('onReady', async function () {
    server.io.on('connection', ({ id }) => {
      server.log.debug({ id }, 'New socket connection')
    })
  })

  server.addHook('onClose', async function (server) {
    server.io.close()
    server.log.info('Socket.io connection closed')
  })

  server.log.debug('Socket.io plugin registerd')
}

export default fp(plugin, { name: 'socket' })
