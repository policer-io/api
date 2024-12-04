import type { FastifyPluginCallback, RouteGenericInterface } from 'fastify'
import { NODE_ENV, npm_package_version, OPS_ENV } from '../config'
import { ApiError } from '../helpers'
import { Api } from '../@types'

interface RootGetRouteInterface extends RouteGenericInterface {
  Querystring: { error: string; status?: string }
}

interface HealthGetInterface extends RouteGenericInterface {
  Reply: Api.Payload
}

const routes: FastifyPluginCallback = async function (server) {
  if (OPS_ENV === 'local' || NODE_ENV === 'production') {
    server.get<RootGetRouteInterface>('/', { schema: { hide: true } }, async (request, reply) => {
      const { query } = request
      if (query.error) throw new ApiError(Number(query.status) || 400, { query }, 'The query param caused an error!')
      return reply.payload(200, 'Hello world!', { hello: 'world' })
    })
  }

  server.get<HealthGetInterface>('/health', { schema: { description: 'Get service health' } }, async (request, reply) => {
    const {
      connection: {
        host,
        db,
      },
    } = server.mongoose
    const { namespace } = db || {}

    return reply.payload(200, 'I am good. Thanks for asking.', {
      NODE_ENV,
      OPS_ENV,
      npm_package_version,
      db: {
        host,
        namespace,
      },
    })
  })
}

export default routes
