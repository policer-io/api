// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type fastify from 'fastify'
import type { SchemaGenerator } from 'ts-json-schema-generator'
import type { QueryUtility, Models, ModelName } from '../models'

import type { RawReplyDefaultExpression, RawRequestDefaultExpression, RouteGenericInterface, RouteOptions } from 'fastify'
import { DocumentTemplates } from '../plugins/documents'
import { Api } from './api'
import { AuthCollect, AuthCollectors, AuthContext, AuthVerifiers } from './auth'
import { EventPublisher } from './event'
import type { Server } from 'socket.io'

declare module 'fastify' {
  export interface FastifyInstance {
    mongoose: typeof import('mongoose')
    templates: DocumentTemplates
    models: Models
    queryUtil: QueryUtility
    generator: SchemaGenerator
    authCollect: AuthCollect
    collectors: AuthCollectors
    verifiers: AuthVerifiers
    publisher: EventPublisher
    io: Server
  }

  export interface FastifyRequest {
    /** an object to store the auth context and its attributes */
    auth: AuthContext
    model?: ModelName
  }

  export interface FastifyReply {
    payload: (
      statusCode: Api.Payload['statusCode'],
      message?: Api.Payload['message'],
      data?: Api.Payload['data'],
      count?: Api.Payload['count']
    ) => Promise<FastifyReply>
  }

  /** non-official helper type to facilitate easy usage of RouteOptions  */
  export type RouteOptionsShorthand<RouteGeneric extends RouteGenericInterface = RouteGenericInterface> = RouteOptions<
    FastifyInstance['server'],
    RawRequestDefaultExpression<FastifyInstance['server']>,
    RawReplyDefaultExpression<FastifyInstance['server']>,
    RouteGeneric
  >
}
