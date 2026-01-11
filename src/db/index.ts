import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Navigate to project root (src/db -> src -> project root)
const projectRoot = path.resolve(__dirname, '../..');
const dbPath = path.join(projectRoot, 'phone-repair.db');

const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

export default db;
export * from './schema';
