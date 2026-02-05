import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import { prisma } from './prisma';

export async function requireUser() {
  const token = cookies().get('auth_token')?.value;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  return user;
}
