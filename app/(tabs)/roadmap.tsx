import { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { C, COUNTRIES, CountryId } from '@/constants/theme';
import { ROADMAP_DATA } from '@/constants/roadmapData';
import { FLAG_IMAGES } from '@/constants/images';
import { useApp } from '@/context/AppContext';

const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

function getMonthsUntil(dateStr: string): number {
  const [year, month] = dateStr.split('-').map(Number);
  const now = new Date();
  return (year - now.getFullYear()) * 12 + (month - 1 - now.getMonth());
}

function getTrackStatus(monthsLeft: number, donePct: number) {
  const expectedDone = Math.max(0, 1 - monthsLeft / 12);
  if (donePct >= expectedDone) return { label: 'Im Plan ✓', color: C.success };
  if (donePct >= expectedDone - 0.25) return { label: 'Leicht hinter Plan', color: C.accent };
  return { label: 'Hinter dem Plan', color: C.error };
}

export default function RoadmapScreen() {
  const { selectedCountry, setCountry, isStepDone, toggleStep, emigrationDate, setEmigrationDate } = useApp();
  const country = selectedCountry;
  const [showPremium, setShowPremium] = useState(false);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const celebAnim = useRef(new Animated.Value(0)).current;
  const celebOpacity = useRef(new Animated.Value(0)).current;

  // Date picker state — default: 12 months from now
  const initDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 12);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  };
  const [pickerDate, setPickerDate] = useState(initDate);

  const phases = ROADMAP_DATA[country];
  const selected = COUNTRIES.find(c => c.id === country)!;

  const allSteps = phases.flatMap(p => p.steps);
  const freeSteps = allSteps.filter(s => s.free);
  const doneCount = freeSteps.filter(s => isStepDone(country, s.title)).length;
  const donePct = freeSteps.length > 0 ? doneCount / freeSteps.length : 0;

  const monthsLeft = emigrationDate ? getMonthsUntil(emigrationDate) : null;
  const trackStatus = emigrationDate && monthsLeft !== null ? getTrackStatus(monthsLeft, donePct) : null;

  const triggerCelebration = (phaseTitle: string) => {
    setCelebration(phaseTitle.split(' · ')[0]);
    celebAnim.setValue(0);
    celebOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(celebAnim, { toValue: 1, useNativeDriver: true }),
      Animated.timing(celebOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(celebAnim, { toValue: 0.8, duration: 300, useNativeDriver: true }),
        Animated.timing(celebOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setCelebration(null));
    }, 2200);
  };

  const handleStepTap = async (phaseIdx: number, stepTitle: string, isFree: boolean) => {
    if (!isFree) {
      setShowPremium(true);
      return;
    }
    const wasAlreadyDone = isStepDone(country, stepTitle);
    const willMarkDone = !wasAlreadyDone;

    toggleStep(country, stepTitle);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (willMarkDone) {
      const phase = phases[phaseIdx];
      const otherFreeStepsDone = phase.steps
        .filter(s => s.free && s.title !== stepTitle)
        .every(s => isStepDone(country, s.title));
      if (otherFreeStepsDone) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        triggerCelebration(phase.title);
      }
    }
  };

  const adjustPickerMonth = (delta: number) => {
    setPickerDate(prev => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m > 12) { m = 1; y++; }
      if (m < 1) { m = 12; y--; }
      const now = new Date();
      if (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth())) return prev;
      return { year: y, month: m };
    });
  };

  const saveDate = () => {
    setEmigrationDate(`${pickerDate.year}-${String(pickerDate.month).padStart(2, '0')}`);
    setShowDatePicker(false);
  };

  const formatDate = (dateStr: string) => {
    const [y, m] = dateStr.split('-').map(Number);
    return `${MONTHS[m - 1]} ${y}`;
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Country selector */}
      <View style={s.tabs}>
        {COUNTRIES.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[s.tab, country === c.id && { borderBottomColor: selected.color, borderBottomWidth: 2 }]}
            onPress={() => setCountry(c.id)}
          >
            <Image source={FLAG_IMAGES[c.id]} style={s.tabFlag} />
            <Text style={[s.tabName, { color: country === c.id ? C.text : C.textSub }]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Header */}
        <LinearGradient colors={[`${selected.color}20`, C.bg]} style={s.header}>
          <Image source={FLAG_IMAGES[country]} style={s.headerFlag} />
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>{selected.name} Roadmap</Text>
            <Text style={s.headerSub}>{doneCount} von {freeSteps.length} kostenlosen Schritten erledigt</Text>
            {/* Progress bar */}
            <View style={s.progressBg}>
              <View style={[s.progressFill, { width: `${donePct * 100}%` as any, backgroundColor: selected.color }]} />
            </View>
          </View>
        </LinearGradient>

        {/* Emigration goal row */}
        <View style={s.goalRow}>
          <TouchableOpacity style={s.goalBtn} onPress={() => setShowDatePicker(true)}>
            <Text style={s.goalIcon}>📅</Text>
            <View>
              <Text style={s.goalLabel}>Auswanderungsziel</Text>
              <Text style={[s.goalDate, { color: emigrationDate ? selected.color : C.textMuted }]}>
                {emigrationDate ? formatDate(emigrationDate) : 'Zieldatum festlegen →'}
              </Text>
            </View>
          </TouchableOpacity>
          {trackStatus && (
            <View style={[s.trackBadge, { borderColor: `${trackStatus.color}44`, backgroundColor: `${trackStatus.color}15` }]}>
              <Text style={[s.trackLabel, { color: trackStatus.color }]}>{trackStatus.label}</Text>
              {monthsLeft !== null && (
                <Text style={[s.trackSub, { color: trackStatus.color }]}>
                  noch {monthsLeft} Mon.
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Phases */}
        {phases.map((phase, pi) => (
          <View key={pi} style={s.phase}>
            <Text style={s.phaseTitle}>{phase.title}</Text>
            {phase.steps.map((step, si) => {
              const done = step.free && isStepDone(country, step.title);
              return (
                <TouchableOpacity key={si} style={s.stepRow} activeOpacity={0.7} onPress={() => handleStepTap(pi, step.title, step.free)}>
                  <View style={[s.stepLine, { backgroundColor: si < phase.steps.length - 1 ? C.border : 'transparent' }]} />
                  <View style={[s.stepDot, done && { backgroundColor: selected.color, borderColor: selected.color }]}>
                    {done
                      ? <Text style={s.checkMark}>✓</Text>
                      : !step.free
                        ? <Text style={s.lockIcon}>🔒</Text>
                        : null
                    }
                  </View>
                  <View style={[s.stepCard, !step.free && s.stepLocked, done && { borderColor: `${selected.color}44` }]}>
                    <Text style={s.stepIcon}>{step.icon}</Text>
                    <View style={s.stepContent}>
                      <Text style={[s.stepTitle, !step.free && { color: C.textMuted }, done && { color: selected.color }]}>
                        {step.title}
                      </Text>
                      {step.free ? (
                        <Text style={s.stepDesc}>{step.desc}</Text>
                      ) : (
                        <Text style={s.premiumHint}>🔒 Premium freischalten</Text>
                      )}
                    </View>
                    {done && <Text style={[s.doneBadge, { color: selected.color }]}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Upsell */}
        <TouchableOpacity onPress={() => setShowPremium(true)}>
          <LinearGradient colors={['#E8FFF6', '#F4FFFB']} style={s.upsell}>
            <Text style={s.upsellTitle}>🔓 Alles freischalten</Text>
            <Text style={s.upsellSub}>Vollständige Roadmap, Videotutorials & direkte Antragslinks</Text>
            <View style={s.upsellPrice}>
              <Text style={s.upsellPriceMain}>49 €</Text>
              <Text style={s.upsellPriceSub}>einmalig · lebenslanger Zugriff</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Celebration overlay */}
      <Modal visible={!!celebration} transparent animationType="none" statusBarTranslucent>
        <Animated.View style={[s.celebContainer, { opacity: celebOpacity }]}>
          <Animated.View style={[s.celebCard, { transform: [{ scale: celebAnim }] }]}>
            <Text style={s.celebEmoji}>🎉</Text>
            <Text style={s.celebTitle}>{celebration} abgeschlossen!</Text>
            <Text style={s.celebSub}>Großartig – weiter so!</Text>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Premium modal */}
      <Modal visible={showPremium} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>🌟 Premium freischalten</Text>
            <Text style={s.modalSub}>Einmaliger Kauf für 49 € – lebenslanger Zugriff</Text>
            {['Vollständige Roadmap für alle Länder', 'Videotutorials zu jedem Schritt', 'Direkte Links zu Anträgen & Behörden', 'Community-Vollzugriff', 'E-Mail Support'].map(f => (
              <View key={f} style={s.modalFeature}>
                <Text style={{ color: C.success }}>✓</Text>
                <Text style={s.modalFeatureTxt}>{f}</Text>
              </View>
            ))}
            <TouchableOpacity style={[s.modalBtn, { backgroundColor: C.success }]}>
              <Text style={s.modalBtnTxt}>Jetzt kaufen – 49 €</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.modalClose} onPress={() => setShowPremium(false)}>
              <Text style={{ color: C.textSub }}>Schließen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date picker modal */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>📅 Auswanderungsziel</Text>
            <Text style={s.modalSub}>Wann möchtest du auswandern?</Text>
            <View style={s.datePicker}>
              <TouchableOpacity style={s.dateArrow} onPress={() => adjustPickerMonth(-1)}>
                <Text style={s.dateArrowTxt}>‹</Text>
              </TouchableOpacity>
              <View style={s.dateDisplay}>
                <Text style={s.dateMonth}>{MONTHS[pickerDate.month - 1]}</Text>
                <Text style={s.dateYear}>{pickerDate.year}</Text>
              </View>
              <TouchableOpacity style={s.dateArrow} onPress={() => adjustPickerMonth(1)}>
                <Text style={s.dateArrowTxt}>›</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[s.modalBtn, { backgroundColor: selected.color }]} onPress={saveDate}>
              <Text style={s.modalBtnTxt}>Ziel speichern</Text>
            </TouchableOpacity>
            {emigrationDate && (
              <TouchableOpacity style={s.modalClose} onPress={() => { setEmigrationDate(null); setShowDatePicker(false); }}>
                <Text style={{ color: C.error, fontSize: 13 }}>Zieldatum entfernen</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.modalClose} onPress={() => setShowDatePicker(false)}>
              <Text style={{ color: C.textSub }}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  tabs: { flexDirection: 'row', backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabFlag: { width: 26, height: 26, borderRadius: 13, marginBottom: 2 },
  tabName: { fontSize: 11, fontWeight: '600' },
  scroll: { paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  headerFlag: { width: 52, height: 52, borderRadius: 26 },
  headerTitle: { color: C.text, fontSize: 20, fontWeight: '700' },
  headerSub: { color: C.textSub, fontSize: 12, marginTop: 2, marginBottom: 8 },
  progressBg: { height: 5, backgroundColor: C.border, borderRadius: 3, marginTop: 4 },
  progressFill: { height: 5, borderRadius: 3 },
  goalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  goalBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  goalIcon: { fontSize: 22 },
  goalLabel: { color: C.textSub, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
  goalDate: { fontSize: 14, fontWeight: '700', marginTop: 1 },
  trackBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, alignItems: 'center' },
  trackLabel: { fontSize: 11, fontWeight: '700' },
  trackSub: { fontSize: 10, marginTop: 1 },
  phase: { paddingHorizontal: 20, paddingTop: 20 },
  phaseTitle: { color: C.primary, fontSize: 12, fontWeight: '700', letterSpacing: 0.5, marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  stepLine: { position: 'absolute', left: 11, top: 28, width: 2, height: '100%' },
  stepDot: { width: 24, height: 24, borderRadius: 12, marginRight: 12, borderWidth: 2, borderColor: C.border, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', marginTop: 12, zIndex: 1 },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: '800' },
  lockIcon: { fontSize: 10 },
  stepCard: { flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  stepLocked: { opacity: 0.6 },
  stepIcon: { fontSize: 22, marginTop: 1 },
  stepContent: { flex: 1 },
  stepTitle: { color: C.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  stepDesc: { color: C.textSub, fontSize: 12, lineHeight: 18 },
  premiumHint: { color: C.accent, fontSize: 12, fontWeight: '600' },
  doneBadge: { fontSize: 18, fontWeight: '700', alignSelf: 'center' },
  upsell: { margin: 20, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#B8E6CC', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  upsellTitle: { color: C.text, fontSize: 20, fontWeight: '700', marginBottom: 8 },
  upsellSub: { color: C.textSub, fontSize: 13, lineHeight: 20, marginBottom: 16 },
  upsellPrice: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  upsellPriceMain: { color: C.success, fontSize: 28, fontWeight: '800' },
  upsellPriceSub: { color: C.textSub, fontSize: 12 },
  celebContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  celebCard: { backgroundColor: C.surface, borderRadius: 24, padding: 36, alignItems: 'center', borderWidth: 1, borderColor: C.border, marginHorizontal: 40 },
  celebEmoji: { fontSize: 64, marginBottom: 16 },
  celebTitle: { color: C.text, fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  celebSub: { color: C.textSub, fontSize: 15, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modal: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, borderTopWidth: 1, borderColor: C.border },
  modalTitle: { color: C.text, fontSize: 22, fontWeight: '700', marginBottom: 6 },
  modalSub: { color: C.textSub, fontSize: 14, marginBottom: 20 },
  modalFeature: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  modalFeatureTxt: { color: C.text, fontSize: 14 },
  modalBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 20, marginBottom: 12 },
  modalBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  modalClose: { alignItems: 'center', paddingVertical: 8 },
  datePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, paddingVertical: 12 },
  dateArrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border },
  dateArrowTxt: { color: C.text, fontSize: 28, fontWeight: '300', lineHeight: 32 },
  dateDisplay: { alignItems: 'center', minWidth: 120 },
  dateMonth: { color: C.text, fontSize: 22, fontWeight: '700' },
  dateYear: { color: C.textSub, fontSize: 16, marginTop: 2 },
});
