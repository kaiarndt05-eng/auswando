import { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { C, FONT, COUNTRIES, CountryId } from '@/constants/theme';
import Button from '@/components/Button';
import { ROADMAP_DATA } from '@/constants/roadmapData';
import { FLAG_IMAGES } from '@/constants/images';
import { useApp } from '@/context/AppContext';
import RoadmapIntake from '@/components/RoadmapIntake';
import { useWando } from '@/context/WandoContext';
import { WANDO_MESSAGES } from '@/constants/wandoMessages';

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

const SHADOW_SM = {
  shadowColor: '#1A2A5E',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
} as const;

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

export default function RoadmapScreen() {
  const { selectedCountry, setCountry, isStepDone, toggleStep, emigrationDate, setEmigrationDate, isPremium, roadmapProfileDone, saveRoadmapProfile } = useApp();
  const wando = useWando();
  const country = selectedCountry;
  const [showPremium, setShowPremium] = useState(false);
  const [celebration, setCelebration] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const celebAnim = useRef(new Animated.Value(0)).current;
  const celebOpacity = useRef(new Animated.Value(0)).current;

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

  useEffect(() => {
    if (roadmapProfileDone) wando.sayOnce(WANDO_MESSAGES.roadmap);
  }, [roadmapProfileDone]);

  useEffect(() => {
    if (doneCount === 1) wando.sayOnce(WANDO_MESSAGES.firstStepDone);
  }, [doneCount]);

  if (!roadmapProfileDone) {
    return <RoadmapIntake onDone={saveRoadmapProfile} />;
  }

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
    if (!isFree && !isPremium) { setShowPremium(true); return; }
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

      {/* Country tabs */}
      <View style={s.tabs}>
        {COUNTRIES.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[s.tab, country === c.id && { borderBottomColor: selected.color, borderBottomWidth: 2.5 }]}
            onPress={() => setCountry(c.id)}
            activeOpacity={0.8}
          >
            <Image source={FLAG_IMAGES[c.id]} style={s.tabFlag} />
            <Text style={[s.tabName, { color: country === c.id ? C.text : C.textMuted }]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={[`${selected.color}22`, `${selected.color}08`, C.bg]} style={s.header}>
          <Image source={FLAG_IMAGES[country]} style={s.headerFlag} />
          <View style={{ flex: 1 }}>
            <Text style={s.headerTitle}>{selected.name} Roadmap</Text>
            <Text style={s.headerSub}>{doneCount} von {freeSteps.length} kostenlosen Schritten erledigt</Text>
            <View style={s.headerTrack}>
              <LinearGradient
                colors={[selected.color, `${selected.color}88`]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[s.headerFill, { width: `${Math.max(donePct * 100, 2)}%` as any }]}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Emigration goal */}
        <View style={s.goalRow}>
          <TouchableOpacity style={s.goalBtn} onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
            <Text style={s.goalIcon}>📅</Text>
            <View>
              <Text style={s.goalLabel}>AUSWANDERUNGSZIEL</Text>
              <Text style={[s.goalDate, { color: emigrationDate ? selected.color : C.textMuted }]}>
                {emigrationDate ? formatDate(emigrationDate) : 'Zieldatum festlegen →'}
              </Text>
            </View>
          </TouchableOpacity>
          {trackStatus && (
            <View style={[s.trackBadge, { borderColor: `${trackStatus.color}44`, backgroundColor: `${trackStatus.color}14` }]}>
              <Text style={[s.trackLabel, { color: trackStatus.color }]}>{trackStatus.label}</Text>
              {monthsLeft !== null && (
                <Text style={[s.trackSub, { color: trackStatus.color }]}>noch {monthsLeft} Mon.</Text>
              )}
            </View>
          )}
        </View>

        {/* Phases */}
        {phases.map((phase, pi) => (
          <View key={pi} style={s.phase}>
            {/* Phase header */}
            <View style={s.phaseHeader}>
              <View style={[s.phaseNumBadge, { backgroundColor: `${selected.color}18`, borderColor: `${selected.color}44` }]}>
                <Text style={[s.phaseNum, { color: selected.color }]}>{pi + 1}</Text>
              </View>
              <Text style={s.phaseTitle}>{phase.title}</Text>
            </View>

            {/* Steps */}
            {phase.steps.map((step, si) => {
              const unlocked = step.free || isPremium;
              const done = unlocked && isStepDone(country, step.title);
              return (
                <TouchableOpacity
                  key={si}
                  style={s.stepRow}
                  activeOpacity={0.8}
                  onPress={() => handleStepTap(pi, step.title, step.free)}
                >
                  {/* Timeline */}
                  <View style={s.timelineCol}>
                    <View style={[
                      s.stepDot,
                      done && { backgroundColor: selected.color, borderColor: selected.color },
                      !unlocked && !done && { borderColor: C.textMuted },
                    ]}>
                      {done
                        ? <Text style={s.checkMark}>✓</Text>
                        : !unlocked
                          ? <Text style={s.lockMark}>🔒</Text>
                          : null
                      }
                    </View>
                    {si < phase.steps.length - 1 && (
                      <View style={[s.stepLine, done && { backgroundColor: `${selected.color}60` }]} />
                    )}
                  </View>

                  {/* Card */}
                  <View style={[
                    s.stepCard,
                    !unlocked && s.stepLocked,
                    done && { borderColor: `${selected.color}40`, backgroundColor: `${selected.color}06` },
                  ]}>
                    <Text style={s.stepIcon}>{step.icon}</Text>
                    <View style={s.stepContent}>
                      <Text style={[
                        s.stepTitle,
                        !unlocked && { color: C.textMuted },
                        done && { color: selected.color },
                      ]}>
                        {step.title}
                      </Text>
                      {unlocked
                        ? <Text style={s.stepDesc}>{step.desc}</Text>
                        : <Text style={s.stepLockHint}>Premium freischalten →</Text>
                      }
                    </View>
                    {done && (
                      <View style={[s.donePill, { backgroundColor: `${selected.color}18` }]}>
                        <Text style={[s.donePillTxt, { color: selected.color }]}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {/* Upsell */}
        {!isPremium && (
          <TouchableOpacity onPress={() => setShowPremium(true)} activeOpacity={0.9} style={s.upsellWrap}>
            <LinearGradient colors={['#0E1C60', '#1A348A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.upsell}>
              <Text style={s.upsellTitle}>🔓  Alles freischalten</Text>
              <Text style={s.upsellSub}>Vollständige Roadmap, Videotutorials & direkte Antragslinks</Text>
              <View style={s.upsellPriceRow}>
                <Text style={s.upsellPrice}>49 €</Text>
                <Text style={s.upsellPriceSub}>einmalig · lebenslanger Zugriff</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* Celebration overlay */}
      <Modal visible={!!celebration} transparent animationType="none" statusBarTranslucent>
        <Animated.View style={[s.celebBg, { opacity: celebOpacity }]}>
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
                <View style={s.featureCheck}><Text style={s.featureCheckTxt}>✓</Text></View>
                <Text style={s.modalFeatureTxt}>{f}</Text>
              </View>
            ))}
            <Button label="Jetzt kaufen – 49 €" color={C.success} onPress={() => {}} fullWidth style={s.modalBtn} />
            <TouchableOpacity style={s.modalClose} onPress={() => setShowPremium(false)}>
              <Text style={s.modalCloseTxt}>Schließen</Text>
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
              <TouchableOpacity style={s.dateArrow} onPress={() => adjustPickerMonth(-1)} activeOpacity={0.8}>
                <Text style={s.dateArrowTxt}>‹</Text>
              </TouchableOpacity>
              <View style={s.dateDisplay}>
                <Text style={s.dateMonth}>{MONTHS[pickerDate.month - 1]}</Text>
                <Text style={s.dateYear}>{pickerDate.year}</Text>
              </View>
              <TouchableOpacity style={s.dateArrow} onPress={() => adjustPickerMonth(1)} activeOpacity={0.8}>
                <Text style={s.dateArrowTxt}>›</Text>
              </TouchableOpacity>
            </View>
            <Button label="Ziel speichern" color={selected.color} onPress={saveDate} fullWidth style={s.modalBtn} />
            {emigrationDate && (
              <TouchableOpacity style={s.modalClose} onPress={() => { setEmigrationDate(null); setShowDatePicker(false); }}>
                <Text style={[s.modalCloseTxt, { color: C.error }]}>Zieldatum entfernen</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.modalClose} onPress={() => setShowDatePicker(false)}>
              <Text style={s.modalCloseTxt}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Country tabs
  tabs: {
    flexDirection: 'row', backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.border,
    ...SHADOW_SM,
  },
  tab: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 2.5, borderBottomColor: 'transparent',
  },
  tabFlag: { width: 26, height: 26, borderRadius: 13, marginBottom: 3 },
  tabName: { fontSize: 11, fontFamily: FONT.bold, letterSpacing: 0.1 },

  scroll: { paddingBottom: 48 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    padding: 20, paddingBottom: 18,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerFlag: { width: 54, height: 54, borderRadius: 27 },
  headerTitle: { color: C.text, fontSize: 20, fontFamily: FONT.black, letterSpacing: -0.3, marginBottom: 3 },
  headerSub: { color: C.textSub, fontSize: 12, marginBottom: 9 },
  headerTrack: { height: 6, backgroundColor: C.border, borderRadius: 3, overflow: 'hidden' },
  headerFill: { height: 6, borderRadius: 3 },

  // Goal row
  goalRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  goalBtn: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  goalIcon: { fontSize: 22 },
  goalLabel: { color: C.textMuted, fontSize: 10, fontFamily: FONT.bold, letterSpacing: 1, marginBottom: 3 },
  goalDate: { fontSize: 15, fontFamily: FONT.extrabold, letterSpacing: -0.2 },
  trackBadge: {
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, alignItems: 'center',
  },
  trackLabel: { fontSize: 11, fontFamily: FONT.bold },
  trackSub: { fontSize: 10, marginTop: 2, fontFamily: FONT.semibold },

  // Phase
  phase: { paddingHorizontal: 20, paddingTop: 22 },
  phaseHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  phaseNumBadge: {
    width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  phaseNum: { fontSize: 13, fontFamily: FONT.extrabold },
  phaseTitle: { color: C.text, fontSize: 14, fontFamily: FONT.extrabold, letterSpacing: 0.1, flex: 1 },

  // Step row
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 10 },
  timelineCol: { alignItems: 'center', width: 26, marginTop: 14 },
  stepDot: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: C.border, backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center', zIndex: 1,
  },
  stepLine: {
    width: 2, flex: 1, minHeight: 12, marginTop: 4,
    backgroundColor: C.border, borderRadius: 1,
  },
  checkMark: { color: '#fff', fontSize: 12, fontFamily: FONT.extrabold },
  lockMark: { fontSize: 9 },
  stepCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 14, padding: 14,
    flexDirection: 'row', gap: 12, borderWidth: 1, borderColor: C.border, ...SHADOW_SM,
  },
  stepLocked: { opacity: 0.55 },
  stepIcon: { fontSize: 22, marginTop: 1 },
  stepContent: { flex: 1 },
  stepTitle: { color: C.text, fontSize: 14, fontFamily: FONT.bold, marginBottom: 4, letterSpacing: -0.1 },
  stepDesc: { color: C.textSub, fontSize: 12, lineHeight: 18 },
  stepLockHint: { color: C.accent, fontSize: 12, fontFamily: FONT.semibold },
  donePill: { borderRadius: 8, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  donePillTxt: { fontSize: 13, fontFamily: FONT.extrabold },

  // Upsell
  upsellWrap: { marginHorizontal: 20, marginTop: 24, borderRadius: 20, overflow: 'hidden', ...SHADOW_LG },
  upsell: { padding: 24 },
  upsellTitle: { color: '#FFFFFF', fontSize: 22, fontFamily: FONT.black, letterSpacing: -0.3, marginBottom: 8 },
  upsellSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 20, marginBottom: 18 },
  upsellPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  upsellPrice: { color: '#FFFFFF', fontSize: 32, fontFamily: FONT.black, letterSpacing: -0.8 },
  upsellPriceSub: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },

  // Celebration
  celebBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center' },
  celebCard: {
    backgroundColor: C.surface, borderRadius: 26, padding: 36,
    alignItems: 'center', marginHorizontal: 40, borderWidth: 1, borderColor: C.border, ...SHADOW_LG,
  },
  celebEmoji: { fontSize: 60, marginBottom: 14 },
  celebTitle: { color: C.text, fontSize: 22, fontFamily: FONT.black, textAlign: 'center', marginBottom: 6, letterSpacing: -0.3 },
  celebSub: { color: C.textSub, fontSize: 15, textAlign: 'center' },

  // Overlay / Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: C.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, borderTopWidth: 1, borderColor: C.border,
  },
  modalTitle: { color: C.text, fontSize: 22, fontFamily: FONT.black, marginBottom: 6, letterSpacing: -0.3 },
  modalSub: { color: C.textSub, fontSize: 14, marginBottom: 22, lineHeight: 21 },
  modalFeature: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  featureCheck: {
    width: 24, height: 24, borderRadius: 7, backgroundColor: C.successBg,
    borderWidth: 1, borderColor: `${C.success}44`, alignItems: 'center', justifyContent: 'center',
  },
  featureCheckTxt: { color: C.success, fontSize: 12, fontFamily: FONT.bold },
  modalFeatureTxt: { color: C.text, fontSize: 14, flex: 1 },
  modalBtn: { marginTop: 20, marginBottom: 10 },
  modalClose: { alignItems: 'center', paddingVertical: 10 },
  modalCloseTxt: { color: C.textSub, fontSize: 14, fontFamily: FONT.semibold },

  // Date picker
  datePicker: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 16, paddingVertical: 16,
  },
  dateArrow: {
    width: 46, height: 46, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border,
  },
  dateArrowTxt: { color: C.text, fontSize: 30, fontFamily: FONT.regular, lineHeight: 34 },
  dateDisplay: { alignItems: 'center', minWidth: 130 },
  dateMonth: { color: C.text, fontSize: 24, fontFamily: FONT.extrabold, letterSpacing: -0.3 },
  dateYear: { color: C.textSub, fontSize: 16, marginTop: 3, fontFamily: FONT.semibold },
});
