import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

/**
 * Deletes photo files the app copied into its own folder. Bundled photos
 * (`seed:` URIs) and anything outside the app folder are left alone.
 */
export function deleteImageFiles(uris: string[]) {
  const dirUri = new Directory(Paths.document, 'images').uri;
  for (const uri of uris) {
    if (!uri.startsWith(dirUri)) continue;
    try {
      const file = new File(uri);
      if (file.exists) file.delete();
    } catch {
      // Already gone; nothing to clean up.
    }
  }
}

/**
 * Opens the photo library and copies the chosen images into the app's document
 * directory, so they survive cache cleanup. Returns the persistent URIs.
 */
export async function pickImages(options: {
  multiple: boolean;
  /** Lets the user crop to a square (only for single selection). */
  square?: boolean;
}): Promise<string[]> {
  const crop = options.square && !options.multiple;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: options.multiple,
    allowsEditing: crop,
    aspect: crop ? [1, 1] : undefined,
    quality: 0.8,
  });
  if (result.canceled) return [];

  const dir = new Directory(Paths.document, 'images');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });

  return result.assets.map((asset) => {
    const source = new File(asset.uri);
    const ext = source.extension || '.jpg';
    const target = new File(
      dir,
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    );
    source.copy(target);
    return target.uri;
  });
}
