import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Session } from '@/lib/auth';

export async function getSession(): Promise<Session | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireAuth(): Promise<Session | null> {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }
  return session;
}

export async function requireAdmin(): Promise<Session | null> {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }

  // Role is now included in the session from Better Auth
  if (session.user.role !== 'ADMIN') {
    return null;
  }

  return session;
}

export async function requireAdminOrRedirect(): Promise<Session> {
  const session = await requireAdmin();
  if (!session) {
    redirect('/login');
  }
  return session;
}
