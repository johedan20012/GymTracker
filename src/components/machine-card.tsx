import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { Machine } from '@/db/machines';
import { useTheme } from '@/hooks/use-theme';
import { resolveImageSource } from '@/utils/image-source';

type Props = {
  machine: Machine;
  width: number;
  onPress: () => void;
};

export function MachineCard({ machine, width, onPress }: Props) {
  const colors = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={machine.name}
      style={({ pressed }) => [
        styles.card,
        { width, borderColor: colors.text, backgroundColor: colors.card, opacity: pressed ? 0.7 : 1 },
      ]}>
      {machine.cover_uri ? (
        <Image
          source={resolveImageSource(machine.cover_uri)}
          style={styles.image}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <SymbolView
            name={{ ios: 'dumbbell', android: 'fitness_center', web: 'fitness_center' }}
            size={32}
            tintColor={colors.textSecondary}
          />
        </View>
      )}
      <View style={styles.nameBar}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {machine.name}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBar: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    minHeight: 40,
    justifyContent: 'center',
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
