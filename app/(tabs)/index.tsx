import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, COUNTRIES } from '@/constants/theme';
import { ROADMAP_DATA } from '@/constants/roadmapData';
import { LOGO, FLAG_IMAGES } from '@/constants/images';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

const MONTHS_SHORT = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

function daysUntil(dateStr: string): number {
  const [year, month] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, 1);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function HomeScreen() {
  const { selectedCountry, emigrationDate, isStepDone } = useApp();
  const { signOut, user } = useAuth();
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
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <LinearGradient colors={[`${selected.color}22`, `${selected.color}08`, C.bg]} style={s.hero}>
          <View style={s.heroHeader}>
            <Image source={LOGO} style={s.heroLogo} resizeMode="contain" />
            <Text style={s.title}>Auswando</Text>
            <TouchableOpacity onPress={signOut} style={s.signOutBtn}>
              <Text style={s.signOutTxt}>Abmelden</Text>
            </TouchableOpacity>
          </View>

          {/* Progress card */}
          <TouchableOpacity style={s.progressCard} onPress={() => router.push('/(tabs)/roadmap')}>
            <View style={s.progressCardHeader}>
              <Image source={FLAG_IMAGES[selectedCountry]} style={s.progressFlag} />
              <View style={{ flex: 1 }}>
                <Text style={s.progressCountry}>{selected.name}</Text>
                <Text style={s.progressSub}>{doneCount} von {freeSteps.length} Schritten erledigt</Text>
              </View>
              <Text style={[s.progressPct, { color: selected.color }]}>{Math.round(pct * 100)}%</Text>
            </View>
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${pct * 100}%` as any, backgroundColor: selected.color }]} />
            </View>
          </TouchableOpacity>

          {/* Countdown or CTA */}
          {days !== null ? (
            <View style={s.countdownRow}>
              <View style={s.countdownItem}>
                <Text style={[s.countdownNum, { color: selected.color }]}>{days}</Text>
                <Text style={s.countdownLabel}>Tage bis{'\n'}{MONTHS_SHORT[emMonth - 1]} {emYear}</Text>
              </View>
              <View style={s.countdownDivider} />
              <View style={s.countdownItem}>
                <Text style={[s.countdownNum, { color: selected.color }]}>{freeSteps.length - doneCount}</Text>
                <Text style={s.countdownLabel}>offene{'\n'}Schritte</Text>
              </View>
              <View style={s.countdownDivider} />
              <View style={s.countdownItem}>
                <Text style={[s.countdownNum, { color: selected.color }]}>{Math.round(pct * 100)}%</Text>
                <Text style={s.countdownLabel}>Fortschritt{'\n'}gesamt</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={[s.heroBtn, { borderColor: selected.color, backgroundColor: `${selected.color}15` }]} onPress={() => router.push('/(tabs)/roadmap')}>
              <Text style={[s.heroBtnTxt, { color: selected.color }]}>Zieldatum festlegen  →</Text>
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Next step */}
        {nextStep && (
          <TouchableOpacity style={s.nextStepCard} onPress={() => router.push('/(tabs)/roadmap')}>
            <View style={[s.nextStepDot, { backgroundColor: selected.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={s.nextStepLabel}>NÄCHSTER SCHRITT</Text>
              <Text style={s.nextStepTitle}>{nextStep.icon}  {nextStep.title}</Text>
            </View>
            <Text style={[s.nextStepArrow, { color: selected.color }]}>→</Text>
          </TouchableOpacity>
        )}

        {/* Country switcher */}
        <Text style={s.sectionTitle}>Zielland wechseln</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
          {COUNTRIES.map(c => {
            const cFreeSteps = ROADMAP_DATA[c.id].flatMap(p => p.steps).filter(s => s.free);
            const cDone = cFreeSteps.filter(s => isStepDone(c.id, s.title)).length;
            const isActive = c.id === selectedCountry;
            return (
              <TouchableOpacity key={c.id} style={[s.countryCard, isActive && { borderColor: c.color, borderWidth: 2 }]} onPress={() => router.push('/(tabs)/roadmap')}>
                <LinearGradient colors={[`${c.color}18`, `${c.color}06`]} style={s.countryInner}>
                  <Image source={FLAG_IMAGES[c.id]} style={s.flag} />
                  <Text style={s.countryName}>{c.name}</Text>
                  <Text style={s.countryTag}>{c.tagline}</Text>
                  <View style={[s.badge, { backgroundColor: `${c.color}18`, borderColor: `${c.color}44` }]}>
                    <Text style={[s.badgeTxt, { color: c.color }]}>
                      {cDone > 0 ? `${cDone}/${cFreeSteps.length} erledigt` : 'Roadmap →'}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Premium */}
        <View style={s.premium}>
          <View style={s.premBadge}><Text style={s.premBadgeTxt}>PREMIUM</Text></View>
          <Text style={s.premTitle}>Komplettpaket für 49 €</Text>
          <Text style={s.premSub}>Vollständige Roadmap · Videotutorials · Direkte Antragslinks · Community</Text>
          <TouchableOpacity style={s.premBtn} onPress={() => router.push('/(tabs)/roadmap')}>
            <Text style={s.premBtnTxt}>Mehr erfahren</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: 32 },
  hero: { padding: 24, paddingTop: 32, paddingBottom: 28 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, flex: 1 },
  signOutBtn: { marginLeft: 'auto', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: `${C.error}18`, borderWidth: 1, borderColor: `${C.error}44` },
  signOutTxt: { color: C.error, fontSize: 12, fontWeight: '600' },
  heroLogo: { width: 40, height: 40 },
  title: { color: C.text, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  progressCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  progressCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  progressFlag: { width: 44, height: 44, borderRadius: 22 },
  progressCountry: { color: C.text, fontSize: 17, fontWeight: '700' },
  progressSub: { color: C.textSub, fontSize: 12, marginTop: 2 },
  progressPct: { fontSize: 22, fontWeight: '800' },
  progressBg: { height: 6, backgroundColor: C.border, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  countdownRow: { flexDirection: 'row', backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  countdownItem: { flex: 1, alignItems: 'center' },
  countdownNum: { fontSize: 26, fontWeight: '800' },
  countdownLabel: { color: C.textSub, fontSize: 10, textAlign: 'center', marginTop: 2, lineHeight: 14 },
  countdownDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },
  heroBtn: { borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'flex-start', borderWidth: 1.5 },
  heroBtnTxt: { fontWeight: '700', fontSize: 14 },
  nextStepCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 20, marginTop: 4, marginBottom: 4, backgroundColor: C.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  nextStepDot: { width: 10, height: 10, borderRadius: 5 },
  nextStepLabel: { color: C.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginBottom: 4 },
  nextStepTitle: { color: C.text, fontSize: 14, fontWeight: '600' },
  nextStepArrow: { fontSize: 20, fontWeight: '700' },
  sectionTitle: { color: C.text, fontSize: 18, fontWeight: '700', marginHorizontal: 20, marginTop: 24, marginBottom: 14 },
  row: { paddingHorizontal: 20, gap: 12 },
  countryCard: { width: width * 0.56, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  countryInner: { padding: 18 },
  flag: { width: 44, height: 44, borderRadius: 22, marginBottom: 10 },
  countryName: { color: C.text, fontSize: 18, fontWeight: '700', marginBottom: 4 },
  countryTag: { color: C.textSub, fontSize: 12, lineHeight: 18, marginBottom: 14 },
  badge: { borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, alignSelf: 'flex-start' },
  badgeTxt: { fontSize: 11, fontWeight: '700' },
  premium: { margin: 20, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#B8E6CC', backgroundColor: '#F0FFF8', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  premBadge: { backgroundColor: '#D4F5E6', borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8, alignSelf: 'flex-start', marginBottom: 10 },
  premBadgeTxt: { color: C.success, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  premTitle: { color: C.text, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  premSub: { color: C.textSub, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  premBtn: { backgroundColor: C.success, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'flex-start' },
  premBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
