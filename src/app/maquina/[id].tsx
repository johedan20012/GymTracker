import { Image } from 'expo-image';
import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import {
  deleteMachine,
  getMachine,
  getMachinePhotos,
  type Machine,
  type MachinePhoto,
} from '@/db/machines';
import { useTheme } from '@/hooks/use-theme';
import { imageCredit, resolveImageSource } from '@/utils/image-source';

export default function MachineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const db = useSQLiteContext();
  const colors = useTheme();
  const [machine, setMachine] = useState<Machine | null | undefined>(undefined);
  const [photos, setPhotos] = useState<MachinePhoto[]>([]);

  // Reload on focus so changes made in the edit screen show up on return.
  useFocusEffect(
    useCallback(() => {
      const machineId = Number(id);
      let active = true;
      Promise.all([getMachine(db, machineId), getMachinePhotos(db, machineId)]).then(
        ([m, p]) => {
          if (!active) return;
          setMachine(m);
          setPhotos(p);
        }
      );
      return () => {
        active = false;
      };
    }, [db, id])
  );

  const confirmDelete = () => {
    if (!machine) return;
    Alert.alert(
      'Eliminar',
      `¿Eliminar "${machine.name}"? También se borrarán los ejercicios registrados con ella.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await deleteMachine(db, machine.id);
            router.back();
          },
        },
      ]
    );
  };

  if (machine === undefined) return null;

  const credit = imageCredit(machine?.cover_uri ?? null);

  if (machine === null) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>No se encontró la máquina.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}>
      <Stack.Screen
        options={{
          title: machine.name,
          headerRight: () => (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/maquina/editar', params: { id: String(machine.id) } })
              }
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Editar máquina">
              <Text style={[styles.headerButton, { color: colors.accent }]}>Editar</Text>
            </Pressable>
          ),
        }}
      />

      <Text style={[styles.title, { color: colors.text }]}>{machine.name}</Text>
      <Text style={[styles.kind, { color: colors.textSecondary }]}>
        {machine.kind === 'machine' ? 'Máquina' : 'Ejercicio libre'}
      </Text>

      {machine.cover_uri && (
        <View>
          <Image
            source={resolveImageSource(machine.cover_uri)}
            style={styles.cover}
            contentFit="cover"
          />
          {credit && (
            <Text style={[styles.credit, { color: colors.textSecondary }]}>Foto: {credit}</Text>
          )}
        </View>
      )}

      <Section title="Músculos que se trabajan" colors={colors}>
        {machine.muscles || 'Sin descripción.'}
      </Section>

      <Section title="Tips importantes" colors={colors}>
        {machine.tips || 'Sin tips.'}
      </Section>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Cómo se utiliza</Text>
      {photos.length === 0 ? (
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          No hay fotos de uso.
        </Text>
      ) : (
        <View style={styles.photos}>
          {photos.map((photo) => (
            <Image
              key={photo.id}
              source={resolveImageSource(photo.uri)}
              style={styles.photo}
              contentFit="cover"
            />
          ))}
        </View>
      )}

      <Pressable
        onPress={confirmDelete}
        style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.6 : 1 }]}>
        <Text style={[styles.deleteText, { color: colors.danger }]}>Eliminar</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: string;
  colors: ReturnType<typeof useTheme>;
}) {
  return (
    <View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: Spacing.xl },
  title: { fontSize: 28, fontWeight: '700' },
  kind: { fontSize: 14, marginTop: -Spacing.sm },
  cover: { width: '100%', aspectRatio: 16 / 10, borderRadius: Radius.md },
  credit: { fontSize: 11, marginTop: Spacing.xs },
  headerButton: { fontSize: 17, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.xs },
  body: { fontSize: 15, lineHeight: 22 },
  photos: { gap: Spacing.sm },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: Radius.md },
  deleteButton: { alignSelf: 'center', padding: Spacing.md, marginTop: Spacing.md },
  deleteText: { fontSize: 16, fontWeight: '600' },
});
