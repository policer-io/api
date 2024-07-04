import type { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'
import type { Api, DocumentCreate, DocumentRead, DocumentUpdate, ObjectIdNullable } from '../@types'
import { TenantDocumentSchema } from '../plugins/documents'
import type { LogicRead, PermissionRead, RoleRead } from '.'
import { PipelineStage } from 'mongoose'
import { ApiError } from '../helpers'

const model: FastifyPluginCallback = fp(
  async function (server) {
    server.log.debug('Application model attaching...')
    const { Schema, model } = server.mongoose

    const schema = new Schema<ApplicationSchema>(
      {
        name: { type: String, required: true },
        options: {
          global: {
            condition: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
            filter: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
            projection: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
            setter: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
          },
          merge: {
            condition: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
            filter: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
            projection: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
            setter: { type: Schema.Types.ObjectId, ref: 'Logic', default: null },
          },
        },
      },
      {
        optimisticConcurrency: true,
        timestamps: true,
      }
    )

    schema.add(server.templates.tenantDocumentSchema)

    // application name must be unique for each tenant
    schema.index({ name: 1, tenant: 1 }, { unique: true })

    server.models.Application = model<ApplicationSchema>('Application', schema)

    // await server.models.Application.syncIndexes()

    server.queryUtil.Application = {
      getPolicy: async function (_id) {
        const pipeline: PipelineStage[] = [
          {
            $match: server.mongoose.cast(schema, { _id }),
          },
          {
            $lookup: {
              from: 'logics',
              let: {
                logics: [
                  '$options.global.condition',
                  '$options.global.filter',
                  '$options.global.projection',
                  '$options.global.setter',
                  '$options.merge.condition',
                  '$options.merge.filter',
                  '$options.merge.projection',
                  '$options.merge.setter',
                ],
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $in: ['$_id', '$$logics'],
                    },
                  },
                },
              ],
              as: 'optionLogics',
            },
          },
          {
            $set: {
              'options.global.condition': {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.global.condition',
                        ],
                      },
                      -1,
                    ],
                  },
                  then: {
                    $arrayElemAt: [
                      '$optionLogics',
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.global.condition',
                        ],
                      },
                    ],
                  },
                  else: null,
                },
              },
              'options.global.filter': {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.global.filter',
                        ],
                      },
                      -1,
                    ],
                  },
                  then: {
                    $arrayElemAt: [
                      '$optionLogics',
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.global.filter',
                        ],
                      },
                    ],
                  },
                  else: null,
                },
              },
              'options.global.projection': {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.global.projection',
                        ],
                      },
                      -1,
                    ],
                  },
                  then: {
                    $arrayElemAt: [
                      '$optionLogics',
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.global.projection',
                        ],
                      },
                    ],
                  },
                  else: null,
                },
              },
              'options.global.setter': {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.global.setter',
                        ],
                      },
                      -1,
                    ],
                  },
                  then: {
                    $arrayElemAt: [
                      '$optionLogics',
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.global.setter',
                        ],
                      },
                    ],
                  },
                  else: null,
                },
              },
              'options.merge.condition': {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.merge.condition',
                        ],
                      },
                      -1,
                    ],
                  },
                  then: {
                    $arrayElemAt: [
                      '$optionLogics',
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.merge.condition',
                        ],
                      },
                    ],
                  },
                  else: null,
                },
              },
              'options.merge.filter': {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.merge.filter',
                        ],
                      },
                      -1,
                    ],
                  },
                  then: {
                    $arrayElemAt: [
                      '$optionLogics',
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.merge.filter',
                        ],
                      },
                    ],
                  },
                  else: null,
                },
              },
              'options.merge.projection': {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.merge.projection',
                        ],
                      },
                      -1,
                    ],
                  },
                  then: {
                    $arrayElemAt: [
                      '$optionLogics',
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.merge.projection',
                        ],
                      },
                    ],
                  },
                  else: null,
                },
              },
              'options.merge.setter': {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.merge.setter',
                        ],
                      },
                      -1,
                    ],
                  },
                  then: {
                    $arrayElemAt: [
                      '$optionLogics',
                      {
                        $indexOfArray: [
                          {
                            $map: {
                              input: '$optionLogics',
                              as: 'logic',
                              in: '$$logic._id',
                            },
                          },
                          '$options.merge.setter',
                        ],
                      },
                    ],
                  },
                  else: null,
                },
              },
            },
          },
          {
            $unset: 'optionLogics',
          },
          {
            $lookup: {
              from: 'roles',
              localField: '_id',
              foreignField: 'application',
              as: 'roles',
              pipeline: [
                {
                  $lookup: {
                    from: 'permissions',
                    localField: 'permissions',
                    foreignField: '_id',
                    as: 'permissions',
                    pipeline: [
                      {
                        $lookup: {
                          from: 'logics',
                          let: {
                            logics: ['$condition', '$filter', '$projection', '$setter'],
                          },
                          pipeline: [
                            {
                              $match: {
                                $expr: {
                                  $in: ['$_id', '$$logics'],
                                },
                              },
                            },
                          ],
                          as: 'permissionLogics',
                        },
                      },
                      {
                        $set: {
                          condition: {
                            $cond: {
                              if: {
                                $gt: [
                                  {
                                    $indexOfArray: [
                                      {
                                        $map: {
                                          input: '$permissionLogics',
                                          as: 'logic',
                                          in: '$$logic._id',
                                        },
                                      },
                                      '$condition',
                                    ],
                                  },
                                  -1,
                                ],
                              },
                              then: {
                                $arrayElemAt: [
                                  '$permissionLogics',
                                  {
                                    $indexOfArray: [
                                      {
                                        $map: {
                                          input: '$permissionLogics',
                                          as: 'logic',
                                          in: '$$logic._id',
                                        },
                                      },
                                      '$condition',
                                    ],
                                  },
                                ],
                              },
                              else: null,
                            },
                          },
                          filter: {
                            $cond: {
                              if: {
                                $gt: [
                                  {
                                    $indexOfArray: [
                                      {
                                        $map: {
                                          input: '$permissionLogics',
                                          as: 'logic',
                                          in: '$$logic._id',
                                        },
                                      },
                                      '$filter',
                                    ],
                                  },
                                  -1,
                                ],
                              },
                              then: {
                                $arrayElemAt: [
                                  '$permissionLogics',
                                  {
                                    $indexOfArray: [
                                      {
                                        $map: {
                                          input: '$permissionLogics',
                                          as: 'logic',
                                          in: '$$logic._id',
                                        },
                                      },
                                      '$filter',
                                    ],
                                  },
                                ],
                              },
                              else: null,
                            },
                          },
                          projection: {
                            $cond: {
                              if: {
                                $gt: [
                                  {
                                    $indexOfArray: [
                                      {
                                        $map: {
                                          input: '$permissionLogics',
                                          as: 'logic',
                                          in: '$$logic._id',
                                        },
                                      },
                                      '$projection',
                                    ],
                                  },
                                  -1,
                                ],
                              },
                              then: {
                                $arrayElemAt: [
                                  '$permissionLogics',
                                  {
                                    $indexOfArray: [
                                      {
                                        $map: {
                                          input: '$permissionLogics',
                                          as: 'logic',
                                          in: '$$logic._id',
                                        },
                                      },
                                      '$projection',
                                    ],
                                  },
                                ],
                              },
                              else: null,
                            },
                          },
                          setter: {
                            $cond: {
                              if: {
                                $gt: [
                                  {
                                    $indexOfArray: [
                                      {
                                        $map: {
                                          input: '$permissionLogics',
                                          as: 'logic',
                                          in: '$$logic._id',
                                        },
                                      },
                                      '$setter',
                                    ],
                                  },
                                  -1,
                                ],
                              },
                              then: {
                                $arrayElemAt: [
                                  '$permissionLogics',
                                  {
                                    $indexOfArray: [
                                      {
                                        $map: {
                                          input: '$permissionLogics',
                                          as: 'logic',
                                          in: '$$logic._id',
                                        },
                                      },
                                      '$setter',
                                    ],
                                  },
                                ],
                              },
                              else: null,
                            },
                          },
                        },
                      },
                      {
                        $unset: 'permissionLogics',
                      },
                    ],
                  },
                },
              ],
            },
          },
        ]

        const results = await server.models.Application.aggregate(pipeline).exec()

        if (results.length !== 1) throw new ApiError(404, { _id, model: 'Application' }, `Application with _id ${_id} does not exist.`)

        return results[0]
      },
    }

    server.log.debug('Application model attached')
  },
  {
    name: 'application-model',
    decorators: {
      fastify: ['mongoose', 'models', 'templates'],
    },
    dependencies: ['mongoose', 'documents'],
  }
)

