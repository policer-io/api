import type { FastifyPluginCallback } from 'fastify'
import swaggerUI from '@fastify/swagger-ui'
import { promises as fs } from 'fs'
import path from 'path'

const routes: FastifyPluginCallback = async function (server) {
  const logo = await fs.readFile(path.resolve(__dirname, '../static/logo.png'))
  const favicon = await fs.readFile(path.resolve(__dirname, '../static/favicon.png'))
  const css = await fs.readFile(path.resolve(__dirname, '../static/style.css'))

  await server.register(swaggerUI, {
    routePrefix: '/docs',
    logo: {
      type: 'image/png',
      content: logo,
    },
    theme: {
      title: 'API Docs | Policy Center | policer.io',
      css: [
        {
          filename: 'style.css',
          content: css.toString(),
        },
      ],
      favicon: [
        {
          filename: 'favicon.png',
          rel: 'icon',
          sizes: '32x32',
          type: 'image/png',
          content: favicon,
        },
      ],
    },
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next()
      },
      preHandler: function (request, reply, next) {
        next()
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject) => {
      return swaggerObject
    },
    transformSpecificationClone: true,
  })
}

export default routes
