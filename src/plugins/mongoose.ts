import type { FastifyPluginCallback } from 'fastify'
import { connect } from 'mongoose'
import type { Model, Schema } from 'mongoose'
import fp from 'fastify-plugin'
import { DB_URI } from '../config'

const plugin: FastifyPluginCallback = fp(
  async function (server) {
    server.log.debug('MongoDB connection initializing...')
    const mongoose = await connect(DB_URI, { connectTimeoutMS: 5000 })

    const {
      host,
      port,
      db: { namespace },
    } = mongoose.connection
    server.log.info('MongoDB connection initialized')
    server.log.debug({ host, port, namespace }, 'MongoDB connection')

    // add mongose instance to server instance
    server.decorate('mongoose', mongoose)

    // add models object
    server.decorate<{ [key: string]: Model<unknown> }>('models', {})

    // add schemas object
    server.decorate<{ [key: string]: Schema<unknown> }>('schemas', {})

    server.decorate<Record<string, unknown>>('queryUtil', {})

    // disconnect on application close
    server.addHook('onClose', async function (server) {
      await mongoose.connection.close()
      server.log.info('MongoDB connection closed')
    })
  },
  { name: 'mongoose' }
)

export default plugin
