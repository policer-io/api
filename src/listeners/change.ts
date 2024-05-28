import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import type { Document, EventListener } from '../@types'
import type { ApplicationDocumentSchema, TenantDocumentSchema } from '../plugins/documents'
import { ModelName } from '../models'
import { EventPayload as CrudEventPayload } from '../helpers'

type ExpectedPayload = CrudEventPayload<Record<string, unknown> & Document & Partial<ApplicationDocumentSchema & TenantDocumentSchema>> & {
  model: Exclude<ModelName, 'Change'>
}

const plugin: FastifyPluginAsync = async function (server) {
  server.log.debug('Change listener plugin registering...')

  const validModelNames = Object.keys(server.models).filter((key) => key !== 'Change')

  const listener: EventListener<ExpectedPayload> = async (event, payload) => {
    const { data, operation, model: modelName, original } = payload
    try {
      server.log.debug({ ...payload }, `Change: Handling event ${event.toString()}`)

      if (!operation) throw new Error('event operation is undefined')

      if (!validModelNames.includes(modelName)) throw new Error(`modelName ${modelName} is not valid`)

      switch (operation) {
        case 'create':
          await server.change.log(modelName, operation, undefined, data)
          break

        case 'update':
          await server.change.log(modelName, operation, original, data)
          break

        case 'remove':
          await server.change.log(modelName, operation, data)
          break

        default:
          server.log.warn({ event, operation }, 'Change listener received unsupported operation')
          break
      }
    } catch (error) {
      server.log.error({ err: error, event, payload }, `Change: Error while handling event ${event.toString()}`)
    }
  }

  const events: string[] = [
    'permission:create',
    'permission:update',
    'permission:remove',
    'role:create',
    'role:update',
    'role:remove',
    'logic:create',
    'logic:update',
    'logic:remove',
    'application:create',
    'application:update',
    'application:remove',
  ]

  await Promise.all(
    events.map((event) => {
      const subscribe = async () => {
        server.publisher.on(event, listener)
      }
      return subscribe()
    })
  )

  server.log.debug('Change listener plugin registerd')
}

export default fp(plugin, {
  name: 'change-listener',
  decorators: {
    fastify: ['change'],
  },
  dependencies: ['change'],
})
