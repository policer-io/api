import { FastifyReply, FastifyRequest, RouteGenericInterface } from 'fastify'
import type { roleNames } from '../config'
import type { FilterQuery, ProjectionType } from 'mongoose'
import { AuthContext, AuthUser } from './auth'
import { Api } from './api'
import type { ModelName } from '../models'
import { ObjectId } from './models'

export type RoleName = (typeof roleNames)[number]

export interface RouteVerifiable {
  Params: Partial<Api.IdParam>
  Querystring: Partial<Api.ListQuery>
}

export interface AccessDocumentSchema extends Partial<Omit<AuthUser, 'tenant'>> {
  _id?: string
  tenant: string | null
  model: ModelName | 'User'
  [key: string]: unknown
}

export interface AccessContext {
  operation?: string
  target?: string | undefined
  tenant: string | null
  canWithoutTenant: boolean
  roles: RoleName[]
  applications: ObjectId<string>[]
  auth?: Partial<AuthContext>
  params?: Partial<Api.IdParam>
  query?: Partial<Api.ListQuery>
  body?: unknown
  document?: AccessDocumentSchema | undefined
  method?: string
}

type AccessHandler<RouteGeneric extends RouteGenericInterface = RouteGenericInterface> = (
  request: FastifyRequest<RouteGeneric>,
  reply: FastifyReply
) => Promise<void>

export type AccessCan<RouteGeneric extends RouteGenericInterface = RouteGenericInterface> = (operation: string) => AccessHandler<RouteGeneric>

export type AccessCollect<RouteGeneric extends RouteGenericInterface = RouteGenericInterface> = AccessHandler<RouteGeneric>

export interface RouteAccessControlable {
  Params: Partial<Api.IdParam & Api.UserIdParam>
  Querystring: Partial<Api.ListQuery>
}

export interface AccessQuery {
  filter?: FilterQuery<unknown> | undefined | null
  projection?: ProjectionType<unknown> | undefined | null
}

export interface AccessSetter {
  tenant?: string
  createdBy?: AuthUser['uid']
  updatedBy?: AuthUser['uid']
}

export interface RequestAccess {
  context: AccessContext
  query?: AccessQuery | undefined
}
