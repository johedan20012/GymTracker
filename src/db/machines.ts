import type { SQLiteDatabase } from 'expo-sqlite';

import { deleteImageFiles } from '@/utils/images';

export type MachineKind = 'machine' | 'free';

export type Machine = {
  id: number;
  name: string;
  kind: MachineKind;
  muscles: string;
  tips: string;
  cover_uri: string | null;
};

export type MachinePhoto = {
  id: number;
  machine_id: number;
  uri: string;
  position: number;
};

export type MachineInput = {
  name: string;
  kind: MachineKind;
  muscles: string;
  tips: string;
  coverUri: string | null;
  photoUris: string[];
};

export async function getMachines(db: SQLiteDatabase) {
  return db.getAllAsync<Machine>(
    'SELECT id, name, kind, muscles, tips, cover_uri FROM machines ORDER BY name COLLATE NOCASE'
  );
}

export async function getMachine(db: SQLiteDatabase, id: number) {
  return db.getFirstAsync<Machine>(
    'SELECT id, name, kind, muscles, tips, cover_uri FROM machines WHERE id = ?',
    id
  );
}

export async function getMachinePhotos(db: SQLiteDatabase, machineId: number) {
  return db.getAllAsync<MachinePhoto>(
    'SELECT id, machine_id, uri, position FROM machine_photos WHERE machine_id = ? ORDER BY position',
    machineId
  );
}

export async function addMachine(db: SQLiteDatabase, machine: MachineInput) {
  let newId = 0;
  await db.withTransactionAsync(async () => {
    const result = await db.runAsync(
      'INSERT INTO machines (name, kind, muscles, tips, cover_uri) VALUES (?, ?, ?, ?, ?)',
      machine.name,
      machine.kind,
      machine.muscles,
      machine.tips,
      machine.coverUri
    );
    newId = result.lastInsertRowId;
    for (const [index, uri] of machine.photoUris.entries()) {
      await db.runAsync(
        'INSERT INTO machine_photos (machine_id, uri, position) VALUES (?, ?, ?)',
        newId,
        uri,
        index
      );
    }
  });
  return newId;
}

/** Replaces the machine's data and photo list, then deletes photo files no longer used. */
export async function updateMachine(db: SQLiteDatabase, id: number, machine: MachineInput) {
  const before = await getMachine(db, id);
  const beforePhotos = await getMachinePhotos(db, id);

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'UPDATE machines SET name = ?, kind = ?, muscles = ?, tips = ?, cover_uri = ? WHERE id = ?',
      machine.name,
      machine.kind,
      machine.muscles,
      machine.tips,
      machine.coverUri,
      id
    );
    await db.runAsync('DELETE FROM machine_photos WHERE machine_id = ?', id);
    for (const [index, uri] of machine.photoUris.entries()) {
      await db.runAsync(
        'INSERT INTO machine_photos (machine_id, uri, position) VALUES (?, ?, ?)',
        id,
        uri,
        index
      );
    }
  });

  const kept = new Set([machine.coverUri, ...machine.photoUris]);
  const removed = [before?.cover_uri, ...beforePhotos.map((p) => p.uri)].filter(
    (uri): uri is string => !!uri && !kept.has(uri)
  );
  deleteImageFiles(removed);
}

export async function deleteMachine(db: SQLiteDatabase, id: number) {
  const machine = await getMachine(db, id);
  const photos = await getMachinePhotos(db, id);
  await db.runAsync('DELETE FROM machines WHERE id = ?', id);
  deleteImageFiles(
    [machine?.cover_uri, ...photos.map((p) => p.uri)].filter((u): u is string => !!u)
  );
}
