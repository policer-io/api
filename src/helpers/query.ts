import type { ParsedQs } from 'qs'

export const parseQueryTypes = (value: ParsedQs[string]): { [key: string]: unknown } | unknown => {
  const isNumber = (value: unknown): boolean => value === 'NaN' || (value !== '' && !Number.isNaN(Number(value)))
  const isBoolean = (value: unknown): boolean => value === 'true' || value === 'false'
  const isNull = (value: unknown): boolean => value === 'null'
  const isUndefined = (value: unknown): boolean => value === 'undefined' || typeof value === 'undefined' || value === ''
  const isArray = (value: unknown): boolean => Array.isArray(value)
  const isObject = (value: unknown): boolean => value?.constructor === Object
  const isEmptyString = (value: unknown): boolean => value === '\'\'' || value === '""'
  const isQuotedString = (value: unknown): boolean => typeof value === 'string' && new RegExp('(^["].+["|]$)|(^[\'].+[\'|]$)').test(value)

  if (isNull(value)) return null
  if (isUndefined(value)) return undefined
  if (isNumber(value)) return Number(value)
  if (isBoolean(value)) return value === 'true'
  if (isEmptyString(value)) return ''
  if (isQuotedString(value)) return (value as string).substring(1, (value as string).length - 1)
  if (isArray(value)) return (value as ParsedQs[] | string[]).map((item) => parseQueryTypes(item))
  if (isObject(value)) return Object.fromEntries(Object.entries(value as ParsedQs).map(([key, value]) => [key, parseQueryTypes(value)]))
  return value
}
