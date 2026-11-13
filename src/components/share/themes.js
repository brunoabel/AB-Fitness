/** Temas visuais do cartão de partilha da corrida. */
export const THEMES = {
  // id mantido por compatibilidade com preferências gravadas (era referenciado por nome de concorrente)
  'strava-orange': {
    id: 'strava-orange',
    name: 'Ignição',
    accent: '#fc5200',
    glow: 'rgba(252, 82, 0, 0.85)',
    bgGrad: ['#1c0f08', '#0a0502'],
    badge: 'Energia'
  },
  // id mantido por compatibilidade com preferências gravadas
  'ab-cyan': {
    id: 'ab-cyan',
    name: 'AB Midnight',
    accent: '#ffffff',
    glow: 'rgba(43, 74, 122, 0.85)',
    bgGrad: ['#0a1128', '#000000'],
    badge: 'Midnight'
  },
  'satellite-map': {
    id: 'satellite-map',
    name: 'Satélite HD',
    accent: '#34d399',
    glow: 'rgba(52, 211, 153, 0.85)',
    bgGrad: ['#0f1715', '#050a08'],
    badge: 'Satélite'
  },
  'transparent-white': {
    id: 'transparent-white',
    name: 'Sticker Claro',
    accent: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.4)',
    bgGrad: null,
    badge: 'Sticker Claro',
    transparent: true,
    ink: '#ffffff',
    shadow: 'rgba(0,0,0,0.65)'
  },
  'transparent-dark': {
    id: 'transparent-dark',
    name: 'Sticker Escuro',
    accent: '#0a0a0c',
    glow: 'rgba(0, 0, 0, 0.3)',
    bgGrad: null,
    badge: 'Sticker Escuro',
    transparent: true,
    ink: '#0a0a0c',
    shadow: 'rgba(255,255,255,0.55)'
  }
};
