import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { fileURLToPath } from 'url';
import path from 'path';
import { mkdirSync, existsSync } from 'fs';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use database path from environment or fallback to local project root
const dbPath = process.env.DATABASE_PATH || path.join(path.resolve(__dirname, '../..'), 'phone-repair.db');

// Ensure the data directory exists
const dbDir = path.dirname(dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

export default db;
export * from './schema';
