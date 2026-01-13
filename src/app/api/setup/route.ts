import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/setup - Check if setup is needed (no admin users exist)
export async function GET() {
  try {
    const adminUsers = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    const needsSetup = adminUsers.length === 0;

    return NextResponse.json({ needsSetup });
  } catch (error) {
    console.error('Error checking setup status:', error);
    return NextResponse.json({ error: 'Failed to check setup status' }, { status: 500 });
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

    // Check if any admin already exists
    const existingAdmins = await db.select().from(users).where(eq(users.role, 'admin')).limit(1);
    if (existingAdmins.length > 0) {
      return NextResponse.json({ error: 'Setup already completed' }, { status: 400 });
    }

    // Check if email is already taken
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Hash password and create admin
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Failed to create admin account' }, { status: 500 });
  }
}
