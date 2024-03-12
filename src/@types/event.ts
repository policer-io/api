/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter from 'events'
import { ApplicationDocumentSchema, TenantDocumentSchema } from '../plugins/documents'

export interface EventPayload<Data = any> extends Partial<TenantDocumentSchema>, Partial<ApplicationDocumentSchema> {
  data?: Data | undefined
}

export type EventListener<Data = any> = (event: string | symbol, payload: EventPayload<Data>) => void | Promise<void>

export interface EventPublisher extends EventEmitter {
  emit<Data = any>(event: string | symbol, payload: EventPayload<Data>): ReturnType<EventEmitter['emit']>
  on<Data = any>(event: string | symbol, listener: EventListener<Data>): this
}
