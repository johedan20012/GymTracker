import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SymbolView } from 'expo-symbols';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MachineCard } from '@/components/machine-card';
import { Radius, Spacing } from '@/constants/theme';
import { getMachines, type Machine } from '@/db/machines';
import { useTheme } from '@/hooks/use-theme';

const COLUMNS = 3;

/** Lowercase and strip accents so "maquina" matches "Máquina". */
const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function MachinesScreen() {
  const db = useSQLiteContext();
  const colors = useTheme();
  const { width } = useWindowDimensions();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getMachines(db).then((rows) => {
        if (active) setMachines(rows);
      });
      return () => {
        active = false;
      };
    }, [db])
  );

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return machines;
    return machines.filter(
      (m) => normalize(m.name).includes(q) || normalize(m.muscles).includes(q)
    );
  }, [machines, query]);

  const cardWidth = (width - Spacing.md * 2 - Spacing.sm * (COLUMNS - 1)) / COLUMNS;

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.search, { borderColor: colors.accent }]}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={18}
            tintColor={colors.accent}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar máquina o ejercicio"
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
        <Pressable
          onPress={() => router.push('/maquina/nueva')}
          accessibilityRole="button"
          accessibilityLabel="Agregar máquina"
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: colors.green, opacity: pressed ? 0.7 : 1 },
          ]}>
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            size={24}
            tintColor={colors.onGreen}
            weight="bold"
          />
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        numColumns={COLUMNS}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        renderItem={({ item }) => (
          <MachineCard
            machine={item}
            width={cardWidth}
            onPress={() =>
              router.push({ pathname: '/maquina/[id]', params: { id: String(item.id) } })
            }
          />
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            {machines.length === 0
              ? 'Aún no hay máquinas. Toca "+" para agregar la primera.'
              : 'No hay resultados para tu búsqueda.'}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  search: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 0 },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: Spacing.md, gap: Spacing.sm, flexGrow: 1 },
  row: { gap: Spacing.sm },
  empty: { textAlign: 'center', marginTop: Spacing.xl, fontSize: 15 },
});
