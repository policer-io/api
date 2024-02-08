/** list of supported roles */
export const roleNames = [
  /** the customer of a pharmacy */
  'customer',
  /** someone who uses the app for training */
  'student',
  /** an employee of a pharmacy */
  'employee',
  /** a manager of a pharmacy */
  'manager',
  /** the owner/admin of a pharmacy chain */
  'owner',
  /** a content manager to edit flows and trainings */
  'editor',
  /** uses pharMe data for research purposes */
  'researcher',
  /** a global admin with all permissions for all tenants */
  'god',
] as const
