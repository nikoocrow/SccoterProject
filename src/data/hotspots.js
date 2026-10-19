// Points of interest in model space (length on X with the front at -X, floor at y=0).
// `label` is also the title shown in the hero while that part is in focus.
// `part` pins the hotspot to a moving rig part (see ScooterModel) so it follows steering.
export const HOTSPOTS = [
  {
    id: 'handlebar',
    part: 'handlebar',
    position: [-0.45, 2.15, 0.08],
    label: { en: 'Handlebar', es: 'Manubrio' },
    body: {
      en: 'Aluminium bar with a 15° rise for an upright, relaxed riding position. The bell and lights are always within thumb’s reach.',
      es: 'Barra de aluminio con 15° de elevación para una postura erguida y cómoda. El timbre y las luces siempre quedan al alcance del pulgar.',
    },
  },
  {
    id: 'grip',
    part: 'handlebar',
    position: [-0.45, 2.22, 0.5],
    label: { en: 'Grip & brake', es: 'Puño y freno' },
    body: {
      en: 'Soft rubber grips and a dual-piston brake lever. Squeeze lightly to regenerate, pull harder to stop on a dime.',
      es: 'Puños de caucho suave y palanca de freno de doble pistón. Presiona suave para regenerar energía, más fuerte para detenerte en seco.',
    },
  },
  {
    id: 'display',
    part: 'handlebar',
    position: [-0.6, 1.45, 0.1],
    label: { en: 'Display', es: 'Pantalla' },
    body: {
      en: 'Speed, battery and riding mode at a glance. Readable in direct sunlight and paired with the app over Bluetooth.',
      es: 'Velocidad, batería y modo de conducción de un vistazo. Legible bajo el sol directo y conectada a la app por Bluetooth.',
    },
  },
  {
    id: 'front-wheel',
    part: 'steer',
    position: [-0.92, 0.28, 0.14],
    label: { en: 'Front wheel', es: 'Rueda delantera' },
    body: {
      en: '10-inch pneumatic tire with front suspension that soaks up cobblestones, curbs and potholes.',
      es: 'Llanta neumática de 10 pulgadas con suspensión delantera que absorbe adoquines, bordillos y huecos.',
    },
  },
  {
    id: 'deck',
    position: [0.15, 0.32, 0.16],
    label: { en: 'Deck', es: 'Plataforma' },
    body: {
      en: 'A wide, non-slip deck that hides a 36 V battery with up to 40 km of range on a single charge.',
      es: 'Una plataforma ancha y antideslizante que esconde una batería de 36 V con hasta 40 km de autonomía por carga.',
    },
  },
  {
    id: 'rear-wheel',
    position: [0.97, 0.3, 0.12],
    label: { en: 'Rear motor', es: 'Motor trasero' },
    body: {
      en: '350 W hub motor, silent and sealed against rain. Climbs 15% slopes without breaking a sweat.',
      es: 'Motor de buje de 350 W, silencioso y sellado contra la lluvia. Sube pendientes del 15 % sin esfuerzo.',
    },
  },
]
