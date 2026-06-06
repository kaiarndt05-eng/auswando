import { ImageSourcePropType } from 'react-native';
import { CountryId } from './theme';

export const LOGO: ImageSourcePropType = require('../assets/images/logo.png');

export const FLAG_IMAGES: Record<CountryId, ImageSourcePropType> = {
  pt: require('../assets/images/flag_pt.png'),
  es: require('../assets/images/flag_es.png'),
  ch: require('../assets/images/flag_ch.png'),
};
