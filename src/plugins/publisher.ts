import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import EventEmitter from 'events'
import { EventPayload, EventListener, EventPublisher as IEventPublisher } from '../@types'

class EventPublisher extends EventEmitter implements IEventPublisher {
  override emit(event: string | symbol, payload: EventPayload) {
    return super.emit(event, event, payload)
  }

  override on(event: string | symbol, listener: EventListener) {
    super.on(event, listener)
    return this
  }
}

const plugin: FastifyPluginAsync = async function (server) {
  server.log.debug('Event publisher plugin registering...')
  server.decorate('publisher', new EventPublisher())
  server.log.debug('Event publisher plugin registerd')
}

export default fp(plugin, { name: 'publisher' })
