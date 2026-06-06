export const C = {
  bg: '#F2F4F9',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#F7F9FC',
  border: '#E4E8F1',
  primary: '#5B7BF0',
  primaryBg: 'rgba(91,123,240,0.10)',
  accent: '#F5A623',
  accentBg: 'rgba(245,166,35,0.10)',
  success: '#2BC87A',
  successBg: 'rgba(43,200,122,0.10)',
  error: '#FF453A',
  text: '#1A1D2E',
  textSub: '#6B7A99',
  textMuted: '#B0BAD0',
  tabBg: '#FFFFFF',
} as const;

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
