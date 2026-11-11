import { router, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SymbolView } from 'expo-symbols';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MonthView } from '@/components/month-view';
import { Spacing } from '@/constants/theme';
import { getWorkoutDatesInRange } from '@/db/workouts';
import { useTheme } from '@/hooks/use-theme';
import { MONTH_NAMES, toISODate } from '@/utils/dates';

/** How many months the pager can go back/forward from the current month. */
const RANGE = 120;
const MONTH_OFFSETS = Array.from({ length: RANGE * 2 + 1 }, (_, i) => i - RANGE);

export default function CalendarScreen() {
  const db = useSQLiteContext();
  const colors = useTheme();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<number>>(null);

  const now = useMemo(() => new Date(), []);
  const today = toISODate(now);
  const [index, setIndex] = useState(RANGE);
  const [workoutDates, setWorkoutDates] = useState<Set<string>>(new Set());

  const monthAt = useCallback(
    (offset: number) => {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    },
    [now]
  );

  const visible = monthAt(MONTH_OFFSETS[index]);

  // Load marked days for the visible month and its neighbours (so swiping shows dots immediately).
  useFocusEffect(
    useCallback(() => {
      let active = true;
      const offset = MONTH_OFFSETS[index];
      const start = monthAt(offset - 1);
      const end = monthAt(offset + 2);
      const from = toISODate(new Date(start.year, start.month, 1));
      const to = toISODate(new Date(end.year, end.month, 0));
      getWorkoutDatesInRange(db, from, to).then((dates) => {
        if (active) setWorkoutDates(dates);
      });
      return () => {
        active = false;
      };
    }, [db, index, monthAt])
  );

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(MONTH_OFFSETS.length - 1, next));
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
    setIndex(clamped);
  };

  const onSelectDay = useCallback((iso: string) => {
    router.push({ pathname: '/dia/[fecha]', params: { fecha: iso } });
  }, []);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => goTo(index - 1)} hitSlop={12} accessibilityLabel="Mes anterior">
          <SymbolView
            name={{ ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' }}
            size={24}
            tintColor={colors.text}
          />
        </Pressable>
        <Pressable onPress={() => goTo(RANGE)} accessibilityLabel="Ir al mes actual">
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {MONTH_NAMES[visible.month]} {visible.year}
          </Text>
        </Pressable>
        <Pressable onPress={() => goTo(index + 1)} hitSlop={12} accessibilityLabel="Mes siguiente">
          <SymbolView
            name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
            size={24}
            tintColor={colors.text}
          />
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={MONTH_OFFSETS}
        keyExtractor={(offset) => String(offset)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={RANGE}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={onMomentumEnd}
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        extraData={workoutDates}
        style={styles.pager}
        renderItem={({ item: offset }) => {
          const { year, month } = monthAt(offset);
          return (
            <MonthView
              year={year}
              month={month}
              width={width}
              today={today}
              workoutDates={workoutDates}
              onSelectDay={onSelectDay}
            />
          );
        }}
      />

      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Desliza para cambiar de mes · Toca un día para ver o registrar ejercicios
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  monthTitle: { fontSize: 22, fontWeight: '700' },
  pager: { flexGrow: 0 },
  hint: { textAlign: 'center', fontSize: 13, padding: Spacing.md },
});
