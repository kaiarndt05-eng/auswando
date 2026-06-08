import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, FONT, COUNTRIES } from '@/constants/theme';
import Button from '@/components/Button';
import CountryIntake from '@/components/CountryIntake';
import { ROADMAP_DATA } from '@/constants/roadmapData';
import { LOGO, FLAG_IMAGES } from '@/constants/images';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useWando } from '@/context/WandoContext';
import { WANDO_MESSAGES } from '@/constants/wandoMessages';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function daysUntil(dateStr: string): number {
  const [year, month] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, 1);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function HomeScreen() {
  const { selectedCountry, countryChosen, setCountry, emigrationDate, isStepDone } = useApp();
  const { signOut } = useAuth();
  const wando = useWando();
  const [showCountryMenu, setShowCountryMenu] = useState(false);

  useEffect(() => {
    wando.sayOnce(WANDO_MESSAGES.intro);
    wando.sayOnce(WANDO_MESSAGES.home);
  }, []);

  // First run: let the user pick their one target country, Duolingo-style — before
  // showing them a dashboard for a country they never actively chose.
  if (!countryChosen) return <CountryIntake />;

  const selected = COUNTRIES.find(c => c.id === selectedCountry)!;
  const phases = ROADMAP_DATA[selectedCountry];
  const freeSteps = phases.flatMap(p => p.steps).filter(s => s.free);
  const doneCount = freeSteps.filter(s => isStepDone(selectedCountry, s.title)).length;
  const pct = freeSteps.length > 0 ? doneCount / freeSteps.length : 0;
  const nextStep = freeSteps.find(s => !isStepDone(selectedCountry, s.title));
  const days = emigrationDate ? daysUntil(emigrationDate) : null;
  const [emYear, emMonth] = emigrationDate ? emigrationDate.split('-').map(Number) : [0, 0];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        {/* ── App Bar ── */}
        <View style={s.appBar}>
          <Image source={LOGO} style={s.barLogo} resizeMode="contain" />
          <Text style={s.barTitle}>Auswando</Text>
          <TouchableOpacity onPress={() => setShowCountryMenu(true)} style={s.flagMenuChip} activeOpacity={0.8}>
            <Image source={FLAG_IMAGES[selectedCountry]} style={s.flagMenuFlag} />
          </TouchableOpacity>
          {__DEV__ && (
            <TouchableOpacity onPress={() => router.push('/dev-tools' as any)} style={s.devChip} activeOpacity={0.8}>
              <Text style={s.devChipTxt}>🛠</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={signOut} style={s.signOutChip} activeOpacity={0.8}>
            <Text style={s.signOutTxt}>Abmelden</Text>
          </TouchableOpacity>
        </View>

        {/* ── Hero gradient ── */}
        <LinearGradient
          colors={[`${selected.color}26`, `${selected.color}0A`, C.bg]}
          style={s.hero}
        >
          {/* Progress card */}
          <TouchableOpacity style={s.progressCard} onPress={() => router.push('/(tabs)/roadmap')} activeOpacity={0.88}>
            <View style={s.progressTop}>
              <Image source={FLAG_IMAGES[selectedCountry]} style={s.progressFlag} />
              <View style={s.progressMeta}>
                <Text style={s.progressCountry}>{selected.name}</Text>
                <Text style={s.progressSteps}>{doneCount} von {freeSteps.length} Schritten erledigt</Text>
              </View>
              <View style={[s.pctBadge, { backgroundColor: `${selected.color}18` }]}>
                <Text style={[s.pctTxt, { color: selected.color }]}>{Math.round(pct * 100)}%</Text>
              </View>
            </View>
            <View style={s.trackBg}>
              <LinearGradient
                colors={[selected.color, `${selected.color}88`]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.trackFill, { width: `${Math.max(pct * 100, 3)}%` as any }]}
              />
            </View>
          </TouchableOpacity>

          {/* Stats row or CTA */}
          {days !== null ? (
            <View style={s.statsCard}>
              <View style={s.statItem}>
                <Text style={[s.statNum, { color: selected.color }]}>{days}</Text>
                <Text style={s.statLabel}>{'Tage bis\n'}{MONTHS_SHORT[emMonth - 1]} {emYear}</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={[s.statNum, { color: selected.color }]}>{freeSteps.length - doneCount}</Text>
                <Text style={s.statLabel}>{'offene\nSchritte'}</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={[s.statNum, { color: selected.color }]}>{Math.round(pct * 100)}%</Text>
                <Text style={s.statLabel}>{'Fortschritt\ngesamt'}</Text>
              </View>
            </View>
          ) : (
            <Button
              label="Zieldatum festlegen →"
              color={selected.color}
              onPress={() => router.push('/(tabs)/roadmap')}
              style={s.dateCtaBtn}
            />
          )}
        </LinearGradient>

        {/* ── Next step ── */}
        {nextStep && (
          <TouchableOpacity style={s.nextStep} onPress={() => router.push('/(tabs)/roadmap')} activeOpacity={0.87}>
            <View style={[s.nextDot, { backgroundColor: selected.color }]} />
            <View style={s.nextContent}>
              <Text style={s.nextLabel}>NÄCHSTER SCHRITT</Text>
              <Text style={s.nextTitle}>{nextStep.icon}  {nextStep.title}</Text>
            </View>
            <Text style={[s.nextArrow, { color: selected.color }]}>→</Text>
          </TouchableOpacity>
        )}

        {/* ── Premium card ── */}
        <View style={s.premiumWrap}>
          <LinearGradient colors={['#0E1C60', '#1A348A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.premiumCard}>
            <View style={s.premiumTopRow}>
              <View style={s.premiumBadge}>
                <Text style={s.premiumBadgeTxt}>✦  PREMIUM</Text>
              </View>
              <Text style={s.premiumPrice}>49 €</Text>
            </View>
            <Text style={s.premiumTitle}>Komplettpaket</Text>
            <Text style={s.premiumSub}>Vollständige Roadmap · Videotutorials · Direkte Antragslinks · Community</Text>
            <Button
              label="Vollzugriff freischalten →"
              color="#FFFFFF"
              textColor={C.primary}
              onPress={() => router.push('/(tabs)/roadmap')}
              style={s.premiumCta}
            />
          </LinearGradient>
        </View>

      </ScrollView>

      {/* Switch-country menu — for the rare case someone changes their mind */}
      <Modal visible={showCountryMenu} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.menuModal}>
            <Text style={s.menuTitle}>🌍 Zielland wechseln</Text>
            <Text style={s.menuSub}>Deine Fortschritte bleiben für jedes Land erhalten — du kannst jederzeit zurückwechseln.</Text>
            {COUNTRIES.map(c => {
              const active = c.id === selectedCountry;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[s.menuOption, active && { borderColor: c.color, backgroundColor: `${c.color}0C` }]}
                  onPress={() => { setCountry(c.id); setShowCountryMenu(false); }}
                  activeOpacity={0.85}
                >
                  <Image source={FLAG_IMAGES[c.id]} style={s.menuFlag} />
                  <Text style={s.menuName}>{c.name}</Text>
                  {active && <Text style={[s.menuCheck, { color: c.color }]}>✓</Text>}
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity style={s.menuClose} onPress={() => setShowCountryMenu(false)}>
              <Text style={s.menuCloseTxt}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const SHADOW_MD = {
  shadowColor: '#1A2A5E',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.09,
  shadowRadius: 10,
  elevation: 4,
} as const;

const SHADOW_LG = {
  shadowColor: '#1A2A5E',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.14,
  shadowRadius: 20,
  elevation: 8,
} as const;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { paddingBottom: 40 },

  // App bar
  appBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16,
  },
  barLogo: { width: 38, height: 38 },
  barTitle: { flex: 1, color: C.text, fontSize: 28, fontFamily: FONT.black, letterSpacing: -0.6 },
  signOutChip: {
    backgroundColor: C.errorBg, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: `${C.error}30`,
  },
  signOutTxt: { color: C.error, fontSize: 12, fontFamily: FONT.bold },
  devChip: {
    backgroundColor: C.primaryBg, borderRadius: 9, paddingHorizontal: 11, paddingVertical: 7,
    borderWidth: 1, borderColor: `${C.primary}30`,
  },
  devChipTxt: { fontSize: 14 },
  flagMenuChip: {
    width: 34, height: 34, borderRadius: 17, overflow: 'hidden',
    borderWidth: 1.5, borderColor: C.border,
  },
  flagMenuFlag: { width: '100%', height: '100%' },

  // Hero
  hero: { paddingHorizontal: 20, paddingBottom: 20 },

  // Progress card
  progressCard: {
    backgroundColor: C.card, borderRadius: 20, padding: 20, marginBottom: 12,
    borderWidth: 1, borderColor: C.border, ...SHADOW_MD,
  },
  progressTop: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  progressFlag: { width: 48, height: 48, borderRadius: 24 },
  progressMeta: { flex: 1 },
  progressCountry: { color: C.text, fontSize: 21, fontFamily: FONT.extrabold, letterSpacing: -0.3, marginBottom: 3 },
  progressSteps: { color: C.textSub, fontSize: 13 },
  pctBadge: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  pctTxt: { fontSize: 21, fontFamily: FONT.extrabold, letterSpacing: -0.4 },
  trackBg: { height: 8, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden' },
  trackFill: { height: 8, borderRadius: 4 },

  // Stats card
  statsCard: {
    backgroundColor: C.card, borderRadius: 16, flexDirection: 'row',
    paddingVertical: 16, borderWidth: 1, borderColor: C.border, ...SHADOW_MD,
  },
  statItem: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  statNum: { fontSize: 30, fontFamily: FONT.black, letterSpacing: -0.8, lineHeight: 36 },
  statLabel: { color: C.textSub, fontSize: 10, fontFamily: FONT.semibold, textAlign: 'center', marginTop: 4, lineHeight: 15, letterSpacing: 0.2 },
  statDivider: { width: 1, backgroundColor: C.border, marginVertical: 6 },

  // Date CTA
  dateCtaBtn: { alignSelf: 'flex-start' },

  // Next step
  nextStep: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 20, marginBottom: 8, marginTop: 4,
    backgroundColor: C.card, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border, ...SHADOW_MD,
  },
  nextDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  nextContent: { flex: 1 },
  nextLabel: { color: C.textMuted, fontSize: 10, fontFamily: FONT.bold, letterSpacing: 1.2, marginBottom: 5 },
  nextTitle: { color: C.text, fontSize: 15, fontFamily: FONT.semibold },
  nextArrow: { fontSize: 22, fontFamily: FONT.extrabold },

  // Premium
  premiumWrap: { marginHorizontal: 20, marginTop: 10, borderRadius: 20, overflow: 'hidden', ...SHADOW_LG },
  premiumCard: { padding: 24 },
  premiumTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  premiumBadge: {
    backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  premiumBadgeTxt: { color: '#FFFFFF', fontSize: 11, fontFamily: FONT.extrabold, letterSpacing: 1.2 },
  premiumPrice: { color: '#FFFFFF', fontSize: 34, fontFamily: FONT.black, letterSpacing: -1 },
  premiumTitle: { color: '#FFFFFF', fontSize: 24, fontFamily: FONT.black, letterSpacing: -0.4, marginBottom: 8 },
  premiumSub: { color: 'rgba(255,255,255,0.68)', fontSize: 13, lineHeight: 20, marginBottom: 20 },
  premiumCta: { alignSelf: 'flex-start' },

  // Switch-country menu
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  menuModal: {
    backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, borderTopWidth: 1, borderColor: C.border,
  },
  menuTitle: { color: C.text, fontSize: 22, fontFamily: FONT.black, marginBottom: 6, letterSpacing: -0.3 },
  menuSub: { color: C.textSub, fontSize: 14, marginBottom: 20, lineHeight: 21 },
  menuOption: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: C.border,
  },
  menuFlag: { width: 38, height: 38, borderRadius: 19 },
  menuName: { flex: 1, color: C.text, fontSize: 16, fontFamily: FONT.bold },
  menuCheck: { fontSize: 18, fontFamily: FONT.extrabold },
  menuClose: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  menuCloseTxt: { color: C.textSub, fontSize: 14, fontFamily: FONT.semibold },
});
