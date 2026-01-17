import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync } from 'fs';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Centralized database path configuration
 *
 * Priority:
 * 1. DATABASE_PATH environment variable (for production/deployment)
 * 2. For standalone builds: use /app/data or /data directory
 * 3. For development: use project root
 */
export function getDatabasePath(): string {
  // 1. Check environment variable first (for production deployment)
  if (process.env.DATABASE_PATH) {
    console.log('DB: Using DATABASE_PATH from environment:', process.env.DATABASE_PATH);
    return process.env.DATABASE_PATH;
  }

  // 2. Check if we're in a standalone build (production)
  // In standalone builds, we look for specific deployment directories
  const possibleDataDirs = [
    // Vercel/Container deployments
    '/app/data',
    '/data',
    // Standalone build next to .next
    path.join(process.cwd(), 'data'),
  ];

  for (const dataDir of possibleDataDirs) {
    // Check if directory exists or can be created
    const dbDir = path.dirname(dataDir);
    try {
      if (existsSync(dbDir) || dataDir === '/app/data' || dataDir === '/data') {
        // For containerized environments, use these paths
        // For local standalone, try to create the data directory
        if (!existsSync(dataDir)) {
          mkdirSync(dataDir, { recursive: true });
        }
        const dbPath = path.join(dataDir, 'phone-repair.db');
        console.log('DB: Using standalone build path:', dbPath);
        return dbPath;
      }
    } catch {
      // Continue to next option
    }
  }

  // 3. Fallback to development: project root
  // From src/db/index.ts, go up two levels to reach project root
  const projectRoot = path.resolve(__dirname, '../..');
  const dbPath = path.join(projectRoot, 'phone-repair.db');
  console.log('DB: Using development path:', dbPath);
  return dbPath;
}

/**
 * Initialize database directory and return the database path
 */
export function initializeDatabasePath(): string {
  const dbPath = getDatabasePath();
  const dbDir = path.dirname(dbPath);

  // Ensure the database directory exists
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  return dbPath;
}

// Export the configured path for use in other modules
export const DATABASE_PATH = initializeDatabasePath();
