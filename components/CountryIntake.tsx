import { useEffect, useRef } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, FONT, COUNTRIES, CountryId } from '@/constants/theme';
import { FLAG_IMAGES, WANDO_IMAGES } from '@/constants/images';
import { useApp } from '@/context/AppContext';

const SHADOW_MD = {
  shadowColor: '#1A2A5E',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.09,
  shadowRadius: 10,
  elevation: 4,
} as const;

/**
 * First-run, Duolingo-style picker for the user's single target country.
 * Shown on the home tab until `countryChosen` is set — afterwards the
 * dashboard renders instead and switching moves into a low-key menu.
 */
export default function CountryIntake() {
  const { setCountry } = useApp();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  const choose = (id: CountryId) => setCountry(id);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }}>

          {/* Wando intro */}
          <View style={s.wandoRow}>
            <Image source={WANDO_IMAGES.begeistert} style={s.wando} resizeMode="contain" />
            <View style={s.bubble}>
              <Text style={s.bubbleName}>Wando</Text>
              <Text style={s.bubbleText}>
                Schön, dass du da bist! Bevor es losgeht: In welches Land möchtest du auswandern? 🌍
              </Text>
            </View>
          </View>

          {/* Country options */}
          <View style={s.cards}>
            {COUNTRIES.map(c => (
              <TouchableOpacity key={c.id} style={s.card} onPress={() => choose(c.id)} activeOpacity={0.88}>
                <LinearGradient colors={[`${c.color}1E`, `${c.color}08`]} style={s.cardInner}>
                  <Image source={FLAG_IMAGES[c.id]} style={s.flag} />
                  <View style={s.cardMeta}>
                    <Text style={s.cardName}>{c.name}</Text>
                    <Text style={s.cardTagline}>{c.tagline}</Text>
                  </View>
                  <Text style={[s.arrow, { color: c.color }]}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Test hint — referenced, not required */}
          <View style={s.hint}>
            <Text style={s.hintTxt}>
              🤔 Noch unentschlossen? Im Tab „Land-Test“ wartet ein kurzer Persönlichkeitstest mit einer Empfehlung — aber keine Sorge, das ist kein Muss. Du kannst auch einfach direkt loslegen.
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/test')} activeOpacity={0.7}>
              <Text style={s.hintLink}>Zum Land-Test →</Text>
            </TouchableOpacity>
          </View>

          <Text style={s.footnote}>Du kannst dein Zielland später jederzeit über das Menü ändern.</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { padding: 24, paddingTop: 12, paddingBottom: 48 },

  // Wando bubble
  wandoRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: 24 },
  wando: { width: 84, height: 84, marginBottom: -6 },
  bubble: {
    flex: 1, backgroundColor: C.card, borderRadius: 20, borderTopLeftRadius: 6,
    padding: 18, borderWidth: 1, borderColor: C.border, ...SHADOW_MD,
  },
  bubbleName: { color: C.primary, fontFamily: FONT.extrabold, fontSize: 13, marginBottom: 6, letterSpacing: 0.3 },
  bubbleText: { color: C.text, fontSize: 15, lineHeight: 22, fontFamily: FONT.semibold },

  // Country cards
  cards: { gap: 12, marginBottom: 22 },
  card: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: C.border, ...SHADOW_MD },
  cardInner: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  flag: { width: 50, height: 50, borderRadius: 25 },
  cardMeta: { flex: 1 },
  cardName: { color: C.text, fontSize: 18, fontFamily: FONT.extrabold, letterSpacing: -0.3, marginBottom: 3 },
  cardTagline: { color: C.textSub, fontSize: 12.5, lineHeight: 18 },
  arrow: { fontSize: 22, fontFamily: FONT.extrabold },

  // Test hint
  hint: {
    backgroundColor: C.card, borderRadius: 16, padding: 16, gap: 10,
    borderWidth: 1, borderColor: C.border,
  },
  hintTxt: { color: C.textSub, fontSize: 13, lineHeight: 19 },
  hintLink: { color: C.primary, fontSize: 14, fontFamily: FONT.bold },

  footnote: { color: C.textMuted, fontSize: 12, textAlign: 'center', marginTop: 18 },
});
