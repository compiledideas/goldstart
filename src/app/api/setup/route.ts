import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

// GET /api/setup - Check if setup is needed (no admin users exist)
export async function GET() {
  try {
    console.log('SETUP: Checking setup status');
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });
    const needsSetup = adminCount === 0;
    console.log('SETUP: Admin users found:', adminCount, ', needsSetup:', needsSetup);

    return NextResponse.json({ needsSetup });
  } catch (_) {
    console.error('SETUP: Error checking setup status');
    // If tables don't exist, setup is needed
    return NextResponse.json({ needsSetup: true });
  }
}

// POST /api/setup - Create the first admin account
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('SETUP: Creating admin account for:', email);

    // Check if any admin already exists
    const existingAdminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    if (existingAdminCount > 0) {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 400 });
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Hash password and create admin
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('SETUP: Admin account created successfully for:', email);
    return NextResponse.json({ success: true });
  } catch (_) {
    console.error('SETUP: Error creating admin');
    return NextResponse.json({ error: 'Failed to create admin account' }, { status: 500 });
  }
}
