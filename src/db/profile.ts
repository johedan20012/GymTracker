import { File } from 'expo-file-system';
import Storage from 'expo-sqlite/kv-store';

const PHOTO_KEY = 'profile.photoUri';

export async function getProfilePhoto() {
  return Storage.getItemAsync(PHOTO_KEY);
}

/** Saves the new photo URI and deletes the previous photo file, if any. */
export async function setProfilePhoto(uri: string | null) {
  const previous = await Storage.getItemAsync(PHOTO_KEY);
  if (previous && previous !== uri) {
    try {
      const old = new File(previous);
      if (old.exists) old.delete();
    } catch {
      // The old file may already be gone; nothing to clean up.
    }
  }
  if (uri) await Storage.setItemAsync(PHOTO_KEY, uri);
  else await Storage.removeItemAsync(PHOTO_KEY);
}
