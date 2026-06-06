import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '@/constants/theme';

export default function KarteWebFallback() {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.center}>
        <Text style={s.icon}>🗺️</Text>
        <Text style={s.title}>Karte</Text>
        <Text style={s.sub}>Die interaktive 3D-Karte ist nur in der mobilen App verfügbar.</Text>
        <Text style={s.sub}>Öffne die App auf deinem iPhone oder Android-Gerät.</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  icon: { fontSize: 64, marginBottom: 20 },
  title: { color: C.text, fontSize: 24, fontWeight: '800', marginBottom: 12 },
  sub: { color: C.textSub, fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 8 },
});
