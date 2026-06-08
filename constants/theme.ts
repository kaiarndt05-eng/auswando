export const C = {
  // Surfaces
  bg: '#EEF1F9',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#F6F9FF',

  // Borders
  border: '#DDE4F2',
  borderFaint: '#ECF0FB',

  // Brand — bold sky-blue (Duolingo-style)
  primary: '#1CB0F6',
  primaryPress: '#0E95D9',
  primaryBg: 'rgba(28,176,246,0.08)',
  primaryLight: '#E3F4FE',

  // Accent — warm coral-orange
  accent: '#FF6B35',
  accentBg: 'rgba(255,107,53,0.08)',

  // Semantic
  success: '#00C98D',
  successBg: 'rgba(0,201,141,0.08)',
  successLight: '#E5FFF7',
  error: '#F03E3E',
  errorBg: 'rgba(240,62,62,0.08)',

  // Text hierarchy
  text: '#0D1117',
  textSub: '#5A6A8A',
  textMuted: '#A0AECB',

  // Tab
  tabBg: '#FFFFFF',
} as const;

// Duolingo-style rounded, extra-bold typeface stack
export const FONT = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

/** Darkens a hex color by `amount` (0–1) — used for the 3D "press depth" edge of buttons. */
export function shade(hex: string, amount = 0.18): string {
  const n = hex.replace('#', '');
  const r = Math.max(0, Math.round(parseInt(n.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(n.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(n.slice(4, 6), 16) * (1 - amount)));
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

export type CountryId = 'pt' | 'es' | 'ch';

export type Country = {
  id: CountryId;
  name: string;
  flag: string;
  color: string;
  tagline: string;
  pros: string[];
  cons: string[];
  mapX: number;
  mapY: number;
};

export const COUNTRIES: Country[] = [
  {
    id: 'pt',
    name: 'Portugal',
    flag: '🇵🇹',
    color: '#1BCAA0',
    tagline: 'Günstig, sonnig & steueroptimiert',
    pros: ['NHR Steuerstatus (10 Jahre)', 'Niedrige Lebenshaltungskosten', 'Englisch weit verbreitet'],
    cons: ['Niedrige Lokallöhne', 'Langsame Bürokratie'],
    mapX: 66,
    mapY: 170,
  },
  {
    id: 'es',
    name: 'Spanien',
    flag: '🇪🇸',
    color: '#F5A623',
    tagline: 'Sonne, Leben & Beckham Law',
    pros: ['Beckham Law (Flat Tax 24%)', 'Top Lebensqualität', 'Vielfältige Regionen'],
    cons: ['Spanisch praktisch Pflicht', 'Regionale Unterschiede'],
    mapX: 116,
    mapY: 159,
  },
  {
    id: 'ch',
    name: 'Schweiz',
    flag: '🇨🇭',
    color: '#F87171',
    tagline: 'Sicherheit, Ordnung & Top-Gehalt',
    pros: ['Höchste Löhne Europas', 'Nähe zu Deutschland', 'Politische Stabilität'],
    cons: ['Sehr hohe Lebenshaltungskosten', 'Nicht EU (EFTA)'],
    mapX: 207,
    mapY: 117,
  },
];

export const GERMANY = { x: 228, y: 82, flag: '🇩🇪' };
