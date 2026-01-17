import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import { DATABASE_PATH } from './config';

// Use centralized database configuration
const sqlite = new Database(DATABASE_PATH);
const db = drizzle(sqlite, { schema });

export default db;
export * from './schema';
