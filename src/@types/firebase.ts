// import { Auth as AuthAdmin } from 'firebase-admin/auth'
import type { RoleName } from './access'
import { Api } from './api'
import { DocumentCreate, ObjectId } from './models'
// import { Auth } from 'firebase/auth'

// export interface Firebase {
//   auth: Auth
//   authAdmin: AuthAdmin
// }

/**
 * firebase unique user id (`uid`)
 *
 * @example "lPH2TpSJ7WYm4JhqfzyjVXeyaLC1"
 */
export type UID = string

export interface FirebaseUser {
  uid: UID
  email: string
  emailVerified: boolean
  displayName: string
  disabled: boolean
  metadata: {
    /** @nullable */
    lastSignInTime: Date

    creationTime: Date

    /** @nullable */
    lastRefreshTime: Date
  }
  customClaims?: UserClaims
  tokensValidAfterTime: Date
}

export interface UserSettable {
  email: FirebaseUser['email']
  displayName: FirebaseUser['displayName']
  roles: RoleName[]
  tenants: ObjectId<string>[]
  applications: ObjectId<string>[]
}

/** custom claims to be propagated to the auth token */
export interface UserClaims {
  /** the tenants the user belongs to */
  tns?: ObjectId<string>[]
  /** the roles of the user */
  rls?: RoleName[]
  /** the applications the user has access to */
  aps?: ObjectId<string>[]
}

export type UserCreate = DocumentCreate<UserSettable, 'email' | 'displayName'>
export type UserItemResponse = Api.ItemResponse<FirebaseUser>
export type UserListResponse = Api.ListResponse<FirebaseUser>
export type UserUpdate = Partial<UserSettable>

export interface UserLoginData {
  email: string
  password: string
}
export interface UserLoginRoute {
  Body: UserLoginData
}
export type UserLoginResponse = Api.ItemResponse<{ token: string; user: Pick<Partial<FirebaseUser>, 'uid' | 'email' | 'displayName'> }>
