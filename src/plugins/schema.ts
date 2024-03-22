import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import path from 'path'
import { createGenerator } from 'ts-json-schema-generator'
import type { Config, SchemaGenerator } from 'ts-json-schema-generator'

const plugin: FastifyPluginCallback = fp(
  async function (server) {
    server.log.debug('Schema plugin registering...')
    const config: Config = {
      path: path.resolve(__dirname, '../**/*.ts'),
      tsconfig: path.resolve(__dirname, '../../tsconfig.json'),
      expose: 'none',
      jsDoc: 'extended',
      encodeRefs: false,
      topRef: false,
      extraTags: ['style', 'explode'],
    }

    const generator = createGenerator(config)

    server.decorate<SchemaGenerator['createSchema']>('createSchema', (fullName?: string) => JSON.parse(JSON.stringify(generator.createSchema(fullName))))
    server.log.debug('Schema plugin registered')
  },
  { name: 'schema' }
)

export default plugin
