import type { FastifyPluginCallback, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import fauth from '@fastify/auth'
import { ApiError } from '../helpers'
import type { AuthCollect, AuthCollectors, AuthVerifiers, AuthVerify, RouteVerifiable } from '../@types'
import { APP_API_KEY } from '../config'

const plugin: FastifyPluginCallback = fp(
  async function (server) {
    server.log.debug('Auth plugin registering...')

    // an object to store all authentication attributes.
    server.decorateRequest('auth', null)

    const collectors: AuthCollectors<RouteVerifiable> = {
      /** collect the user info from a bearer oauth token */
      collectOAuthUser: async function (request) {
        const { headers } = request
        const { authorization, 'app-tenant-id': requestTenant } = headers

        if (authorization) {
          const [authType, token] = authorization.trim().split(' ')

          if (authType !== 'Bearer' || !token) return

          // TODO: use identity
          // const { active, sub, roles, ten } = await server.identity.introspect(token)
          const active = true

          if (active) {
            request.auth.user = {
              uid: 'tbd',
              tenant: (typeof requestTenant === 'string' && requestTenant) || 'tbd',
              roles: [],
              applications: [],
            }
          }

          server.log.debug({ user: request.auth.user }, 'collected OAuth2 user')
        }
      },

      /** collect the API key information */
      collectApiKey: async function (request) {
        const { headers } = request
        const { authorization, 'app-tenant-id': tenant } = headers

        if (!(typeof tenant === 'string' || tenant === undefined)) throw new ApiError(400, { 'App-Tenant-Id': tenant }, 'App-Tenant-Id has the wrong format!')

        if (authorization) {
          const [key] = authorization.trim().split(' ')

          // TODO: replace with hashed API keys managed in DB
          if (APP_API_KEY && key === APP_API_KEY) {
            request.auth.key = {
              // tenant: '646b2bbb5843bc8b129b4bb7',
              tenant: tenant || null,
            }

            server.log.debug({ key: request.auth.key, tenant }, 'collected API Key info')
          }
        }
      },
    }

    server.decorate('collectors', collectors as AuthCollectors)

    server.decorate<AuthCollect>('authCollect', function (collectors) {
      return async function (request, reply) {
        // initialize new auth context
        request.auth = {}
        // run auth context collectors
        await Promise.all(
          collectors.map((collector) => {
            return collector(request, reply)
          })
        )
      }
    })

    server.decorate<AuthVerify>('authVerify', function (verifiers, options = {}) {
      const { relation = 'or' } = options
      if (relation === 'and') {
        return async function (request, reply) {
          await Promise.all(verifiers.map((verifier) => verifier(request, reply)))
        }
      }
      return async function (request, reply) {
        try {
          await Promise.any(verifiers.map((verifier) => verifier(request, reply)))
        } catch (error) {
          if (error instanceof AggregateError) {
            throw error.errors[0]
          }
          throw error
        }
      }
    })

    const verifiers: AuthVerifiers<RouteVerifiable> = {
      /** checks if is an non-authenticated request */
      requirePublic: async function (request: FastifyRequest<RouteVerifiable>) {
        const { user } = request.auth

        if (user) {
          throw new ApiError(401, { user, origin: 'requirePublic' }, 'No authentication allowed!')
        }
      },

      /** checks if there is a OAuth2 user */
      requireOAuthUser: async function (request: FastifyRequest<RouteVerifiable>) {
        const { user } = request.auth

        if (!user) {
          throw new ApiError(401, { origin: 'requireOAuthUser' }, 'No valid authentication!')
        }
      },

      /** check if there is a valid API key */
      requireApiKey: async function (request: FastifyRequest<RouteVerifiable>) {
        const {
          auth: { key },
        } = request

        if (!key) {
          throw new ApiError(401, { origin: 'requireApiKey' }, 'No valid authentication!')
        }
      },
    }

    server.decorate('verifiers', verifiers as AuthVerifiers)

    await server.register(fauth)

    server.log.debug('Auth plugin registerd')
  },
  {
    name: 'auth',
    decorators: {
      fastify: ['mongoose'],
      request: [],
    },
    dependencies: ['mongoose'],
  }
)

export default plugin
