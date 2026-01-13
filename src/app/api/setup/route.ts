import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '@/db/schema';
import { eq } from 'drizzle-orm';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DATABASE_PATH || path.join(path.resolve(__dirname, '../../../..'), 'phone-repair.db');

// Initialize database and tables
async function initializeDatabase() {
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { schema });

  // Create tables manually using raw SQL
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS marks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      image TEXT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      mark_id INTEGER REFERENCES marks(id) ON DELETE SET NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS article_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    );
  `);

  return { sqlite, db };
}

// GET /api/setup - Check if setup is needed (no admin users exist)
export async function GET() {
  try {
    const { db } = await initializeDatabase();
    const adminUsers = await db.select().from(schema.users).where(eq(schema.users.role, 'admin')).limit(1);
    const needsSetup = adminUsers.length === 0;

    return NextResponse.json({ needsSetup });
  } catch (error) {
    console.error('Error checking setup status:', error);
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

    const { sqlite, db } = await initializeDatabase();

    // Check if any admin already exists
    const existingAdmins = await db.select().from(schema.users).where(eq(schema.users.role, 'admin')).limit(1);
    if (existingAdmins.length > 0) {
      sqlite.close();
      return NextResponse.json({ error: 'Setup already completed' }, { status: 400 });
    }

    // Check if email is already taken
    const existingUser = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    if (existingUser.length > 0) {
      sqlite.close();
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Hash password and create admin
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.insert(schema.users).values({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });

    sqlite.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Failed to create admin account' }, { status: 500 });
  }
}
