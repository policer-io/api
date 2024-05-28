/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter from 'events'

export type EventListener<Payload = any> = (event: string | symbol, payload: Payload) => void | Promise<void>

export interface EventPublisher extends EventEmitter {
  emit<Payload = any>(event: string | symbol, payload: Payload, ...args: unknown[]): ReturnType<EventEmitter['emit']>
  on<Payload = any>(event: string | symbol, listener: EventListener<Payload>): this
}
