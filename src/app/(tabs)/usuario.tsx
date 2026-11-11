import { Image } from 'expo-image';
import { useSQLiteContext } from 'expo-sqlite';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/theme';
import { getProfilePhoto, setProfilePhoto } from '@/db/profile';
import { useTheme } from '@/hooks/use-theme';
import { exportWorkoutsCsv } from '@/utils/export-csv';
import { pickImages } from '@/utils/images';

const AVATAR_SIZE = 140;

export default function UserScreen() {
  const db = useSQLiteContext();
  const colors = useTheme();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getProfilePhoto().then(setPhotoUri);
  }, []);

  const changePhoto = async () => {
    const [uri] = await pickImages({ multiple: false, square: true });
    if (!uri) return;
    await setProfilePhoto(uri);
    setPhotoUri(uri);
  };

  const removePhoto = async () => {
    await setProfilePhoto(null);
    setPhotoUri(null);
  };

  const onAvatarPress = () => {
    Alert.alert('Foto de perfil', undefined, [
      { text: photoUri ? 'Modificar foto' : 'Elegir foto', onPress: changePhoto },
      ...(photoUri
        ? [{ text: 'Quitar foto', style: 'destructive' as const, onPress: removePhoto }]
        : []),
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const onExport = async () => {
    setExporting(true);
    try {
      const rows = await exportWorkoutsCsv(db);
      if (rows === 0) {
        Alert.alert('Sin datos', 'El archivo se generó, pero aún no hay ejercicios registrados.');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'No se pudo exportar el archivo .csv.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          onPress={onAvatarPress}
          accessibilityRole="button"
          accessibilityLabel="Foto de perfil. Toca para modificarla"
          style={({ pressed }) => [
            styles.avatar,
            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <SymbolView
              name={{ ios: 'person.fill', android: 'person', web: 'person' }}
              size={72}
              tintColor={colors.textSecondary}
            />
          )}
          <View style={[styles.editBadge, { backgroundColor: colors.accent, borderColor: colors.background }]}>
            <SymbolView
              name={{ ios: 'camera.fill', android: 'photo_camera', web: 'photo_camera' }}
              size={16}
              tintColor="#fff"
            />
          </View>
        </Pressable>

        <View style={[styles.list, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <Pressable
            onPress={onExport}
            disabled={exporting}
            accessibilityRole="button"
            style={({ pressed }) => [styles.row, { opacity: pressed || exporting ? 0.6 : 1 }]}>
            <SymbolView
              name={{ ios: 'square.and.arrow.up', android: 'file_export', web: 'file_export' }}
              size={22}
              tintColor={colors.accent}
            />
            <Text style={[styles.rowText, { color: colors.text }]}>Exportar a .csv</Text>
            {exporting ? (
              <ActivityIndicator />
            ) : (
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                size={18}
                tintColor={colors.textSecondary}
              />
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.xl, alignItems: 'stretch' },
  avatar: {
    alignSelf: 'center',
    marginTop: Spacing.lg,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { borderWidth: 1, borderRadius: Radius.md, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  rowText: { flex: 1, fontSize: 16, fontWeight: '500' },
});
