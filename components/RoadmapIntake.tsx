import { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, FONT } from '@/constants/theme';
import Button from '@/components/Button';
import { WANDO_IMAGES } from '@/constants/images';
import { ROADMAP_PROFILE_QUESTIONS } from '@/constants/roadmapProfileQuestions';
import { RoadmapProfile } from '@/context/AppContext';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const TOTAL = ROADMAP_PROFILE_QUESTIONS.length;

const SHADOW_MD = {
  shadowColor: '#1A2A5E',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.09,
  shadowRadius: 10,
  elevation: 4,
} as const;

type Props = { onDone: (answers: RoadmapProfile) => void };

export default function RoadmapIntake({ onDone }: Props) {
  // step: -1 = Wando's intro, 0..TOTAL-1 = questions, TOTAL = closing screen
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<RoadmapProfile>({});
  const anim = useRef(new Animated.Value(1)).current;

  // Fade the incoming screen in only after it has actually mounted — starting the
  // animation from inside the fade-out callback races the remount and leaves the
  // new Animated.View stuck at opacity/scale 0 (never visible).
  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [step]);

  const goTo = (next: number) => {
    Animated.timing(anim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep(next);
    });
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    const next = { ...answers, [questionId]: optionId };
    setAnswers(next);
    goTo(step + 1 >= TOTAL ? TOTAL : step + 1);
  };

  // ── Intro ──────────────────────────────────────────────
  if (step === -1) {
    return (
      <Frame>
        <Animated.View style={[s.introWrap, { opacity: anim, transform: [{ scale: anim }] }]}>
          <Image source={WANDO_IMAGES.begeistert} style={s.wandoBig} resizeMode="contain" />
          <SpeechBubble>
            Bevor es losgeht, würde ich dich gerne ein bisschen kennenlernen — so kann ich deine Roadmap perfekt auf deine Situation zuschneiden. Das dauert nur eine Minute! 😊
          </SpeechBubble>
          <Button label="Los geht's →" onPress={() => goTo(0)} fullWidth style={s.cta} />
        </Animated.View>
      </Frame>
    );
  }

  // ── Closing ────────────────────────────────────────────
  if (step === TOTAL) {
    return (
      <Frame>
        <Animated.View style={[s.introWrap, { opacity: anim, transform: [{ scale: anim }] }]}>
          <Image source={WANDO_IMAGES.freude} style={s.wandoBig} resizeMode="contain" />
          <SpeechBubble>
            Super, das war&apos;s schon! 🎉 Ich habe alles notiert und deine Roadmap direkt darauf abgestimmt. Auf geht&apos;s — let&apos;s go!
          </SpeechBubble>
          <Button label="Zur Roadmap →" onPress={() => onDone(answers)} fullWidth style={s.cta} />
        </Animated.View>
      </Frame>
    );
  }

  // ── Question ───────────────────────────────────────────
  const q = ROADMAP_PROFILE_QUESTIONS[step];

  return (
    <Frame>
      <View style={s.progressRow}>
        {ROADMAP_PROFILE_QUESTIONS.map((_, i) => (
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
      <Text style={s.stepLabel}>Frage {step + 1} von {TOTAL}</Text>

      <Animated.View style={[s.qWrap, { opacity: anim, transform: [{ scale: anim }] }]}>
        <View style={s.wandoRow}>
          <Image source={WANDO_IMAGES.neutral} style={s.wandoSmall} resizeMode="contain" />
          <View style={s.qBubble}>
            <Text style={s.qIcon}>{q.icon}</Text>
            <Text style={s.qText}>{q.question}</Text>
          </View>
        </View>

        <View style={s.options}>
          {q.options.map((opt, i) => (
            <TouchableOpacity key={opt.id} style={s.option} onPress={() => handleAnswer(q.id, opt.id)} activeOpacity={0.85}>
              <View style={s.optionLetter}>
                <Text style={s.optionLetterTxt}>{OPTION_LETTERS[i]}</Text>
              </View>
              <Text style={s.optionLabel}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.container}>{children}</View>
    </SafeAreaView>
  );
}

function SpeechBubble({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.bubble}>
      <Text style={s.bubbleName}>Wando</Text>
      <Text style={s.bubbleText}>{children}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },

  // Intro / closing
  introWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 },
  wandoBig: { width: 160, height: 160 },
  cta: { marginTop: 8 },

  // Speech bubble
  bubble: {
    backgroundColor: C.card, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: C.border, ...SHADOW_MD,
  },
  bubbleName: { color: C.primary, fontFamily: FONT.extrabold, fontSize: 13, marginBottom: 6, letterSpacing: 0.3 },
  bubbleText: { color: C.text, fontSize: 16, lineHeight: 23, fontFamily: FONT.semibold, textAlign: 'center' },

  // Progress
  progressRow: { flexDirection: 'row', gap: 6, marginTop: 12, marginBottom: 10 },
  progressSeg: { flex: 1, height: 5, borderRadius: 3 },
  stepLabel: { color: C.textMuted, fontSize: 12, fontFamily: FONT.semibold, marginBottom: 18, letterSpacing: 0.3 },

  // Question
  qWrap: { flex: 1 },
  wandoRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginBottom: 22 },
  wandoSmall: { width: 76, height: 76, marginBottom: -6 },
  qBubble: {
    flex: 1, backgroundColor: C.card, borderRadius: 20, borderTopLeftRadius: 6,
    padding: 18, borderWidth: 1, borderColor: C.border, ...SHADOW_MD,
  },
  qIcon: { fontSize: 26, marginBottom: 8 },
  qText: { color: C.text, fontSize: 18, fontFamily: FONT.bold, lineHeight: 25, letterSpacing: -0.2 },

  // Options
  options: { gap: 12 },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.card, borderRadius: 16, padding: 16,
    borderWidth: 1.5, borderColor: C.border, ...SHADOW_MD,
  },
  optionLetter: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: C.primaryBg,
    alignItems: 'center', justifyContent: 'center',
  },
  optionLetterTxt: { color: C.primary, fontFamily: FONT.extrabold, fontSize: 14 },
  optionLabel: { flex: 1, color: C.text, fontSize: 15, fontFamily: FONT.semibold, lineHeight: 21 },
});
