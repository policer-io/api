import { FastifyInstance, FastifyReply, FastifyRequest, RouteGenericInterface } from 'fastify'
import type { roleNames } from '../config'
import type { HydratedDocument, Types } from 'mongoose'
import { AuthContext } from './auth'
import { Api } from './api'
import { ApplicationDocumentSchema, TenantDocumentSchema } from '../plugins/documents'
import type { ModelName } from '../models'

export type RoleName = (typeof roleNames)[number]

export interface AccessDocumentSchema
  extends ReturnType<HydratedDocument<unknown>['toObject']>,
    Partial<TenantDocumentSchema>,
    Partial<ApplicationDocumentSchema> {
  model: ModelName
}

export interface AccessContext {
  operation?: string
  server: FastifyInstance
  body?: unknown | undefined
  roles: RoleName[]
  tenant: Types.ObjectId | null
  auth?: Partial<AuthContext>
  params?: Partial<Api.IdParam>
  query?: Partial<Api.ListQuery>
  document?: AccessDocumentSchema | undefined
  // userDocument?: IdentityUser | undefined
}

type AccessHandler<RouteGeneric extends RouteGenericInterface = RouteGenericInterface> = (
  request: FastifyRequest<RouteGeneric>,
  reply: FastifyReply
) => Promise<void>

export type AccessCollect<RouteGeneric extends RouteGenericInterface = RouteGenericInterface> = AccessHandler<RouteGeneric>

export interface RouteAccessControlable {
  Params: Partial<Api.IdParam & Api.UserIdParam>
  Querystring: Partial<Api.ListQuery>
}
