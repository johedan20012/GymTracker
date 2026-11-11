import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
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

import { Field, FieldLabel, PrimaryButton, SegmentedControl } from '@/components/form';
import { Radius, Spacing } from '@/constants/theme';
import type { MachineInput, MachineKind } from '@/db/machines';
import { useTheme } from '@/hooks/use-theme';
import { resolveImageSource } from '@/utils/image-source';
import { pickImages } from '@/utils/images';

type Props = {
  initial?: MachineInput;
  submitLabel: string;
  onSubmit: (machine: MachineInput) => Promise<void>;
};

const EMPTY: MachineInput = {
  name: '',
  kind: 'machine',
  muscles: '',
  tips: '',
  coverUri: null,
  photoUris: [],
};

export function MachineForm({ initial = EMPTY, submitLabel, onSubmit }: Props) {
  const colors = useTheme();
  const [name, setName] = useState(initial.name);
  const [kind, setKind] = useState<MachineKind>(initial.kind);
  const [muscles, setMuscles] = useState(initial.muscles);
  const [tips, setTips] = useState(initial.tips);
  const [coverUri, setCoverUri] = useState<string | null>(initial.coverUri);
  const [photoUris, setPhotoUris] = useState<string[]>(initial.photoUris);
  const [saving, setSaving] = useState(false);

  const chooseCover = async () => {
    const [uri] = await pickImages({ multiple: false });
    if (uri) setCoverUri(uri);
  };

  const onCoverPress = () => {
    if (!coverUri) {
      chooseCover();
      return;
    }
    Alert.alert('Foto principal', undefined, [
      { text: 'Cambiar foto', onPress: chooseCover },
      { text: 'Quitar foto', style: 'destructive', onPress: () => setCoverUri(null) },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const addPhotos = async () => {
    const uris = await pickImages({ multiple: true });
    if (uris.length) setPhotoUris((prev) => [...prev, ...uris]);
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Falta el nombre', 'Escribe el nombre de la máquina o ejercicio.');
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        kind,
        muscles: muscles.trim(),
        tips: tips.trim(),
        coverUri,
        photoUris,
      });
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
          <FieldLabel>Tipo</FieldLabel>
          <SegmentedControl
            options={[
              { value: 'machine', label: 'Máquina' },
              { value: 'free', label: 'Ejercicio libre' },
            ]}
            value={kind}
            onChange={setKind}
          />
        </View>

        <View>
          <FieldLabel>Nombre</FieldLabel>
          <Field value={name} onChangeText={setName} placeholder="Ej. Prensa de piernas" />
        </View>

        <View>
          <FieldLabel>Foto principal</FieldLabel>
          <Pressable
            onPress={onCoverPress}
            accessibilityLabel={coverUri ? 'Cambiar o quitar foto principal' : 'Elegir foto principal'}
            style={[styles.coverPicker, { borderColor: colors.border, backgroundColor: colors.card }]}>
            {coverUri ? (
              <Image
                source={resolveImageSource(coverUri)}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
              />
            ) : (
              <>
                <SymbolView
                  name={{ ios: 'photo', android: 'add_photo_alternate', web: 'add_photo_alternate' }}
                  size={32}
                  tintColor={colors.textSecondary}
                />
                <Text style={{ color: colors.textSecondary }}>Elegir foto</Text>
              </>
            )}
          </Pressable>
        </View>

        <View>
          <FieldLabel>Músculos que se trabajan</FieldLabel>
          <Field
            value={muscles}
            onChangeText={setMuscles}
            placeholder="Ej. Cuádriceps, glúteos, isquiotibiales"
            multiline
          />
        </View>

        <View>
          <FieldLabel>Tips importantes</FieldLabel>
          <Field
            value={tips}
            onChangeText={setTips}
            placeholder="Ej. No bloquear las rodillas al extender"
            multiline
          />
        </View>

        <View>
          <FieldLabel>Fotos de cómo se utiliza</FieldLabel>
          <View style={styles.thumbs}>
            {photoUris.map((uri, index) => (
              <Pressable
                key={`${uri}-${index}`}
                onLongPress={() => setPhotoUris((prev) => prev.filter((_, i) => i !== index))}
                accessibilityHint="Mantén presionado para quitar">
                <Image source={resolveImageSource(uri)} style={styles.thumb} contentFit="cover" />
              </Pressable>
            ))}
            <Pressable
              onPress={addPhotos}
              accessibilityLabel="Agregar fotos"
              style={[styles.thumb, styles.addThumb, { borderColor: colors.border }]}>
              <SymbolView
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                size={28}
                tintColor={colors.textSecondary}
              />
            </Pressable>
          </View>
          {photoUris.length > 0 && (
            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Mantén presionada una foto para quitarla.
            </Text>
          )}
        </View>

        <PrimaryButton title={submitLabel} onPress={save} disabled={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.md, gap: Spacing.lg, paddingBottom: Spacing.xl * 2 },
  coverPicker: {
    height: 180,
    borderWidth: 1,
    borderRadius: Radius.md,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    overflow: 'hidden',
  },
  thumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  thumb: { width: 88, height: 88, borderRadius: Radius.sm },
  addThumb: {
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { fontSize: 13, marginTop: Spacing.xs },
});