export default model

// INTERFACES and TYPES

export type ApplicationOptions<Logic = ObjectIdNullable> = {
  /** Define logic that apply for all operations for the application. For example, only grant permission if `user.tenant` matches `document.tenant`. */
  global: {
    /**
     * reference to the Logic defining the conditions for access.
     *
     * defaults to `null`. If `null` the owner of the permission has conditionless permission.
     *
     * @example null
     */
    condition: Logic

    /**
     * reference to the Logic returning possible DB query filter for a list of a given resource.
     *
     * defaults to `null`. If `null` the owner of the permission can query resources without conditions.
     *
     * @example null
     */
    filter: Logic

    /**
     * reference to the Logic returning a projection describing which properties of the database resource can be accessed
     *
     * defaults to `null`. If `null` the owner of the permission can access all properties of a given resource.
     *
     * @example null
     */
    projection: Logic

    /**
     * reference to the Logic returning an object with properties and values to be set on the resource document.
     *
     * Document properties such as `createdBy: {{user.id}}` or `organization: {{user.organization}}` can be set that way for example.
     *
     * defaults to `null`. If `null` the PDP returns `null`
     *
     * @example null
     */
    setter: Logic
  }

  /** Define logic how to merge filters or projections if multiple apply */
  merge: {
    /**
     * reference to the Logic that combines conditions if multiple apply. If `null` the following is applied as default:
     *
     * - If both `global.condition` and `permission.condition` apply they are merged with logical `AND`. This means both conditions musst return `true`.
     * - If multiple `permission.condition` apply—for example if multiple roles apply—they are merged with logical `OR`. This means
     * only one condition must return `true`—allow if one role has permission.
     *
     * rules context data provides:
     *
     * - `items: LogicResult[]` - the list of the result of the evaluated logic items that apply
     * - `operation: string` - the name of the operation the permissions are checked for
     * - `type: 'permissions' | 'roles' | 'global'` - merge is executed when either multiple roles apply (type `'roles'`)
     * or global and operation filter are defined (type `'global'`). Use `type` to implement different merge rules
     * for these two scenarios.
     *
     * @example null
     */
    condition: Logic

    /**
     * how to merge filter results if multiple apply. It is only executed if more than one filter applies.
     *
     * rules context data provides:
     *
     * - `items: LogicResult[]` - the list of the result of the evaluated logic items that apply
     * - `operation: string` - the name of the operation the permissions are checked for
     * - `type: 'permissions' | 'roles' | 'global'` - merge is executed when either multiple roles apply (type `'roles'`)
     * or global and operation filter are defined (type `'global'`). Use `type` to implement different merge rules
     * for these two scenarios.
     *
     * @example null
     */
    filter: Logic

    /**
     * how to merge projection results if multiple apply. It is only executed if more than one filter applies.
     *
     * rules context data provides:
     *
     * - `items: LogicResult[]` - the list of the result of the evaluated logic items that apply
     * - `operation: string` - the name of the operation the permissions are checked for
     * - `type: 'permissions' | 'roles' | 'global'` - merge is executed when either multiple roles apply (type `'roles'`)
     * or global and operation filter are defined (type `'global'`). Use `type` to implement different merge rules
     * for these two scenarios.
     *
     * @example null
     */
    projection: Logic

    /**
     * how to merge setter results if multiple apply. It is only executed if more than one filter applies.
     *
     * rules context data provides:
     *
     * - `items: LogicResult[]` - the list of the result of the evaluated logic items that apply
     * - `operation: string` - the name of the operation the permissions are checked for
     * - `type: 'permissions' | 'roles' | 'global'` - merge is executed when either multiple roles apply (type `'roles'`)
     * or global and operation filter are defined (type `'global'`). Use `type` to implement different merge rules
     * for these two scenarios.
     *
     * @example null
     */
    setter: Logic
  }
}

