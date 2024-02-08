import Fastify from 'fastify'
import { fastifyOptions } from '../config'
import plugins from '../plugins'
import routes from '../routes'
import { errorHandler } from './error'

/**
 * server factory function to register all plugins
 *
 * @returns FastifyInstance
 */
export async function buildServer() {
  // initiate server instance
  const server = Fastify(fastifyOptions)

  // set custom error handler
  server.setErrorHandler(errorHandler)

  // register plugins
  await server.register(plugins)

  // register api routes
  await server.register(routes)

  await server.after()
  await server.ready()

  return server
}
