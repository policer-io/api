import type { FastifyInstance, FastifyReply, FastifyRequest, RouteGenericInterface } from 'fastify'
import type { Role } from './access'

import { Api } from './api'

// TODO: remove from here, belongs to access control
export interface RouteVerifiable {
  Params: Partial<Api.IdParam>
  Querystring: Partial<Api.ListQuery>
}

export type VerifierName = 'requirePublic' | 'requireOAuthUser' | 'requireApiKey'

export type AuthVerifiers<RouteGeneric extends RouteGenericInterface = RouteGenericInterface> = {
  [verifier in VerifierName]: (this: FastifyInstance, request: FastifyRequest<RouteGeneric>, reply: FastifyReply) => Promise<void>
}

export type CollectorName = 'collectOAuthUser' | 'collectApiKey'

export type AuthCollector<RouteGeneric extends RouteGenericInterface = RouteGenericInterface> = (
  request: FastifyRequest<RouteGeneric>,
  reply: FastifyReply
) => Promise<void>

export type AuthCollectors<RouteGeneric extends RouteGenericInterface = RouteGenericInterface> = {
  [collector in CollectorName]: AuthCollector<RouteGeneric>
}

export type AuthCollect<RouteGeneric extends RouteGenericInterface = RouteGenericInterface> = (
  collectors: AuthCollector<RouteGeneric>[]
) => AuthCollector<RouteGeneric>

export interface AuthContext {
  user?: AuthUser

  key?:
    | {
        tenant: string | null
      }
    | undefined
}

export interface AuthTokenPayload {
  active: boolean
  applicationId: string
  sub: string
  /** the tenant of the user */
  ten: string | null
  roles: Role[]
}

export interface AuthUser {
  // TODO: finalize
  id: string
  roles: Role[]
  tenant: string | null
}
