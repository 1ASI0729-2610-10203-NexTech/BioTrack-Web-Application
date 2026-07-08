import { User } from '../domain/model/user.entity'

export const UserAssembler = {
  fromApi(payload) {
    return new User({
      id: payload.id,
      email: payload.email,
      firstName: payload.firstName ?? '',
      lastName: payload.lastName ?? '',
      role: payload.role,
      status: payload.status,
      emailVerified: payload.emailVerified ?? false,
    })
  },
}
