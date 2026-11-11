import { router, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Field, FieldLabel, PrimaryButton } from '@/components/form';
import { Radius, Spacing } from '@/constants/theme';
import { getMachines, type Machine } from '@/db/machines';
import { addWorkout } from '@/db/workouts';
import { useTheme } from '@/hooks/use-theme';

const MAX_SETS = 12;

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Accepts "12.5" or "12,5". Returns NaN when not a number. */
const parseNumber = (s: string) => Number(s.trim().replace(',', '.'));

export default function AddWorkoutScreen() {
  const { fecha } = useLocalSearchParams<{ fecha: string }>();
  const db = useSQLiteContext();
  const colors = useTheme();

  const [machines, setMachines] = useState<Machine[]>([]);
  const [search, setSearch] = useState('');
  const [machineId, setMachineId] = useState<number | null>(null);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState<string[]>(['', '', '']);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMachines(db).then(setMachines);
  }, [db]);

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    return q ? machines.filter((m) => normalize(m.name).includes(q)) : machines;
  }, [machines, search]);

  const changeSets = (delta: number) => {
    setReps((prev) => {
      const next = prev.length + delta;
      if (next < 1 || next > MAX_SETS) return prev;
      // New sets copy the last set's reps for convenience.
      return delta > 0 ? [...prev, prev[prev.length - 1] ?? ''] : prev.slice(0, next);
    });
  };

  const setRepAt = (index: number, value: string) => {
    setReps((prev) => prev.map((r, i) => (i === index ? value.replace(/[^0-9]/g, '') : r)));
  };

  const save = async () => {
    if (!fecha) return;
    if (machineId === null) {
      Alert.alert('Falta la máquina', 'Elige la máquina o ejercicio que hiciste.');
      return;
    }
    const weightValue = parseNumber(weight);
    if (!Number.isFinite(weightValue) || weightValue < 0 || weight.trim() === '') {
      Alert.alert('Peso inválido', 'Escribe el peso usado en kg (0 si fue con peso corporal).');
      return;
    }
    const repValues = reps.map((r) => parseInt(r, 10));
    if (repValues.some((r) => !Number.isInteger(r) || r <= 0)) {
      Alert.alert('Repeticiones inválidas', 'Escribe las repeticiones de cada serie.');
      return;
    }

    setSaving(true);
    try {
      await addWorkout(db, { date: fecha, machineId, weight: weightValue, reps: repValues });
      router.back();
    } catch (e) {
      setSaving(false);
      Alert.alert('Error', 'No se pudo guardar. Intenta de nuevo.');
      console.error(e);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View>
          <FieldLabel>Máquina o ejercicio</FieldLabel>
          {machines.length === 0 ? (
            <View style={[styles.emptyBox, { borderColor: colors.border }]}>
              <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                Primero registra una máquina o ejercicio en la pestaña Máquinas.
              </Text>
            </View>
          ) : (
            <>
              <Field
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar..."
                autoCorrect={false}
              />
              <View style={styles.options}>
                {filtered.map((m) => {
                  const selected = m.id === machineId;
                  return (
                    <Pressable
                      key={m.id}
                      onPress={() => setMachineId(m.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      style={[
                        styles.option,
                        {
                          borderColor: selected ? colors.accent : colors.border,
                          backgroundColor: selected ? colors.accent : colors.card,
                        },
                      ]}>
                      <Text style={{ color: selected ? '#fff' : colors.text, fontWeight: '600' }}>
                        {m.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}
        </View>

        <View>
          <FieldLabel>Peso usado (kg)</FieldLabel>
          <Field
            value={weight}
            onChangeText={setWeight}
            placeholder="Ej. 40"
            keyboardType="decimal-pad"
          />
        </View>

        <View>
          <FieldLabel>Series</FieldLabel>
          <View style={styles.stepper}>
            <StepButton icon="minus" onPress={() => changeSets(-1)} disabled={reps.length <= 1} />
            <Text style={[styles.stepValue, { color: colors.text }]}>{reps.length}</Text>
            <StepButton icon="plus" onPress={() => changeSets(1)} disabled={reps.length >= MAX_SETS} />
          </View>
        </View>

        <View>
          <FieldLabel>Repeticiones por serie</FieldLabel>
          <View style={styles.repsGrid}>
            {reps.map((value, index) => (
              <View key={index} style={styles.repItem}>
                <Text style={[styles.repLabel, { color: colors.textSecondary }]}>
                  Serie {index + 1}
                </Text>
                <Field
                  value={value}
                  onChangeText={(v) => setRepAt(index, v)}
                  placeholder="0"
                  keyboardType="number-pad"
                  style={styles.repInput}
                />
              </View>
            ))}
          </View>
        </View>

        <PrimaryButton title="Guardar" onPress={save} disabled={saving || machines.length === 0} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function StepButton({
  icon,
  onPress,
  disabled,
}: {
  icon: 'plus' | 'minus';
  onPress: () => void;
  disabled: boolean;
}) {
  const colors = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={icon === 'plus' ? 'Agregar serie' : 'Quitar serie'}
      style={[
        styles.stepButton,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: disabled ? 0.4 : 1 },
      ]}>
      <SymbolView
        name={
          icon === 'plus'
            ? { ios: 'plus', android: 'add', web: 'add' }
            : { ios: 'minus', android: 'remove', web: 'remove' }
        }
        size={22}
        tintColor={colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.md, gap: Spacing.lg, paddingBottom: Spacing.xl * 2 },
  emptyBox: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  option: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  stepButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { fontSize: 22, fontWeight: '700', minWidth: 32, textAlign: 'center' },
  repsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  repItem: { width: '31%' },
  repLabel: { fontSize: 13, marginBottom: 2 },
  repInput: { textAlign: 'center' },
});
