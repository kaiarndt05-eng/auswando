import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, FONT, CountryId } from '@/constants/theme';
import Button from '@/components/Button';
import { FLAG_IMAGES } from '@/constants/images';
import { useApp } from '@/context/AppContext';
import { useWando } from '@/context/WandoContext';
import { WANDO_MESSAGES } from '@/constants/wandoMessages';

type Post = {
  id: string;
  country: CountryId | 'all';
  user: string;
  avatar: string;
  text: string;
  likes: number;
  comments: number;
  time: string;
  pinned?: boolean;
};

const POSTS: Post[] = [
  { id: '1', country: 'es', user: 'Klaus M.', avatar: '👨‍💼', text: 'Mein Beckham Law Antrag wurde nach 4 Monaten bewilligt! 🎉 Hier der genaue Ablauf mit allen Dokumenten die ich gebraucht habe...', likes: 87, comments: 34, time: 'vor 3h', pinned: true },
  { id: '2', country: 'pt', user: 'Sarah K.', avatar: '👩', text: 'NHR-Antrag gestellt! Hat jemand Erfahrung damit, ob man beim ersten Antrag immer einen Steuerberater braucht? Mein NIF ist seit 2 Wochen aktiv.', likes: 24, comments: 18, time: 'vor 5h' },
  { id: '3', country: 'ch', user: 'Markus R.', avatar: '👨', text: 'Kanton Zug vs. Zürich: Habe beide verglichen. Steuern im Kanton Zug sind ca. 40% günstiger als in Zürich bei meinem Einkommen. Lohnt sich der längere Arbeitsweg!', likes: 56, comments: 22, time: 'vor 8h' },
  { id: '4', country: 'pt', user: 'Lena B.', avatar: '👩‍🦱', text: 'Für alle die fragen: Mit EU-Pass dauert der AIMA-Termin in Lissabon aktuell ca. 3-4 Monate. In Porto geht es schneller. Termin asap buchen!', likes: 103, comments: 47, time: 'vor 1d' },
  { id: '5', country: 'es', user: 'Thomas W.', avatar: '🧑', text: 'Barcelona vs. Valencia: Nach 2 Jahren kann ich sagen – Valencia ist für Familien viel entspannter. Günstigere Mieten, weniger Touristen, trotzdem super Infrastruktur.', likes: 71, comments: 29, time: 'vor 2d' },
  { id: '6', country: 'all', user: 'Julia S.', avatar: '👩‍💻', text: 'Tipp für alle: Holt euch eine N26 oder Wise Karte BEVOR ihr auswandert. Macht das Leben in den ersten Wochen so viel einfacher bis das lokale Konto läuft.', likes: 134, comments: 51, time: 'vor 3d' },
  { id: '7', country: 'ch', user: 'David H.', avatar: '🧑‍💼', text: 'Remote-Job aus Deutschland, jetzt Wohnsitz Schweiz. Achtung: Man muss seinen AG über den Wohnsitzwechsel informieren, sonst gibt es steuerliche Probleme!', likes: 45, comments: 16, time: 'vor 4d' },
];

const FILTERS: { id: CountryId | 'all'; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'pt', label: 'Portugal' },
  { id: 'es', label: 'Spanien' },
  { id: 'ch', label: 'Schweiz' },
];

const COUNTRY_COLOR: Record<string, string> = {
  pt: '#1BCAA0',
  es: '#F5A623',
  ch: '#F87171',
  all: C.primary,
};

const ONLINE = 847;

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
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
} as const;

const SHADOW_LG = {
  shadowColor: '#1A2A5E',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.14,
  shadowRadius: 20,
  elevation: 8,
} as const;

