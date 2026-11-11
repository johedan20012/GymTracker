import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { deleteWorkout, getWorkoutsByDate, type Workout } from '@/db/workouts';
import { useTheme } from '@/hooks/use-theme';
import { formatLongDate, parseISODate } from '@/utils/dates';

export default function DayScreen() {
  const { fecha } = useLocalSearchParams<{ fecha: string }>();
  const db = useSQLiteContext();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const date = parseISODate(fecha ?? '');

  const load = useCallback(async () => {
    if (!fecha) return;
    setWorkouts(await getWorkoutsByDate(db, fecha));
  }, [db, fecha]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const confirmDelete = (workout: Workout) => {
    Alert.alert('Eliminar ejercicio', `¿Eliminar "${workout.machine_name}" de este día?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteWorkout(db, workout.id);
          load();
        },
      },
    ]);
  };

  if (!date || !fecha) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>Fecha inválida.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}` }} />

      <FlatList
        data={workouts}
        keyExtractor={(w) => String(w.id)}
        contentContainerStyle={[styles.list, { paddingBottom: 120 + insets.bottom }]}
        ListHeaderComponent={
          <Text style={[styles.title, { color: colors.text }]}>{formatLongDate(date)}</Text>
        }
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            No hay ejercicios registrados este día.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() => confirmDelete(item)}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{item.machine_name}</Text>
              <Text style={[styles.weight, { color: colors.accent }]}>{item.weight} kg</Text>
            </View>
            <Text style={{ color: colors.textSecondary }}>
              {item.sets} {item.sets === 1 ? 'serie' : 'series'}
            </Text>
            <View style={styles.reps}>
              {item.reps.map((r, i) => (
                <View key={i} style={[styles.repChip, { borderColor: colors.border }]}>
                  <Text style={{ color: colors.text }}>
                    S{i + 1}: <Text style={styles.bold}>{r}</Text> reps
                  </Text>
                </View>
              ))}
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          workouts.length > 0 ? (
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Mantén presionado un ejercicio para eliminarlo.
            </Text>
          ) : undefined
        }
      />

      <View style={[styles.fabContainer, { bottom: Spacing.lg + insets.bottom }]} pointerEvents="box-none">
        <Pressable
          onPress={() => router.push({ pathname: '/dia/agregar', params: { fecha } })}
          accessibilityRole="button"
          accessibilityLabel="Agregar ejercicio"
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: colors.green, opacity: pressed ? 0.75 : 1 },
          ]}>
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            size={22}
            tintColor={colors.onGreen}
            weight="bold"
          />
          <Text style={[styles.fabText, { color: colors.onGreen }]}>Agregar ejercicio</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  title: { fontSize: 22, fontWeight: '700', marginBottom: Spacing.sm },
  empty: { textAlign: 'center', marginTop: Spacing.xl, fontSize: 15 },
  card: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 17, fontWeight: '700', flexShrink: 1 },
  weight: { fontSize: 17, fontWeight: '700' },
  reps: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs, marginTop: Spacing.xs },
  repChip: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  bold: { fontWeight: '700' },
  hint: { textAlign: 'center', fontSize: 13, marginTop: Spacing.md },
  fabContainer: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    height: 56,
    borderRadius: 28,
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
  },
  fabText: { fontSize: 17, fontWeight: '700' },
});
