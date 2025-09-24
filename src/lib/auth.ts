import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
export async function authenticate(email: string, password: string) {
  const u = await prisma.user.findUnique({ where: { email } })
  if (!u) return null
  const ok = await bcrypt.compare(password, u.password)
  return ok ? u : null
}
