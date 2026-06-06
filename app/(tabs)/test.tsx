import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, COUNTRIES } from '@/constants/theme';
import { FLAG_IMAGES } from '@/constants/images';
import { useApp } from '@/context/AppContext';

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

export default function TestScreen() {
  const { setCountry } = useApp();
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState({ pt: 0, es: 0, ch: 0 });
  const [done, setDone] = useState(false);
  const anim = useRef(new Animated.Value(1)).current;

  const handleAnswer = (optionScores: Record<string, number>) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => {
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
        <ScrollView contentContainerStyle={s.resultContent}>
          <LinearGradient colors={[`${winner.color}22`, C.bg]} style={s.resultHero}>
            <Image source={FLAG_IMAGES[winner.id]} style={s.resultEmoji} />
            <Text style={s.resultTitle}>Dein Match</Text>
            <Text style={[s.resultCountry, { color: winner.color }]}>{winner.name}</Text>
            <Text style={s.resultTagline}>{winner.tagline}</Text>
          </LinearGradient>

          <Text style={s.rankTitle}>Alle Ergebnisse</Text>
          {sorted.map((c, i) => {
            const pct = Math.round((scores[c.id] / maxScore) * 100);
            return (
              <View key={c.id} style={s.rankRow}>
                <Text style={s.rankNum}>#{i + 1}</Text>
                <Image source={FLAG_IMAGES[c.id]} style={s.rankFlag} />
                <View style={s.rankInfo}>
                  <Text style={s.rankName}>{c.name}</Text>
                  <View style={s.barBg}>
                    <View style={[s.barFill, { width: `${pct}%` as any, backgroundColor: c.color }]} />
                  </View>
                </View>
                <Text style={[s.rankPct, { color: c.color }]}>{pct}%</Text>
              </View>
            );
          })}

          <Text style={s.prosTitle}>Vorteile {winner.name}</Text>
          {winner.pros.map(p => (
            <View key={p} style={s.proRow}>
              <Text style={[s.proCheck, { color: winner.color }]}>✓</Text>
              <Text style={s.proTxt}>{p}</Text>
            </View>
          ))}

          <TouchableOpacity style={[s.ctaBtn, { backgroundColor: winner.color }]} onPress={() => { setCountry(winner.id); router.push('/(tabs)/roadmap'); }}>
            <Text style={s.ctaTxt}>{winner.name} Roadmap ansehen  →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.resetBtn} onPress={reset}>
            <Text style={s.resetTxt}>Test wiederholen</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const q = QUIZ[step];
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.container}>
        <View style={s.progressRow}>
          {QUIZ.map((_, i) => (
            <View key={i} style={[s.dot, { backgroundColor: i <= step ? C.primary : C.border }]} />
          ))}
        </View>
        <Text style={s.stepLabel}>Frage {step + 1} von {QUIZ.length}</Text>

        <Animated.View style={[s.card, { opacity: anim, transform: [{ scale: anim }] }]}>
          <Text style={s.qIcon}>{q.icon}</Text>
          <Text style={s.qText}>{q.question}</Text>
        </Animated.View>

        <View style={s.options}>
          {q.options.map((opt, i) => (
            <TouchableOpacity key={i} style={s.option} onPress={() => handleAnswer(opt.scores)}>
              <LinearGradient colors={[C.cardAlt, C.card]} style={s.optInner}>
                <View style={s.optIdx}><Text style={s.optIdxTxt}>{String.fromCharCode(65 + i)}</Text></View>
                <Text style={s.optLabel}>{opt.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, padding: 20 },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 8, justifyContent: 'center' },
  dot: { height: 4, flex: 1, borderRadius: 2 },
  stepLabel: { color: C.textSub, fontSize: 12, textAlign: 'center', marginBottom: 24 },
  card: { backgroundColor: C.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: C.border, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  qIcon: { fontSize: 40, marginBottom: 12 },
  qText: { color: C.text, fontSize: 20, fontWeight: '700', lineHeight: 28 },
  options: { gap: 10 },
  option: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  optInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  optIdx: { width: 28, height: 28, borderRadius: 8, backgroundColor: C.primaryBg, borderWidth: 1, borderColor: `${C.primary}44`, alignItems: 'center', justifyContent: 'center' },
  optIdxTxt: { color: C.primary, fontSize: 12, fontWeight: '700' },
  optLabel: { color: C.text, fontSize: 15, flex: 1 },
  resultContent: { padding: 20, paddingBottom: 40 },
  resultHero: { borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: C.border },
  resultEmoji: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  resultTitle: { color: C.textSub, fontSize: 14, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  resultCountry: { fontSize: 36, fontWeight: '800', marginBottom: 6 },
  resultTagline: { color: C.textSub, fontSize: 14, textAlign: 'center' },
  rankTitle: { color: C.text, fontSize: 16, fontWeight: '700', marginBottom: 14 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  rankNum: { color: C.textMuted, fontSize: 13, width: 20 },
  rankFlag: { width: 30, height: 30, borderRadius: 15 },
  rankInfo: { flex: 1 },
  rankName: { color: C.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  barBg: { height: 6, backgroundColor: C.border, borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },
  rankPct: { fontSize: 14, fontWeight: '700', width: 40, textAlign: 'right' },
  prosTitle: { color: C.text, fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 12 },
  proRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  proCheck: { fontSize: 14, fontWeight: '700' },
  proTxt: { color: C.textSub, fontSize: 14, flex: 1 },
  ctaBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 12 },
  ctaTxt: { color: '#fff', fontWeight: '700', fontSize: 16 },
  resetBtn: { paddingVertical: 12, alignItems: 'center' },
  resetTxt: { color: C.textSub, fontSize: 14 },
});
