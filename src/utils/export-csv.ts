import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { SQLiteDatabase } from 'expo-sqlite';

import { getAllWorkouts } from '@/db/workouts';

const HEADERS = ['Fecha', 'Maquina/Ejercicio', 'Peso', 'Series', 'Repeticiones'];

/** Quotes a field when it contains a comma, quote or line break (RFC 4180). */
function csvField(value: string | number) {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function buildWorkoutsCsv(db: SQLiteDatabase) {
  const workouts = await getAllWorkouts(db);
  const lines = [
    HEADERS.join(','),
    ...workouts.map((w) =>
      [w.date, w.machine_name, w.weight, w.sets, w.reps.join('#')].map(csvField).join(',')
    ),
  ];
  return { csv: lines.join('\r\n'), rows: workouts.length };
}

/**
 * Writes all workouts to a CSV file and opens the system share sheet so the
 * user can save it or send it. Returns the number of exported rows.
 */
export async function exportWorkoutsCsv(db: SQLiteDatabase) {
  const { csv, rows } = await buildWorkoutsCsv(db);

  const file = new File(Paths.cache, `gymtracker-${new Date().toISOString().slice(0, 10)}.csv`);
  if (file.exists) file.delete();
  file.create();
  // BOM so Excel opens accents (á, é, ñ...) correctly.
  file.write('﻿' + csv);

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Compartir no está disponible en este dispositivo');
  }
  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    UTI: 'public.comma-separated-values-text',
    dialogTitle: 'Exportar entrenamientos',
  });
  return rows;
}
