import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(_request: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(allUsers);
  } catch (_) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, role = 'ADMIN' } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Use Better Auth API to sign up user (handles password hashing with scrypt)
    const result = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    // Check if result has user property (success) or not
    if (!result || !('user' in result) || !result.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 400 });
    }

    // Update the user's role
    const user = await prisma.user.update({
      where: { id: result.user.id },
      data: {
        role: role === 'admin' ? 'ADMIN' : 'USER',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (_) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
