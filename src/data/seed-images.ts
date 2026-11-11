// Generated from Wikimedia Commons metadata (see assets/images/machines/CREDITS.md).
// Photos are freely licensed; each credit is shown under the photo as its license requires.

export const SEED_IMAGE_PREFIX = 'seed:';

type SeedImage = { source: number; credit: string };

export const SEED_IMAGES: Record<string, SeedImage> = {
  abductor: {
    source: require('@/assets/images/machines/abductor.jpg'),
    credit: "Teemeah · CC BY-SA 4.0 · Wikimedia Commons",
  },
  biceps_maquina: {
    source: require('@/assets/images/machines/biceps_maquina.jpg'),
    credit: "Aliva Sahoo · CC BY-SA 4.0 · Wikimedia Commons",
  },
  pantorrilla: {
    source: require('@/assets/images/machines/pantorrilla.jpg'),
    credit: "George Stepanek · CC BY-SA 3.0 · Wikimedia Commons",
  },
  press_pecho: {
    source: require('@/assets/images/machines/press_pecho.jpg'),
    credit: "Tyler  Read · CC BY 2.0 · Wikimedia Commons",
  },
  curl_femoral_acostado: {
    source: require('@/assets/images/machines/curl_femoral_acostado.jpg'),
    credit: "George Stepanek · CC BY-SA 3.0 · Wikimedia Commons",
  },
  extension_cuadriceps: {
    source: require('@/assets/images/machines/extension_cuadriceps.jpg'),
    credit: "George Stepanek · CC BY-SA 3.0 · Wikimedia Commons",
  },
  pec_fly: {
    source: require('@/assets/images/machines/pec_fly.jpg'),
    credit: "Aliva Sahoo · CC BY-SA 4.0 · Wikimedia Commons",
  },
  jalon_pecho: {
    source: require('@/assets/images/machines/jalon_pecho.jpg'),
    credit: "Santeri Viinamäki · CC BY-SA 4.0 · Wikimedia Commons",
  },
  remo_sentado: {
    source: require('@/assets/images/machines/remo_sentado.jpg'),
    credit: "Miguel Angel Omaña Rojas · CC0 · Wikimedia Commons",
  },
  curl_femoral_sentado: {
    source: require('@/assets/images/machines/curl_femoral_sentado.jpg'),
    credit: "Everkinetic · CC BY-SA 3.0 · Wikimedia Commons",
  },
  prensa_sentado: {
    source: require('@/assets/images/machines/prensa_sentado.jpg'),
    credit: "Nenad Stojkovic · CC BY 2.0 · Wikimedia Commons",
  },
  press_hombro: {
    source: require('@/assets/images/machines/press_hombro.jpg'),
    credit: "George Stepanek · CC BY-SA 3.0 · Wikimedia Commons",
  },
  poleas_crossover: {
    source: require('@/assets/images/machines/poleas_crossover.jpg'),
    credit: "Nenad Stojkovic · CC BY 2.0 · Wikimedia Commons",
  },
  smith: {
    source: require('@/assets/images/machines/smith.jpg'),
    credit: "Everkinetic · CC BY-SA 3.0 · Wikimedia Commons",
  },
  prensa_45: {
    source: require('@/assets/images/machines/prensa_45.jpg'),
    credit: "Teemeah · CC BY-SA 4.0 · Wikimedia Commons",
  },
  press_banca: {
    source: require('@/assets/images/machines/press_banca.jpg'),
    credit: "Everkinetic · CC BY-SA 3.0 · Wikimedia Commons",
  },
  press_inclinado_mancuernas: {
    source: require('@/assets/images/machines/press_inclinado_mancuernas.jpg'),
    credit: "Everkinetic · CC BY-SA 3.0 · Wikimedia Commons",
  },
  sentadilla: {
    source: require('@/assets/images/machines/sentadilla.jpg'),
    credit: "Nenad Stojkovic · CC BY 2.0 · Wikimedia Commons",
  },
  peso_muerto: {
    source: require('@/assets/images/machines/peso_muerto.jpg'),
    credit: "Nenad Stojkovic · CC BY 2.0 · Wikimedia Commons",
  },
  peso_muerto_rumano: {
    source: require('@/assets/images/machines/peso_muerto_rumano.jpg'),
    credit: "Everkinetic · CC BY-SA 3.0 · Wikimedia Commons",
  },
  zancadas: {
    source: require('@/assets/images/machines/zancadas.jpg'),
    credit: "Tyler  Read · CC BY 2.0 · Wikimedia Commons",
  },
  remo_barra: {
    source: require('@/assets/images/machines/remo_barra.jpg'),
    credit: "Everkinetic · CC BY-SA 3.0 · Wikimedia Commons",
  },
  dominadas: {
    source: require('@/assets/images/machines/dominadas.jpg'),
    credit: "PTPioneer · CC BY 2.0 · Wikimedia Commons",
  },
  fondos: {
    source: require('@/assets/images/machines/fondos.jpg'),
    credit: "soh32\'s · CC BY-SA 3.0 · Wikimedia Commons",
  },
  press_militar_mancuernas: {
    source: require('@/assets/images/machines/press_militar_mancuernas.jpg'),
    credit: "Everkinetic · CC BY-SA 3.0 · Wikimedia Commons",
  },
  elevaciones_laterales: {
    source: require('@/assets/images/machines/elevaciones_laterales.jpg'),
    credit: "Everkinetic · CC BY-SA 3.0 · Wikimedia Commons",
  },
  plancha: {
    source: require('@/assets/images/machines/plancha.jpg'),
    credit: "Jaykayfit · CC BY-SA 3.0 · Wikimedia Commons",
  },
  crunch: {
    source: require('@/assets/images/machines/crunch.jpg'),
    credit: "Everkinetic · CC BY-SA 3.0 · Wikimedia Commons",
  },
  curl_mancuernas: {
    source: require('@/assets/images/machines/curl_mancuernas.jpg'),
    credit: "Everkinetic · CC BY-SA 3.0 · Wikimedia Commons",
  },
  curl_martillo: {
    source: require('@/assets/images/machines/curl_martillo.jpg'),
    credit: "Everkinetic · CC BY-SA 3.0 · Wikimedia Commons",
  },
  extension_triceps: {
    source: require('@/assets/images/machines/extension_triceps.jpg'),
    credit: "George Stepanek · CC BY-SA 3.0 · Wikimedia Commons",
  },
  aperturas: {
    source: require('@/assets/images/machines/aperturas.jpg'),
    credit: "Everkinetic · CC BY-SA 3.0 · Wikimedia Commons",
  },
};

/** URI stored in the database for a bundled photo, or null if the key has none. */
export function seedImageUri(key: string): string | null {
  return key in SEED_IMAGES ? SEED_IMAGE_PREFIX + key : null;
}
