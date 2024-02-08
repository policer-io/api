import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import models from '../models'

const plugin: FastifyPluginCallback = fp(
  async function (server) {
    // register subdocument schemas
    // await Promise.all(Object.values(schemas).map((schema) => server.register(schema)))

    // register models
    await Promise.all(Object.values(models).map((model) => server.register(model)))
  },
  { name: 'models' }
)

export default plugin
