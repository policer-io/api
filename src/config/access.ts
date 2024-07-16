import type { Logic, Policy } from '@policer-io/pdp-ts'

/** list of supported roles */
export const roleNames = [
  /** the maintainer of an application */
  'maintainer',
  /** the owner/admin of a tenant */
  'owner',
  /** a global admin with all permissions for all tenants */
  'god',
] as const

const noGodRoles: Logic = {
  name: 'no god roles',
  rule: {
    and: [
      { var: 'body.roles.length' },
      {
        '!': { in: ['god', { var: 'body.roles' }] },
      },
    ],
  },
  type: 'condition',
}
const noGodUsers: Logic = {
  name: 'no god users',
  rule: {
    and: [
      { var: 'document.roles.length' },
      {
        '!': { in: ['god', { var: 'document.roles' }] },
      },
    ],
  },
  type: 'condition',
}

export const policy: Policy<(typeof roleNames)[number]> = {
  name: 'cockpit-api',
  roles: [
    {
      name: 'owner',
      description: 'the owner/admin of a tenant',
      permissions: [
        { name: 'user:create', condition: noGodRoles },
        { name: 'user:read' },
        { name: 'user:list' },
        { name: 'user:update', condition: noGodRoles },
        { name: 'user:remove', condition: noGodUsers },
        { name: 'user:reactivate', condition: noGodUsers },
        { name: 'user:revokeToken', condition: noGodUsers },
      ],
      inherits: [],
    },
    {
      name: 'god',
      description: 'a global admin with all permissions for all tenants',
      permissions: [{ name: '*:*' }, { name: 'global:withoutTenant' }, { name: 'global:overwriteTenant' }],
      inherits: [],
    },
  ],
  options: {
    global: {
      condition: {
        name: 'enforce and check tenant',
        rule: {
          or: [
            { '===': [{ var: 'operation' }, 'global:withoutTenant'] },
            { '===': [{ var: 'operation' }, 'global:overwriteTenant'] },
            {
              and: [
                {
                  or: [
                    { var: 'tenant' },
                    {
                      and: [
                        { '!': { var: 'tenant' } },
                        { var: 'canWithoutTenant' },
                        { or: [{ '===': [{ var: 'method' }, 'GET'] }, { '===': [{ var: 'target' }, 'tenant'] }, { '===': [{ var: 'target' }, 'user'] }] },
                      ],
                    },
                  ],
                },
                {
                  or: [
                    { '!': { var: 'tenant' } },
                    { '!': { var: 'document' } },
                    { and: [{ '!==': [{ var: 'document.model' }, 'Tenant'] }, { '===': [{ var: 'tenant' }, { var: 'document.tenant' }] }] },
                    { and: [{ '===': [{ var: 'document.model' }, 'Tenant'] }, { '===': [{ var: 'tenant' }, { var: 'document._id' }] }] },
                  ],
                },
              ],
            },
          ],
        },
        type: 'condition',
      },
      filter: {
        name: 'filter tenant documents',
        rule: {
          if: [
            { var: 'tenant' },
            {
              if: [
                { '===': [{ var: 'target' }, 'tenant'] },
                { json: '{ "_id": {{tenant}} }' },
                { '===': [{ var: 'target' }, 'user'] },
                null,
                { json: '{ "tenant": {{tenant}} }' },
              ],
            },
            null,
          ],
        },
        type: 'filter',
      },
      projection: null,
      setter: {
        name: 'set tenant and user references',
        rule: {
          if: [
            { or: [{ '===': [{ var: 'method' }, 'POST'] }, { '===': [{ var: 'method' }, 'PATCH'] }, { '===': [{ var: 'method' }, 'PUT'] }] },
            {
              json: [
                '{ "tenant": {{0}}, "createdBy": {{1}}, "updatedBy": {{2}} }',
                [
                  { var: 'tenant' },
                  { if: [{ '===': [{ var: 'method' }, 'POST'] }, { var: 'auth.user.uid' }] },
                  { if: [{ '===': [{ var: 'method' }, 'PATCH'] }, { var: 'auth.user.uid' }] },
                ],
              ],
            },
          ],
        },
        type: 'setter',
      },
    },
    merge: {
      condition: null,
      filter: {
        name: 'filter merger',
        rule: {
          if: [
            {
              or: [{ all: [{ var: 'items' }, { '!': { var: '' } }] }, { '!': { var: 'items' } }],
            },
            null,
            {
              if: [
                { '===': [{ var: 'type' }, 'global'] },
                { json: ['{ "$and": {{0}} }', [{ map: [{ var: 'items' }, { or: [{ var: '' }, {}] }] }]] },
                { json: ['{ "$or": {{0}} }', [{ map: [{ var: 'items' }, { or: [{ var: '' }, {}] }] }]] },
              ],
            },
          ],
        },
        type: 'filter',
      },
      projection: {
        name: 'setter merger',
        rule: {
          if: [
            {
              or: [{ all: [{ var: 'items' }, { '!': { var: '' } }] }, { '!': { var: 'items' } }],
            },
            null,
            {
              json: ['{{0.0}}', [{ filter: [{ var: 'items' }, { var: '' }] }]],
            },
          ],
        },
        type: 'projection',
      },
      setter: {
        name: 'setter merger',
        rule: {
          if: [
            {
              or: [{ all: [{ var: 'items' }, { '!': { var: '' } }] }, { '!': { var: 'items' } }],
            },
            null,
            {
              json: ['{{0.0}}', [{ filter: [{ var: 'items' }, { var: '' }] }]],
            },
          ],
        },
        type: 'setter',
      },
    },
  },
  tenant: 'bve',
}
