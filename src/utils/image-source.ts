import type { ImageSource } from 'expo-image';

import { SEED_IMAGE_PREFIX, SEED_IMAGES } from '@/data/seed-images';

/**
 * Machine photos are stored as URIs. Photos bundled with the base catalog use a
 * `seed:<key>` URI and resolve to the bundled asset; anything else is a file URI.
 */
export function resolveImageSource(uri: string): ImageSource | number {
  if (uri.startsWith(SEED_IMAGE_PREFIX)) {
    const entry = SEED_IMAGES[uri.slice(SEED_IMAGE_PREFIX.length)];
    if (entry) return entry.source;
  }
  return { uri };
}

/** Attribution for a bundled photo (required by its Creative Commons license). */
export function imageCredit(uri: string | null): string | null {
  if (!uri?.startsWith(SEED_IMAGE_PREFIX)) return null;
  return SEED_IMAGES[uri.slice(SEED_IMAGE_PREFIX.length)]?.credit ?? null;
}
