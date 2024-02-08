import { LOGGER_LEVEL } from './environment'
import { parseQueryTypes } from '../helpers/query'
import qs from 'qs'
import type { Options as AjvOptions } from '@fastify/ajv-compiler'
import type { FastifyServerOptions } from 'fastify'

const ajvOptions: AjvOptions = {
  formats: {
    ObjectId: /^[a-f\d]{24}$/,
    bsonOrUuid: /(^[a-f\d]{24}$)|(^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$)/,
  },
  keywords: ['style', 'explode'],
  allowUnionTypes: true,
}

export const fastifyOptions: FastifyServerOptions = {
  logger: { level: LOGGER_LEVEL || 'info' },
  querystringParser: (str: string) => parseQueryTypes(qs.parse(str, { depth: 10 })) as { [key: string]: unknown },
  ajv: {
    customOptions: ajvOptions,
  },
  serializerOpts: {
    ajv: ajvOptions,
  },
  pluginTimeout: 20000,
  bodyLimit: 5 * 1024 * 1024, // 5mb
}
