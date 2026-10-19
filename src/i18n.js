// UI copy in English and Spanish. Data files (hotspots, colors) carry their own
// { en, es } strings; everything else lives here.
export const LANGS = ['en', 'es']

export const UI = {
  en: {
    year: 'Year',
    details: 'Details',
    scroll: 'Scroll',
    view: 'View',
    colors: 'Scooter color',
    pose: 'Pose',
    language: 'Language',
    credits: 'Credits',
    creditsRole: 'Design, modeling and development',
    creditsMade: 'Made with Three.js',
    poses: { static: 'Static', ride: 'Ride', park: 'Park', fold: 'Fold' },
  },
  es: {
    year: 'Año',
    details: 'Detalles',
    scroll: 'Desliza',
    view: 'Ver',
    colors: 'Color del scooter',
    pose: 'Pose',
    language: 'Idioma',
    credits: 'Créditos',
    creditsRole: 'Diseño, modelado y desarrollo',
    creditsMade: 'Hecho con Three.js',
    poses: { static: 'Quieto', ride: 'Rodar', park: 'Parar', fold: 'Plegar' },
  },
}

// Right-column copy: the intro, plus one entry per pose shown after the
// visitor picks that pose.
export const INFO = {
  intro: {
    en: {
      title: 'Scooter',
      body: ['Built for the last mile: light, quiet and folds in three seconds. No parking, no traffic.'],
    },
    es: {
      title: 'Scooter',
      body: ['Hecho para la última milla: ligero, silencioso y se pliega en tres segundos. Sin estacionamiento, sin tráfico.'],
    },
  },
  ride: {
    en: {
      title: 'Ride mode',
      body: [
        'Up to 25 km/h with smooth, progressive acceleration. Regenerative braking feeds energy back into the battery every time you slow down.',
      ],
    },
    es: {
      title: 'Modo marcha',
      body: [
        'Hasta 25 km/h con una aceleración suave y progresiva. El frenado regenerativo devuelve energía a la batería cada vez que reduces la velocidad.',
      ],
    },
  },
  park: {
    en: {
      title: 'Park mode',
      body: [
        'The kickstand drops, the handlebar locks at an angle and the scooter stays put. Lock it from the app and walk away.',
      ],
    },
    es: {
      title: 'Modo estacionado',
      body: [
        'La pata baja, el manubrio se fija en ángulo y el scooter se queda en su sitio. Bloquéalo desde la app y sigue tu camino.',
      ],
    },
  },
  fold: {
    en: {
      title: 'Fold & go',
      body: [
        'One latch, one movement. The stem folds onto the rear hook so you can carry all 14 kg under one arm.',
      ],
    },
    es: {
      title: 'Pliega y llévalo',
      body: [
        'Un seguro, un movimiento. El manubrio se pliega sobre el gancho trasero para que lleves sus 14 kg bajo el brazo.',
      ],
    },
  },
}

export function detectLang() {
  try {
    const saved = localStorage.getItem('lang')
    if (LANGS.includes(saved)) return saved
  } catch {
    // Storage unavailable (private mode, blocked site data): fall through.
  }
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export function saveLang(lang) {
  try {
    localStorage.setItem('lang', lang)
  } catch {
    // Not critical: the choice just won't persist.
  }
}
