import type { SQLiteDatabase } from 'expo-sqlite';

import { SEED_MACHINES } from '@/data/seed-machines';
import { seedImageUri } from '@/data/seed-images';

export const DATABASE_NAME = 'gymtracker.db';
const SCHEMA_VERSION = 2;

/** Formats tips as one bullet per line, the same way the detail screen shows them. */
export const formatTips = (tips: string[]) => tips.map((t) => `• ${t}`).join('\n');

/**
 * Inserts the base catalog. Runs once, inside the v2 migration, so machines the
 * user deletes later don't come back.
 */
async function insertSeedMachines(db: SQLiteDatabase) {
  for (const seed of SEED_MACHINES) {
    await db.runAsync(
      `INSERT OR IGNORE INTO machines (name, kind, muscles, tips, cover_uri, seed_key)
       VALUES (?, ?, ?, ?, ?, ?)`,
      seed.name,
      seed.kind,
      seed.muscles,
      formatTips(seed.tips),
      seedImageUri(seed.key),
      seed.key
    );
  }
}

/** Runs on app start, before any screen can query the database. */
export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if (version === null) {
    throw new Error('No se pudo leer la versión de la base de datos');
  }
  if (version.user_version >= SCHEMA_VERSION) {
    return;
  }

  await db.withTransactionAsync(async () => {
    if (version.user_version < 1) {
      await db.execAsync(`
        CREATE TABLE machines (
          id INTEGER PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          kind TEXT NOT NULL DEFAULT 'machine',
          muscles TEXT NOT NULL DEFAULT '',
          tips TEXT NOT NULL DEFAULT '',
          cover_uri TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE TABLE machine_photos (
          id INTEGER PRIMARY KEY NOT NULL,
          machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
          uri TEXT NOT NULL,
          position INTEGER NOT NULL DEFAULT 0
        );
        CREATE TABLE workouts (
          id INTEGER PRIMARY KEY NOT NULL,
          date TEXT NOT NULL,
          machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
          weight REAL NOT NULL,
          sets INTEGER NOT NULL,
          reps TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX workouts_date_idx ON workouts(date);
      `);
    }
    if (version.user_version < 2) {
      await db.execAsync(`
        ALTER TABLE machines ADD COLUMN seed_key TEXT;
        CREATE UNIQUE INDEX machines_seed_key_idx ON machines(seed_key);
      `);
      await insertSeedMachines(db);
    }
    await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
  });
}
