declare module 'mongoose' {
  function cast(schema: Schema, obj: Record<string, unknown>, options?: unknown, context?: unknown): Record<string, unknown>
}
