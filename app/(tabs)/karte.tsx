import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { C, COUNTRIES } from '@/constants/theme';
import { ROADMAP_DATA } from '@/constants/roadmapData';
import { FLAG_IMAGES } from '@/constants/images';
import { useApp } from '@/context/AppContext';
import AuswandoMap from '@/components/AuswandoMap';

export default function KarteScreen() {
  const { selectedCountry, completedSteps } = useApp();
  const country = selectedCountry;

  const dest = COUNTRIES.find(c => c.id === country)!;
  const allFreeSteps = ROADMAP_DATA[country].flatMap(p => p.steps).filter(s => s.free);
  const doneCount = completedSteps[country].length;
  const pct = Math.min(doneCount / Math.max(allFreeSteps.length, 1), 1);

  return (
    <View style={s.container}>
      {/* Map fills all available space */}
      <View style={s.mapWrap}>
        <AuswandoMap country={country} progress={pct} doneCount={doneCount} totalFree={allFreeSteps.length} />
      </View>

      {/* Bottom card */}
      <View style={s.card}>
        <View style={s.progressRow}>
          <Image source={FLAG_IMAGES[country]} style={s.progressFlag} />
          <View style={{ flex: 1 }}>
            <Text style={s.progressTitle}>{dest.name}</Text>
            <Text style={s.progressSub}>{doneCount} von {allFreeSteps.length} kostenlosen Schritten</Text>
          </View>
          <Text style={[s.progressPct, { color: dest.color }]}>{Math.round(pct * 100)}%</Text>
        </View>

        <View style={s.barBg}>
          <View style={[s.barFill, { width: `${pct * 100}%` as any, backgroundColor: dest.color }]} />
        </View>

        <TouchableOpacity
          style={[s.roadmapBtn, { borderColor: dest.color, backgroundColor: `${dest.color}12` }]}
          onPress={() => router.push('/(tabs)/roadmap')}
        >
          <Text style={[s.roadmapBtnTxt, { color: dest.color }]}>Roadmap öffnen → nächste Schritte</Text>
        </TouchableOpacity>

        <View style={s.selector}>
          {COUNTRIES.map(c => (
            <TouchableOpacity
              key={c.id}
              style={[s.selectorBtn, country === c.id && { borderColor: c.color, backgroundColor: `${c.color}12` }]}
              onPress={() => router.push('/(tabs)/roadmap')}
            >
              <Image source={FLAG_IMAGES[c.id]} style={s.selectorFlag} />
              <Text style={[s.selectorName, { color: country === c.id ? c.color : C.textSub }]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  mapWrap: { flex: 1 },
  card: { backgroundColor: C.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 10, borderTopWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  progressFlag: { width: 44, height: 44, borderRadius: 22 },
  progressTitle: { color: C.text, fontSize: 17, fontWeight: '700' },
  progressSub: { color: C.textSub, fontSize: 12, marginTop: 1 },
  progressPct: { fontSize: 22, fontWeight: '800' },
  barBg: { height: 6, backgroundColor: C.border, borderRadius: 3, marginBottom: 14 },
  barFill: { height: 6, borderRadius: 3 },
  roadmapBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1.5, marginBottom: 14 },
  roadmapBtnTxt: { fontSize: 14, fontWeight: '700' },
  selector: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  selectorBtn: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: C.border, backgroundColor: C.bg },
  selectorFlag: { width: 32, height: 32, borderRadius: 16, marginBottom: 4 },
  selectorName: { fontSize: 11, fontWeight: '600' },
});
