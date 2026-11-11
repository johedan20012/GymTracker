import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { buildMonthGrid, toISODate, WEEKDAY_SHORT } from '@/utils/dates';

type Props = {
  year: number;
  month: number;
  width: number;
  today: string;
  workoutDates: Set<string>;
  onSelectDay: (isoDate: string) => void;
};

export const MonthView = memo(function MonthView({
  year,
  month,
  width,
  today,
  workoutDates,
  onSelectDay,
}: Props) {
  const colors = useTheme();
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const cellSize = (width - Spacing.md * 2) / 7;

  return (
    <View style={{ width, paddingHorizontal: Spacing.md }}>
      <View style={styles.row}>
        {WEEKDAY_SHORT.map((d) => (
          <Text
            key={d}
            style={[styles.weekday, { width: cellSize, color: colors.textSecondary }]}>
            {d}
          </Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((date, index) => {
          if (!date) {
            return <View key={`empty-${index}`} style={{ width: cellSize, height: cellSize }} />;
          }
          const iso = toISODate(date);
          const isToday = iso === today;
          const hasWorkout = workoutDates.has(iso);
          return (
            <Pressable
              key={iso}
              onPress={() => onSelectDay(iso)}
              accessibilityRole="button"
              accessibilityLabel={`${date.getDate()}${hasWorkout ? ', con ejercicios' : ''}`}
              style={({ pressed }) => [
                styles.cell,
                { width: cellSize, height: cellSize, opacity: pressed ? 0.6 : 1 },
              ]}>
              <View
                style={[
                  styles.dayCircle,
                  isToday && { backgroundColor: colors.accent },
                ]}>
                <Text
                  style={[
                    styles.dayText,
                    { color: isToday ? '#fff' : colors.text },
                    isToday && styles.bold,
                  ]}>
                  {date.getDate()}
                </Text>
              </View>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: hasWorkout ? colors.green : 'transparent' },
                ]}
              />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  weekday: { textAlign: 'center', fontWeight: '600', paddingVertical: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { alignItems: 'center', justifyContent: 'center', gap: 2 },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.lg + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: { fontSize: 16 },
  bold: { fontWeight: '700' },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
