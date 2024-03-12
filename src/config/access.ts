/** list of supported roles */
export const roleNames = [
  /** the enforcer does the access control for a given application */
  'enforcer',
  /** the maintainer of an application */
  'maintainer',
  /** the owner/admin of a tenant */
  'owner',
  /** a global admin with all permissions for all tenants */
  'god',
] as const
