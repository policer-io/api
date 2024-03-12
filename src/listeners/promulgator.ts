import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import type { EventListener, ObjectId } from '../@types'

type ExpectedPayload = { tenant?: ObjectId; application?: ObjectId; data?: { data: unknown[]; count: number } | unknown }

const plugin: FastifyPluginAsync = async function (server) {
  server.log.debug('Promulgator listener plugin registering...')

  // TODO: implement
  const listener: EventListener<ExpectedPayload> = async (event, payload) => {
    try {
      server.log.info({ payload }, `Handling event ${event.toString()}`)
      if (!payload.tenant) throw new Error(`Event ${event.toString()} payload lacks tenant _id!`)
      if (!payload.application) throw new Error(`Event ${event.toString()} payload lacks application _id!`)
      server.io.emit(`${payload.tenant}/${payload.application}/policy:update`)
    } catch (error) {
      server.log.error({ err: error, event, payload }, `Error while handling event ${event.toString()}`)
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
