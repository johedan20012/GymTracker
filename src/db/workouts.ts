import type { SQLiteDatabase } from 'expo-sqlite';

import type { MachineKind } from '@/db/machines';

type WorkoutRow = {
  id: number;
  date: string;
  machine_id: number;
  machine_name: string;
  machine_kind: MachineKind;
  weight: number;
  sets: number;
  reps: string;
};

export type Workout = Omit<WorkoutRow, 'reps'> & { reps: number[] };

export type NewWorkout = {
  date: string;
  machineId: number;
  weight: number;
  reps: number[];
};

function parseReps(raw: string): number[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.map(Number) : [];
  } catch {
    return [];
  }
}

export async function getWorkoutsByDate(db: SQLiteDatabase, date: string): Promise<Workout[]> {
  const rows = await db.getAllAsync<WorkoutRow>(
    `SELECT w.id, w.date, w.machine_id, m.name AS machine_name, m.kind AS machine_kind,
            w.weight, w.sets, w.reps
       FROM workouts w JOIN machines m ON m.id = w.machine_id
      WHERE w.date = ?
      ORDER BY w.id`,
    date
  );
  return rows.map((row) => ({ ...row, reps: parseReps(row.reps) }));
}

export async function getAllWorkouts(db: SQLiteDatabase): Promise<Workout[]> {
  const rows = await db.getAllAsync<WorkoutRow>(
    `SELECT w.id, w.date, w.machine_id, m.name AS machine_name, m.kind AS machine_kind,
            w.weight, w.sets, w.reps
       FROM workouts w JOIN machines m ON m.id = w.machine_id
      ORDER BY w.date, w.id`
  );
  return rows.map((row) => ({ ...row, reps: parseReps(row.reps) }));
}

/** Returns the set of dates (YYYY-MM-DD) between `from` and `to` that have at least one workout. */
export async function getWorkoutDatesInRange(db: SQLiteDatabase, from: string, to: string) {
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT DISTINCT date FROM workouts WHERE date BETWEEN ? AND ?',
    from,
    to
  );
  return new Set(rows.map((r) => r.date));
}

export async function addWorkout(db: SQLiteDatabase, workout: NewWorkout) {
  await db.runAsync(
    'INSERT INTO workouts (date, machine_id, weight, sets, reps) VALUES (?, ?, ?, ?, ?)',
    workout.date,
    workout.machineId,
    workout.weight,
    workout.reps.length,
    JSON.stringify(workout.reps)
  );
}

export async function deleteWorkout(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM workouts WHERE id = ?', id);
}
