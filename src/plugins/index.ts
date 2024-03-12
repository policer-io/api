import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import helmet from '@fastify/helmet'
import cors from '@fastify/cors'
import traps from '@dnlup/fastify-traps'
import { CORS_REGEX, NODE_ENV } from '../config'
import mongoose from './mongoose'
import documents from './documents'
import models from './models'
import payload from './payload'
import swagger from './swagger'
import schema from './schema'
import { modelTags } from '../models'
import auth from './auth'
import publisher from './publisher'
import socket from './socket'

const plugin: FastifyPluginCallback = fp(
  async function (server) {
    // add kill handlers
    await server.register(traps)

    // add event publisher plugin
    await server.register(publisher)

    // add socket io
    await server.register(socket)

    // connect to MongoDB
    await server.register(mongoose)

    // schema generator
    await server.register(schema)

    // docuement template utility
    await server.register(documents)

    // attach models
    await server.register(models)

    if (NODE_ENV === 'production') {
      // Security
      await server.register(helmet, {})
    }

    // cors
    server.log.debug({ CORS_REGEX: CORS_REGEX || '^http:\\/\\/localhost' }, 'Set cors RegExp')
    await server.register(cors, {
      origin: CORS_REGEX !== undefined ? new RegExp(CORS_REGEX) : new RegExp('^http:\\/\\/localhost'),
      credentials: true,
    })

    // auth
    await server.register(auth)

    // payload and status formatter
    await server.register(payload)

    // swagger
    await server.register(swagger, { tags: [...modelTags] })
  },
  { name: 'plugins' }
)

export default plugin
