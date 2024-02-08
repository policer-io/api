import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import { OPS_ENV, STAGE_DNS_NAME, npm_package_version } from '../config'

interface PluginOptions {
  tags?: { name: string; description: string }[]
}

const plugin: FastifyPluginAsync<PluginOptions> = async function (server, options) {
  const { tags = [] } = options

  const apiUrl = OPS_ENV === 'local' ? `http://${STAGE_DNS_NAME}:5010` : `https://api.${STAGE_DNS_NAME}`

  await server.register(swagger, {
    openapi: {
      info: {
        title: `policer API ${OPS_ENV.charAt(0).toUpperCase() + OPS_ENV.slice(1)}`,
        description: 'An API service to interact with policer data.',
        version: `v${npm_package_version}`,
      },
      components: {
        securitySchemes: {
          'API Key': {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
          },
          'Tenant ID (optional, god users only)': {
            type: 'apiKey',
            in: 'header',
            name: 'App-Tenant-Id',
          },
          'Access Token': {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      // externalDocs: {
      //   url: 'https://swagger.io',
      //   description: 'TODO: add a url to more info about the app',
      // },
      servers: [{ url: apiUrl, description: OPS_ENV.charAt(0).toUpperCase() + OPS_ENV.slice(1) }],
      security: [
        {
          // OAuth: ['openid', 'offline_access'],
          'API Key': [],
          'Tenant ID (optional, god users only)': [],
          'Access Token': [],
        },
      ],
      tags,
    },
  })

  server.addHook('onReady', async function () {
    this.swagger()
  })
}

export default fp(plugin, { name: 'swagger' })
