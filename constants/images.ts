import { ImageSourcePropType } from 'react-native';
import { CountryId } from './theme';

export const LOGO: ImageSourcePropType = require('../assets/images/logo.png');

export const KARTE_IMAGE: ImageSourcePropType = require('../assets/images/karte.png');

export const FLAG_IMAGES: Record<CountryId, ImageSourcePropType> = {
  pt: require('../assets/images/flag_pt.png'),
  es: require('../assets/images/flag_es.png'),
  ch: require('../assets/images/flag_ch.png'),
};

export type WandoEmotion = 'neutral' | 'freude' | 'begeistert' | 'traurig';

// Wando, der Begleit-Charakter — je nach Stimmung oder Zielland ein anderes Bild
export const WANDO_IMAGES: Record<WandoEmotion, ImageSourcePropType> = {
  neutral: require('../assets/images/wando_neutral.png'),
  freude: require('../assets/images/wando_freude.png'),
  begeistert: require('../assets/images/wando_begeistert.png'),
  traurig: require('../assets/images/wando_traurig.png'),
};

export const WANDO_FLAG_IMAGES: Record<CountryId, ImageSourcePropType> = {
  pt: require('../assets/images/wando_pt.png'),
  es: require('../assets/images/wando_es.png'),
  ch: require('../assets/images/wando_ch.png'),
};
