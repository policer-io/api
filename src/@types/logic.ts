/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: improve RulesLogic interface
/**
 * JsonLogic rule with [supported operations](https://jsonlogic.com/operations.html)
 *
 * @example {"==" : [ { "var" : "document.owner" }, { "var" : "user._id" } ] }
 */
export type JsonLogicRule = Record<string, any>
