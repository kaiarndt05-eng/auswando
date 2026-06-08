import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { C } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useWando } from '@/context/WandoContext';

const SHADOW_MD = {
  shadowColor: '#1A2A5E',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.09,
  shadowRadius: 10,
  elevation: 4,
} as const;

export default function DevToolsScreen() {
  const { isPremium, setPremium, resetAll } = useApp();
  const { resetSeen } = useWando();
  const [busy, setBusy] = useState<'restart' | 'notif' | null>(null);

  const simulateRestart = async () => {
    setBusy('restart');
    try {
      await resetAll();
      await resetSeen();
      router.replace('/onboarding' as any);
    } finally {
      setBusy(null);
    }
  };

  const sendTestNotification = async () => {
    setBusy('notif');
    try {
      const perms = await Notifications.getPermissionsAsync();
      let granted = perms.status === 'granted';
      if (!granted) {
        const req = await Notifications.requestPermissionsAsync();
        granted = req.status === 'granted';
      }
      if (!granted) {
        Alert.alert('Keine Berechtigung', 'Bitte erlaube Benachrichtigungen für Auswando in den Systemeinstellungen.');
        return;
      }
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Auswando · Tages-Check-in 🌍',
          body: 'Dein nächster Auswanderungs-Schritt wartet auf dich!',
        },
        trigger: null,
      });
    } catch {
      Alert.alert('Nicht verfügbar', 'Lokale Benachrichtigungen werden in Expo Go nur eingeschränkt unterstützt.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.headline}>🛠 Entwicklertools</Text>
        <Text style={s.sub}>Nur im Dev-Build sichtbar — zum gezielten Testen verschiedener App-Zustände.</Text>

        {/* Restart */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Neuinstallation simulieren</Text>
          <Text style={s.cardDesc}>
            Löscht den gesamten lokalen Fortschritt, das Onboarding und alle bereits gezeigten Wando-Hinweise — genau wie beim allerersten App-Start.
          </Text>
          <TouchableOpacity
            style={[s.btn, { backgroundColor: C.error }]}
            onPress={simulateRestart}
            disabled={busy === 'restart'}
            activeOpacity={0.85}
          >
            <Text style={s.btnTxt}>{busy === 'restart' ? 'Wird zurückgesetzt …' : 'App-Neustart simulieren'}</Text>
          </TouchableOpacity>
        </View>

        {/* Notification */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Benachrichtigung simulieren</Text>
          <Text style={s.cardDesc}>
            Löst sofort eine Test-Push-Benachrichtigung aus — so sieht der tägliche 9-Uhr Check-in aus.
          </Text>
          <TouchableOpacity
            style={[s.btn, { backgroundColor: C.primary }]}
            onPress={sendTestNotification}
            disabled={busy === 'notif'}
            activeOpacity={0.85}
          >
            <Text style={s.btnTxt}>{busy === 'notif' ? 'Wird gesendet …' : 'Test-Benachrichtigung senden'}</Text>
          </TouchableOpacity>
        </View>

        {/* Premium toggle */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Premium-Status</Text>
          <Text style={s.cardDesc}>
            Schalte zwischen Free- und Premium-Ansicht um, um gesperrte Inhalte und Upsells zu prüfen.
          </Text>
          <View style={s.toggleRow}>
            <TouchableOpacity
              style={[s.toggleBtn, !isPremium && s.toggleBtnActive]}
              onPress={() => setPremium(false)}
              activeOpacity={0.85}
            >
              <Text style={[s.toggleTxt, !isPremium && s.toggleTxtActive]}>🔓 Free</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleBtn, isPremium && s.toggleBtnActive]}
              onPress={() => setPremium(true)}
              activeOpacity={0.85}
            >
              <Text style={[s.toggleTxt, isPremium && s.toggleTxtActive]}>🌟 Premium</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={s.closeTxt}>Schließen</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 48 },
  headline: { color: C.text, fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  sub: { color: C.textSub, fontSize: 14, marginBottom: 24, lineHeight: 20 },
  card: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 16, ...SHADOW_MD },
  cardTitle: { color: C.text, fontSize: 16, fontWeight: '800', marginBottom: 6 },
  cardDesc: { color: C.textSub, fontSize: 13, lineHeight: 19, marginBottom: 16 },
  btn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center',
    borderWidth: 1.5, borderColor: C.border, backgroundColor: C.cardAlt,
  },
  toggleBtnActive: { borderColor: C.primary, backgroundColor: C.primaryBg },
  toggleTxt: { color: C.textSub, fontSize: 14, fontWeight: '700' },
  toggleTxtActive: { color: C.primary },
  closeBtn: { alignSelf: 'center', paddingVertical: 12, paddingHorizontal: 24 },
  closeTxt: { color: C.textMuted, fontSize: 14, fontWeight: '600' },
});
