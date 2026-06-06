import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '@/lib/supabase';
import { C } from '@/constants/theme';

WebBrowser.maybeCompleteAuthSession();

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function handleEmailAuth() {
    if (!email || !password) {
      Alert.alert('Pflichtfelder', 'Bitte E-Mail und Passwort eingeben.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Passwort zu kurz', 'Mindestens 6 Zeichen.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) Alert.alert('Anmeldung fehlgeschlagen', error.message);
        // on success AuthContext picks up the session automatically
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          Alert.alert('Registrierung fehlgeschlagen', error.message);
        } else if (data.session) {
          // email confirmation disabled → session is immediately active
        } else {
          // email confirmation required
          setConfirmSent(true);
        }
      }
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'auswando' });
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
    if (error) { Alert.alert('Google Login fehlgeschlagen', error.message); return; }
    if (data.url) await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
  }

  async function handleApple() {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });
      if (error) Alert.alert('Apple Login fehlgeschlagen', error.message);
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Fehler', e.message);
      }
    }
  }

  if (confirmSent) {
    return (
      <View style={s.root}>
        <LinearGradient colors={['#EEF1FF', '#F7F4FF', C.bg]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
          <View style={s.confirmBox}>
            <Text style={s.confirmIcon}>📬</Text>
            <Text style={s.confirmTitle}>E-Mail bestätigen</Text>
            <Text style={s.confirmSub}>
              Wir haben eine Bestätigungs-Mail an{'\n'}
              <Text style={{ color: C.primary, fontWeight: '700' }}>{email}</Text>
              {'\n'}gesendet. Bitte klicke den Link darin.
            </Text>
            <TouchableOpacity style={s.backBtn} onPress={() => { setConfirmSent(false); setMode('login'); }}>
              <Text style={s.backBtnTxt}>Zurück zur Anmeldung</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <LinearGradient
        colors={['#EEF1FF', '#F7F4FF', C.bg]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={s.inner}
        >
          <Text style={s.logo}>🌍</Text>
          <Text style={s.title}>Auswando</Text>
          <Text style={s.sub}>
            {mode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}
          </Text>

          <View style={s.form}>
            <TextInput
              style={s.input}
              placeholder="E-Mail"
              placeholderTextColor={C.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={s.input}
              placeholder="Passwort (mind. 6 Zeichen)"
              placeholderTextColor={C.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={[s.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={handleEmailAuth}
              activeOpacity={0.85}
              disabled={loading}
            >
              <LinearGradient
                colors={[C.primary, '#7B5CF0']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.btnGradient}
              >
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={s.primaryBtnTxt}>{mode === 'login' ? 'Anmelden' : 'Registrieren'}</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerTxt}>oder</Text>
              <View style={s.dividerLine} />
            </View>

            <TouchableOpacity style={s.socialBtn} onPress={handleGoogle} activeOpacity={0.85}>
              <Text style={s.socialBtnTxt}>🇬 Mit Google anmelden</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={14}
                style={s.appleBtn}
                onPress={handleApple}
              />
            )}
          </View>

          <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
            <Text style={s.switchTxt}>
              {mode === 'login'
                ? 'Noch kein Konto? Registrieren'
                : 'Bereits registriert? Anmelden'}
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  safe: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logo: { fontSize: 48, textAlign: 'center', marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: C.text, textAlign: 'center', letterSpacing: -0.5 },
  sub: { fontSize: 16, color: C.textSub, textAlign: 'center', marginTop: 6, marginBottom: 36 },
  form: { gap: 14 },
  input: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: C.text,
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  btnGradient: { paddingVertical: 16, alignItems: 'center' },
  primaryBtnTxt: { color: '#fff', fontSize: 17, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerTxt: { color: C.textMuted, fontSize: 13 },
  socialBtn: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  socialBtnTxt: { fontSize: 16, color: C.text, fontWeight: '600' },
  appleBtn: { width: '100%', height: 52 },
  switchTxt: { textAlign: 'center', color: C.primary, fontSize: 15, fontWeight: '600', marginTop: 28 },
  // confirm screen
  confirmBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  confirmIcon: { fontSize: 64, marginBottom: 24 },
  confirmTitle: { fontSize: 26, fontWeight: '800', color: C.text, marginBottom: 16 },
  confirmSub: { fontSize: 16, color: C.textSub, textAlign: 'center', lineHeight: 26, marginBottom: 40 },
  backBtn: {
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  backBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
