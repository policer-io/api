/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import EventEmitter from 'events'
import { EventListener, EventPublisher as IEventPublisher } from '../@types'

class EventPublisher extends EventEmitter implements IEventPublisher {
  override emit<Payload = any>(event: string | symbol, payload: Payload) {
    return super.emit(event, event, payload)
  }

  override on<Payload = any>(event: string | symbol, listener: EventListener<Payload>) {
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
