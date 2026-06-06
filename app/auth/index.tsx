import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
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

function mapError(code: string | undefined, message: string): string {
  switch (code) {
    case 'invalid_credentials':
      return 'E-Mail oder Passwort ist falsch.';
    case 'user_not_found':
      return 'Kein Konto mit dieser E-Mail gefunden. Bitte registrieren.';
    case 'email_not_confirmed':
      return 'E-Mail noch nicht bestätigt. Bitte prüfe deinen Posteingang.';
    case 'weak_password':
      return 'Passwort zu schwach. Bitte mindestens 8 Zeichen mit Zahlen verwenden.';
    case 'email_address_invalid':
      return 'Ungültige E-Mail-Adresse.';
    case 'over_email_send_rate_limit':
      return 'Zu viele E-Mails gesendet. Bitte warte einige Minuten.';
    case 'user_already_exists':
    case 'email_exists':
      return 'Diese E-Mail ist bereits registriert. Bitte anmelden.';
    default:
      if (message.toLowerCase().includes('invalid')) return 'E-Mail oder Passwort ist falsch.';
      return message;
  }
}

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmSent, setConfirmSent] = useState(false);

  function clearError() { setError(''); }

  async function handleEmailAuth() {
    clearError();
    if (!email.trim()) { setError('Bitte E-Mail eingeben.'); return; }
    if (!email.includes('@')) { setError('Ungültige E-Mail-Adresse.'); return; }
    if (!password) { setError('Bitte Passwort eingeben.'); return; }
    if (mode === 'register' && password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) {
          const msg = mapError(err.code ?? (err as any).error_code, err.message);
          setError(msg);
          // Hint to register if the account doesn't exist
          if (err.code === 'invalid_credentials' || err.code === 'user_not_found') {
            setError(msg + '\n\nNoch kein Konto? Tippe unten auf „Registrieren".');
          }
        }
      } else {
        const { data, error: err } = await supabase.auth.signUp({ email: email.trim(), password });
        if (err) {
          setError(mapError(err.code ?? (err as any).error_code, err.message));
        } else if (data.session) {
          // email confirmation disabled – session active immediately, AuthContext handles redirect
        } else {
          setConfirmSent(true);
        }
      }
    } catch (e: any) {
      setError('Verbindungsfehler. Bitte Internetverbindung prüfen.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    clearError();
    const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'auswando' });
    const { data, error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
    if (err) { setError('Google-Login fehlgeschlagen: ' + err.message); return; }
    if (data.url) await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
  }

  async function handleApple() {
    clearError();
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { error: err } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken!,
      });
      if (err) setError('Apple-Login fehlgeschlagen: ' + err.message);
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        setError('Apple-Login fehlgeschlagen: ' + e.message);
      }
    }
  }

  // ── E-Mail-Bestätigung gesendet ──────────────────────────────
  if (confirmSent) {
    return (
      <View style={s.root}>
        <LinearGradient colors={['#EEF1FF', '#F7F4FF', C.bg]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFillObject} />
        <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
          <View style={s.confirmBox}>
            <Text style={s.confirmIcon}>📬</Text>
            <Text style={s.confirmTitle}>Fast geschafft!</Text>
            <Text style={s.confirmSub}>
              Wir haben eine Bestätigungs-Mail an{'\n'}
              <Text style={{ color: C.primary, fontWeight: '700' }}>{email}</Text>
              {'\n\n'}gesendet. Bitte klicke den Link in der E-Mail – danach kannst du dich hier anmelden.
            </Text>
            <View style={s.confirmSteps}>
              {['📧 E-Mail öffnen', '🔗 Bestätigungs-Link klicken', '✅ Hier anmelden'].map((step, i) => (
                <View key={i} style={s.confirmStep}>
                  <Text style={s.confirmStepTxt}>{step}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={s.confirmBtn}
              onPress={() => { setConfirmSent(false); setMode('login'); }}
            >
              <Text style={s.confirmBtnTxt}>Zur Anmeldung</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  // ── Login / Register ─────────────────────────────────────────
  return (
    <View style={s.root}>
      <LinearGradient colors={['#EEF1FF', '#F7F4FF', C.bg]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.inner}>

          <Text style={s.logo}>🌍</Text>
          <Text style={s.title}>Auswando</Text>

          {/* Mode toggle */}
          <View style={s.toggle}>
            <TouchableOpacity
              style={[s.toggleBtn, mode === 'login' && s.toggleActive]}
              onPress={() => { setMode('login'); clearError(); }}
            >
              <Text style={[s.toggleTxt, mode === 'login' && s.toggleActiveTxt]}>Anmelden</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleBtn, mode === 'register' && s.toggleActive]}
              onPress={() => { setMode('register'); clearError(); }}
            >
              <Text style={[s.toggleTxt, mode === 'register' && s.toggleActiveTxt]}>Registrieren</Text>
            </TouchableOpacity>
          </View>

          <View style={s.form}>
            <TextInput
              style={s.input}
              placeholder="E-Mail"
              placeholderTextColor={C.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
              value={email}
              onChangeText={t => { setEmail(t); clearError(); }}
            />
            <TextInput
              style={s.input}
              placeholder={mode === 'register' ? 'Passwort (mind. 6 Zeichen)' : 'Passwort'}
              placeholderTextColor={C.textMuted}
              secureTextEntry
              value={password}
              onChangeText={t => { setPassword(t); clearError(); }}
            />

            {/* Inline error */}
            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorTxt}>⚠️  {error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[s.primaryBtn, loading && { opacity: 0.65 }]}
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
                  : <Text style={s.primaryBtnTxt}>{mode === 'login' ? 'Anmelden' : 'Konto erstellen'}</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <View style={s.divider}>
              <View style={s.dividerLine} />
              <Text style={s.dividerTxt}>oder</Text>
              <View style={s.dividerLine} />
            </View>

            <TouchableOpacity style={s.socialBtn} onPress={handleGoogle} activeOpacity={0.85}>
              <Text style={s.socialBtnTxt}>G  Mit Google anmelden</Text>
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
  title: { fontSize: 32, fontWeight: '800', color: C.text, textAlign: 'center', letterSpacing: -0.5, marginBottom: 28 },

  toggle: {
    flexDirection: 'row',
    backgroundColor: C.cardAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    padding: 4,
    marginBottom: 24,
  },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 9 },
  toggleActive: { backgroundColor: C.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  toggleTxt: { fontSize: 15, fontWeight: '600', color: C.textMuted },
  toggleActiveTxt: { color: C.primary },

  form: { gap: 12 },
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
  errorBox: {
    backgroundColor: `${C.error}12`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${C.error}30`,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  errorTxt: { color: C.error, fontSize: 14, lineHeight: 20 },

  primaryBtn: { borderRadius: 14, overflow: 'hidden', shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  btnGradient: { paddingVertical: 16, alignItems: 'center' },
  primaryBtnTxt: { color: '#fff', fontSize: 17, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: C.border },
  dividerTxt: { color: C.textMuted, fontSize: 13 },

  socialBtn: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingVertical: 14, alignItems: 'center' },
  socialBtnTxt: { fontSize: 16, color: C.text, fontWeight: '600' },
  appleBtn: { width: '100%', height: 52 },

  // confirm screen
  confirmBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  confirmIcon: { fontSize: 64, marginBottom: 20 },
  confirmTitle: { fontSize: 28, fontWeight: '800', color: C.text, marginBottom: 16 },
  confirmSub: { fontSize: 16, color: C.textSub, textAlign: 'center', lineHeight: 26, marginBottom: 28 },
  confirmSteps: { gap: 10, width: '100%', marginBottom: 36 },
  confirmStep: { backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, paddingVertical: 12, paddingHorizontal: 16 },
  confirmStepTxt: { fontSize: 15, color: C.text, fontWeight: '500' },
  confirmBtn: { backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40 },
  confirmBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
