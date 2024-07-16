import type { FastifyReply, FastifyRequest, RouteGenericInterface } from 'fastify'
import type { RoleName } from './access'

import { ObjectId } from './models'
// import { DecodedIdToken } from 'firebase-admin/auth'
import { UserClaims } from './firebase'

export type VerifierName = 'requirePublic' | 'requireOAuthUser' | 'requireApiKey'

export type AuthVerifier<RouteGeneric extends RouteGenericInterface = RouteGenericInterface> = (
  // this: FastifyInstance,
  request: FastifyRequest<RouteGeneric>,
  reply: FastifyReply
) => Promise<void>

export type AuthVerifiers<RouteGeneric extends RouteGenericInterface = RouteGenericInterface> = {
  [verifier in VerifierName]: AuthVerifier<RouteGeneric>
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

export type AuthVerify<RouteGeneric extends RouteGenericInterface = RouteGenericInterface> = (
  verifiers: AuthVerifier<RouteGeneric>[],
  options?: { relation?: 'or' | 'and' }
) => AuthVerifier<RouteGeneric>

export interface AuthContext {
  user?: AuthUser

  key?:
    | {
        tenant: string | null
      }
    | undefined
}

// TODO: import from 'firebase-admin/auth'
type DecodedIdToken = Record<string, unknown>
export interface AuthTokenPayload extends DecodedIdToken, UserClaims {}

export interface AuthUser {
  uid: string
  roles: RoleName[]
  tenant: ObjectId<string> | null
  applications: ObjectId<string>[]
}
