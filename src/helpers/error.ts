import { STATUS_CODES } from 'http'
import type { FastifyInstance } from 'fastify'

interface PossibleErrorProperties {
  validation?: unknown
  validationContext?: string
  version?: number
  modifiedPaths?: string[]
  /** mongoose validation errors */
  errors?: Record<string, unknown>
  // mongoose error properties
  code?: number
}

export const errorHandler: Parameters<FastifyInstance['setErrorHandler']>[0] = function (error, request, reply) {
  const { message, name, stack, validation, validationContext, version, modifiedPaths, errors, code } = error as Error & PossibleErrorProperties
  if (validation) {
    this.log.debug('Fastify Validation error handler')
    this.log.info({ err: error, reqId: request.id }, message)
    reply.payload(400, message, { name, validation, validationContext })
  } else if (name === 'ValidationError') {
    this.log.debug('Mongoose Validation error handler')
    this.log.info({ err: error, reqId: request.id }, message)
    reply.payload(400, message, { name, errors })
  } else if (name === 'MongoServerError' && code === 11000) {
    this.log.debug('MongoServerError duplicate error handler')
    this.log.info({ err: error, reqId: request.id }, message)
    reply.payload(409, message, { name, error })
  } else if (name === 'VersionError') {
    this.log.debug('Version error handler')
    this.log.info({ err: error, reqId: request.id }, message)
    reply.payload(409, message, { name, version, modifiedPaths })
  } else if (error instanceof ApiError) {
    this.log.debug('ApiError handler')
    const { context } = error

    // logging
    if (error.statusCode >= 500) {
      this.log.error({ err: error, reqId: request.id }, message)
    } else if (error.statusCode >= 400) {
      this.log.info({ err: error, reqId: request.id }, message)
    } else {
      throw Error('ApiError status code does not represent an error!', { cause: error })
    }

    reply.payload(error.statusCode, message, { name, context })
  } else {
    this.log.debug('Default error handler')
    this.log.error({ err: error, reqId: request.id }, message)
    reply.payload(500, message, { name, stack })
  }
}

export class ApiError extends Error {
  statusCode: number
  status: string
  context?: unknown

  constructor(statusCode: number, context: Record<string, unknown> = {}, ...params: ConstructorParameters<typeof Error>) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }

    this.status = STATUS_CODES[statusCode] || 'Unspecified Status Code'
    if (!this.message) this.message = this.status
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.context = context
  }
}