/** a application represents one application or service */
export interface ApplicationSchema {
  /**
   * name of the application
   *
   * @example "pharmassist-p"
   */
  name: string

  /**
   * options that apply for the application
   */
  options: ApplicationOptions
}

export type ApplicationSchemaExtended = ApplicationSchema & TenantDocumentSchema

export type ApplicationSchemaLogicPopulated = Omit<ApplicationSchemaExtended, 'options'> & {
  options: ApplicationOptions<LogicRead | Record<string, unknown> | null>
}

export interface Policy {
  // TODO: type this
  roles: RoleRead<PermissionRead<LogicRead | Record<string, unknown> | null>>[]
}

export type ApplicationRead = DocumentRead<ApplicationSchemaExtended>
export type ApplicationItemResponse = Api.ItemResponse<ApplicationRead>
export type ApplicationListResponse = Api.ListResponse<ApplicationRead>
export type ApplicationCreate = DocumentCreate<ApplicationSchema, 'name'>
export type ApplicationUpdate = DocumentUpdate<ApplicationSchema>

/**
 * The complete policy (roles, permissions, etc.) for one application
 */
export type ApplicationPolicy = Partial<Policy & DocumentRead<ApplicationSchemaLogicPopulated>>

export type ApplicationPolicyResponse = Api.ItemResponse<ApplicationPolicy>
