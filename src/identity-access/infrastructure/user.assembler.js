import { User } from '../domain/model/user.entity'

export const UserAssembler = {
  fromApi(payload) {
    return new User({
      id: payload.id,
      email: payload.email,
      passwordHash: payload.password_hash ?? '$demo-hash-123',
      accountType: payload.account_type,
      accountStatus: payload.account_status,
      createdAt: payload.created_at,
      updatedAt: payload.updated_at,
    })
  },
}
