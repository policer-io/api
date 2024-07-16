import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import type { Model, FilterQuery, ProjectionType, ObjectId } from 'mongoose'
import { AccessCan, AccessCollect, AccessContext, AccessSetter, RequestAccess, RoleName, RouteAccessControlable } from '../@types'
import { ApiError } from '../helpers'
import PDP from '@policer-io/pdp-ts'
import { policy } from '../config'

const plugin: FastifyPluginAsync = async function (server) {
  server.log.debug('Access Control plugin registering...')

  server.decorateRequest<RequestAccess | null>('access', null)

  const pdp = await PDP.create<AccessContext, RoleName, FilterQuery<unknown>, ProjectionType<unknown>, AccessSetter>({
    applicationId: 'offline',
    policy,
  })

  // Decorate Access Context Collector
  server.decorate<AccessCollect<RouteAccessControlable>>('accessCollect', async function (request) {
    const { params, auth, query, body, method, headers } = request
    const { user, key } = auth

    // set roles
    const roles: RoleName[] = []
    // if API key, use god role for now TODO: change this. use scope or manage key role in DB.
    if (key) roles.push('god')
    // if OAuth2 user, use OAuth2 role
    if (user?.roles) roles.push(...user.roles)

    // get tenant from header if allowed
    const { grant: canWithoutTenant } = roles.length ? pdp.can(roles, 'global:withoutTenant') : { grant: false }
    const { grant: canOverwriteTenant } = roles.length ? pdp.can(roles, 'global:overwriteTenant') : { grant: false }
    const { 'app-tenant-id': headerTenant } = headers
    if (headerTenant && typeof headerTenant !== 'string') {
      throw new ApiError(400, { 'App-Tenant-Id': headerTenant }, 'App-Tenant-Id has the wrong format!')
    }
    server.log.debug({ canOverwriteTenant, canWithoutTenant, headerTenant }, 'overwrite header tenant')

    // initialize access context
    request.access = {
      context: {
        tenant: canOverwriteTenant && headerTenant ? headerTenant : user?.tenant ?? key?.tenant ?? null,
        canWithoutTenant,
        roles,
        applications: user?.applications ?? [],
        auth,
        params,
        query,
        body,
        method,
      },
    }

    // if document _id, collect document information
    if (params._id) {
      if (!request.model) throw new ApiError(500, undefined, 'Can not collect document access context. Model name is undefined on request.')
      const document = (
        await (server.models[request.model] as unknown as Model<{ tenant?: ObjectId | null; application?: ObjectId }>).findById(params._id).exec()
      )?.toObject()

      request.access.context.document = document && {
        ...document,
        _id: document._id.toString(),
        tenant: document.tenant?.toString() ?? null,
        application: document.application?.toString(),
        model: request.model,
      }
    }

    // if user uid, collect user info
    if (params.uid) {
      // TODO:
      // const userDocument = await server.firebase.authAdmin.getUser(params.uid)

      // request.access.context.document = {
      //   model: 'User',
      //   uid: userDocument.uid,
      //   tenant: (userDocument.customClaims?.['tenant'] as string | undefined) ?? null,
      //   roles: (userDocument.customClaims?.['roles'] as RoleName[] | undefined) ?? [],
      // }
    }

    const { body: _body, document, ...rest } = request.access.context
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    server.log.debug({ ...rest, document: document?._id || document?.uid, hasBody: !!_body }, 'collected access context')
  })

  // Decorate Access Can Checker
  server.decorate<AccessCan<RouteAccessControlable>>('can', (operation) => {
    return async function (request) {
      const { auth, access, method } = request
      const {
        context: { roles, tenant, applications },
      } = access
      const [target] = operation.split(':')
      if (!roles.length) throw new ApiError(500, { auth }, 'No roles defined!')
      server.log.debug({ ...access.context, operation }, 'Check access permission attributes')
      const { grant, filter, projection, setter } = pdp.can(roles, operation, { ...access.context, operation, target })

      server.log.debug({ roles, operation, grant, filter, projection, setter }, 'evaluated access permission')

      if (!grant) throw new ApiError(403, { operation, grant, access: { tenant, roles, applications } }, 'Not the right permissions!')

      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (request.body && setter && (request.params._id || request.params.uid || method === 'POST')) {
        Object.entries(setter).forEach(([key, value]) => {
          if (value) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            server.log.debug({ value, key }, 'set body property with setter')
            ;(request.body as Record<string, unknown>)[key] = value
          }
        })
      }

      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      request.access.query = filter || projection ? { filter: filter ?? undefined, projection: projection ?? undefined } : undefined
    }
  })

  server.log.debug('Access Control plugin registerd')
}

export default fp(plugin, {
  name: 'access',
  decorators: {
    // fastify: ['mongoose'],
    request: ['auth'],
  },
  dependencies: ['mongoose', 'auth'],
})
