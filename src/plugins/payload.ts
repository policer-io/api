import type { FastifyPluginCallback, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { STATUS_CODES } from 'http'
import { Api } from '../@types'

const plugin: FastifyPluginCallback = fp(
  async function (server) {
    server.log.debug('Payload plugin registering...')
    server.decorateReply(
      'payload',
      async function (
        this: FastifyReply,
        statusCode: Api.Payload['statusCode'],
        message?: Api.Payload['message'],
        data?: Api.Payload['data'],
        count?: Api.Payload['count']
      ) {
        const status = STATUS_CODES[statusCode] ?? 'Unspecified Status Code'
        return this.status(statusCode).send({
          statusCode,
          status,
          message: message ?? status,
          data,
          count,
        })
      }
    )
    server.log.debug('Payload plugin registerd')
  },
  {
    name: 'payload',
  }
)

export default plugin
