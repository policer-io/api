import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import type { Document, EventListener } from '../@types'
import type { ApplicationDocumentSchema, TenantDocumentSchema } from '../plugins/documents'
import { EventPayload as CrudEventPayload } from '../helpers'

type ExpectedPayload = CrudEventPayload<Record<string, unknown> & Document & Partial<ApplicationDocumentSchema & TenantDocumentSchema>>

const plugin: FastifyPluginAsync = async function (server) {
  server.log.debug('Promulgator listener plugin registering...')

  const listener: EventListener<ExpectedPayload> = async (event, payload) => {
    const { data, model: modelName } = payload
    try {
      server.log.debug({ ...payload }, `Promulgator: Handling event ${event.toString()}`)
      const applicationId = modelName === 'Application' ? data._id : data.application
      const tenantId = modelName === 'Tenant' ? data._id : data.tenant
      if (!tenantId) throw new Error(`Event ${event.toString()} payload lacks tenant _id!`)
      if (!applicationId) throw new Error(`Event ${event.toString()} payload lacks application _id!`)
      server.io.emit(`${tenantId}/${applicationId}/policy:update`)
    } catch (error) {
      server.log.error({ err: error, event, payload }, `Promulgator: Error while handling event ${event.toString()}`)
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
    'application:update',
  ]

  await Promise.all(
    events.map((event) => {
      const subscribe = async () => {
        server.publisher.on(event, listener)
      }
      return subscribe()
    })
  )

  server.log.debug('Promulgator listener plugin registerd')
}

/** The promulgator listens to policy (roles, permissions, etc.) updates and informs all connected policy decision points about the updates.  */
export default fp(plugin, {
  name: 'promulgator',
  decorators: {
    fastify: ['io'],
  },
  dependencies: ['socket'],
})
