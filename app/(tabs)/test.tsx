import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, FONT, COUNTRIES } from '@/constants/theme';
import Button from '@/components/Button';
import { FLAG_IMAGES } from '@/constants/images';
import { useApp } from '@/context/AppContext';
import { useWando } from '@/context/WandoContext';
import { WANDO_MESSAGES } from '@/constants/wandoMessages';

const { width } = Dimensions.get('window');

const QUIZ = [
  {
    icon: '🎯', question: 'Was ist dein Hauptmotiv für die Auswanderung?',
    options: [
      { label: 'Kosten senken & Geld sparen', scores: { pt: 3, es: 1, ch: 0 } },
      { label: 'Lebensqualität & besseres Klima', scores: { pt: 2, es: 3, ch: 1 } },
      { label: 'Höheres Gehalt & Karriere', scores: { pt: 0, es: 1, ch: 3 } },
      { label: 'Abenteuer & Neuanfang', scores: { pt: 2, es: 2, ch: 1 } },
    ],
  },
  {
    icon: '💼', question: 'Wie sieht deine Arbeitssituation aus?',
    options: [
      { label: 'Remote-Job / Digital Nomad', scores: { pt: 3, es: 2, ch: 1 } },
      { label: 'Selbstständig / Freelancer', scores: { pt: 2, es: 3, ch: 2 } },
      { label: 'Vor-Ort-Job notwendig', scores: { pt: 1, es: 2, ch: 3 } },
      { label: 'Rente / finanzielle Unabhängigkeit', scores: { pt: 3, es: 3, ch: 1 } },
    ],
  },
  {
    icon: '✈️', question: 'Wie wichtig ist die Nähe zu Deutschland?',
    options: [
      { label: 'Sehr wichtig – möchte oft pendeln', scores: { pt: 0, es: 1, ch: 3 } },
      { label: 'Ab und zu zurück, aber ok', scores: { pt: 1, es: 2, ch: 2 } },
      { label: 'Egal – kompletter Neustart', scores: { pt: 3, es: 2, ch: 0 } },
      { label: 'Hauptsache Europa', scores: { pt: 2, es: 2, ch: 2 } },
    ],
  },
  {
    icon: '👨‍👩‍👦', question: 'Hast du Kinder oder planst du welche?',
    options: [
      { label: 'Nein', scores: { pt: 2, es: 2, ch: 2 } },
      { label: 'Kleinkinder (unter 6)', scores: { pt: 3, es: 2, ch: 1 } },
      { label: 'Schulkinder', scores: { pt: 1, es: 2, ch: 3 } },
      { label: 'Plane welche in Zukunft', scores: { pt: 2, es: 2, ch: 2 } },
    ],
  },
  {
    icon: '🗣️', question: 'Wie sind deine Sprachkenntnisse?',
    options: [
      { label: 'Nur Deutsch (+ Basics Englisch)', scores: { pt: 1, es: 1, ch: 3 } },
      { label: 'Englisch sehr gut', scores: { pt: 3, es: 1, ch: 2 } },
      { label: 'Spanisch / etwas Portugiesisch', scores: { pt: 2, es: 3, ch: 1 } },
      { label: 'Mehrere Sprachen', scores: { pt: 2, es: 2, ch: 2 } },
    ],
  },
  {
    icon: '💰', question: 'Wie hoch ist dein monatliches Lebenshaltungsbudget?',
    options: [
      { label: 'Unter 2.000 € / Monat', scores: { pt: 3, es: 1, ch: 0 } },
      { label: '2.000 – 4.000 € / Monat', scores: { pt: 2, es: 3, ch: 1 } },
      { label: '4.000 – 7.000 € / Monat', scores: { pt: 1, es: 2, ch: 3 } },
      { label: 'Über 7.000 € / Monat', scores: { pt: 1, es: 1, ch: 3 } },
    ],
  },
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const SHADOW_MD = {
  shadowColor: '#1A2A5E',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.09,
  shadowRadius: 10,
  elevation: 4,
} as const;

export default function TestScreen() {
  const { setCountry } = useApp();
  const wando = useWando();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ pt: 0, es: 0, ch: 0 });
  const [done, setDone] = useState(false);
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    wando.sayOnce(WANDO_MESSAGES.test);
  }, []);

  useEffect(() => {
    if (!done) return;
    const winner = COUNTRIES.slice().sort((a, b) => scores[b.id] - scores[a.id])[0];
    wando.sayOnce(WANDO_MESSAGES.testResult(winner.id, winner.name));
  }, [done]);

  const handleAnswer = (optionScores: Record<string, number>) => {
    Animated.timing(anim, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      const newScores = {
        pt: scores.pt + (optionScores.pt ?? 0),
        es: scores.es + (optionScores.es ?? 0),
        ch: scores.ch + (optionScores.ch ?? 0),
      };
      setScores(newScores);
      const nextStep = step + 1;
      if (nextStep >= QUIZ.length) {
        setDone(true);
      } else {
        setStep(nextStep);
      }
      Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    });
  };

  const reset = () => {
    setStep(0);
    setScores({ pt: 0, es: 0, ch: 0 });
    setDone(false);
    anim.setValue(1);
  };

  if (done) {
    const sorted = COUNTRIES.slice().sort((a, b) => scores[b.id] - scores[a.id]);
    const winner = sorted[0];
    const maxScore = QUIZ.length * 3;

    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView contentContainerStyle={s.resultScroll} showsVerticalScrollIndicator={false}>

          {/* Winner hero */}
          <LinearGradient
            colors={[`${winner.color}30`, `${winner.color}10`, C.bg]}
            style={s.resultHero}
          >
            <View style={[s.resultFlagWrap, { borderColor: `${winner.color}44` }]}>
              <Image source={FLAG_IMAGES[winner.id]} style={s.resultFlag} />
            </View>
            <Text style={s.resultMatchLabel}>DEIN MATCH</Text>
            <Text style={[s.resultCountry, { color: winner.color }]}>{winner.name}</Text>
            <Text style={s.resultTagline}>{winner.tagline}</Text>
          </LinearGradient>

          {/* Score bars */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Alle Ergebnisse</Text>
            {sorted.map((c, i) => {
              const pct = Math.round((scores[c.id] / maxScore) * 100);
              return (
                <View key={c.id} style={[s.rankRow, { marginBottom: i < sorted.length - 1 ? 14 : 0 }]}>
                  <Text style={s.rankNum}>#{i + 1}</Text>
                  <Image source={FLAG_IMAGES[c.id]} style={s.rankFlag} />
                  <View style={s.rankInfo}>
                    <View style={s.rankNameRow}>
                      <Text style={s.rankName}>{c.name}</Text>
                      <Text style={[s.rankPct, { color: c.color }]}>{pct}%</Text>
                    </View>
                    <View style={s.rankTrack}>
                      <LinearGradient
                        colors={[c.color, `${c.color}88`]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[s.rankFill, { width: `${pct}%` as any }]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Pros */}
          <View style={s.section}>
            <Text style={s.sectionTitle}>Vorteile {winner.name}</Text>
            {winner.pros.map(p => (
              <View key={p} style={s.proRow}>
                <View style={[s.proCheck, { backgroundColor: `${winner.color}18`, borderColor: `${winner.color}40` }]}>
                  <Text style={[s.proCheckTxt, { color: winner.color }]}>✓</Text>
                </View>
                <Text style={s.proTxt}>{p}</Text>
              </View>
            ))}
          </View>

          {/* CTAs */}
          <View style={s.section}>
            <Button
              label={`${winner.name} Roadmap ansehen →`}
              color={winner.color}
              onPress={() => { setCountry(winner.id); router.push('/(tabs)/roadmap'); }}
              fullWidth
              style={s.ctaBtn}
            />
            <TouchableOpacity style={s.resetBtn} onPress={reset} activeOpacity={0.7}>
              <Text style={s.resetTxt}>Test wiederholen</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    );
  }

  const q = QUIZ[step];
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.container}>

        {/* Progress segments */}
        <View style={s.progressRow}>
          {QUIZ.map((_, i) => (
            <View
              key={i}
              style={[
                s.progressSeg,
                i < step && { backgroundColor: C.primary },
                i === step && { backgroundColor: C.primary, opacity: 0.55 },
                i > step && { backgroundColor: C.border },
              ]}
            />
          ))}
        </View>
        <Text style={s.stepLabel}>Frage {step + 1} von {QUIZ.length}</Text>

        {/* Question card */}
        <Animated.View style={[s.questionCard, { opacity: anim, transform: [{ scale: anim }] }]}>
          <Text style={s.questionIcon}>{q.icon}</Text>
          <Text style={s.questionText}>{q.question}</Text>
        </Animated.View>

        {/* Options */}
        <View style={s.options}>
          {q.options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={s.option}
              onPress={() => handleAnswer(opt.scores)}
              activeOpacity={0.82}
            >
              <View style={s.optLetterBadge}>
                <Text style={s.optLetter}>{OPTION_LETTERS[i]}</Text>
              </View>
              <Text style={s.optLabel}>{opt.label}</Text>
              <Text style={s.optArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Quiz layout
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  progressSeg: { flex: 1, height: 5, borderRadius: 3 },
  stepLabel: { color: C.textSub, fontSize: 12, fontFamily: FONT.bold, letterSpacing: 0.4, textAlign: 'center', marginBottom: 20 },

  // Question card
  questionCard: {
    backgroundColor: C.card, borderRadius: 22, padding: 28,
    borderWidth: 1, borderColor: C.border, marginBottom: 16,
    alignItems: 'flex-start', ...SHADOW_MD,
  },
  questionIcon: { fontSize: 44, marginBottom: 14 },
  questionText: { color: C.text, fontSize: 21, fontFamily: FONT.extrabold, lineHeight: 30, letterSpacing: -0.3 },

  // Options
  options: { gap: 10 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.card, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.border, ...SHADOW_MD,
  },
  optLetterBadge: {
    width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.primaryLight, borderWidth: 1, borderColor: `${C.primary}44`, flexShrink: 0,
  },
  optLetter: { color: C.primary, fontSize: 13, fontFamily: FONT.extrabold },
  optLabel: { flex: 1, color: C.text, fontSize: 15, fontFamily: FONT.semibold, lineHeight: 21 },
  optArrow: { color: C.textMuted, fontSize: 22, fontFamily: FONT.regular },

  // Result
  resultScroll: { paddingBottom: 48 },
  resultHero: { paddingTop: 40, paddingBottom: 36, paddingHorizontal: 24, alignItems: 'center' },
  resultFlagWrap: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, marginBottom: 18, overflow: 'hidden' },
  resultFlag: { width: '100%', height: '100%' },
  resultMatchLabel: { color: C.textSub, fontSize: 11, fontFamily: FONT.bold, letterSpacing: 2, marginBottom: 6 },
  resultCountry: { fontSize: 40, fontFamily: FONT.black, letterSpacing: -0.8, marginBottom: 8 },
  resultTagline: { color: C.textSub, fontSize: 14, textAlign: 'center', lineHeight: 21 },

  // Sections
  section: { paddingHorizontal: 20, marginBottom: 28 },
  sectionTitle: { color: C.text, fontSize: 18, fontFamily: FONT.extrabold, letterSpacing: -0.2, marginBottom: 16 },

  // Rank rows
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankNum: { color: C.textMuted, fontSize: 13, fontFamily: FONT.bold, width: 22 },
  rankFlag: { width: 32, height: 32, borderRadius: 16, flexShrink: 0 },
  rankInfo: { flex: 1 },
  rankNameRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  rankName: { color: C.text, fontSize: 15, fontFamily: FONT.bold },
  rankPct: { fontSize: 15, fontFamily: FONT.extrabold },
  rankTrack: { height: 7, backgroundColor: C.border, borderRadius: 4, overflow: 'hidden' },
  rankFill: { height: 7, borderRadius: 4 },

  // Pros
  proRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  proCheck: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  proCheckTxt: { fontSize: 13, fontFamily: FONT.bold },
  proTxt: { color: C.textSub, fontSize: 14, flex: 1, lineHeight: 21 },

  // CTAs
  ctaBtn: { marginBottom: 12 },
  resetBtn: { paddingVertical: 12, alignItems: 'center' },
  resetTxt: { color: C.textSub, fontSize: 14, fontFamily: FONT.semibold },
});
