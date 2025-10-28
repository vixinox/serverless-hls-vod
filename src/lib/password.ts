import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10

export const saltAndHashPassword = (password: string) => {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS)
  return bcrypt.hashSync(password, salt)
}

export const verifyPassword = (password: string, hash: string) => {
  return bcrypt.compareSync(password, hash)
}