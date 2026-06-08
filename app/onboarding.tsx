import { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, StatusBar, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, FONT, COUNTRIES } from '@/constants/theme';
import Button from '@/components/Button';
import { LOGO, FLAG_IMAGES } from '@/constants/images';
import { useApp } from '@/context/AppContext';

const { height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { markOnboardingSeen } = useApp();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleBtn = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start(() => {
      Animated.spring(scaleBtn, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }).start();
    });
  }, []);

  const handleStart = () => {
    markOnboardingSeen();
    router.replace('/(tabs)');
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#EEF1FF', '#F7F4FF', '#FFF9F0', C.bg]}
        locations={[0, 0.35, 0.65, 1]}
        style={s.gradient}
      />

      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        {/* Top decoration circles */}
        <View style={s.topDeco}>
          <View style={[s.decoCircle, s.decoCircle1]} />
          <View style={[s.decoCircle, s.decoCircle2]} />
          <View style={[s.decoCircle, s.decoCircle3]} />
        </View>

        <Animated.View style={[s.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Logo */}
          <Image source={LOGO} style={s.logo} resizeMode="contain" />

          {/* Headline */}
          <Text style={s.headline}>Du hast nicht die Lebensqualität, die du dir wünscht und willst raus aus Deutschland?</Text>
          <Text style={s.sub}>Dein persönlicher Begleiter für die Auswanderung nach Portugal, Spanien oder in die Schweiz.</Text>

          {/* Destination chips */}
          <View style={s.chips}>
            {COUNTRIES.map(c => (
              <View key={c.id} style={[s.chip, { borderColor: `${c.color}55`, backgroundColor: `${c.color}12` }]}>
                <Image source={FLAG_IMAGES[c.id]} style={s.chipFlag} />
                <Text style={[s.chipName, { color: c.color }]}>{c.name}</Text>
              </View>
            ))}
          </View>

          {/* Feature pills */}
          <View style={s.pills}>
            {['📋 Schritt-für-Schritt Roadmap', '🗺️ Visueller Fortschritt', '💬 Community'].map(f => (
              <View key={f} style={s.pill}>
                <Text style={s.pillTxt}>{f}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View style={[s.ctaWrap, { opacity: fadeAnim, transform: [{ scale: scaleBtn }] }]}>
          <Button label="Auswandern →" onPress={handleStart} fullWidth style={s.ctaBtn} />
          <Text style={s.ctaSub}>Kostenlos starten · Keine Registrierung</Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const CIRCLE_OPACITY = 0.18;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  gradient: { ...StyleSheet.absoluteFillObject },
  safe: { flex: 1, justifyContent: 'space-between' },
  topDeco: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.45, overflow: 'hidden' },
  decoCircle: { position: 'absolute', borderRadius: 999 },
  decoCircle1: { width: 320, height: 320, top: -120, left: -80, backgroundColor: C.primary, opacity: CIRCLE_OPACITY },
  decoCircle2: { width: 200, height: 200, top: -40, right: -40, backgroundColor: '#A78BFA', opacity: CIRCLE_OPACITY },
  decoCircle3: { width: 140, height: 140, top: 160, right: 40, backgroundColor: C.accent, opacity: 0.12 },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: height * 0.10, justifyContent: 'center' },
  logo: { width: 72, height: 72, marginBottom: 28 },
  headline: { color: C.text, fontSize: 34, fontFamily: FONT.black, letterSpacing: -1, lineHeight: 42, marginBottom: 18 },
  sub: { color: C.textSub, fontSize: 16, lineHeight: 24, marginBottom: 32 },
  chips: { flexDirection: 'row', gap: 10, marginBottom: 24, flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14, borderWidth: 1.5 },
  chipFlag: { width: 26, height: 26, borderRadius: 13 },
  chipName: { fontSize: 14, fontFamily: FONT.extrabold },
  pills: { gap: 8 },
  pill: { backgroundColor: C.card, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, borderWidth: 1, borderColor: C.border, alignSelf: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  pillTxt: { color: C.textSub, fontSize: 13, fontFamily: FONT.semibold },
  ctaWrap: { paddingHorizontal: 28, paddingBottom: 16, alignItems: 'center' },
  ctaBtn: { width: '100%', marginBottom: 14 },
  ctaSub: { color: C.textMuted, fontSize: 13 },
});
