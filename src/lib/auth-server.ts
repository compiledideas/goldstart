import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }

  // Get the full user data from the database to check role
  const { prisma } = await import('@/lib/prisma');
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return { ...session, user };
}

export async function requireAdminOrRedirect() {
  const session = await requireAdmin();
  if (!session) {
    redirect('/login');
  }
  return session;
}