export default function CommunityScreen() {
  const { isPremium } = useApp();
  const wando = useWando();
  const [filter, setFilter] = useState<CountryId | 'all'>('all');
  const filtered = POSTS.filter(p => filter === 'all' || p.country === filter || p.country === 'all');

  useEffect(() => {
    wando.sayOnce(WANDO_MESSAGES.community);
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      {/* Header */}
      <LinearGradient colors={[`${C.primary}1A`, C.bg]} style={s.header}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.headerTitle}>Community</Text>
            <View style={s.onlineRow}>
              <View style={s.onlineDot} />
              <Text style={s.onlineTxt}>{ONLINE.toLocaleString('de')} Mitglieder online</Text>
            </View>
          </View>
          <Button label="+ Posten" onPress={() => {}} size="md" style={s.postBtn} />
        </View>
      </LinearGradient>

      {/* Country filters */}
      <View style={s.filters}>
        {FILTERS.map(f => {
          const color = COUNTRY_COLOR[f.id];
          const active = filter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              style={[s.filterBtn, active && { backgroundColor: `${color}18`, borderColor: color }]}
              onPress={() => setFilter(f.id)}
              activeOpacity={0.8}
            >
              {f.id === 'all'
                ? <Text style={[s.filterEmoji, { opacity: active ? 1 : 0.6 }]}>🌍</Text>
                : <Image source={FLAG_IMAGES[f.id as CountryId]} style={[s.filterFlag, !active && { opacity: 0.7 }]} />
              }
              <Text style={[s.filterLabel, { color: active ? color : C.textSub }]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={s.feed} showsVerticalScrollIndicator={false}>
        {filtered.map(post => {
          const color = COUNTRY_COLOR[post.country];
          const filterInfo = FILTERS.find(f => f.id === post.country);
          return (
            <View key={post.id} style={[s.postCard, post.pinned && { borderColor: `${color}50` }]}>

              {/* Pinned badge */}
              {post.pinned && (
                <View style={[s.pinnedBadge, { backgroundColor: `${color}15` }]}>
                  <Text style={[s.pinnedTxt, { color }]}>📌  Angepinnt</Text>
                </View>
              )}

              {/* Post header */}
              <View style={s.postHeader}>
                <View style={[s.avatarWrap, { backgroundColor: `${color}18`, borderColor: `${color}30` }]}>
                  <Text style={s.avatar}>{post.avatar}</Text>
                </View>
                <View style={s.postMeta}>
                  <Text style={s.postUser}>{post.user}</Text>
                  <View style={s.postSubRow}>
                    <View style={[s.countryChip, { backgroundColor: `${color}14`, borderColor: `${color}38` }]}>
                      <Text style={[s.countryChipTxt, { color }]}>
                        {post.country === 'all' ? '🌍 Allgemein' : filterInfo?.label ?? ''}
                      </Text>
                    </View>
                    <Text style={s.postTime}>{post.time}</Text>
                  </View>
                </View>
              </View>

              {/* Post text */}
              <Text style={s.postText}>{post.text}</Text>

              {/* Actions */}
              <View style={s.postActions}>
                <TouchableOpacity style={s.actionBtn} activeOpacity={0.75}>
                  <Text style={s.actionTxt}>❤️  {post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtn} activeOpacity={0.75}>
                  <Text style={s.actionTxt}>💬  {post.comments}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.actionBtn} activeOpacity={0.75}>
                  <Text style={s.actionTxt}>↗  Teilen</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Premium locked section */}
        {!isPremium && (
          <View style={s.lockedWrap}>
            <LinearGradient colors={['#0E1C60', '#1A348A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.locked}>
              <Text style={s.lockedIcon}>🔒</Text>
              <Text style={s.lockedTitle}>Mehr Community-Features</Text>
              <Text style={s.lockedSub}>Direktnachrichten · Gruppen · Experten-Chats · Influencer Events</Text>
              <Button label="Premium für 49 € freischalten →" color="#FFFFFF" textColor={C.primary} onPress={() => {}} />
            </LinearGradient>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },

  // Header
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: C.text, fontSize: 26, fontFamily: FONT.black, letterSpacing: -0.5, marginBottom: 4 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.success },
  onlineTxt: { color: C.textSub, fontSize: 13 },
  postBtn: {},

  // Filters
  filters: {
    flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: C.border, backgroundColor: C.surface,
  },
  filterBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    borderRadius: 12, paddingVertical: 8, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.card,
  },
  filterFlag: { width: 18, height: 18, borderRadius: 9 },
  filterEmoji: { fontSize: 14 },
  filterLabel: { fontSize: 11, fontFamily: FONT.bold, letterSpacing: 0.1 },

  // Feed
  feed: { padding: 14, gap: 12, paddingBottom: 48 },

  // Post card
  postCard: {
    backgroundColor: C.card, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: C.border, ...SHADOW_MD,
  },
  pinnedBadge: { borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10, alignSelf: 'flex-start', marginBottom: 12 },
  pinnedTxt: { fontSize: 11, fontFamily: FONT.bold, letterSpacing: 0.3 },

  // Post header
  postHeader: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'center' },
  avatarWrap: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  avatar: { fontSize: 24, lineHeight: 30 },
  postMeta: { flex: 1, justifyContent: 'center' },
  postUser: { color: C.text, fontSize: 15, fontFamily: FONT.extrabold, marginBottom: 5, letterSpacing: -0.1 },
  postSubRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countryChip: { borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8, borderWidth: 1 },
  countryChipTxt: { fontSize: 11, fontFamily: FONT.semibold },
  postTime: { color: C.textMuted, fontSize: 11, fontFamily: FONT.regular },

  // Post body
  postText: { color: C.textSub, fontSize: 14, lineHeight: 22, marginBottom: 14 },

  // Actions
  postActions: { flexDirection: 'row', gap: 20, paddingTop: 4, borderTopWidth: 1, borderTopColor: C.borderFaint },
  actionBtn: { paddingVertical: 6 },
  actionTxt: { color: C.textMuted, fontSize: 13, fontFamily: FONT.semibold },

  // Premium locked
  lockedWrap: { borderRadius: 20, overflow: 'hidden', ...SHADOW_LG },
  locked: { padding: 28, alignItems: 'center' },
  lockedIcon: { fontSize: 40, marginBottom: 14 },
  lockedTitle: { color: '#FFFFFF', fontSize: 20, fontFamily: FONT.black, letterSpacing: -0.3, marginBottom: 8, textAlign: 'center' },
  lockedSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
});
